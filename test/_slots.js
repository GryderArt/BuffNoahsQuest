const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player, UI } = NQ;

// ===================== SAVE SLOTS =====================
H.startPlay();                                   // -> slot 0, new game
H.assert(Game.saveSlot === 0, 'default slot is 0');
Game.flags.coins = 111; Game.mapId = 'vale'; saveSlotNow();
function saveSlotNow(){ const st=Game.state; Game.state='play'; NQ.saveGame(); Game.state=st; }
H.assert(NQ.hasSave(0) && !NQ.hasSave(1) && !NQ.hasSave(2), 'slot 0 saved; 1 & 2 empty');
const s0 = Game.slotSummary(0); H.assert(s0 && s0.name === 'Greenwood Vale', 'slot 0 summary shows the zone: ' + (s0 && s0.name));

// start a DIFFERENT game in slot 1
Game.titleSlot = 1; Game.enterSlot('new'); Game.state = 'play';
H.assert(Game.saveSlot === 1, 'now playing slot 1');
Game.flags.coins = 222; saveSlotNow();
H.assert(NQ.hasSave(1), 'slot 1 saved');

// loading slot 0 restores ITS state (isolation)
Game.saveSlot = 0; NQ.loadGame();
H.assert(Game.flags.coins === 111, 'slot 0 reloads its own save (coins=111)');
Game.saveSlot = 1; NQ.loadGame();
H.assert(Game.flags.coins === 222, 'slot 1 reloads its own save (coins=222)');

// erase slot 0, slot 1 survives
Game.eraseSlot(0);
H.assert(!NQ.hasSave(0) && NQ.hasSave(1), 'erasing slot 0 leaves slot 1 intact');

// ===================== CLICK OUTSIDE A SHOP TO CLOSE =====================
H.startPlay(); Game.flags.gems = 20;
Game.openShop(); H.assert(Game.state === 'menu' && Game.menu.type === 'shop', 'shop menu opens');
H.render();                                       // drawMenu sets UI.menuRect
const r = UI.menuRect; H.assert(r, 'menu rect captured');
UI.handleClick(r.x + r.w / 2, r.y + 3);           // click INSIDE (title bar, no item) -> stays open
H.assert(Game.state === 'menu', 'clicking inside the panel keeps the shop open');
UI.handleClick(8, 8);                              // click OUTSIDE the panel -> closes
H.assert(Game.state === 'play' && !Game.menu, 'clicking OUTSIDE the shop closes it');

// a trade menu closes the same way
H.startPlay(); Game.openTrade('tess'); H.render();
const r2 = UI.menuRect; UI.handleClick(r2.x - 30, r2.y - 30);
H.assert(Game.state === 'play' && !Game.menu, 'clicking outside a trade menu closes it');

console.log('SLOTS + CLICK-OUTSIDE OK');
