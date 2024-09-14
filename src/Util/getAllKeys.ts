// export function getKeys(value: any): string {
//   const entries = Object.entries(value)[0];
//   console.log(value, entries);
//   let res = '';
//   // if (!res) res = '';
//   if (entries && entries[0]) {
//     return entries[0];
//   }
//   console.log(entries[1]);
//   return res + getKeys(entries[1]);
// }

export function getAllKeys(obj: any) {
  const keys: string[] = [];

  function recursiveKeys(obj: any) {
    for (const key in obj) {
      keys.push(key);
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        recursiveKeys(obj[key]);
      }
    }
  }

  recursiveKeys(obj);
  return keys.join('.');
}
