const fs=require('node:fs');
const {createHash}=require('node:crypto');
module.exports=(page,stylesheet)=>{
 const version=createHash('sha256').update(fs.readFileSync(stylesheet)).digest('hex').slice(0,12);
 const html=fs.readFileSync(page,'utf8');
 const escaped=stylesheet.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 fs.writeFileSync(page,html.replace(new RegExp('href="'+escaped+'(?:\\?[^" ]*)?"','g'),'href="'+stylesheet+'?v='+version+'"'));
};
