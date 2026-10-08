import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function fixture() {
  const opened = [], alerts = [], requests = [];
  let count = 0;
  const win = {closed:false, document:{documentURI:'test', createElement:()=>({style:{},remove(){}}),documentElement:{appendChild(){}}},
    openEventDialog(...args){opened.push(args);}};
  const support={registerWindowListener(){},unregisterWindowListener(){}};
  const scope = {setTimeout,clearTimeout,Services:{appinfo:{OS:'Darwin',version:'157.0.1',appBuildID:'20261001134409'},
    wm:{getEnumerator:()=>{let done=false;return{hasMoreElements:()=>!done,getNext:()=>{done=true;return win;}};}},
    uuid:{generateUUID:()=>String(++count)},prompt:{alert:(_w,_title,text)=>alerts.push(text)}},
    ChromeUtils:{importESModule:path=>path.includes('Timer')?{setTimeout,clearTimeout}:{ExtensionSupport:support}},
    ExtensionCommon:{ExtensionAPI:class{},EventManager:class{constructor({register}){this.register=register;}api(){return{addListener:fn=>this.register({async:async id=>{requests.push(id);fn?.(id);}})};}}}};
  vm.createContext(scope);
  vm.runInContext(readFileSync(new URL('../meet/api/implementation.js',import.meta.url),'utf8'),scope);
  const instance=vm.runInContext('new thunderstreamMeet()',scope);
  const api=instance.getAPI({extension:{id:'test'},callOnClose(){}}).thunderstreamMeet;
  api.onCreate.addListener();
  const event=()=>{const props={};return{isEvent:()=>true,getProperty:k=>props[k],setProperty:(k,v)=>props[k]=v,clone(){const copy=event();for(const[k,v]of Object.entries(props))copy.setProperty(k,v);return copy;}};};
  return{win,api,instance,opened,alerts,requests,event};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const url='https://meet.google.com/abc-defg-hij';

test('repeated new-event clicks with distinct items create one linked draft',async()=>{
 const f=fixture();await f.api.configure(true);
 f.win.openEventDialog(f.event(),{},'new');f.win.openEventDialog(f.event(),{},'new');
 const count=f.requests.length;
 for(const id of [...f.requests])await f.api.settle(id,url,'');
 await flush();f.instance.cleanup();
 assert.equal(count,1);assert.equal(f.opened.length,1);assert.equal(f.alerts.length,0);
 assert.equal(f.opened[0][0].getProperty('X-THUNDERSTREAM-MEET-URL'),url);
});
test('failure opens one original draft and releases the click guard',async()=>{
 const f=fixture();await f.api.configure(true);const item=f.event();
 f.win.openEventDialog(item,{},'new');await f.api.settle(f.requests[0],'','Denied');await flush();
 assert.equal(f.opened.length,1);assert.equal(f.opened[0][0],item);assert.equal(f.alerts.length,1);
 f.win.openEventDialog(f.event(),{},'new');await f.api.settle(f.requests[1],url,'');await flush();f.instance.cleanup();
 assert.equal(f.opened.length,2);
});
test('edits pass through while a new draft is waiting for Meet',async()=>{
 const f=fixture();await f.api.configure(true);f.win.openEventDialog(f.event(),{},'new');
 const edit=f.event();f.win.openEventDialog(edit,{},'modify');
 assert.equal(f.opened[0][0],edit);
 await f.api.settle(f.requests[0],url,'');await flush();f.instance.cleanup();
 assert.equal(f.opened.length,2);
});
