const H = require('./harness');
const { NQ } = H;
const { Game, Player, SideScroll } = NQ;
H.startPlay();
SideScroll.start('bramble', false);
const S = SideScroll.active;
const e0 = S.enemies.find(e => e.state === 'live');
console.log('e0:', e0.species, e0.kind, 'x=', e0.x, 'y=', e0.y);
S.p.x = e0.x; S.p.y = e0.y - 14; S.p.vy = 120; S.p.inv = 0.5;
for (let i = 0; i < 8; i++) { H.step(1); console.log(i, 'p.y=', S.p.y.toFixed(1), 'p.vy=', S.p.vy.toFixed(1), 'e0.state=', e0.state, 'err=', Game.errorMsg); }
console.log('final e0.state=', e0.state);
