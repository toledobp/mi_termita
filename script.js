/* ============================================================
   Historia interactiva — "Hay algo especial para ti"
   Estados: intro -> riego1 (0/50) -> transición -> riego2 (0/15)
            -> floración -> mensaje final
   Todo el arte es SVG generado por código (nada de imágenes/video).
   ============================================================ */

const app = document.getElementById('app');

const STATE = {
  INTRO: 'intro',
  WATER1: 'water1',
  TRANSITION: 'transition',
  WATER2: 'water2',
  BLOOM: 'bloom',
  FINAL: 'final'
};

let current = STATE.INTRO;
let progress1 = 0;   // 0..50
let progress2 = 0;   // 0..15
const NEEDED1 = 50;
const NEEDED2 = 15;

/* ---------------- Snail (original character, hand-drawn feel) ---------------- */
function snailSVG({ happy = false, reaching = false } = {}) {
  return `
  <svg class="snail-wrap" viewBox="0 0 240 170" width="220" height="156">
    <!-- shell -->
    <g transform="translate(58,78)">
      <circle r="46" fill="var(--shell)"/>
      <path d="M0,0 m-32,0 a32,32 0 1,1 64,0 a32,32 0 1,1 -64,0" fill="none" stroke="var(--shell-dark)" stroke-width="4" opacity=".5"/>
      <path d="M0,-20 A20,20 0 1 1 -1,-20" fill="none" stroke="var(--shell-dark)" stroke-width="4"/>
      <circle r="8" fill="var(--shell-dark)"/>
    </g>
    <!-- body -->
    <path d="M18,150 Q10,100 50,92 Q95,84 118,110 Q132,126 118,140 Q90,158 18,150 Z" fill="var(--body-snail)"/>
    <!-- head -->
    <circle cx="128" cy="96" r="26" fill="var(--body-snail)"/>
    <ellipse class="snail-blush" cx="112" cy="104" rx="6" ry="4"/>
    <!-- antennae -->
    <path class="snail-antenna" d="M118,78 Q110,55 104,48"/>
    <path class="snail-antenna" d="M136,78 Q142,55 148,48"/>
    <circle cx="104" cy="46" r="4.5" fill="var(--shell-dark)"/>
    <circle cx="148" cy="46" r="4.5" fill="var(--shell-dark)"/>
    <!-- eyes -->
    ${happy
      ? `<path class="snail-eye" d="M119,94 q4,-6 8,0"/><path class="snail-eye" d="M133,94 q4,-6 8,0"/>`
      : `<path class="snail-eye" d="M120,92 q4,-5 7,0"/><path class="snail-eye" d="M134,92 q4,-5 7,0"/>`
    }
    <!-- smile -->
    <path class="snail-eye" d="M120,106 q10,8 20,0" stroke-width="3.4"/>
  </svg>`;
}

/* ---------------- Plant stage 1: grows continuously with progress (0..1) ---------------- */
function plantStage1SVG(t) {
  // t: 0..1 progress through the 50 waterings
  const stemH = 10 + t * 80;                 // stem height grows
  const leafScale = Math.min(1, t * 2.2);     // leaves fade/scale in early-mid
  const budR = 4 + t * 10;                    // small bud forms at the tip
  const glow = 0.15 + t * 0.55;
  return `
  <svg viewBox="0 0 160 170" width="150" height="160" style="filter:drop-shadow(0 0 ${10 + t*18}px rgba(246,195,67,${glow}))">
    <ellipse cx="80" cy="158" rx="50" ry="9" fill="#3a2412"/>
    <path d="M80,158 L80,${158 - stemH}" stroke="var(--stem)" stroke-width="6" stroke-linecap="round"/>
    <g transform="translate(80,${158 - stemH*0.55}) scale(${leafScale})">
      <path d="M0,0 Q-26,-8 -30,14" fill="none" stroke="var(--leaf-dark)" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g transform="translate(80,${158 - stemH*0.75}) scale(${leafScale})">
      <path d="M0,0 Q26,-4 32,18" fill="none" stroke="var(--leaf)" stroke-width="6" stroke-linecap="round"/>
    </g>
    <circle cx="80" cy="${158 - stemH}" r="${budR}" fill="var(--gold-soft)"/>
  </svg>`;
}

