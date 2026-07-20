#!/usr/bin/env python3
"""Build BuffNoahsQuest_v4.html from src/ modules.
Also emits game.js (concatenated source) for the node test harness."""
import os, time, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')

files = sorted(f for f in os.listdir(SRC) if f.endswith('.js'))
parts = []
for f in files:
    with open(os.path.join(SRC, f), encoding='utf-8') as fh:
        code = fh.read()
    if '\x00' in code:
        raise SystemExit(f'NUL bytes detected in {f} - refusing to build')
    parts.append(f'// ======== {f} ========\n' + code)
js = '\n'.join(parts)


# ---- embed external art from assets/*.png into EXT_ART ----
def _png_ok(d):
    """True only if d is a complete PNG (has image data + clean end)."""
    if d[:8] != b"\x89PNG\r\n\x1a\n": return False
    i, has_idat, has_iend = 8, False, False
    while i + 8 <= len(d):
        ln = struct.unpack(">I", d[i:i+4])[0]; typ = d[i+4:i+8]
        if i + 12 + ln > len(d): return False     # chunk runs past EOF -> truncated
        if typ == b"IDAT": has_idat = True
        if typ == b"IEND": has_iend = True; break
        i += 12 + ln
    return has_idat and has_iend

ASSETS = os.path.join(HERE, 'assets')
if os.path.isdir(ASSETS):
    import base64, json, struct
    art = {}; bad = []
    for f in sorted(os.listdir(ASSETS)):
        if f.lower().endswith('.big.png'):
            continue                                  # *.big.png are hi-res SOURCES, not game art
        if f.lower().endswith('.png'):
            data = open(os.path.join(ASSETS, f), 'rb').read()
            if not _png_ok(data):
                bad.append(f); continue                # skip corrupt -> game keeps built-in art
            art[f[:-4]] = base64.b64encode(data).decode()
    if bad:
        print('!! WARNING: skipped %d CORRUPT/TRUNCATED PNG(s): %s' % (len(bad), ', '.join(bad)))
        print('   (re-export these; the game falls back to built-in art for them)')
    if art:
        js = js.replace('let EXT_ART = {};', 'let EXT_ART = ' + json.dumps(art) + ';')
        print('embedded %d external art assets' % len(art))

# ---- embed level-editor map edits from customlevels/*.edit.json ----
CUSTOM = os.path.join(HERE, 'customlevels')
if os.path.isdir(CUSTOM):
    import json as _json
    edits = {}
    for f in sorted(os.listdir(CUSTOM)):
        if not f.endswith('.edit.json'): continue
        try:
            d = _json.load(open(os.path.join(CUSTOM, f), encoding='utf-8'))
            mid = d.get('id')
            if not mid or 'tiles' not in d:
                print('!! SKIP %s (needs {id, tiles})' % f); continue
            edits[mid] = d
        except Exception as e:
            print('!! SKIP %s (bad json: %s)' % (f, e))
    if edits:
        js = js.replace('let MAP_EDITS = {};', 'let MAP_EDITS = ' + _json.dumps(edits) + ';')
        print('embedded %d map edit(s): %s' % (len(edits), ', '.join(sorted(edits))))

stamp = time.strftime('%Y-%m-%d %H:%M')
h = hashlib.sha1(js.encode()).hexdigest()[:8]
js = js.replace('__BUILD_STAMP__', f'v4.3 {stamp} [{h}]')

with open(os.path.join(HERE, 'game.js'), 'w', encoding='utf-8') as f:
    f.write(js)

HEAD = (
    '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    "<title>Buff Noah's Quest - VERSION 4</title>\n<style>\n"
    '  html,body { margin:0; padding:0; background:#1a1426; height:100%; overflow:hidden; }\n'
    '  #wrap { display:flex; align-items:center; justify-content:center; height:100vh; }\n'
    '  canvas { image-rendering:pixelated; image-rendering:crisp-edges; outline:none; }\n'
    '</style>\n</head>\n<body>\n'
    '<div id="wrap"><canvas id="game" tabindex="0"></canvas></div>\n'
    '<script>window.NQ_MAP_OVERRIDE=null;</script>\n'
    '<script src="worldmap_nodes.js" onerror="void 0"></script>\n'
    '<script>\n'
)
TAIL = '\n</script>\n</body>\n</html>\n'
html = HEAD + js + TAIL

with open(os.path.join(HERE, 'BuffNoahsQuest_v4.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print('built BuffNoahsQuest_v4.html (%d bytes) + game.js' % len(html))
