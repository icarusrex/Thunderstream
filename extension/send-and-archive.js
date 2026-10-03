import {conversationScope} from './conversation.js';
export function createSendAndArchive(api){
 const locks=new Map();
 return {
  isLocked(tabId){return locks.has(tabId);},
  forget(tabId){const lock=locks.get(tabId);if(lock?.running)lock.closed=true;else locks.delete(tabId);},
  async run(tabId){
   if(locks.has(tabId))return {ok:false,code:'already-running'};
   const lock={running:true,closed:false};locks.set(tabId,lock);let attempted=false;
   try{
    const details=await api.compose.getComposeDetails(tabId);
    if(details.type!=='reply'||!Number.isInteger(details.relatedMessageId))return {ok:false,code:'not-a-reply'};
    const originalId=details.relatedMessageId;const original=await api.messages.get(originalId);
    // The archive set is fixed before sending, so it cannot grow to include mail that arrives meanwhile.
    let plan;try{plan=(await conversationScope(api,originalId)).ids;}catch{plan=[originalId];}
    attempted=true;
    const result=await api.compose.sendMessage(tabId,{mode:'sendNow'});
    if(result?.mode!=='sendNow'||!result.headerMessageId)return {ok:false,code:'not-confirmed-sent'};
    try{
     const still=[];
     for(const id of plan){try{const m=await api.messages.get(id);if(m.folder?.id===original.folder?.id)still.push(id);}catch{}}
     if(!still.includes(originalId))throw Error('original-moved');
     await api.messages.archive(still);
     return {ok:true,code:'sent-and-archived',archived:still.length};
    }catch{return {ok:false,code:'sent-archive-failed'};}
   }catch{return {ok:false,code:attempted?'send-failed':'compose-check-failed'};}
   finally{lock.running=false;if(!attempted||lock.closed)locks.delete(tabId);}
  }
 };
}
