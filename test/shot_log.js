const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game } = NQ;
H.startPlay(); Game.loadMap('vale');
const all = Object.keys(NQ.CREATURES);
Game.log = {}; all.forEach((s, i) => Game.log[s] = (i % 6) + 1);   // every species caught
Game.menu = { type: 'log' }; Game.state = 'menu'; Game.banners = []; Game.toasts = [];
H.render(); fs.writeFileSync(__dirname + '/../shots/log_full.png', H.canvas.toBuffer('image/png'));
Game.log = { sheep: 3, shark: 1, dragon: 2 };                      // only a few
Game.banners = []; Game.toasts = [];
H.render(); fs.writeFileSync(__dirname + '/../shots/log_few.png', H.canvas.toBuffer('image/png'));
console.log('log shots written; total species =', all.length);
