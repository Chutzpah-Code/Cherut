// Ports docs/admin/Admin.html's design to React: one scoped stylesheet
// (classes prefixed `adm-`) instead of fighting Mantine's prop-driven
// styling — same precedent as components/shell/AppMock.tsx's MockStyles()
// and app/dashboard/learning/components/LearningStyles.tsx. Rendered once
// via the route's layout.tsx.
export function AdminStyles() {
  return (
    <style>{`
      .adm {
        --adm-ink: #14141C;
        --adm-ink-2: #3A3D4E;
        --adm-mute: #6B7085;
        --adm-faint: #9AA0B4;
        --adm-bg: #F3F5F9;
        --adm-line: #E6E8F0;
        --adm-line-2: #EEF0F5;
        --adm-soft: #FAFBFD;
        --adm-acc: #3B5BF6;
        --adm-acc-soft: #E8EDFF;
        --adm-acc-d: #1B2E8F;
        --adm-ok: #22A06B;
        --adm-ok-soft: #E3F5EC;
        --adm-warn: #C27A12;
        --adm-warn-soft: #FDF3E1;
        --adm-bad: #D23B3B;
        --adm-bad-soft: #FCE9E9;
        --adm-ease: cubic-bezier(.23,1,.32,1);
        font-family: var(--font-geist-sans), system-ui, sans-serif;
        color: var(--adm-ink);
        font-size: 14px;
        line-height: 1.45;
        background: var(--adm-bg);
      }
      .adm-mono { font-family: var(--font-geist-mono), monospace; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; }

      /* Shell */
      .adm-app { display: grid; grid-template-columns: 232px minmax(0,1fr); min-height: 100vh; }
      .adm-sb { position: sticky; top: 0; height: 100vh; padding: 20px 14px; display: flex; flex-direction: column; gap: 4px; border-right: 1px solid var(--adm-line); background: #F7F8FC; }
      .adm-brand { display: flex; align-items: center; gap: 10px; padding: 4px 10px 20px; font-weight: 600; font-size: 16px; letter-spacing: -.02em; }
      .adm-brand svg { color: var(--adm-acc); }
      .adm-brand .adm-tag { margin-left: auto; }
      .adm-sb nav { display: flex; flex-direction: column; gap: 2px; }
      .adm-sb nav button, .adm-sb nav a { display: flex; align-items: center; gap: 11px; height: 38px; padding: 0 10px; border-radius: 9px; color: var(--adm-ink-2); font-weight: 500; text-align: left; transition: background .2s, color .2s; text-decoration: none; }
      .adm-sb nav button:hover, .adm-sb nav a:hover { background: #EEF0F7; color: var(--adm-ink); }
      .adm-sb nav button.on, .adm-sb nav a.on { background: #fff; color: var(--adm-ink); box-shadow: 0 1px 2px rgba(20,20,28,.06), 0 0 0 1px var(--adm-line); }
      .adm-sb nav button.on svg, .adm-sb nav a.on svg { color: var(--adm-acc); }
      .adm-sb nav .adm-n { margin-left: auto; font-family: var(--font-geist-mono), monospace; font-size: 11px; color: var(--adm-faint); }
      .adm-av { width: 32px; height: 32px; border-radius: 50%; background: var(--adm-acc-soft); color: var(--adm-acc); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 12px; flex: none; }
      .adm-main { padding: 28px 32px 48px; }
      .adm-panel { background: #fff; border-radius: 16px; border: 1px solid var(--adm-line); min-height: calc(100vh - 32px); padding: 32px 36px 48px; }

      /* Top bar — admin identity, top-right, same pattern as the user-side dashboard header */
      .adm-topbar { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-bottom: 20px; }
      .adm-topbar-mob { display: none; }
      .adm-topbar-profile { display: flex; align-items: center; gap: 10px; }
      .adm-topbar-text { min-width: 0; }
      .adm-topbar-text b { display: block; font-size: 13px; }
      .adm-topbar-text small { display: block; color: var(--adm-mute); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }

      /* Header */
      .adm-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }
      .adm-crumb { color: var(--adm-faint); margin-bottom: 10px; display: flex; gap: 8px; }
      .adm-h1 { font-size: 28px; font-weight: 600; letter-spacing: -.03em; margin: 0; }
      .adm-sub { color: var(--adm-mute); margin-top: 6px; font-size: 14.5px; }
      .adm-acts { display: flex; gap: 8px; flex-wrap: wrap; }

      /* Buttons */
      .adm-btn { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px; border-radius: 9px; font-weight: 600; font-size: 13.5px; transition: transform .15s var(--adm-ease), background .2s, border-color .2s; white-space: nowrap; cursor: pointer; border: none; }
      .adm-btn:active { transform: scale(.97); }
      .adm-btn:disabled { opacity: .5; pointer-events: none; }
      .adm-btn-acc { background: var(--adm-acc); color: #fff; }
      .adm-btn-acc:hover { background: #2E4BE0; }
      .adm-btn-l { border: 1px solid var(--adm-line); background: #fff; color: var(--adm-ink); }
      .adm-btn-l:hover { border-color: #C9CDDA; }
      .adm-btn-bad { border: 1px solid #F3C9C9; background: #fff; color: var(--adm-bad); }
      .adm-btn-bad:hover { background: var(--adm-bad-soft); }

      /* KPIs */
      .adm-kpis { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); border: 1px solid var(--adm-line); border-radius: 14px; overflow: hidden; }
      .adm-kpi { padding: 20px 22px; display: flex; flex-direction: column; gap: 6px; }
      .adm-kpi + .adm-kpi { border-left: 1px solid var(--adm-line); }
      .adm-kpi span { color: var(--adm-mute); font-size: 13px; }
      .adm-kpi b { font-size: 28px; font-weight: 600; letter-spacing: -.03em; line-height: 1.1; font-variant-numeric: tabular-nums; }
      .adm-kpi small { font-size: 12.5px; color: var(--adm-mute); display: flex; gap: 6px; align-items: center; }
      .adm-up { color: var(--adm-ok); font-weight: 600; }
      .adm-dn { color: var(--adm-bad); font-weight: 600; }
      @media (max-width: 1100px) { .adm-kpis { grid-template-columns: repeat(2,minmax(0,1fr)); } .adm-kpi:nth-child(3) { border-left: 0; } .adm-kpi:nth-child(n+3) { border-top: 1px solid var(--adm-line); } .adm-grid2 { grid-template-columns: minmax(0,1fr); } }
      @media (max-width: 560px) { .adm-kpis { grid-template-columns: minmax(0,1fr); } .adm-kpi + .adm-kpi { border-left: 0; border-top: 1px solid var(--adm-line); } }

      /* Seg control */
      .adm-seg { display: inline-flex; background: var(--adm-line-2); border-radius: 9px; padding: 3px; gap: 2px; }
      .adm-seg button { height: 28px; padding: 0 10px; border-radius: 7px; font-size: 12.5px; font-weight: 500; color: var(--adm-mute); background: none; border: none; cursor: pointer; }
      .adm-seg button.on { background: #fff; color: var(--adm-ink); box-shadow: 0 1px 2px rgba(20,20,28,.08); }

      /* Card */
      .adm-card { border: 1px solid var(--adm-line); border-radius: 14px; padding: 20px; }
      .adm-card-h { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; gap: 10px; }
      .adm-card-h h3 { font-size: 15px; font-weight: 600; margin: 0; }
      .adm-card-h small { color: var(--adm-mute); font-size: 12.5px; }

      /* Bar chart */
      .adm-chart { display: grid; grid-template-columns: repeat(12,minmax(0,1fr)); gap: 8px; align-items: end; height: 200px; padding-top: 10px; border-bottom: 1px solid var(--adm-line); }
      .adm-chart > div { display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
      .adm-chart i { width: 100%; max-width: 30px; border-radius: 6px 6px 2px 2px; background: var(--adm-acc-soft); transition: height .6s var(--adm-ease), background .2s; position: relative; display: block; }
      .adm-chart > div:hover i, .adm-chart > div.cur i { background: var(--adm-acc); }
      .adm-xl { display: grid; grid-template-columns: repeat(12,minmax(0,1fr)); margin-top: 8px; font-size: 11px; color: var(--adm-faint); text-align: center; }

      /* Progress bar primitive */
      .adm-bar { height: 6px; border-radius: 3px; background: var(--adm-line-2); overflow: hidden; }
      .adm-bar i { display: block; height: 100%; background: var(--adm-acc); border-radius: 3px; }

      /* Plan distribution + legend */
      .adm-dist { display: flex; height: 10px; border-radius: 5px; overflow: hidden; gap: 2px; margin-bottom: 18px; }
      .adm-dist i { display: block; height: 100%; }
      .adm-leg div { display: grid; grid-template-columns: 10px minmax(0,1fr) auto auto; gap: 10px; align-items: center; padding: 10px 0; border-top: 1px solid var(--adm-line-2); }
      .adm-leg div:first-child { border-top: 0; }
      .adm-leg em { width: 10px; height: 10px; border-radius: 3px; font-style: normal; }
      .adm-leg b { font-variant-numeric: tabular-nums; }
      .adm-leg small { color: var(--adm-mute); width: 44px; text-align: right; }
      .adm-leg .adm-leg-sub { border-top: 0; padding: 0 0 10px 18px; color: var(--adm-mute); font-size: 12.5px; }
      .adm-leg .adm-leg-sub em { background: none; border: 1.5px dashed var(--adm-faint); box-sizing: border-box; }

      /* Activity feed */
      .adm-feed div { display: grid; grid-template-columns: 32px minmax(0,1fr) auto; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid var(--adm-line-2); }
      .adm-feed div:first-child { border-top: 0; }
      .adm-feed p { font-size: 13.5px; margin: 0; }
      .adm-feed p b { font-weight: 600; }
      .adm-feed small { color: var(--adm-faint); font-size: 12px; }

      /* System status */
      .adm-health { display: flex; flex-direction: column; gap: 10px; }
      .adm-health > div { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; }
      .adm-dot { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 500; color: var(--adm-ok); }
      .adm-dot::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
      .adm-dot.w { color: var(--adm-warn); }
      .adm-dot.b { color: var(--adm-bad); }
      .adm-dot.n { color: var(--adm-faint); }

      /* Empty state */
      .adm-empty { padding: 40px; text-align: center; color: var(--adm-mute); }

      /* Users toolbar */
      .adm-tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
      .adm-search { display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 12px; border: 1px solid var(--adm-line); border-radius: 9px; flex: 1; min-width: 220px; max-width: 380px; color: var(--adm-faint); }
      .adm-search input { all: unset; flex: 1; color: var(--adm-ink); font-size: 13.5px; }
      .adm-search:focus-within { border-color: var(--adm-acc); box-shadow: 0 0 0 3px var(--adm-acc-soft); }
      .adm select, .adm-in { font: inherit; font-size: 13.5px; height: 38px; padding: 0 12px; border: 1px solid var(--adm-line); border-radius: 9px; background: #fff; color: var(--adm-ink); outline: none; }
      .adm select:focus, .adm-in:focus { border-color: var(--adm-acc); box-shadow: 0 0 0 3px var(--adm-acc-soft); }
      .adm-tools .adm-cnt { margin-left: auto; color: var(--adm-mute); font-size: 13px; }

      /* Table */
      .adm-tbl { border: 1px solid var(--adm-line); border-radius: 14px; overflow: auto; }
      .adm-tbl table { width: 100%; border-collapse: collapse; min-width: 820px; }
      .adm-tbl th { text-align: left; font-weight: 500; color: var(--adm-mute); font-size: 12.5px; padding: 11px 16px; background: var(--adm-soft); border-bottom: 1px solid var(--adm-line); white-space: nowrap; }
      .adm-tbl td { padding: 12px 16px; border-bottom: 1px solid var(--adm-line-2); vertical-align: middle; }
      .adm-tbl tr:last-child td { border-bottom: 0; }
      .adm-tbl tbody tr { cursor: pointer; transition: background .15s; }
      .adm-tbl tbody tr:hover { background: var(--adm-soft); }
      .adm-u { display: flex; align-items: center; gap: 11px; min-width: 0; }
      .adm-u b { display: block; font-weight: 500; }
      .adm-u small { display: block; color: var(--adm-mute); font-size: 12.5px; }
      .adm-num { font-variant-numeric: tabular-nums; color: var(--adm-ink-2); }
      .adm-ia { width: 30px; height: 30px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; color: var(--adm-mute); background: none; border: none; cursor: pointer; }
      .adm-ia:hover { background: var(--adm-line-2); color: var(--adm-ink); }

      /* Pills */
      .adm-pill { display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 9px; border-radius: 999px; font-size: 12px; font-weight: 500; background: var(--adm-line-2); color: var(--adm-ink-2); white-space: nowrap; }
      .adm-pill.acc { background: var(--adm-acc-soft); color: var(--adm-acc); }
      .adm-pill.ok { background: var(--adm-ok-soft); color: var(--adm-ok); }
      .adm-pill.warn { background: var(--adm-warn-soft); color: var(--adm-warn); }
      .adm-pill.bad { background: var(--adm-bad-soft); color: var(--adm-bad); }
      .adm-pill.ink { background: var(--adm-ink); color: #fff; }

      /* Drawer */
      .adm-scrim { position: fixed; inset: 0; background: rgba(20,20,28,.28); opacity: 0; pointer-events: none; transition: opacity .25s; z-index: 40; }
      .adm-scrim.on { opacity: 1; pointer-events: auto; }
      .adm-drawer { position: fixed; top: 12px; right: 12px; bottom: 12px; width: 420px; max-width: calc(100vw - 24px); background: #fff; border-radius: 16px; border: 1px solid var(--adm-line); box-shadow: 0 30px 80px -20px rgba(20,20,28,.35); z-index: 41; transform: translateX(calc(100% + 24px)); transition: transform .4s var(--adm-ease); display: flex; flex-direction: column; }
      .adm-drawer.on { transform: none; }
      .adm-dr-h { padding: 22px 22px 18px; border-bottom: 1px solid var(--adm-line); display: flex; gap: 14px; align-items: center; }
      .adm-dr-h .adm-av { width: 44px; height: 44px; font-size: 15px; }
      .adm-dr-h h3 { font-size: 17px; font-weight: 600; margin: 0; }
      .adm-dr-h small { color: var(--adm-mute); }
      .adm-dr-h .adm-ia { margin-left: auto; align-self: flex-start; }
      .adm-dr-b { padding: 20px 22px; overflow: auto; flex: 1; display: flex; flex-direction: column; gap: 20px; }
      .adm-dl { display: grid; grid-template-columns: 130px minmax(0,1fr); gap: 12px 16px; font-size: 13.5px; margin: 0; }
      .adm-dl dt { color: var(--adm-mute); }
      .adm-dl dd { margin: 0; min-width: 0; word-break: break-all; }
      .adm-dr-sec h4 { margin: 0 0 10px; font-size: 13px; font-weight: 600; }
      .adm-minis { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; }
      .adm-minis div { border: 1px solid var(--adm-line); border-radius: 10px; padding: 10px 12px; }
      .adm-minis b { display: block; font-size: 18px; font-weight: 600; }
      .adm-minis small { color: var(--adm-mute); font-size: 12px; }
      .adm-dr-f { padding: 16px 22px; border-top: 1px solid var(--adm-line); display: flex; gap: 8px; flex-wrap: wrap; }
      .adm-dr-f .adm-btn-bad { margin-left: auto; }
      .adm-copy { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-geist-mono), monospace; font-size: 12px; color: var(--adm-ink-2); background: none; border: none; cursor: pointer; padding: 0; }
      .adm-copy:hover { color: var(--adm-acc); }
      @media (max-width: 560px) { .adm-dl { grid-template-columns: minmax(0,1fr); } .adm-dl dt { margin-top: 6px; } }

      /* Modal */
      .adm-modal-ov { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 45; opacity: 0; pointer-events: none; transition: opacity .25s; }
      .adm-modal-ov.on { opacity: 1; pointer-events: auto; }
      .adm-box { background: #fff; border-radius: 16px; padding: 24px; width: 420px; max-width: calc(100vw - 32px); box-shadow: 0 30px 80px -20px rgba(20,20,28,.35); transform: translateY(8px); transition: transform .3s var(--adm-ease); }
      .adm-modal-ov.on .adm-box { transform: none; }
      .adm-box h3 { margin: 0 0 6px; font-size: 17px; font-weight: 600; }
      .adm-box > p { color: var(--adm-mute); font-size: 13.5px; margin: 0 0 16px; }
      .adm-box label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 12px; }
      .adm-box label small { font-weight: 400; color: var(--adm-mute); margin-left: 4px; }
      .adm-box .adm-in, .adm-box textarea, .adm-box select.adm-in { width: 100%; margin-top: 6px; }
      .adm-box textarea.adm-in { min-height: 70px; resize: vertical; font: inherit; }
      .adm-box .adm-f { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
      .adm-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .adm-req { color: var(--adm-bad); }
      @media (max-width: 420px) { .adm-two { grid-template-columns: minmax(0,1fr); } }

      /* Cover upload */
      .adm-cover { position: relative; height: 150px; border-radius: 12px; overflow: hidden; border: 1px dashed #C9CDDA; background: var(--adm-soft); display: flex; align-items: center; justify-content: center; color: var(--adm-mute); cursor: pointer; background-size: cover; background-position: center; margin-top: 6px; }
      .adm-cover input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

      /* Courses grid */
      .adm-courses { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 14px; }
      .adm-course { border: 1px solid var(--adm-line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer; transition: border-color .2s, box-shadow .25s var(--adm-ease), transform .25s var(--adm-ease); text-align: left; background: #fff; }
      .adm-course:hover { border-color: #C9CDDA; box-shadow: 0 14px 30px -18px rgba(20,20,28,.25); transform: translateY(-2px); }
      .adm-cv { position: relative; height: 110px; padding: 16px; color: #fff; display: flex; flex-direction: column; justify-content: space-between; background-size: cover; background-position: center; }
      .adm-cv b { font-size: 17px; font-weight: 600; letter-spacing: -.02em; }
      .adm-cv .adm-mono { color: rgba(255,255,255,.7); }
      .adm-cb { padding: 16px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
      .adm-cstats { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 8px; font-size: 12.5px; color: var(--adm-mute); }
      .adm-cstats b { display: block; color: var(--adm-ink); font-size: 15px; font-variant-numeric: tabular-nums; }
      .adm-cf { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--adm-line-2); }
      .adm-course-add { border-style: dashed; align-items: center; justify-content: center; gap: 8px; color: var(--adm-mute); min-height: 260px; transition: border-color .2s, color .2s; display: flex; flex-direction: column; }
      .adm-course-add:hover { border-color: var(--adm-acc); color: var(--adm-acc); }

      /* Course detail */
      .adm-back { display: inline-flex; align-items: center; gap: 6px; color: var(--adm-mute); font-weight: 500; margin-bottom: 14px; background: none; border: none; cursor: pointer; padding: 0; font-size: 14px; }
      .adm-back:hover { color: var(--adm-acc); }
      .adm-chead { display: grid; grid-template-columns: 200px minmax(0,1fr) auto; gap: 24px; align-items: center; margin-bottom: 28px; }
      .adm-chead .adm-cv { height: 120px; border-radius: 12px; }
      .adm-cmeta { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
      @media (max-width: 760px) { .adm-chead { grid-template-columns: minmax(0,1fr); } .adm-chead .adm-cv { height: 140px; } }

      .adm-mod { border: 1px solid var(--adm-line); border-radius: 14px; background: #fff; transition: border-color .2s; margin-bottom: 10px; }
      .adm-mod.open { border-color: #C9CDDA; }
      .adm-mod-h { display: grid; grid-template-columns: 28px minmax(0,1fr) auto auto; gap: 14px; align-items: center; padding: 14px 16px; cursor: pointer; }
      .adm-mod-h .adm-n { font-family: var(--font-geist-mono), monospace; font-size: 12px; color: var(--adm-faint); }
      .adm-mod-h b { font-weight: 600; font-size: 15px; }
      .adm-mod-h small { display: block; color: var(--adm-mute); font-size: 12.5px; margin-top: 2px; }
      .adm-mod-h .adm-chev { transition: transform .3s var(--adm-ease); color: var(--adm-mute); }
      .adm-mod.open .adm-chev { transform: rotate(180deg); }
      .adm-mod-a { display: flex; gap: 2px; }
      .adm-mod-b { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s var(--adm-ease); }
      .adm-mod.open .adm-mod-b { grid-template-rows: 1fr; }
      .adm-mod-b > div { overflow: hidden; }
      .adm-lessons { border-top: 1px solid var(--adm-line-2); padding: 8px 16px 14px 58px; display: flex; flex-direction: column; }
      .adm-les { display: grid; grid-template-columns: 22px minmax(0,1fr) auto; gap: 12px; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--adm-line-2); }
      .adm-les .adm-k { width: 22px; height: 22px; border-radius: 6px; background: var(--adm-acc-soft); color: var(--adm-acc); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .adm-les small { color: var(--adm-mute); font-variant-numeric: tabular-nums; }
      .adm-les .adm-ia { opacity: 0; transition: opacity .2s; }
      .adm-les:hover .adm-ia { opacity: 1; }
      .adm-addl { align-self: flex-start; margin-top: 10px; display: inline-flex; align-items: center; gap: 6px; color: var(--adm-acc); font-weight: 500; font-size: 13.5px; height: 32px; padding: 0 10px; border-radius: 8px; background: none; border: none; cursor: pointer; }
      .adm-addl:hover { background: var(--adm-acc-soft); }
      .adm-nol { color: var(--adm-mute); padding: 10px 0 0; margin: 0; }
      .adm-mempty { border: 1px dashed var(--adm-line); border-radius: 14px; padding: 40px; text-align: center; color: var(--adm-mute); display: flex; flex-direction: column; align-items: center; gap: 12px; }
      @media (max-width: 760px) { .adm-les .adm-ia { opacity: 1; } }

      /* Analytics funnel + heatmap */
      .adm-funnel { display: flex; flex-direction: column; gap: 12px; }
      .adm-funnel > div { display: grid; grid-template-columns: 140px minmax(0,1fr) 60px; gap: 12px; align-items: center; font-size: 13.5px; }
      .adm-funnel .adm-bar { height: 24px; border-radius: 6px; }
      .adm-funnel .adm-bar i { border-radius: 6px; }
      .adm-funnel span:last-child { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
      @media (max-width: 560px) { .adm-funnel > div { grid-template-columns: 100px minmax(0,1fr) 44px; } }

      .adm-heat { display: grid; grid-template-columns: 36px repeat(12,minmax(0,1fr)); gap: 4px; font-size: 11px; color: var(--adm-faint); }
      .adm-heat i { aspect-ratio: 1; border-radius: 4px; background: var(--adm-acc); display: block; }

      /* Settings */
      .adm-st { display: grid; grid-template-columns: 200px minmax(0,1fr); gap: 40px; }
      .adm-st nav { display: flex; flex-direction: column; gap: 2px; position: sticky; top: 32px; align-self: start; }
      .adm-st nav button { display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 10px; border-radius: 8px; color: var(--adm-ink-2); font-weight: 500; text-align: left; background: none; border: none; cursor: pointer; }
      .adm-st nav button:hover { background: var(--adm-line-2); }
      .adm-st nav button.on { background: var(--adm-acc-soft); color: var(--adm-acc); }
      .adm-sp h2 { font-size: 18px; font-weight: 600; letter-spacing: -.02em; margin: 0; }
      .adm-sp > p { color: var(--adm-mute); margin-top: 4px; }
      .adm-rows { margin-top: 20px; border: 1px solid var(--adm-line); border-radius: 14px; }
      .adm-row { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.1fr); gap: 24px; align-items: center; padding: 18px 20px; border-top: 1px solid var(--adm-line-2); }
      .adm-row:first-child { border-top: 0; }
      .adm-row b { display: block; font-weight: 500; }
      .adm-row small { display: block; color: var(--adm-mute); font-size: 12.5px; margin-top: 2px; }
      .adm-row .adm-in, .adm-row select { width: 100%; }
      .adm-row .adm-r { justify-self: end; }

      .adm-sw { position: relative; width: 38px; height: 22px; flex: none; display: inline-block; }
      .adm-sw input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
      .adm-sw span { position: absolute; inset: 0; border-radius: 11px; background: #D7DAE4; transition: background .2s; pointer-events: none; }
      .adm-sw span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .25s var(--adm-ease); }
      .adm-sw input:checked + span { background: var(--adm-acc); }
      .adm-sw input:checked + span::after { transform: translateX(16px); }

      .adm-save { position: fixed; left: 50%; bottom: 20px; transform: translate(-50%,120px); background: var(--adm-ink); color: #fff; border-radius: 12px; padding: 8px 8px 8px 16px; display: flex; align-items: center; gap: 16px; box-shadow: 0 20px 50px -10px rgba(20,20,28,.45); transition: transform .4s var(--adm-ease); z-index: 30; font-size: 13.5px; }
      .adm-save.on { transform: translate(-50%,0); }
      .adm-save .adm-btn-l { background: transparent; border-color: rgba(255,255,255,.2); color: #fff; }
      .adm-save .adm-btn-l:hover { border-color: rgba(255,255,255,.5); }

      .adm-danger { margin-top: 20px; border: 1px solid #F3C9C9; border-radius: 14px; }
      .adm-danger .adm-row { border-color: #F8E0E0; }

      /* Toast */
      .adm-toast { position: fixed; right: 20px; bottom: 20px; background: #fff; border: 1px solid var(--adm-line); border-radius: 12px; padding: 12px 16px; display: flex; gap: 10px; align-items: center; box-shadow: 0 20px 50px -20px rgba(20,20,28,.35); transform: translateY(120px); transition: transform .35s var(--adm-ease); z-index: 50; font-weight: 500; font-size: 13.5px; }
      .adm-toast.on { transform: none; }
      .adm-toast svg { color: var(--adm-ok); }

      /* Responsive shell */
      @media (max-width: 860px) {
        .adm-app { grid-template-columns: minmax(0,1fr); }
        .adm-sb { position: fixed; left: 0; top: 0; bottom: 0; width: 260px; z-index: 42; transform: translateX(-100%); transition: transform .35s var(--adm-ease); background: #F7F8FC; }
        .adm-sb.on { transform: none; }
        .adm-topbar { justify-content: space-between; margin-bottom: 12px; }
        .adm-topbar-mob { display: flex; align-items: center; justify-content: space-between; flex: 1; }
        .adm-topbar-text { display: none; }
        .adm-main { padding: 12px; }
        .adm-panel { padding: 22px 18px 40px; }
        .adm-st { grid-template-columns: minmax(0,1fr); gap: 16px; }
        .adm-st nav { position: static; flex-direction: row; overflow: auto; }
        .adm-st nav button { flex: none; }
        .adm-row { grid-template-columns: minmax(0,1fr); gap: 10px; }
        .adm-row .adm-r { justify-self: start; }
      }
    `}</style>
  );
}
