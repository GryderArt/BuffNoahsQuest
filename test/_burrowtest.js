const H = require('./harness');
const fs = require('fs');
const { NQ } = H;
const { Game, Player } = NQ;
const save = (n) => { H.render(); fs.writeFileSync(__dirname + '/../shots/bt_' + n + '.png', H.canvas.toBuffer('image/png')); };

H.startPlay();
Game.flags.ramsi = true; Game.flags.world2 = true; Game.flags.sandals = true;
Game.loadMap('burrowtest'); Game.state = 'play';
H.place(5, 8); H.step(2);                                   // companion catches up
Game.banners = []; Game.toasts = [];
save('1_dark');                                            // dark, before Glow

// --- free the Pillow-Kin -> learn Glow + Shrink ---
H.place(6, 11); H.face('up'); Game.interact();
H.assert(Game.flags.ramGlow === true, 'freeing Kin grants GLOW');
H.assert(Game.flags.ramShrink === true, 'freeing Kin grants SHRINK');
H.assert(Game.flags.pillowkin === 1, 'pillowkin count = 1');
H.step(2);
H.assert(Game.glowOn === true, 'GLOW is on in the dark burrow room');
Game.banners = []; Game.toasts = [];
save('2_glow');                                           // lit up by Glow

// --- SHRINK: stand by the burrow-hole, press C -> gate opens ---
H.place(14, 7); H.step(1);
H.assert(Game.doorIsOpen(Game.map, 15, 9) === false, 'gate starts closed');
Game.ramsiCommand();
H.assert(Game.flags.bt_gate === true, 'C at ramhole sets the gate flag');
H.assert(Game.doorIsOpen(Game.map, 15, 9) === true, 'the burrow-gate is now OPEN');
Game.banners = []; Game.toasts = [];
H.place(17, 9); H.step(1); save('3_through_gate');       // walked through, by the reward

console.log('BURROWTEST OK — Glow + Shrink verified end-to-end');
