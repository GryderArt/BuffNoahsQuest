// USB GAMEPAD: a fake pad injected into navigator.getGamepads drives the same KEYS[]/
// PRESS_QUEUE as the keyboard. Verifies d-pad (axes + buttons), face buttons, L/R tool
// swap, single-fire edge detection, connect/disconnect, and the press-to-bind setup.
const H = require('./harness'); const { NQ } = H;
const { Game, Player } = NQ;

// ---- a mutable fake SNES pad ----
const pad = { index: 0, connected: true, id: 'USB Gamepad (fake SNES)', mapping: 'standard',
  buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
  axes: [0, 0, 0, 0] };
const setBtn = (i, on) => { pad.buttons[i] = { pressed: on, value: on ? 1 : 0 }; };
const setAxis = (i, v) => { pad.axes[i] = v; };
// Node 22 ships a read-only built-in `navigator`; redefine it so the module sees our fake.
Object.defineProperty(globalThis, 'navigator', { value: { getGamepads: () => [pad] }, configurable: true, writable: true });

H.assert(typeof NQ.Game.pollGamepad === 'function' || typeof global.pollGamepad === 'function', 'pollGamepad is wired');
const poll = () => (NQ.Game.pollGamepad ? NQ.Game.pollGamepad() : global.pollGamepad());

// connect
poll();
H.assert(Game.Gamepad.connected, 'the pad is detected on first poll');

H.startPlay();
Game.flags.net = Game.flags.harpoon = Game.flags.cage = Game.flags.bone = true;   // all tools unlocked
Game.loadMap('vale'); Player.tool = 'mitts';

// ---- D-PAD via analog axes ----
setAxis(0, -1);                        // hard left
poll();
H.assert(NQ.keyHeld('ArrowLeft'), 'axis[0]=-1 holds ArrowLeft');
setAxis(0, 0); poll();
H.assert(!NQ.keyHeld('ArrowLeft'), 'centering the stick releases ArrowLeft');
setAxis(1, 1); poll();
H.assert(NQ.keyHeld('ArrowDown'), 'axis[1]=+1 holds ArrowDown');
setAxis(1, 0); poll();

// ---- D-PAD via dpad-buttons (12-15) for pads that report it that way ----
setBtn(12, true); poll();
H.assert(NQ.keyHeld('ArrowUp'), 'button 12 holds ArrowUp (dpad-as-buttons)');
setBtn(12, false); poll();

// ---- FACE BUTTONS: B(0)=use tool, A(1)=interact, Y(2)=ramsi, X(3)=jump ----
// B -> useTool: fires ONCE per press (edge), not every frame held
let uses = 0; const _use = Player.useTool; Player.useTool = function () { uses++; return _use.call(this); };
setBtn(0, true); H.step(1);            // step() runs updateGame -> pollGamepad -> takePresses
H.step(1); H.step(1);                  // still held for 2 more frames
H.assert(uses === 1, 'B held fires USE TOOL exactly once (clean edge), got ' + uses);
setBtn(0, false); H.step(1);
setBtn(0, true); H.step(1);
H.assert(uses === 2, 'releasing then pressing B fires again');
setBtn(0, false); Player.useTool = _use;

// A -> interact
let acted = 0; const _int = Game.interact; Game.interact = function () { acted++; };
setBtn(1, true); H.step(1); setBtn(1, false); H.step(1);
H.assert(acted === 1, 'A triggers INTERACT');
Game.interact = _int;

// X -> jump
let jumped = 0; const _jump = Player.jump; Player.jump = function () { jumped++; return _jump.call(this); };
setBtn(3, true); H.step(1); setBtn(3, false); H.step(1);
H.assert(jumped >= 1, 'X triggers JUMP');
Player.jump = _jump;

// ---- L / R swap the equipped tool (the requested mapping) ----
Player.tool = 'mitts';
setBtn(5, true); H.step(1); setBtn(5, false); H.step(1);        // R = next
H.assert(Player.tool === 'net', 'R swaps to the NEXT tool (mitts -> net)');
setBtn(4, true); H.step(1); setBtn(4, false); H.step(1);        // L = prev
H.assert(Player.tool === 'mitts', 'L swaps to the PREVIOUS tool (net -> mitts)');

