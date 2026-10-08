/* Presentation only: native widgets and calendar commands own all event data. */
var ThunderstreamMeetingEditor = {
  attach(win) {
    const styles = new Set();
    const editors = new Map();
    const html = 'http://www.w3.org/1999/xhtml';
    const style = (doc, css, parent = doc.documentElement) => {
      const node = doc.createElementNS(html, 'style');
      node.textContent = css;
      parent.appendChild(node);
      styles.add(node);
      return node;
    };
    if (win.document.documentURI === 'chrome://calendar/content/calendar-event-dialog-attendees.xhtml') {
      const doc = win.document;
      const dialog = doc.querySelector('dialog');
      const header = doc.createElementNS(html, 'header');
      header.id = 'thunderstream-attendee-header';
      const heading = doc.createElementNS(html, 'h1');
      heading.textContent = 'Attendees & availability';
      const hint = doc.createElementNS(html, 'p');
      hint.textContent = 'Type a name or email below. Use the timeline to choose a time.';
      header.append(heading, hint);
      dialog.prepend(header);
      style(doc, `
        :root { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:Canvas; color:CanvasText; }
        body { margin:0; padding:16px 20px; }
        #thunderstream-attendee-header h1 { margin:0 0 6px; font-size:22px; font-weight:600; }
        #thunderstream-attendee-header p { margin:0 0 16px; font-size:12px; color:color-mix(in srgb,CanvasText 65%,Canvas); }
        #outer { margin:12px 0 16px; }
        .attendee-list-container { min-width:280px; }
        #attendee-list, #freebusy-grid { border-color:color-mix(in srgb,CanvasText 18%,Canvas); border-radius:0 0 6px 6px; }
        #day-header-outer { background:color-mix(in srgb,#0f6cbd 6%,Canvas); border-color:color-mix(in srgb,CanvasText 18%,Canvas); border-radius:6px 6px 0 0; }
        event-attendee { flex-basis:32px; block-size:32px; padding:0 6px; }
        event-attendee > input { font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; border:0; border-radius:4px; padding:4px 6px; min-width:0; }
        event-attendee:focus-within { background:color-mix(in srgb,#0f6cbd 9%,Canvas); outline:1px solid #0f6cbd; outline-offset:-1px; }
        #attendee-list { background-image:none; }
        #freebusy-grid-inner.twoMinorColumns { background-size:60px 32px; }
        #freebusy-grid-inner.threeMinorColumns { background-size:90px 32px; }
        .freebusy-row { block-size:32px; }
        dialog::part(button-box) { padding-top:12px; border-top:1px solid color-mix(in srgb,CanvasText 15%,Canvas); }
        button, menulist { border-radius:6px; }
        dialog::part(button-accept) { background:#0f6cbd; color:white; }
      `);
      return () => { header.remove(); for (const node of styles) node.remove(); styles.clear(); };
    }
    if (win.document.documentURI === 'chrome://calendar/content/calendar-event-dialog.xhtml') {
      style(win.document, `
        #calendar-item-panel-iframe { min-height:0 !important; min-width:0 !important; }
        #event-toolbox { background:Canvas; border-bottom:1px solid color-mix(in srgb, CanvasText 15%, Canvas); padding:8px 16px; }
        #event-toolbar { min-height:46px; gap:8px; }
        #event-toolbar toolbarbutton { border-radius:6px; padding:8px 12px; }
        #button-saveandclose { background:#0f6cbd; color:white; fill:white; }
        #status-bar { padding:6px 18px; background:Canvas; border-top:1px solid color-mix(in srgb, CanvasText 12%, Canvas); }
      `);
    }
    const apply = doc => {
      if (doc.documentURI !== 'chrome://calendar/content/calendar-item-iframe.xhtml' || editors.has(doc)) return;
      const inner = doc.defaultView;
      const item = inner.calendarItem || inner.arguments?.[0]?.calendarEvent;
      if (!item?.isEvent?.()) return;
      const grid = doc.getElementById('event-grid');
      const panel = doc.getElementById('event-grid-tabpanel-attendees');
      const notify = doc.getElementById('notify-options');
      if (!grid || !panel || !notify) return;
      const remember = node => ({node, parent:node.parentNode, next:node.nextSibling});
      const attendeeContent = panel.firstElementChild;
      const moved = [remember(attendeeContent), remember(notify)];
      const row = doc.createElementNS(html, 'tr');
      row.id = 'thunderstream-attendees-row';
      const heading = doc.createElementNS(html, 'th');
      heading.textContent = 'Attendees';
      const cell = doc.createElementNS(html, 'td');
      const button = doc.createXULElement('button');
      button.id = 'thunderstream-add-attendees';
      button.setAttribute('label', 'Add or edit attendees');
      button.setAttribute('command', 'cmd_attendees');
      cell.append(button, attendeeContent, notify);
      row.append(heading, cell);
      const title = doc.getElementById('event-grid-title-row');
      // Move the native title row first so keyboard order follows the visual order.
      const titlePosition = remember(title);
      grid.prepend(title);
      title.after(row);
      const meetRow = doc.createElementNS(html, 'tr');
      meetRow.id = 'thunderstream-meet-row';
      const meetHeading = doc.createElementNS(html, 'th');
      meetHeading.textContent = 'Google Meet';
      const meetCell = doc.createElementNS(html, 'td');
      const url = String(item.getProperty('X-THUNDERSTREAM-MEET-URL') || '') ||
        String(item.getProperty('DESCRIPTION') || '').match(/https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/)?.[0];
      if (url && /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(url)) {
        const link = doc.createElementNS(html, 'a');
        link.href = url;
        link.textContent = url;
        link.title = 'Open this meeting in your browser';
        link.addEventListener('click', event => {
          event.preventDefault();
          const {openLinkExternally} = ChromeUtils.importESModule('resource:///modules/LinkHelper.sys.mjs');
          openLinkExternally(url, {addToHistory:false});
        });
        const copy = doc.createElementNS(html, 'button');
        copy.type = 'button';
        copy.textContent = 'Copy link';
        copy.setAttribute('aria-label', 'Copy Google Meet link');
        copy.addEventListener('click', () => {
          try {
            Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(url);
            feedback.textContent = 'Copied';
          } catch { feedback.textContent = 'Could not copy. Select the link to copy it.'; }
        });
        const feedback = doc.createElementNS(html, 'span');
        feedback.setAttribute('role', 'status');
        meetCell.append(link, copy, feedback);
      } else {
        meetCell.textContent = 'No Meet link in this draft';
      }
      meetRow.append(meetHeading, meetCell);
      doc.getElementById('event-grid-location-row').after(meetRow);
      style(doc, `
        :root { --ts-border:color-mix(in srgb, CanvasText 16%, Canvas); --ts-muted:color-mix(in srgb, CanvasText 65%, Canvas); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; color:CanvasText; background:Canvas; }
        html { height:100%; overflow:hidden !important; }
        body { display:block !important; box-sizing:border-box; height:100% !important; min-height:0; margin:0; padding:12px 22px !important; overflow:auto !important; background:Canvas; }
        #event-grid { width:100%; padding:0; border-spacing:0; }
        #event-grid > tr > th { width:108px; min-width:108px; color:var(--ts-muted); font-size:12px; font-weight:600; vertical-align:top; padding:8px 14px 8px 0; }
        #event-grid > tr > td { padding:4px 0; }
        #event-grid-title-row > th { padding-top:8px; }
        #item-title { font-size:24px; font-weight:600; letter-spacing:-.5px; padding:8px 10px; border:0; border-bottom:1px solid var(--ts-border); border-radius:0; background:transparent; min-width:0; }
        #item-title:focus { outline:2px solid #0f6cbd; outline-offset:2px; }
        #item-location { padding:7px 10px; border:1px solid var(--ts-border); border-radius:6px; background:Field; color:FieldText; }
        #event-grid menulist { border:1px solid var(--ts-border); border-radius:6px; min-height:30px; }
        #event-grid-startdate-row > td, #event-grid-enddate-row > td { padding:4px 0; }
        #event-grid-startdate-row > th, #event-grid-enddate-row > th { padding:8px 14px 8px 0; }
        #event-grid-startdate-picker-box, #event-grid-enddate-picker-box { gap:6px; align-items:center; }
        #event-grid-allday-row > td { padding-top:8px; }
        #thunderstream-attendees-row > td { border-bottom:1px solid var(--ts-border); padding-bottom:8px; }
        #thunderstream-add-attendees { appearance:none; background:transparent; color:light-dark(#0f6cbd,#8ac8ff); border:1px solid var(--ts-border); border-radius:6px; padding:8px 12px; margin:2px 0 4px; text-align:start; }
        #thunderstream-add-attendees:hover { background:color-mix(in srgb, #0f6cbd 8%, Canvas); }
        #thunderstream-add-attendees[disabled] { color:GrayText; }
        #thunderstream-attendees-row > td > vbox { padding:0; border:0; }
        #event-grid-tab-attendees { display:none; }
        #item-organizer-row { color:var(--ts-muted); margin:4px 0; }
        .item-attendees-list-container { max-height:100px; overflow:auto; }
        .attendee-label { padding:4px 8px; border-radius:14px; background:color-mix(in srgb, #0f6cbd 8%, Canvas); margin:2px; }
        #notify-options { flex-wrap:wrap; gap:4px; padding:8px 0 0; font-size:11px; color:var(--ts-muted); }
        #thunderstream-meet-row > td { padding:8px 10px; background:color-mix(in srgb, #0f6cbd 7%, Canvas); border:1px solid color-mix(in srgb, #0f6cbd 20%, Canvas); border-radius:6px; user-select:text; font-size:13px; }
        #thunderstream-meet-row > th { padding-top:10px; }
        #thunderstream-meet-row a { color:light-dark(#0f6cbd,#8ac8ff); text-decoration:none; overflow-wrap:anywhere; }
        #thunderstream-meet-row a:hover { text-decoration:underline; }
        #thunderstream-meet-row button { margin-inline-start:12px; padding:5px 10px; border:1px solid var(--ts-border); border-radius:5px; background:Canvas; color:CanvasText; font:inherit; cursor:pointer; }
        #thunderstream-meet-row a:focus-visible, #thunderstream-meet-row button:focus-visible { outline:2px solid #0f6cbd; outline-offset:2px; }
        #thunderstream-meet-row [role=status] { margin-inline-start:8px; font-size:11px; color:var(--ts-muted); }

        #event-grid .separator td { border:0; height:3px; }
        #event-grid-tab-vbox { display:block; padding:12px 0 0; min-height:210px; }
        #event-grid-tab-box-row { display:block; }
        #event-grid-tabbox { display:flex; flex-direction:column; }
        #event-grid-tabpanels { min-height:190px; }
        #event-grid-tabpanel-description.deck-selected { display:flex; flex-direction:column; min-height:190px; }
        #event-grid-tabs { border-bottom:1px solid var(--ts-border); }
        #event-grid-tabs tab { padding:8px 14px; border:0; background:transparent; border-radius:0; }
        #event-grid-tabs tab[selected] { color:light-dark(#0f6cbd,#8ac8ff); border-bottom:2px solid #0f6cbd; }
        #FormatToolbox { background:transparent; padding:6px; border-bottom:1px solid var(--ts-border); }
        #item-description { margin:0; border:1px solid var(--ts-border); border-radius:6px; min-height:150px; }
        #event-dialog-notifications { margin-bottom:8px; }
        @media (max-width:650px) { body { padding:12px !important; } #event-grid > tr > th { width:82px; min-width:82px; padding-right:8px; } #item-title { font-size:22px; } #notify-options { flex-direction:column; align-items:start; } }
      `);
      // Thunderbird saves OutputBodyOnly; display styling in the editor head
      // stays out of the invitation's rich-text content.
      const notesEditor = doc.getElementById('item-description');
      const notesDocs = new WeakSet();
      const notesStyles = new Set();
      const styleNotes = () => {
        const notesDoc = notesEditor.contentDocument;
        if (!notesDoc?.head || notesDocs.has(notesDoc)) return;
        notesDocs.add(notesDoc);
        notesStyles.add(style(notesDoc, `
          :root { color-scheme:light dark; }
          body { color:CanvasText; background:Canvas; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; font-size:13px; }
          a { color:light-dark(#0f6cbd,#8ac8ff) !important; }
        `, notesDoc.head));
      };
      notesEditor.addEventListener('load', styleNotes, true);
      styleNotes();
      const titleInput = doc.getElementById('item-title');
      const oldPlaceholder = titleInput.getAttribute('placeholder');
      titleInput.setAttribute('placeholder', 'Add a title');
      const tabs = doc.getElementById('event-grid-tabs');
      const attendeeTab = doc.getElementById('event-grid-tab-attendees');
      const keepNotesVisible = () => {
        if (tabs.selectedItem === attendeeTab) tabs.selectedItem = doc.getElementById('event-grid-tab-description');
      };
      const tabbox = doc.getElementById('event-grid-tabbox');
      tabbox.addEventListener('select', keepNotesVisible);
      keepNotesVisible();
      const release = () => {
        tabbox.removeEventListener('select', keepNotesVisible);
        notesEditor.removeEventListener('load', styleNotes, true);
        editors.delete(doc);
        for (const node of styles) {
          if (node.ownerDocument === doc || notesStyles.has(node)) { node.remove(); styles.delete(node); }
        }
      };
      inner.addEventListener('unload', release, {once:true});
      if (win.document.documentURI === 'chrome://calendar/content/calendar-event-dialog.xhtml') {
        win.resizeTo(Math.min(860, win.screen.availWidth - 40), Math.min(800, win.screen.availHeight - 60));
      }
      editors.set(doc, {moved, titlePosition, row, meetRow, titleInput, oldPlaceholder, tabs, tabbox, keepNotesVisible, notesEditor, styleNotes, inner, release});
    };
    const scan = () => {
      for (const frame of win.document.querySelectorAll('iframe')) {
        try { if (frame.contentDocument?.readyState === 'complete') apply(frame.contentDocument); } catch { /* Closed or unrelated frame. */ }
      }
    };
    const load = event => {
      const doc = event.target?.nodeType === 9 ? event.target : event.target?.contentDocument;
      if (doc?.readyState === 'complete') apply(doc);
      scan();
    };
    win.document.addEventListener('load', load, true);
    const observer = new win.MutationObserver(scan);
    observer.observe(win.document.documentElement, {childList:true, subtree:true});
    scan();
    return () => {
      observer.disconnect();
      win.document.removeEventListener('load', load, true);
      for (const [doc, state] of editors) {
        if (doc.defaultView?.closed) continue;
        state.inner.removeEventListener('unload', state.release);
        state.tabbox.removeEventListener('select', state.keepNotesVisible);
        state.notesEditor.removeEventListener('load', state.styleNotes, true);
        for (const place of [...state.moved, state.titlePosition]) {
          place.parent.insertBefore(place.node, place.next?.parentNode === place.parent ? place.next : null);
        }
        state.row.remove(); state.meetRow.remove();
        if (state.oldPlaceholder === null) state.titleInput.removeAttribute('placeholder');
        else state.titleInput.setAttribute('placeholder', state.oldPlaceholder);
      }
      for (const node of styles) node.remove();
      editors.clear(); styles.clear();
    };
  },
};

