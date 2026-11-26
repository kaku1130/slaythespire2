const path = require('node:path');

module.exports = source => {
  const url = new URL(source);
  const name = path.posix.basename(url.pathname, path.posix.extname(url.pathname));
  if (!/^[a-z0-9_-]+$/i.test(name)) throw new Error('Invalid monster asset: ' + source);
  return 'assets/monster/images/' + name.replaceAll('_', '-') + '.webp';
};