// ---- SETUP: full press-to-bind walk incl. D-PAD directions and SELECT/START ----
const GPP = Game.Gamepad;
const STEPS = GPP.STEPS;
H.assert(STEPS[0].key === 'ArrowUp' && STEPS.slice(0,4).every(s => s.dir), 'setup asks for the 4 D-PAD directions FIRST');
H.assert(STEPS.some(s => s.key === 'Escape') && STEPS.some(s => s.key === 'i'), 'setup also covers MAP (START) and BACKPACK (SELECT)');

// open with SELECT+START, then RELEASE (the held combo must NOT bind to step 0)
setBtn(8, true); setBtn(9, true); poll();
H.assert(Game.state === 'padsetup', 'SELECT+START opens controller setup');
poll();                                                   // still held a frame -> no accidental bind
H.assert(GPP.setup.i === 0, 'the opening combo does not mis-bind the first step');
setBtn(8, false); setBtn(9, false); poll();

// helper: a fresh button tap (down then up), each poll = one frame
const tapBtn = (i) => { setBtn(i, true); poll(); setBtn(i, false); poll(); };
const pushAxis = (i, v) => { setAxis(i, v); poll(); setAxis(i, 0); poll(); };

// MOVE UP  -> push axis1 up (stick d-pad)   ; MOVE DOWN -> axis1 down
pushAxis(1, -1); H.assert(GPP.setup.map['ax1-'] === 'ArrowUp' && GPP.setup.i === 1, 'MOVE UP binds an AXIS push');
pushAxis(1, 1);  H.assert(GPP.setup.map['ax1+'] === 'ArrowDown' && GPP.setup.i === 2, 'MOVE DOWN binds an axis push');
// MOVE LEFT -> a dpad-as-BUTTON (index 14) ; MOVE RIGHT -> axis0 right
tapBtn(14);      H.assert(GPP.setup.map['14'] === 'ArrowLeft' && GPP.setup.i === 3, 'MOVE LEFT can bind a d-pad BUTTON');
pushAxis(0, 1);  H.assert(GPP.setup.map['ax0+'] === 'ArrowRight' && GPP.setup.i === 4, 'MOVE RIGHT binds an axis push');

// the 8 action buttons — bind CATCH(z) to physical button 2, then walk the rest generically
tapBtn(2);       H.assert(GPP.setup.map['2'] === 'z' && GPP.setup.i === 5, 'CATCH binds to a face button; SELECT/START no longer blocked');
tapBtn(3);       // JUMP
tapBtn(1);       // TALK
tapBtn(0);       // RAMSI
tapBtn(4);       // TOOL<
tapBtn(5);       // TOOL>
// MAP -> START (button 9)  — the exact case the user hit
const mapStep = STEPS.findIndex(s => s.key === 'Escape');
H.assert(GPP.setup.i === mapStep, 'reached the MAP step');
tapBtn(9);       H.assert(GPP.setup.map['9'] === 'Escape' && GPP.setup.i === mapStep + 1, 'START (button 9) BINDS to MAP (the reported bug is fixed)');
// BACKPACK -> SELECT (button 8)
tapBtn(8);       H.assert(GPP.setup.map['8'] === 'i', 'SELECT (button 8) binds to BACKPACK');
H.assert(GPP.setup.done, 'all 12 steps done -> the ALL SET screen');

// the DONE screen: a pad press starts playing (and never crashes on an out-of-range step)
setBtn(0, true); poll();
H.assert(Game.state !== 'padsetup', 'a button on the ALL SET screen leaves setup');
setBtn(0, false); poll();
// the whole custom map committed + persisted
H.assert(GPP.map['9'] === 'Escape' && GPP.map['ax1-'] === 'ArrowUp', 'the custom map (incl. START->MAP and axis UP) is live');

// and it actually WORKS in play: START now opens the map, axis1-up now walks up
Game.loadMap('vale');
let opened = 0; const _esc = Game.state;
setBtn(9, true); H.step(1); setBtn(9, false); H.step(1);
H.assert(Game.state === 'worldmap' || Game.state === 'world3map' || Game.state === 'burrowmap', 'in play, the rebound START opens the MAP');
Game.state = 'play';

// ---- disconnect clears held keys (no stuck movement) ----
Game.Gamepad.resetMap();               // back to defaults for this independent check
setAxis(0, -1); poll(); H.assert(NQ.keyHeld('ArrowLeft'), 'holding left again');
pad.connected = false; poll();
H.assert(!Game.Gamepad.connected && !NQ.keyHeld('ArrowLeft'), 'unplugging releases everything');
pad.connected = true;

console.log('GAMEPAD PASS — dpad (axes+buttons), SNES faces, L/R tool swap, edge-fire, setup bind, hot-unplug');
