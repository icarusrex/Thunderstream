"""Write synthetic test messages into maildrop/ for the POP3 fixture."""
from email.message import EmailMessage
from email.utils import format_datetime
from datetime import datetime, timedelta, timezone
from pathlib import Path

DROP = Path(__file__).resolve().parent / 'maildrop'
DROP.mkdir(exist_ok=True)
base = datetime(2026, 10, 3, 9, 0, tzinfo=timezone.utc)


def msg(n, sender, to, subject, body, mid, refs=None, minutes=0):
    m = EmailMessage()
    m['From'], m['To'], m['Subject'] = sender, to, subject
    m['Date'] = format_datetime(base + timedelta(minutes=minutes))
    m['Message-ID'] = f'<{mid}@fixture.ts.test>'
    if refs:
        m['In-Reply-To'] = f'<{refs[-1]}@fixture.ts.test>'
        m['References'] = ' '.join(f'<{r}@fixture.ts.test>' for r in refs)
    m.set_content(body)
    (DROP / f'{n:02d}-{mid}.eml').write_bytes(bytes(m))


peer = 'Fixture Peer <peer@fixture.ts.test>'
msg(1, peer, 'TS Primary <primary@ts.test>', 'TS triage one', 'Synthetic message one.', 'triage-1', minutes=1)
msg(2, peer, 'TS Primary <primary@ts.test>', 'TS triage two', 'Synthetic message two.', 'triage-2', minutes=2)
msg(3, peer, 'TS Primary <primary@ts.test>', 'TS triage three', 'Synthetic message three.', 'triage-3', minutes=3)
msg(4, peer, 'TS Alias <alias@ts.test>', 'TS sent to alias', 'Synthetic message addressed to the alias identity.', 'alias-1', minutes=4)
msg(5, peer, 'TS Primary <primary@ts.test>', 'TS thread', 'Thread start.', 'thread-1', minutes=5)
msg(6, peer, 'TS Primary <primary@ts.test>', 'Re: TS thread', 'Thread second.', 'thread-2', ['thread-1'], minutes=6)
msg(7, peer, 'TS Primary <primary@ts.test>', 'Re: TS thread', 'Thread third.', 'thread-3', ['thread-1', 'thread-2'], minutes=7)
msg(8, peer, 'TS Primary <primary@ts.test>', 'TS send-and-archive target', 'Reply to this one.', 'sa-1', minutes=8)
msg(9, peer, 'TS Primary <primary@ts.test>', 'TS tag target', 'Tag me.', 'tag-1', minutes=9)
print(sorted(p.name for p in DROP.glob('*.eml')))
