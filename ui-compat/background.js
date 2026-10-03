// This pre-release deliberately installs no native hooks. All profiles are inactive.
// Status can be inspected in the extension debugger without touching mail windows.
export async function getStatus(){try{return await messenger.thunderstreamUI.getStatus();}catch{return {nativeHooks:false,reason:'Compatibility API unavailable'};}}
