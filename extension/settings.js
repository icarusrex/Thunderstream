export const DEFAULTS = Object.freeze({schemaVersion:1,keyboardEnabled:false,sendArchiveEnabled:false,density:'comfortable',recentTagIds:[],uiFeatures:{}});
export function normalizeSettings(value={}) {
 const v=value && typeof value==='object'?value:{};
 return {schemaVersion:1,keyboardEnabled:v.keyboardEnabled===true,sendArchiveEnabled:v.sendArchiveEnabled===true,density:v.density==='compact'?'compact':'comfortable',recentTagIds:[...new Set((Array.isArray(v.recentTagIds)?v.recentTagIds:[]).filter(x=>typeof x==='string'))].slice(0,10),uiFeatures:Object.fromEntries(['sidebar','density','compose','palette'].map(k=>[k,v.uiFeatures?.[k]===true]))};
}
export async function loadSettings(storage){return normalizeSettings((await storage.get('settings')).settings);}
export async function saveSettings(storage,settings){await storage.set({settings:normalizeSettings(settings)});}
