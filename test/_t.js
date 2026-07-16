const H=require('./harness'); const {NQ}=H;
const TA = NQ; // need TileArt — exposed?
// TileArt isn't on NQ; infer from how propSpriteFor returns it via render. Instead read globals via Sprites? trees are TileArt.
// Try to access via a render: just report the loaded ext-art tree canvases through Sprites? Not stored there.
// Fallback: print the sprite the renderer uses by calling propSpriteFor through NQ if available.
console.log('has propSpriteFor:', typeof NQ.propSpriteFor);
