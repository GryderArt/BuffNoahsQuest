"use strict";
// ============== the PERSISTENT BOSS HINT BAR (reading-level: age 6) ==============
// Timed banners vanish before a young reader finishes them. During any boss fight a
// short, BIG hint stays pinned to the bottom of the view and updates with the fight:
// what to do RIGHT NOW, in <=5 words, with key-cap badges ([1]..[5], Z, C, X) so the
// player can match symbols instead of reading sentences. GNASHARA shows the recipe
// for each head; wardens/sky bosses show the two-step co-op (Ramsi close -> tool).

const HINT_TOOL = { mitts: ['1', 'GRAB IT!'], net: ['2', 'NET IT!'], harpoon: ['3', 'HARPOON IT!'], bone: ['5', 'BONE IT!'] };
Game.bossHintLine = function () {
  const b = this.boss;
  if (!b || !b.awake || b.caughtAnim > 0) return null;
  // ---- GNASHARA: one recipe per head ----
  if (b.gnashara) {
    if (b.active >= b.heads.length) return { keys: [], text: 'ALL DOWN! SUPER RAMSI ENDS IT!', hot: true };
    const head = b.heads[b.active], hurtNow = head.hp < 2;
    if (head.weak === 'ramsi') return { keys: [], text: (hurtNow ? 'AGAIN! ' : '') + 'WALK RAMSI INTO THE HEAD!', hot: hurtNow };
    const t = { ram: ['1', 'MITTS! GET CLOSE!'], net: ['2', 'NET! GET CLOSE!'], harpoon: ['3', 'HARPOON THE HEAD!'], bone: ['5', 'THROW THE BONE!'] }[head.weak];
    return { keys: [t[0], 'Z'], text: (hurtNow ? 'AGAIN! ' : '') + t[1], hot: hurtNow };
  }
  // ---- GNASH: phase move, then the tool ----
  if (b.gnash) {
    const tool = ['bone', 'harpoon', 'bone'][b.phase - 1] || 'bone';
    if (b.shieldT > 0) { const t = HINT_TOOL[tool]; return { keys: [t[0], 'Z'], text: 'NOW! ' + t[1], hot: true }; }
    return { keys: ['C'], text: b.phase === 2 ? 'PRESS C! RAMSI ROLLS!' : 'PRESS C! RAMSI POUNDS!' };
  }
  // ---- wardens + sky bosses: the co-op two-step, state-aware ----
  if (b.warden || b.sky) {
    const tool = (b.cfg && b.cfg.tool) || 'net';
    const t = HINT_TOOL[tool] || ['2', 'NET IT!'];
    if (b.shieldT > 0) return { keys: [t[0], 'Z'], text: 'NOW! ' + t[1], hot: true };
    if (b.name === 'geode' && b.lit === 0) return { keys: ['C'], text: 'TOO DARK! LIGHT IT UP!' };
    if (b.name === 'grub' && b.surf <= 0) return { keys: [], text: 'WATCH THE MOUND... WAIT!' };
    if (b.name === 'mottle' && b.surf <= 0) return { keys: [], text: 'WATCH THE MOLEHILLS... WAIT!' };
    if (b.name === 'thornback' && b.stuckT > 0) return { keys: [t[0], 'Z'], text: 'IT IS STUCK! ' + t[1], hot: true };
    if (b.name === 'sparkhorn' && b.ss === 'call') return { keys: [], text: 'RUN! LIGHTNING COMES!' };
    if (b.name === 'pufflord' && b.hid) return { keys: [], text: 'FIND THE CROWN!' };
    return { keys: [], text: 'BRING RAMSI CLOSE!' };
  }
  return null;   // W1 solo bosses keep their own coaching toasts
};

(function () {
  const orig = UI.drawBannersToasts;
  UI.drawBannersToasts = function (c, dt) {
    // the pinned hint draws FIRST so banners/toasts layer above it
    if (Game.state === 'play' || Game.state === 'dialog') {
      const h = Game.bossHintLine && Game.bossHintLine();
      if (h) {
        const size = 10, capW = 13, pad = 8;
        const w = pad * 2 + h.keys.length * (capW + 3) + h.text.length * (size * 0.62) + 2;
        const x = (VW - w) / 2, y = VH - 42, bh = 18;   // sits ABOVE the toast line: both stay readable
        c.fillStyle = 'rgba(20,12,30,.94)'; c.fillRect(x, y, w, bh);
        const pulse = 0.6 + 0.4 * Math.sin(Game.time * (h.hot ? 9 : 4));
        c.strokeStyle = h.hot ? 'rgba(126,240,160,' + pulse.toFixed(2) + ')' : 'rgba(248,208,72,' + (0.5 + 0.3 * pulse).toFixed(2) + ')';
        c.lineWidth = 2; c.strokeRect(x + 1, y + 1, w - 2, bh - 2); c.lineWidth = 1;
        let cx = x + pad;
        for (const k of h.keys) {                     // big key-caps a non-reader can match
          c.fillStyle = '#f8d048'; c.fillRect(cx, y + 3, capW, capW - 1);
          c.strokeStyle = '#241a33'; c.strokeRect(cx + 0.5, y + 3.5, capW - 1, capW - 2);
          drawText(c, k, cx + capW / 2, y + 5, 9, '#241a33', false, 'center');
          cx += capW + 3;
        }
        drawText(c, h.text, cx + 2, y + 5, size, h.hot ? '#9df5b4' : '#ffffff', '#241a33');
      }
    }
    orig.call(this, c, dt);
  };
})();
if (typeof G !== 'undefined' && G.NQ) { G.NQ.bossHintLine = () => Game.bossHintLine(); }
