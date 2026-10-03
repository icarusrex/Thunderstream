export function mailFixture(ids=[1,2]) {
 const messages=new Map([[1,{id:1,read:true,flagged:false,tags:['keep'],folder:{id:'a/inbox',accountId:'a',specialUse:['inbox']}}],[2,{id:2,read:true,flagged:true,tags:[],folder:{id:'b/inbox',accountId:'b',specialUse:['inbox']}}]]);
 const calls=[];let selected=[...ids];
 return {messages,calls,setSelection:v=>{selected=v;},api:{mailTabs:{getSelectedMessages:async()=>({messages:selected.map(id=>({id})),id:null})},messages:{get:async(id)=>{if(!messages.has(id))throw Error('gone');return structuredClone(messages.get(id));},archive:async ids=>calls.push(['archive',ids]),delete:async(ids,options)=>calls.push(['delete',ids,options]),move:async(ids,destination,options)=>calls.push(['move',ids,destination,options]),update:async(id,v)=>{calls.push(['update',id,v]);Object.assign(messages.get(id),v);}},folders:{query:async q=>[{id:q.accountId+'/trash',accountId:q.accountId,specialUse:['trash']}]}}};
}