/* ---------------- Plant stage 2: bud opening into full flower (0..1) ---------------- */
function plantStage2SVG(t) {
  // Milestones per spec are just smooth interpolation checkpoints -> use t directly.
  const petalCount = Math.round(2 + t * 8);      // 2 -> 10 petals appearing
  const petalLen = 6 + t * 30;
  const petalOpen = t;                            // 0 closed .. 1 fully open (angle spread)
  const coreR = 6 + t * 10;
  const glow = 0.25 + t * 0.9;
  let petals = '';
  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i;
    const bendOut = 20 + petalOpen * 20; // petals swing outward as it opens
    petals += `<ellipse cx="0" cy="${-14 - petalOpen*bendOut*0.4}" rx="9" ry="${petalLen}"
                fill="var(--gold-soft)" transform="rotate(${angle}) translate(0,${-petalOpen*6})"/>`;
  }
  return `
  <svg viewBox="0 0 180 210" width="170" height="200" style="filter:drop-shadow(0 0 ${16+t*26}px rgba(246,195,67,${glow}))">
    <ellipse cx="90" cy="198" rx="54" ry="9" fill="#3a2412"/>
    <path d="M90,198 L90,90" stroke="var(--stem)" stroke-width="7" stroke-linecap="round"/>
    <path d="M90,138 Q56,126 50,150" fill="none" stroke="var(--leaf-dark)" stroke-width="6" stroke-linecap="round"/>
    <path d="M90,150 Q126,138 136,160" fill="none" stroke="var(--leaf)" stroke-width="6" stroke-linecap="round"/>
    <g transform="translate(90,80)">
      ${petals}
      <circle r="${coreR}" fill="var(--gold)"/>
    </g>
  </svg>`;
}

function fullFlowerSVG() {
  let petals = '';
  for (let i = 0; i < 10; i++) {
    petals += `<ellipse cx="0" cy="-34" rx="12" ry="28" fill="var(--gold-soft)" transform="rotate(${i*36})"/>`;
  }
  return `
  <svg viewBox="0 0 200 230" width="190" height="220" class="glow-strong">
    <ellipse cx="100" cy="218" rx="58" ry="10" fill="#3a2412"/>
    <path d="M100,218 L100,110" stroke="var(--stem)" stroke-width="8" stroke-linecap="round"/>
    <path d="M100,150 Q62,136 55,162" fill="none" stroke="var(--leaf-dark)" stroke-width="7" stroke-linecap="round"/>
    <path d="M100,164 Q140,150 150,174" fill="none" stroke="var(--leaf)" stroke-width="7" stroke-linecap="round"/>
    <g transform="translate(100,96)">${petals}<circle r="17" fill="var(--gold)"/></g>
  </svg>`;
}

/* ---------------- Ambient particles ---------------- */
function spawnSparkles(container, count = 3) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const size = 3 + Math.random() * 4;
    s.style.width = s.style.height = size + 'px';
    s.style.left = (30 + Math.random() * 60) + '%';
    s.style.top = (20 + Math.random() * 50) + '%';
    container.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}
function spawnDrops(container, count) {
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'drop';
    d.textContent = '💧';
    d.style.left = (38 + Math.random() * 30) + '%';
    d.style.top = '4px';
    d.style.animationDelay = (i * 0.06) + 's';
    container.appendChild(d);
    setTimeout(() => d.remove(), 750);
  }
}
function spawnPetalsFloating(container, count = 8) {
  const leaves = ['🌼', '🍃', '✨'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = leaves[i % leaves.length];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (5 + Math.random() * 3) + 's';
    p.style.animationDelay = (Math.random() * 2) + 's';
    container.appendChild(p);
  }
}
function spawnHearts(container, count = 6) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'mini-heart';
    h.textContent = '♡';
    h.style.left = (20 + Math.random() * 60) + '%';
    h.style.bottom = '10px';
    h.style.animationDelay = (Math.random() * 3) + 's';
    container.appendChild(h);
  }
}

