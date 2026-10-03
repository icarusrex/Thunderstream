export function memoryStorage(initial={}) {
 const data=structuredClone(initial);
 return {data, async get(key){return {[key]:structuredClone(data[key])};}, async set(values){Object.assign(data,structuredClone(values));}, async remove(key){delete data[key];}};
}
