import {element,setText} from './dom.js';
import {codeText} from '../outcomes.js';
const form=document.querySelector('#group-form'),name=document.querySelector('#group-name'),accounts=document.querySelector('#accounts'),groups=document.querySelector('#groups'),save=document.querySelector('#save-group'),cancel=document.querySelector('#cancel-edit'),status=document.querySelector('#status');
let state={accounts:[],groups:[],accountsAvailable:false},editing,busy=false,checks=[];
function controls(){
 save.disabled=busy||!state.accountsAvailable||!name.value.trim()||!checks.some(({input})=>input.checked);
 name.disabled=busy;cancel.disabled=busy;
 for(const {input} of checks)input.disabled=busy;
 for(const row of groups.children)for(const child of row.children)if(child.tagName==='BUTTON')child.disabled=busy;
}
function reset(){editing=undefined;name.value='';for(const {input} of checks)input.checked=false;setText(save,'Save group');controls();}
function render(){
 accounts.replaceChildren();checks=[];
 for(const account of state.accounts){
  const label=element('label'),input=element('input',undefined,{type:'checkbox'}),text=element('span',account.name);
  input.checked=false;input.addEventListener('change',controls);label.append(input,text);accounts.append(label);checks.push({id:account.id,input});
 }
 if(!checks.length)accounts.append(element('p',state.accountsAvailable?'No mail accounts are configured.':'Thunderbird account list is unavailable.'));
 groups.replaceChildren();
 for(const group of state.groups){
  const row=element('div');row.className='group-row';row.append(element('strong',group.name));
  const hint=element('p',`${group.accountIds.length} account${group.accountIds.length===1?'':'s'}${group.missingAccounts?`; ${group.missingAccounts} unavailable`:''}`);hint.className='hint';row.append(hint);
  const edit=element('button','Edit',{type:'button','aria-label':'Edit '+group.name}),remove=element('button','Delete',{type:'button','aria-label':'Delete '+group.name});
  edit.addEventListener('click',()=>{if(busy)return;editing=group.id;name.value=group.name;for(const {id,input} of checks)input.checked=group.accountIds.includes(id);setText(save,'Update group');setText(status,group.missingAccounts?'Saving removes unavailable accounts from this group.':'');controls();name.focus();});
  remove.addEventListener('click',()=>mutate({type:'groups:delete',id:group.id},'Group deleted.'));row.append(edit,remove);groups.append(row);
 }
 if(!state.groups.length)groups.append(element('p','No saved groups. Quick Open uses All accounts.'));
 reset();
}
async function mutate(request,success){
 if(busy)return;busy=true;controls();setText(status,'Saving…');
 try{const data=await messenger.runtime.sendMessage(request);if(!data.ok){setText(status,codeText(data.code));return;}state=data;render();setText(status,data.warning||success);}
 catch{setText(status,'Account groups could not be saved. Your form is retained for retry.');}
 finally{busy=false;controls();}
}
name.addEventListener('input',controls);cancel.addEventListener('click',()=>{if(busy)return;reset();setText(status,'');name.focus();});
form.addEventListener('submit',event=>{event.preventDefault();if(busy||!state.accountsAvailable||!name.value.trim()||!checks.some(({input})=>input.checked))return;return mutate({type:'groups:save',...(editing?{id:editing}:{}),name:name.value,accountIds:checks.filter(({input})=>input.checked).map(({id})=>id)},'Group saved. Reopen Quick Open to use it.');});
try{const data=await messenger.runtime.sendMessage({type:'groups:list'});if(!data.ok)throw Error();state=data;render();setText(status,data.warning||'');}catch{setText(status,'Account groups are unavailable. Reopen this page to retry.');controls();}
