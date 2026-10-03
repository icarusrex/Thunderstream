const attached=new WeakMap();
export function attachHooks(window,profile,emit){
 if(!profile?.verified)return ()=>{};
 if(attached.has(window))return attached.get(window);
 const cleanups=[];let closed=false;
 const cleanup=()=>{if(closed)return;closed=true;for(const fn of cleanups.reverse()){try{fn();}catch{}}attached.delete(window);};
 try{for(const attach of profile.attach||[])cleanups.push(attach(window,emit));attached.set(window,cleanup);return cleanup;}catch{cleanup();return ()=>{};}
}
