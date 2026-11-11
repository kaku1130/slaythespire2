process.chdir(require('path').resolve(__dirname,'../..'));
const fs=require('fs'),path=require('path'),{execFile}=require('child_process');
const base='https://slaythespire2.net';
async function download(url,file){if(fs.existsSync(file)&&fs.statSync(file).size)return;fs.mkdirSync(path.dirname(file),{recursive:true});await new Promise((resolve,reject)=>execFile('curl.exe',['-L','--fail','--silent','--show-error','--retry','2','--connect-timeout','15','--max-time','60',url,'-o',file],{windowsHide:true},e=>e?reject(e):resolve()));}
async function batch(jobs){let i=0,done=0;await Promise.all(Array.from({length:8},async()=>{while(i<jobs.length){await jobs[i++]();if(++done%50===0)console.log(done+'/'+jobs.length);}}));}
(async()=>{
 const data=Object.fromEntries(['potion','relic','event','monster'].map(k=>[k,JSON.parse(fs.readFileSync('data/'+k+'/catalog.json')).items]));
 await batch(['event','monster'].flatMap(k=>data[k].map(x=>()=>download(base+'/zh-TW/'+k+'/'+x.slug,'data/'+k+'/source/'+x.slug+'.html'))));
 const images=new Set(Object.values(data).flat().map(x=>x.imagePath||x.image).filter(x=>x?.startsWith('/')));
 const htmls=['event','monster'].flatMap(k=>data[k].map(x=>fs.readFileSync('data/'+k+'/source/'+x.slug+'.html','utf8')));
 for(const html of htmls){const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';for(const m of main.matchAll(/(?:src|srcSet)="([^"]+)"/g)){const u=m[1].split(' ')[0];if(u.startsWith('/'))images.add(u.replace(/&amp;/g,'&'));}}
 const manifest=require('../cards/data-assets.cjs').load();await batch([...images].map(u=>async()=>{const ext=path.extname(new URL(u,base).pathname)||'.webp';const file=require('../cards/asset-paths.cjs')(u);await download(new URL(u,base).href,file);manifest[u]=file;}));
 require('../cards/data-assets.cjs').save(manifest);
 const css=[...htmls[0].matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m=>m[1]);let joined='';for(let i=0;i<css.length;i++){const file='assets/event/styles/source-'+i+'.css';await download(new URL(css[i].replace(/&amp;/g,'&'),base).href,file);joined+=fs.readFileSync(file,'utf8');fs.unlinkSync(file);}fs.writeFileSync('assets/event/styles/source.css',joined);console.log('Saved '+htmls.length+' details and '+images.size+' images.');
})().catch(e=>{console.error(e);process.exitCode=1});
