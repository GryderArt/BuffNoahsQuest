const H = require('./harness'); const fs = require('fs'); const { NQ } = H; const { Game, Player } = NQ;
// at the title screen, press U
Game.state = 'title';
H.press('u');
const F = Game.flags;
H.assert(Game.mapId === 'burrow5', 'U drops Noah into the Underburrow (burrow5)');
H.assert(Game.state === 'play', 'and into play state');
// every World-1 achievement present
const w1 = ['net','cage','harpoon','bone','sandals','gloves','bracers','suit','wings','ramsuit','ramsi','world2','ramHead','ramStun','ramShield','parents','billy','twinkle','cerberus','sahor','gustwing','pufflord','sparkhorn','tempestia'];
H.assert(w1.every(k => F[k] === true), 'all World-1 gear/bosses/sky-rescue flags are set');
H.assert(Player.maxHearts === 16, 'arrives with a full upgraded heart bar');
// World 2 itself is FRESH
H.assert(!F.ramGlow && !F.ramShrink && !F.ramBounce && !F.ramPound, 'no burrow abilities yet (earned in World 2)');
H.assert(!F.mottle && !F.gnash && F.pillowkin === 0, 'no Underburrow progress yet');
H.assert(F.underburrow === true, 'intro skipped for the quick-start');
H.assert(Game.companionActive && Game.companionActive() === true, 'Ramsi is active and following');
// and it actually plays: beat Mottle (flag), then free Mr. Ram -> Glow + Shrink
F.mottle = true;
H.place(61, 16); H.face('up'); Game.interact();
H.assert(F.ramGlow && F.ramShrink, 'freeing Mr. Ram works once Mottle falls (Glow + Shrink)');
// screenshot the title hint + the arrival
Game.state = 'title'; H.render(); fs.writeFileSync(__dirname + '/../shots/title_u.png', H.canvas.toBuffer('image/png'));
console.log('WORLD 2 SHORTCUT OK — U sets up World-1-complete and drops into the Underburrow');
