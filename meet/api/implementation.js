var { setTimeout, clearTimeout } = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
var { ExtensionSupport } = ChromeUtils.importESModule('resource:///modules/ExtensionSupport.sys.mjs');
var thunderstreamMeet = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    this.enabled = false;
    this.generation = 0;
    this.windows = new Map();
    this.requests = new Map();
    this.fire = null;
    const supported = Services.appinfo.OS === 'Darwin' && Services.appinfo.version === '157.0.1' && Services.appinfo.appBuildID === '20261001134409';
    const attach = win => {
      if (!this.enabled || !supported || this.windows.has(win) || typeof win.openEventDialog !== 'function') return;
      const original = win.openEventDialog;
      const api = this;
      const pending = new WeakSet();
      function wrapper(item, calendar, mode, ...rest) {
        if (!api.enabled || (mode || 'new') !== 'new' || !item?.isEvent?.() ||
            /https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(String(item.getProperty('DESCRIPTION') || '') + String(item.getProperty('LOCATION') || '') + String(item.getProperty('X-THUNDERSTREAM-MEET-URL') || ''))) {
          return original.call(this, item, calendar, mode, ...rest);
        }
        if (pending.has(item)) return;
        pending.add(item);
        const generation = api.generation;
        const owner = this;
        const notice = win.document.createElement('div');
        notice.textContent = 'Creating Google Meet link…';
        notice.style.cssText = 'position:fixed;bottom:38px;right:22px;padding:12px 18px;background:Canvas;color:CanvasText;border:1px solid GrayText;border-radius:8px;z-index:2147483647';
        win.document.documentElement.appendChild(notice);
        api.create(win).then(url => {
          if (!api.enabled || api.generation !== generation || win.closed) return;
          const draft = item.clone();
          const description = String(draft.getProperty('DESCRIPTION') || '');
          draft.setProperty('DESCRIPTION', description + (description ? '\n\n' : '') + 'Join with Google Meet: ' + url);
          draft.setProperty('X-THUNDERSTREAM-MEET-URL', url);
          original.call(owner, draft, calendar, mode, ...rest);
        }).catch(error => {
          if (!api.enabled || api.generation !== generation || win.closed) return;
          Services.prompt.alert(win, 'Google Meet link unavailable',
            'A Meet link was not added. ' + String(error.message) + '\n\nYour invitation draft will open. Check it before sending.');
          original.call(owner, item, calendar, mode, ...rest);
        }).finally(() => { pending.delete(item); notice.remove(); });
      }
      win.openEventDialog = wrapper;
      this.windows.set(win, {original, wrapper});
    };
    this.create = win => new Promise((resolve, reject) => {
      if (!this.fire || this.requests.size >= 8) { reject(new Error('The Meet connection is unavailable.')); return; }
      const id = Services.uuid.generateUUID().toString();
      const timer = setTimeout(() => { this.requests.delete(id); reject(new Error('The meeting result is uncertain. No automatic retry was made.')); }, 45000);
      this.requests.set(id, {resolve, reject, timer, win});
      this.fire.async(id).catch(() => {
        const request = this.requests.get(id);
        if (request) { clearTimeout(timer); this.requests.delete(id); reject(new Error('The Meet connection is unavailable.')); }
      });
    });
    this.cleanup = () => {
      this.generation++;
      this.enabled = false;
      for (const [win, value] of this.windows) if (!win.closed && win.openEventDialog === value.wrapper) win.openEventDialog = value.original;
      this.windows.clear();
      for (const request of this.requests.values()) { clearTimeout(request.timer); request.reject(new Error('Meet integration was disabled.')); }
      this.requests.clear();
    };
    this.listenerName = 'thunderstream-meet-' + context.extension.id;
    ExtensionSupport.registerWindowListener(this.listenerName, {
      chromeURLs: ['chrome://messenger/content/messenger.xhtml', 'chrome://calendar/content/calendar-event-dialog.xhtml'],
      onLoadWindow: attach,
      onUnloadWindow: win => { this.windows.delete(win); },
    });
    context.callOnClose({close: () => this.cleanup()});
    return {thunderstreamMeet: {
      configure: async enabled => {
        if (!enabled) { this.cleanup(); return; }
        if (!supported) throw new Error('Calendar integration supports Mac Thunderbird 157.0.1 / 20261001134409 only.');
        this.enabled = true;
        const iterator = Services.wm.getEnumerator(null);
        while (iterator.hasMoreElements()) attach(iterator.getNext());
      },
      settle: async (id, url, error) => {
        const request = this.requests.get(id);
        if (!request) return;
        clearTimeout(request.timer); this.requests.delete(id);
        if (!this.enabled || request.win.closed) { request.reject(new Error('Meet integration is no longer active.')); return; }
        if (error || !/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(url)) request.reject(new Error(error || 'Google returned an invalid meeting link.'));
        else request.resolve(url);
      },
      status: async () => ({supported, enabled: this.enabled, attachedWindows: this.windows.size}),
      onCreate: new ExtensionCommon.EventManager({context, name:'thunderstreamMeet.onCreate', register: fire => {
        this.fire = fire;
        return () => { this.fire = null; };
      }}).api(),
    }};
  }
  onShutdown(isAppShutdown) {
    this.cleanup?.();
    if (this.listenerName) ExtensionSupport.unregisterWindowListener(this.listenerName);
    if (!isAppShutdown) Services.obs.notifyObservers(null, 'startupcache-invalidate', null);
  }
};