var { setTimeout, clearTimeout } = ChromeUtils.importESModule("resource://gre/modules/Timer.sys.mjs");
var { ExtensionSupport } = ChromeUtils.importESModule('resource:///modules/ExtensionSupport.sys.mjs');
var thunderstreamMeet = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    this.editorWindows = new Map();
    this.enabled = false;
    this.generation = 0;
    this.windows = new Map();
    this.requests = new Map();
    this.fire = null;
    const supported = Services.appinfo.OS === 'Darwin' && Services.appinfo.version === '157.0.1' && Services.appinfo.appBuildID === '20261001134409';
    const attachEditor = win => {
      if (supported && !this.editorWindows.has(win)) this.editorWindows.set(win, ThunderstreamMeetingEditor.attach(win));
    };
    const attach = win => {
      if (!this.enabled || !supported || this.windows.has(win) || typeof win.openEventDialog !== 'function') return;
      const original = win.openEventDialog;
      const api = this;
      let openingDraft = false;
      function wrapper(item, calendar, mode, ...rest) {
        if (!api.enabled || (mode || 'new') !== 'new' || !item?.isEvent?.() ||
            /https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(String(item.getProperty('DESCRIPTION') || '') + String(item.getProperty('LOCATION') || '') + String(item.getProperty('X-THUNDERSTREAM-MEET-URL') || ''))) {
          return original.call(this, item, calendar, mode, ...rest);
        }
        // Thunderbird creates a fresh event object for each activation.
        // Hold one opening operation per window until its draft is ready.
        if (openingDraft) return;
        openingDraft = true;
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
        }).finally(() => { openingDraft = false; notice.remove(); });
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
      chromeURLs: ['chrome://messenger/content/messenger.xhtml', 'chrome://calendar/content/calendar-event-dialog.xhtml', 'chrome://calendar/content/calendar-event-dialog-attendees.xhtml'],
      onLoadWindow: win => { attachEditor(win); attach(win); },
      onUnloadWindow: win => { this.windows.delete(win); this.editorWindows.get(win)?.(); this.editorWindows.delete(win); },
    });
    const existing = Services.wm.getEnumerator(null);
    while (existing.hasMoreElements()) {
      const win = existing.getNext();
      if (["chrome://messenger/content/messenger.xhtml", "chrome://calendar/content/calendar-event-dialog.xhtml", "chrome://calendar/content/calendar-event-dialog-attendees.xhtml"].includes(win.document.documentURI)) attachEditor(win);
    }
    this.cleanupEditors = () => { for (const cleanup of this.editorWindows.values()) cleanup(); this.editorWindows.clear(); };
    context.callOnClose({close: () => { this.cleanup(); this.cleanupEditors(); }});
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
    this.cleanupEditors?.();
    if (this.listenerName) ExtensionSupport.unregisterWindowListener(this.listenerName);
    if (!isAppShutdown) Services.obs.notifyObservers(null, 'startupcache-invalidate', null);
  }
};
