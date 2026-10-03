var thunderstreamUI = class extends ExtensionCommon.ExtensionAPI {
 getAPI(context){return {thunderstreamUI:{async getStatus(){return {nativeHooks:false,reason:'No verified native version profiles'};}}};}
 onShutdown(isAppShutdown){if(!isAppShutdown)Services.obs.notifyObservers(null,'startupcache-invalidate',null);}
};
