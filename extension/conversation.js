import {collectMessages} from './mail-adapter.js';
// Conversation scope for Send & Archive (TS-203): the replied-to message plus its ancestors named in its own
// References/In-Reply-To headers, limited to the same folder. Never matched by subject. Newer replies are not included,
// because the user has not necessarily seen them.
const MAX_ANCESTORS=50;
function headerIds(headers){
 const values=[...(headers?.references||[]),...(headers?.['in-reply-to']||[])].join(' ');
 return [...new Set((values.match(/<[^<>\s]+>/g)||[]).map(id=>id.slice(1,-1)))].slice(-MAX_ANCESTORS);
}
export async function conversationScope(api,originalId){
 const original=await api.messages.get(originalId);
 const members=[originalId];
 let ancestors=[];
 try{ancestors=headerIds((await api.messages.getFull(originalId)).headers).filter(id=>id!==original.headerMessageId);}
 catch{return {ids:members,complete:false};}
 for(const headerMessageId of ancestors){
  try{for(const m of await collectMessages(api,await api.messages.query({folderId:original.folder.id,headerMessageId})))if(m.folder?.id===original.folder.id&&!members.includes(m.id))members.push(m.id);}
  catch{return {ids:members,complete:false};}
 }
 return {ids:members,complete:true};
}
