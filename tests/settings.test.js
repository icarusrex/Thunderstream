import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadSettings,saveSettings} from '../extension/settings.js';
import {memoryStorage} from './helpers.js';
test('loadDefaults',async()=>{const s=await loadSettings(memoryStorage());assert.equal(s.keyboardEnabled,false);assert.equal(s.density,'comfortable');});
test('migrateInvalidSettings',async()=>{const s=await loadSettings(memoryStorage({settings:{density:'bad',keyboardEnabled:'yes',recentTagIds:[1,'tag'],password:'secret'}}));assert.equal(s.keyboardEnabled,false);assert.equal(s.density,'comfortable');assert.deepEqual(s.recentTagIds,['tag']);assert.equal(s.password,undefined);});
test('save strips unsupported fields',async()=>{const store=memoryStorage();await saveSettings(store,{density:'compact',token:'x'});assert.equal(store.data.settings.token,undefined);assert.equal(store.data.settings.density,'compact');});
