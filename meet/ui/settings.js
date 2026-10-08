const status = document.getElementById('status');
const enabled = document.getElementById('enabled');
const controls = [...document.querySelectorAll('button,input')];
let busy = false;
async function refresh() {
  const result = await messenger.runtime.sendMessage({op:'status'});
  enabled.checked = result.enabled;
  status.textContent = !result.supported ? 'This Thunderbird build is not supported.' : result.connected ? 'Connected: ' + result.email + (result.enabled ? '. Automatic Meet is on.' : '. Automatic Meet is off.') : 'Google Meet is not connected.';
  enabled.disabled = !result.supported || !result.connected;
}
async function run(message) {
  if (busy) return;
  busy = true; controls.forEach(control => control.disabled = true);
  status.textContent = message.op === 'connect' ? 'Choose the configured Google account in the Google sign-in window and grant Meet access.' : 'Updating…';
  try {
    if (message.op === 'connect' && !await messenger.permissions.request({permissions:['nativeMessaging']})) throw new Error('Local Meet helper permission was declined.');
    await messenger.runtime.sendMessage(message); await refresh();
  }
  catch (error) { status.textContent = error.message; enabled.checked = false; }
  finally {
    busy = false; controls.filter(control => control !== enabled).forEach(control => control.disabled = false);
    try { const result = await messenger.runtime.sendMessage({op:'status'}); enabled.disabled = !result.supported || !result.connected; enabled.checked = result.enabled; } catch { enabled.disabled = true; }
  }
}
document.getElementById('connect').onclick = () => run({op:'connect'});
document.getElementById('disconnect').onclick = () => run({op:'disconnect'});
enabled.onchange = () => run({op:'enable',enabled:enabled.checked});
refresh().catch(error => { status.textContent = error.message; enabled.disabled = true; });
