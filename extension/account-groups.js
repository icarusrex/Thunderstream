// Local Quick Open membership only; native accounts are never modified.
export function normalizeGroups(value){
 if(!Array.isArray(value))return [];
 const ids=new Set(),names=new Set(),groups=[];
 for(const item of value){
  if(!item||typeof item.id!=='string'||!item.id||typeof item.name!=='string'||!Array.isArray(item.accountIds))continue;
  const name=item.name.trim(),key=name.toLowerCase();
  const accountIds=[...new Set(item.accountIds.filter(id=>typeof id==='string'&&id))].slice(0,100);
  if(!name||name.length>80||key==='all accounts'||ids.has(item.id)||names.has(key)||!accountIds.length)continue;
  groups.push({id:item.id,name,accountIds});ids.add(item.id);names.add(key);
  if(groups.length===20)break;
 }
 return groups;
}
export function groupScope(state,id='',fallback=false){
 const all={id:'',name:'All accounts',accountIds:null,warning:state.warning||''};
 if(id==='')return all;
 const group=state.groups.find(group=>group.id===id);
 if(!group?.available){
  if(fallback)return {...all,warning:'Saved account group is unavailable. Showing All accounts.'};
  throw Object.assign(Error('group-unavailable'),{code:'group-unavailable'});
 }
 const live=new Set(state.accounts.map(account=>account.id));
 return {id:group.id,name:group.name,accountIds:group.accountIds.filter(id=>live.has(id)),warning:group.missingAccounts?'Some accounts in this group are unavailable. Showing its remaining accounts.':''};
}
export function createAccountGroups(api,store){
 let pending=Promise.resolve();
 const modify=fn=>{const result=pending.then(fn);pending=result.catch(()=>{});return result;};
 async function read(){
  const groups=normalizeGroups((await store.get('accountGroups')).accountGroups);
  const selected=(await store.get('quickOpenGroupId')).quickOpenGroupId;
  let accounts=[],accountsAvailable=true;
  try{accounts=(await api.accounts.list(false)).filter(a=>typeof a.id==='string'&&a.id).map(a=>({id:a.id,name:typeof a.name==='string'?a.name:a.id}));}catch{accountsAvailable=false;}
  const live=new Set(accounts.map(a=>a.id));
  return {ok:true,accounts,accountsAvailable,selectedId:typeof selected==='string'?selected:'',warning:accountsAvailable?'':'Account groups are unavailable while Thunderbird cannot list accounts.',groups:groups.map(g=>({...g,available:accountsAvailable&&g.accountIds.some(id=>live.has(id)),missingAccounts:g.accountIds.filter(id=>!live.has(id)).length}))};
 }
 const plain=groups=>groups.map(({id,name,accountIds})=>({id,name,accountIds}));
 return {
  async list(){await pending;return read();},
  save:request=>modify(async()=>{
   const state=await read(),name=typeof request.name==='string'?request.name.trim():'';
   const ids=Array.isArray(request.accountIds)?[...new Set(request.accountIds)]:[];
   const live=new Set(state.accounts.map(a=>a.id));
   const index=state.groups.findIndex(g=>g.id===request.id);
   const editing=request.id!==undefined;
   if(!state.accountsAvailable)return {ok:false,code:'group-unavailable'};
   if(!name||name.length>80||name.toLowerCase()==='all accounts'||!ids.length||ids.length>100||ids.some(id=>typeof id!=='string'||!live.has(id))||
    (editing&&index<0)||(!editing&&state.groups.length>=20)||state.groups.some((g,i)=>i!==index&&g.name.toLowerCase()===name.toLowerCase()))return {ok:false,code:'invalid-group'};
   const group={id:editing?request.id:crypto.randomUUID(),name,accountIds:ids};
   const groups=plain(state.groups);if(editing)groups[index]=group;else groups.push(group);
   await store.set({accountGroups:groups});return read();
  }),
  delete:id=>modify(async()=>{
   const state=await read();if(!state.groups.some(g=>g.id===id))return {ok:false,code:'group-unavailable'};
   await store.set({accountGroups:plain(state.groups.filter(g=>g.id!==id)),...(state.selectedId===id?{quickOpenGroupId:''}:{})});return read();
  }),
  select:(id,prepare=async()=>undefined)=>modify(async()=>{
   const state=await read(),scope=groupScope(state,id);
   const prepared=await prepare(state,scope);
   // Group edits are serialized; account availability may still change during API reads.
   let current;try{current=groupScope(await read(),id);}catch{throw Object.assign(Error('group-changed'),{code:'group-changed'});}
   if(JSON.stringify(scope.accountIds?.slice().sort())!==JSON.stringify(current.accountIds?.slice().sort()))throw Object.assign(Error('group-changed'),{code:'group-changed'});
   await store.set({quickOpenGroupId:scope.id});return prepared===undefined?{...state,selectedId:scope.id,scope}:prepared;
  }),
  runInScope:(id,accountIds,run)=>modify(async()=>{
   let scope;try{scope=groupScope(await read(),id);}catch{return {ok:false,code:'group-changed'};}
   if(JSON.stringify(scope.accountIds?.slice().sort())!==JSON.stringify(accountIds?.slice().sort()))return {ok:false,code:'group-changed'};
   return run();
  }),
  reset:()=>modify(async()=>{await store.remove('accountGroups');await store.remove('quickOpenGroupId');})
 };
}
