import {executeTriage} from './triage.js';import {validateSelection} from './selection.js';
export function createCommands(api,services){
 const cap=services.capabilities||{};
 const command=(id,title,feature,run,keywords='')=>({id,title,keywords,available:cap[feature]?.available===true,run});
 const chooseIdentity=action=>async context=>{if(action!=='compose'){const ids=await validateSelection(api,context.selection);if(ids.length!==1)return {ok:false,code:'select-one-message'};}return {ok:true,code:'show-identities',action};};
 return [command('compose','Compose','compose',chooseIdentity('compose')),
 ...['archive','star','unread','trash'].map(id=>command(id,{archive:'Archive',star:'Star / unstar selection',unread:'Mark unread',trash:'Move to Trash'}[id],id,ctx=>executeTriage(api,id,ctx.selection))),
 command('reply','Reply','reply',chooseIdentity('reply')),command('reply-all','Reply all','reply',chooseIdentity('reply-all')),
 command('forward','Forward','forward',chooseIdentity('forward')),
 {id:'settings',title:'Open settings',keywords:'preferences appearance keyboard',available:true,run:async()=>{await services.openSettings?.();return {ok:true,code:'opened'};}}];
}
export function filterCommands(commands,query){const q=query.trim().toLowerCase();return commands.filter(c=>!q||(c.title+' '+c.keywords).toLowerCase().includes(q)).sort((a,b)=>q?Number(b.title.toLowerCase().startsWith(q))-Number(a.title.toLowerCase().startsWith(q)):0);}
export async function runCommand(commands,id,context){const command=commands.find(c=>c.id===id);if(!command?.available)return {ok:false,code:'unsupported-command'};try{return await command.run(context);}catch{return {ok:false,code:'action-failed'};}}
