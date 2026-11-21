process.chdir(require('node:path').resolve(__dirname,'../..'));
const fs=require('node:fs'),assert=require('node:assert/strict');
const source=JSON.parse(fs.readFileSync('data/monster/wiki-powers.json','utf8'));
const descriptions=JSON.parse(fs.readFileSync('data/monster/power-descriptions.json','utf8'));
const shared=new Map(Object.values(source.pages).flatMap(page=>page.powers.map(power=>[power.name.replace(/ⓘ/g,'').trim(),power])));
const multi={
 PHROG_PARASITE:['Infested'],WRIGGLER:[],KIN_PRIEST:[],KIN_FOLLOWER:['Minion'],
 CRUSHER:['Back Attack','Crab Rage'],ROCKET:['Back Attack','Crab Rage'],
 FLAIL_KNIGHT:[],SPECTRAL_KNIGHT:['Hex'],MAGI_KNIGHT:['Dampen'],
 QUEEN:['Chains of Binding'],TORCH_HEAD_AMALGAM:['Minion'],
 TEST_SUBJECT:['Adaptable','Enrage'],TEST_SUBJECT_2:['Adaptable','Painful Stabs'],TEST_SUBJECT_3:['Nemesis','Intangible']
};
const amounts={
 BYRDONIS:{Territorial:'1'},VANTOM:{Slippery:'9'},SKULKING_COLONY:{'Hardened Shell':'20'},
 PHANTASMAL_GARDENER:{Skittish:'6（A8+：7）'},TERROR_EEL:{Shriek:'70（A8+：75）'},
 LAGAVULIN_MATRIARCH:{Plating:'12',Asleep:'3'},ENTOMANCER:{'Personal Hive':'1'},
 INFESTED_PRISM:{'Vital Spark':'2（A9+：3）'},MECHA_KNIGHT:{Artifact:'3'},
 TEST_SUBJECT_3:{Intangible:'1'},AEONGLASS:{Artifact:'3'}
};
for(const file of ['overgrowth','underdocks','hive','glory']){
 const name='data/monster/'+file+'-wiki.json';
 const data=JSON.parse(fs.readFileSync(name,'utf8'));
 for(const entry of data.encounters){
  const page=source.pages[entry.page];assert(page,'Missing Wiki page '+entry.page);
  const definitions=new Map(page.powers.map(power=>[power.name.replace(/ⓘ/g,'').trim(),power]));
  for(const entity of entry.entities){
   const key=entity.id+(entity.phase?'_'+entity.phase:'');
   const names=multi[key]||[...definitions.keys()];
   entity.powers=names.map(name=>{
    const power=definitions.get(name)||shared.get(name);assert(power,'Missing Wiki Power '+entry.page+': '+name);
    assert(power.icon,'Missing icon '+name);
    return {name,...(amounts[key]?.[name]?{amount:amounts[key][name]}:{}),description:descriptions[name]||power.description,icon:power.icon};
   });
   // All three Decimillipede segments share the same Power and amount.
   if(entity.id.startsWith('DECIMILLIPEDE_SEGMENT_'))for(const power of entity.powers)power.amount='25';
   if(entity.id==='SOUL_FYSH')entity.powers.unshift({name:'Beckon',description:descriptions.Beckon,icon:'https://spire-codex.com/static/images/cards/beckon.webp'});
  }
 }
 data.powersCheckedAt=source.checkedAt;
 fs.writeFileSync(name,JSON.stringify(data,null,2)+'\n');
}
console.log('Applied Wiki Power definitions and icons to all four chapters.');
