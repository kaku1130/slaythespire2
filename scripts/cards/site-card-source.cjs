// Decode JSON carried by Next.js without executing scripts from the source page.
function payload(html) {
  const chunks = [];
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    const script = match[1], start = script.indexOf('self.__next_f.push(');
    if (start < 0) continue;
    try {
      const data = JSON.parse(script.slice(start + 'self.__next_f.push('.length, script.lastIndexOf(')')));
      if (typeof data[1] === 'string') chunks.push(data[1]);
    } catch { /* Bootstrap scripts do not contain catalog data. */ }
  }
  return chunks.join('');
}
function jsonAt(text, start) {
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === '[' || char === '{') depth++;
    else if ((char === ']' || char === '}') && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  throw Error('Incomplete source JSON');
}
function catalog(html) {
  const text = payload(html), marker = '"initial":';
  const start = text.indexOf(marker);
  if (start < 0) throw Error('Missing card catalog');
  const initial = jsonAt(text, start + marker.length);
  if (!Array.isArray(initial.cards) || !initial.cards.length) throw Error('Empty card catalog');
  return initial;
}
module.exports = {payload, jsonAt, catalog};
