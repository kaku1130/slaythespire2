// Energy rewards may be immediate, delayed, conditional, shared, or supplied by Plasma.
module.exports=card=>[card.effect.base,card.effect.upgraded].some(effect=>{
 const text=(effect||'').replace(/<\/?g>/g,'');
 return /\bgains?\s*(?:(?:\d+|X)\s*)?(?:<e\s*\/>|\bEnergy\b)/i.test(text)
  || /\bdouble\s+your\s+energy\b/i.test(text)
  || /\bchannels?\s+(?:\d+\s+)?plasma\b/i.test(text);
});
