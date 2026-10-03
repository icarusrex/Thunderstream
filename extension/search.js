// Translates palette search syntax into Thunderbird's Quick Filter (mailTabs.setQuickFilter, current folder only).
// Quick Filter matches a single text across chosen fields, so terms that cannot be expressed are reported, never dropped.
const FIELDS={from:'author',to:'recipients',subject:'subject',body:'body'};
const FLAGS={'is:unread':'unread','is:starred':'flagged','is:flagged':'flagged','has:attachment':'attachment'};
export const SEARCH_HELP='from: to: subject: body: tag: is:unread is:starred has:attachment';
function tokens(query){return [...query.matchAll(/(\S+?:)?(?:"([^"]*)"|(\S+))/g)].map(m=>({key:m[1]?.slice(0,-1).toLowerCase(),value:m[2]??m[3],raw:m[0]}));}
export function parseSearch(query,tags=[]){
 const properties={show:true},unsupported=[],texts=[];
 for(const t of tokens(query.trim())){
  const flag=FLAGS[t.raw.toLowerCase()];
  if(flag){properties[flag]=true;continue;}
  if(t.key==='tag'){const tag=tags.find(x=>x.tag.toLowerCase()===t.value.toLowerCase()||x.key===t.value);if(!tag){unsupported.push(t.raw+' (unknown tag)');continue;}properties.tags??={mode:'all',tags:{}};properties.tags.tags[tag.key]=true;continue;}
  if(t.key&&FIELDS[t.key]){texts.push({text:t.value,fields:[FIELDS[t.key]]});continue;}
  if(t.key){unsupported.push(t.raw);continue;}
  texts.push({text:t.value,fields:null});
 }
 const plain=texts.filter(x=>!x.fields),scoped=texts.filter(x=>x.fields);
 if(scoped.length>1||(scoped.length&&plain.length)){
  for(const x of texts)unsupported.push(x.fields?`${Object.keys(FIELDS).find(k=>FIELDS[k]===x.fields[0])}:${x.text}`:x.text);
  unsupported.push('(Quick Filter matches one text at a time)');
 }else if(scoped.length){properties.text={text:scoped[0].text,[scoped[0].fields[0]]:true};}
 else if(plain.length){properties.text={text:plain.map(x=>x.text).join(' '),author:true,recipients:true,subject:true};}
 const applied=Object.keys(properties).length>1;
 return {properties,unsupported,applied};
}
export function describeSearch(query,tags){
 const {unsupported,applied}=parseSearch(query,tags);
 if(!applied)return {title:'Search: no supported terms',available:false,unsupported};
 return {title:`Filter this folder: ${query.trim()}`,available:unsupported.length===0,unsupported};
}
