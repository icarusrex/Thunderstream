import {test} from 'node:test';
import assert from 'node:assert/strict';
class Node {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.events={};this.value='';this.checked=false;this.disabled=false;this.textContent='';}
 setAttribute(k,v){this[k]=v;}removeAttribute(k){delete this[k];}
 addEventListener(k,fn){(this.events[k]||=[]).push(fn);}append(...n){this.children.push(...n);}replaceChildren(...n){this.children=n;}
 focus(){this.focused=true;}scrollIntoView(){}
 async fire(k,e={}){for(const fn of this.events[k]||[])await fn({preventDefault(){},...e});}
}
const state={ok:true,accountsAvailable:true,accounts:[{id:'a',name:'Work <img>'},{id:'b',name:'Personal'}],groups:[{id:'work',name:'Work focus',accountIds:['a','missing'],available:true,missingAccounts:1}]};
async function page(t,file,reply){
 const ids=['group-form','group-name','accounts','save-group','cancel-edit','groups','status','query','commands','account-group','manage-groups','group-warning'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new Node()]));nodes['account-group'].tagName='SELECT';
 const calls=[],saved={};for(const k of ['document','messenger','window','location'])saved[k]=Object.getOwnPropertyDescriptor(globalThis,k);
 globalThis.document={querySelector:s=>nodes[s.slice(1)],createElement:tag=>new Node(tag),addEventListener(){}};
 globalThis.window={close(){calls.push({type:'closed'});}};globalThis.location={};
 globalThis.messenger={runtime:{sendMessage:async r=>{calls.push(r);return reply(r);}}};
 t.after(()=>{for(const [k,d] of Object.entries(saved))d?Object.defineProperty(globalThis,k,d):delete globalThis[k];});
 await import('../extension/ui/'+file+'.js?groups-ui='+crypto.randomUUID());return {nodes,calls};
}
test('manager renders inert names and explicit unavailable membership',async t=>{
 const {nodes}=await page(t,'account-groups',()=>structuredClone(state));
 assert.equal(nodes.accounts.children.length,2);
 assert.equal(nodes.accounts.children[0].children[1].textContent,'Work <img>');
 assert.match(nodes.groups.children[0].textContent+nodes.groups.children[0].children.map(n=>n.textContent).join(' '),/unavailable/);
 assert.equal(nodes['save-group'].disabled,true);
});
test('manager creates a group from checked native account IDs',async t=>{
 const {nodes,calls}=await page(t,'account-groups',()=>structuredClone(state));
 nodes['group-name'].value='New';await nodes['group-name'].fire('input');
 nodes.accounts.children[1].children[0].checked=true;await nodes.accounts.children[1].children[0].fire('change');
 assert.equal(nodes['save-group'].disabled,false);await nodes['group-form'].fire('submit');
 assert.deepEqual(calls.at(-1),{type:'groups:save',name:'New',accountIds:['b']});
});
test('manager edits live membership and deletes by canonical group ID',async t=>{
 const {nodes,calls}=await page(t,'account-groups',()=>structuredClone(state));
 const row=nodes.groups.children[0];await row.children.find(n=>n.textContent==='Edit').fire('click');
 assert.equal(nodes['group-name'].value,'Work focus');assert.equal(nodes.accounts.children[0].children[0].checked,true);
 await nodes['group-form'].fire('submit');assert.deepEqual(calls.at(-1),{type:'groups:save',id:'work',name:'Work focus',accountIds:['a']});
 await nodes.groups.children[0].children.find(n=>n.textContent==='Delete').fire('click');assert.deepEqual(calls.at(-1),{type:'groups:delete',id:'work'});
});
test('manager failure retains edit values and allows retry',async t=>{
 const {nodes}=await page(t,'account-groups',r=>r.type==='groups:list'?structuredClone(state):{ok:false,code:'invalid-group'});
 nodes['group-name'].value='All accounts';nodes.accounts.children[0].children[0].checked=true;
 await nodes['group-form'].fire('submit');assert.equal(nodes['group-name'].value,'All accounts');assert.equal(nodes['save-group'].disabled,false);assert.match(nodes.status.textContent,/unique/);
});
test('manager account-list failure disables saves and reports reason',async t=>{
 const {nodes}=await page(t,'account-groups',()=>({...structuredClone(state),accounts:[],accountsAvailable:false,warning:'Account groups unavailable.'}));
 assert.equal(nodes['save-group'].disabled,true);assert.match(nodes.status.textContent,/unavailable/);
});
const palette={ok:true,token:'original',group:{id:'',name:'All accounts',warning:''},groups:state.groups,groupsAvailable:true,tags:[],search:false,commands:[{id:'go:a',title:'Inbox Work',available:true}]};
test('palette group change preserves query and uses the new token',async t=>{
 const {nodes,calls}=await page(t,'palette',r=>r.type==='palette:init'?structuredClone(palette):r.type==='palette:group'?{...structuredClone(palette),token:'next',group:{id:'work',name:'Work focus',warning:'Some accounts unavailable.'}}:{ok:false,code:'fixture'});
 nodes.query.value='Inbox';await nodes.query.fire('input');nodes['account-group'].value='work';await nodes['account-group'].fire('change');
 assert.equal(nodes.query.value,'Inbox');assert.equal(nodes['account-group'].value,'work');assert.match(nodes['group-warning'].textContent,/unavailable/);
 await nodes.commands.children[0].fire('click');assert.deepEqual(calls.at(-1),{type:'command:run',token:'next',commandId:'go:a'});
});
test('failed palette group switch restores selector and old usable token',async t=>{
 const {nodes,calls}=await page(t,'palette',r=>r.type==='palette:init'?structuredClone(palette):{ok:false,code:'group-unavailable'});
 nodes['account-group'].value='work';await nodes['account-group'].fire('change');assert.equal(nodes['account-group'].value,'');assert.equal(nodes['account-group'].disabled,false);
 await nodes.commands.children[0].fire('click');assert.equal(calls.at(-1).token,'original');
});
test('palette manager opens against captured palette context',async t=>{
 const {nodes,calls}=await page(t,'palette',r=>r.type==='palette:init'?structuredClone(palette):{ok:true});
 await nodes['manage-groups'].fire('click');assert.deepEqual(calls.slice(-2),[{type:'groups:open',token:'original'},{type:'closed'}]);
});
