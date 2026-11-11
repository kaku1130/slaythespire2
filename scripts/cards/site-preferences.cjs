process.chdir(require('node:path').resolve(__dirname,'../..'));
const script=`
window.sts2Preferences=(()=>{
 const prefix='sts2_preferences_v1_';
 function decode(value){try{const data=JSON.parse(value);return data&&typeof data==='object'&&!Array.isArray(data)?data:null;}catch{return null;}}
 function load(page){const key=prefix+page;try{const cookie=document.cookie.split(';').map(item=>item.trim()).find(item=>item.startsWith(key+'='));if(cookie){const data=decode(decodeURIComponent(cookie.slice(key.length+1)));if(data)return data;}}catch{}try{return decode(localStorage.getItem(key));}catch{return null;}}
 function save(page,value){const key=prefix+page,json=JSON.stringify(value);try{const encoded=encodeURIComponent(json);if(encoded.length<3800)document.cookie=key+'='+encoded+'; Max-Age=31536000; Path=/; SameSite=Lax';}catch{}try{localStorage.setItem(key,json);}catch{}}
 return {load,save};
})();
`;
module.exports={script};
