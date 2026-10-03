import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {listSendingIdentities} from '../extension/identities.js';
test('native search and Send Later shortcuts are not claimed',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../extension/manifest.json',import.meta.url),'utf8'));
 for(const command of Object.values(manifest.commands))assert.equal(command.suggested_key,undefined);
});
test('reply identity suggestion follows the recipient alias, not the account default',async()=>{
 const api={mailTabs:{getSelectedMessages:async()=>({id:null,messages:[{id:1}]})},messages:{get:async()=>({folder:{accountId:'a'},recipients:['a@work.test']})},accounts:{list:async()=>[{id:'a',name:'Work',identities:[{id:'default',email:'z@work.test'},{id:'alias',email:'a@work.test'}]}]}};
 const identities=await listSendingIdentities(api,{composeAction:'reply',selection:{tabId:7,messageIds:[1]}});
 assert.deepEqual(identities.map(i=>i.id),['alias','default']);
 assert.equal(identities[0].suggested,true);
 assert.ok(!identities[1].suggested);
});
