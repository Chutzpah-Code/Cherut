// Ports docs/learning/Learning Module.html's design to React: one scoped
// stylesheet (classes prefixed `lrn-` to avoid colliding with Mantine/other
// dashboard pages) instead of forcing these exact tokens/animations through
// Mantine component props — same precedent as components/shell/AppMock.tsx's
// MockStyles() for the public site. Rendered once via the route's layout.tsx.
export function LearningStyles() {
  return (
    <style>{`
      .lrn {
        --lrn-ink: #14141C;
        --lrn-ink-2: #3A3D4E;
        --lrn-mute: #6B7085;
        --lrn-faint: #9AA0B4;
        --lrn-bg: #F3F5F9;
        --lrn-line: #E6E8F0;
        --lrn-line-2: #EEF0F5;
        --lrn-soft: #FAFBFD;
        --lrn-acc: #3B5BF6;
        --lrn-acc-soft: #E8EDFF;
        --lrn-acc-d: #1B2E8F;
        --lrn-ok: #22A06B;
        --lrn-ease: cubic-bezier(.23,1,.32,1);
        font-family: var(--font-geist-sans), system-ui, sans-serif;
        color: var(--lrn-ink);
        font-size: 14px;
        line-height: 1.45;
      }
      .lrn-mono { font-family: var(--font-geist-mono), monospace; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; }

      /* Generic progress bar */
      .lrn-bar { height: 6px; background: var(--lrn-line-2); border-radius: 999px; overflow: hidden; }
      .lrn-bar i { display: block; height: 100%; background: var(--lrn-acc); border-radius: 999px; transition: width .6s var(--lrn-ease); }

      /* Buttons */
      .lrn-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 18px; border-radius: 9px; font-weight: 500; font-size: 13.5px; transition: background .2s, border-color .2s, color .2s, transform .15s var(--lrn-ease); cursor: pointer; border: none; }
      .lrn-btn:active { transform: scale(.97); }
      .lrn-btn-acc { background: var(--lrn-acc); color: #fff; }
      .lrn-btn-acc:hover { background: var(--lrn-acc-d); }
      .lrn-btn-w { background: #fff; color: var(--lrn-ink); }
      .lrn-btn-w:hover { background: #F0F2F8; }
      .lrn-btn-line { background: transparent; border: 1px solid var(--lrn-line); color: var(--lrn-ink); }
      .lrn-btn-line:hover { border-color: #C9CDDA; background: var(--lrn-soft); }

      /* Catalog — header */
      .lrn-h1 { font-size: clamp(22px, 4vw, 30px); font-weight: 600; letter-spacing: -.02em; margin: 0; }
      .lrn-sub { color: var(--lrn-mute); margin-top: 4px; }

      /* Catalog — resume card */
      .lrn-resume { margin-top: 24px; display: grid; grid-template-columns: minmax(0,1.1fr) minmax(0,1fr); border-radius: 18px; overflow: hidden; background: radial-gradient(120% 120% at 0% 0%, #3E63F5 0%, var(--lrn-acc-d) 55%, #0A0D1E 100%); color: #fff; position: relative; isolation: isolate; }
      .lrn-resume::before { content: ""; position: absolute; inset: 0; z-index: -1; background-image: linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px); background-size: 48px 48px; mask-image: linear-gradient(90deg,#000,transparent 70%); -webkit-mask-image: linear-gradient(90deg,#000,transparent 70%); }
      .lrn-resume-l { padding: 28px 32px; display: flex; flex-direction: column; gap: 12px; }
      .lrn-resume-l .lrn-mono { color: #8FA6FF; }
      .lrn-resume-l h2 { font-size: 26px; font-weight: 600; letter-spacing: -.03em; line-height: 1.1; margin: 0; }
      .lrn-resume-l p { color: rgba(255,255,255,.7); max-width: 420px; margin: 0; }
      .lrn-resume-l .lrn-bar { background: rgba(255,255,255,.14); max-width: 360px; }
      .lrn-resume-l .lrn-bar i { background: #fff; }
      .lrn-resume-l .lrn-row { display: flex; align-items: center; gap: 14px; margin-top: 4px; flex-wrap: wrap; }
      .lrn-resume-l small { color: rgba(255,255,255,.6); font-size: 12.5px; }
      .lrn-resume-r { position: relative; margin: 18px 18px 18px 0; border-radius: 12px; overflow: hidden; background: #0E1230; border: 1px solid rgba(255,255,255,.14); min-height: 200px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
      .lrn-resume-r .lrn-play { width: 56px; height: 56px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; transition: transform .25s var(--lrn-ease); box-shadow: 0 10px 30px rgba(0,0,0,.35); }
      .lrn-resume-r:hover .lrn-play { transform: scale(1.06); }
      .lrn-resume-r .lrn-meta { position: absolute; left: 16px; bottom: 14px; right: 16px; display: flex; justify-content: flex-end; font-size: 12px; color: rgba(255,255,255,.75); }
      .lrn-resume-r .lrn-tl { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,.15); }
      .lrn-resume-r .lrn-tl i { display: block; height: 100%; background: #8FA6FF; }
      .lrn-play::after { content: ""; border-left: 15px solid var(--lrn-acc-d); border-top: 9px solid transparent; border-bottom: 9px solid transparent; margin-left: 4px; }

      /* Catalog — filters */
      .lrn-sec-h { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
      .lrn-sec-h h3 { font-size: 16px; font-weight: 600; margin: 0; }
      .lrn-chips { display: flex; gap: 4px; background: #F3F4F8; padding: 3px; border-radius: 9px; }
      .lrn-chips button { padding: 6px 12px; border-radius: 7px; font-size: 12.5px; font-weight: 500; color: var(--lrn-mute); transition: background .2s, color .2s; border: none; background: transparent; cursor: pointer; }
      .lrn-chips button.on { background: #fff; color: var(--lrn-ink); box-shadow: 0 1px 2px rgba(20,20,40,.08); }

      /* Catalog — grid + cards */
      .lrn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-top: 16px; }
      .lrn-cc { border: 1px solid var(--lrn-line); border-radius: 14px; overflow: hidden; background: #fff; display: flex; flex-direction: column; transition: transform .3s var(--lrn-ease), box-shadow .3s, border-color .3s; cursor: pointer; text-align: left; }
      .lrn-cc:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -24px rgba(27,46,143,.35); border-color: #D6DBEA; }
      .lrn-cc.locked { opacity: .7; cursor: default; }
      .lrn-cc.locked:hover { transform: none; box-shadow: none; border-color: var(--lrn-line); }
      .lrn-cover { height: 124px; position: relative; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; color: #fff; overflow: hidden; }
      .lrn-cover .lrn-k { font-family: var(--font-geist-mono), monospace; font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; opacity: .75; }
      .lrn-cover .lrn-n { font-size: 20px; font-weight: 600; letter-spacing: -.03em; line-height: 1.05; max-width: 85%; position: relative; z-index: 1; }
      .lrn-cover::after { content: ""; position: absolute; right: -30px; bottom: -40px; width: 150px; height: 150px; border-radius: 50%; border: 22px solid rgba(255,255,255,.12); }
      .lrn-cover .lrn-tag { position: absolute; top: 14px; right: 14px; font-family: var(--font-geist-mono), monospace; font-size: 10px; text-transform: uppercase; letter-spacing: .05em; background: rgba(255,255,255,.18); backdrop-filter: blur(6px); padding: 3px 8px; border-radius: 999px; }
      .lrn-cc-b { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
      .lrn-cc-b h4 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
      .lrn-cc-b p { color: var(--lrn-mute); font-size: 13px; margin: 0; }
      .lrn-cc-f { margin-top: auto; display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--lrn-mute); }
      .lrn-cc-f .lrn-bar { flex: 1; }
      .lrn-cc-f b { color: var(--lrn-ink); font-size: 12px; }
      .lrn-st { font-size: 11.5px; font-weight: 600; padding: 3px 9px; border-radius: 999px; white-space: nowrap; }
      .lrn-st.ok { background: #E3F5EC; color: #1A7F55; }
      .lrn-st.new { background: #F3F4F8; color: var(--lrn-mute); }
      .lrn-st.locked { background: #F3F4F8; color: var(--lrn-mute); display: inline-flex; align-items: center; gap: 4px; }
      .lrn-empty { text-align: center; color: var(--lrn-mute); padding: 48px 0; }

      /* Player — header */
      .lrn-back { color: var(--lrn-mute); font-size: 13px; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; }
      .lrn-back:hover { color: var(--lrn-ink); }
      .lrn-ph { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-top: 12px; flex-wrap: wrap; }
      .lrn-ph .lrn-sub { margin-top: 6px; }

      /* Player — layout */
      .lrn-pl { display: grid; grid-template-columns: minmax(0,1fr) 360px; gap: 28px; margin-top: 24px; align-items: start; }
      @media (max-width: 1100px) { .lrn-pl { grid-template-columns: minmax(0,1fr); } .lrn-ol { position: static; } }
      @media (max-width: 860px) { .lrn-resume { grid-template-columns: minmax(0,1fr); } .lrn-resume-r { margin: 0 18px 18px; } }
      @media (max-width: 640px) { .lrn-lh { flex-direction: column; align-items: flex-start !important; } .lrn-pn { grid-template-columns: 1fr; } .lrn-video .lrn-cap h2 { font-size: 18px; } }

      /* Player — video card */
      .lrn-vcard { border: 1px solid var(--lrn-line); border-radius: 16px; overflow: hidden; background: #fff; }
      .lrn-video { position: relative; aspect-ratio: 16/9; background: radial-gradient(80% 110% at 85% 0%, #3E63F5 0%, #1B2E8F 45%, #070A1C 100%); display: flex; align-items: center; justify-content: center; color: #fff; }
      .lrn-video iframe, .lrn-video video { width: 100%; height: 100%; border: 0; object-fit: cover; }
      .lrn-video .lrn-play { width: 72px; height: 72px; border-radius: 50%; background: #fff; display: flex; align-items: center; justify-content: center; transition: transform .25s var(--lrn-ease); box-shadow: 0 14px 40px rgba(0,0,0,.4); }
      .lrn-video .lrn-play::after { border-left-width: 19px; border-top-width: 11px; border-bottom-width: 11px; }
      .lrn-video:hover .lrn-play { transform: scale(1.06); }
      .lrn-video .lrn-cap { position: absolute; bottom: 20px; left: 22px; right: 130px; }
      .lrn-video .lrn-cap .lrn-mono { color: #8FA6FF; }
      .lrn-video .lrn-cap h2 { font-size: 21px; font-weight: 600; letter-spacing: -.03em; margin: 4px 0 0; }
      .lrn-vtime { position: absolute; right: 22px; bottom: 22px; font-family: var(--font-geist-mono), monospace; font-size: 12px; color: rgba(255,255,255,.75); }
      .lrn-vfoot { padding: 14px 18px 16px; display: flex; flex-direction: column; gap: 12px; }
      .lrn-vfoot .lrn-bar { height: 4px; }
      .lrn-vrow { display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 13px; color: var(--lrn-mute); }
      .lrn-lnk { color: var(--lrn-acc); font-weight: 600; font-size: 13px; white-space: nowrap; background: none; border: none; cursor: pointer; padding: 0; }
      .lrn-lnk:hover { text-decoration: underline; text-underline-offset: 3px; }

      /* Player — lesson header / mark complete */
      .lrn-lh { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-top: 20px; }
      .lrn-lh .lrn-mono { color: var(--lrn-acc); }
      .lrn-lh h2 { font-size: 20px; font-weight: 600; letter-spacing: -.025em; margin: 6px 0 0; }
      .lrn-done { display: inline-flex; align-items: center; gap: 10px; height: 38px; padding: 0 14px; border: 1px solid var(--lrn-line); border-radius: 9px; font-weight: 500; font-size: 13px; transition: background .2s, border-color .2s, color .2s; background: #fff; cursor: pointer; flex-shrink: 0; }
      .lrn-done i { width: 18px; height: 18px; border-radius: 50%; border: 1.6px solid #B6BACB; display: flex; align-items: center; justify-content: center; transition: all .2s; font-style: normal; }
      .lrn-done.y { background: #E3F5EC; border-color: #BFE6D2; color: #1A7F55; }
      .lrn-done.y i { background: var(--lrn-ok); border-color: var(--lrn-ok); }
      .lrn-done.y i::after { content: ""; width: 8px; height: 4px; border-left: 2px solid #fff; border-bottom: 2px solid #fff; transform: rotate(-45deg) translate(1px,-1px); }

      /* Player — tabs */
      .lrn-tabs { display: flex; gap: 22px; border-bottom: 1px solid var(--lrn-line); margin-top: 20px; }
      .lrn-tabs button { padding: 10px 0; font-weight: 500; color: var(--lrn-mute); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .2s, border-color .2s; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; font-size: 13.5px; }
      .lrn-tabs button.on { color: var(--lrn-ink); border-color: var(--lrn-acc); }
      .lrn-tp { padding-top: 18px; }
      .lrn-keys { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
      .lrn-keys .k { display: flex; gap: 10px; align-items: baseline; font-size: 13px; color: var(--lrn-ink-2); }
      .lrn-keys .k span:first-child { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--lrn-faint); flex-shrink: 0; }
      .lrn-ex { }
      .lrn-ex h4 { margin: 0 0 4px; font-size: 14px; font-weight: 600; }
      .lrn-ex textarea { width: 100%; min-height: 110px; margin-top: 10px; border: 1px solid var(--lrn-line); border-radius: 10px; padding: 12px; font: inherit; color: var(--lrn-ink); resize: vertical; }
      .lrn-ex textarea:focus { outline: none; border-color: var(--lrn-acc); }
      .lrn-ex .lrn-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 10px; flex-wrap: wrap; }
      .lrn-ex .lrn-saved { font-size: 12px; color: var(--lrn-mute); }

      /* Player — prev/next */
      .lrn-pn { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 28px; max-width: 720px; }
      .lrn-pn button { text-align: left; border: 1px solid var(--lrn-line); border-radius: 12px; padding: 14px 16px; transition: border-color .2s, background .2s; background: #fff; cursor: pointer; }
      .lrn-pn button:hover { border-color: #C9CDDA; background: var(--lrn-soft); }
      .lrn-pn button:disabled { opacity: .4; pointer-events: none; }
      .lrn-pn small { display: block; color: var(--lrn-mute); font-size: 12px; margin-bottom: 2px; }
      .lrn-pn button:last-child { text-align: right; }
      .lrn-pn b { font-size: 13.5px; font-weight: 600; }

      /* Player — modules sidebar */
      .lrn-ol { position: sticky; top: 16px; }
      .lrn-ol-h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
      .lrn-ol-h b { font-size: 14px; font-weight: 600; }
      .lrn-mod { border: 1px solid var(--lrn-line); border-radius: 12px; background: var(--lrn-soft); margin-bottom: 8px; overflow: hidden; transition: background .2s, border-color .2s, box-shadow .2s; }
      .lrn-mod.open { background: #fff; border-color: #D3D9EA; box-shadow: 0 10px 30px -18px rgba(27,46,143,.3); }
      .lrn-mod > button { width: 100%; display: grid; grid-template-columns: 28px minmax(0,1fr) auto; gap: 10px; align-items: center; text-align: left; padding: 13px 16px; background: none; border: none; cursor: pointer; }
      .lrn-mod .lrn-n { font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--lrn-faint); }
      .lrn-mod b { display: block; font-size: 13.5px; font-weight: 600; }
      .lrn-mod small { color: var(--lrn-mute); font-size: 12px; }
      .lrn-mod .lrn-pc { font-size: 11.5px; font-weight: 600; color: var(--lrn-mute); flex-shrink: 0; }
      .lrn-mod .lrn-pc.go { color: var(--lrn-acc); }
      .lrn-sdot { width: 10px; height: 10px; border-radius: 50%; background: var(--lrn-ok); box-shadow: 0 0 0 3px #E3F5EC; flex-shrink: 0; }
      .lrn-ls { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s var(--lrn-ease); }
      .lrn-mod.open .lrn-ls { grid-template-rows: 1fr; }
      .lrn-ls > div { overflow: hidden; }
      .lrn-ls button { width: 100%; display: grid; grid-template-columns: 28px minmax(0,1fr) auto; gap: 10px; align-items: center; text-align: left; padding: 9px 16px; font-size: 13px; transition: background .2s; background: none; border: none; cursor: pointer; }
      .lrn-ls button:hover { background: var(--lrn-soft); }
      .lrn-ls button.cur { background: var(--lrn-acc-soft); }
      .lrn-ls button.cur span.lrn-lt { color: var(--lrn-acc); font-weight: 600; }
      .lrn-ls span.lrn-lt { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .lrn-ls i { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #C4C8D6; margin-left: 6px; display: flex; align-items: center; justify-content: center; font-style: normal; flex-shrink: 0; }
      .lrn-ls i.y { background: var(--lrn-ok); border-color: var(--lrn-ok); }
      .lrn-ls i.y::after { content: ""; width: 6px; height: 3px; border-left: 1.6px solid #fff; border-bottom: 1.6px solid #fff; transform: rotate(-45deg) translate(1px,-1px); }
      .lrn-ls em { font-style: normal; font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--lrn-faint); flex-shrink: 0; }

      /* Not-enrolled / locked states (extend beyond the prototype — real data has these) */
      .lrn-pace { border: 1px solid var(--lrn-line); border-radius: 14px; padding: 20px; }
      .lrn-pace-seg { display: flex; gap: 4px; background: #F3F4F8; padding: 3px; border-radius: 9px; margin-top: 10px; width: fit-content; }
      .lrn-pace-seg button { padding: 8px 20px; border-radius: 7px; font-size: 13px; font-weight: 500; color: var(--lrn-mute); border: none; background: transparent; cursor: pointer; transition: background .2s, color .2s; }
      .lrn-pace-seg button.on { background: #fff; color: var(--lrn-ink); box-shadow: 0 1px 2px rgba(20,20,40,.08); }
      .lrn-locked { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 56px 0; text-align: center; }
    `}</style>
  );
}
