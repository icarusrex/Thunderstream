let port;
let serial = 0;
const pending = new Map();
const errors = {
  'wrong-google-account': 'Sign in with the configured Google account.',
  'sign-in-required': 'Connect your Google account in Thunderstream Meet settings.',
  'meet-api-disabled': 'Google Meet API is disabled in the connection’s Google Cloud project. Enable Google Meet REST API there, then create the invitation again.',
  'meet-access-denied': 'Google denied Meet creation. Check that the Meet API is enabled and permission was granted.',
  'meet-consent-incomplete': 'Grant the requested Google Meet permission when connecting.',
  'meeting-result-uncertain': 'The meeting result is uncertain. No automatic retry was made.',
};
function request(op) {
  return new Promise((resolve, reject) => {
    if (!port) {
      try {
        port = messenger.runtime.connectNative('eu.thunderstream.meet');
        port.onMessage.addListener(result => {
          const entry = pending.get(result.id);
          if (!entry) return;
          pending.delete(result.id); clearTimeout(entry.timer);
          if (result.ok) entry.resolve(result);
          else entry.reject(new Error(errors[result.code] || 'The Meet connection failed. Check Thunderstream Meet settings.'));
        });
        port.onDisconnect.addListener(() => {
          port = null;
          for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(new Error('The Meet helper is unavailable.')); }
          pending.clear();
        });
      } catch { reject(new Error('The Meet helper is unavailable.')); return; }
    }
    const id = String(++serial);
    const timer = setTimeout(() => {
      pending.delete(id); reject(new Error(op === 'create' ? errors['meeting-result-uncertain'] : 'Google connection timed out.'));
    }, op === 'connect' ? 210000 : 35000);
    pending.set(id, {resolve, reject, timer});
    try { port.postMessage({id, op}); }
    catch { pending.delete(id); clearTimeout(timer); reject(new Error('The Meet helper is unavailable.')); }
  });
}
let creating = false;
let connecting = false;
messenger.thunderstreamMeet.onCreate.addListener(async id => {
  if (creating || connecting) { await messenger.thunderstreamMeet.settle(id, '', 'Another Meet request is in progress.'); return; }
  creating = true;
  try {
    const result = await request('create');
    if (!result.email) throw new Error(errors['wrong-google-account']);
    await messenger.thunderstreamMeet.settle(id, result.url, '');
  } catch (error) { await messenger.thunderstreamMeet.settle(id, '', error.message); }
  finally { creating = false; }
});
messenger.runtime.onMessage.addListener(async (message, sender) => {
  if (sender.id !== messenger.runtime.id || sender.url !== messenger.runtime.getURL('ui/settings.html')) throw new Error('Invalid request source');
  if (message.op === 'status') {
    const [account, native, saved] = await Promise.all([request('status'), messenger.thunderstreamMeet.status(), messenger.storage.local.get('enabled')]);
    return {...account, ...native, enabled: native.enabled && saved.enabled === true};
  }
  if (message.op === 'connect') {
    if (connecting || creating) throw new Error('Another Meet request is in progress.');
    connecting = true;
    try { return await request('connect'); } finally { connecting = false; }
  }
  if (message.op === 'disconnect') {
    if (connecting || creating) throw new Error('Wait for the current Meet request to finish.');
    await messenger.thunderstreamMeet.configure(false); await messenger.storage.local.set({enabled:false});
    return request('disconnect');
  }
  if (message.op === 'enable') {
    if (typeof message.enabled !== 'boolean') throw new Error('Invalid setting');
    if (message.enabled) {
      const account = await request('status');
      if (!account.connected || !account.email) throw new Error(errors['sign-in-required']);
    }
    await messenger.thunderstreamMeet.configure(message.enabled);
    await messenger.storage.local.set({enabled:message.enabled});
    return {enabled:message.enabled};
  }
  throw new Error('Unsupported request');
});
(async () => {
  const saved = await messenger.storage.local.get('enabled');
  if (saved.enabled) {
    try {
      const account = await request('status');
      if (account.connected && account.email) await messenger.thunderstreamMeet.configure(true);
    } catch { /* Settings retains the saved preference and reports actual hook state. */ }
  }
})();
