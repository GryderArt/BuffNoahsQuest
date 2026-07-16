const fs = require('fs');
const { Image } = require('canvas');
// 1) does the raw PNG decode at all?
const buf = fs.readFileSync(__dirname + '/../assets/boss.cerberus.png');
const im = new Image();
im.onload = () => console.log('RAW decode OK:', im.width + 'x' + im.height);
im.onerror = (e) => console.log('RAW decode ERROR:', e && e.message || e);
im.src = buf;
// 2) what does the game end up with for Sprites.cerb after the full pipeline?
const H = require('./harness');
const c = H.NQ.Sprites.cerb;
console.log('Sprites.cerb =', c.width + 'x' + c.height, 'dens=' + (c.dens || 1), '-> logical', (c.width/(c.dens||1)).toFixed(1) + 'x' + (c.height/(c.dens||1)).toFixed(1));
console.log(c.width === 110 ? 'APPLIED the 110x110 PNG' : 'using a DIFFERENT (backup/built-in) sprite');
