/* ATLAS Prototype — shared navigation + evaluator guidance chrome.
   Static, no dependencies. Builds the nav bar, role routing, prev/next,
   framing rail, one-time intro modal and a per-screen guide from one place,
   so all pages stay in sync. Edit content here, not on each page. */

(function () {
  'use strict';

  /* ---------------- minimal behaviours ---------------- */

  // Expand/collapse (System 1 -> System 2 layering)
  document.addEventListener('click', function (e) {
    var header = e.target.closest('.expandable-header');
    if (!header) return;
    var content = header.nextElementSibling;
    if (!content || !content.classList.contains('expandable-content')) return;
    var icon = header.querySelector('.toggle-icon');
    content.classList.toggle('visible');
    if (icon) icon.classList.toggle('open');
  });

  // Confidence slider display (display only)
  document.addEventListener('input', function (e) {
    if (!e.target.classList.contains('confidence-slider')) return;
    var display = e.target.parentElement.querySelector('.confidence-value');
    if (display) display.textContent = e.target.value + ' / 100';
  });

  // Language swap for page content (data-en / data-en-placeholder / data-en-value)
  function setLanguage(lang) {
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (!el.dataset.no) el.dataset.no = el.innerHTML;
      el.innerHTML = (lang === 'en') ? el.dataset.en : el.dataset.no;
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      if (!el.dataset.noPlaceholder) el.dataset.noPlaceholder = el.placeholder;
      el.placeholder = (lang === 'en') ? el.dataset.enPlaceholder : el.dataset.noPlaceholder;
    });
    document.querySelectorAll('[data-en-value]').forEach(function (el) {
      if (!el.dataset.noValue) el.dataset.noValue = el.value;
      el.value = (lang === 'en') ? el.dataset.enValue : el.dataset.noValue;
    });
    document.querySelectorAll('.lang-toggle button').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    try { sessionStorage.setItem('atlas-lang', lang); } catch (e) {}
  }
  window.atlasSetLanguage = setLanguage;

  function currentLang() {
    try { return sessionStorage.getItem('atlas-lang') === 'en' ? 'en' : 'no'; } catch (e) { return 'no'; }
  }

  /* ---------------- configuration ---------------- */

  var NAV = {
    gp: [
      { file: 'gp/1a.html', no: 'Pasientvurdering', en: 'Patient assessment' },
      { file: 'gp/1b.html', no: 'Henvisning', en: 'Referral' },
      { file: 'gp/1c.html', no: 'Tilbakemelding', en: 'Feedback' },
      { file: 'shared/3a.html', no: 'Kalibrering', en: 'Calibration' },
      { file: 'shared/3b.html', no: 'Dialog', en: 'Dialogue' }
    ],
    specialist: [
      { file: 'specialist/2a.html', no: 'Inntaksvurdering', en: 'Intake assessment' },
      { file: 'specialist/2b.html', no: 'Tilbakemelding', en: 'Feedback' },
      { file: 'shared/3a.html', no: 'Kalibrering', en: 'Calibration' },
      { file: 'shared/3b.html', no: 'Dialog', en: 'Dialogue' }
    ]
  };

  var ROLE_LABEL = {
    gp: { no: 'Fastlege', en: 'GP' },
    specialist: { no: 'DPS-spesialist', en: 'DPS specialist' }
  };

  var GUIDE = {
    '1a': {
      scenario: { no: 'Du er Kari Nordlis fastlege. Hun har moderate depressive symptomer, en nylig skilsmisse og redusert funksjon. Du er usikker på om dette bør henvises til DPS.', en: 'You are Kari Nordli’s GP. She has moderate depressive symptoms, a recent divorce and reduced functioning. You are unsure whether this should be referred to DPS.' },
      notice: [
        { no: 'Gråsoneskalaen plasserer du selv. Systemet regner ikke ut pasienten for deg.', en: 'You position the grey-zone scale yourself. The system does not calculate the patient for you.' },
        { no: 'Konfidensskyveknappen er privat for deg. Lav konfidens registreres som informasjon, ikke som et feil svar.', en: 'The confidence slider is private to you. Low confidence is recorded as information, not as a wrong answer.' },
        { no: 'Ditt henvisningsmønster er kun synlig for deg, ikke for DPS eller arbeidsgiver.', en: 'Your referral pattern is visible only to you, not to DPS or your employer.' },
        { no: 'Kriteriepanelet viser «behandlingsnytte», merket som spesialistvurdert og ikke alltid synlig for deg.', en: 'The criteria panel shows "treatment benefit", marked as specialist-assessed and not always visible to you.' }
      ],
      reflect: { no: 'Din første reaksjon: ville denne skjermen hjelpe deg å avgjøre om Kari skal henvises? Hvorfor eller hvorfor ikke?', en: 'Your first reaction: would this screen help you decide whether to refer Kari? Why or why not?' },
      why: { no: 'Fastleger fortalte oss at gråsonebeslutninger om terskel er der de føler minst støtte, og at de sjelden ser kriteriene den andre siden bruker.', en: 'GPs told us that grey-zone threshold decisions are where they feel least supported, and that they rarely see the criteria the other side uses.' }
    },
    '1b': {
      scenario: { no: 'Samme pasient (Kari), og senere Erlend, der en ærlig henvisning tidligere ble avslått. Du skal nå utforme henvisningen.', en: 'The same patient (Kari), and later Erlend, whose honest referral was previously rejected. You are now composing the referral.' },
      notice: [
        { no: 'Informasjonskompasset viser hvilke kriterier henvisningen dekker. Det er en veiledning, ikke en sjekkliste, og du bestemmer.', en: 'The information compass shows which criteria the referral addresses. It is a guide, not a checklist, and you decide.' },
        { no: 'Usikkerhetsfeltet sender din tvil videre til spesialisten som egen informasjon, ikke skjult i fritekst.', en: 'The uncertainty field passes your doubt to the specialist as its own information, not hidden in free text.' },
        { no: 'Tidligere utfall vises (Erlend: avslått uten tilbakemelding).', en: 'Previous outcomes are shown (Erlend: rejected with no feedback).' },
        { no: 'Du kan overstyre kompasset med en begrunnelse, uten straff. Begrunnelsen lagres for din egen kalibrering.', en: 'You can override the compass with a rationale, with no penalty. The rationale is saved for your own calibration.' }
      ],
      reflect: { no: 'Din første reaksjon: ville kompasset eller usikkerhetsfeltet endre hvordan du skriver denne henvisningen?', en: 'Your first reaction: would the compass or the uncertainty field change how you write this referral?' },
      why: { no: 'Fastleger beskrev at de noen ganger tilpasser en henvisning for å få den godtatt, delvis fordi de ikke ser hva som vektlegges og sjelden får tilbakemelding.', en: 'GPs described sometimes shaping a referral to get it accepted, partly because they cannot see what is weighed and rarely get feedback.' }
    },
    '1c': {
      scenario: { no: 'Du henviste Astrid Holm for to uker siden. Svaret har kommet: avslått.', en: 'You referred Astrid Holm two weeks ago. The decision has come back: rejected.' },
      notice: [
        { no: 'Avslaget er kategorisert og forklart, med kriteriene som ikke ble oppfylt i klart språk.', en: 'The rejection is categorised and explained, with the unmet criteria in plain language.' },
        { no: 'Din akseptrate oppdateres, uttrykkelig som informasjon, ikke som en dom.', en: 'Your acceptance rate updates, explicitly as information, not as a judgement.' },
        { no: 'Du kan be om oppklaring eller legge til informasjon, knyttet til nettopp denne henvisningen.', en: 'You can request clarification or add information, linked to this specific referral.' }
      ],
      reflect: { no: 'Din første reaksjon: endrer en forklart avgjørelse og en dialogmulighet reaksjonen din eller hva du gjør videre?', en: 'Your first reaction: does an explained decision and a dialogue option change your reaction or what you do next?' },
      why: { no: 'Uforklarte avslag var en av de tydeligste kildene til frustrasjon og tillitsbrudd på fastlegesiden.', en: 'Unexplained rejection was one of the clearest sources of frustration and trust erosion on the GP side.' }
    },
    '2a': {
      scenario: { no: 'Du er i inntaksteamet ved DPS. Du har mottatt henvisningen for Kari Nordli.', en: 'You are on the DPS intake team. You have received the referral for Kari Nordli.' },
      notice: [
        { no: 'Strukturerte kategorier vises først, den kliniske fortellingen er tilgjengelig under.', en: 'Structured categories appear first; the clinical narrative is available below.' },
        { no: 'Fastlegens usikkerhet vises som en bevisst opplysning, ikke noe du må lese mellom linjene.', en: 'The GP’s uncertainty is shown as a deliberate disclosure, not something to read between the lines.' },
        { no: 'Fastlegens konfidens vises kun for denne henvisningen. Ingen historikk for den enkelte fastlegen vises.', en: 'The GP’s confidence is shown for this referral only. No history for the individual GP is shown.' },
        { no: 'Vurderingsverktøyet er forhåndsutfylt fra fastlegens strukturerte data. «Behandlingsnytte» vurderer du.', en: 'The assessment tool is pre-filled from the GP’s structured data. "Treatment benefit" is yours to judge.' }
      ],
      reflect: { no: 'Din første reaksjon: endrer fastlegens usikkerhet og konfidens måten du vurderer henvisningen på?', en: 'Your first reaction: does the GP’s uncertainty and confidence change how you assess the referral?' },
      why: { no: 'Spesialister fortalte at henvisninger ofte kommer med relevant informasjon skjult eller manglende, og at de ikke kan se hvor sikker fastlegen var.', en: 'Specialists told us referrals often arrive with relevant information buried or missing, and that they cannot tell how sure the GP was.' }
    },
    '2b': {
      scenario: { no: 'Du vurderte Astrid Holm og besluttet avslag. Du skal nå melde dette tilbake til fastlegen.', en: 'You assessed Astrid Holm and decided to reject. You now communicate this back to the GP.' },
      notice: [
        { no: 'Utfall og forhåndsdefinerte begrunnelseskategorier reduserer tiden uten å miste forklaringskraft.', en: 'Outcome and predefined reason categories cut the time without losing explanatory power.' },
        { no: 'Forslag til alternativ vei gir fastlegen et konkret neste steg og er ment å lette byrden ved avslag.', en: 'The alternative-pathway suggestion gives the GP a concrete next step and is meant to ease the burden of rejection.' },
        { no: 'Kriterieforklaringen vises for fastlegen i tilgjengelig språk og lukker opasitetssløyfen.', en: 'The criteria explanation is shown to the GP in accessible language and closes the opacity loop.' },
        { no: 'Forløpssporing (3, 6, 12 måneder) for aksepterte pasienter mater kalibreringsbildet.', en: 'Trajectory tracking (3, 6, 12 months) for accepted patients feeds the calibration picture.' }
      ],
      reflect: { no: 'Din første reaksjon: ville du brukt dette rutinemessig? Endrer det tiden eller hva du formidler?', en: 'Your first reaction: would you use this routinely? Does it change the time, or what you communicate?' },
      why: { no: 'Fastleger mister tillit mest ved uforklarte avslag, men spesialister sa at fulle forklaringer hver gang ikke er realistisk på tiden deres.', en: 'GPs lose trust most at unexplained rejections, but specialists said full explanations every time are not realistic on their time.' }
    },
    '3a': {
      scenario: { no: 'Den delte kalibreringsoversikten over tid.', en: 'The shared calibration overview over time.' },
      notice: [
        { no: 'Fastlegen ser sitt eget mønster; spesialisten ser aggregerte tall for opptaksområdet. Ingen individdata krysser grensen.', en: 'The GP sees their own pattern; the specialist sees aggregated figures for the catchment area. No individual data crosses the boundary.' },
        { no: 'Trendlinjen markerer når tilbakemelding ble gitt og ikke gitt.', en: 'The trend line marks when feedback was and was not received.' },
        { no: 'Loggen over kriterieendringer adresserer problemet med «mål som flytter seg».', en: 'The log of criteria changes addresses the "moving target" problem.' }
      ],
      reflect: { no: 'Din første reaksjon: nyttig eller ubehagelig? Ville du sett på dette?', en: 'Your first reaction: useful or uncomfortable? Would you look at this?' },
      why: { no: 'Begge sider beskrev at kriterier oppleves som bevegelige mål, og at manglende oversikt over egen praksis svekker læring over tid.', en: 'Both sides described criteria feeling like moving targets, and that a lack of overview of one’s own practice weakens learning over time.' }
    },
    '3b': {
      scenario: { no: 'Det delte dialogrommet mellom fastlege og spesialist.', en: 'The shared dialogue space between GP and specialist.' },
      notice: [
        { no: 'En sakstilknyttet tråd lar fastlegen spørre «hva manglet?» og spesialisten be om oppklaring uten fullt avslag.', en: 'A case-linked thread lets the GP ask "what was missing?" and the specialist request clarification without a full rejection.' },
        { no: 'En anonymisert generell diskusjon tilsvarer praksiskoordinatorfunksjonen i digital form.', en: 'An anonymised general discussion mirrors the praksiskoordinator function in digital form.' }
      ],
      reflect: { no: 'Din første reaksjon: ville du brukt disse kanalene? Forventer du svar?', en: 'Your first reaction: would you use these channels? Do you expect responses?' },
      why: { no: 'Begge sider ønsket dialog (16 av 18), men strukturelle hindringer gjør at den sjelden skjer i dag.', en: 'Both sides wanted dialogue (16 of 18), but structural barriers mean it rarely happens today.' }
    }
  };

  var MODAL = {
    no: '<h2>Velkommen til en konseptprototype</h2>' +
      '<p>Dette er en klikkbar skisse av en idé for henvisningsstøtte mellom fastlege og DPS. Det er ikke et ferdig system, og alle pasientdata er oppdiktede.</p>' +
      '<p><strong>Forestill deg dette:</strong> tenk at verktøyet allerede er bygget inn i systemet du bruker til daglig, for eksempel DIPS, med pasientens informasjon ferdig utfylt. Vi tester ideen, ikke om den kan kobles til DIPS.</p>' +
      '<p><strong>Vi ønsker:</strong> om ideene faktisk ville hjulpet deg, hva som mangler, og hvor det kan endre vurderingen din.</p>' +
      '<p><strong>Vi trenger ikke</strong> tilbakemelding på farger, skrift, layout eller at det er en skisse. Se forbi det uferdige, til selve ideen.</p>',
    en: '<h2>Welcome to a concept prototype</h2>' +
      '<p>This is a clickable sketch of an idea for referral support between GP and DPS. It is not a finished system, and all patient data is fictional.</p>' +
      '<p><strong>Please imagine this:</strong> picture the tool already built into the system you use every day, for example DIPS, with the patient’s information already filled in. We are testing the idea, not whether it can be connected to DIPS.</p>' +
      '<p><strong>We want:</strong> whether the ideas would genuinely help you, what is missing, and where it might change your assessment.</p>' +
      '<p><strong>We do not need</strong> feedback on colours, fonts, layout, or the fact that it is a sketch. Look past the unfinished parts, to the idea itself.</p>'
  };

  function railText(lang) {
    return lang === 'en'
      ? 'Concept prototype with fictional data. Imagine it inside DIPS. Judge the idea, not the look.'
      : 'Konseptprototype med fiktive data. Forestill deg det inne i DIPS. Vurder ideen, ikke utseendet.';
  }

  /* ---------------- context ---------------- */

  function getContext() {
    var path = location.pathname;
    var m = path.match(/\/(gp|specialist|shared)\//);
    var folder = m ? m[1] : '';
    var prefix = folder ? '../' : '';
    var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    var page = file.replace('.html', '');
    var role = null;
    if (folder === 'gp') role = 'gp';
    else if (folder === 'specialist') role = 'specialist';
    else if (folder === 'shared') { try { role = sessionStorage.getItem('atlas-role') || 'gp'; } catch (e) { role = 'gp'; } }
    if (role && folder !== 'shared') { try { sessionStorage.setItem('atlas-role', role); } catch (e) {} }
    return { folder: folder, prefix: prefix, file: file, page: page, role: role, rel: folder ? folder + '/' + file : file, isScreen: !!folder };
  }

  function L(o, lang) { return lang === 'en' ? o.en : o.no; }

  /* ---------------- builders ---------------- */

  function renderNav(c, lang) {
    var bar = document.querySelector('.nav-bar');
    if (!bar) return;
    var items = NAV[c.role] || NAV.gp;
    var links = items.map(function (it) {
      var active = it.file === c.rel ? ' class="active"' : '';
      return '<li><a href="' + c.prefix + it.file + '"' + active + '>' + L(it, lang) + '</a></li>';
    }).join('');
    var roleLbl = ROLE_LABEL[c.role] ? L(ROLE_LABEL[c.role], lang) : '';
    bar.innerHTML =
      '<a class="nav-title" href="' + c.prefix + 'index.html">ATLAS</a>' +
      '<ul class="nav-links">' + links + '</ul>' +
      '<div class="nav-right">' +
        (roleLbl ? '<span class="nav-role">' + roleLbl + '</span>' : '') +
        '<button type="button" class="nav-guide-btn">' + (lang === 'en' ? 'Guide' : 'Veiledning') + '</button>' +
        '<div class="lang-toggle"><button data-lang="no"' + (lang !== 'en' ? ' class="active"' : '') + '>NO</button><button data-lang="en"' + (lang === 'en' ? ' class="active"' : '') + '>EN</button></div>' +
      '</div>';
  }

  function renderRail(c, lang) {
    var bar = document.querySelector('.nav-bar');
    if (!bar) return;
    var rail = document.getElementById('atlas-rail');
    if (!rail) {
      rail = document.createElement('div');
      rail.id = 'atlas-rail';
      rail.className = 'atlas-rail';
      bar.parentNode.insertBefore(rail, bar.nextSibling);
    }
    rail.innerHTML = '<span>' + railText(lang) + '</span><button type="button" class="atlas-rail-help">' + (lang === 'en' ? 'What is this?' : 'Hva er dette?') + '</button>';
  }

  function renderGuide(c, lang) {
    var pc = document.querySelector('.page-container');
    if (!pc) return;
    var g = GUIDE[c.page];
    var node = document.getElementById('atlas-guide');
    if (!g) { if (node && node.parentNode) node.parentNode.removeChild(node); return; }
    if (!node) {
      node = document.createElement('section');
      node.id = 'atlas-guide';
      node.className = 'atlas-guide';
      var header = pc.querySelector('.screen-header');
      if (header) header.insertAdjacentElement('afterend', node);
      else pc.insertBefore(node, pc.firstChild);
    }
    var notice = g.notice.map(function (n) { return '<li>' + L(n, lang) + '</li>'; }).join('');
    node.innerHTML =
      '<div class="atlas-guide-head"><h3>' + (lang === 'en' ? 'Guide for this screen' : 'Veiledning for denne skjermen') + '</h3><button type="button" class="atlas-guide-collapse" aria-label="toggle">-</button></div>' +
      '<div class="atlas-guide-body">' +
        (g.scenario ? '<p class="atlas-guide-scenario">' + L(g.scenario, lang) + '</p>' : '') +
        '<p class="atlas-guide-label">' + (lang === 'en' ? 'What to notice' : 'Hva du bør legge merke til') + '</p>' +
        '<ul>' + notice + '</ul>' +
        (g.reflect ? '<p class="atlas-guide-reflect">' + L(g.reflect, lang) + '</p>' : '') +
        (g.why ? '<button type="button" class="atlas-why-toggle">' + (lang === 'en' ? 'Why we built this (open after you have reacted)' : 'Hvorfor vi laget dette (åpne etter at du har reagert)') + '</button><div class="atlas-why-body is-hidden">' + L(g.why, lang) + '</div>' : '') +
      '</div>';
  }

  function renderPrevNext(c, lang) {
    var pc = document.querySelector('.page-container');
    if (!pc) return;
    var items = NAV[c.role] || NAV.gp;
    var idx = -1;
    for (var i = 0; i < items.length; i++) { if (items[i].file === c.rel) idx = i; }
    var node = document.getElementById('atlas-prevnext');
    if (idx < 0) { if (node && node.parentNode) node.parentNode.removeChild(node); return; }
    if (!node) {
      node = document.createElement('nav');
      node.id = 'atlas-prevnext';
      node.className = 'atlas-prevnext';
      pc.appendChild(node);
    }
    var prev = idx > 0 ? items[idx - 1] : null;
    var next = idx < items.length - 1 ? items[idx + 1] : null;
    node.innerHTML =
      (prev ? '<a class="btn" href="' + c.prefix + prev.file + '">← ' + L(prev, lang) + '</a>' : '<span></span>') +
      (next ? '<a class="btn btn-primary" href="' + c.prefix + next.file + '">' + L(next, lang) + ' →</a>' : '<span></span>');
  }

  function renderModal(c, lang) {
    if (!c.isScreen) return;
    var overlay = document.getElementById('atlas-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'atlas-modal-overlay';
      overlay.className = 'atlas-modal-overlay is-hidden';
      overlay.innerHTML = '<div class="atlas-modal"><div class="atlas-modal-content"></div><div class="atlas-modal-actions"><button type="button" class="btn btn-primary atlas-modal-close"></button></div></div>';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('.atlas-modal-content').innerHTML = MODAL[lang];
    overlay.querySelector('.atlas-modal-close').textContent = lang === 'en' ? 'Start' : 'Start';
  }

  function renderChrome(lang) {
    var c = getContext();
    renderNav(c, lang);
    renderRail(c, lang);
    renderGuide(c, lang);
    renderPrevNext(c, lang);
    renderModal(c, lang);
  }
  window.atlasRenderChrome = renderChrome;

  function closeModal() {
    var ov = document.getElementById('atlas-modal-overlay');
    if (ov) ov.classList.add('is-hidden');
    try { sessionStorage.setItem('atlas-seen-intro', '1'); } catch (e) {}
  }

  /* ---------------- interactions ---------------- */

  document.addEventListener('click', function (e) {
    var lb = e.target.closest('.lang-toggle button');
    if (lb && lb.dataset.lang) { setLanguage(lb.dataset.lang); renderChrome(lb.dataset.lang); return; }

    if (e.target.closest('.nav-guide-btn')) {
      var g = document.getElementById('atlas-guide');
      if (g) {
        var b = g.querySelector('.atlas-guide-body');
        if (b) b.classList.remove('is-hidden');
        var col = g.querySelector('.atlas-guide-collapse');
        if (col) col.textContent = '-';
        g.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    var collapse = e.target.closest('.atlas-guide-collapse');
    if (collapse) {
      var guide = collapse.closest('.atlas-guide');
      var body = guide.querySelector('.atlas-guide-body');
      if (body) { body.classList.toggle('is-hidden'); collapse.textContent = body.classList.contains('is-hidden') ? '+' : '-'; }
      return;
    }

    var why = e.target.closest('.atlas-why-toggle');
    if (why) { var wb = why.nextElementSibling; if (wb) wb.classList.toggle('is-hidden'); return; }

    if (e.target.closest('.atlas-rail-help')) {
      var ov = document.getElementById('atlas-modal-overlay');
      if (ov) ov.classList.remove('is-hidden');
      return;
    }

    if (e.target.closest('.atlas-modal-close')) { closeModal(); return; }
    var overlayEl = document.getElementById('atlas-modal-overlay');
    if (overlayEl && e.target === overlayEl) { closeModal(); return; }

    var rc = e.target.closest('[data-atlas-role]');
    if (rc) { try { sessionStorage.setItem('atlas-role', rc.getAttribute('data-atlas-role')); } catch (e2) {} }
  });

  /* ---------------- init ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    var c = getContext();
    var lang = currentLang();
    renderChrome(lang);
    setLanguage(lang);
    if (c.isScreen) {
      var seen = null;
      try { seen = sessionStorage.getItem('atlas-seen-intro'); } catch (e) {}
      if (!seen) { var ov = document.getElementById('atlas-modal-overlay'); if (ov) ov.classList.remove('is-hidden'); }
    }
  });

})();
