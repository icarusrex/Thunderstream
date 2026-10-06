import {element,setText,request} from './dom.js';
const token=new URL(location.href).searchParams.get('token');
const list=document.querySelector('#identities'),status=document.querySelector('#status');
let busy=false;
try{
 const data=await messenger.runtime.sendMessage({type:'identities:init',token});
 if(!data.ok)throw Error();
 for(const identity of data.identities){
  const button=element('button',undefined,{type:'button'});
  button.className=identity.suggested?'command native':'command';
  button.append(element('span',identity.email,{class:'identity-address'}),element('span',identity.accountName,{class:'identity-account'}));
  if(identity.suggested)button.append(element('span','Suggested: '+identity.reason,{class:'identity-suggestion'}));
  button.addEventListener('click',async()=>{
   if(busy)return;busy=true;
   let result;
   try{result=await request({type:'identities:open',token,identityId:identity.id});}
   catch{busy=false;setText(status,'Compose result unavailable. Reopen the palette.');return;}
   if(result.ok)window.close();
   else{busy=false;setText(status,'Compose could not be opened: '+result.code);}
  });
  list.append(button);
 }
 list.querySelector('button')?.focus();
 if(!data.identities.length)setText(status,'No sending identities are configured.');
}catch{setText(status,'Context expired. Reopen the palette.');}
