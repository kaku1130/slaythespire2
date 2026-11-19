// Compare visible words, numbers and resource icons without changing keyword markup.
function tokenize(value) {
  return [...value.matchAll(/<\/?g>|<e\s*\/>|<s\s*\/>|\d+(?:\.\d+)?|[\p{L}\p{M}]+|\s+|[^\s]/gu)].map(match => ({
    value:match[0], compare:!/^<\/?g>$|^\s+$/.test(match[0])
  }));
}
module.exports = function compareEffects(base, upgraded, render) {
  const left = tokenize(base), right = tokenize(upgraded);
  const a = left.filter(token => token.compare), b = right.filter(token => token.compare);
  const lengths = Array.from({length:a.length + 1}, () => new Uint16Array(b.length + 1));
  for (let i=a.length-1; i>=0; i--) for (let j=b.length-1; j>=0; j--) {
    lengths[i][j] = a[i].value === b[j].value ? 1 + lengths[i+1][j+1] : Math.max(lengths[i+1][j], lengths[i][j+1]);
  }
  let i=0, j=0;
  while (i<a.length && j<b.length) {
    if (a[i].value === b[j].value) {a[i++].same=true; b[j++].same=true;}
    else if (lengths[i+1][j] >= lengths[i][j+1]) i++;
    else j++;
  }
  const html = tokens => tokens.map(token => {
    const value = render(token.value);
    return token.compare && !token.same ? '<span class="detail-effect-change">' + value + '</span>' : value;
  }).join('');
  return {base:render(base), upgraded:html(right)};
};
