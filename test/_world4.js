// WORLD 4 FINALE — GNASHARA, the All-Beast: knock out every head, then Super Ramsi ends it
const H = require('./harness'); const { NQ } = H; const { Game, Player, Bosses, dist } = NQ;
Object.assign(Game.flags, { net: true, harpoon: true, bone: true, ramsi: true, world2: true });
H.startPlay(); Game.enterSlot('city'); Game.flags.gnashara = false;
Game.loadMap('cog4'); const m = Game.map;
H.assert(m.id === 'cog4' && m.zone === 'city' && m.noFly, 'in The All-Beast arena (cog4)');
const b = Game.boss;
H.assert(b && b.gnashara && b.heads.length === 5, 'GNASHARA spawns — a head for every foe (' + (b ? b.heads.length : 0) + ')');
H.assert(b.heads.map(h => h.weak).join(',') === 'ramsi,ram,harpoon,bone,net', 'each head has its own world mechanic');

b.awake = true; Player.inv = 99; Player.maxHearts = 40; Player.hearts = 40;
function defeatHead(idx) {
  let tries = 0;
  while (b.active === idx && tries++ < 400) {
    const w = b.heads[idx].weak; Player.x = b.x; Player.y = b.y + 28; Player.inv = 99;
    Player.netT = w === 'net' ? 0.2 : 0; Player.lungeT = w === 'ram' ? 0.2 : 0;
    Player.harpoon = w === 'harpoon' ? { x: b.x, y: b.y + 18, state: 'out' } : null;
    Player.bone = w === 'bone' ? { x: b.x, y: b.y + 18 } : null;
    if (Game.companion) { Game.companion.map = 'cog4'; Game.companion.x = (w === 'ramsi' ? b.x : -999); Game.companion.y = b.y + 18; }
    Bosses.update(1 / 30);
    Player.netT = 0; Player.lungeT = 0; Player.harpoon = null; Player.bone = null; if (Game.companion) Game.companion.x = -999;
    for (let i = 0; i < 22; i++) Bosses.update(1 / 30);   // expire the per-head hit-cooldown
  }
  return b.active > idx;
}
for (let i = 0; i < 5; i++) H.assert(defeatHead(i), 'KO the ' + b.heads[i].name + ' head with its mechanic (' + b.heads[i].weak + ')');
H.assert(b.active === 5, 'every head is down -> the core opens');
Player.inv = 99; for (let i = 0; i < 150 && Game.boss; i++) Bosses.update(1 / 30);   // core -> catch -> Super Ramsi finish
H.assert(Game.flags.gnashara === true, 'SUPER RAMSI finishes GNASHARA — victory!');
H.assert(Game.boss === null, 'the All-Beast is gone');
H.assert(typeof Game.GNASHARA_ENDING !== 'undefined' && Game.GNASHARA_ENDING.length >= 2, 'there is an ending cutscene');

// world-map node + the rooftops finale portal
H.assert(NQ.WORLD3_NODES.find(n => n.id === 'cog4' && n.req === 'sc_cog3'), 'The All-Beast is on the World-3 map (after the rooftops)');
Game.flags.starcells = { sc_cog1: 1, sc_lady: 1, sc_cog3: 1 }; Game.loadMap('cog3');
H.assert(Game.map.objects.some(o => o.type === 'portal' && o.to === 'world3map' && o.req === 'sc_cog3'), 'the rooftops exit opens the overview map (the All-Beast node is the finale entrance)');
console.log('WORLD 4 OK — GNASHARA multi-head fight (5 mechanics), Super-Ramsi finish, on the map + reachable');
