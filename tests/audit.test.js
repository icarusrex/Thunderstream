import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {listSendingIdentities} from '../extension/identities.js';
test('native search and Send Later shortcuts are not claimed',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../extension/manifest.json',import.meta.url),'utf8'));
 for(const command of Object.values(manifest.commands))assert.equal(command.suggested_key,undefined);
});
test('reply identity list offers Thunderbird default first and never ranks an explicit identity over an alias',async()=>{
 const api={messages:{get:async()=>({folder:{accountId:'a'}})},accounts:{list:async()=>[{id:'a',name:'Work',identities:[{id:'default',email:'z@work.test'},{id:'alias',email:'a@work.test'}]}]}};
 const identities=await listSendingIdentities(api,{selection:{messageIds:[1]}});
 assert.deepEqual(identities.map(i=>i.id),['thunderbird-default','alias','default']);
 assert.equal(identities[0].native,true);
 assert.ok(identities.every(i=>!i.sourceAccount));
});
