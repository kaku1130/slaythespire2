const grids='html body[data-view=grid] main#main-content#main-content #card-scroll tbody, html body main#main-content#main-content :is(.relic-section,.potion-section) .catalog';
module.exports=`
/* Phones and iPad mini use one column in either orientation. */
${grids} {grid-template-columns:minmax(0,1fr)}
/* The larger iPads have a short viewport side of at least 810 CSS pixels. */
@media screen and (min-width:810px) and (min-height:810px) {
 ${grids} {grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media screen and (min-width:1025px) and (hover:hover) and (pointer:fine) {
 html body[data-view=grid] main#main-content#main-content #card-scroll tbody {grid-template-columns:repeat(4,minmax(0,1fr))}
 html body main#main-content#main-content :is(.relic-section,.potion-section) .catalog {grid-template-columns:repeat(2,minmax(0,1fr))}
}

/* Keep larger iPads at two columns when browser chrome reduces viewport height. */
@media screen and (orientation:landscape) and (min-device-width:810px) and (min-device-height:810px) and (max-device-width:1440px) and (any-pointer:coarse) {
 ${grids} {grid-template-columns:repeat(2,minmax(0,1fr))}
}

/* Landscape iPad Pro fallback, independent of viewport height and device media. */
@media screen and (orientation:landscape) and (min-width:1180px) and (max-width:1440px) and (any-pointer:coarse), screen and (orientation:landscape) and (min-width:1180px) and (max-width:1440px) and (hover:none) {
 ${grids} {grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;
