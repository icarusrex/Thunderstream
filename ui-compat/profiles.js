// No native profile is enabled until exact-version macOS smoke evidence exists.
export const PROFILES=[];
export function selectProfile(version,probes,profiles=PROFILES){return profiles.find(p=>p.verified===true&&p.versions.includes(version)&&p.requiredProbes.every(name=>probes[name]===true))||null;}
