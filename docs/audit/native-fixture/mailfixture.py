"""Localhost-only mail fixture for Thunderstream native tests.

SMTP sink on 127.0.0.1:2525 writes every accepted message to spool/.
POP3 on 127.0.0.1:1110 serves messages from maildrop/.
SMTP behaviour is read from control.json on every transaction:
  {"smtp": "accept" | "reject" | "tempfail" | "hang"}
Nothing is relayed anywhere; this process never opens outbound connections.
"""
import asyncio, json, os, sys, time, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SPOOL, DROP, CONTROL, LOG = ROOT / 'spool', ROOT / 'maildrop', ROOT / 'control.json', ROOT / 'fixture.log'
for d in (SPOOL, DROP):
    d.mkdir(exist_ok=True)


def log(*parts):
    with LOG.open('a') as f:
        f.write(time.strftime('%H:%M:%S ') + ' '.join(map(str, parts)) + '\n')


def mode():
    try:
        return json.loads(CONTROL.read_text()).get('smtp', 'accept')
    except Exception:
        return 'accept'


async def smtp(reader, writer):
    async def send(line):
        writer.write((line + '\r\n').encode()); await writer.drain()
    await send('220 ts-fixture ESMTP')
    mail_from, rcpts = None, []
    while line := await reader.readline():
        cmd = line.decode(errors='replace').rstrip('\r\n')
        verb = cmd.split(' ', 1)[0].upper()
        if verb in ('EHLO', 'HELO'):
            await send('250-ts-fixture'); await send('250 8BITMIME')
        elif verb == 'MAIL':
            mail_from, rcpts = cmd[10:], []; await send('250 OK')
        elif verb == 'RCPT':
            rcpts.append(cmd[8:]); await send('250 OK')
        elif verb == 'DATA':
            await send('354 End data with <CR><LF>.<CR><LF>')
            data = bytearray()
            while (chunk := await reader.readline()) not in (b'.\r\n', b''):
                data += chunk[1:] if chunk.startswith(b'..') else chunk
            m = mode()
            log('SMTP DATA', 'mode=' + m, 'from=' + str(mail_from), 'rcpt=' + ','.join(rcpts), 'bytes=%d' % len(data))
            if m == 'hang':
                await asyncio.sleep(3600)
            if m == 'reject':
                await send('550 5.7.1 Fixture rejection'); continue
            if m == 'tempfail':
                await send('451 4.3.0 Fixture temporary failure'); continue
            name = SPOOL / f'{time.time():.3f}-{uuid.uuid4().hex[:8]}.eml'
            name.write_bytes(bytes(data)); log('SMTP STORED', name.name)
            await send('250 OK queued')
        elif verb == 'RSET':
            mail_from, rcpts = None, []; await send('250 OK')
        elif verb == 'NOOP':
            await send('250 OK')
        elif verb == 'QUIT':
            await send('221 Bye'); break
        else:
            await send('502 Not implemented')
    writer.close()


async def pop3(reader, writer):
    async def send(line):
        writer.write((line + '\r\n').encode()); await writer.drain()
    await send('+OK ts-fixture POP3')
    msgs = sorted(DROP.glob('*.eml'))
    deleted = set()
    while line := await reader.readline():
        cmd = line.decode(errors='replace').rstrip('\r\n')
        verb, _, arg = cmd.partition(' ')
        verb = verb.upper()
        if verb in ('USER', 'PASS'):
            await send('+OK')
        elif verb == 'CAPA':
            await send('+OK'); await send('USER'); await send('UIDL'); await send('TOP'); await send('.')
        elif verb == 'STAT':
            live = [m for i, m in enumerate(msgs) if i not in deleted]
            await send(f'+OK {len(live)} {sum(m.stat().st_size for m in live)}')
        elif verb in ('LIST', 'UIDL'):
            await send('+OK')
            for i, m in enumerate(msgs):
                if i not in deleted:
                    await send(f'{i + 1} {m.stat().st_size if verb == "LIST" else m.stem}')
            await send('.')
        elif verb in ('RETR', 'TOP'):
            i = int(arg.split()[0]) - 1
            await send('+OK')
            for raw in msgs[i].read_bytes().splitlines():
                writer.write((b'.' + raw if raw.startswith(b'.') else raw) + b'\r\n')
            await send('.')
            log('POP RETR', msgs[i].name)
        elif verb == 'DELE':
            deleted.add(int(arg) - 1); await send('+OK')
        elif verb == 'QUIT':
            for i in deleted:
                done = DROP / 'delivered'; done.mkdir(exist_ok=True)
                msgs[i].rename(done / msgs[i].name)
            await send('+OK Bye'); break
        else:
            await send('+OK' if verb == 'NOOP' else '-ERR unsupported')
    writer.close()


async def main():
    a = await asyncio.start_server(smtp, '127.0.0.1', 2525)
    b = await asyncio.start_server(pop3, '127.0.0.1', 1110)
    log('fixture listening on 127.0.0.1:2525 (SMTP) and 127.0.0.1:1110 (POP3)')
    async with a, b:
        await asyncio.gather(a.serve_forever(), b.serve_forever())

if __name__ == '__main__':
    asyncio.run(main())
