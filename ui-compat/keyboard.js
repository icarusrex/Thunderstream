const KEYS={j:'next',k:'previous',e:'archive',r:'reply',a:'reply-all',f:'forward',l:'tags',s:'star','#':'trash',u:'unread',c:'compose'};
function editable(node){return !!node&&(node.isContentEditable||['input','textarea','select','textbox'].includes(node.localName?.toLowerCase())||node.getAttribute?.('role')==='textbox'||(node.hasAttribute?.('contenteditable')&&node.getAttribute('contenteditable')!=='false'));}
export function resolveKey(event){return KEYS[event.key?.toLowerCase()]||null;}
export function shouldHandleKey(event,context){
 if(!context.keyboardEnabled||!context.isMailWindow||event.defaultPrevented||event.isComposing||event.keyCode===229||event.repeat||event.metaKey||event.ctrlKey||(event.altKey&&event.key!=='#')||(event.shiftKey&&event.key!=='#'))return false;
 const command=resolveKey(event);if(!command||!context.supportedCommands?.includes(command)||(!context.hasSelection&&command!=='compose'))return false;
 if((event.composedPath?.()||[event.target]).some(editable))return false;
 let active=context.activeElement;while(active){if(editable(active))return false;active=active.shadowRoot?.activeElement;}
 return true;
}
