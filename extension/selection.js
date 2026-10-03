import {collectMessages} from './mail-adapter.js';
export async function captureSelection(api,tabId){const headers=await collectMessages(api,await api.mailTabs.getSelectedMessages(tabId));return {tabId,messageIds:[...new Set(headers.map(m=>m.id))]};}
export async function validateSelection(api,snapshot){
 if(!snapshot || !Number.isInteger(snapshot.tabId) || !Array.isArray(snapshot.messageIds) || !snapshot.messageIds.length)throw Error('no-selection');
 const current=await captureSelection(api,snapshot.tabId);
 if(current.messageIds.length!==snapshot.messageIds.length || snapshot.messageIds.some(id=>!current.messageIds.includes(id)))throw Error('selection-changed');
 for(const id of snapshot.messageIds)await api.messages.get(id);
 return [...snapshot.messageIds];
}