/* ---------------- Renderers per state ---------------- */
function render() {
  if (current === STATE.INTRO) return renderIntro();
  if (current === STATE.WATER1) return renderWater1();
  if (current === STATE.TRANSITION) return renderTransition();
  if (current === STATE.WATER2) return renderWater2();
  if (current === STATE.BLOOM) return renderBloomFlash();
  if (current === STATE.FINAL) return renderFinal();
}

function renderIntro() {
  app.innerHTML = `
    <div class="scene">
      <div class="caption">le ise algoo pa utee <span style="opacity:.6">♡</span></div>
      <div class="stage-visual">
        ${snailSVG({ happy: true })}
        <div style="position:absolute;bottom:8px;right:10px" id="heartHolder">
          <svg id="heart" class="heart-btn" viewBox="0 0 100 90" width="78" height="70">
            <path d="M50 85 C10 55 0 30 20 15 C35 4 48 15 50 25 C52 15 65 4 80 15 C100 30 90 55 50 85 Z" fill="#c94b4b"/>
          </svg>
        </div>
      </div>
      <button class="primary-btn" id="startBtn">aprete el botóonnn♡</button>
    </div>
  `;
  const heart = document.getElementById('heart');
  const holder = document.getElementById('heartHolder');
  const start = () => {
    heart.classList.add('heart-pop');
    spawnSparkles(document.querySelector('.stage-visual'), 8);
    setTimeout(() => {
      current = STATE.WATER1;
      render();
    }, 650);
  };
  heart.addEventListener('click', start);
  document.getElementById('startBtn').addEventListener('click', start);
}

function renderWater1() {
  const t = progress1 / NEEDED1;
  app.innerHTML = `
    <div class="scene">
      <div class="caption">está creciendooo... <span style="opacity:.6">♡</span></div>
      <div class="subcaption">tiene que regar la plantitaa jijii </div>
      <div class="stage-visual" id="visual">
        ${snailSVG({})}
        <div style="position:absolute;bottom:0;right:6px">${plantStage1SVG(t)}</div>
      </div>
      <div class="can-wrap">
        ${canButton()}
        <div class="progress-track"><div class="progress-fill" id="fill" style="width:${t*100}%"></div></div>
        <div class="progress-label" id="counter">${progress1} / ${NEEDED1}</div>
      </div>
    </div>
  `;
  document.getElementById('canBtn').addEventListener('click', onWater1);
}

function onWater1() {
  progress1 = Math.min(NEEDED1, progress1 + 1);
  const visual = document.getElementById('visual');
  const snail = visual.querySelector('.snail-wrap');
  snail.classList.remove('wiggle'); void snail.offsetWidth; snail.classList.add('wiggle');

  spawnDrops(visual, 2 + Math.floor(Math.random() * 3));
  if (progress1 % 4 === 0) spawnSparkles(visual, 2 + Math.floor(Math.random() * 3));

  const t = progress1 / NEEDED1;
  visual.querySelector('div[style*="right:6px"]').innerHTML = plantStage1SVG(t);
  document.getElementById('fill').style.width = t * 100 + '%';
  document.getElementById('counter').textContent = `${progress1} / ${NEEDED1}`;

  if (progress1 >= NEEDED1) {
    spawnSparkles(visual, 10);
    setTimeout(() => { current = STATE.TRANSITION; render(); }, 700);
  }
}

function renderTransition() {
  app.innerHTML = `
    <div class="scene">
      <div class="caption">falta un poco maa, siga regandooo <span style="opacity:.6">♡</span></div>
      <div class="stage-visual">
        ${snailSVG({ happy: true })}
        <div style="position:absolute;bottom:0;right:6px">${plantStage1SVG(1)}</div>
      </div>
    </div>
  `;
  setTimeout(() => {
    current = STATE.WATER2;
    progress2 = 0;
    render();
  }, 1800);
}

