import {test} from 'node:test';import assert from 'node:assert/strict';import {handlePaletteKey,handleTagKey} from '../extension/ui/keys.js';
test('IME enter does not execute palette action',()=>{let n=0;handlePaletteKey({key:'Enter',isComposing:true,keyCode:229},{execute:()=>n++,close:()=>n++,navigate:()=>n++});assert.equal(n,0);});
test('IME enter and escape neither apply tags nor close picker',()=>{let n=0;for(const key of ['Enter','Escape'])handleTagKey({key,isComposing:true,keyCode:229},{apply:()=>n++,close:()=>n++});assert.equal(n,0);});
test('normal Enter applies tags exactly once',()=>{let n=0;handleTagKey({key:'Enter',preventDefault(){}},{apply:()=>n++,close:()=>{}});assert.equal(n,1);});
test('picker navigation skips disabled commands',async()=>{const keys=await import('../extension/ui/keys.js');assert.equal(typeof keys.nextAvailable,'function');const c=[{available:true},{available:false},{available:true}];assert.equal(keys.nextAvailable(c,0,1),2);assert.equal(keys.nextAvailable(c,2,-1),0);assert.equal(keys.nextAvailable([{available:false}],0,1),-1);});
test('Enter on a tag row button leaves native button activation intact',()=>{let applies=0,prevented=0;handleTagKey({key:'Enter',target:{tagName:'BUTTON'},preventDefault(){prevented++;}},{apply:()=>applies++,close:()=>{}});assert.equal(applies,0);assert.equal(prevented,0);});

test('account selector retains native arrow keys without palette navigation',()=>{
 let navigated=0,prevented=0;
 handlePaletteKey({key:'ArrowDown',target:{tagName:'SELECT'},preventDefault(){prevented++;}},{navigateEnabled:false,navigate:()=>navigated++});
 assert.equal(navigated,0);assert.equal(prevented,0);
});
