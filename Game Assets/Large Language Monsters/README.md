# Large Language Monsters: Right Tool, Right Job

A tiny, original monster-collecting RPG that teaches AI literacy. Players meet real AI
models, clear classroom-flavoured tasks by matching each one to the right helper, and
finish with a printable "AI Literacy Trainer" certificate. A full run takes 10 to 15 minutes.

## Play

Open `index.html` in any modern browser, or put the folder on any static host. There is
no build step, no framework and no external files.

| Action | Keyboard | Touch |
|---|---|---|
| Move | Arrow keys or WASD | D-pad |
| A (confirm, talk) | Z or Enter | A button, or tap the screen |
| B (back, switch helper) | X, B or Backspace | B button |
| Menu | Esc or Space | MENU |
| Sound (off by default) | M | SOUND |

On phones and tablets the page becomes a handheld console: the whole screen is the
device, with a tilting D-pad, A and B buttons, and MENU and SOUND keys. It works in
portrait and landscape. For a full-screen feel, use the browser's "Add to Home Screen".

Claude's model card has a size dial: open the card and press A (Z on a keyboard) to
switch between Haiku, Sonnet and Opus and watch the stats change.

Progress saves automatically in the browser. "CARD BINDER" on the title screen lets
anyone browse every model card without playing.

## Updating the facts (no programming needed)

Every model fact lives in **`js/models.js`**. Open it in any text editor, change the text
between the quotes, save, and reload the page.

- `factsAsOf` is the date shown on the title screen, in the binder and on the certificate.
- Each model has `knownFor`, `caveat` and `classroom` lines. Longer text simply flows onto
  an extra card page.
- `stats` run from 1 to 5. `thrift` 5 means cheapest.
- `local` is `"yes"`, `"server"` (big servers only) or `"no"`.
- `reads` and `makes` list what a model takes in and puts out: `"text"`, `"image"`,
  `"audio"`, `"video"`.
- Keep `short` names to about 10 characters and use plain keyboard characters only.

These values also drive the battles, so changing a stat changes how that helper performs.

## Files

```
index.html      page, touch controls, name prompt, certificate
style.css       layout for phones, tablets and desktop; print styles
js/models.js    ALL model facts (edit this one)
js/content.js   maps, characters, tasks and dialogue
js/sprites.js   all pixel art, drawn in code
js/audio.js     original chiptune and sound effects (Web Audio)
js/engine.js    canvas, pixel font, input, saving
js/game.js      game rules and screens
```

Open `index.html?sheet` to see every sprite on one sheet.

## Notes

This is an original parody made for teaching. All art, music and code are original. It
is not affiliated with any AI company or game company; model names belong to their makers.
Facts were current as of November 2026. The field moves fast, so verify before you teach.