function renderWater2() {
  const t = progress2 / NEEDED2;
  app.innerHTML = `
    <div class="scene">
      <div class="caption">litooo, jajsja faltaaa <span style="opacity:.6">♡</span></div>
      <div class="subcaption">siga regandoo</div>
      <div class="stage-visual" id="visual">
        ${snailSVG({})}
        <div style="position:absolute;bottom:0;right:0">${plantStage2SVG(t)}</div>
      </div>
      <div class="can-wrap">
        ${canButton()}
        <div class="progress-track"><div class="progress-fill" id="fill" style="width:${t*100}%"></div></div>
        <div class="progress-label" id="counter">${progress2} / ${NEEDED2}</div>
      </div>
    </div>
  `;
  document.getElementById('canBtn').addEventListener('click', onWater2);
}

function onWater2() {
  progress2 = Math.min(NEEDED2, progress2 + 1);
  const visual = document.getElementById('visual');
  const snail = visual.querySelector('.snail-wrap');
  snail.classList.remove('wiggle'); void snail.offsetWidth; snail.classList.add('wiggle');

  spawnDrops(visual, 2 + Math.floor(Math.random() * 3));
  spawnSparkles(visual, 2 + Math.floor(Math.random() * 4));

  const t = progress2 / NEEDED2;
  visual.querySelector('div[style*="right:0"]').innerHTML = plantStage2SVG(t);
  document.getElementById('fill').style.width = t * 100 + '%';
  document.getElementById('counter').textContent = `${progress2} / ${NEEDED2}`;

  if (progress2 >= NEEDED2) {
    setTimeout(() => { current = STATE.BLOOM; render(); }, 500);
  }
}

function canButton() {
  return `
  <button class="can-btn" id="canBtn">
    <svg viewBox="0 0 24 24" fill="none"><path d="M3 15h9l4-4h4l2 2-3 3H10l-2 2H3z" stroke="#2a1a08" stroke-width="1.6" fill="#2a1a08"/></svg>
    Regar la flor
  </button>`;
}

function renderBloomFlash() {
  app.innerHTML = `
    <div class="scene">
      <div class="caption">uuyyy ya la iso crecer, para utee miamor :) <span style="opacity:.6">♡</span></div>
      <div class="stage-visual" id="visual" style="background:radial-gradient(circle, rgba(255,224,138,.25), transparent 70%)">
        ${snailSVG({ happy: true })}
        <div style="position:absolute;bottom:0;right:0">${fullFlowerSVG()}</div>
      </div>
    </div>
  `;
  spawnSparkles(document.getElementById('visual'), 16);
  spawnPetalsFloating(document.getElementById('visual'), 10);
  setTimeout(() => { current = STATE.FINAL; render(); }, 1600);
}

function renderFinal() {
  app.innerHTML = `
    <div class="scene">
      <div class="caption">le quedó bonita <span style="opacity:.6">♡</span></div>
      <div class="stage-visual" id="visual">
        ${snailSVG({ happy: true })}
        <div style="position:absolute;bottom:0;right:0">${fullFlowerSVG()}</div>
      </div>
      <div id="msgBlock" style="min-height:70px">
        <div class="final-msg hidden" id="finalMsg">La amo muchoo <3 </div>
        <div class="final-sub hidden" id="finalSub">feli dia del amor miamorr 🌻</div>
      </div>
      <button class="primary-btn restart hidden" id="restartBtn"> otra flor?? :) </button>
    </div>
  `;
  const visual = document.getElementById('visual');
  spawnPetalsFloating(visual, 8);
  spawnHearts(visual, 6);
  setInterval(() => spawnSparkles(visual, 1), 900);

  setTimeout(() => {
    document.getElementById('finalMsg').classList.remove('hidden');
  }, 700);
  setTimeout(() => {
    document.getElementById('finalSub').classList.remove('hidden');
  }, 1700);
  setTimeout(() => {
    const btn = document.getElementById('restartBtn');
    btn.classList.remove('hidden');
    btn.addEventListener('click', () => {
      current = STATE.INTRO; progress1 = 0; progress2 = 0; render();
    });
  }, 2800);
}

/* ---------------- Boot ---------------- */
render();
