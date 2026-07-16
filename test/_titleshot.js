const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay(); Game.flags.coins = 30; Game.log = { sheep: 3, goat: 2 }; Player.maxHearts = 8; Game.mapId = 'coast';
Game.state = 'play'; NQ.saveGame();                 // slot 0 has a save
Game.state = 'title'; Game.titleSlot = 0; Game.time = 1;
H.render(); fs.writeFileSync(__dirname + '/../shots/title_slots.png', H.canvas.toBuffer('image/png'));
console.log('title shot saved');
