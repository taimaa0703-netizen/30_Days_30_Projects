'use strict';
// Written PPC performance report, generated locally from the currently loaded dataset.
(() => {
  const L = (en, he) => (uiLanguage === 'he' ? he : en);
  const chg = (a, b) => (a != null && b != null && b > 0 ? (a / b - 1) * 100 : null);
  const signed = n => (n === null ? '—' : `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}%`);
  const num = n => (Number.isFinite(n) ? n.toFixed(2) : '—');
  const cur = n => (Number.isFinite(n) ? money(n) : '—');
  const cur2 = n => (Number.isFinite(n) ? new Intl.NumberFormat(uiLanguage === 'he' ? 'he-IL' : 'en-US', { style: 'currency', currency: datasetCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : '—');
  const share = (a, b) => (b > 0 ? `${(a / b * 100).toFixed(0)}%` : '—');

  function derive(totals) {
    const m = metrics(totals);
    return {
      ...m,
      cpc: ratio(m.spend, m.clicks),
      cvr: ratio(m.conversions * 100, m.clicks),
      cpm: m.impressions > 0 ? m.spend / m.impressions * 1000 : null,
      aov: ratio(m.revenue, m.conversions)
    };
  }

  // Classification uses account-relative thresholds and refuses to judge thin data.
  function verdict(c, account) {
    if (c.conversions < 5 || c.clicks < 100) return 'learning';
    if (c.roas !== null && account.roas !== null) {
      if (c.roas < 1) return 'restrict';
      if (c.roas >= account.roas * 1.25) return 'scale';
      if (c.roas < account.roas * 0.7) return 'optimize';
      return 'maintain';
    }
    if (c.cpa !== null && account.cpa !== null) {
      if (c.cpa <= account.cpa * 0.8) return 'scale';
      if (c.cpa >= account.cpa * 1.3) return 'optimize';
    }
    return 'maintain';
  }
  const verdictLabel = v => ({
    scale: L('Scale', 'להגדיל'),
    maintain: L('Maintain', 'לשמר'),
    optimize: L('Optimize', 'לשפר'),
    restrict: L('Restrict / diagnose', 'להגביל ולאבחן'),
    learning: L('Not enough data', 'אין מספיק נתונים')
  })[v];

  function build() {
    const dates = activeDates().slice(-period);
    const now = derive(sums(currentRows()));
    const prevRows = previousRows();
    const hasPrev = prevRows.length > 0;
    const before = hasPrev ? derive(sums(prevRows)) : null;
    const d = (k, inverse) => (before ? chg(now[k], before[k]) : null);
    const list = campaigns();
    const prevMap = group(prevRows, r => r.channel + '|' + r.campaign);
    list.forEach(c => {
      const p = prevMap.get(c.key);
      c.prev = p ? derive(sums(p)) : null;
      c.verdict = verdict(c, now);
    });
    const critical = alerts.filter(a => a.severity === 'critical');
    const warning = alerts.filter(a => a.severity === 'warning');
    const roasDelta = d('roas');
    const status = critical.length || (roasDelta !== null && roasDelta <= -15) ? 'attention'
      : warning.length || (roasDelta !== null && roasDelta <= -5) ? 'watch' : 'healthy';
    const statusText = {
      attention: L('in need of immediate attention', 'דורש טיפול מיידי'),
      watch: L('broadly stable, with items to watch', 'יציב ברובו, עם נקודות לניטור'),
      healthy: L('healthy and stable', 'תקין ויציב')
    }[status];
    const sections = [];

    sections.push({
      h: L('1. Executive summary', '1. תקציר מנהלים'),
      p: [
        L(`Over the last ${dates.length} days (${dates[0]} to ${dates[dates.length - 1]}) the account spent ${cur(now.spend)} and generated ${fmt.format(now.conversions)} conversions and ${cur(now.revenue)} in tracked revenue. Blended ROAS is ${now.roas === null ? '—' : num(now.roas) + 'x'} at an average CPA of ${cur(now.cpa)}.`,
          `ב־${dates.length} הימים האחרונים (${dates[0]} עד ${dates[dates.length - 1]}) הוצאו ${cur(now.spend)}, והתקבלו ${fmt.format(now.conversions)} המרות והכנסה מדווחת של ${cur(now.revenue)}. ה־ROAS המשולב הוא ${now.roas === null ? '—' : num(now.roas) + 'x'} ועלות ההמרה הממוצעת (CPA) היא ${cur(now.cpa)}.`),
        hasPrev
          ? L(`Compared with the previous period: spend ${signed(d('spend'))}, conversions ${signed(d('conversions'))}, CPA ${signed(d('cpa'))}, ROAS ${signed(roasDelta)}.`,
              `בהשוואה לתקופה הקודמת: הוצאה ${signed(d('spend'))}, המרות ${signed(d('conversions'))}, CPA ${signed(d('cpa'))}, ROAS ${signed(roasDelta)}.`)
          : L('No previous period is available in the data, so trend comparisons are omitted.', 'אין תקופת השוואה קודמת בנתונים, ולכן לא מוצגות השוואות מגמה.'),
        L(`Overall assessment: the account is ${statusText}. ${critical.length} critical and ${warning.length} warning signals were detected.`,
          `הערכה כללית: מצב החשבון ${statusText}. זוהו ${critical.length} התראות קריטיות ו־${warning.length} התראות אזהרה.`)
      ]
    });

    const channels = [...group(list, c => c.channel)].map(([name, items]) => ({ name, ...derive(sums(items)) }))
      .sort((a, b) => b.spend - a.spend);
    const channelBullets = [];
    const ranked = channels.filter(c => c.roas !== null && c.spend > 0);
    if (ranked.length > 1) {
      const best = [...ranked].sort((a, b) => b.roas - a.roas)[0];
      const worst = [...ranked].sort((a, b) => a.roas - b.roas)[0];
      channelBullets.push(L(`${best.name} is the most efficient channel (ROAS ${num(best.roas)}x), with ${share(best.spend, now.spend)} of spend and ${share(best.revenue, now.revenue)} of revenue.`,
        `${best.name} הוא הערוץ היעיל ביותר (ROAS ${num(best.roas)}x), עם ${share(best.spend, now.spend)} מההוצאה ו־${share(best.revenue, now.revenue)} מההכנסה.`));
      if (worst.name !== best.name) channelBullets.push(L(`${worst.name} is the least efficient (ROAS ${num(worst.roas)}x) while taking ${share(worst.spend, now.spend)} of spend and returning ${share(worst.revenue, now.revenue)} of revenue.`,
        `${worst.name} הוא הערוץ הפחות יעיל (ROAS ${num(worst.roas)}x) ומקבל ${share(worst.spend, now.spend)} מההוצאה אך מחזיר ${share(worst.revenue, now.revenue)} מההכנסה.`));
    }
    sections.push({
      h: L('2. Channel performance', '2. ביצועי ערוצים'),
      p: [L('Each channel is judged by the share of budget it consumes against the share of revenue it returns.', 'כל ערוץ נבחן לפי חלקו בתקציב מול חלקו בהכנסות.')],
      ul: channelBullets,
      table: {
        head: [L('Channel', 'ערוץ'), L('Spend', 'הוצאה'), L('Spend share', 'נתח הוצאה'), L('Conversions', 'המרות'), 'CPA', 'ROAS', L('Revenue share', 'נתח הכנסה')],
        rows: channels.map(c => [c.name, cur(c.spend), share(c.spend, now.spend), fmt.format(c.conversions), cur(c.cpa), c.roas === null ? '—' : num(c.roas) + 'x', share(c.revenue, now.revenue)])
      }
    });

    const funnel = [];
    funnel.push(L(`Top of funnel: CTR ${pct(now.ctr)}, CPC ${cur2(now.cpc)}, CPM ${cur2(now.cpm)}. After the click: conversion rate ${pct(now.cvr)} and average order value ${cur(now.aov)}.`,
      `ראש המשפך: CTR ‏${pct(now.ctr)}, CPC ‏${cur2(now.cpc)}, CPM ‏${cur2(now.cpm)}. אחרי הקליק: שיעור המרה ${pct(now.cvr)} ושווי הזמנה ממוצע ${cur(now.aov)}.`));
    if (before) {
      const cpcD = d('cpc'), cvrD = d('cvr'), cpaD = d('cpa');
      if (cpaD !== null && Math.abs(cpaD) >= 5 && cpcD !== null && cvrD !== null) {
        const driver = Math.abs(cpcD) > Math.abs(cvrD)
          ? L('traffic cost (CPC)', 'עלות התנועה (CPC)') : L('on-site conversion rate', 'שיעור ההמרה באתר');
        funnel.push(L(`CPA moved ${signed(cpaD)}. Because CPA = CPC ÷ conversion rate, this is mainly driven by ${driver} (CPC ${signed(cpcD)}, conversion rate ${signed(cvrD)}).`,
          `ה־CPA השתנה ב־${signed(cpaD)}. מכיוון ש־CPA = CPC ÷ שיעור המרה, השינוי נובע בעיקר מ${driver} (CPC ‏${signed(cpcD)}, שיעור המרה ${signed(cvrD)}).`));
        funnel.push(Math.abs(cpcD) > Math.abs(cvrD)
          ? L('Focus on auction pressure, audience/placement mix and creative relevance.', 'מומלץ להתמקד בלחץ המכרזים, בתמהיל הקהלים והמיקומים ובהתאמת הקריאייטיב.')
          : L('Focus on landing page, offer, checkout friction and tracking integrity.', 'מומלץ להתמקד בדף הנחיתה, בהצעה, בחיכוך בתהליך הרכישה ובתקינות המדידה.'));
      } else {
        funnel.push(L('Cost efficiency is broadly unchanged versus the previous period.', 'יעילות העלות כמעט ללא שינוי לעומת התקופה הקודמת.'));
      }
    }
    sections.push({ h: L('3. Funnel diagnostics', '3. אבחון משפך'), ul: funnel });

    const verdictCount = v => list.filter(c => c.verdict === v).length;
    sections.push({
      h: L('4. Campaign review', '4. סקירת קמפיינים'),
      p: [L(`${list.length} campaigns were reviewed: ${verdictCount('scale')} to scale, ${verdictCount('maintain')} to maintain, ${verdictCount('optimize')} to optimize, ${verdictCount('restrict')} to restrict or diagnose, ${verdictCount('learning')} with too little data to judge. Verdicts compare each campaign with the account average (ROAS, or CPA when revenue is missing) and require at least 5 conversions and 100 clicks.`,
        `נסקרו ${list.length} קמפיינים: ${verdictCount('scale')} להגדלה, ${verdictCount('maintain')} לשימור, ${verdictCount('optimize')} לשיפור, ${verdictCount('restrict')} להגבלה ואבחון, ו־${verdictCount('learning')} ללא מספיק נתונים לשיפוט. ההמלצות משוות כל קמפיין לממוצע החשבון (ROAS, או CPA כשאין נתוני הכנסה) ודורשות לפחות 5 המרות ו־100 קליקים.`)],
      table: {
        head: [L('Campaign', 'קמפיין'), L('Channel', 'ערוץ'), L('Spend', 'הוצאה'), L('Conv.', 'המרות'), 'CPA', 'ROAS', L('Recommendation', 'המלצה')],
        rows: list.map(c => [c.campaign, c.channel, cur(c.spend), fmt.format(c.conversions), cur(c.cpa), c.roas === null ? '—' : num(c.roas) + 'x', verdictLabel(c.verdict)])
      },
      ul: list.filter(c => c.verdict !== 'maintain').map(c => {
        const trend = c.prev ? L(` Versus the previous period: spend ${signed(chg(c.spend, c.prev.spend))}, conversions ${signed(chg(c.conversions, c.prev.conversions))}, CPA ${signed(chg(c.cpa, c.prev.cpa))}.`,
          ` לעומת התקופה הקודמת: הוצאה ${signed(chg(c.spend, c.prev.spend))}, המרות ${signed(chg(c.conversions, c.prev.conversions))}, CPA ‏${signed(chg(c.cpa, c.prev.cpa))}.`) : '';
        const why = {
          scale: L('returns well above the account ROAS; there is room to add budget gradually.', 'מחזיר ROAS גבוה משמעותית מממוצע החשבון; יש מקום להוסיף תקציב בהדרגה.'),
          optimize: L('is clearly below the account average; test creative, audience and landing page before adding spend.', 'נמצא מתחת לממוצע החשבון; מומלץ לבדוק קריאייטיב, קהל ודף נחיתה לפני הוספת תקציב.'),
          restrict: L('returns less revenue than it costs on tracked data; reduce budget or pause while the cause is diagnosed (margin and lifetime value may change the conclusion).', 'מחזיר פחות הכנסה ממה שעלה לפי הנתונים הנמדדים; מומלץ להקטין תקציב או להשהות עד אבחון הסיבה (מרווח ושווי לקוח לאורך זמן עשויים לשנות את המסקנה).'),
          learning: L('does not have enough conversions or clicks for a reliable decision; avoid big changes and let it collect data.', 'אין לו מספיק המרות או קליקים להחלטה אמינה; מומלץ להימנע משינויים גדולים ולתת לו לצבור נתונים.')
        }[c.verdict];
        return `${c.channel} · ${c.campaign} — ${verdictLabel(c.verdict)}: ${why}${trend}`;
      })
    });

    sections.push({
      h: L('5. Detected anomalies', '5. חריגות שזוהו'),
      ul: alerts.length
        ? alerts.map(a => `[${t(a.severity)}] ${a.channel} · ${a.campaign} — ${a.title}. ${t(a.description)} ${t(a.evidence)}`)
        : [L('No anomalies exceeded the detection thresholds in the selected window.', 'לא זוהו חריגות מעל הספים בחלון הזמן שנבחר.')]
    });

    const actions = [];
    critical.forEach(a => actions.push(L(`Within 24 hours: investigate "${a.campaign}" (${a.channel}) — ${a.title}. First verify tracking, then review recent creative, audience and budget changes.`,
      `תוך 24 שעות: לבדוק את "${a.campaign}" (${a.channel}) — ${a.title}. קודם לוודא את תקינות המדידה, ואז לעבור על שינויי קריאייטיב, קהל ותקציב אחרונים.`)));
    list.filter(c => c.verdict === 'restrict').forEach(c => actions.push(L(`Reduce budget on "${c.campaign}" by 20–30% or pause it, and diagnose targeting, offer and tracking before restoring spend.`,
      `להקטין את התקציב של "${c.campaign}" ב־20%–30% או להשהות אותו, ולאבחן מיקוד, הצעה ומדידה לפני החזרת ההוצאה.`)));
    list.filter(c => c.verdict === 'scale').forEach(c => actions.push(L(`Increase budget on "${c.campaign}" in steps of about 15–20% every few days, and stop if CPA rises by more than 20%.`,
      `להגדיל את התקציב של "${c.campaign}" בצעדים של כ־15%–20% כל כמה ימים, ולעצור אם ה־CPA עולה ביותר מ־20%.`)));
    list.filter(c => c.verdict === 'optimize').forEach(c => actions.push(L(`Run one controlled test on "${c.campaign}" (new creative or landing page) and judge it on CPA after enough conversions.`,
      `להריץ ניסוי מבוקר אחד על "${c.campaign}" (קריאייטיב או דף נחיתה חדשים) ולשפוט אותו לפי CPA לאחר מספר מספק של המרות.`)));
    actions.push(L('Confirm conversion tracking and attribution settings are consistent across channels before moving budget between them.', 'לוודא שהגדרות מדידת ההמרות והייחוס עקביות בין הערוצים לפני העברת תקציב ביניהם.'));
    actions.push(L('Re-run this report in 7 days and compare against these figures.', 'להפיק דוח זה שוב בעוד 7 ימים ולהשוות אותו לנתונים אלה.'));
    sections.push({ h: L('6. Prioritized action plan', '6. תוכנית פעולה מדורגת'), ol: actions.slice(0, 10) });

    const notes = [
      L('Figures come from the loaded dataset only; platform attribution windows and conversion definitions may differ.', 'הנתונים מבוססים על מערך הנתונים הטעון בלבד; חלונות ייחוס והגדרות המרה בפלטפורמות עשויים להיות שונים.'),
      L('Revenue is tracked conversion value, not profit. Margin, returns and lifetime value are not included.', 'ההכנסה היא ערך המרה מדווח ולא רווח. מרווח, החזרות ושווי לקוח לאורך זמן אינם כלולים.'),
      L('Recommendations are hypotheses based on correlations and do not prove causation; validate before large budget changes.', 'ההמלצות הן השערות המבוססות על מתאמים ואינן מוכיחות סיבתיות; יש לאמת לפני שינויי תקציב גדולים.')
    ];
    if (source === 'demo') notes.unshift(L('This report is based on illustrative demo data.', 'דוח זה מבוסס על נתוני הדגמה להמחשה בלבד.'));
    sections.push({ h: L('7. Limitations', '7. הסתייגויות'), ul: notes });

    return {
      title: L('Campaign Performance Report', 'דוח ביצועי קמפיינים'),
      meta: L(`Generated ${new Date().toLocaleDateString('en-US')} · Last ${dates.length} days`, `הופק ב־${new Date().toLocaleDateString('he-IL')} · ${dates.length} הימים האחרונים`),
      sections
    };
  }

  const cell = v => `<td><bdi>${safe(v)}</bdi></td>`;
  function toHTML(r) {
    return `<h2 class="report-title">${safe(r.title)}</h2><p class="report-meta">${safe(r.meta)}</p>` + r.sections.map(s =>
      `<section class="report-section"><h3>${safe(s.h)}</h3>${(s.p || []).map(x => `<p>${safe(x)}</p>`).join('')}${s.table ? `<div class="table-scroll"><table><thead><tr>${s.table.head.map(h => `<th>${safe(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(row => `<tr>${row.map(cell).join('')}</tr>`).join('')}</tbody></table></div>` : ''}${s.ul && s.ul.length ? `<ul>${s.ul.map(x => `<li>${safe(x)}</li>`).join('')}</ul>` : ''}${s.ol ? `<ol>${s.ol.map(x => `<li>${safe(x)}</li>`).join('')}</ol>` : ''}</section>`).join('');
  }
  function toText(r) {
    return [r.title, r.meta, ...r.sections.map(s => ['', s.h, ...(s.p || []),
      ...(s.table ? [s.table.head.join(' | '), ...s.table.rows.map(row => row.join(' | '))] : []),
      ...(s.ul || []).map(x => '- ' + x), ...(s.ol || []).map((x, i) => `${i + 1}. ${x}`)].join('\n'))].join('\n');
  }

  let lastText = '';
  window.renderReport = function renderReport() {
    const body = document.querySelector('#reportBody');
    if (!body) return;
    const report = build();
    lastText = toText(report);
    body.innerHTML = toHTML(report);
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#reportPrint').addEventListener('click', () => window.print());
    document.querySelector('#reportCopy').addEventListener('click', async event => {
      const button = event.currentTarget;
      try { await navigator.clipboard.writeText(lastText); button.textContent = t('Copied ✓'); }
      catch { button.textContent = t('Copy failed'); }
      setTimeout(() => { button.textContent = t('Copy as text'); }, 1800);
    });
  });
})();
