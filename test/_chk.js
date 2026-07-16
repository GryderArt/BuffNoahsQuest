const H=require('./harness'); const {NQ}=H; const {Game,Player}=NQ;
console.log('bush solid?', !!(NQ.TILEDEFS.bush.solid), '| stump solid?', !!(NQ.TILEDEFS.stump.solid));
H.startPlay(); Game.loadMap('vale'); Game.flags.gloves=false;
console.log('walk onto bush (3,20) no gear:', Player.canEnter(NQ.MAPS.vale,3,20,4,20));
console.log('walk onto stump (3,24) no gear:', Player.canEnter(NQ.MAPS.vale,3,24,4,24));
