import {validateSelection} from './selection.js';
import {trashDestinations} from './mail-adapter.js';
import {mutationResult} from './outcomes.js';
export async function executeTriage(api,action,snapshot){
 try{
  const ids=await validateSelection(api,snapshot);
  const headers=await Promise.all(ids.map(id=>api.messages.get(id)));
  const outcomes=[];
  let batches;
  if(action==='archive')batches=[{ids,run:()=>api.messages.archive(ids)}];
  else if(action==='star'||action==='unread'){
   const update=action==='star'?{flagged:headers.some(h=>!h.flagged)}:{read:false};
   batches=ids.map(id=>({ids:[id],run:()=>api.messages.update(id,update)}));
  }else if(action==='trash'){
   const destinations=await trashDestinations(api,headers);
   if(headers.some(h=>h.folder.id===destinations.get(h.folder.accountId)))throw Error('already-in-trash');
   batches=[...destinations].map(([accountId,destination])=>{
    const group=headers.filter(h=>h.folder.accountId===accountId).map(h=>h.id);
    return {ids:group,accountId,run:()=>api.messages.move(group,destination,{isUserAction:true})};
   });
  }else throw Error('unsupported-command');
  await validateSelection(api,snapshot);
  for(const batch of batches){
   let state='completed';try{await batch.run();}catch{state='uncertain';}
   outcomes.push(...batch.ids.map(id=>({id,state,...(batch.accountId?{accountId:batch.accountId}:{})})));
  }
  return mutationResult(outcomes);
 }catch(e){return {ok:false,code:['selection-changed','no-selection','already-in-trash','trash-folder-unavailable'].includes(e.message)?e.message:'action-failed'};}
}
