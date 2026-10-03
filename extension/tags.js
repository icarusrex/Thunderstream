import {validateSelection} from './selection.js';
import {listTags} from './mail-adapter.js';
import {mutationResult} from './outcomes.js';
export async function applyTagDelta(api,snapshot,delta){
 try{
  if(!Array.isArray(delta?.add)||!Array.isArray(delta?.remove))throw Error('invalid-tags');
  const known=new Set((await listTags(api)).map(t=>t.key));
  if([...delta.add,...delta.remove].some(key=>!known.has(key)))return {ok:false,code:'tag-unavailable'};
  if(delta.add.some(key=>delta.remove.includes(key)))return {ok:false,code:'invalid-tags'};
  const ids=await validateSelection(api,snapshot);await validateSelection(api,snapshot);
  const outcomes=[];
  for(const id of ids){
   let attempted=false;
   try{
    const header=await api.messages.get(id),tags=new Set(header.tags);
    for(const key of delta.remove)tags.delete(key);
    for(const key of delta.add)tags.add(key);
    attempted=true;await api.messages.update(id,{tags:[...tags]});outcomes.push({id,state:'completed'});
   }catch{outcomes.push({id,state:attempted?'uncertain':'failed'});}
  }
  return mutationResult(outcomes);
 }catch{return {ok:false,code:'tag-action-failed'};}
}
