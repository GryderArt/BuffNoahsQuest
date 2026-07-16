const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
Object.assign(Game.flags, { ramsi: true, world2: true, ramGlide: true, harpoon: true, net: true, sandals: true, gloves: true, bracers: true });
const save = n => fs.writeFileSync(__dirname + '/../shots/' + n + '.png', H.canvas.toBuffer('image/png'));
H.startPlay(); Game.enterSlot('city');

// 1) Cogwerk City creatures — line up the five new clockwork pests in front of Noah
Game.loadMap('cog1'); Player.x = 16 * 16 + 8; Player.y = 24 * 16 + 12;
const want = ['voltbug','coghopper','rustbeetle','steambull','sparkdrone']; let cx = 11;
for (const sp of want) { const c = Game.creatures.find(c => c.species === sp); if (c) { c.x = (cx) * 16 + 8; c.y = 23 * 16 + 12; c.state = 'wander'; cx += 2; } }
Game.companion.map = 'cog1'; Game.companion.x = Player.x - 16; Game.companion.y = Player.y;
H.step(1); Game.banners = []; Game.toasts = []; H.render(); save('art_cog1_creatures');

// 2) Pipeworks — the LADY OF THE LAKE dialogue with her new portrait
Game.loadMap('cog2'); Game.flags.cog2_flow = true;
const lady = Game.map.objects.find(o => o.type === 'npc' && o.who === 'lady');
Player.x = lady.x * 16 + 8; Player.y = (lady.y + 1) * 16 + 12; Game.flags.starcells = {};
Game.state = 'play'; Game.talkTo(lady); Game.banners = []; H.render(); save('art_lady_portrait');

// 3) rooftops — the HD anchor + facade tiles + Blazagon HD
Game.flags.starcells = {}; Game.loadMap('cog3'); const m3 = Game.map;
const post = m3.objects.find(o => o.type === 'post' && !o.land);
Player.x = (post.x - 3) * 16 + 8; Player.y = post.y * 16 + 12;
const bz = Game.creatures.find(c => c.species === 'blazagon'); if (bz) { bz.x = (post.x - 5) * 16 + 8; bz.y = post.y * 16 + 12; }
Game.companion.map = 'cog3'; Game.companion.x = Player.x - 14; Game.companion.y = Player.y + 4;
H.step(1); Game.banners = []; Game.toasts = []; H.render(); save('art_cog3_anchor');

// 4) the STAR-CELL cutscene with the HD star art
Game.startCutscene(Game.STAR_CUTSCENE(3), () => {}); Game.cutscene.t = 0.8; H.render(); save('art_star_cutscene');
console.log('art shots: cog1 creatures, lady portrait, cog3 anchor/facade, star cutscene');
