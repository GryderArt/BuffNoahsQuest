"use strict";
// ================= chiptune audio: zone BGM loops + event jingles =================
const MP3_SONGS = { vale: 1, coast: 1, wastes: 1, canyon: 1 };   // main-map music = the classic BGM mp3
const Audio2 = {
  ac: null, musicOn: true, gain: null, bgmTimer: null, curSong: null, mp3El: null, unlocked: false,
  ensure() {
    if (IS_NODE) return;
    if (!this.mp3El) {
      try {
        if (G.Audio && typeof BGM_MP3_B64 !== 'undefined') {
          this.mp3El = new G.Audio('data:audio/mpeg;base64,' + BGM_MP3_B64);
          this.mp3El.loop = true; this.mp3El.volume = 0.5;
        }
      } catch (e) {}
    }
    if (this.ac) return;
    try {
      const AC = G.AudioContext || G.webkitAudioContext;
      if (!AC) return;
      this.ac = new AC();
      this.gain = this.ac.createGain(); this.gain.gain.value = 0.16; this.gain.connect(this.ac.destination);
    } catch (e) { /* audio unavailable */ }
  },
  // mute everything while the tab/window is in the background
  setFocus(focused) {
    this.focused = focused;
    if (!focused) {
      if (this.mp3El) { try { this.mp3El.pause(); } catch (e) {} }
      try { if (this.ac && this.ac.state === 'running') this.ac.suspend(); } catch (e) {}
    } else {
      try { if (this.ac && this.ac.state === 'suspended' && this.unlocked) this.ac.resume(); } catch (e) {}
      if (this.mp3El && this.musicOn && this.unlocked && MP3_SONGS[this.curSong]) { try { this.mp3El.play().catch(() => {}); } catch (e) {} }
    }
  },
  unlock() {
    this.ensure(); this.unlocked = true;
    if (this.focused === false) return;   // stay quiet in background tabs
    try { if (this.ac && this.ac.state === 'suspended') this.ac.resume(); } catch (e) {}
    if (this.mp3El && this.musicOn && MP3_SONGS[this.curSong]) { try { this.mp3El.play().catch(() => {}); } catch (e) {} }
  },
  note(freq, t0, dur, type, vol) {
    if (!this.ac) return;
    const o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.5, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(this.gain);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },
  noise(t0, dur, vol) {
    if (!this.ac) return;
    const n = this.ac.sampleRate * dur, buf = this.ac.createBuffer(1, n, this.ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = this.ac.createBufferSource(); s.buffer = buf;
    const g = this.ac.createGain(); g.gain.value = vol || 0.25;
    s.connect(g); g.connect(this.gain); s.start(t0);
  },
  // freq helper: semitone offsets from A4
  f(n) { return 440 * Math.pow(2, n / 12); },
  jingle(name) {
    this.ensure(); if (!this.ac) return;
    const t = this.ac.currentTime + 0.01, F = this.f.bind(this);
    const seqs = {
      capture: [[0,.1,7],[ .1,.1,12],[ .2,.1,16],[ .3,.25,19]],
      heart:   [[0,.12,4],[ .12,.12,9],[ .24,.3,16]],
      gear:    [[0,.13,0],[ .13,.13,4],[ .26,.13,7],[ .39,.13,12],[ .52,.35,16]],
      key:     [[0,.1,12],[ .12,.2,19]],
      door:    [[0,.15,-5],[ .15,.25,0]],
      denied:  [[0,.15,-2],[ .18,.3,-7]],
      hurt:    [[0,.12,-9],[ .1,.18,-14]],
      coin:    [[0,.07,16],[ .07,.12,21]],
      gem:     [[0,.08,12],[ .08,.08,16],[ .16,.16,24]],
      trade:   [[0,.1,0],[ .1,.1,7],[ .2,.1,4],[ .3,.2,12]],
      jump:    [[0,.1,2],[ .06,.1,9]],
      dive:    [[0,.12,2],[ .12,.12,-3],[ .24,.2,-8]],
      bossintro:[[0,.2,-12],[ .22,.2,-12],[ .44,.2,-9],[ .66,.4,-5]],
      fanfare: [[0,.14,0],[ .14,.14,4],[ .28,.14,7],[ .42,.14,12],[ .56,.14,16],[ .7,.18,19],[ .88,.5,24],[ .88,.5,16],[ .88,.5,7]],
      bosswin: [[0,.12,7],[ .12,.12,12],[ .24,.12,16],[ .36,.12,19],[ .48,.4,24]],
      flap:    [[0,.08,7],[ .06,.1,14]],
      push:    [[0,.07,-17],[ .05,.09,-22]],
      rumble:  [[0,.18,-22],[ .16,.22,-26],[ .34,.4,-29]],
      cage:    [[0,.1,-2],[ .1,.15,5]],
      talk:    [[0,.05,12]],
      step:    [],
      // --- opening-cutscene stingers (12b_intro) ---
      dawnrise:   [[0,.18,0],[ .18,.18,4],[ .36,.5,9]],
      thunderroll:[[0,.6,-31],[ .15,.5,-34],[ .4,.7,-29]],
      swoopdown:  [[0,.08,21],[ .07,.08,14],[ .14,.08,7],[ .21,.14,0],[ .33,.2,-7]],
      snatch:     [[0,.06,24],[ .06,.06,12],[ .12,.22,-5]],
      sadsting:   [[0,.28,4],[ .3,.3,0],[ .62,.6,-5]],
      bravesting: [[0,.12,0],[ .12,.12,7],[ .24,.36,12]],
    };
    const s = seqs[name]; if (!s) return;
    const wave = (name === 'hurt' || name === 'denied' || name === 'thunderroll') ? 'sawtooth'
      : (name === 'sadsting' || name === 'dawnrise') ? 'triangle' : 'square';
    for (const [dt, dur, semi] of s) this.note(F(semi), t + dt, dur, wave, 0.5);
    if (name === 'capture') this.noise(t + 0.3, 0.3, 0.18);
    if (name === 'thunderroll') { this.noise(t, 0.9, 0.5); this.noise(t + 0.45, 0.8, 0.3); }   // the CRACK + rolling tail
  },
  // --- BGM: simple looping pattern per zone ---
  SONGS: {
    vale:   { tempo: 132, bass: [-24,-17,-19,-12], mel: [0,4,7,4, 9,7,4,2, 0,4,7,12, 9,7,4,2], type:'square' },
    coast:  { tempo: 116, bass: [-19,-12,-17,-10], mel: [2,6,9,6, 11,9,6,4, 2,6,9,14, 11,9,6,4], type:'triangle' },
    deep:   { tempo: 88,  bass: [-29,-29,-26,-26], mel: [-5,-1,2,-1, 4,2,-1,-5, -5,-1,2,7, 4,2,-1,-3], type:'sine' },
    wastes: { tempo: 100, bass: [-26,-26,-21,-23], mel: [-2,1,5,1, 8,5,1,-2, -2,1,5,10, 8,5,1,3], type:'sawtooth' },
    canyon: { tempo: 124, bass: [-22,-15,-17,-10], mel: [5,9,12,9, 14,12,9,7, 5,9,12,17, 14,12,9,7], type:'square' },
    dungeon:{ tempo: 108, bass: [-26,-24,-26,-22], mel: [-3,0,2,0, 5,2,0,-3, -3,0,2,5, 7,5,2,0], type:'square' },
    boss:   { tempo: 152, bass: [-26,-26,-19,-19], mel: [-2,3,-2,5, -2,3,-2,7, -2,3,-2,5, 8,7,5,3], type:'sawtooth' },
    road:   { tempo: 148, bass: [-17,-12,-15,-10], mel: [7,7,12,7, 14,12,9,7, 9,9,14,9, 16,14,12,9], type:'square' },
    title:  { tempo: 96,  bass: [-24,-19,-17,-12], mel: [4,7,12,7, 16,12,7,4, 4,7,12,16, 19,16,12,7], type:'square' },
    // sparse, low and uneasy — the sky-turns-dark beats of the opening
    storm:  { tempo: 72,  bass: [-33,-33,-29,-31], mel: [null,-9,null,-12, null,-7,null,-9, null,-5,null,-9, null,-12,null,-14], type:'sawtooth' },
  },
  playSong(name) {
    this.ensure();
    if (this.curSong === name) return;
    this.curSong = name;
    if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
    // overworld zones share the classic BGM mp3; everything else is chiptune
    if (MP3_SONGS[name]) {
      if (this.mp3El && this.musicOn && this.unlocked && this.focused !== false) { try { this.mp3El.currentTime = 0; this.mp3El.play().catch(() => {}); } catch (e) {} }
      return;
    }
    if (this.mp3El) { try { this.mp3El.pause(); } catch (e) {} }
    if (!this.ac || !this.musicOn) return;
    const song = this.SONGS[name]; if (!song) return;
    const beat = 60 / song.tempo / 2; let step = 0;
    const tick = () => {
      if (!this.musicOn || this.curSong !== name) return;
      const t = this.ac.currentTime + 0.03, F = this.f.bind(this);
      const m = song.mel[step % song.mel.length];
      if (m !== null) this.note(F(m), t, beat * 0.9, song.type, 0.32);
      if (step % 4 === 0) this.note(F(song.bass[(step / 4) % song.bass.length]), t, beat * 3.4, 'triangle', 0.4);
      if (step % 8 === 4) this.noise(t, 0.05, 0.06);
      step++;
    };
    this.bgmTimer = setInterval(tick, beat * 1000);
  },
  toggle() {
    this.ensure(); this.musicOn = !this.musicOn;
    if (!this.musicOn) {
      if (this.bgmTimer) { clearInterval(this.bgmTimer); this.bgmTimer = null; }
      if (this.mp3El) { try { this.mp3El.pause(); } catch (e) {} }
    } else { const s = this.curSong; this.curSong = null; this.playSong(s || 'vale'); }
    return this.musicOn;
  }
};
