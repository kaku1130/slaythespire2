process.chdir(require('node:path').resolve(__dirname,'../..'));
// Match the readable catalog text scale on the potion/relic pages.
const styles=`
main#main-content{font-family:Arial,"Microsoft JhengHei",sans-serif;font-size:20px;line-height:1.7}
main#main-content :is(p,li,td,th){line-height:1.7}
main#main-content :is(.text-xs,.tag,.chapter-count){font-size:16px;line-height:1.6}
main#main-content :is(.text-sm,.text-base){font-size:18px;line-height:1.7}
main#main-content :is(.text-lg,.text-xl){font-size:22px;line-height:1.5}
main#main-content :is(h2,h3,.chapter-title){font-size:24px;line-height:1.5}
main#main-content h1{font-size:30px;line-height:1.4}
main#main-content .entry>p{font-size:20px}
main#main-content .split-detail-heading{font-size:22px;line-height:1.5}
main#main-content .split-list [data-detail-key] .font-semibold:not(.text-sm){font-size:24px;line-height:1.5}
main#main-content .truncate{white-space:normal;overflow-wrap:anywhere;text-overflow:clip}
main#main-content .split-list .entry,main#main-content .split-detail{overflow-wrap:anywhere}
main#main-content .flex>div{min-width:0}
@media(max-width:640px){main#main-content .whitespace-nowrap{white-space:normal;overflow-wrap:anywhere}main#main-content{font-size:18px}main#main-content .entry>p{font-size:18px}main#main-content :is(h2,h3,.chapter-title){font-size:22px}main#main-content h1{font-size:28px}}
`;
module.exports={styles};
