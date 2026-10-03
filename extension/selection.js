import {collectMessages} from './mail-adapter.js';
// Mail tabs expose a selection; message tabs and standalone message windows only expose their displayed messages.
async function readMessages(api,tabId,source){
 if(source==='messageDisplay'){const shown=await api.messageDisplay.getDisplayedMessages(tabId);return Array.isArray(shown)?shown:collectMessages(api,shown);}
 return collectMessages(api,await api.mailTabs.getSelectedMessages(tabId));
}
export async function captureSelection(api,tabId){
 let source='mailTab',headers;
 try{headers=await readMessages(api,tabId,source);}
 catch(error){if(typeof api.messageDisplay?.getDisplayedMessages!=='function')throw error;source='messageDisplay';headers=await readMessages(api,tabId,source);}
 return {tabId,source,messageIds:[...new Set(headers.map(m=>m.id))]};
}
export async function validateSelection(api,snapshot){
 if(!snapshot || !Number.isInteger(snapshot.tabId) || !Array.isArray(snapshot.messageIds) || !snapshot.messageIds.length)throw Error('no-selection');
 const current=[...new Set((await readMessages(api,snapshot.tabId,snapshot.source==='messageDisplay'?'messageDisplay':'mailTab')).map(m=>m.id))];
 if(current.length!==snapshot.messageIds.length || snapshot.messageIds.some(id=>!current.includes(id)))throw Error('selection-changed');
 for(const id of snapshot.messageIds)await api.messages.get(id);
 return [...snapshot.messageIds];
}
