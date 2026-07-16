const H = require('./harness'); const { NQ } = H; const { Game, Player } = NQ;
H.startPlay();
Object.assign(Game.flags, { ramsi:true, world2:true, sandals:true, wings:true });
// no-fly burrow: hop works, flap does NOT engage flight
Game.loadMap('burrowtest'); Game.state='play'; H.place(8,8); H.step(1);
Player.jump();                       // first hop
H.assert(Player.airborne===true, 'no-fly: basic hop still works');
Player.jump();                       // try to flap mid-air
H.assert(Player.flight===false, 'no-fly: wings do NOT engage flight in the burrow');
// a normal sky map: flap DOES engage flight
Game.flags.gustwing=true; Game.loadMap('sky2'); Game.state='play'; H.place(6,16); H.step(1);
Player.jump(); Player.jump();
H.assert(Player.flight===true, 'sky map: wings still flap normally');
console.log('NO-FLY OK');
