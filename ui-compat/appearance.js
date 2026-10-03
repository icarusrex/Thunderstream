const CSS=`.thunderstream-density-compact{--thunderstream-row-padding:4px}.thunderstream-density-comfortable{--thunderstream-row-padding:10px}.thunderstream-sidebar{border-inline-end-color:transparent}`;
export function attachAppearance(window,profile,settings){
 if(!profile?.verified)return ()=>{};
 const document=window.document;const attached=[];
 const attach=(selector,className)=>{if(!selector)return;const node=document.querySelector(selector);if(!node)return;node.classList.add(className);attached.push(()=>node.classList.remove(className));};
 if(settings.uiFeatures?.density)attach(profile.appearance?.density,'thunderstream-density-'+(settings.density==='compact'?'compact':'comfortable'));
 if(settings.uiFeatures?.sidebar)attach(profile.appearance?.sidebar,'thunderstream-sidebar');
 if(!attached.length)return ()=>{};
 const style=document.createElement('style');style.id='thunderstream-chrome-style';style.textContent=CSS;document.head.append(style);let cleaned=false;
 return ()=>{if(cleaned)return;cleaned=true;style.remove();for(const undo of attached)undo();};
}
