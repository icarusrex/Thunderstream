import {handlePaletteKey,nextAvailable} from './keys.js';
import {filterCommands} from '../commands.js';
import {describeSearch} from '../search.js';
import {mutationText,codeText} from '../outcomes.js';
import {element,setText} from './dom.js';
const query=document.querySelector('#query'),list=document.querySelector('#commands'),status=document.querySelector('#status');
let token,commands=[],filtered=[],index=-1,busy=false,tags=[],searchable=false;
function withSearch(list){
 const q=query.value.trim();if(!searchable||!q)return list;
 const d=describeSearch(q,tags);const entry={id:'search',title:d.title,keywords:'',available:d.available,search:true,unsupported:d.unsupported};
 return q.includes(':')||!list.length?[entry,...list]:[...list,entry];
}
function render(){
 filtered=withSearch(filterCommands(commands,query.value));
 if(!filtered[index]?.available)index=nextAvailable(filtered,-1,1);
 list.replaceChildren();query.removeAttribute('aria-activedescendant');list.setAttribute('aria-busy',String(busy));
 filtered.forEach((c,i)=>{
  const option=element('div',c.title,{id:'command-'+i,role:'option','aria-selected':String(i===index),'aria-disabled':String(!c.available||busy),'data-command':c.id});
  option.className=i===index?'command selected':'command';
  option.addEventListener('click',()=>execute(c));list.append(option);
  if(i===index)query.setAttribute('aria-activedescendant',option.id);
 });
 const search=filtered.find(c=>c.search);
 if(search?.unsupported.length)setText(status,'Not supported by Thunderbird Quick Filter: '+search.unsupported.join(', '));
 else if(!filtered.length)setText(status,'No matching actions');
}
async function execute(command){
 if(busy||!command?.available)return;busy=true;render();
 const request=command.search?{type:'search:run',token,query:query.value}:{type:'command:run',token,commandId:command.id};
 let result;try{result=await messenger.runtime.sendMessage(request);}catch{result={ok:false,code:'result-unavailable'};}
 busy=false;
 if(result.ok&&result.code==='show-tags')location.href='tags.html?token='+encodeURIComponent(token);
 else if(result.ok&&result.code==='show-identities')location.href='identities.html?token='+encodeURIComponent(token);
 else if(result.ok)window.close();
 else{
  if(result.outcomes){setText(status,mutationText(result));commands=commands.map(c=>({...c,available:false}));}
  else setText(status,codeText(result.code));
  render();
 }
}
query.addEventListener('input',()=>{index=-1;setText(status,'');render();});
document.addEventListener('keydown',event=>handlePaletteKey(event,{close:()=>window.close(),enterEnabled:event.target===query,execute:()=>execute(filtered[index]),navigate:delta=>{index=nextAvailable(filtered,index,delta);render();list.children[index]?.scrollIntoView({block:'nearest'});}}));
try{const data=await messenger.runtime.sendMessage({type:'palette:init'});if(!data.ok)throw Error();token=data.token;commands=data.commands;tags=data.tags||[];searchable=data.search===true;render();query.focus();}catch{setText(status,'Thunderstream is unavailable. Native Thunderbird remains usable.');}
