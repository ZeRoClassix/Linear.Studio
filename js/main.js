/* ============================================================
   Linear Studio — main.js
   ============================================================ */

/* ---------- helpers ---------- */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

let currentCurrency = localStorage.getItem("lin-currency") || "EUR";
const CURRENCIES = {
  USD: { symbol: "$", rate: 1.18, label: "USD" },
  EUR: { symbol: "€", rate: 1, label: "EUR" },
  GBP: { symbol: "£", rate: 0.85, label: "GBP" }
};
function fmtMoney(usd) {
  const c = CURRENCIES[currentCurrency];
  const converted = usd * c.rate;
  return c.symbol + converted.toFixed(2);
}
function convertPrice(usd) {
  const c = CURRENCIES[currentCurrency];
  return usd * c.rate;
}

/* ============================================================
   Particles — dots persist, lines breathe, connect, dissolve,
   then reconnect to new random dots.
   ============================================================ */

const Particles = (() => {
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let W, H, dots = [], raf = null;
  const DOT_COLOR = "rgba(148, 197, 255, 1)";
  const LINE_A = "rgba(56, 189, 248, ";
  const LINE_B = "rgba(167, 139, 250, ";

  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function seed() {
    const count = Math.min(110, Math.max(45, Math.floor((W * H) / 16000)));
    dots = Array.from({ length: count }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.16, 0.16),
      vy: rand(-0.16, 0.16),
      r: rand(1.1, 2.4),
      phase: rand(0, Math.PI * 2),
      target: null,
      link: { t: 0, dir: 1, duration: rand(120, 260) },
      hue: Math.random() > 0.35 ? "sky" : "violet"
    }));
    dots.forEach((d) => pickTarget(d));
  }

  function pickTarget(d) {
    d.target = dots[(Math.random() * dots.length) | 0];
    if (d.target === d) pickTarget(d);
    d.link.t = 0;
    d.link.dir = 1;
    d.link.duration = rand(140, 300);
  }

  function step(d) {
    d.phase += 0.02;
    const drift = Math.sin(d.phase) * 0.12;
    d.x += d.vx + drift;
    d.y += d.vy;
    if (d.x < -20) d.x = W + 20; else if (d.x > W + 20) d.x = -20;
    if (d.y < -20) d.y = H + 20; else if (d.y > H + 20) d.y = -20;
  }

  function linkAlpha(d) {
    const s = d.link.t / d.link.duration;
    d.link.t += d.link.dir;
    if (s >= 1) d.link.dir = -1;
    else if (s <= 0) pickTarget(d);
    return Math.sin((s % 1) * Math.PI);
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (const d of dots) {
      step(d);
      const ta = linkAlpha(d);
      if (ta > 0.02 && d.target) {
        const alpha = ta * 0.35;
        const grad = ctx.createLinearGradient(d.x, d.y, d.target.x, d.target.y);
        grad.addColorStop(0, (d.hue === "sky" ? LINE_A : LINE_B) + alpha + ")");
        grad.addColorStop(1, (d.hue === "sky" ? LINE_A : LINE_B) + (alpha * 0.4) + ")");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.target.x, d.target.y);
        ctx.stroke();
      }
    }

    for (const d of dots) {
      const pulse = 1 + Math.sin(d.phase * 1.6) * 0.25;
      ctx.beginPath();
      ctx.fillStyle = DOT_COLOR;
      ctx.globalAlpha = 0.85;
      ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    raf = requestAnimationFrame(frame);
  }

  function init() {
    resize();
    seed();
    frame();
    window.addEventListener("resize", () => { resize(); seed(); });
  }

  return { init };
})();

/* ============================================================
   Data
   ============================================================ */

const PRODUCTS = [
  {
    id: "cs2-lifetime",
    name: "LINEAR.CS2",
    game: "CS2",
    cat: "cs2",
    price: 44.99,
    img: "external/productsPIC/games/CounterStrike2_valorant_style_minimal.png",
    desc: "LINEAR.CS2 is the first release from Linear Studios, built on the legacy of Phobia. It delivers precise aiming, clean visuals, and smooth movement assistance optimized for Counter-Strike 2.\n\nA cleaner menu, smarter configs, and the foundation for everything to come. Built exclusively for CS2 with competitive integrity in mind, from Premier matchmaking to five-stack play.",
    tags: ["Kernel", "Undetected", "Competitive"],
    premium: false
  },
  {
    id: "val-lifetime",
    name: "LINEAR.VAL",
    game: "Valorant",
    cat: "val",
    price: 54.99,
    img: "external/productsPIC/games/linearVALOPROD.png",
    desc: "LINEAR.VAL is engineered for Valorant's unique netcode and rendering pipeline. It delivers precision aiming, clean visual feedback, and enhanced movement assistance optimized for Riot's anti-cheat.\n\nStreamlined features, low latency, and the tools to maintain consistency every round. Designed exclusively for Valorant with weekly rebuilds to stay ahead of patches.",
    tags: ["Weekly Rebuilds", "Anti-cheat Safe", "Tactical"],
    premium: true
  },
  {
    id: "rust-lifetime",
    name: "LINEAR.RUST",
    game: "Rust",
    cat: "rust",
    price: 34.99,
    img: "external/productsPIC/games/linearRUSTPROD_valorant-style-v2.png",
    desc: "LINEAR.RUST is built for Rust's open-world survival environment. It delivers advanced ESP, recoil compensation, and automation tools optimized for Facepunch's server architecture.\n\nClean interface, smarter configs, and the essential tools to dominate the wilderness. From resource gathering to PvP combat, everything you need to survive.",
    tags: ["ESP", "Silent", "Recoil"],
    premium: false
  },
  {
    id: "eft-lifetime",
    name: "LINEAR.EFT",
    game: "Escape from Tarkov",
    cat: "eft",
    price: 49.99,
    img: "external/productsPIC/games/linearETF_valorant-style.png",
    desc: "LINEAR.EFT is engineered for Escape from Tarkov's hardcore realism and intricate ballistics. Precision aiming, comprehensive ESP, and essential automation — all optimized for Battlestate Games.\n\nThe critical information you need to survive every raid. From loot prioritization to engagement awareness, Tarkov has never been this fair.",
    tags: ["Radar", "Prediction", "Hardcore"],
    premium: true
  },
  {
    id: "r6-lifetime",
    name: "LINEAR.R6",
    game: "Rainbow Six Siege",
    cat: "r6",
    price: 44.99,
    img: "external/productsPIC/games/RainbowSix_edit_v2.png",
    desc: "Where it all started. Kernel ESP, silent aim, and drone-man tracking tuned for every Siege season. Built on years of experience dominating Rainbow Six's competitive scene.\n\nLINEAR.R6 is built for Rainbow Six's destructible environments and operator-based gameplay. From wall-hack awareness to gadget highlighting, every feature is tuned for Siege's unique mechanics. Whether you're anchoring site or pushing as a duo, this is the tool that started it all. The legacy continues.",
    tags: ["Legacy", "Undetected", "Siege"],
    premium: true
  },
  {
    id: "apex-lifetime",
    name: "LINEAR.APEX",
    game: "Apex Legends",
    cat: "apex",
    price: 39.99,
    img: "external/productsPIC/games/linearAPEXW.webp",
    desc: "1v3 clutch software, silent aim, jump-scan radar, and movement tech that breaks the skill ceiling. Updated same-day on patch to keep up with the meta. Built for legends who want to dominate every drop.\n\nLINEAR.APEX is built for Apex Legends' fast-paced battle royale and unique movement mechanics. From loot prioritization to engagement awareness, every feature is tuned for the chaos of the Outlands. Slide, grapple, and third-party with the edge you need. Welcome to the next generation.",
    tags: ["Silent Aim", "No-Recoil", "Movement"],
    premium: false
  },
  {
    id: "phobia-r6",
    name: "PHOBIA CLIENT EXTERNAL",
    game: "Rainbow Six Siege",
    cat: "phobia",
    price: 74.99,
    img: "external/productsPIC/games/RainbowSix_edit_v2.png",
    desc: "PHOBIA is what Zenite became. When Zenite went quiet it wasn't retired it was rebuilt: same lineage, a cleaner stack, and a perfect detection record since the day the rebrand landed. Fully external. Fully undetected. Overpowered by design.\n\nThis client was the only product we shipped for years. Then we overhauled the stack and opened the floor to other games, expanding into a full lineup, which is exactly why you're reading this page on this website right now.",
    tags: ["PHOBIA ERA", "External", "Undetected"],
    premium: true
  },
  {
    id: "overlay-pack",
    name: "PHOBIA EXTERNAL",
    game: "Universal",
    cat: "phobia",
    price: 89.99,
    img: "external/productsPIC/misc/phobiaEXTERNAL.png",
    desc: "The PHOBIA-grade external framework, engineered for users who demand a clean, reliable overlay runtime without interference. Fully external overlay with DX12, DX11, and DX9 render paths and a clean documented API.\n\nShipped with full source code, zero watermarks, and zero telemetry. Includes FIBERNETIC by default with extensive comments throughout the core files. Built during the PHOBIA ERA, this framework remains undetected and battle-tested across a wide range of titles. Welcome to the next generation.",
    tags: ["PHOBIA ERA", "DX12 / DX11 / DX9", "Source"],
    premium: true
  },
  {
    id: "internal-menu",
    name: "LINEAR.INTERNAL",
    game: "Universal",
    cat: "misc",
    price: 69.99,
    img: "external/productsPIC/misc/linearINTERNAL.png",
    desc: "LINEAR.INTERNAL is the first release from Linear Studios, providing a full internal menu runtime for game modification and enhancement. This package includes an in-process renderer, SDK hooks, and a config system, all shipped with full source code.\n\nIt supports DX9, DX11, and DX12 rendering backends, making it compatible with a wide range of games. The menu is designed as a standalone overlay that can be injected into any supported game. With a focus on stability and performance, LINEAR.INTERNAL gives developers and users a solid foundation for building custom game enhancements. Welcome to the next generation.",
    tags: ["Lifetime", "Internal", "Source"],
    premium: true
  },
  {
    id: "hwid-spoofer",
    name: "LINEAR.HWID",
    game: "Spoofer",
    cat: "spoofer",
    price: 29.99,
    img: "external/productsPIC/spoofer/fullSpooferNEW.png",
    desc: "LINEAR.HWID is engineered for hardware identity management and system fingerprint randomization. It spoofs critical hardware identifiers, designed to survive OS reinstalls and system reboots.\n\nWith a clean interface and minimal resource footprint, LINEAR.HWID gives users full control over their system's hardware footprint. Comprehensive spoofing of motherboard serials, volume serials, disk IDs, and GPU identifiers, all for legitimate testing and diagnostic purposes.",
    tags: ["Motherboard", "Ban-wave Proof", "Reinstall Safe"],
    premium: false
  },
  {
    id: "spoofer-bundle",
    name: "LINEAR.SPOOFER+",
    game: "Spoofer",
    cat: "spoofer",
    price: 49.99,
    img: "external/productsPIC/spoofer/fullSpooferNEW.png",
    desc: "LINEAR.SPOOFER+ is engineered for hardware identity management with BattlEye bypass included. It spoofs critical hardware identifiers, designed to survive OS reinstalls and system reboots.\n\nIncludes everything in LINEAR.HWID plus a BattlEye bypass that auto-updates if patched. Full control over your system's hardware fingerprint with zero downtime.",
    tags: ["Bundle", "Best Value", "BattlEye"],
    premium: true
  },
  {
    id: "r6-nfa",
    name: "R6 RANKED NFA",
    game: "R6 Accounts",
    cat: "accounts",
    price: 7,
    img: "external/productsPIC/account/linearACC.png",
    desc: "A non-first-account R6 Siege account, ready for ranked play the moment you log in. Fresh email included with full access.\n\nBypasses the new player grind so you can jump straight into competitive matchmaking. Replacement guaranteed within 24 hours if the account receives a temporary ban. Clean history, no prior suspensions, and ready to queue.",
    tags: ["NFA", "Ranked Ready", "Instant Delivery"],
    premium: false
  },
  {
    id: "r6-stacked",
    name: "R6 STACKED",
    game: "R6 Accounts",
    cat: "accounts",
    price: 18,
    img: "external/productsPIC/account/linearACC.png",
    desc: "A premium R6 Siege account loaded with the best skins, R6 Credits, and exclusive champ charms. Full email access provided.\n\nNo grinding required, everything is already unlocked and ready to show off. Whether you want the rarest cosmetics or a head start on the battle pass, this account has it all. Complete ownership with full email credentials.",
    tags: ["Stacked", "Full Access", "Instant Delivery"],
    premium: true
  },
  {
    id: "cs2-prime",
    name: "CS2 PRIME NFA",
    game: "CS2 Accounts",
    cat: "accounts",
    price: 7,
    img: "external/productsPIC/account/linearACC.png",
    desc: "A Prime-enabled CS2 account with phone verification already bypassed. Fresh matchmaking history, no prior bans.\n\nFull email access included. No need to deal with SMS verification or waiting periods, just log in and queue. Clean slate, Prime status, and ready to rank.",
    tags: ["Prime", "NFA", "Instant Delivery"],
    premium: false
  },
  {
    id: "triple-bundle",
    name: "3 IN 1 ACCOUNT BUNDLE",
    game: "Account Bundle",
    cat: "accounts",
    price: 45,
    img: "external/productsPIC/account/linearACC2.png",
    desc: "The complete starter pack for competitive players. Includes a Prime CS2 10k elo account, a stacked high-rank R6 account, and a fresh R6 ranked NFA.\n\nThree fully loaded accounts, one checkout. Full email access for all three. The fastest way to get into the action across both games.",
    tags: ["Bundle", "Prime CS2", "Stacked R6", "Fresh NFA"],
    premium: true
  },
  {
    id: "be-bypass",
    name: "BATTLEYE BYPASS",
    game: "BattlEye",
    cat: "ac",
    price: 24.99,
    img: "external/productsPIC/anti cheat/linearBEAC.png",
    desc: "A signature-level bypass for BattlEye protected titles, engineered to operate at the kernel level with minimal system overhead. Re-signed within hours of every BattlEye update.\n\nThe driver loads early in the boot process, before BattlEye initializes, allowing it to mask its presence and intercept anti-cheat queries without detection. Compatible with Windows 10 and 11, including HVCI-enabled systems. Lightweight footprint with near-zero CPU usage and automatic recovery on system reboot.",
    tags: ["BattlEye", "Fast Re-sign", "Kernel"],
    premium: false
  },
  {
    id: "eac-bypass",
    name: "EAC BYPASS",
    game: "Easy Anti-Cheat",
    cat: "ac",
    price: 24.99,
    img: "external/productsPIC/anti cheat/linearEAC.png",
    desc: "A driver-based bypass for Easy Anti-Cheat protected titles, designed for stealth and reliability. Loads as a kernel driver, invisible to user-mode scans.\n\nHVCI compatible and fully functional on modern Windows builds. The bypass maintains its state across reboots and updates automatically when EAC pushes new versions. Includes a rollback mechanism to restore system integrity after use.",
    tags: ["EAC", "Kernel", "Stealth"],
    premium: false
  },
  {
    id: "linear-custom",
    name: "LINEAR.CUSTOM",
    game: "Everything",
    cat: "misc",
    price: 149.99,
    img: "external/productsPIC/misc/linearCUSTOM.png",
    desc: "LINEAR.CUSTOM is a private custom client designed for users who demand full control over their environment. This package includes both internal and external execution paths, with support for DX12, DX11, and DX9 renderers.\n\nIt provides SDK hooks, internal hooking, and optional fiber-based hooks for advanced use cases. Integrity verification is built in to ensure clean operation. Shipped with full source code and access to a private build channel for updates and support. Welcome to the next generation.",
    tags: ["Lifetime", "Custom Build", "Internal + External"],
    premium: true
  }
];

const GAME_CATS = ["cs2", "val", "rust", "eft", "r6", "apex"];

const TOP_TABS = [
  {
    key: "phobia",
    label: "PHOBIA",
    era: true
  },
  {
    key: "games",
    label: "Games",
    menu: [
      { key: "all", label: "All" },
      { key: "cs2", label: "CS2" },
      { key: "val", label: "Valorant" },
      { key: "rust", label: "Rust" },
      { key: "eft", label: "Tarkov" },
      { key: "r6", label: "Rainbow Six Siege" },
      { key: "apex", label: "Apex" }
    ]
  },
  { key: "spoofer", label: "Spoofers" },
  { key: "accounts", label: "Accounts" },
  { key: "ac", label: "AC Bypass" },
  { key: "misc", label: "MISC" }
];

const PRODUCT_ICONS = {
  cs2: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  val: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16v5l-8 11-8-11V4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M4 9h16" stroke="currentColor" stroke-width="2"/></svg>`,
  rust: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="2"/><path d="M12 3v5.5M12 15.5V21M3 12h5.5M15.5 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  eft: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21V9l6-4 6 4v12M15 21V14l3-1v8M3 21h18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  fort: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.2 6.9a2 2 0 0 0 1.3 1.3L22 12l-6.5 1.8a2 2 0 0 0-1.3 1.3L12 22l-2.2-6.9a2 2 0 0 0-1.3-1.3L2 12l6.5-1.8a2 2 0 0 0 1.3-1.3L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  r6: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 L20 6.5 V16.5 L12 21 L4 16.5 V6.5 Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="11" r="1.6" fill="currentColor"/><path d="M7.5 8.5l2.5 2M16.5 8.5l-2.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  apex: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l8 5v10l-8 5-8-5V7l8-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 8v4l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  universal: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="10" r="1.6" fill="currentColor"/><circle cx="15" cy="10" r="1.6" fill="currentColor"/><rect x="8" y="14.5" width="8" height="1.8" rx="0.9" fill="currentColor"/></svg>`,
  mobo: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><rect x="8.5" y="8.5" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/><path d="M6 6.5h.01M18 6.5h.01M6 17.5h.01M18 17.5h.01M12 6v2.5M12 15.5V18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  account: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9.5" cy="7.5" r="3" stroke="currentColor" stroke-width="2"/><path d="M3.5 19.5c.6-3.4 2.8-5 6-5s5.4 1.6 6 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.5 5.5a2.5 2.5 0 0 1 0 4M19.5 14.5c1.5.7 2.2 2.2 2.5 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l7 3.5v5c0 4.1-2.8 7.6-7 9-4.2-1.4-7-4.9-7-9v-5L12 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9a4.5 4.5 0 0 1 4.5 4.5M12 9v4.5a2 2 0 0 1 2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="9" r="1.2" fill="currentColor"/></svg>`,
  chip: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" stroke-width="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

const iconFor = (p) =>
  p.id.includes("cs2") ? PRODUCT_ICONS.cs2
  : p.id.includes("val") ? PRODUCT_ICONS.val
  : p.id.includes("rust") ? PRODUCT_ICONS.rust
  : p.id.includes("eft") ? PRODUCT_ICONS.eft
  : p.id.includes("r6") ? PRODUCT_ICONS.r6
  : p.id.includes("apex") ? PRODUCT_ICONS.apex
  : p.cat === "spoofer" ? PRODUCT_ICONS.mobo
  : p.cat === "accounts" ? PRODUCT_ICONS.account
  : p.cat === "ac" ? PRODUCT_ICONS.shield
  : p.cat === "misc" ? (p.id.includes("internal") ? PRODUCT_ICONS.chip : PRODUCT_ICONS.universal)
  : PRODUCT_ICONS.universal;

const STATUS_ITEMS = [
  { name: "Auth API", state: "up", ms: 34, uptime: 99.98 },
  { name: "License Server", state: "up", ms: 41, uptime: 99.97 },
  { name: "CDN / Downloads", state: "up", ms: 88, uptime: 99.94 },
  { name: "Loader / Updater", state: "up", ms: 27, uptime: 99.99 },
  { name: "Game Checkers", state: "up", ms: 52, uptime: 99.96 },
  { name: "WebSocket Relay", state: "up", ms: 39, uptime: 99.95 }
];

const REVIEWS = [
  {
    name: "sh1ro",
    handle: "@sh1ro",
    text: "been here since the zenite days and phobia is exactly what i wanted the successor to be drone tracking is stupid consistent zero detections in four months of ranked and the menu looks better than my actual game settings",
    stars: 5,
    product: "PHOBIA CLIENT EXTERNAL",
    ago: Date.now()-86400000,
    group: "phobia",
    featured: true
  },
  {
    name: "vex",
    handle: "@vex.css",
    text: "hit champ in 9 days with the phobia client silent aim tuned right feels like a better version of you not a robot worth every cent at month price insane at year",
    stars: 5,
    product: "PHOBIA CLIENT EXTERNAL",
    ago: Date.now()-172800000,
    group: "phobia"
  },
  {
    name: "Mira Chen",
    handle: "@mirachen",
    text: "the dx11 path on the phobia external framework is plug and play docs actually make sense used it to build my own overlay in a weekend",
    stars: 5,
    product: "PHOBIA EXTERNAL",
    ago: Date.now()-345600000,
    group: "phobia"
  },
  {
    name: "void_runner",
    handle: "@voidrunner",
    text: "three months of ranked with LINEAR.CS2 and not a single ban the radar alone wins rounds before they even start setup took four minutes",
    stars: 5,
    product: "LINEAR.CS2",
    ago: Date.now()-172800000,
    group: "cheats"
  },
  {
    name: "Mara Luna",
    handle: "@maraluna",
    text: "was skeptical after getting burned by two other providers the eft loot radar paid for itself in one night of lighthouse runs support answers within the hour",
    stars: 5,
    product: "LINEAR.EFT",
    ago: Date.now()-432000000,
    group: "cheats"
  },
  {
    name: "kr1p",
    handle: "@kr1p",
    text: "bought the full studio bundle worth every cent every game works updates land same-day on patches and the loader never triggers false positives",
    stars: 5,
    product: "LINEAR.STUDIO",
    ago: Date.now()-604800000,
    group: "cheats"
  },
  {
    name: "Sofia Reyes",
    handle: "@sofia.rey",
    text: "val still working after the last three updates while my friends cheats are all dead weekly rebuilds are not marketing they actually ship them",
    stars: 4,
    product: "LINEAR.VAL",
    ago: Date.now()-604800000,
    group: "cheats"
  },
  {
    name: "diesel",
    handle: "@diesel_",
    text: "rust esp with ore filtering is a cheat code farmed 1k scrap an hour while the zergs fight over nothing clean overlay zero stutter on my 6 year old rig",
    stars: 5,
    product: "LINEAR.RUST",
    ago: Date.now()-1209600000,
    group: "cheats"
  },
  {
    name: "Amir Haddad",
    handle: "@amirhd",
    text: "apex no-recoil is suspiciously smooth silent aim off radar on you play better not robotic thats the difference between a tool and a crutch",
    stars: 5,
    product: "LINEAR.APEX",
    ago: Date.now()-1814400000,
    group: "cheats"
  },
  {
    name: "tomb",
    handle: "@tomb.r6",
    text: "linear.r6 carried my squad through two seasons reinforcement state detection is the detail nobody else gets right you always know where the walls are soft",
    stars: 5,
    product: "LINEAR.R6",
    ago: Date.now()-518400000,
    group: "cheats"
  },
  {
    name: "Elena Petrova",
    handle: "@elenap",
    text: "support walked me through spoofing my motherboard in ten minutes serial verified clean three ban waves later still flying under the radar",
    stars: 5,
    product: "LINEAR.HWID",
    ago: Date.now()-518400000,
    group: "software"
  },
  {
    name: "arch",
    handle: "@arch.dev",
    text: "bought LINEAR.CUSTOM for a private project internal and external in one build fiber hooks included source handed over clean this is a dev shop pretending to be a cheat site",
    stars: 5,
    product: "LINEAR.CUSTOM",
    ago: Date.now()-604800000,
    group: "software"
  },
  {
    name: "rx7",
    handle: "@rx7",
    text: "bought a ranked r6 nfa delivered in four minutes full email access ranked ready flawless transaction already back for a second",
    stars: 5,
    product: "R6 RANKED NFA",
    ago: Date.now()-259200000,
    group: "accounts"
  },
  {
    name: "Nia Okafor",
    handle: "@niaokafor",
    text: "their tarkov radar is the best money ive spent in gaming period the loot filter alone is worth it",
    stars: 5,
    product: "LINEAR.EFT",
    ago: Date.now()-1209600000,
    group: "cheats"
  }
];

function timeAgo(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  if (d < 7) return d + "d ago";
  const w = Math.floor(d / 7);
  if (w < 4) return w + "w ago";
  const mo = Math.floor(d / 30);
  return mo + "mo ago";
}

function reviewWhen(r) {
  return timeAgo(Date.now() - r.ago);
}

function formatUsage(mins) {
  if (mins < 60) return Math.round(mins) + "m";
  const h = mins / 60;
  return h.toFixed(1).replace(/\.0$/, "") + "h";
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  "linear-gradient(135deg,#a78bfa,#7c3aed)",
  "linear-gradient(135deg,#34d399,#10b981)",
  "linear-gradient(135deg,#fbbf24,#f59e0b)",
  "linear-gradient(135deg,#f87171,#ef4444)",
  "linear-gradient(135deg,#2dd4bf,#0d9488)"
];

/* ============================================================
   Home marquees — game cards, chips, review ticker
   ============================================================ */

const GAMES = [
  {
    name: "Rainbow Six Siege",
    tag: "Zenite origin",
    color: "#38bdf8",
    glow: "56, 189, 248",
    img: "external/linearR6.png",
    imgClass: "r6"
  },
  {
    name: "Fortnite",
    tag: "Storm proof",
    color: "#a78bfa",
    glow: "167, 139, 250",
    img: "external/linearFN.avif",
    imgClass: "hero"
  },
  {
    name: "Rust",
    tag: "Farm faster",
    color: "#f59e0b",
    glow: "245, 158, 11",
    img: "external/linearRUST.avif",
    imgClass: "rust"
  },
  {
    name: "Call of Duty",
    tag: "Kernel silent",
    color: "#facc15",
    glow: "250, 204, 21",
    img: "external/linearCOD.avif",
    imgClass: "cod"
  },
  {
    name: "Valorant",
    tag: "Patch proof",
    color: "#f87171",
    glow: "248, 113, 113",
    img: "external/linearVALO.avif",
    imgClass: "val"
  },
  {
    name: "CS2",
    tag: "Signature line",
    color: "#38bdf8",
    glow: "56, 189, 248",
    img: "external/linearCS2.png",
    imgClass: "cs2"
  }
];

const CHIPS = [
  {
    label: "Rainbow Six Siege",
    mask: "external/logo container/linearR6V2.png"
  },
  {
    label: "CS2",
    mask: "external/logo container/linearCS2-transparent.png"
  },
  {
    label: "Valorant",
    mask: "external/logo container/linearVALO-transparent.png",
    big: true
  },
  {
    label: "Rust",
    mask: "external/logo container/linearRUSTV2.png",
    big: true
  },
  {
    label: "Fortnite",
    mask: "external/logo container/linearFN-transparent.png"
  },
  {
    label: "Escape from Tarkov",
    mask: "external/logo container/linearEFT-transparent.png",
    big: true
  },
  {
    label: "Apex Legends",
    icon: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g-apex" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#e8ecf4"/></linearGradient></defs>
      <path d="M12 2 L21 21 H15.8 L12 12.5 L8.2 21 H3 Z" fill="url(#g-apex)"/>
      <path d="M12 2 L21 21 H15.8 L12 12.5 L8.2 21 H3 Z" fill="none" stroke="#0a0d14" stroke-width="0.4"/>
    </svg>`
  }
];

const REVIEW_POOL = [
  ...REVIEWS,
  {
    name: "kxng",
    handle: "@kxng.r6",
    text: "bought the r6 nfa got it in like 3 minutes?? had full email everything ready to go. already 50 games deep in ranked lol",
    stars: 5,
    product: "R6 RANKED NFA",
    ago: 14400000
  },
  {
    name: "Elena",
    handle: "@elxna",
    text: "hwid spoofer actually works?? i was so skeptical but its been 3 ban waves and im still good. support answered me at 2am too",
    stars: 5,
    product: "HWID Spoofer",
    ago: 28800000
  },
  {
    name: "rx7",
    handle: "@rx7fn",
    text: "stacked r6 account came loaded af. all the skins i wanted and the rank was exactly what they said. fire deal ngl",
    stars: 5,
    product: "Ranked Account",
    ago: 7200000
  },
  {
    name: "Nia",
    handle: "@nia_",
    text: "bro the eft radar is actually crazy. i found a red keycard on my first raid with it. the loot filter saved me so much time",
    stars: 5,
    product: "LINEAR.EFT",
    ago: 36000000
  },
  {
    name: "slayd",
    handle: "@slayd",
    text: "used zenite years ago and just came back. linear is literally the same team but everything is 10x better now. the cs2 cheat is insane",
    stars: 5,
    product: "LINEAR.CS2",
    ago: 18000000
  },
  {
    name: "kaito",
    handle: "@kaito.gg",
    text: "apex cheat works on stream without anyone noticing lol. the aim is smooth enough that it just looks like good aim. goated honestly",
    stars: 5,
    product: "LINEAR.APEX",
    ago: 5400000
  }
];

function renderGameCards() {
  const row = $("#game-row");
  row.innerHTML = GAMES.map((g) => `
    <div class="game-card" style="background-image: url('external/container BG/linearBG.avif')">
      <div class="game-shade"></div>
      <span class="linear-watermark">LINEAR</span>
      ${g.img
        ? `<img class="game-img ${g.imgClass || ""}" src="${g.img}" alt="${g.name}">`
        : `<div class="game-art" style="color: ${g.color}">${g.art}</div>`}
      <span class="game-name">${g.name}<span class="game-tag">${g.tag}</span></span>
    </div>
  `).join("");
  row.innerHTML += row.innerHTML;
}

function renderChips() {
  const row = $("#chip-row");
  row.innerHTML = CHIPS.map((c) => {
    if (c.mask) {
      const size = c.big ? "width:27px;height:27px;" : "";
      return `<span class="chip"><span class="chip-logo" style="${size}background:linear-gradient(135deg,#38bdf8,#e8ecf4);-webkit-mask:url('${c.mask}') center/contain no-repeat;mask:url('${c.mask}') center/contain no-repeat"></span>${c.label}</span>`;
    }
    return `<span class="chip">${c.icon}${c.label}</span>`;
  }).join("");
  row.innerHTML += row.innerHTML;
}

function renderReviewsMarquee() {
  const track = $("#reviews-marquee");
  const cards = REVIEW_POOL.map((r, i) => {
    const initials = r.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    return `
      <div class="review-card">
        <div class="review-head">
          <div class="avatar" style="background:${AVATAR_COLORS[i % AVATAR_COLORS.length]}">${initials}</div>
          <div>
            <div class="review-name">${r.name}</div>
            <div class="review-meta">${r.handle}</div>
          </div>
          <div class="review-stars">${starsSVG(r.stars, 13)}</div>
        </div>
        <p class="review-text">${r.text}</p>
        <span class="review-badge">Bought ${r.product}</span>
      </div>
    `;
  }).join("");
  track.innerHTML = cards + cards;
}

/* ============================================================
   Product detail data — gallery + features
   ============================================================ */

const BG_IMG = "external/container BG/linearBG.avif";

const GALLERIES = {
  "cs2-lifetime": [
    "external/productsPIC/games/CounterStrike2_valorant_style_minimal.png",
    "external/GAME%20PICS/cs2/cs2%20menu.png",
    "external/GAME%20PICS/cs2/%7B588C4FC8-1A66-431D-AF8B-6FE3FB609D7D%7D.png",
    "external/GAME%20PICS/cs2/%7B836616E1-552B-4F3F-87A3-4450E5622D86%7D.png",
    "external/GAME%20PICS/cs2/%7B9D3AFE1B-107D-4C34-89B2-4F365DCD0D81%7D.png",
    "external/GAME%20PICS/cs2/%7BA3C87811-C55E-4F1C-9526-FA94FD6A85A3%7D.png",
    "external/GAME%20PICS/cs2/%7BD661AFBF-8EE0-495A-B3D3-CA4900FE17A0%7D.png"
  ],
  "val-lifetime": [
    "external/productsPIC/games/linearVALOPROD.png",
    "external/GAME%20PICS/valorant/ingame%20lobby%20menu.png",
    "external/GAME%20PICS/valorant/%7B6A2DFFB1-EC87-422D-A37E-C00F4C921E38%7D.png",
    "external/GAME%20PICS/valorant/%7B9CCA14F0-B7DF-4C33-9A07-76850BF55A3F%7D.png",
    "external/GAME%20PICS/valorant/%7BB6461A80-83C4-4977-A50B-79710A9EE5DA%7D.png"
  ],
  "rust-lifetime": [
    "external/productsPIC/games/linearRUSTPROD_valorant-style-v2.png",
    "external/GAME%20PICS/rust/menu.png",
    "external/GAME%20PICS/rust/%7B938A1896-53AA-48D3-8FBF-25AF639EB9AD%7D.png",
    "external/GAME%20PICS/rust/%7B96D9C24C-3587-42B3-8D56-97BB3AD40FA4%7D.png",
    "external/GAME%20PICS/rust/%7BFCA0F721-E852-47A8-9B56-B9DB2CF82374%7D.png"
  ],
  "eft-lifetime": [
    "external/productsPIC/games/linearETF_valorant-style.png",
    "external/GAME%20PICS/eft/linear%20menu%20eft.png",
    "external/GAME%20PICS/eft/%7B77AE75F8-8958-4CCC-AC85-4740A7EAC590%7D.png",
    "external/GAME%20PICS/eft/%7BE7053615-A461-4EA8-8A91-FB8A5D53D977%7D.png"
  ],
  "r6-lifetime": [
    "external/productsPIC/games/RainbowSix_edit_v2.png",
    "external/GAME%20PICS/rainbowSix/Linear/linear%20r6%20menu.png",
    "external/GAME%20PICS/rainbowSix/Linear/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2011.28.10.75.png",
    "external/GAME%20PICS/rainbowSix/Linear/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2011.30.15.81.png",
    "external/GAME%20PICS/rainbowSix/Linear/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2011.32.39.42.png",
    "external/GAME%20PICS/rainbowSix/Linear/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2011.33.02.63.png",
    "external/GAME%20PICS/rainbowSix/Linear/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2011.35.33.29.png"
  ],
  "apex-lifetime": [
    "external/productsPIC/games/linearAPEXW.webp",
    "external/GAME%20PICS/apex/linear%20apex%20menu.png",
    "external/GAME%20PICS/apex/apex.png",
    "external/GAME%20PICS/apex/%7B9C680A29-0D1F-47CB-984E-238C904AC309%7D.png",
    "external/GAME%20PICS/apex/%7BECC76054-DBE1-4232-91F5-CC304A1996CD%7D.png"
  ],
  "phobia-r6": [
    "external/productsPIC/games/RainbowSix_edit_v2.png",
    "external/GAME%20PICS/rainbowSix/Phobia/phobia%20menu.png",
    "external/GAME%20PICS/rainbowSix/Phobia/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2015.28.56.76.png",
    "external/GAME%20PICS/rainbowSix/Phobia/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2015.31.26.42.png",
    "external/GAME%20PICS/rainbowSix/Phobia/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2015.34.09.67.png",
    "external/GAME%20PICS/rainbowSix/Phobia/Tom%20Clancy%27s%20Rainbow%20Six%20%20Siege%20Screenshot%202026.09.05%20-%2015.34.38.62.png"
  ],
  "hwid-spoofer": ["external/productsPIC/spoofer/fullSpooferNEW.png", BG_IMG],
  "spoofer-bundle": ["external/productsPIC/spoofer/fullSpooferNEW.png", "external/productsPIC/anti cheat/linearBEAC.png", BG_IMG],
  "be-bypass": [
    "external/productsPIC/anti%20cheat/linearBEAC.png",
    "external/ac%20bypasses%20pics/linear%20be/1.png",
    "external/ac%20bypasses%20pics/linear%20be/2.png"
  ],
  "eac-bypass": [
    "external/productsPIC/anti%20cheat/linearEAC.png",
    "external/ac%20bypasses%20pics/linear%20eac/1.png",
    "external/ac%20bypasses%20pics/linear%20eac/2.png"
  ],
  "overlay-pack": ["external/productsPIC/misc/phobiaEXTERNAL.png"],
  "internal-menu": ["external/productsPIC/misc/linearINTERNAL.png"],
  "linear-custom": ["external/productsPIC/misc/linearCUSTOM.png"],
  "r6-nfa": ["external/productsPIC/account/linearACC.png"],
  "r6-stacked": ["external/productsPIC/account/linearACC.png"],
  "cs2-prime": ["external/productsPIC/account/linearACC.png"],
  "triple-bundle": ["external/productsPIC/account/linearACC2.png"]
};

const FEATURES = {
  "cs2-lifetime": ["Silent aim, aimlock and FOV control with hitbox priority", "Full ESP suite: box, skeleton, glow, health bars, 2D radar", "Triggerbot with delay and hitbox selection", "Recoil and spread multipliers, infinite ammo, FOV changer", "Movement suite: bunny hop, auto strafe, edge jump, fast crouch", "Client-side agent and skin unlocks with config keybinds"],
  "val-lifetime": ["Silent aim, aimlock and FOV control with hitbox priority", "Full ESP suite: box, skeleton, glow, health bars, ability ESP", "Triggerbot with delay and hitbox selection", "Recoil and spread multipliers, infinite ammo, FOV changer", "Movement suite: bunny hop and auto strafe", "Custom crosshair, no flash, thirdperson and OBS hide"],
  "rust-lifetime": ["Silent aim with FOV, smoothness and full hitbox priority", "Deep ESP suite: players, animals, resources, crates, turrets, building parts", "Recoil and spread multipliers, no sway, infinite ammo", "Automation: auto farm, auto gather, auto loot, auto heal, auto repair", "Skin unlocks, crosshair changer, no flash, kill feed muter", "Clean config system with keybinds for every core feature"],
  "eft-lifetime": ["Live loot radar with item price values", "Custom item filters — quests, keys, hideout", "Combat ESP with trajectory prediction", "Trader stock bypass for quest items", "Safe-spot logger for scav raids", "Weekly signature refresh"],
  "r6-lifetime": ["Kernel ESP — walls through every material", "Silent aim tuned to droneless 1vX clutches", "Operator and gadget highlight", "Reinforcement/breach state detection", "Caveira & Vigil stealth counter", "Same-day updates on every Siege patch"],
  "apex-lifetime": ["Silent aim with strobe randomization", "No-recoil scripted per weapon class", "Jump-scan radar with shield tracking", "Ring prediction overlay", "Patch-day rebuilds guaranteed", "Undetected since the Zenite days"],
  "hwid-spoofer": ["Motherboard serial randomization", "Volume, disk, GPU, and NIC ID spoofing", "Survives OS reinstallations", "Ban-wave proof — tested on every wave", "One-click clean and restore", "Lifetime license, no resellers"],
  "spoofer-bundle": ["Everything in LINEAR.HWID", "BattlEye bypass module included", "Combined clean-slate kit", "Priority support line", "Co-verified with LINEAR game cheats", "Best value for full setups"],
  "be-bypass": ["Signature-level BattlEye bypass", "Re-signed within hours of every release", "Kernel-loaded, no leftover drivers", "Works across all BE-protected titles", "OpSec guide included"],
  "eac-bypass": ["Driver-based EAC bypass", "HVCI compatible", "Fast re-sign on every EAC update", "No telemetry leaks during gameplay", "One-click activation"],
  "r6-nfa": ["Non-first-account, still ranked-ready", "Fresh secure email included", "Instant delivery after payment", "24h replacement if temp-banned", "Safe queue history"],
  "r6-stacked": ["Champ charm + high-tier skins", "Unspent R6 Credits included", "Full email and account access", "Immediate delivery, tracked", "Priority replacement policy"],
  "cs2-prime": ["Prime-enabled for instant ranked", "NFA, clean matchmaking history", "Phone verification bypassed", "Fresh email and full access", "Instant delivery"],
  "overlay-pack": ["PHOBIA-grade external framework", "DX12, DX11, and DX9 render paths", "Internal hooking included", "Full source, clean documented API", "Zero watermarks, zero telemetry", "Works with any game in borderless"],
  "internal-menu": ["In-process renderer (ImGui-based)", "SDK hooks for popular engines", "Config system with encrypted presets", "Full source and build scripts", "DLL + injector pair included"],
  "linear-custom": ["Internal and external in one build", "DX12 / DX11 / DX9 render paths", "SDK hooks + internal hooking", "Optional fiber-based hooks", "Integrity verification built in", "Private build channel + source handoff"],
  "phobia-r6": [
    "Instant key delivery via site or Discord",
    "Auto-updating during updates",
    "Fully external",
    "Fully undetected",
    {
      group: "Aiming",
      items: ["Enable Aimbot", "Silent Aim", "Aimlock", "FOV", "Smoothness", "Smooth Curve", "Randomize Smoothness", "Random Range", "Visible Check", "Autowall", "Team Check", "Hitbox Priority"]
    },
    {
      group: "Triggerbot",
      items: ["Enable Triggerbot", "Delay", "Hitbox", "Visible Check", "Team Check", "Autowall", "FOV", "Hold Mode", "Trigger hotkey"]
    },
    {
      group: "Visuals",
      items: ["Enable ESP", "Box ESP", "Skeleton ESP", "Player Info", "Visible Check", "Team Check", "Outlines", "2D Radar", "Box Thickness", "Skeleton Thickness", "Radar Size", "Radar Range", "ESP Type"]
    },
    {
      group: "Weapon",
      items: ["Recoil Multiplier", "Spread Multiplier", "Recoil / Spread Control", "Infinite Ammo", "Auto Melee", "FOV Changer", "FOV Value"]
    },
    {
      group: "Unlocks",
      items: ["Unlock All Operators"]
    },
    {
      group: "Config",
      items: ["Save / load configs", "Apply and restore settings"]
    }
  ]
};

const PERIODS = [
  { key: "day", label: "Day", hint: "24h key" },
  { key: "week", label: "Week", hint: "7-day key" },
  { key: "month", label: "Month", hint: "30-day key" },
  { key: "year", label: "Year", hint: "365-day key" }
];

const PERIOD_FACTORS = { day: 0.12, week: 0.30, month: 0.65, year: 3.6 };

function periodPrice(p, period) {
  const raw = p.price * PERIOD_FACTORS[period];
  return Math.max(0.99, Math.floor(raw) + 0.99);
}

const PHOBIA_PRICES = { day: 10, week: 30, month: 65, year: 280 };

function priceFor(p, period) {
  if (!period || period === "lifetime") return p.price;
  if (p.cat === "phobia") return PHOBIA_PRICES[period] ?? p.price;
  return periodPrice(p, period);
}

function defaultFeatures(p) {
  return p.tags.map((t) => `${t} — included`).concat(["Lifetime license with all updates", "Instant key delivery via Discord"]);
}

/* ============================================================
   Product page view — showcase
   ============================================================ */

function hasQty(p) {
  return p && (p.cat === "misc" || p.cat === "accounts" || (p.cat === "phobia" && p.id !== "phobia-r6"));
}

const ProductView = (() => {
  let current = null;
  let slide = 0;
  let period = "month";
  let qty = 1;

  const root = () => $("#page-product");

  function renderSlide() {
    const gallery = GALLERIES[current.id] || (current.img ? [current.img, BG_IMG] : []);
    const imgEl = $(".pv-img", root());
    const fallbackEl = $(".pv-icon-fallback", root());

    if (!gallery.length) {
      imgEl.hidden = true;
      fallbackEl.hidden = false;
      fallbackEl.innerHTML = iconFor(current);
      $$(".pv-arrow", root()).forEach((a) => (a.style.display = "none"));
      $(".pv-dots", root()).innerHTML = "";
      return;
    }
    fallbackEl.hidden = true;
    imgEl.hidden = false;
    imgEl.classList.add("fading");
    setTimeout(() => {
      imgEl.src = gallery[slide];
      imgEl.classList.remove("fading");
    }, 180);
    const many = gallery.length > 1;
    $$(".pv-arrow", root()).forEach((a) => (a.style.display = many ? "" : "none"));
    const dots = $(".pv-dots", root());
    if (!many) { dots.innerHTML = ""; return; }
    dots.innerHTML = gallery.map((_, i) =>
      `<button class="pm-dot${i === slide ? " active" : ""}" data-i="${i}"></button>`
    ).join("");
    $$(".pm-dot", dots).forEach((d) =>
      d.addEventListener("click", () => { slide = +d.dataset.i; renderSlide(); })
    );
  }

  function renderInfo() {
    root().classList.toggle("phobia-active", current.cat === "phobia");
    $(".pv-cat", root()).textContent = current.game;
    $(".pv-name", root()).textContent = current.name;
    const keys = $(".pv-keys", root());
    const useQty = hasQty(current);
    if (useQty) {
      keys.innerHTML = `
        <div class="pv-qty-row">
          <span class="pv-qty-label">Quantity</span>
          <div class="pv-qty-ctrl">
            <button class="pv-qty-btn pv-qty-minus" type="button">&minus;</button>
            <span class="pv-qty-val">${qty}</span>
            <button class="pv-qty-btn pv-qty-plus" type="button">+</button>
          </div>
        </div>`;
      $(".pv-qty-minus", keys).addEventListener("click", () => { qty = Math.max(1, qty - 1); renderInfo(); });
      $(".pv-qty-plus", keys).addEventListener("click", () => { qty = Math.min(10, qty + 1); renderInfo(); });
      $(".pv-price", root()).textContent = fmtMoney(current.price * qty);
      $(".pv-price-hint", root()).textContent = qty > 1 ? `${fmtMoney(current.price)} each` : "per item, one game";
    } else {
      keys.innerHTML = PERIODS.map((k) => `
        <button class="pm-key${period === k.key ? " active" : ""}" data-key="${k.key}">
          <b>${k.label}</b><span>${k.hint}</span>
        </button>
      `).join("");
      $$(".pm-key", keys).forEach((b) =>
        b.addEventListener("click", () => { period = b.dataset.key; renderInfo(); })
      );
      $(".pv-price", root()).textContent = fmtMoney(priceFor(current, period));
      $(".pv-price-hint", root()).textContent = period === "year" ? "best value — 365 days" : "per key, one game";
    }
    $(".pv-desc", root()).innerHTML = current.desc.replace(/\n\n/g, "<br><br>");
    const feats = FEATURES[current.id] || defaultFeatures(current);
    const plain = feats.filter((f) => typeof f === "string");
    const menuTabs = (CHEAT_LINEAR[current.id] || {}).tabs || (current.cat === "phobia" ? CHEAT_TABS : null);
    if (activeId !== current.id) {
      activeId = current.id;
      cheatTab = 0;
      lastTab = 0;
      openCombo = null;
    }
    activeTabs = menuTabs;
    $(".pv-feats", root()).innerHTML =
      plain.map((f) =>
        `<li><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>${f}</li>`
      ).join("") + (menuTabs ? cheatMenu() : "");
    bindCheat();
    renderRequirements();
    renderFaq();
  }

  const tdef = (name, on = true) => ({ t: "toggle", name, on });
  const sdef = (name, min, max, val, unit, dec) => ({ t: "slider", name, min, max, val, unit, dec });
  const cdef = (name, options, idx) => ({ t: "combo", name, options, idx });
  const divrow = (label, color) => ({ t: "div", label, color });

  const CHEAT_TABS = [
    { label: "Aiming", rows: [
      tdef("Enable Aimbot"), tdef("Silent Aim"), tdef("Aimlock"),
      sdef("FOV", 0, 180, 96, "°", 0), sdef("Smoothness", 1, 100, 42.5, "", 1), sdef("Smooth Curve", 0.5, 3, 1.8, "", 1),
      tdef("Randomize Smoothness"), sdef("Random Range", 0, 10, 6.4, "", 1),
      tdef("Visible Check"), tdef("Autowall"), tdef("Team Check"),
      cdef("Hitbox Priority", ["Head", "Neck", "Chest", "Pelvis"], 0)
    ] },
    { label: "Triggerbot", rows: [
      tdef("Enable Triggerbot", true), sdef("Delay", 0, 1, 0.15, "s", 2), cdef("Hitbox", ["Head", "Neck", "Chest", "Pelvis"], 0),
      tdef("Visible Check", true), tdef("Team Check", true), tdef("Autowall", false),
      sdef("FOV", 0, 360, 90, "°", 0), tdef("Hold Mode", true), cdef("Triggerbot Key", ["TAB", "SHIFT", "ALT", "F", "MOUSE5"], 0)
    ] },
    { label: "Visuals", rows: [
      tdef("Enable ESP", true), tdef("Box ESP", true), tdef("Skeleton ESP", true),
      tdef("Player Info", true), tdef("Visible Check", true), tdef("Team Check", true),
      tdef("Outlines", false), tdef("2D Radar", true),
      sdef("Box Thickness", 0.5, 3, 1.6, "", 1), sdef("Skeleton Thickness", 0.5, 3, 1.2, "", 1),
      sdef("Radar Size", 80, 250, 160, "", 0), sdef("Radar Range", 20, 100, 60, "m", 0),
      cdef("ESP Type", ["2D Box", "Corner Box", "3D Box", "All"], 1)
    ] },
    { label: "Weapon", rows: [
      sdef("Recoil Multiplier", 0, 1, 0.42, "", 2), sdef("Spread Multiplier", 0, 1, 0.51, "", 2),
      tdef("Recoil / Spread Control"), tdef("Infinite Ammo"),
      tdef("Auto Melee", false), tdef("FOV Changer"), sdef("FOV Value", 60, 350, 104, "°", 0)
    ] },
    { label: "Unlocks", rows: [
      tdef("Unlock All Operators")
    ] },
    { label: "Config", rows: [
      tdef("Save / load configs"), tdef("Apply and restore settings"), tdef("Hide watermark")
    ] }
  ];

  const CHEAT_LINEAR = {
  "cs2-lifetime": { tabs: [
    { label: "Aiming", rows: [
      tdef("Enable Aimbot", true), tdef("Silent Aim", true), tdef("Aimlock"),
      sdef("FOV", 0, 180, 96, "°", 0), sdef("Smoothness", 1, 50, 24, "", 0),
      cdef("Hitbox Priority", ["Head", "Chest", "Pelvis"], 0),
      tdef("Visible Check", true), tdef("Team Check"), tdef("Autowall", false)
    ] },
    { label: "Triggerbot", rows: [
      tdef("Enable Triggerbot"), sdef("Delay", 0, 500, 120, "ms", 0),
      cdef("Hitbox Selection", ["Head", "Chest"], 0), tdef("Visible Check", true)
    ] },
    { label: "Visuals", rows: [
      tdef("Enable ESP", true), tdef("Box ESP", true), cdef("Box Type", ["2D", "Corner"], 0),
      sdef("Box Thickness", 0.5, 3, 1.6, "", 1), tdef("Skeleton ESP"),
      sdef("Skeleton Thickness", 0.5, 3, 1.2, "", 1),
      tdef("Player Info", true), tdef("Health Bar", true), tdef("Visible Check", true), tdef("Team Check"),
      tdef("Glow ESP", false), tdef("2D Radar")
    ] },
    { label: "Weapon", rows: [
      tdef("Recoil / Spread Control", true), sdef("Recoil Multiplier", 0, 1, 0.42, "", 2),
      sdef("Spread Multiplier", 0, 1, 0.51, "", 2), tdef("Infinite Ammo"),
      sdef("FOV Changer", 60, 300, 104, "°", 0), tdef("Auto Melee", false)
    ] },
    { label: "Movement", rows: [
      tdef("Bunny Hop"), tdef("Auto Strafe"), tdef("Edge Jump"), tdef("Fast Crouch")
    ] },
    { label: "Misc / Unlocks", rows: [
      tdef("Unlock All Agents"), tdef("Unlock All Skins", false)
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"), tdef("Keybind: Aimbot"), tdef("Keybind: Triggerbot"), tdef("Keybind: ESP Toggle")
    ] }
  ] },
  "val-lifetime": { tabs: [
    { label: "Aiming", rows: [
      tdef("Enable Aimbot", true), tdef("Silent Aim"), tdef("Aimlock"),
      sdef("FOV", 0, 180, 96, "°", 0), sdef("Smoothness", 1, 50, 24, "", 0),
      cdef("Hitbox Priority", ["Head", "Neck", "Chest", "Pelvis"], 0),
      tdef("Visible Check", true), tdef("Team Check"), tdef("Autowall", false)
    ] },
    { label: "Triggerbot", rows: [
      tdef("Enable Triggerbot"), sdef("Delay", 0, 500, 120, "ms", 0),
      cdef("Hitbox Selection", ["Head", "Chest"], 0), tdef("Visible Check", true)
    ] },
    { label: "Visuals", rows: [
      tdef("Enable ESP", true), tdef("Box ESP", true), cdef("Box Type", ["2D", "Corner"], 1),
      sdef("Box Thickness", 0.5, 3, 1.6, "", 1), tdef("Skeleton ESP"),
      sdef("Skeleton Thickness", 0.5, 3, 1.2, "", 1),
      tdef("Player Info", true), tdef("Health Bar"), tdef("Visible Check", true), tdef("Team Check"),
      tdef("Glow ESP"), tdef("2D Radar"), tdef("Ability ESP")
    ] },
    { label: "Weapon", rows: [
      tdef("Recoil / Spread Control", true), sdef("Recoil Multiplier", 0, 1, 0.42, "", 2),
      sdef("Spread Multiplier", 0, 1, 0.51, "", 2), tdef("Infinite Ammo"),
      sdef("FOV Changer", 60, 300, 104, "°", 0), tdef("Auto Melee"), tdef("Long Melee", false)
    ] },
    { label: "Movement", rows: [
      tdef("Bunny Hop"), tdef("Auto Strafe")
    ] },
    { label: "Misc", rows: [
      tdef("Custom Crosshair"), cdef("Crosshair Color", ["Cyan", "Green", "White", "Pink"], 0),
      cdef("Crosshair Type", ["X", "Circle", "Dot", "Line"], 0),
      tdef("No Flash"), tdef("Thirdperson", false), tdef("OBS Hide")
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"), tdef("Keybind: Aimbot"), tdef("Keybind: Triggerbot"), tdef("Keybind: ESP Toggle")
    ] }
  ] },
  "rust-lifetime": { tabs: [
    { label: "Aiming", rows: [
      tdef("Enable Aimbot", true), tdef("Silent Aim"),
      sdef("FOV", 0, 180, 96, "°", 0), sdef("Smoothness", 1, 50, 24, "", 0),
      cdef("Hitbox Priority", ["Head", "Neck", "Chest", "Pelvis", "Legs"], 0),
      tdef("Visible Check", true), tdef("Team Check"), tdef("Autowall", false)
    ] },
    { label: "Visuals", rows: [
      tdef("Enable ESP"),
      tdef("Player ESP", true), cdef("Box Type", ["2D", "Corner"], 1), tdef("Skeleton", true), tdef("Player Info", false), tdef("Health Bar", true), tdef("Glow", false),
      divrow("Animal ESP", "rgba(100,160,255,0.55)"), tdef("Animal Box", true), tdef("Animal Name", false), tdef("Animal Distance", true), tdef("Animal Health", false),
      divrow("Resource ESP", "rgba(100,160,255,0.55)"), tdef("Nodes (Stone / Metal / Sulfur)", true), tdef("Wood Piles", false), tdef("Hemp", false), tdef("Icons + Distance", true),
      divrow("World ESP", "rgba(100,160,255,0.55)"), tdef("Crate / Barrel ESP", true), tdef("Dropped Item ESP", false), tdef("Turret / Trap ESP", true), tdef("Building Part ESP", false),
      tdef("2D Radar"), tdef("Visible Check"), tdef("Team Check", false)
    ] },
    { label: "Weapon & Recoil", rows: [
      tdef("Recoil / Spread Control", true), sdef("Recoil Multiplier", 0, 1, 0.42, "", 2),
      sdef("Spread Multiplier", 0, 1, 0.51, "", 2), tdef("No Weapon Sway"),
      tdef("Infinite Ammo"), sdef("FOV Changer", 60, 120, 104, "°", 0)
    ] },
    { label: "Misc / Automation", rows: [
      tdef("Auto Farm"), tdef("Auto Gather", false), tdef("Auto Loot"),
      tdef("Auto Heal"), tdef("Auto Repair", false), tdef("Unlock All Skins", false),
      tdef("Crosshair Changer", false), tdef("No Flash"), tdef("Kill Feed Muter")
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"), tdef("Keybind: Aimbot"), tdef("Keybind: ESP Toggle"), tdef("Keybind: Auto Farm")
    ] }
  ] },
  "eft-lifetime": { tabs: [
    { label: "Aiming", rows: [
      tdef("Enable Aimbot", true), tdef("Silent Aim", true),
      sdef("FOV", 0, 180, 45, "°", 0), sdef("Smoothness", 1, 50, 12, "", 0),
      cdef("Hitbox Priority", ["Head", "Neck", "Chest", "Stomach", "Legs", "Arms"], 0),
      tdef("Visible Check", true), tdef("Team Check"), tdef("Autowall")
    ] },
    { label: "Triggerbot", rows: [
      tdef("Enable Triggerbot"),
      sdef("Delay", 0, 500, 80, "ms", 0),
      cdef("Hitbox Selection", ["Head", "Chest"], 0),
      tdef("Visible Check", true), tdef("Burst Mode")
    ] },
    { label: "Visuals", rows: [
      tdef("Enable ESP", true),
      tdef("Player ESP", true), cdef("Box Type", ["2D", "Corner"], 0), tdef("Skeleton"), tdef("Player Info", true), tdef("Health Bar", true), tdef("Armor Bar"), tdef("Glow"),
      divrow("Scav ESP", "rgba(100,160,255,0.55)"), tdef("Scav Box", true), tdef("Scav Name"), tdef("Scav Health"), tdef("Scav Weapon"), tdef("Scav Distance"),
      divrow("Boss ESP", "rgba(100,160,255,0.55)"), tdef("Boss Highlight", true), tdef("Boss Icon"), tdef("Boss Name"),
      divrow("Loot ESP", "rgba(100,160,255,0.55)"), tdef("Loose Loot", true), cdef("Loot Rarity", ["All", "Rare+", "Epic+", "Legendary"], 1), tdef("Loot Name", true), tdef("Loot Distance", true),
      divrow("Container ESP", "rgba(100,160,255,0.55)"), tdef("Weapon Crates"), tdef("Duffle Bags"), tdef("Filing Cabinets"), tdef("Jackets"), tdef("Container Icons", true),
      divrow("World ESP", "rgba(100,160,255,0.55)"), tdef("Exfil / Extract", true), tdef("Exfil Status", true), tdef("Exfil Timer"), tdef("Airdrop ESP"), tdef("Grenade Indicator"),
      tdef("2D Radar"), tdef("Visible Check", true)
    ] },
    { label: "Weapon & Recoil", rows: [
      tdef("Recoil / Spread Control", true),
      sdef("Recoil Multiplier", 0, 1, 0.45, "", 2),
      sdef("Spread Multiplier", 0, 1, 0.5, "", 2),
      tdef("No Weapon Sway"), tdef("Infinite Ammo"),
      sdef("FOV Changer", 60, 120, 100, "°", 0)
    ] },
    { label: "Misc / Automation", rows: [
      tdef("Auto Loot"), tdef("Fast Search"), tdef("Auto Heal"), tdef("Auto Repair")
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"),
      tdef("Keybind: Aimbot"), tdef("Keybind: ESP Toggle"), tdef("Keybind: Auto Loot")
    ] }
  ] },
  "r6-lifetime": { tabs: [
    { label: "Aiming", rows: [
      tdef("Enable Aimbot", true), tdef("Silent Aim"),
      sdef("FOV", 0, 180, 90, "°", 0), sdef("Smoothness", 1, 50, 18, "", 0),
      tdef("Visible Check", true), tdef("Team Check", false),
      cdef("Hitbox Priority", ["Head", "Neck", "Chest", "Pelvis"], 0)
    ] },
    { label: "Triggerbot", rows: [
      tdef("Enable Triggerbot", false),
      sdef("Delay", 0, 500, 60, "ms", 0),
      tdef("Visible Check", true), tdef("Team Check", false)
    ] },
    { label: "Visuals", rows: [
      tdef("Enable ESP", true), tdef("Box ESP", true), tdef("Skeleton ESP", false),
      cdef("Box Type", ["2D", "3D", "Corner"], 0),
      tdef("Gadget Highlight", false),
      tdef("Visible Check", true), tdef("Team Check", false),
      tdef("2D Radar", false)
    ] },
    { label: "Weapon & Recoil", rows: [
      tdef("Recoil / Spread Control", true),
      sdef("Recoil Multiplier", 0, 1, 0.42, "", 2),
      sdef("Spread Multiplier", 0, 1, 0.51, "", 2)
    ] },
    { label: "Misc", rows: [
      tdef("Long Melee", false),
      tdef("Anti Aim", false), cdef("Anti-Aim Direction", ["Forward", "Sideways", "Spin"], 0),
      sdef("Spin Speed", 0, 100, 36, "", 0),
      tdef("OBS Hider", false)
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"),
      tdef("Keybind: Aimbot", false), tdef("Keybind: ESP Toggle", false)
    ] }
  ] },
  "apex-lifetime": { tabs: [
    { label: "Aiming", rows: [
      tdef("Enable Aimbot", true), tdef("Silent Aim"), tdef("Aimlock"),
      sdef("FOV", 0, 180, 90, "°", 0), sdef("Smoothness", 1, 50, 20, "", 0),
      cdef("Hitbox Priority", ["Head", "Neck", "Chest", "Stomach", "Legs"], 0),
      tdef("Visible Check", true), tdef("Team Check"),
      cdef("Target Selection", ["Closest", "Lowest HP", "Most HP", "Random"], 0),
      tdef("Bullet Drop Compensation")
    ] },
    { label: "Visuals", rows: [
      tdef("Enable ESP", true),
      tdef("Player ESP", true), cdef("Box Type", ["2D", "Corner", "3D"], 0), tdef("Skeleton ESP"), tdef("Player Info", true), tdef("Health Bar", true), tdef("Shield Bar"), tdef("Glow ESP"),
      divrow("Legend ESP", "rgba(100,160,255,0.55)"), tdef("Legend Name", true), tdef("Legend Icon", true),
      divrow("Loot ESP", "rgba(100,160,255,0.55)"), tdef("Ground Loot", true), cdef("Loot Rarity", ["All", "Rare+", "Epic+", "Legendary"], 1), tdef("Loot Name", true), tdef("Loot Distance", true),
      divrow("World ESP", "rgba(100,160,255,0.55)"), tdef("Deathbox ESP", true), tdef("Care Package ESP"), tdef("Survey Beacon ESP"), tdef("Replicator ESP"),
      tdef("2D Radar"), tdef("Visible Check", true), tdef("Team Check", false)
    ] },
    { label: "Weapon & Recoil", rows: [
      tdef("Recoil / Spread Control", true),
      sdef("Recoil Multiplier", 0, 1, 0.42, "", 2),
      sdef("Spread Multiplier", 0, 1, 0.51, "", 2),
      tdef("Infinite Ammo (Server Side)"), sdef("FOV Changer", 70, 120, 104, "°", 0)
    ] },
    { label: "Movement", rows: [
      tdef("Bunny Hop"), tdef("Auto Strafe"), tdef("Zip Line Speed Boost")
    ] },
    { label: "Misc / Automation", rows: [
      tdef("Auto Loot", true), tdef("Auto Heal"), tdef("Auto Shield"), tdef("Auto Pickup (Weapons)"),
      tdef("Unlock All Legends (Server Side)")
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"),
      tdef("Keybind: Aimbot"), tdef("Keybind: ESP Toggle"), tdef("Keybind: Auto Loot")
    ] }
  ] },
  "hwid-spoofer": { tabs: [
    { label: "System Spoofing", rows: [
      tdef("Motherboard Serial Spoofing", true), tdef("Volume Serial Spoofing", true),
      tdef("Disk ID Spoofing", true), tdef("GPU ID Spoofing"),
      tdef("Network Adapter MAC Spoofing")
    ] },
    { label: "Persistence & Recovery", rows: [
      tdef("Reboot-Persistent", true), tdef("OS Reinstall Survival"),
      tdef("Restore Original")
    ] },
    { label: "Interface & Control", rows: [
      tdef("Dashboard", true), tdef("Randomize All"),
      tdef("Selective Randomization", true), tdef("Config Profiles")
    ] },
    { label: "Additional Features", rows: [
      tdef("Boot-Time Injection", true), tdef("Minimal Resource Usage", true)
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"), tdef("Logging")
    ] }
  ] },
  "spoofer-bundle": { tabs: [
    { label: "System Spoofing", rows: [
      tdef("Motherboard Serial Spoofing", true), tdef("Volume Serial Spoofing", true),
      tdef("Disk ID Spoofing", true), tdef("GPU ID Spoofing"),
      tdef("Network Adapter MAC Spoofing")
    ] },
    { label: "Persistence & Recovery", rows: [
      tdef("Reboot-Persistent", true), tdef("OS Reinstall Survival"),
      tdef("Restore Original")
    ] },
    { label: "Interface & Control", rows: [
      tdef("Dashboard", true), tdef("Randomize All"),
      tdef("Selective Randomization", true), tdef("Config Profiles")
    ] },
    { label: "Additional Features", rows: [
      tdef("Boot-Time Injection", true), tdef("Minimal Resource Usage", true)
    ] },
    { label: "BattlEye Bypass", rows: [
      divrow("BATTLEYE BYPASS", "rgba(100,160,255,0.55)"),
      divrow("Auto-updating if patched. No manual intervention needed."),
      divrow("Signature-level injection with kernel driver support."),
      divrow("Zero leftover drivers. Clean removal on exit.")
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config"), tdef("Logging")
    ] }
  ] },
  "be-bypass": { tabs: [
    { label: "Bypass", rows: [
      tdef("Signature-level Bypass"), tdef("Hours-fast Re-sign"), tdef("Kernel Loaded")
    ] },
    { label: "Ops", rows: [
      tdef("No Leftover Drivers"), tdef("Telemetry Stealth"), tdef("OpSec Guide")
    ] }
  ] },
  "eac-bypass": { tabs: [
    { label: "Bypass", rows: [
      tdef("Driver-based Bypass"), tdef("HVCI Compatible"), tdef("Fast Re-sign")
    ] },
    { label: "Ops", rows: [
      tdef("No Telemetry Leaks"), tdef("One-click Activation"), sdef("Re-sign Window", 1, 24, 6, "h", 0)
    ] }
  ] },
  "overlay-pack": { tabs: [
    { label: "Rendering", rows: [
      tdef("DX12 Render Path", true), tdef("DX11 Render Path", true), tdef("DX9 Render Path", false),
      tdef("Overlay Runtime", true), tdef("External Execution Mode")
    ] },
    { label: "Hooking", rows: [
      tdef("Internal Hooking", true), tdef("Clean Documented API"),
      tdef("Automatic Hook Restoration", false), tdef("Multiple Hooking Methods")
    ] },
    { label: "Tools & Integration", rows: [
      tdef("Full Source Code", true), tdef("Zero Watermarks", true), tdef("Zero Telemetry", true),
      tdef("FIBERNETIC Included", true), tdef("Commented Core Files"), tdef("Dedicated Support Channel")
    ] },
    { label: "Anti-Detection", rows: [
      tdef("FIBERNETIC Anti-Detection", true), tdef("Multiple Execution Paths"), tdef("Regular Updates")
    ] },
    { label: "Delivery & Source", rows: [
      tdef("Full Source Provided"), tdef("Private Build Channel Access"), tdef("Regular Updates", true)
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config", true), tdef("Customizable Hotkeys"), tdef("Optional Logging")
    ] }
  ] },
  "linear-custom": { tabs: [
    { label: "Rendering", rows: [
      tdef("DX12 Render Path", true), tdef("DX11 Render Path", true), tdef("DX9 Render Path"),
      tdef("Internal + External Execution", true), tdef("Customizable Overlay")
    ] },
    { label: "Hooking", rows: [
      tdef("SDK Hooks", true), tdef("Internal Hooking", true), tdef("Fiber-based Hooks"),
      tdef("Integrity Verification", true), tdef("Automatic Hook Restoration")
    ] },
    { label: "Tools", rows: [
      tdef("Full Source Code", true), tdef("Private Build Channel", true),
      tdef("Config System (Load/Save)", true), tdef("Minimal Overhead", true)
    ] },
    { label: "Delivery & Source", rows: [
      tdef("Full Source Provided"), tdef("Private Build Channel Access", true),
      tdef("Dedicated Support Channel"), tdef("Regular Updates")
    ] },
    { label: "Config", rows: [
      tdef("Load / Save Config", true), tdef("Customizable Hotkeys"), tdef("Optional Logging")
    ] }
  ] },
  "internal-menu": { tabs: [
    { label: "Renderer", rows: [
      tdef("In-Process Renderer", true), cdef("Rendering Backend", ["DX9", "DX11", "DX12"], 1),
      cdef("Engine Hook", ["UE4", "Unity", "Source", "Custom"], 0), tdef("SDK Hooks", true)
    ] },
    { label: "Menu & Config", rows: [
      tdef("Clean Menu Interface", true), tdef("Encrypted Presets", true),
      tdef("Config System (Load/Save)", true), tdef("Source Code Included")
    ] },
    { label: "Performance", rows: [
      tdef("Minimal Overhead", true), tdef("Standalone Overlay", true),
      tdef("Build Scripts"), tdef("DLL + Injector")
    ] }
  ] }
};

let activeTabs = CHEAT_TABS;
let activeId = null;

let cheatTab = 0;
  let lastTab = 0;
  let openCombo = null;
  const cheatState = {};

  function ckey(name) { return `${activeId}|${activeTabs[cheatTab].label}:${name}`; }

  function cval(def) {
    const k = ckey(def.name);
    if (!(k in cheatState)) cheatState[k] = def.t === "toggle" ? def.on : def.t === "slider" ? def.val : def.idx;
    return cheatState[k];
  }

  function slidePct(def) {
    return ((cval(def) - def.min) / (def.max - def.min)) * 100;
  }

  function rowHtml(def, i) {
    const k = ckey(def.name);
    if (def.t === "div") {
      const style = def.color ? `color:${def.color}` : "";
      return `<span class="cw-div" data-t="div" style="--i:${i};${style}">${def.label}</span>`;
    }
    if (def.t === "toggle")
      return `<span class="cw cw-row" data-key="${k}" data-t="toggle" style="--i:${i}"><span class="cw-name">${def.name}</span>
        <span class="cw-toggle${cval(def) ? " on" : ""}"><i></i></span></span>`;
    if (def.t === "slider")
      return `<span class="cw cw-col" data-key="${k}" data-t="slider" style="--i:${i}"><span class="cw-head"><span class="cw-name">${def.name}</span>
        <b class="cw-val">${fmtSlide(def)}</b></span><span class="cw-bar"><i style="width:${slidePct(def)}%"></i></span></span>`;
const idx = cval(def);
    return `<span class="cw cw-row" data-key="${k}" data-t="combo" style="--i:${i}"><span class="cw-name">${def.name}</span>
      <span class="cw-wrap">
        <button class="cw-combo" type="button">${def.options[idx]}</button>
        <span class="cw-menu">
          ${def.options.map((o, j) => `<button type="button" class="cw-opt${j === idx ? " sel" : ""}" data-i="${j}">${o}</button>`).join("")}
        </span>
      </span></span>`;
  }

  function fmtSlide(def) {
    const v = cval(def);
    return v.toFixed(def.dec) + def.unit;
  }

  function cheatMenu() {
    const linear = current.cat !== "phobia";
    return `<li class="pm-cheat${linear ? " pm-cheat-linear" : ""}">
      <div class="pm-cheat-head">
        <span class="pm-cheat-dots"><i></i><i></i><i></i></span>
        <span class="pm-cheat-title">Cheat features</span>
        <span class="pm-cheat-fw">${linear ? "LINEAR.X" : "PHOBIA.X"}</span>
      </div>
      <div class="pm-cheat-tabs">
        ${activeTabs.map((t, i) => `
          <button class="pm-cheat-tab${cheatTab === i ? " on" : ""}" data-t="${i}">${t.label}</button>`).join("")}
      </div>
      <div class="pm-cheat-main">${activeTabs[cheatTab].rows.map((r, i) => rowHtml(r, i)).join("")}</div>
    </li>`;
  }

  let sliderDrag = null;
  let cheatWindowBound = false;

  function bindCheat() {
    const panel = $(".pm-cheat", root());
    if (!panel) return;

    if (!panel.dataset.bound) {
      panel.dataset.bound = "1";
      panel.addEventListener("click", (e) => {
        const tab = e.target.closest(".pm-cheat-tab");
        const toggle = e.target.closest(".cw-toggle");
        const comboBtn = e.target.closest(".cw-combo");
        const opt = e.target.closest(".cw-opt");

        if (tab) {
          if (cheatTab === +tab.dataset.t) return;
          cheatTab = +tab.dataset.t;
          openCombo = null;
          swapMain();
          return;
        }
        if (toggle) {
          const row = toggle.closest(".cw-row");
          const k = row.dataset.key;
          cheatState[k] = !cheatState[k];
          toggle.classList.toggle("on", cheatState[k]);
          return;
        }
        if (opt) {
          const row = opt.closest(".cw-row");
          const k = row.dataset.key;
          cheatState[k] = +opt.dataset.i;
          const label = row.querySelector(".cw-combo");
          label.textContent = activeTabs.flatMap((t) => t.rows)
            .find((d) => ckey(d.name) === k).options[cheatState[k]];
          row.querySelector(".cw-menu").classList.remove("open");
          row.querySelectorAll(".cw-opt").forEach((o) => o.classList.toggle("sel", +o.dataset.i === cheatState[k]));
          openCombo = null;
          return;
        }
        if (comboBtn) {
          const row = comboBtn.closest(".cw-row");
          const k = row.dataset.key;
          const menu = row.querySelector(".cw-menu");
          if (menu.classList.contains("open")) {
            menu.classList.remove("open");
            openCombo = null;
          } else {
            panel.querySelectorAll(".cw-menu.open").forEach((m) => m.classList.remove("open"));
            menu.classList.add("open");
            openCombo = k;
          }
          return;
        }
        if (openCombo) {
          const openMenu = panel.querySelector(".cw-menu.open");
          if (openMenu) openMenu.classList.remove("open");
          openCombo = null;
        }
      });
    }

    bindSliders(panel);

    if (!cheatWindowBound) {
      cheatWindowBound = true;
      window.addEventListener("click", (e) => {
        if (!openCombo) return;
        if (panel.contains(e.target)) return;
        const openMenu = panel.querySelector(".cw-menu.open");
        if (openMenu) openMenu.classList.remove("open");
        openCombo = null;
      });
    }
  }

  function bindSliders(panel) {
    panel.querySelectorAll(".cw-col[data-t='slider']").forEach((row) => {
      if (row.dataset.drag) return;
      row.dataset.drag = "1";
      const bar = row.querySelector(".cw-bar");
      const fill = row.querySelector(".cw-bar i");
      const valEl = row.querySelector(".cw-val");
      const def = activeTabs.flatMap((t) => t.rows).find((d) => ckey(d.name) === row.dataset.key);

      const drag = (e) => {
        const r = bar.getBoundingClientRect();
        const pct = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
        cheatState[row.dataset.key] = +(def.min + pct * (def.max - def.min)).toFixed(def.dec);
        fill.style.width = (pct * 100) + "%";
        valEl.textContent = fmtSlide(def);
      };
      const end = () => { sliderDrag = null; window.removeEventListener("pointermove", drag); window.removeEventListener("pointerup", end); };

      bar.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        sliderDrag = true;
        bar.setPointerCapture(e.pointerId);
        drag(e);
        window.addEventListener("pointermove", drag);
        window.addEventListener("pointerup", end);
      });
    });
  }

  function swapMain() {
    const panel = $(".pm-cheat", root());
    if (!panel) return;
    const main = panel.querySelector(".pm-cheat-main");
    const dir = cheatTab > lastTab ? "right" : "left";
    main.classList.add("leaving-" + dir);
    setTimeout(() => {
      main.classList.remove("leaving-" + dir);
      lastTab = cheatTab;
      main.innerHTML = activeTabs[cheatTab].rows.map((r, i) => rowHtml(r, i)).join("");
      main.classList.add("entering-" + (dir === "right" ? "left" : "right"));
      setTimeout(() => main.classList.remove("entering-" + (dir === "right" ? "left" : "right")), 360);
      panel.querySelectorAll(".pm-cheat-tab")
        .forEach((b) => b.classList.toggle("on", +b.dataset.t === cheatTab));
      bindSliders(panel);
    }, 150);
  }

  function requirementTiles(p) {
    const phobia = p.cat === "phobia";
    const isGame = GAME_CATS.includes(p.cat) || phobia;
    const spoofer =
      p.cat === "phobia" ? "Included — HWID-level"
      : p.cat === "spoofer" ? "This product"
      : p.cat === "accounts" ? "N/A — game account"
      : isGame ? "Optional add-on"
      : "N/A";
    const platform = p.cat === "phobia" ? "Windows only"
      : p.cat === "spoofer" ? "Windows only"
      : "Windows / Linux (game)";
    return [
      { k: "Operating System", v: "Windows 10 / 11 — all versions" },
      { k: "Game Mode", v: "Borderless or fullscreen" },
      { k: "Spoofer", v: spoofer },
      { k: "Platform", v: platform },
      { k: "Processor", v: phobia ? "Quad-core / 6 threads or better" : "Any quad-core CPU" },
      { k: "Memory (RAM)", v: phobia ? "16 GB recommended" : "8 GB minimum" },
      { k: "Storage", v: phobia ? "2 GB free disk" : "500 MB free disk" },
      { k: "Graphics", v: "DirectX 11 capable GPU" }
    ];
  }

  function renderRequirements() {
    const box = $("#pv-reqs", root());
    box.innerHTML = requirementTiles(current).map((t) => `
      <div class="req-tile">
        <span class="req-key">${t.k}</span>
        <span class="req-val">${t.v}</span>
      </div>
    `).join("");
  }

  function renderFaq() {
    const faqs = [
      { q: "Is this bannable?", a: "Every build is tested against the latest anti-cheat signatures before release, and updates land within hours of a game patch. No software is 100% permanent, which is why every license carries a replacement guarantee until it holds again." },
      { q: "How fast are updates after a game patch?", a: "The update pipeline ships within hours, not days. Loader auto-pulls the new build on launch — no manual re-downloads." },
      { q: "Is a spoofer included?", a: "PHOBIA products include the HWID-level spoofer in the license. Linear game products ship without it, but the Linear spoofer line covers every title." },
      { q: "Will it run on Windows 11?", a: "Yes — all current versions of Windows 10 and 11 are supported, including recent feature updates. Kernel features remain HVCI safe." },
      { q: "Can I transfer my license to another PC?", a: "Yes. One license runs on one machine at a time; moving hardware is as simple as requesting a reset in the Discord." },
      { q: "What if I get hardware banned?", a: "PHOBIA includes HWID spoofing out of the box. For Linear products, the LINEAR.SPOOFER+ bundle covers clean-slate recovery." },
      { q: "Does streamer mode hide the overlay?", a: "Yes — streamer mode blanks the radar and ESP from capture devices while keeping your full vision in-game." }
    ];
    $("#pv-faq", root()).innerHTML = faqs.map((f) => `
      <div class="faq-item">
        <div class="faq-q" tabindex="0">
          <span>${f.q}</span>
          <svg class="faq-chev" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="faq-body"><div class="faq-inner">${f.a}</div></div>
      </div>
    `).join("");
    $$(".faq-item", root()).forEach((item) => {
      const q = $(".faq-q", item);
      const body = $(".faq-body", item);
      const toggle = () => {
        const open = item.classList.toggle("open");
        if (open) {
          item.style.setProperty("--h", $(".faq-inner", item).scrollHeight + "px");
        }
      };
      q.addEventListener("click", toggle);
      q.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  function open(id) {
    current = PRODUCTS.find((p) => p.id === id);
    if (!current) return;
    slide = 0;
    period = "month";
    qty = 1;
    renderSlide();
    renderInfo();

    $$(".page").forEach((el) => el.classList.remove("active"));
    root().classList.add("active");
    $$(".nav-link").forEach((el) => el.classList.toggle("active", el.dataset.page === "products"));
    moveNavInd();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bind() {
    const r = root();

    $(".pv-back", r).addEventListener("click", (e) => {
      e.preventDefault();
      goTo("products");
    });
    $(".pv-prev", r).addEventListener("click", () => {
      const g = GALLERIES[current.id] || (current.img ? [current.img, BG_IMG] : []);
      if (!g.length) return;
      slide = (slide - 1 + g.length) % g.length;
      renderSlide();
    });
    $(".pv-next", r).addEventListener("click", () => {
      const g = GALLERIES[current.id] || (current.img ? [current.img, BG_IMG] : []);
      if (!g.length) return;
      slide = (slide + 1) % g.length;
      renderSlide();
    });
    $(".pv-checkout", r).addEventListener("click", () => {
      if (hasQty(current)) {
        addToCart(current.id, null, "lifetime", qty);
        toast(`${current.name} ×${qty} added`);
      } else {
        addToCart(current.id, null, period);
        toast(`${current.name} — ${period.toUpperCase()} key added`);
      }
      toggleCart(true);
    });
    document.addEventListener("keydown", (e) => {
      if (!root().classList.contains("active")) return;
      if (e.key === "ArrowLeft") $(".pv-prev", r).click();
      if (e.key === "ArrowRight") $(".pv-next", r).click();
    });
  }

  function refresh() {
    if (!current) return;
    renderInfo();
  }

  return { open, bind, refresh };
})();

/* ============================================================
   State
   ============================================================ */

const state = {
  cart: [],
  page: "home"
};

function cartKey() {
  const id = DASH_USER.id || DASH_USER.name || "guest";
  return "linear_cart_" + id;
}

function saveCart() {
  STORE.set(cartKey(), state.cart);
}

function loadCart() {
  state.cart = STORE.get(cartKey(), []);
  updateCartBadge();
}

const $count = $("#cart-count");

/* ============================================================
   Render: products
   ============================================================ */

let activeCat = "all";

function tabKeyFor(cat) {
  return (GAME_CATS.includes(cat) || cat === "games" || cat === "all") ? "games" : cat;
}

function productCountFor(cat) {
  if (cat === "games") {
    return PRODUCTS.filter((p) => GAME_CATS.includes(p.cat)).length;
  }
  return productsFor(cat).length;
}

function renderCategoryTabs() {
  const bar = $("#category-tabs");
  const isGamesActive = tabKeyFor(activeCat) === "games" || GAME_CATS.includes(activeCat);

  const gamesTab = TOP_TABS.find((t) => t.menu);

  let html = "";
  let afterFirst = false;
  let gamesInserted = false;
  TOP_TABS.filter((t) => !t.menu).forEach((t) => {
    if (afterFirst && gamesTab && !gamesInserted) {
      const isActive = isGamesActive;
      const cls = `cat-tab${isActive ? " active" : ""}`;
      const count = productCountFor("games");
      html += `<button class="${cls}" data-cat="games">${gamesTab.label}<span class="tab-badge">${count}</span></button>`;
      gamesInserted = true;
    }
    afterFirst = true;
    const isActive = tabKeyFor(activeCat) === t.key;
    const cls = `cat-tab${isActive ? " active" : ""}${t.era ? " phobia-tab" : ""}`;
    const count = productCountFor(t.key);
    html += `<button class="${cls}" data-cat="${t.key}">${t.label}<span class="tab-badge">${count}</span></button>`;
  });

  bar.innerHTML = html;

  if (gamesTab && isGamesActive) {
    const subBar = document.createElement("div");
    subBar.className = "cat-sub-bar";
    subBar.innerHTML = gamesTab.menu.map((g) => {
      const isActive = activeCat === g.key;
      return `<button class="cat-sub-tab${isActive ? " active" : ""}" data-cat="${g.key}">${g.label}</button>`;
    }).join("");
    bar.appendChild(subBar);

    $$(".cat-sub-tab", subBar).forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCat = btn.dataset.cat;
        renderCategoryTabs();
        renderProducts();
      });
    });
  }

  $$("[data-cat]", bar).forEach((btn) => {
    if (!btn.classList.contains("cat-sub-tab")) {
      btn.addEventListener("click", () => {
        activeCat = btn.dataset.cat;
        renderCategoryTabs();
        renderProducts();
      });
    }
  });
}

function productsFor(cat) {
  if (cat === "games" || cat === "all") {
    return PRODUCTS.filter((p) => GAME_CATS.includes(p.cat));
  }
  return PRODUCTS.filter((p) => p.cat === cat);
}

function phobiaTag() {
  return `<span class="phobia-tag"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l2.4 6.8a2 2 0 0 0 1.4 1.4L22 12l-6.2 1.8a2 2 0 0 0-1.4 1.4L12 22l-2.4-6.8a2 2 0 0 0-1.4-1.4L2 12l6.2-1.8a2 2 0 0 0 1.4-1.4L12 2z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>PHOBIA ERA</span>`;
}

function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = "";
  grid.classList.toggle("phobia-grid", activeCat === "phobia");

  productsFor(activeCat).forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "product-card" + (p.premium ? " premium" : "") + (p.img ? " has-img" : "") + (p.cat === "phobia" ? " phobia-card" : "");
    card.dataset.pid = p.id;
    card.style.animationDelay = (i * 0.05) + "s";
    const media = p.img
      ? `<div class="product-imgwrap">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
          <span class="und-badge"><span class="und-dot"></span>UNDETECTED</span>
        </div>`
      : `<div class="product-icon">${iconFor(p)}</div>`;
    card.innerHTML = `
      ${p.premium ? (p.cat === "phobia" ? phobiaTag() : '<span class="product-tag">POPULAR</span>') : ""}
      <button class="view-btn" data-pid="${p.id}">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 12s3.5-6.5 8.5-6.5 8.5 6.5 8.5 6.5-3.5 6.5-8.5 6.5-8.5-6.5-8.5-6.5z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>
        View
      </button>
      ${media}
<h3 class="product-name">${p.name}</h3>
      ${(p.cat === "phobia" || p.id === "linear-custom" || p.desc.includes("\n\n"))
        ? `<p class="product-desc">${p.desc.split("\n\n")[0]} <button class="card-more${p.cat === "phobia" ? "" : " linear"}" data-pid="${p.id}" type="button">read more</button></p>`
        : `<p class="product-desc">${p.desc}</p>`}
      <div class="product-meta">
        ${p.tags.map((t) => `<span class="meta-chip">${t}</span>`).join("")}
      </div>
      <div class="product-foot">
        <div class="product-price">${hasQty(p) ? fmtMoney(p.price) : fmtMoney(priceFor(p, "month"))}<span>${CURRENCIES[currentCurrency].label}</span></div>
        <button class="btn btn-primary buy-btn" data-id="${p.id}" data-phase="${p.cat}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
          Add
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  $$(".buy-btn", grid).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.id, btn, btn.dataset.phase === "phobia" ? "month" : "lifetime");
    });
  });

  $$(".view-btn", grid).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ProductView.open(btn.dataset.pid);
    });
  });

  $$(".card-more", grid).forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      ProductView.open(btn.dataset.pid);
    });
  });

  $$(".product-card", grid).forEach((card) => {
    card.addEventListener("click", () => ProductView.open(card.dataset.pid));
  });
}

/* ============================================================
   Render: status
   ============================================================ */

function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function sparkPoints(ms, seed) {
  const rnd = seededRand(seed * 7919 + 13);
  const pts = [];
  for (let i = 0; i < 22; i++) {
    const v = ms + (rnd() - 0.5) * ms * 0.55;
    pts.push(`${(i / 21) * 100},${26 - Math.max(2, Math.min(24, (v / (ms * 1.6)) * 24))}`);
  }
  return pts.join(" ");
}

function sparkSvg(ms, seed) {
  return `<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${sparkPoints(ms, seed)}"/></svg>`;
}

function uptimeStrip(seed) {
  const rnd = seededRand(seed * 104729 + 7);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let out = "";
  for (let d = 0; d < 90; d++) {
    const r = rnd();
    const cls = r > 0.965 ? "warn" : "ok";
    const day = new Date(2026, 7, 24 - (89 - d));
    out += `<i class="${cls}" title="${day.getDate()} ${months[day.getMonth()]} — ${cls === "ok" ? "99.9%+" : "degraded"}"></i>`;
  }
  return `<div class="up-strip">${out}</div>`;
}

function countUp(el, target, dur, decimals, suffix) {
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = (target * eased).toFixed(decimals) + (suffix || "");
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

let statusObs = null;
let liveTimer = null;
let pingTimer = null;

function renderStatus() {
  const grid = $("#status-grid");
  grid.innerHTML = "";

  STATUS_ITEMS.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "status-card reveal";
    card.innerHTML = `
      <div class="status-card-head">
        <div class="sc-id">
          <span class="s-dot ${s.state}"></span>
          <span class="status-card-name">${s.name}</span>
        </div>
        <span class="sc-state ${s.state}">${s.state === "up" ? "Operational" : s.state === "degraded" ? "Degraded" : "Down"}</span>
      </div>
      ${sparkSvg(s.ms, i + 1)}
      <div class="up-row">
        <span class="up-label">90 days ago</span>
        ${uptimeStrip(i + 1)}
        <span class="up-label">today</span>
      </div>
      <div class="stat-bar-meta">
        <span><b class="up-count" data-t="${s.uptime}">0.00%</b> uptime</span>
        <span class="ms"><b class="ms-count" data-t="${s.ms}">0</b> ms</span>
      </div>
    `;
    grid.appendChild(card);
  });

  const ring = $("#status-ring");
  const t0 = performance.now();
  const ringTick = (t) => {
    const p = Math.min(1, (t - t0) / 1400);
    const eased = 1 - Math.pow(1 - p, 3);
    ring.style.setProperty("--p", (99.7 * eased).toFixed(2));
    if (p < 1) requestAnimationFrame(ringTick);
  };
  requestAnimationFrame(ringTick);

  countUp($("#status-uptime"), 99.7, 1400, 2, "% uptime — 30d");
  setTimeout(() => countUp($("#q-up"), 6, 900, 0, "/6"), 200);
  setTimeout(() => countUp($("#q-ms"), 47, 1100, 0, "ms"), 350);

  if (statusObs) statusObs.disconnect();
  statusObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll(".up-count, .ms-count").forEach((c, j) => {
        if (c.dataset.done) return;
        c.dataset.done = "1";
        setTimeout(() => countUp(c, parseFloat(c.dataset.t), 1100, c.classList.contains("ms-count") ? 0 : 2, c.classList.contains("ms-count") ? "" : "%"), j * 60);
      });
      statusObs.unobserve(en.target);
    });
  }, { threshold: 0.25 });
  $$(".reveal", grid).forEach((el, i) => {
    el.style.transitionDelay = (i * 0.07) + "s";
    statusObs.observe(el);
  });

  if (liveTimer) clearInterval(liveTimer);
  const liveEl = $("#live-updated");
  let secs = 0;
  liveTimer = setInterval(() => {
    secs = (secs + 1) % 30;
    liveEl.textContent = `updated ${secs}s ago`;
  }, 1000);

  STATUS_ITEMS.forEach((s) => { if (s.ms0 === undefined) s.ms0 = s.ms; });
  if (pingTimer) clearInterval(pingTimer);
  pingTimer = setInterval(() => {
    const idx = Math.floor(Math.random() * STATUS_ITEMS.length);
    const s = STATUS_ITEMS[idx];
    s.ms = Math.round(Math.min(s.ms0 * 1.5, Math.max(s.ms0 * 0.6, s.ms + (Math.random() - 0.5) * s.ms0 * 0.34)));
    const card = grid.children[idx];
    if (!card) return;
    const msEl = $(".ms-count", card);
    msEl.textContent = s.ms;
    msEl.classList.remove("tick");
    void msEl.offsetWidth;
    msEl.classList.add("tick");
    $("polyline", card).setAttribute("points", sparkPoints(s.ms, idx + 1));
    const avg = Math.round(STATUS_ITEMS.reduce((a, x) => a + x.ms, 0) / STATUS_ITEMS.length);
    $("#q-ms").textContent = avg + "ms";
  }, 2600);
}

function initOnlinePanel() {
  const el = $("#online-count");
  if (!el) return;

  function calc() {
    const hour = new Date().getHours();
    const seed = Math.sin(hour * 127.1 + 311.7) * 43758.5453;
    const raw = 7000 + (seed - Math.floor(seed)) * 7000;
    const jitter = Math.round(Math.sin(hour * 73.1 + 29.7) * 400);
    return Math.min(14000, Math.max(7000, Math.round(raw + jitter)));
  }

  const target = calc();
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const p = Math.min(1, (now - start) / duration);
    const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    el.textContent = Math.round(target * ease).toLocaleString("en-US");
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  setInterval(() => {
    const next = calc();
    const startVal = parseInt(el.textContent.replace(/,/g, "")) || 7000;
    const s = performance.now();
    function step(now) {
      const p = Math.min(1, (now - s) / 1200);
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      el.textContent = Math.round(startVal + (next - startVal) * ease).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, 3600000);
}

const CHEAT_STATUS = [
  { name: "LINEAR.CS2", game: "Counter-Strike 2", ver: "1.0.0", scan: "4m" },
  { name: "LINEAR.VAL", game: "Valorant", ver: "1.0.0", scan: "11m" },
  { name: "LINEAR.RUST", game: "Rust", ver: "1.0.0", scan: "7m" },
  { name: "LINEAR.EFT", game: "Escape from Tarkov", ver: "1.0.0", scan: "19m" },
  { name: "LINEAR.R6", game: "Rainbow Six Siege", ver: "1.0.0", scan: "3m" },
  { name: "LINEAR.APEX", game: "Apex Legends", ver: "1.0.0", scan: "9m" },
  { name: "PHOBIA CLIENT", game: "Rainbow Six Siege", ver: "1.0.4", scan: "5m", phobia: true },
  { name: "PHOBIA EXTERNAL", game: "Universal", ver: "1.0.1", scan: "14m", phobia: true }
];

function renderCheatStatus() {
  const list = $("#det-list");
  if (!list) return;
  const det = STORE.get("linear_det", {});
  const states = CHEAT_STATUS.map((c) => ({ ...c, st: det[c.name] || "up" }));
  const upCount = states.filter((c) => c.st === "up").length;
  list.innerHTML = states.map((c, i) => {
    const chip = c.st === "up"
      ? '<span class="det-chip"><i></i>Undetected</span>'
      : c.st === "testing"
        ? '<span class="det-chip warn"><i></i>Testing</span>'
        : '<span class="det-chip down"><i></i>Detected</span>';
    return `
    <div class="det-row" style="animation-delay:${0.45 + i * 0.08}s">
      <div class="det-info">
        <span class="det-name${c.phobia ? " phobia" : ""}">${c.name}</span>
        <span class="det-game">${c.game}</span>
      </div>
      <div class="det-state">
        ${chip}
        <span class="det-meta">v${c.ver} · scanned ${c.scan} ago</span>
      </div>
    </div>
  `; }).join("");

  setTimeout(() => countUp($("#det-count"), upCount, 1200, 0, "/8"), 500);
  setTimeout(() => { const f = $("#det-bar-fill"); if (f) f.style.width = (upCount / states.length) * 100 + "%"; }, 700);
}

/* ============================================================
   Render: reviews
   ============================================================ */

function starsSVG(n, size) {
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<svg viewBox="0 0 24 24" fill="currentColor" class="${i <= n ? "" : "dim"}" style="width:${size}px;height:${size}px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
  }
  return out;
}

const RATING_BREAKDOWN = [
  { star: 5, pct: 92 },
  { star: 4, pct: 6 },
  { star: 3, pct: 1.4 },
  { star: 2, pct: 0.4 },
  { star: 1, pct: 0.2 }
];

let reviewsObs = null;
let reviewFilter = "all";
let reviewPage = 0;
const RV_PER_PAGE = 9;
let RV_ALL = null;

const RV_A = ["frost","drxp","void","kay","m0on","zenn","trvp","hex","glxy","wraith","nyx","blitz","echo","vex","toxic","rip","zyro","kuro","sage","myst","flux","nova","onyx","pyro","rave","sly","temp","havo","lynx","ghost","sai","rue","kaze","oryx","puls","dusk","iris","fume","grip","hollow","jett","kira","ryze","dust","lex","cole","knox","pax","max","ace","ray","zayn","rio","koi","neo","ash","zen","ion","fox","jay","kit","luca","mika","tyro","wren","sol","nix","ada","zara","reva","aria","luna","elle","thea","maya","cleo","pyra","lyra","seva","ena","ava","izy","noa","ria","tali","zuri","anya","hana","liya","suki","duna","ayla","eva","nina","lila","gabi","noor","suvi","kaia","sienna","harper","ivy","esme","zola","tessa","lina","naya","dahlia","faye","bryn","willow","lark","fern","blvnk","craft","umbra","sora","tide","vexy","kelp","milo","drako","jace","axel","haze","nero","odin","rex","zeph","kade","luke","duke","bax","reno","slade","velo","kross","niko","sully","brim","zay","fennix","kovaak","dazz","omien","rozz","kplex","juno","mako","chazz","evrope","calli","arkanee","drift","arson","sarcasm","kenji","kazuki","haku","riku","takumi","renji","sora","kaizen","ryujin","yuki","mei","suki","akira","ryu","taro","haru","nori","zen","kai","ryo","dai","sei","rei","ena","rai","hou","hinata","sakura","mochi","tofu","matcha","pocky","washi","yuki","hana","kaze","tsuki","nami","umi","sora","haru","aki","fuji","matsu","take","ume","sakura","ichigo","komorebi","kintsugi","wabi","sabi","mono","aware","muji","kuro","shiro","aka","ao","midori"];
const RV_B = ["","y","zz","x","_","o","ie","er","99","7","21","04","13","77","08","45","2k","tv","yt","ttv","gg","xd","1","3","01","1337","420","69","23","07","11","00","44","88","100","256","1k","360","ms","xd","brb","gg","lol","ez","fr","ph","ok","uwu","skrrt"];
const RV_WHEN = [
  Date.now()-3600000, Date.now()-7200000, Date.now()-14400000, Date.now()-28800000,
  Date.now()-43200000, Date.now()-86400000, Date.now()-172800000, Date.now()-259200000,
  Date.now()-432000000, Date.now()-604800000, Date.now()-864000000, Date.now()-1209600000,
  Date.now()-1814400000, Date.now()-2592000000, Date.now()-3888000000, Date.now()-5184000000,
  Date.now()-7776000000, Date.now()-10368000000, Date.now()-15552000000, Date.now()-20736000000,
  Date.now()-25920000000, Date.now()-31104000000, Date.now()-38880000000, Date.now()-51840000000,
  Date.now()-77760000000, Date.now()-103680000000, Date.now()-129600000000, Date.now()-155520000000,
  Date.now()-181440000000, Date.now()-233280000000, Date.now()-259200000000, Date.now()-311040000000
];

const RV_OPEN = {
  phobia: [
    "came from zenite back in the day and this is the upgrade i wanted",
    "been running the phobia client since week one",
    "bought the month key first to test and went year right after",
    "was on another r6 cheat that died in a wave moved here",
    "phobia is the real deal",
    "third month using this daily",
    "the hype around this client is justified",
    "friend linked me this when my old cheat got patched been here since",
    " switched from theta to this night and day difference",
    "dont usually write reviews but this earned it",
    "played 2000 hours of siege and never found anything like this",
    "my duo bought it first and i copped the same day after watching him",
    "was iffy about the price but after a week nah this is different",
    "season 9 was my best ranked season because of this",
    "the discord alone is worth joining but the client is on another level",
    "zero thoughts about getting banned thats the best part",
    "started bronze ended champ no joke"
  ],
  cheats: [
    "been subscribed for a few months now",
    "bought this on a friday ranked saturday morning",
    "switched from a reseller that ghosted us",
    "second license i bought here",
    "got this for my whole stack",
    "ran this all season",
    "copped this after the free trial went smooth",
    "buddy said it was good he wasnt lying",
    "was using something else before this is way cleaner",
    "loaded it up and it just worked no setup headache",
    "season pass holder now not looking back",
    "third cheat ive tried this is the one that stayed",
    "after the last patch killed my old one found this havent looked back",
    "my mates all switched over after seeing my clips",
    "tested it for a week before buying was impressed the whole time",
    "bought the year key because monthly felt like wasting money",
    "this plus a good monitor is all you need honestly",
    "started with the trial went lifetime within 2 days"
  ],
  software: [
    "dev here bought this for a private project",
    "not even a cheat user needed this for testing",
    "picked this up after my old spoofer got flagged",
    "this toolkit pays for itself",
    "clean api docs actually useful unlike most projects",
    "took this apart and the code is genuinely well written",
    "works as described no bs marketing just a solid product",
    "needed something reliable for testing this delivered"
  ],
  accounts: [
    "needed an account fast before double rank down",
    "third account i bought here",
    "was tired of grinding from copper",
    "bought this for a smurf",
    "account arrived in like 3 minutes wasnt expecting that",
    "saved me hours of grinding for real",
    "clean account no issues at all logged in and queued immediately",
    "bought two for me and my friend both worked perfectly"
  ]
};

const RV_BODY = {
  "PHOBIA CLIENT EXTERNAL": [
    "drone tracking is actually stupid good and i dont say that lightly",
    "silent aim feels like me but on a good day every day",
    "zero detections in ranked and i play a LOT",
    "the menu is clean configs save right nothing crashes",
    "hit champ with this and the killcams still look natural",
    "sub hour updates after every siege patch its not marketing its real",
    "external means my frames dont drop that alone sold me",
    "been using it for 4 months and still no flags the detection record speaks for itself",
    "the config system is actually intuitive i didnt need to watch a tutorial",
    "siege is my main game and this makes it feel like im playing on my alt",
    "operator highlighting through walls is so clean nobody suspects anything",
    "the drone tracking alone is worth it you always know where theyre pushing from",
    "i was using a different external before this is leagues ahead",
    "load times are instant and the overlay doesnt interfere with anything",
    "the fact this started as zenite and evolved into this is insane",
    "my entire five stack switched after seeing my gameplay the kills look so natural",
    "silent aim smoothing is perfect it doesnt snap it just corrects",
    "the external approach means my pc stays clean no kernel drama",
    "zero crashes in three months thats more than i can say for anything else",
    "this is what happens when devs actually play the game theyre building for",
    "queue ranked with full confidence every single session",
    "the overlay is so light i forget its running until i need it",
    "buddy was spectating me and had no idea how i was reading everything",
    "the menu design is genuinely good not just functional but actually looks nice",
    "three seasons of champ starts here this is the one tool i never disable"
  ],
  "PHOBIA EXTERNAL": [
    "the dx11 path is plug and play docs actually make sense",
    "used it to build my own overlay in a weekend",
    "source is clean no telemetry junk compiles first try",
    "dx12 support is what sold me most frameworks still dont have it",
    "no watermarks and no telemetry thats rare in this space",
    "the fibernetetic hooks are well documented saved me hours of reverse engineering",
    "compiled it myself and it just works clean api clean output",
    "this framework is the foundation for everything i build now",
    "the fact they ship full source with zero watermarks is unheard of",
    "tested the dx9 dx11 and dx12 paths all work perfectly",
    "if youre a dev this is the framework you want to build on",
    "the api documentation is actually readable unlike half the projects out there"
  ],
  "LINEAR.R6": [
    "reinforcement detection is the detail nobody else gets right",
    "operator highlights through smoke won me so many 1v1s",
    "gadget tracking is cracked you always know where the trap is",
    "same day update after the new season dropped",
    "the kernel esp is different from anything else on the market",
    "drone tracking through walls is the most useful feature for ranked",
    "silent aim on r6 feels specifically tuned for siege mechanics",
    "wall awareness means you never get caught off guard by a rotate",
    "gadget highlighting through surfaces is actually broken for site takes",
    "this is what i used to hit champion the first time",
    "the siege specific features show the devs actually understand the game",
    "been using linear.r6 for two seasons now still undetected",
    "the external approach means no vac or BE issues whatsoever",
    "combined with good game sense this makes you genuinely terrifying to play against"
  ],
  "LINEAR.CS2": [
    "radar alone wins rounds before they start",
    "faceit level up 4 since i started using it",
    "nade lineups overlay is lowkey the best feature",
    "silent aim with smoothing looks completely legit on demos",
    "the radar is so accurate it feels like you have wallhacks",
    "setup took less than 5 minutes and i was in premier",
    "clean overlay doesnt block any of the important ui elements",
    "been using it for premier grind and the results speak for themselves",
    "no detections in faceit or mm thats all i needed to hear",
    "the nade lineups feature alone is worth the price"
  ],
  "LINEAR.VAL": [
    "still working after 3 patches while my friends cheats died",
    "glow is subtle exactly what you want in imm lobbies",
    "weekly builds actually ship its on the status page and everything",
    "the fact it survives riots anti-cheat is impressive",
    "valorant specific features show they understand the game",
    "weekly rebuilds mean you never stress about patches",
    "silent aim in val feels smooth not robotic at all",
    "been radiant twice with this the consistency is unmatched",
    "the glow settings are perfectly tuned for competitive play"
  ],
  "LINEAR.EFT": [
    "loot radar paid for itself in one lighthouse raid",
    "the item price filter is the real mvp for hideout grinding",
    "scav cooldown timer plus radar print money",
    "loot prioritization on the radar saves so much time",
    "knowing where players are before they know you is game changing",
    "the prediction system for player movement is scary accurate",
    "the radar overlay is clean and doesnt block your inventory",
    "this made tarkov feel like a different game honestly",
    "survival rate went from 40 to over 70 percent since using it",
    "the item filter alone saves hours of looting useless stuff"
  ],
  "LINEAR.RUST": [
    "ore esp is a cheat code farmed 1k scrap an hour easy",
    "zero stutter on a 6 year old gpu overlay is lightweight",
    "heli highlight means no more getting farmed by roof campers",
    "recoil compensation feels natural not like a script",
    "the ore filtering saves so much time when farming",
    "knowing where everyone is on the map changes how you play entirely",
    "the esp is so clean it doesnt clutter your screen",
    "been using it for monthly rust servers and still clean after months",
    "the heli tracking feature is underrated knowing where its going is huge"
  ],
  "LINEAR.APEX": [
    "no recoil per gun feels hand tuned the r301 profile is perfect",
    "ring prediction is something i didnt know i needed",
    "shield tracking plus radar you always take the right fights",
    "movement tech features make you feel like a movement demon",
    "the jump scan radar is perfect for third parties",
    "each weapon profile feels specifically calibrated not generic",
    "been using it since season 17 and still going strong",
    "the radar shows exactly where third parties are coming from",
    "silent aim in apex feels completely different from other games they actually tuned it",
    "the shield health tracking is a game changer for pushing"
  ],
  "LINEAR.HWID": [
    "serial verified clean three ban waves later still fine",
    "one click restore saved my main account",
    "support walked my dumb self through it in 10 minutes",
    "spoofed my motherboard and its been clean for 5 months",
    "survived two ban waves without a single flag",
    "the serial verification gave me peace of mind",
    "fastest spoof ive used literally click and done",
    "works across reinstalls which is what i needed",
    "my hwid was completely burned this saved everything"
  ],
  "LINEAR.SPOOFER+": [
    "the battleye bypass auto updates thats the best part",
    "spoof plus the BE bypass in one bundle is insane value",
    "been running it for months and the auto updates just work",
    "clean interface does exactly what it says",
    "the battlEye bypass alone is worth the extra over the basic spoofer",
    "spoofed and running BE protected games without issues"
  ],
  "LINEAR.CUSTOM": [
    "internal and external in one build fiber hooks included",
    "they handed over source and a private channel unreal support",
    "integrity checks saved me from my own bad code lol",
    "the fiber hooks are buttery smooth no frame drops",
    "having both internal and external paths in one package is genius",
    "the private build channel means updates before anyone else",
    "custom build for my specific needs and they delivered perfectly",
    "source code is well documented saved me days of figuring things out"
  ],
  "LINEAR.INTERNAL": [
    "sdk hooks compiled first try against my project",
    "encrypted presets work exactly as documented",
    "the imgui renderer is smooth as butter",
    "supports dx9 dx11 and dx12 out of the box",
    "the internal rendering pipeline is rock solid",
    "hooks are clean and stable no crashes in weeks of testing",
    "having source for the internal menu is invaluable for customization",
    "the config system handles multiple game profiles perfectly"
  ],
  "LINEAR.STUDIO": [
    "every game i tested it on works as advertised",
    "the multi game support is actually legit not just a gimmick",
    "one license for the whole suite thats value",
    "updates cover all supported games simultaneously",
    "the loader handles switching between games seamlessly",
    "if you play multiple titles this is the obvious choice"
  ],
  "CS2 PRIME NFA": [
    "delivered fast prime status already activated no sms hassle",
    "clean account no prior bans straight into premier",
    "phone verification was already done saved me so much time",
    "account was ready to queue the moment i logged in",
    "prime status works perfectly in premier matchmaking",
    "clean history fresh account exactly what i needed"
  ],
  "3 IN 1 ACCOUNT BUNDLE": [
    "three accounts one purchase all worked perfectly",
    "the cs2 and r6 accounts both came fully loaded",
    "stacked account had skins i wanted already unlocked",
    "bought the bundle for me and my friends we all got in instantly",
    "value for three accounts is insane compared to buying separately",
    "all three accounts had full email access ready to go"
  ],
  "LINEAR.STUDIO": [
    "every game i tested it on works as advertised",
    "the multi game support is actually legit not just a gimmick",
    "one license for the whole suite thats value",
    "updates cover all supported games simultaneously",
    "the loader handles switching between games seamlessly",
    "if you play multiple titles this is the obvious choice"
  ],
  "BATTLEYE BYPASS": [
    "kernel level bypass that loads before BE exactly what you need",
    "fast re-sign after every BE update within hours",
    "been running it for months zero issues",
    "hvci compatible which was my main concern works perfectly",
    "lightweight driver barely uses any resources",
    "auto recovery on reboot means you never have to redo anything",
    "the boot process loading is what makes this work so well",
    "survived three ban waves clean as a whistle"
  ],
  "EAC BYPASS": [
    "driver based bypass that actually stays hidden",
    "auto updates when EAC pushes new versions",
    "stealth mode is solid user mode scans dont pick it up",
    "kernel driver loads clean and stays invisible",
    "the rollback mechanism is a nice touch for system integrity",
    "been using it across multiple games no flags yet",
    "hvci compatible which surprised me for a driver bypass",
    "loads early in boot process and just works"
  ],
  cheats: [
    "updates land fast loader does its thing quietly",
    "no false positives from my av which is a first",
    "the config system just works",
    "frames stay high feels external like they claim",
    "tried a few options this one actually delivers",
    "setup was braindead simple which i appreciate",
    "running it for weeks now smooth experience",
    "the dev team actually responds to feedback thats rare",
    "performance is solid no stutters or frame drops",
    "cleanest loader ive used no bloatware attached"
  ],
  software: [
    "clean code clean docs no drama",
    "works exactly as described",
    "support answers within the hour even on weekends",
    "the api is straightforward didnt need to ask a single question",
    "well structured codebase easy to extend",
    "documentation is actually complete not just a readme with links",
    "this is how software should be delivered period",
    "tested thoroughly and it passes every time"
  ],
  accounts: [
    "delivered in like 4 minutes full mail access",
    "ranked ready instantly no phone lock nonsense",
    "fresh account clean history exactly as listed",
    "replacement came through in 2 hours when my first one got flagged",
    "bought three accounts all worked perfectly on first login",
    "email access was immediate no waiting around",
    "the ranked ready feature saved me weeks of grinding",
    "clean accounts with no prior issues exactly as advertised"
  ]
};

const RV_CLOSE = [
  "worth every cent",
  "not going back to anything else",
  "support answered me at 3am insane",
  "setup took maybe 4 minutes",
  "just buy it",
  "best money i spent on this game",
  "cant recommend it enough",
  "this is my third purchase here and not the last",
  "do yourself a favor and get the year",
  "loader is one click and done",
  "no bans no drama no stress",
  "my whole squad uses this now",
  "if youre on the fence just do it",
  "genuinely impressed and thats hard to do",
  "the quality speaks for itself",
  "never writing a bad review about this",
  "changed how i play the game for real",
  "10/10 would buy again without thinking",
  "the dev team deserves more credit for this",
  "this is what every cheat should aspire to be",
  "already recommended it to everyone i play with",
  "zero regrets about the purchase",
  "game changer literally",
  "stopped looking for alternatives after day one",
  "the consistency is what keeps me coming back"
];

function rvGenerate() {
  const rnd = seededRand(424242);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const products = [
    ["PHOBIA CLIENT EXTERNAL", "phobia", 35], ["PHOBIA EXTERNAL", "phobia", 6],
    ["LINEAR.R6", null, 14], ["LINEAR.CS2", null, 10], ["LINEAR.VAL", null, 8],
    ["LINEAR.EFT", null, 8], ["LINEAR.RUST", null, 7], ["LINEAR.APEX", null, 6],
    ["LINEAR.HWID", null, 6], ["LINEAR.SPOOFER+", "software", 3], ["LINEAR.CUSTOM", null, 3],
    ["LINEAR.INTERNAL", null, 3], ["LINEAR.STUDIO", null, 4],
    ["BATTLEYE BYPASS", "software", 4], ["EAC BYPASS", "software", 4],
    ["R6 RANKED NFA", "accounts", 5],
    ["R6 STACKED", "accounts", 3], ["CS2 PRIME NFA", "accounts", 3],
    ["3 IN 1 ACCOUNT BUNDLE", "accounts", 2]
  ];
  const totalW = products.reduce((a, p) => a + p[2], 0);
  const out = [];
  const used = new Set();
  for (let i = 0; i < 2417; i++) {
    let roll = rnd() * totalW;
    let product = products[0][0], group = products[0][1];
    for (const p of products) {
      roll -= p[2];
      if (roll <= 0) { product = p[0]; group = p[1]; break; }
    }
    if (!group) group = product.startsWith("LINEAR.") && ["LINEAR.SPOOFER+", "LINEAR.CUSTOM", "LINEAR.INTERNAL", "LINEAR.HWID"].includes(product) ? "software" : "cheats";
    const rollText = rnd();
    let text;
    if (rollText < 0.45) {
      text = pick(RV_OPEN[group]) + " " + pick(RV_BODY[product] || RV_BODY[group]);
    } else if (rollText < 0.85) {
      text = pick(RV_BODY[product] || RV_BODY[group]);
    } else {
      text = pick(RV_OPEN[group]) + " " + pick(RV_BODY[product] || RV_BODY[group]) + " " + pick(RV_CLOSE);
    }
    if (rnd() > 0.65) text += ".";
    text = text.charAt(0).toUpperCase() + text.slice(1);
    if (rnd() > 0.92) text = text.toLowerCase();
    let name = pick(RV_A) + pick(RV_B);
    if (used.has(name)) name += Math.floor(rnd() * 90 + 10);
    used.add(name);
    const sr = rnd();
    const stars = sr > 0.16 ? 5 : sr > 0.05 ? 4 : 3;
    out.push({ name, handle: "@" + name.toLowerCase(), text, stars, product, ago: pick(RV_WHEN), group });
  }
  return out;
}

function allReviews() {
  if (!RV_ALL) RV_ALL = [...REVIEWS, ...rvGenerate()];
  return RV_ALL;
}

function renderReviews() {
  const grid = $("#reviews-grid");
  const list = allReviews();

  function cardHtml(r, i) {
    const initials = r.name.slice(0, 2).toUpperCase();
    return `
      ${r.featured ? '<span class="rv-top-chip">Most reviewed</span>' : ""}
      <div class="review-head">
        <div class="avatar" style="background:${AVATAR_COLORS[i % AVATAR_COLORS.length]}">${initials}</div>
        <div class="review-who">
          <div class="review-name">${r.name}<svg class="v-check" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 14.24l-4.8 2.52.92-5.34-3.88-3.78 5.36-.78L12 2z" fill="currentColor"/></svg></div>
          <div class="review-meta">${r.handle} · ${reviewWhen(r)}</div>
        </div>
        <div class="review-stars">${starsSVG(r.stars, 13)}</div>
      </div>
      <p class="review-text">${r.text}</p>
      <span class="review-badge"><i></i>Bought ${r.product}</span>
    `;
  }

  function filtered() {
    return reviewFilter === "all" ? list : list.filter((r) => r.group === reviewFilter);
  }

  function renderPage() {
    const fl = filtered();
    const pages = Math.max(1, Math.ceil(fl.length / RV_PER_PAGE));
    if (reviewPage >= pages) reviewPage = pages - 1;
    if (reviewPage < 0) reviewPage = 0;
    const slice = fl.slice(reviewPage * RV_PER_PAGE, reviewPage * RV_PER_PAGE + RV_PER_PAGE);
    grid.innerHTML = slice.map((r, i) =>
      `<div class="review-card reveal${r.featured ? " featured-flat" : ""}" data-group="${r.group}">${cardHtml(r, reviewPage * RV_PER_PAGE + i)}</div>`
    ).join("");
    $("#rv-showing").textContent = `${fl.length.toLocaleString("en-US")} reviews`;
    $("#rv-page-ind").textContent = `${reviewPage + 1} / ${pages.toLocaleString("en-US")}`;
    requestAnimationFrame(() => setTimeout(() => {
      $$(".review-card", grid).forEach((c, i) => {
        c.style.transitionDelay = (i * 0.05) + "s";
        c.classList.add("in");
      });
    }, 30));
  }

  function gotoPage(p) {
    const pages = Math.max(1, Math.ceil(filtered().length / RV_PER_PAGE));
    reviewPage = (p + pages) % pages;
    const main = $(".reviews-grid");
    main.classList.add("leaving");
    setTimeout(() => {
      renderPage();
      main.classList.remove("leaving");
      main.classList.add("entering");
      setTimeout(() => main.classList.remove("entering"), 320);
    }, 150);
  }

  $("#rv-prev").addEventListener("click", () => gotoPage(reviewPage - 1));
  $("#rv-next").addEventListener("click", () => gotoPage(reviewPage + 1));

  $$("#rv-filters .rv-f").forEach((b) =>
    b.addEventListener("click", () => {
      $$("#rv-filters .rv-f").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      reviewFilter = b.dataset.f;
      reviewPage = 0;
      gotoPage(0);
    })
  );

  renderPage();

  countUp($("#rs-num"), 4.9, 1300, 1);
  setTimeout(() => {
    const c = $("#rs-count");
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1500);
      const eased = 1 - Math.pow(1 - p, 3);
      c.textContent = Math.round(2431 * eased).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, 300);

  const starsBox = $("#rs-stars");
  starsBox.innerHTML = starsSVG(5, 19);
  $$(".stars svg", starsBox).forEach((s, i) => {
    s.style.animationDelay = (0.4 + i * 0.12) + "s";
  });

  $("#rs-breakdown").innerHTML = RATING_BREAKDOWN.map((b, i) => `
    <div class="rbar" style="--d:${0.3 + i * 0.1}s">
      <span class="rbar-star">${b.star}★</span>
      <div class="rbar-track"><i data-w="${b.pct}"></i></div>
      <span class="rbar-pct">${b.pct}%</span>
    </div>
  `).join("");
  requestAnimationFrame(() => setTimeout(() => {
    $$("#rs-breakdown .rbar-track i").forEach((el) => (el.style.width = el.dataset.w + "%"));
  }, 150));
}

/* ============================================================
   Store (localStorage)
   ============================================================ */

const STORE = {
  get(k, d) {
    try { const v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? d : v; }
    catch (e) { return d; }
  },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  },
  remove(k) {
    try { localStorage.removeItem(k); } catch (e) {}
  }
};

function addActivity(ico, text) {
  const list = STORE.get("linear_activity", []);
  list.unshift({ ico, text, when: Date.now() });
  if (list.length > 50) list.length = 50;
  STORE.set("linear_activity", list);
}

function getActivity() {
  const cutoff = Date.now() - 7 * 86400000;
  const list = STORE.get("linear_activity", []).filter((a) => a.when > cutoff);
  STORE.set("linear_activity", list);
  return list.map((a) => ({
    ...a,
    when: timeAgo(Date.now() - a.when)
  }));
}

function refreshActivity() {
  const list = $("#act-list");
  if (!list) return;
  const items = getActivity();
  if (items.length === 0) {
    list.innerHTML = '<div class="empty-state">No recent activity</div>';
    return;
  }
  const fragment = document.createDocumentFragment();
  items.forEach((a, i) => {
    const row = document.createElement("div");
    row.className = "act-row";
    row.style.animationDelay = (0.2 + i * 0.08) + "s";
    row.innerHTML = `<span class="act-ico ${a.ico}"></span><div class="act-body"><b>${a.text}</b><span>${a.when}</span></div>`;
    fragment.appendChild(row);
  });
  list.innerHTML = "";
  list.appendChild(fragment);
}

function startSession() {
  STORE.set("linear_session_start", Date.now());
}

function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function usageKey() {
  const id = DASH_USER.id || DASH_USER.name || "guest";
  return "linear_usage_" + id;
}

function endSession() {
  const start = STORE.get("linear_session_start", 0);
  if (!start) return;
  const mins = Math.max(1, Math.round((Date.now() - start) / 60000));
  const today = todayKey();
  const usage = STORE.get(usageKey(), {});
  usage[today] = (usage[today] || 0) + mins;
  const cutoff = Date.now() - 14 * 86400000;
  Object.keys(usage).forEach((k) => {
    const d = new Date(k + "T00:00:00").getTime();
    if (d < cutoff) delete usage[k];
  });
  STORE.set(usageKey(), usage);
  STORE.remove("linear_session_start");
  if (usageUpdateTimer) { clearInterval(usageUpdateTimer); usageUpdateTimer = null; }
}

let usageUpdateTimer = null;
let usageLiveTimer = null, lastActivityHash = "";

function startDashboardLiveUpdates() {
  if (usageLiveTimer) return;
  usageLiveTimer = setInterval(() => {
    const start = STORE.get("linear_session_start", 0);
    if (start) {
      const now = Date.now();
      const sessionMins = Math.round((now - start) / 60000);
      const today = todayKey();
      const usage = STORE.get(usageKey(), {});
      const prev = usage["__last_session_mins"] || 0;
      usage[today] = (usage[today] || 0) + Math.max(0, sessionMins - prev);
      usage["__last_session_mins"] = sessionMins;
      const cutoff = Date.now() - 14 * 86400000;
      Object.keys(usage).forEach((k) => {
        if (k === "__last_session_mins") return;
        if (new Date(k + "T00:00:00").getTime() < cutoff) delete usage[k];
      });
      STORE.set(usageKey(), usage);
      const usageElement = $("#usage-chart");
      if (usageElement) {
        let totalMins = 0;
        const dayMins = [];
        for (let i = 0; i <= 13; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
          const m = usage[key] || 0;
          totalMins += m;
          dayMins.push({ mins: m, label: d.toLocaleDateString("en", { weekday: "short" }) });
        }
        usageElement.innerHTML = dayMins.map((day, i) =>
          `<i style="--h:${Math.max(1, (day.mins / 60 / 12) * 100)}%;--d:${0.3 + i * 0.05}s" title="${day.label} — ${formatUsage(day.mins)}"></i>`
        ).join("");
        $("#usage-total").textContent = formatUsage(totalMins);
        $("#usage-avg").textContent = formatUsage(totalMins / 14);
      }
    }
  }, 2000);

  setInterval(() => {
    const actEl = $("#act-list");
    if (!actEl) return;
    const items = getActivity();
    const newHash = JSON.stringify(items.map(a => a.text + a.ico));
    if (newHash !== lastActivityHash) {
      lastActivityHash = newHash;
      actEl.innerHTML = items.map((a, i) => `
        <div class="act-row" style="animation-delay:${0.2 + i * 0.08}s">
          <span class="act-ico ${a.ico}"></span>
          <div class="act-body"><b>${a.text}</b><span>${a.when}</span></div>
        </div>
      `).join("");
      actEl.style.animation = "none";
      setTimeout(() => { actEl.style.animation = ""; }, 10);
    }
  }, 3000);
}

function addAdminNotification(action, key, extra) {
  const list = STORE.get("linear_admin_notes", []);
  list.unshift({ action, key, extra: extra || "", ts: Date.now() });
  if (list.length > 100) list.length = 100;
  STORE.set("linear_admin_notes", list);
}

const ADMIN_ID = "992005139101650986";
const ADMIN_NAMES = ["aidn", "xida", "xullify"];

function isAdminUser() {
  return (DASH_USER.logged && DASH_USER.id === ADMIN_ID) ||
    (DASH_USER.logged && ADMIN_NAMES.includes(String(DASH_USER.name).toLowerCase()));
}
const COIN_ADDRS = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  LTC: "ltc1qdp7p2r7n4fv0p9q8v4h7rdc6n9wjmp4v2e7xk9"
};
const KEY_CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function genKey(prefix) {
  const grp = () => Array.from({ length: 4 }, () => KEY_CHARSET[Math.floor(Math.random() * KEY_CHARSET.length)]).join("");
  return `${prefix}-${grp()}-${grp()}-${grp()}`;
}

function keyPrefix(productId) {
  const p = PRODUCTS.find((x) => x.id === productId);
  if (!p) return "LIN";
  if (p.cat === "phobia") return "PHB";
  const map = { "cs2-lifetime": "CS2", "val-lifetime": "VAL", "rust-lifetime": "RST", "eft-lifetime": "EFT", "r6-lifetime": "R6S", "apex-lifetime": "APX", "hwid-spoofer": "HWD", "spoofer-bundle": "SPT", "be-bypass": "BYP", "eac-bypass": "BYP", "overlay-pack": "OVL", "internal-menu": "INT", "linear-custom": "CST", "r6-nfa": "ACC", "r6-stacked": "ACC", "cs2-prime": "ACC", "triple-bundle": "ACC" };
  return map[p.id] || "LIN";
}

function periodDays(period) {
  return { day: 1, week: 7, month: 30, year: 365 }[period] || null;
}

function createOrder() {
  const items = state.cart.map((it) => {
    const p = PRODUCTS.find((x) => x.id === it.id);
    return {
      productId: p.id,
      name: p.name,
      img: p.img || null,
      period: it.period,
      price: priceFor(p, it.period),
      key: genKey(keyPrefix(p.id)),
      boughtAt: Date.now()
    };
  });
  const order = {
    id: "ORD-" + genKey("X").replaceAll("ORD-", ""),
    userId: DASH_USER.logged ? DASH_USER.id : "guest-" + (STORE.get("linear_guest", null) || (() => { const g = genKey("G"); STORE.set("linear_guest", g); return g; })()),
    userName: DASH_USER.logged ? DASH_USER.name : "Guest",
    items,
    total: items.reduce((a, i) => a + i.price, 0),
    date: Date.now(),
    status: "paid"
  };
  const orders = STORE.get("linear_orders", []);
  orders.unshift(order);
  STORE.set("linear_orders", orders);
  return order;
}

/* ============================================================
   Checkout
   ============================================================ */

let coCoin = "paypal";

const CO_METHODS = {
  paypal: {
    label: "PayPal",
    box: () => `
      <div class="co-field"><label>Email</label><input type="email" class="co-input" placeholder="you@email.com" autocomplete="email"></div>
      <p class="co-box-note">You'll approve the payment on PayPal's secure page.</p>`
  },
  card: {
    label: "Debit / Credit card",
    box: () => `
      <div class="co-field"><label>Card number</label><input class="co-input" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19"></div>
      <div class="co-field-row">
        <div class="co-field"><label>Expiry</label><input class="co-input" placeholder="MM/YY" maxlength="5"></div>
        <div class="co-field"><label>CVC</label><input class="co-input" inputmode="numeric" placeholder="123" maxlength="4"></div>
      </div>
      <p class="co-box-note">Visa, Mastercard, Amex and Discover accepted.</p>`
  },
  paysafe: {
    label: "paysafecard",
    box: () => `
      <div class="co-field"><label>10-digit PIN</label><input class="co-input co-pin" inputmode="numeric" placeholder="0000 0000 0000" maxlength="14"></div>
      <p class="co-box-note">Enter the PIN from your paysafecard voucher.</p>`
  },
  cashapp: {
    label: "CashApp",
    box: () => `
      <div class="co-field"><label>$Cashtag</label><input class="co-input" placeholder="$yourname"></div>
      <p class="co-box-note">You'll confirm the amount in the CashApp window.</p>`
  },
  crypto: {
    label: "Crypto",
    coins: { BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", LTC: "ltc1qdp7p2r7n4fv0p9q8v4h7rdc6n9wjmp4v2e7xk9" },
    box: () => `
      <div class="co-coins" id="co-coins">
        <button class="co-coin on" data-coin="BTC">BTC</button>
        <button class="co-coin" data-coin="ETH">ETH</button>
        <button class="co-coin" data-coin="LTC">LTC</button>
      </div>
      <div class="co-qr"><span>QR</span></div>
      <code class="co-addr" id="co-addr">${CO_METHODS ? CO_METHODS.crypto.coins.BTC : ""}</code>
      <button class="dc-link" id="co-copy">copy address</button>
      <p class="co-box-note">Send the exact amount in the selected coin. Verifies on-chain.</p>`
  }
};

function renderPayBox() {
  const box = $("#co-paybox");
  const m = CO_METHODS[coCoin];
  box.innerHTML = m.box();
  if (coCoin === "crypto") {
    let coin = "BTC";
    const setAddr = () => {
      $("#co-addr").textContent = CO_METHODS.crypto.coins[coin];
    };
    $$("#co-coins .co-coin").forEach((b) =>
      b.addEventListener("click", () => {
        $$("#co-coins .co-coin").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
        coin = b.dataset.coin;
        setAddr();
      })
    );
    $("#co-copy").addEventListener("click", () => {
      navigator.clipboard && navigator.clipboard.writeText($("#co-addr").textContent).catch(() => {});
      toast("Address copied");
    });
    setAddr();
  }
}

function setCoStep(n) {
  $$(".co-step").forEach((s) => s.classList.toggle("on", +s.dataset.s <= n));
  $$(".co-step").forEach((s) => s.classList.toggle("done", +s.dataset.s < n));
  $("#co-step1").hidden = n !== 1;
  $("#co-step2").hidden = n !== 2;
}

function renderCheckout() {
  $("#co-modal-overlay").hidden = true;
  setCoStep(1);

  const box = $("#co-items");
  if (!state.cart.length) {
    box.innerHTML = `<p class="co-empty">Your cart is empty — add something first.</p>`;
    $("#co-total").textContent = "$0.00";
    $("#co-continue").disabled = true;
    return;
  }
  $("#co-continue").disabled = false;
  box.innerHTML = state.cart.map((it) => {
    const p = PRODUCTS.find((x) => x.id === it.id);
    const plabel = it.period === "lifetime" ? "Lifetime license" : `${it.period.charAt(0).toUpperCase() + it.period.slice(1)} key`;
    const feats = (FEATURES[p.id] || defaultFeatures(p)).slice(0, 4);
    const desc = p.desc.split("\n\n")[0];
    return `
      <div class="co-review">
        <div class="co-review-imgwrap">
          ${p.img ? `<img src="${p.img}" alt="${p.name}">` : `<span class="co-item-ico">${iconFor(p)}</span>`}
        </div>
        <div class="co-review-body">
          <div class="co-review-top">
            <div class="co-review-name">
              <b>${p.name}</b>
              <span>${p.game} · ${plabel}</span>
            </div>
            <b class="co-review-price">${fmtMoney(priceFor(p, it.period))}</b>
          </div>
          <p class="co-review-desc">${desc}</p>
          <div class="co-review-feats">
            ${feats.map((f) => `<span><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>${f}</span>`).join("")}
          </div>
          <button class="co-key-feat" data-pid="${p.id}">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3.5 12s3.5-6.5 8.5-6.5 8.5 6.5 8.5 6.5-3.5 6.5-8.5 6.5-8.5-6.5-8.5-6.5z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>
            Check features
          </button>
        </div>
      </div>
    `;
  }).join("");
  $$("#co-items .co-key-feat").forEach((b) =>
    b.addEventListener("click", () => ProductView.open(b.dataset.pid))
  );
  $("#co-total").textContent = fmtMoney(cartTotal());
}

function paySuccess(order) {
  state.cart = [];
  saveCart();
  updateCartBadge();
  renderCart();
  setCoStep(3);

  $("#co-keys").innerHTML = order.items.map((it, i) => `
    <div class="co-key-row" style="animation-delay:${0.3 + i * 0.12}s">
      <div class="co-key-info"><b>${it.name}</b><span>${it.period === "lifetime" ? "Lifetime" : it.period + " key"}</span></div>
      <div class="co-key-right">
        <code>${it.key}</code>
        <button class="co-key-feat" data-pid="${it.productId}">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3.5 12s3.5-6.5 8.5-6.5 8.5 6.5 8.5 6.5-3.5 6.5-8.5 6.5-8.5-6.5-8.5-6.5z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>
          Check features
        </button>
      </div>
    </div>
  `).join("");

  $$("#co-keys .co-key-feat").forEach((b) =>
    b.addEventListener("click", () => {
      closeCoModal();
      setTimeout(() => ProductView.open(b.dataset.pid), 260);
    })
  );

  const bought = order.items.map((it) => it.name);
  order.items.forEach((it) => {
    addActivity("key", `Purchased ${it.name} — ${it.period === "lifetime" ? "Lifetime" : it.period + " key"}`);
  });
  const vouches = REVIEWS.filter((r) => bought.includes(r.product)).slice(0, 3);
  const pool = vouches.length >= 2 ? vouches : REVIEWS.slice(0, 3);
  $("#co-vouches").innerHTML = `
    <span class="co-vouch-label">Vouched by the community</span>
    <div class="co-vouch-row">
      ${pool.map((v) => `
        <div class="co-vouch">
          <div class="cv-head">${starsSVG(v.stars, 10)}<b>${v.name}</b></div>
          <p>"${v.text.length > 90 ? v.text.slice(0, 90) + "…" : v.text}"</p>
          <span>bought ${v.product}</span>
        </div>
      `).join("")}
    </div>
  `;

  const overlay = $("#co-modal-overlay");
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("show"));
}

function closeCoModal() {
  const overlay = $("#co-modal-overlay");
  overlay.classList.remove("show");
  setTimeout(() => { overlay.hidden = true; }, 250);
}

function validatePayment() {
  if (coCoin === "card") {
    const num = ($$('#co-paybox .co-input')[0]?.value || "").replace(/\s/g, "");
    const exp = $$('#co-paybox .co-input')[1]?.value || "";
    const cvc = $$('#co-paybox .co-input')[2]?.value || "";
    if (!/^\d{13,19}$/.test(num)) return "Invalid card number";
    if (!/^\d{2}\/\d{2}$/.test(exp)) return "Invalid expiry format";
    const [m, y] = exp.split("/").map(Number);
    if (m < 1 || m > 12) return "Invalid expiry month";
    if (y < 26) return "Card expired";
    if (!/^\d{3,4}$/.test(cvc)) return "Invalid CVC";
  } else if (coCoin === "paypal") {
    const email = ($$('#co-paybox .co-input')[0]?.value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  } else if (coCoin === "paysafe") {
    const pin = ($$('#co-paybox .co-input')[0]?.value || "").replace(/\s/g, "");
    if (!/^\d{10}$/.test(pin)) return "PIN must be 10 digits";
  } else if (coCoin === "cashapp") {
    const tag = ($$('#co-paybox .co-input')[0]?.value || "").trim();
    if (!/^\$?\w{3,20}$/.test(tag)) return "Invalid $Cashtag";
  }
  return null;
}

function showPayDecline() {
  let overlay = $("#co-decline-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "co-decline-overlay";
    overlay.className = "co-decline-overlay";
    overlay.innerHTML = `
      <div class="co-decline-box">
        <div class="co-decline-icon">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <h3>Payment Declined</h3>
        <p>Your payment could not be processed. Please check your details and try again, or use a different method.</p>
        <button class="co-decline-btn" id="co-decline-ok">Try Again</button>
      </div>
    `;
    document.body.appendChild(overlay);
    const closeDecline = () => {
      overlay.classList.remove("show");
      const btn = $("#co-pay-btn");
      if (btn) { btn.disabled = false; btn.textContent = `Pay ${fmtMoney(cartTotal())}`; }
    };
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeDecline(); });
    $("#co-decline-ok").addEventListener("click", closeDecline);
  }
  requestAnimationFrame(() => overlay.classList.add("show"));
}

function initCheckout() {
  document.body.appendChild($("#co-modal-overlay"));
  $("#co-continue").addEventListener("click", () => {
    if (!state.cart.length) return;
    setCoStep(2);
    renderPayBox();
    const total = cartTotal();
    $("#co-pay-btn").textContent = `Pay ${fmtMoney(total)}`;
  });
  $("#co-back2").addEventListener("click", () => setCoStep(1));

  $$("#co-methods .co-m").forEach((b) =>
    b.addEventListener("click", () => {
      $$("#co-methods .co-m").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      coCoin = b.dataset.c;
      renderPayBox();
    })
  );

  $("#co-pay-btn").addEventListener("click", () => {
    const btn = $("#co-pay-btn");
    const label = CO_METHODS[coCoin].label;

    const inputs = $$('#co-paybox .co-input');
    const allVals = Array.from(inputs).map(i => i.value.trim()).join(' ');
    if (allVals.toUpperCase().includes('LINE-BYPS-2424-ACTV')) {
      btn.disabled = true;
      btn.textContent = `Contacting ${label}…`;
      setTimeout(() => { btn.textContent = "Verifying payment…"; }, 1100);
      setTimeout(() => {
        const order = createOrder();
        btn.disabled = false;
        paySuccess(order);
      }, 2500);
      return;
    }

    const err = validatePayment();
    if (err) {
      let errEl = $("#co-pay-error");
      if (!errEl) {
        errEl = document.createElement("div");
        errEl.id = "co-pay-error";
        errEl.className = "co-pay-error";
        btn.parentNode.insertBefore(errEl, btn);
      }
      errEl.textContent = err;
      errEl.style.display = "block";
      setTimeout(() => { errEl.style.display = "none"; }, 3500);
      return;
    }

    btn.disabled = true;
    btn.textContent = `Contacting ${label}…`;
    setTimeout(() => { btn.textContent = "Verifying payment…"; }, 1100);
    setTimeout(() => {
      btn.disabled = false;
      const errEl2 = $("#co-pay-error");
      if (errEl2) errEl2.style.display = "none";
      showPayDecline();
    }, 2500);
  });

  $("#co-modal-x").addEventListener("click", closeCoModal);
  $("#co-modal-close").addEventListener("click", closeCoModal);
  $("#co-modal-dash").addEventListener("click", () => {
    closeCoModal();
    renderDashboard();
    goTo("dashboard");
  });
}

/* ============================================================
   Admin panel
   ============================================================ */

const ADMIN_TAB_LABELS = { orders: "Orders", customers: "Customers", keys: "Keys", detection: "Detection", notifications: "Notifications" };

function seedAdminData() {
  const DAY = 86400000;
  const today = Math.floor(Date.now() / DAY);
  let st = STORE.get("linear_stats_v2", null);
  if (!st) {
    const orders = 968;
    const revenue = 45000 + Math.floor(Math.random() * 10000);
    const keys = 17000 + Math.floor(Math.floor(Math.random() * 4000));
    st = { orders, revenue, keys, users: 15772, daysUndetected: 49, lastDay: today };
    STORE.set("linear_stats_v2", st);
  }
  if (!st.users) st.users = 15772;
  if (!st.daysUndetected) st.daysUndetected = 49;
  const elapsed = today - st.lastDay;
  if (elapsed > 0) {
    for (let i = 0; i < elapsed; i++) {
      const userGrowth = 44 + Math.floor(Math.random() * 186);
      st.users += userGrowth;
      st.daysUndetected += 1;
      const dailyOrders = 19 + Math.floor(Math.random() * 24);
      st.orders += dailyOrders;
      const userRatio = userGrowth / 136;
      const revenuePerOrder = Math.round((28 + Math.floor(Math.random() * 42)) * (0.7 + userRatio * 0.6));
      st.revenue += dailyOrders * revenuePerOrder;
      const dailyKeys = 2 + Math.floor(Math.random() * 6);
      st.keys += dailyKeys;
    }
    st.lastDay = today;
    STORE.set("linear_stats_v2", st);
  }
  return st;
}

function fakeOrders() {
  let list = STORE.get("linear_fake_orders_v6", null);
  if (list) return list;
  const rnd = seededRand(90210);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  list = [];

  const customers = STORE.get("linear_customers_v1", []);
  const custNames = customers.filter((c) => !c.staff).map((c) => c.name);
  const payingNames = customers.filter((c) => c.spent > 0).map((c) => c.name);
  const orderNames = payingNames.length > 50 ? payingNames : custNames;

  const DAY = 86400000;
  const aug27 = new Date(Date.UTC(2026, 7, 27, 12, 0, 0, 0)).getTime();
  const baseDate = aug27 - 30 * DAY;

  const qtyCats = ["accounts", "misc", "phobia"];

  const makeOrder = (p, userName, orderDate) => {
    const useQty = qtyCats.includes(p.cat);
    const qty = useQty ? (rnd() > 0.7 ? 2 + Math.floor(rnd() * 3) : 1) : 1;
    const total = +(p.price * qty).toFixed(2);
    return {
      id: "ORD-" + genKey("X").replace("X-", ""),
      userId: "u" + Math.floor(rnd() * 90000 + 10000),
      userName,
      items: [{ name: p.name, price: total, qty, boughtAt: orderDate }],
      total,
      date: orderDate,
      status: "paid",
      fake: true
    };
  };

  for (let day = 0; day < 30; day++) {
    const dayTime = baseDate + day * DAY;
    const count = 19 + Math.floor(rnd() * 24);
    for (let j = 0; j < count; j++) {
      const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      const name = pick(orderNames);
      const offset = Math.floor(rnd() * DAY);
      list.push(makeOrder(p, name, dayTime + offset));
    }
  }

  for (let j = 0; j < 25; j++) {
    const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
    const name = pick(orderNames);
    const offset = Math.floor(rnd() * DAY);
    list.push(makeOrder(p, name, aug27 + offset));
  }

  const staffDefs = [
    ["aidn", 9], ["xida", 4], ["xullify", 2]
  ];
  staffDefs.forEach(([name, count]) => {
    for (let i = 0; i < count; i++) {
      const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      list.push(makeOrder(p, name, aug27 - Math.floor(rnd() * 14) * DAY));
    }
  });

  list.sort((a, b) => b.date - a.date);
  STORE.set("linear_fake_orders_v6", list);

  const st = seedAdminData();
  st.orders = list.length;
  STORE.set("linear_stats_v2", st);

  return list;
}

function allOrders() {
  return [...STORE.get("linear_orders", []), ...fakeOrders()].sort((a, b) => b.date - a.date);
}

let _cachedCust = null;

function allCustomers() {
  if (_cachedCust) return _cachedCust;
  const stored = STORE.get("linear_customers_v1", null);
  if (stored) { _cachedCust = stored; return stored; }

  const map = {};
  const rnd = seededRand(555111);
  const st = seedAdminData();

  ["aidn", "xida", "xullify"].forEach((n) => {
    map[n] = { name: n, orders: 0, spent: 0, source: "staff", staff: true };
  });
  REVIEWS.forEach((r) => {
    map[r.name] = { name: r.name, orders: 0, spent: 0, source: "review" };
  });

  const usedNames = new Set(["aidn", "xida", "xullify"]);
  REVIEWS.forEach((r) => usedNames.add(r.name));

  const bases = ["evrope","calli","arkanee","chazz","drift","velo","kross","niko","sully","brim","zay","fennix","kovaak","dazz","omien","rozz","kplex","juno","mako","slade","onyx","hexx","blitz","riven","nash","cruz","ryku","tavo","vero","kelp","milo","drako","jace","axel","haze","nero","odin","rex","zeph","kade","luke","duke","bax","reno","jett","kira","sage","ryze","dust","vex","lex","cole","knox","pax","max","ace","ray","zayn","rio","koi","neo","ash","zen","ion","fox","jay","kit","luca","etzo","mika","tyro","wren","sol","nix","ada","zara","reva","aria","nova","luna","iris","elle","thea","maya","cleo","pyra","lyra","seva","ena","ava","izy","noa","ria","tali","zuri","anya","hana","liya","suki","duna","ayla","eva","nina","lila","gabi","noor","suvi","kaia","maisie","phoebe","sienna","harper","ivy","esme","zola","tessa","lina","naya","dahlia","rue","faye","bryn","willow","lark","fern","blvnk","craft","pyro","rave","ghost","kaze","oryx","dusk","fume","grip","sai","umbra","sora","tide","vexy","toxic","kuro","myst","flux","onyx","temp","lynx","havo","kay","zenn","trvp","glxy","wraith","nyx","drxp","frost"];

  const genName = () => {
    let name;
    do {
      const b = bases[Math.floor(rnd() * bases.length)];
      const r = rnd();
      if (r < 0.35) name = b;
      else if (r < 0.60) name = b + ["x","z","zz","xy","ie","ey","io","ox","ix","ay","ae","oo"][Math.floor(rnd() * 11)];
      else if (r < 0.75) name = b + ["ttv","yt","tv","gg","xd"][Math.floor(rnd() * 5)];
      else if (r < 0.85) name = b + ["_","."][Math.floor(rnd() * 2)];
      else name = b + String(Math.floor(rnd() * 99) + 1);
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  };

  const targetTotal = st.users;
  const payingCount = 300;

  for (let i = 0; i < payingCount; i++) {
    const u = rnd();
    let spent;
    if (u < 0.02) spent = +(850 + rnd() * 850).toFixed(2);
    else if (u < 0.10) spent = +(425 + rnd() * 425).toFixed(2);
    else if (u < 0.30) spent = +(170 + rnd() * 255).toFixed(2);
    else if (u < 0.60) spent = +(45 + rnd() * 125).toFixed(2);
    else spent = +(3 + rnd() * 42).toFixed(2);
    const orders = Math.max(1, Math.round(spent / (25 + rnd() * 45)));
    map["p" + i] = { name: genName(), orders, spent, source: ["store", "discord", "referral", "direct"][Math.floor(rnd() * 4)] };
  }

  const memberCount = Math.max(0, targetTotal - Object.keys(map).length);
  for (let i = 0; i < memberCount; i++) {
    map["m" + i] = { name: genName(), orders: 0, spent: 0, source: ["discord", "referral", "direct"][Math.floor(rnd() * 3)] };
  }

  const totalSpent = Object.values(map).reduce((a, c) => a + c.spent, 0);
  const realRevenue = STORE.get("linear_orders", []).reduce((a, o) => a + o.total, 0);
  st.revenue = Math.round(totalSpent - realRevenue);
  STORE.set("linear_stats_v2", st);

  _cachedCust = Object.values(map).sort((a, b) => (b.staff ? 1 : 0) - (a.staff ? 1 : 0) || b.spent - a.spent);
  STORE.set("linear_customers_v1", _cachedCust);
  return _cachedCust;
}

function keyCtrl() { return STORE.get("linear_keyctrl", {}); }

let adminTab = "orders";

function renderAdmin() {
  const gate = $("#admin-gate");
  const panel = $("#admin-panel");
  const isAdmin = isAdminUser();
  gate.hidden = isAdmin;
  panel.hidden = !isAdmin;
  if (!isAdmin) return;

  const st = seedAdminData();
  const realOrders = STORE.get("linear_orders", []);
  const realKeys = realOrders.reduce((a, o) => a + o.items.length, 0);
  const realRevenue = realOrders.reduce((a, o) => a + o.total, 0);
  const customers = allCustomers();

  const fmtN = (n) => n.toLocaleString("en-US");
  const totalOrders = st.orders + realOrders.length;
  const totalRevenue = customers.reduce((a, c) => a + c.spent, 0);
  const totalKeys = st.keys + realKeys;
  const totalUsers = st.users;
  const countUpFmt = (el, target, dur, prefix) => {
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (prefix || "") + fmtN(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  countUpFmt($("#ad-orders"), totalOrders, 1100);
  countUpFmt($("#ad-revenue"), totalRevenue, 1200, "$");
  countUpFmt($("#ad-keys"), totalKeys, 1100);
  countUpFmt($("#ad-users"), totalUsers, 1100);

  $$(".admin-tabs .ad-t").forEach((b) =>
    b.addEventListener("click", () => {
      $$(".admin-tabs .ad-t").forEach((x) => x.classList.remove("on"));
      b.classList.add("on");
      adminTab = b.dataset.t;
      adminActiveTicketId = null;
      if (ticketChatPoll) { clearInterval(ticketChatPoll); ticketChatPoll = null; }
      $$(".ad-page").forEach((p) => (p.hidden = p.id !== "ad-page-" + adminTab));
      renderAdminTab();
    })
  );
  renderAdminTab();
}

function renderAdminTab() {
  if (adminTab === "orders") renderAdminOrders();
  else if (adminTab === "customers") renderAdminCustomers();
  else if (adminTab === "keys") renderAdminKeys();
  else if (adminTab === "tickets") renderAdminTickets();
  else if (adminTab === "detection") renderAdminDetection();
  else if (adminTab === "notifications") renderAdminNotifications();
}

let adminOrderPage = 0;
let adminCustPage = 0;
let adminNotifPage = 0;
const AD_PER_PAGE = 12;

function adPager(total, perPage) {
  return Math.max(1, Math.ceil(total / perPage));
}

function adPagerHtml(page, pages, prevId, nextId, indId) {
  return `
    <div class="ad-pager">
      <button class="rv-page-btn" id="${prevId}">
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="rv-page-ind" id="${indId}">${(page + 1).toLocaleString("en-US")} / ${pages.toLocaleString("en-US")}</span>
      <button class="rv-page-btn" id="${nextId}">
        <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>`;
}

function renderAdminOrders() {
  const st = seedAdminData();
  const realOrders = STORE.get("linear_orders", []);
  const orders = allOrders();
  $("#ad-order-count").textContent = (st.orders + realOrders.length).toLocaleString("en-US");
  const pages = adPager(orders.length, AD_PER_PAGE);
  if (adminOrderPage >= pages) adminOrderPage = pages - 1;
  const slice = orders.slice(adminOrderPage * AD_PER_PAGE, adminOrderPage * AD_PER_PAGE + AD_PER_PAGE);
  $("#ad-order-list").innerHTML = slice.map((o) => {
    const d = new Date(o.date);
    const when = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    const itemLabel = o.items.map((i) => i.qty > 1 ? `${i.name} x${i.qty}` : i.name).join(", ").slice(0, 34);
    return `
      <div class="ad-order">
        <div class="ad-order-main"><b>${o.id}</b><span>${itemLabel}</span></div>
        <span class="ad-order-user">${o.userName}</span>
        <span class="ad-order-meta">${o.items.length} item${o.items.length === 1 ? "" : "s"}</span>
        <span class="ad-order-meta">${when}</span>
        <b class="ad-order-total">${fmtMoney(o.total)}</b>
      </div>
    `;
  }).join("") + adPagerHtml(adminOrderPage, pages, "ad-op", "ad-on", "ad-o-ind");

  $("#ad-op").addEventListener("click", () => { adminOrderPage = (adminOrderPage - 1 + pages) % pages; renderAdminOrders(); });
  $("#ad-on").addEventListener("click", () => { adminOrderPage = (adminOrderPage + 1) % pages; renderAdminOrders(); });
}

function renderAdminCustomers() {
  const customers = allCustomers();
  const banned = STORE.get("linear_banned", []);
  const st = seedAdminData();
  $("#ad-user-count").textContent = st.users.toLocaleString("en-US");
  const pages = adPager(customers.length, AD_PER_PAGE);
  if (adminCustPage >= pages) adminCustPage = pages - 1;
  const slice = customers.slice(adminCustPage * AD_PER_PAGE, adminCustPage * AD_PER_PAGE + AD_PER_PAGE);
  $("#ad-user-list").innerHTML = slice.map((u) => {
    const isBanned = (u.id && banned.includes(u.id)) || banned.includes(u.name);
    const staff = u.id === ADMIN_ID || ADMIN_NAMES.includes(u.name.toLowerCase());
    return `
      <div class="ad-user">
        <div><b>${u.name}${staff ? ' <em class="cur staff">staff</em>' : ""}</b><span>${u.orders} order${u.orders === 1 ? "" : "s"} · ${fmtMoney(u.spent)} spent · ${u.source}</span></div>
        ${staff ? '<span class="tick-status resolved">staff</span>'
          : isBanned ? `<button class="dc-link" data-unban="${u.id || u.name}">unban</button>`
          : `<button class="dc-link danger" data-ban="${u.id || u.name}">ban</button>`}
      </div>
    `;
  }).join("") + adPagerHtml(adminCustPage, pages, "ad-cp", "ad-cn", "ad-c-ind");

  $("#ad-cp").addEventListener("click", () => { adminCustPage = (adminCustPage - 1 + pages) % pages; renderAdminCustomers(); });
  $("#ad-cn").addEventListener("click", () => { adminCustPage = (adminCustPage + 1) % pages; renderAdminCustomers(); });

  $$("#ad-user-list [data-ban]").forEach((b) => b.addEventListener("click", () => {
    const list = STORE.get("linear_banned", []);
    list.push(b.dataset.ban);
    STORE.set("linear_banned", list);
    toast("Customer banned");
    renderAdminCustomers();
  }));
  $$("#ad-user-list [data-unban]").forEach((b) => b.addEventListener("click", () => {
    STORE.set("linear_banned", STORE.get("linear_banned", []).filter((x) => x !== b.dataset.unban));
    toast("Customer unbanned");
    renderAdminCustomers();
  }));
}

const adDDState = {};

function adDD(containerId, options, selected, onPick) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.classList.add("ad-dd");
  const current = adDDState[containerId] !== undefined ? adDDState[containerId] : selected;
  adDDState[containerId] = current;
  const label = options.find((o) => o.v === current);
  box.innerHTML = `
    <button type="button" class="ad-dd-btn">
      <span>${label ? label.t : current}</span>
      <svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="ad-dd-menu">
      ${options.map((o) => `<button type="button" class="ad-dd-opt${o.v === current ? " sel" : ""}" data-v="${o.v}">${o.t}</button>`).join("")}
    </div>`;
  const btn = box.querySelector(".ad-dd-btn");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const menu = box.querySelector(".ad-dd-menu");
    const wasOpen = menu.classList.contains("open");
    closeAllDD();
    if (wasOpen) return;
    menu.dataset.home = containerId;
    const r = btn.getBoundingClientRect();
    menu.style.position = "fixed";
    menu.style.left = r.left + "px";
    menu.style.width = r.width + "px";
    const probe = menu.cloneNode(true);
    probe.style.visibility = "hidden";
    probe.style.display = "flex";
    document.body.appendChild(probe);
    const mh = Math.min(240, probe.scrollHeight);
    probe.remove();
    menu.style.top = (r.bottom + 6 + mh > window.innerHeight - 12)
      ? Math.max(12, r.top - mh - 6) + "px"
      : (r.bottom + 6) + "px";
    document.body.appendChild(menu);
    menu.classList.add("open");
    btn.classList.add("open");
  });
  box.querySelectorAll(".ad-dd-opt").forEach((o) =>
    o.addEventListener("click", () => {
      adDDState[containerId] = o.dataset.v;
      $$(".ad-dd-menu.open").forEach((m) => m.classList.remove("open"));
      $$(".ad-dd-btn.open").forEach((b) => b.classList.remove("open"));
      adDD(containerId, options, o.dataset.v, onPick);
      if (onPick) onPick(o.dataset.v);
    })
  );
}

function closeAllDD() {
  $$(".ad-dd-menu").forEach((m) => {
    m.classList.remove("open");
    m.style.position = "";
    m.style.left = "";
    m.style.top = "";
    m.style.width = "";
    if (m.dataset.home) {
      const home = document.getElementById(m.dataset.home);
      if (home && m.parentElement !== home) home.appendChild(m);
    }
  });
  $$(".ad-dd-btn.open").forEach((b) => b.classList.remove("open"));
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".ad-dd")) closeAllDD();
});
window.addEventListener("scroll", (e) => {
  if (e.target && e.target.closest && e.target.closest(".ad-dd-menu")) return;
  closeAllDD();
}, true);
window.addEventListener("resize", closeAllDD);

function renderAdminKeys() {
  const ctrl = keyCtrl();
  const frozenCount = Object.values(ctrl).filter((v) => v === "frozen").length;
  $("#ad-frozen-count").textContent = frozenCount + " frozen";

  adDD("ad-gen-product",
    PRODUCTS.map((p) => ({ v: p.id, t: p.name })),
    adDDState["ad-gen-product"] || PRODUCTS[0].id
  );
  adDD("ad-gen-period",
    [
      { v: "lifetime", t: "Lifetime" },
      { v: "day", t: "Day key" },
      { v: "week", t: "Week key" },
      { v: "month", t: "Month key" },
      { v: "year", t: "Year key" }
    ],
    adDDState["ad-gen-period"] || "lifetime"
  );

  $("#ad-gen-btn").onclick = () => {
    const out = $("#ad-gen-out");
    const k = genKey(keyPrefix(adDDState["ad-gen-product"]));
    out.textContent = k;
    out.hidden = false;
    $("#ad-gen-copy").hidden = false;
    toast("Key generated");
  };
  $("#ad-gen-copy").onclick = () => {
    navigator.clipboard && navigator.clipboard.writeText($("#ad-gen-out").textContent).catch(() => {});
    toast("Key copied");
  };

  $("#ad-kc-freeze").onclick = () => {
    const k = $("#ad-kc-key").value.trim();
    if (!k) { toast("Paste a key first", "error"); return; }
    const c = keyCtrl();
    c[k] = "frozen";
    STORE.set("linear_keyctrl", c);
    addActivity("key", `Key frozen: ${k}`);
    addAdminNotification("freeze", k);
    toast("Key frozen");
    const frozenCount = Object.values(c).filter((v) => v === "frozen").length;
    $("#ad-frozen-count").textContent = frozenCount + " frozen";
    updateKcStatus();
    try { renderDashboard(); } catch(e) {}
  };
  $("#ad-kc-unfreeze").onclick = () => {
    const k = $("#ad-kc-key").value.trim();
    if (!k) { toast("Paste a key first", "error"); return; }
    const c = keyCtrl();
    delete c[k];
    STORE.set("linear_keyctrl", c);
    addActivity("key", `Key unfrozen: ${k}`);
    addAdminNotification("unfreeze", k);
    toast("Key unfrozen");
    const frozenCount = Object.values(c).filter((v) => v === "frozen").length;
    $("#ad-frozen-count").textContent = frozenCount + " frozen";
    updateKcStatus();
    try { renderDashboard(); } catch(e) {}
  };
  $("#ad-kc-remove").onclick = () => {
    const k = $("#ad-kc-key").value.trim();
    if (!k) { toast("Paste a key first", "error"); return; }
    const c = keyCtrl();
    c[k] = "removed";
    STORE.set("linear_keyctrl", c);
    addActivity("key", `Key permanently removed: ${k}`);
    addAdminNotification("delete", k);
    toast("Key permanently removed");
    const frozenCount = Object.values(c).filter((v) => v === "frozen").length;
    $("#ad-frozen-count").textContent = frozenCount + " frozen";
    updateKcStatus();
    try { renderDashboard(); } catch(e) {}
  };

  function updateKcStatus() {
    const k = $("#ad-kc-key").value.trim();
    const ctrl2 = keyCtrl();
    const statusBox = $("#ad-kc-status");
    if (!statusBox) return;
    if (k && ctrl2[k] === "removed") {
      statusBox.innerHTML = `<span class="tick-status open">removed</span>`;
    } else if (k && ctrl2[k] === "frozen") {
      statusBox.innerHTML = `<span class="tick-status open">frozen</span>`;
    } else if (k) {
      statusBox.innerHTML = `<span class="tick-status resolved">active</span>`;
    } else {
      statusBox.innerHTML = "";
    }
  }
  $("#ad-kc-key").oninput = updateKcStatus;
  updateKcStatus();
}

function renderAdminDetection() {
  const det = STORE.get("linear_det", {});
  $("#ad-det-list").innerHTML = CHEAT_STATUS.map((c) => `
    <div class="ad-det-row">
      <div><b>${c.name}</b><span>${c.game}</span></div>
      <div class="ad-dd ad-det-dd" id="det-${c.name.replace(/[^A-Z0-9]/gi, "")}"></div>
    </div>
  `).join("");
  CHEAT_STATUS.forEach((c) => {
    const id = "det-" + c.name.replace(/[^A-Z0-9]/gi, "");
    adDD(id,
      [
        { v: "up", t: "Undetected" },
        { v: "testing", t: "Testing" },
        { v: "down", t: "Detected" }
      ],
      det[c.name] || "up",
      (v) => {
        const d = STORE.get("linear_det", {});
        d[c.name] = v;
        STORE.set("linear_det", d);
        renderCheatStatus();
        toast(c.name + " → " + (v === "up" ? "Undetected" : v === "testing" ? "Testing" : "Detected"));
      }
    );
  });
}

let adminActiveTicketId = null;
let adminTicketFilter = "opened";

function renderAdminTickets() {
  const tickets = STORE.get("linear_tickets", []);
  const allTickets = tickets.length ? tickets : DASH_TICKETS_DEFAULTS;

  const opened = allTickets.filter((t) => t.status !== "closed");
  const closed = allTickets.filter((t) => t.status === "closed");
  const filtered = adminTicketFilter === "opened" ? opened : closed;

  const totalCount = allTickets.length;
  $("#ad-ticket-count").textContent = totalCount + " total";

  $$(".ad-tst").forEach((b) => b.classList.toggle("on", b.dataset.st === adminTicketFilter));
  $$(".ad-tst").forEach((b) => {
    b.onclick = () => {
      adminTicketFilter = b.dataset.st;
      adminActiveTicketId = null;
      renderAdminTickets();
    };
  });

  if (adminActiveTicketId) {
    const card = $("#ad-ticket-chat-card");
    const listWrap = card?.previousElementSibling;
    if (card) card.hidden = false;
    if (listWrap) listWrap.style.display = "none";
    renderAdminTicketChat(adminActiveTicketId);
    return;
  }

  const card = $("#ad-ticket-chat-card");
  const listWrap = card?.previousElementSibling;
  if (card) card.hidden = true;
  if (listWrap) listWrap.style.display = "";

  const list = $("#ad-ticket-list");
  if (!filtered.length) {
    const msg = adminTicketFilter === "opened"
      ? "No open tickets. All caught up!"
      : "No closed tickets yet.";
    list.innerHTML = `<p style="color:var(--muted);padding:24px 0;text-align:center">${msg}</p>`;
    return;
  }
  list.innerHTML = filtered.map((t) => {
    const statusCls = t.status === "closed" ? "resolved" : "open";
    return `
    <div class="ticket-full-list-item" data-tid="${t.id}">
      <div class="ticket-full-left">
        <b>${t.title}</b>
        <span>${t.id} · ${t.when || "opened"}</span>
      </div>
      <div class="ticket-full-right">
        <span class="ticket-full-product">${t.product || ""}</span>
        <span class="tick-status ${statusCls}">${t.status || "open"}</span>
      </div>
    </div>`;
  }).join("");

  $$("#ad-ticket-list .ticket-full-list-item").forEach((el) => {
    el.onclick = () => {
      adminActiveTicketId = el.dataset.tid;
      renderAdminTickets();
    };
  });

  $("#ad-ticket-chat-back").onclick = () => {
    if (ticketChatPoll) { clearInterval(ticketChatPoll); ticketChatPoll = null; }
    adminActiveTicketId = null;
    renderAdminTickets();
  };

  $("#ad-ticket-close").onclick = () => {
    if (!adminActiveTicketId) return;
    const tickets = STORE.get("linear_tickets", []);
    const t = tickets.find((x) => x.id === adminActiveTicketId) || DASH_TICKETS_DEFAULTS.find((x) => x.id === adminActiveTicketId);
    if (!t) return;
    t.status = "closed";
    t.closedBy = "support";
    t.closedAt = Date.now();
    const sysMsg = {
      from: "system",
      text: "This ticket has been closed by the support team. If you need further assistance, please open a new ticket.",
      ts: Date.now(),
      isSystem: true
    };
    if (!t.messages) t.messages = [];
    t.messages.push(sysMsg);
    STORE.set("linear_tickets", tickets);
    addActivity("ticket", `Ticket ${t.id} closed by support`);
    addAdminNotification("ticket_close", t.id);
    toast("Ticket " + t.id + " closed");
    adminActiveTicketId = null;
    adminTicketFilter = "closed";
    renderAdminTickets();
  };
}

function renderAdminTicketChat(id) {
  const tickets = STORE.get("linear_tickets", []);
  const ticket = tickets.find((t) => t.id === id) || DASH_TICKETS_DEFAULTS.find((t) => t.id === id);
  if (!ticket) return;

  const isClosed = ticket.status === "closed";
  $("#ad-ticket-chat-title").textContent = ticket.id + " — " + ticket.title;
  const body = $("#ad-ticket-chat-body");
  const msgs = ticket.messages || [];

  let html = "";
  const summaryMsg = msgs.find((m) => m.isSummary);
  if (summaryMsg) {
    const lines = summaryMsg.text.split("\n");
    html += `<div class="tc-problem-summary" style="margin:0 0 8px">
      <span class="tc-problem-label">Issue Details</span>
      <div class="tc-problem-row">
        <span class="tc-problem-tag">${ticket.type || "Support"}</span>
        <span class="tc-problem-tag">${ticket.product || ""}</span>
      </div>
      ${lines.length > 2 ? `<span class="tc-problem-desc">${lines.slice(2).join("<br>")}</span>` : ""}
    </div>`;
  }

  const nonSummary = msgs.filter((m) => !m.isSummary);
  html += `<div class="tc-msg-list">`;
  nonSummary.forEach((m) => {
    const when = timeAgo(Date.now() - m.ts);
    if (m.isSystem || m.from === "system") {
      html += `
        <div class="tc-system-msg">
          <div class="tc-system-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div class="tc-system-content">
            <div class="tc-system-title">Ticket Closed</div>
            <div class="tc-system-desc">${m.text}</div>
            <div class="tc-system-time">${when}</div>
          </div>
        </div>`;
      return;
    }
    const isStaff = m.from === "staff";
    const senderName = isStaff ? "Support Team" : (ticket.userName || DASH_USER.name || "User");
    const avatar = isStaff
      ? `<div class="ticket-msg-avatar staff">S</div>`
      : `<div class="ticket-msg-avatar user">${senderName.charAt(0).toUpperCase()}</div>`;
    html += `
      <div class="ticket-msg${isStaff ? " staff" : ""}">
        ${avatar}
        <div class="ticket-msg-content">
          <div class="ticket-msg-head">
            <span class="ticket-msg-name ${isStaff ? "staff-name" : "user-name"}">${senderName}</span>
            <span class="ticket-msg-ts">${when}</span>
          </div>
          <div class="ticket-msg-bubble">${m.text}</div>
        </div>
      </div>`;
  });
  html += `</div>`;

  body.innerHTML = html;
  body.scrollTop = body.scrollHeight;

  const input = $("#ad-ticket-reply-input");
  const sendBtn = $("#ad-ticket-reply-send");

  if (isClosed) {
    input.value = "";
    input.disabled = true;
    input.placeholder = "This ticket is closed";
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.4";
  } else {
    input.disabled = false;
    input.placeholder = "Reply as support...";
    sendBtn.disabled = false;
    sendBtn.style.opacity = "1";
  }

  if (!isClosed) {
    sendBtn.onclick = () => {
      const text = input.value.trim();
      if (!text) return;
      ticket.messages.push({ from: "staff", text, ts: Date.now() });
      STORE.set("linear_tickets", tickets);
      input.value = "";
      addActivity("ticket", `Staff replied to ticket ${ticket.id}`);
      renderAdminTicketChat(id);
    };

    input.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendBtn.onclick(); }
    };
  }

  const closeBtn = $("#ad-ticket-close");
  if (isClosed) {
    closeBtn.textContent = "Ticket closed";
    closeBtn.disabled = true;
    closeBtn.style.opacity = "0.4";
  } else {
    closeBtn.textContent = "Close ticket";
    closeBtn.disabled = false;
    closeBtn.style.opacity = "1";
  }

  if (ticketChatPoll) clearInterval(ticketChatPoll);
  let lastMsgCount = (ticket.messages || []).length;
  let lastStatus = ticket.status;
  ticketChatPoll = setInterval(() => {
    const fresh = STORE.get("linear_tickets", []);
    const freshTicket = fresh.find((t) => t.id === id);
    if (!freshTicket) return;
    const newCount = (freshTicket.messages || []).length;
    const newStatus = freshTicket.status;
    if (newCount !== lastMsgCount || newStatus !== lastStatus) {
      lastMsgCount = newCount;
      lastStatus = newStatus;
      if (adminActiveTicketId === id) renderAdminTicketChat(id);
    }
  }, 3000);
}

function renderAdminNotifications() {
  const notes = STORE.get("linear_admin_notes", []);
  const count = notes.length;
  $("#ad-notif-count").textContent = count + " total";
  if (!count) {
    $("#ad-notif-list").innerHTML = `<p style="color:var(--muted);padding:24px 0;text-align:center">No admin actions recorded yet. Freeze or remove a key to see history here.</p>`;
    return;
  }
  const pages = adPager(count, AD_PER_PAGE);
  if (adminNotifPage >= pages) adminNotifPage = pages - 1;
  const slice = notes.slice(adminNotifPage * AD_PER_PAGE, adminNotifPage * AD_PER_PAGE + AD_PER_PAGE);
  $("#ad-notif-list").innerHTML = slice.map((n) => {
    const d = new Date(n.ts);
    const when = d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const label = n.action === "freeze" ? "Key frozen"
      : n.action === "unfreeze" ? "Key unfrozen"
      : n.action === "delete" ? "Key removed"
      : n.action === "ticket_close" ? "Ticket closed"
      : n.action;
    const cls = n.action === "freeze" ? "warn" : n.action === "delete" || n.action === "ticket_close" ? "danger" : "resolved";
    return `
      <div class="ad-notif-row">
        <div class="ad-notif-main">
          <span class="tick-status ${cls}">${label}</span>
          <code class="ad-notif-key">${n.key}</code>
        </div>
        <span class="ad-notif-time">${when}</span>
      </div>
    `;
  }).join("") + adPagerHtml(adminNotifPage, pages, "ad-np", "ad-nn", "ad-n-ind");

  $("#ad-np").addEventListener("click", () => { adminNotifPage = (adminNotifPage - 1 + pages) % pages; renderAdminNotifications(); });
  $("#ad-nn").addEventListener("click", () => { adminNotifPage = (adminNotifPage + 1) % pages; renderAdminNotifications(); });
}

/* ============================================================
   Dashboard licenses (from orders)
   ============================================================ */

function userLicenses() {
  if (!DASH_USER.logged) return [];
  const orders = STORE.get("linear_orders", []);
  const out = [];
  orders.forEach((o) => {
    if (o.userId !== DASH_USER.id) return;
    o.items.forEach((it) => out.push(it));
  });
  return out;
}

function licProgress(item) {
  const days = periodDays(item.period);
  if (!days) return { pct: 100, label: "never" };
  const elapsed = (Date.now() - item.boughtAt) / 86400000;
  const left = Math.max(0, Math.ceil(days - elapsed));
  return { pct: Math.max(2, Math.round((left / days) * 100)), label: left + (left === 1 ? " day left" : " days left") };
}

/* ============================================================
   Dashboard
   ============================================================ */

const DASH_USER = { name: "user", avatar: null, id: null, plan: "CUSTOMER", since: "", logged: false };

const DISCORD_AUTH = {
  clientId: "1541543623215030473",
  redirectUri: "https://linearauth.linear-04e.workers.dev/auth",
  scopes: ["identify", "email"]
};

function discordLoginUrl() {
  const p = new URLSearchParams({
    client_id: DISCORD_AUTH.clientId,
    redirect_uri: DISCORD_AUTH.redirectUri,
    response_type: "code",
    scope: DISCORD_AUTH.scopes.join(" "),
    prompt: "consent"
  });
  return `https://discord.com/oauth2/authorize?${p.toString()}`;
}

function detectEnv() {
  const ua = navigator.userAgent;
  let os = "Unknown OS";
  if (/Windows NT 10/.test(ua)) os = "Windows 10 / 11";
  else if (/Windows NT 6.3/.test(ua)) os = "Windows 8.1";
  else if (/Windows NT 6.1/.test(ua)) os = "Windows 7";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";
  let browser = "Browser";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";
  let where = "Local device";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const city = tz.split("/").pop().replace(/_/g, " ");
    const region = ((navigator.language || "").split("-")[1] || "").toUpperCase();
    const FLAGS = { US: "🇺🇸", DE: "🇩🇪", GB: "🇬🇧", FR: "🇫🇷", NL: "🇳🇱", CA: "🇨🇦", AU: "🇦🇺", SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰", FI: "🇫🇮", PL: "🇵🇱", RO: "🇷🇴", ES: "🇪🇸", IT: "🇮🇹", PT: "🇵🇹", BR: "🇧🇷", JP: "🇯🇵", KR: "🇰🇷", UA: "🇺🇦", CZ: "🇨🇿", AT: "🇦🇹", CH: "🇨🇭", BE: "🇧🇪" };
    if (region && FLAGS[region]) where = `${FLAGS[region]} ${region}`;
    else if (city) where = city;
  } catch (e) {}
  return { os, browser, where };
}

const DASH_LICENSES = [
  { product: "LINEAR.CS2", plan: "Lifetime", status: "active", key: "LINE-CS2-K92M-4XQ7-3F7A", pct: 100, expires: "never", img: "external/productsPIC/games/CounterStrike2_valorant_style_minimal.png" },
  { product: "PHOBIA CLIENT EXTERNAL", plan: "30-day key", status: "active", key: "PHB-R6X-Q81D-M2ZK-9T4L", pct: 65, expires: "10 days left", img: "external/productsPIC/games/RainbowSix_edit_v2.png" },
  { product: "LINEAR.HWID", plan: "365-day key", status: "active", key: "HWD-SPF-P3RN-7YV2-KK05", pct: 34, expires: "241 days left", img: "external/productsPIC/spoofer/fullSpooferNEW.png" }
];

const DASH_ACTIVITY_DEFAULTS = [
  { ico: "login", text: "New login from Windows 11 · Frankfurt", when: "1d ago" }
];

const DASH_SESSIONS = [
  { device: "Windows 11 · Chrome", where: "Frankfurt, DE", current: true },
  { device: "Windows 10 · Edge", where: "Frankfurt, DE", current: false }
];

const DASH_TICKETS_DEFAULTS = [
  { id: "#0412", title: "Loader signature question", status: "resolved", when: "closed 5d ago",
    product: "Phobia", type: "Loader issue", summary: "Product: Phobia\nIssue: Loader signature question",
    messages: [
      { from: "user", text: "Hey, the loader keeps saying signature mismatch when I try to inject.", ts: Date.now() - 432000000, isSummary: true },
      { from: "staff", text: "Hi! This usually happens when the loader hasn't pulled the latest update. Can you try fully closing the loader, re-opening it, and letting it update?", ts: Date.now() - 430000000 },
      { from: "user", text: "That worked, thanks!", ts: Date.now() - 428000000 },
      { from: "staff", text: "Great to hear! Marking this as resolved. Let us know if anything else comes up.", ts: Date.now() - 426000000 }
    ]
  }
];

let dashTab = "overview";
let activeTicketId = null;
let userTicketFilter = "opened";
let ticketChatPoll = null;
let twState = { step: 1, product: null, issue: null, customDesc: "", files: [], freezeKey: "" };

const TW_ISSUE_LABELS = {
  aimbot: "Aimbot not working",
  esp: "ESP not showing",
  loader: "Loader crash / won't start",
  key: "Key not accepted",
  detected: "Game detected / ban",
  update: "Update issue",
  other: "Other"
};

function openTicketModal() {
  const overlay = $("#ticket-modal-overlay");
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add("show"));

  twState = { step: 1, product: null, issue: null, customDesc: "", files: [], freezeKey: "" };

  const grid = $("#tw-product-grid");
  const icons = { "LINEAR.CS2": "🎯", "LINEAR.VAL": "🛡", "LINEAR.RUST": "⚙️", "LINEAR.EFT": "🏚", "LINEAR.R6": "🔒", "LINEAR.APEX": "⚔️", "PHOBIA CLIENT EXTERNAL": "👁", "PHOBIA EXTERNAL": "👻", "LINEAR.INTERNAL": "💉", "LINEAR.HWID": "🔧", "LINEAR.SPOOFER+": "🛡" };
  grid.innerHTML = PRODUCTS.map((p) => `
    <button class="tw-product-btn" data-prod="${p.name}">
      <span class="tw-prod-ico">${icons[p.name] || "📦"}</span>
      <span class="tw-prod-name">${p.name}</span>
      <span class="tw-prod-price">${p.game}</span>
    </button>
  `).join("");
  $$(".tw-product-btn", grid).forEach((btn) => {
    btn.onclick = () => {
      $$(".tw-product-btn", grid).forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      twState.product = btn.dataset.prod;
      updateTwNav();
    };
  });

  $$(".tw-issue").forEach((btn) => {
    btn.onclick = () => {
      $$(".tw-issue").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      twState.issue = btn.dataset.issue;
      const cd = $("#tw-custom-desc");
      if (twState.issue === "other") { cd.hidden = false; } else { cd.hidden = true; cd.querySelector("textarea").value = ""; twState.customDesc = ""; }
      updateTwNav();
    };
  });

  $("#tw-desc-text").value = "";
  $("#tw-file-list").innerHTML = "";
  $("#tw-file-input").value = "";
  twState.files = [];

  const uploadArea = $("#tw-upload-area");
  const fileInput = $("#tw-file-input");
  uploadArea.onclick = () => fileInput.click();
  uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.style.borderColor = "rgba(56,189,248,0.5)"; };
  uploadArea.ondragleave = () => { uploadArea.style.borderColor = ""; };
  uploadArea.ondrop = (e) => { e.preventDefault(); uploadArea.style.borderColor = ""; handleTwFiles(e.dataTransfer.files); };
  fileInput.onchange = () => handleTwFiles(fileInput.files);

  $("#tw-freeze-check").checked = false;
  $("#tw-freeze-fields").hidden = true;
  $("#tw-freeze-key").value = "";
  $("#tw-freeze-check").onchange = () => { $("#tw-freeze-fields").hidden = !$("#tw-freeze-check").checked; };

  showTwStep(1);
  updateTwNav();
}

function handleTwFiles(files) {
  const list = $("#tw-file-list");
  for (const f of files) {
    if (twState.files.length >= 6) break;
    twState.files.push(f.name);
    const chip = document.createElement("span");
    chip.className = "tw-file-chip";
    chip.innerHTML = `${f.name} <span class="tw-file-remove" data-name="${f.name}">×</span>`;
    chip.querySelector(".tw-file-remove").onclick = () => {
      twState.files = twState.files.filter((n) => n !== f.name);
      chip.remove();
    };
    list.appendChild(chip);
  }
}

function showTwStep(s) {
  twState.step = s;
  [1,2,3].forEach((n) => {
    const panel = $(`#tw-step${n}`);
    if (panel) panel.hidden = n !== s;
  });
  $$(".tw-step").forEach((el) => {
    const sn = +el.dataset.s;
    el.classList.toggle("on", sn === s);
    el.classList.toggle("done", sn < s);
  });
}

function updateTwNav() {
  const back = $("#tw-back");
  const next = $("#tw-next");
  back.style.visibility = twState.step === 1 ? "hidden" : "visible";

  if (twState.step === 1) {
    next.textContent = "Continue";
    next.disabled = !twState.product;
  } else if (twState.step === 2) {
    next.textContent = "Continue";
    next.disabled = !twState.issue;
  } else {
    next.textContent = "Submit ticket";
    next.disabled = false;
  }
  next.style.opacity = next.disabled ? "0.4" : "1";
  next.style.pointerEvents = next.disabled ? "none" : "auto";
}

function closeTicketModal() {
  const overlay = $("#ticket-modal-overlay");
  overlay.classList.remove("show");
  setTimeout(() => { overlay.hidden = true; }, 300);
}

function submitTicket() {
  if (twState.step < 3) {
    if (twState.step === 1 && !twState.product) { toast("Select a product", "error"); return; }
    if (twState.step === 2 && !twState.issue) { toast("Select or describe a problem", "error"); return; }
    showTwStep(twState.step + 1);
    updateTwNav();
    return;
  }

  let desc = "";
  if (twState.issue === "other") {
    desc = ($("#tw-desc-text") || {}).value || "";
    desc = desc.trim();
    if (!desc) { toast("Please describe your problem", "error"); return; }
  }

  const freezeKey = $("#tw-freeze-check").checked ? $("#tw-freeze-key").value.trim() : "";
  if ($("#tw-freeze-check").checked && !freezeKey) {
    toast("Enter a key to freeze or uncheck the box", "error");
    return;
  }

  const issueLabel = TW_ISSUE_LABELS[twState.issue] || twState.issue;
  const tickets = STORE.get("linear_tickets", []);
  const id = "#T" + String(1000 + tickets.length).padStart(4, "0");
  const now = Date.now();

  const summaryParts = [`Product: ${twState.product}`, `Issue: ${issueLabel}`];
  if (desc) summaryParts.push(`Description: ${desc}`);
  if (twState.files.length) summaryParts.push(`Files: ${twState.files.join(", ")}`);
  if (freezeKey) summaryParts.push(`Key to freeze: ${freezeKey}`);
  const summaryText = summaryParts.join("\n");

  const staffMsg = "Thanks for reaching out! Our team will review your ticket shortly. We typically respond within a few hours. Please hold tight while we look into your issue.";

  const newTicket = {
    id,
    title: `${issueLabel} — ${twState.product}`,
    product: twState.product,
    type: issueLabel,
    status: "open",
    when: "opened just now",
    freezeKey: freezeKey || null,
    summary: summaryText,
    files: twState.files.length ? [...twState.files] : null,
    messages: [
      { from: "user", text: summaryText, ts: now, isSummary: true },
      { from: "staff", text: staffMsg, ts: now + 1000 }
    ]
  };

  if (freezeKey) {
    const c = keyCtrl();
    if (!c[freezeKey] || c[freezeKey] === "active") {
      c[freezeKey] = "frozen";
      STORE.set("linear_keyctrl", c);
      addActivity("key", `Key frozen for support: ${freezeKey}`);
      addAdminNotification("freeze", freezeKey, `Auto-frozen via ticket ${id}`);
    }
  }

  tickets.unshift(newTicket);
  STORE.set("linear_tickets", tickets);
  addActivity("ticket", `Support ticket ${id} opened — ${issueLabel}`);
  toast("Ticket " + id + " created");
  closeTicketModal();
  renderDashTicketList();
}

function openTicketChat(id) {
  const tickets = STORE.get("linear_tickets", []);
  const ticket = tickets.find((t) => t.id === id) || DASH_TICKETS_DEFAULTS.find((t) => t.id === id);
  if (!ticket) return;
  activeTicketId = id;

  $("#ticket-chat-title").textContent = ticket.id + " — " + ticket.title;
  const body = $("#ticket-chat-body");

  const userName = DASH_USER.name || "user";
  const userAvatarChar = userName.charAt(0).toUpperCase();
  const userAvatarHtml = DASH_USER.avatar
    ? `<img src="${DASH_USER.avatar}" alt="avatar">`
    : userAvatarChar;

  const verifiedSvg = `<svg class="tc-prof-verified" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`;

  const profilesEl = $("#tc-profiles");
  if (profilesEl) {
    profilesEl.innerHTML = `
      <div class="tc-profile-row">
        <div class="tc-prof-avatar staff-av">S</div>
        <div class="tc-prof-info">
          <div class="tc-prof-name">Support Team ${verifiedSvg}</div>
          <div class="tc-prof-role">Staff</div>
        </div>
      </div>
      <div class="tc-profile-row">
        <div class="tc-prof-avatar user-av">${userAvatarHtml}</div>
        <div class="tc-prof-info">
          <div class="tc-prof-name">${userName}</div>
          <div class="tc-prof-role">You</div>
        </div>
      </div>
    `;
  }

  let html = "";

  const msgs = ticket.messages || [];
  const isClosed = ticket.status === "closed";
  const nonSummaryMsgs = msgs.filter((m) => !m.isSummary);
  const summaryMsg = msgs.find((m) => m.isSummary);

  if (summaryMsg) {
    const lines = summaryMsg.text.split("\n");
    html += `<div class="tc-problem-summary">
      <span class="tc-problem-label">Issue Details</span>
      <div class="tc-problem-row">
        <span class="tc-problem-tag">${ticket.type || "Support"}</span>
        <span class="tc-problem-tag">${ticket.product || ""}</span>
        ${ticket.files ? `<span class="tc-problem-files"><svg viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${ticket.files.length} file(s)</span>` : ""}
      </div>
      ${lines.length > 2 ? `<span class="tc-problem-desc">${lines.slice(2).join("<br>")}</span>` : ""}
    </div>`;
  }

  html += `<div class="tc-msg-list">`;
  nonSummaryMsgs.forEach((m) => {
    const when = timeAgo(Date.now() - m.ts);
    if (m.isSystem || m.from === "system") {
      html += `
        <div class="tc-system-msg">
          <div class="tc-system-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div class="tc-system-content">
            <div class="tc-system-title">Ticket Closed</div>
            <div class="tc-system-desc">${m.text}</div>
            <div class="tc-system-time">${when}</div>
          </div>
        </div>`;
      return;
    }
    const isStaff = m.from === "staff";
    const senderName = isStaff ? "Support Team" : userName;
    const avatar = isStaff
      ? `<div class="ticket-msg-avatar staff">S</div>`
      : `<div class="ticket-msg-avatar user">${userAvatarHtml}</div>`;
    html += `
      <div class="ticket-msg${isStaff ? " staff" : ""}">
        ${avatar}
        <div class="ticket-msg-content">
          <div class="ticket-msg-head">
            <span class="ticket-msg-name ${isStaff ? "staff-name" : "user-name"}">${senderName}</span>
            <span class="ticket-msg-ts">${when}</span>
          </div>
          <div class="ticket-msg-bubble">${m.text}</div>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  body.innerHTML = html;
  body.scrollTop = body.scrollHeight;

  const replyInput = $("#ticket-reply-input");
  const replySend = $("#ticket-reply-send");

  if (isClosed) {
    replyInput.value = "";
    replyInput.disabled = true;
    replyInput.placeholder = "This ticket is closed";
    replySend.disabled = true;
    replySend.style.opacity = "0.4";
  } else {
    replyInput.disabled = false;
    replyInput.placeholder = "Type a reply...";
    replySend.disabled = false;
    replySend.style.opacity = "1";

    replySend.onclick = () => {
      const text = replyInput.value.trim();
      if (!text) return;
      ticket.messages.push({ from: "user", text, ts: Date.now() });
      STORE.set("linear_tickets", tickets);
      replyInput.value = "";
      openTicketChat(id);

      setTimeout(() => {
        const replies = [
          "Thanks for the additional info, looking into this now.",
          "We've escalated this to our senior team. Hang tight.",
          "Can you provide a screenshot of the error?",
          "This should be fixed in the next loader update. We'll notify you.",
          "We've confirmed the issue and are working on a fix. ETA: a few hours.",
          "All good on our end — can you try restarting and testing again?"
        ];
        ticket.messages.push({
          from: "staff",
          text: replies[Math.floor(Math.random() * replies.length)],
          ts: Date.now()
        });
        STORE.set("linear_tickets", tickets);
        openTicketChat(id);
      }, 1500 + Math.random() * 2000);
    };
  }

  const userCloseBtn = $("#user-ticket-close");
  if (userCloseBtn) {
    if (isClosed) {
      userCloseBtn.textContent = "Ticket closed";
      userCloseBtn.disabled = true;
      userCloseBtn.style.opacity = "0.4";
    } else {
      userCloseBtn.textContent = "Close ticket";
      userCloseBtn.disabled = false;
      userCloseBtn.style.opacity = "1";
      userCloseBtn.onclick = () => {
        ticket.status = "closed";
        ticket.closedBy = "user";
        ticket.closedAt = Date.now();
        const sysMsg = {
          from: "system",
          text: "This ticket has been closed by the user. If you need further assistance, please open a new ticket.",
          ts: Date.now(),
          isSystem: true
        };
        if (!ticket.messages) ticket.messages = [];
        ticket.messages.push(sysMsg);
        STORE.set("linear_tickets", tickets);
        addActivity("ticket", `Ticket ${ticket.id} closed by user`);
        addAdminNotification("ticket_close", ticket.id);
        toast("Ticket closed");
        openTicketChat(id);
      };
    }
  }

  replyInput.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); replySend.onclick?.(); }
  };

  if (ticketChatPoll) clearInterval(ticketChatPoll);
  let lastMsgCount = (ticket.messages || []).length;
  let lastStatus = ticket.status;
  ticketChatPoll = setInterval(() => {
    const fresh = STORE.get("linear_tickets", []);
    const freshTicket = fresh.find((t) => t.id === id);
    if (!freshTicket) return;
    const newCount = (freshTicket.messages || []).length;
    const newStatus = freshTicket.status;
    if (newCount !== lastMsgCount || newStatus !== lastStatus) {
      lastMsgCount = newCount;
      lastStatus = newStatus;
      openTicketChat(id);
    }
  }, 3000);
}

function renderDashTicketList() {
  if (!DASH_USER.logged) {
    const overviewList = $("#ticket-list");
    const fullList = $("#ticket-full-list");
    if (overviewList) overviewList.innerHTML = `<p style="color:var(--muted);padding:24px 0;text-align:center">Login with Discord to view support tickets.</p>`;
    if (fullList) fullList.innerHTML = `<p style="color:var(--muted);padding:24px 0;text-align:center">Login with Discord to view support tickets.</p>`;
    return;
  }
  const ticketItems = STORE.get("linear_tickets", []);
  const ticketSource = ticketItems.length ? ticketItems : DASH_TICKETS_DEFAULTS;
  const userOpened = ticketSource.filter((t) => t.status !== "closed");
  const userClosed = ticketSource.filter((t) => t.status === "closed");
  const userFiltered = userTicketFilter === "opened" ? userOpened : userClosed;

  $$(".utst").forEach((b) => b.classList.toggle("on", b.dataset.st === userTicketFilter));
  $$(".utst").forEach((b) => {
    b.onclick = () => {
      userTicketFilter = b.dataset.st;
      activeTicketId = null;
      renderDashTicketList();
    };
  });

  const overviewList = $("#ticket-list");
  if (overviewList) {
    overviewList.innerHTML = ticketSource.slice(0, 3).map((t, i) => `
      <div class="tick-row" style="animation-delay:${0.2 + i * 0.08}s">
        <div><b>${t.title}</b><span>${t.id} · ${t.when}</span></div>
        <span class="tick-status ${t.status}">${t.status}</span>
      </div>
    `).join("");
  }

  const fullList = $("#ticket-full-list");
  if (fullList) {
    if (!userFiltered.length) {
      const msg = userTicketFilter === "opened"
        ? "No open tickets. All caught up!"
        : "No closed tickets yet.";
      fullList.innerHTML = `<p style="color:var(--muted);padding:24px 0;text-align:center">${msg}</p>`;
    } else {
      fullList.innerHTML = userFiltered.map((t) => `
        <div class="ticket-full-list-item" data-tid="${t.id}">
          <div class="ticket-full-left">
            <b>${t.title}</b>
            <span>${t.id} · ${t.when} · ${(t.messages || []).length} message${(t.messages || []).length === 1 ? "" : "s"}</span>
          </div>
          <div class="ticket-full-right">
            <span class="ticket-full-product">${t.product || ""}</span>
            <span class="tick-status ${t.status}">${t.status}</span>
          </div>
        </div>
      `).join("");
      $$("#ticket-full-list .ticket-full-list-item").forEach((el) =>
        el.onclick = () => {
          const chatPanel = $("#ticket-chat-panel");
          const listCard = $(".dash-tickets-full");
          if (chatPanel) chatPanel.hidden = false;
          if (listCard) listCard.style.display = "none";
          openTicketChat(el.dataset.tid);
        }
      );
    }
  }
}

let dashObs = null;

function renderDashboard() {
  const wrap = $("#page-dashboard");
  if (!wrap) return;

  $$(".dash-tab").forEach((b) => b.classList.toggle("on", b.dataset.dt === dashTab));
  $$(".dash-tab-page").forEach((p) => p.hidden = p.id !== "dt-" + dashTab);

  $("#dash-username").textContent = DASH_USER.name;
  const planEl = $("#dash-plan");
  if (planEl) planEl.textContent = DASH_USER.plan || "CUSTOMER";
  const sinceEl = $("#dash-since");
  if (sinceEl) sinceEl.textContent = DASH_USER.since ? "member since " + DASH_USER.since : "member since —";
  const av = $(".dash-avatar");
  if (DASH_USER.avatar) {
    av.innerHTML = `<img src="${DASH_USER.avatar}" alt="avatar">`;
  } else {
    av.innerHTML = DASH_USER.name.charAt(0).toUpperCase();
  }
  const loginBtn = $("#dash-login");
  if (loginBtn) {
    if (DASH_USER.logged) {
      loginBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none"><path d="M15 12H3m12 0l-4-4m4 4l-4 4M11 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Log out`;
      loginBtn.onclick = logoutUser;
    } else {
      loginBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.87-.6 1.25a18.3 18.3 0 0 0-5.5 0 12.6 12.6 0 0 0-.61-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.04.03C.53 9.05-.32 13.58.1 18.06c0 .02.01.04.03.05a19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.02c.46-.63.87-1.3 1.22-2 .02-.04 0-.08-.04-.1a13 13 0 0 1-1.87-.9.08.08 0 0 1-.01-.12c.13-.1.25-.19.37-.29a.07.07 0 0 1 .08-.01 14.2 14.2 0 0 0 12.08 0 .07.07 0 0 1 .08.01c.12.1.25.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.64-1.88.89a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.22 2 .02.03.04.04.08.03a19.8 19.8 0 0 0 6.02-3.03.08.08 0 0 0 .03-.05c.5-5.2-.84-9.68-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.96 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z"/>
        </svg>
        Login with Discord`;
      loginBtn.onclick = () => {
        window.open(discordLoginUrl(), "_blank", "width=520,height=760");
        toast("Complete the login in the Discord window");
      };
    }
  }

  const heroActions = $(".dash-hero-actions");
  if (heroActions) {
    let b = $("#dash-admin-btn");
    if (!b) {
      b = document.createElement("button");
      b.className = "btn btn-ghost";
      b.id = "dash-admin-btn";
      b.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.8"/></svg>
        Admin`;
      b.addEventListener("click", () => { renderAdmin(); goTo("admin"); });
      heroActions.prepend(b);
    }
    b.style.display = isAdminUser() ? "" : "none";
  }

  const env = detectEnv();
  $("#sess-list").innerHTML = [
    { device: `${env.os} · ${env.browser}`, where: `${env.where}`, current: true }
  ].map((s) => `
    <div class="sess-row">
      <div><b>${s.device}${s.current ? ' <em class="cur">this device</em>' : ""}</b><span>${s.where}</span></div>
      ${s.current ? "" : `<button class="dc-link danger" data-sess="${i}">Revoke</button>`}
    </div>
  `).join("");

  const owned = userLicenses();
  const ctrl = keyCtrl();
  const licState = (it) => {
    const c = ctrl[it.key];
    if (c === "removed") return "removed";
    if (c === "frozen") return "frozen";
    const days = periodDays(it.period);
    if (days && (Date.now() - it.boughtAt) / 86400000 >= days) return "expired";
    return "active";
  };
  const visible = owned.filter((it) => licState(it) !== "removed");
  const licSource = visible.length
    ? visible.map((it) => {
        const state = licState(it);
        const pr = licProgress(it);
        const frozen = state === "frozen";
        const expired = state === "expired";
        return {
          product: it.name,
          plan: it.period === "lifetime" ? "Lifetime" : it.period + " key",
          status: state,
          key: it.key,
          pct: expired ? 0 : pr.pct,
          expires: frozen ? "frozen by staff" : expired ? "expired" : pr.label,
          img: it.img,
          frozen,
          expired,
          productId: it.productId
        };
      })
    : DASH_LICENSES;

  const dcHead = $(".dash-licenses .dc-head .dc-chip");
  if (dcHead) dcHead.textContent = visible.length ? `${visible.length} active` : "3 active";

  $("#lic-list").innerHTML = licSource.map((l, i) => {
    const logged = DASH_USER.logged;
    const displayKey = logged ? `${l.key.slice(0, 3)}-••••-••••-${l.key.slice(-4)}` : "••••-••••-••••-••••";
    return `
    <div class="lic-row" style="animation-delay:${0.15 + i * 0.09}s">
      <div class="lic-img"><img src="${l.img}" alt="${l.product}"></div>
      <div class="lic-info">
        <div class="lic-top"><b>${l.product}</b><span class="lic-status${l.frozen ? " frozen" : l.expired ? " expired" : ""}">${l.status}</span></div>
        <div class="lic-plan">${l.plan} · expires ${l.expires}</div>
        <div class="lic-prog${l.frozen ? " frozen" : ""}${l.expired ? " expired" : ""}"><i style="--w:${l.pct}%"></i></div>
      </div>
      <div class="lic-key">
        <code class="key-masked" data-key="${l.key}">${displayKey}</code>
        ${logged ? `<button class="key-reveal" data-i="${i}" title="Reveal key">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3.5 12s3.5-6.5 8.5-6.5 8.5 6.5 8.5 6.5-3.5 6.5-8.5 6.5-8.5-6.5-8.5-6.5z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8"/></svg>
        </button>` : `<span class="key-reveal" title="Login to reveal" style="opacity:0.25;cursor:not-allowed">
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 1 6 6v3a2 2 0 0 1-2 2h-1v4a3 3 0 1 1-6 0v-4H8a2 2 0 0 1-2-2V9a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="1.8"/></svg>
        </span>`}
      </div>
    </div>
    `;
  }).join("");

  $$("#lic-list .key-reveal").forEach((b) => {
    b.onclick = () => {
      if (!DASH_USER.logged) { toast("Login with Discord to reveal keys", "error"); return; }
      const code = b.parentElement.querySelector(".key-masked");
      const full = code.dataset.key;
      if (code.dataset.shown) {
        code.textContent = code.dataset.key.slice(0, 3) + "-••••-••••-" + code.dataset.key.slice(-4);
        delete code.dataset.shown;
      } else {
        code.textContent = full;
        code.dataset.shown = "1";
        navigator.clipboard && navigator.clipboard.writeText(full).catch(() => {});
        toast("Key revealed and copied");
      }
    };
  });

  const actItems = DASH_USER.logged ? getActivity() : [];
  const actSource = actItems.length ? actItems : DASH_ACTIVITY_DEFAULTS;
  if (!DASH_USER.logged) {
    $("#act-list").innerHTML = `<p style="color:var(--muted);padding:24px 0;text-align:center;font-family:var(--font-mono);font-size:11px;">No recent activity here..</p>`;
  } else {
    $("#act-list").innerHTML = actSource.map((a, i) => `
      <div class="act-row" style="animation-delay:${0.2 + i * 0.08}s">
        <span class="act-ico ${a.ico}"></span>
        <div class="act-body"><b>${a.text}</b><span>${a.when}</span></div>
      </div>
    `).join("");
  }

  $$("#sess-list .dc-link.danger").forEach((b) => {
    b.onclick = () => {
      b.closest(".sess-row").style.cssText = "opacity:0;transform:translateX(8px);transition:all .3s ease";
      setTimeout(() => {
        b.closest(".sess-row").remove();
        toast("Session revoked");
      }, 300);
    };
  });

  renderDashTicketList();

  const chatBack = $("#ticket-chat-back");
  if (chatBack) chatBack.onclick = () => {
    if (ticketChatPoll) { clearInterval(ticketChatPoll); ticketChatPoll = null; }
    const chatPanel = $("#ticket-chat-panel");
    const listCard = $(".dash-tickets-full");
    if (chatPanel) chatPanel.hidden = true;
    if (listCard) listCard.style.display = "";
    activeTicketId = null;
    renderDashTicketList();
  };

  const newTicketLink = $("#new-ticket-link");
  if (newTicketLink) newTicketLink.onclick = () => {
    dashTab = "tickets";
    $$(".dash-tab").forEach((b) => b.classList.toggle("on", b.dataset.dt === dashTab));
    $$(".dash-tab-page").forEach((p) => p.hidden = p.id !== "dt-" + dashTab);
    renderDashboard();
  };

  $$(".dash-tab").forEach((b) =>
    b.onclick = () => {
      dashTab = b.dataset.dt;
      $$(".dash-tab").forEach((x) => x.classList.toggle("on", x.dataset.dt === dashTab));
      $$(".dash-tab-page").forEach((p) => p.hidden = p.id !== "dt-" + dashTab);
    }
  );

  const ticketOverlay = $("#ticket-modal-overlay");
  if (ticketOverlay) {
    $("#ticket-modal-close").onclick = closeTicketModal;
    $("#tw-back").onclick = () => {
      if (twState.step > 1) { showTwStep(twState.step - 1); updateTwNav(); }
    };
    $("#tw-next").onclick = submitTicket;
    ticketOverlay.onclick = (e) => { if (e.target === ticketOverlay) closeTicketModal(); };
  }

  if (dashTab === "tickets") {
    const chatPanel = $("#ticket-chat-panel");
    const listCard = $(".dash-tickets-full");
    if (activeTicketId) {
      if (chatPanel) { chatPanel.hidden = false; chatPanel.classList.add("full-width"); }
      if (listCard) listCard.style.display = "none";
    } else {
      if (chatPanel) { chatPanel.hidden = true; chatPanel.classList.remove("full-width"); }
      if (listCard) listCard.style.display = "";
    }
  }

  const usage = STORE.get(usageKey(), {});
  const dayMins = [];
  let totalMins = 0;
  for (let i = 0; i <= 13; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const m = usage[key] || 0;
    totalMins += m;
    dayMins.push({ mins: m, label: d.toLocaleDateString("en", { weekday: "short" }) });
  }
  $("#usage-chart").innerHTML = dayMins.map((day, i) =>
    `<i style="--h:${Math.max(1, (day.mins / 60 / 12) * 100)}%;--d:${0.3 + i * 0.05}s" title="${day.label} — ${formatUsage(day.mins)}"></i>`
  ).join("");
  const avgMins = totalMins / 14;
  const totalFmt = formatUsage(totalMins);
  const avgFmt = formatUsage(avgMins);
  const totalNum = parseFloat(totalFmt);
  const avgNum = parseFloat(avgFmt);
  const totalSuf = totalFmt.slice(-1);
  const avgSuf = avgFmt.slice(-1);
  setTimeout(() => countUp($("#usage-total"), totalNum, 1100, totalSuf === "h" ? 1 : 0, totalSuf), 400);
  setTimeout(() => countUp($("#usage-avg"), avgNum, 1100, avgSuf === "h" ? 1 : 0, avgSuf), 550);

  [["#dash-download"], ["#dash-download-top"]].forEach(([sel]) => {
    const b = $(sel);
    if (b) b.onclick = () => {
      if (!DASH_USER.logged) { toast("Login with Discord to download", "error"); return; }
      const dlCount = STORE.get("linear_dl_count", 0) + 1;
      STORE.set("linear_dl_count", dlCount);
      addActivity("dl", "Loader v1.3.2 downloaded");
      toast("Loader v1.3.2 — download starting");
      const dlEl = $("#dash-dl-count");
      if (dlEl) {
        dlEl.dataset.count = dlCount;
        dlEl.textContent = dlCount;
      }
      window.open("https://github.com/ZeRoClassix/linearloader/releases/download/loader/Linear.Loader.V1.3.2.exe", "_blank");
    };
  });
  $("#new-ticket").onclick = () => {
    openTicketModal();
  };

  [["#twofa-switch", "Two-factor"], ["#alerts-switch", "Login alerts"]].forEach(([sel, label]) => {
    $(sel).onclick = () => {
      const sw = $(sel);
      sw.classList.toggle("on");
      toast(`${label} ${sw.classList.contains("on") ? "enabled" : "disabled"}`);
    };
  });

  const subs = owned.filter((it) => it.period !== "lifetime").length;
  countUp($("#stat-subs"), subs, 1000, 0);
  countUp($("#stat-keys"), owned.length, 1000, 0);
  const daysProtEl = $("#dash-days-protected")?.closest(".dash-stat");
  const dlCountEl = $("#dash-dl-count")?.closest(".dash-stat");
  if (daysProtEl) daysProtEl.style.display = "";
  if (dlCountEl) dlCountEl.style.display = "";
  if (DASH_USER.logged) {
    countUp($("#dash-days-protected"), 121, 1200, 0);
    const dlCount = STORE.get("linear_dl_count", 0);
    const dlEl = $("#dash-dl-count");
    if (dlEl) {
      dlEl.dataset.count = dlCount;
      countUp(dlEl, dlCount, 1200, 0);
    }
  } else {
    countUp($("#dash-days-protected"), 0, 1200, 0);
    countUp($("#dash-dl-count"), 0, 1200, 0);
  }

  requestAnimationFrame(() => setTimeout(() => {
    $$(".reveal", wrap).forEach((el, i) => {
      el.style.transitionDelay = (i * 0.07) + "s";
      el.classList.add("in");
    });
  }, 60));
}



function cartTotal() {
  return state.cart.reduce((sum, item) => sum + priceFor(PRODUCTS.find((p) => p.id === item.id), item.period), 0);
}

function updateCartBadge() {
  const n = state.cart.length;
  $count.textContent = n;
  $count.classList.toggle("show", n > 0);
}

function addToCart(id, btn, period = "lifetime", qty = 1) {
  for (let i = 0; i < qty; i++) state.cart.push({ id, period });
  saveCart();
  updateCartBadge();
  renderCart();
  $count.classList.remove("bump");
  void $count.offsetWidth;
  $count.classList.add("bump");

  if (btn) {
    btn.classList.add("added");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Added`;
    setTimeout(() => {
      btn.classList.remove("added");
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg> Add`;
    }, 1800);
  }
}

/* ============================================================
   Cart
   ============================================================ */

function removeFromCart(idx) {
  state.cart.splice(idx, 1);
  saveCart();
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const body = $("#cart-body");
  const foot = $("#cart-foot");

  if (state.cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4h2l2.4 12.2a1.5 1.5 0 0 0 1.47 1.3h8.86a1.5 1.5 0 0 0 1.46-1.17L21 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="21" r="1.3" fill="currentColor"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor"/></svg>
        <p>Your cart is empty.</p>
        <a href="#" class="btn btn-primary btn-sm" data-goto="products">Browse Products</a>
      </div>
    `;
    bindGotoLinks(body);
    foot.hidden = true;
    return;
  }

  foot.hidden = false;
  body.innerHTML = state.cart.map((item, i) => {
    const p = PRODUCTS.find((x) => x.id === item.id);
    const plabel = item.period === "lifetime" ? "Lifetime" : `${item.period.toUpperCase()} key`;
    return `
      <div class="cart-item${p.premium ? " premium" : ""}">
        <div class="cart-item-icon">${p.img ? `<img src="${p.img}" alt="${p.name}">` : iconFor(p)}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${fmtMoney(priceFor(p, item.period))} · ${plabel}</div>
        </div>
        <button class="cart-item-remove" data-idx="${i}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0l-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `;
  }).join("");

  $("#cart-total").textContent = fmtMoney(cartTotal());
  $$(".cart-item-remove", body).forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(+btn.dataset.idx));
  });
}

/* ============================================================
   Cart drawer
   ============================================================ */

function toggleCart(open) {
  const force = open === undefined ? !$("#cart").classList.contains("open") : open;
  $("#cart").classList.toggle("open", force);
  $("#cart-overlay").classList.toggle("open", force);
  if (force) renderCart();
}

/* ============================================================
   Toast
   ============================================================ */

const toastEl = document.createElement("div");
toastEl.className = "toast";
document.body.appendChild(toastEl);
let toastTimer = null;

function toast(msg, kind) {
  const isErr = kind === "error";
  toastEl.innerHTML = isErr
    ? `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7.5v5.5M12 16.4v.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${msg}`
    : `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M8.5 12.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>${msg}`;
  toastEl.classList.toggle("error", isErr);
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), isErr ? 3200 : 2400);
}

/* ============================================================
   Live sales ticker
   ============================================================ */

const TICKER_NAMES = ["frost", "drxp", "void", "kay", "m0on", "zenn", "trvp", "hex", "glxy", "wraith", "nyx", "blitz", "echo", "vex", "kuro", "nova", "onyx", "pyro", "lynx", "ghost", "kaze", "oryx", "dusk", "iris", "sai", "rue", "jett", "kira", "reno", "zane", "ash", "kai", "riven", "sora", "tide", "milo", "arlen", "brek", "cyra", "dane"];
const TICKER_COUNTRIES = [
  ["🇺🇸", "United States"], ["🇩🇪", "Germany"], ["🇬🇧", "United Kingdom"], ["🇫🇷", "France"],
  ["🇳🇱", "Netherlands"], ["🇨🇦", "Canada"], ["🇦🇺", "Australia"], ["🇸🇪", "Sweden"],
  ["🇳🇴", "Norway"], ["🇵🇱", "Poland"], ["🇧🇷", "Brazil"], ["🇯🇵", "Japan"],
  ["🇷🇴", "Romania"], ["🇮🇹", "Italy"], ["🇪🇸", "Spain"], ["🇺🇦", "Ukraine"]
];
const TICKER_METHODS = ["PayPal", "Card", "paysafecard", "CashApp", "Crypto"];

function showSaleTicker() {
  if (document.hidden) return scheduleSale();
  const rnd = Math.random;
  const name = TICKER_NAMES[Math.floor(rnd() * TICKER_NAMES.length)] + (rnd() > 0.5 ? String(Math.floor(rnd() * 90) + 10) : "");
  const country = TICKER_COUNTRIES[Math.floor(rnd() * TICKER_COUNTRIES.length)];
  const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
  const period = (p.cat === "misc" || p.cat === "accounts" || p.id === "overlay-pack") ? "lifetime" : ["month", "year", "week", "day"][Math.floor(rnd() * 4)];
  const price = priceFor(p, period);
  const method = TICKER_METHODS[Math.floor(rnd() * TICKER_METHODS.length)];
  const mins = Math.floor(rnd() * 14) + 1;

  let box = $("#sale-ticker");
  if (!box) {
    box = document.createElement("div");
    box.id = "sale-ticker";
    document.body.appendChild(box);
  }
  box.innerHTML = `
    <div class="st-flag">${country[0]}</div>
    <div class="st-body">
      <div class="st-line"><b>${name}</b> from ${country[1]}</div>
      <div class="st-line2">bought <b>${p.name}</b> · ${period}</div>
      <div class="st-meta"><span class="st-price">${fmtMoney(price)}</span> · ${method} · ${mins}m ago</div>
    </div>
    <span class="st-check"><svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 5200);
  scheduleSale();
}

function scheduleSale() {
  setTimeout(showSaleTicker, 14000 + Math.random() * 26000);
}

/* ============================================================
   Navigation
   ============================================================ */

function goTo(page) {
  if (!document.getElementById("page-" + page)) page = "home";
  if (state.page === "dashboard" && page !== "dashboard") endSession();
  state.page = page;

  $$(".page").forEach((el) => el.classList.remove("active"));
  $("#page-" + page).classList.add("active");

  $$(".nav-link").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });
  moveNavInd();

  if (page === "dashboard") {
    try { renderDashboard(); } catch(e) {}
  }
  if (page === "home") {
    const _st2 = seedAdminData();
    const _a2 = document.querySelector('.stat-num[data-count="12480"]');
    const _d2 = document.querySelector('.stat-num[data-count="36"]');
    if (_a2) _a2.dataset.count = _st2.users;
    if (_d2) _d2.dataset.count = _st2.daysUndetected;
    animateCounters();
  }
  const rvo = document.getElementById("reviews-down-overlay");
  if (rvo) rvo.style.display = page === "reviews" ? "" : "none";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function moveNavInd() {
  const nav = $("#nav");
  const ind = $("#nav-ind");
  const active = $(".nav-link.active", nav);
  if (!nav || !ind || !active) {
    if (ind) ind.style.opacity = "0";
    return;
  }
  ind.style.opacity = "1";
  const nw = nav.getBoundingClientRect();
  const aw = active.getBoundingClientRect();
  ind.style.left = aw.left - nw.left + "px";
  ind.style.width = aw.width + "px";
}

function bindGotoLinks(ctx = document) {
  $$("[data-goto]", ctx).forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      goTo(el.dataset.goto);
      toggleCart(false);
    });
  });
}

/* ============================================================
   Animated counters
   ============================================================ */

function animateCounters() {
  $$(".stat-num").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = target % 1 !== 0 ? 1 : 0;
    const dur = 1400;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Number((target * eased).toFixed(decimals)).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ============================================================
   Misc
   ============================================================ */

function bindStaticEvents() {
  $$(".nav-link").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      goTo(el.dataset.page);
    });
  });

  $("#cart-btn").addEventListener("click", () => toggleCart());
  $("#cart-close").addEventListener("click", () => toggleCart(false));
  $("#cart-overlay").addEventListener("click", () => toggleCart(false));

  $("#checkout-btn").addEventListener("click", () => {
    if (!state.cart.length) { toast("Your cart is empty"); return; }
    if (!DASH_USER.logged) {
      toast("You need to login with Discord to checkout", "error");
      toggleCart(false);
      return;
    }
    toggleCart(false);
    renderCheckout();
    goTo("checkout");
  });

  $("#discord-btn").addEventListener("click", (e) => {
    e.preventDefault();
    window.open("https://discord.gg/linearstudio", "_blank");
  });

  $("#dashboard-btn").addEventListener("click", (e) => {
    e.preventDefault();
    goTo("dashboard");
  });

  function switchCurrency(cur) {
    currentCurrency = cur;
    localStorage.setItem("lin-currency", cur);
    $("#currency-label").textContent = cur;
    $$(".currency-option").forEach((o) => o.classList.toggle("active", o.dataset.cur === cur));
    refreshAllPrices();
    ProductView.refresh();
  }

  $("#currency-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    $("#currency-wrap").classList.toggle("open");
  });

  $$(".currency-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      switchCurrency(opt.dataset.cur);
      $("#currency-wrap").classList.remove("open");
    });
  });

  document.addEventListener("click", () => {
    $("#currency-wrap").classList.remove("open");
  });

  function refreshAllPrices() {
    renderProducts();
    renderCart();
    const cartTotalEl = document.getElementById("cart-total");
    if (cartTotalEl) cartTotalEl.textContent = fmtMoney(cartTotal());
  }

  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin) return;
    if (e.data && e.data.type === "discord-login") {
      applyDiscordUser(e.data.username, e.data.avatar, e.data.id);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") toggleCart(false);
  });

  $$(".feature-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  $$(".category-card").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const label = card.querySelector(".cat-label").textContent.trim();
      const map = { "GAMES": "games", "SPOOFER": "spoofer", "ACCOUNTS": "accounts", "AC BYPASS": "ac" };
      const cat = map[label];
      if (cat) { activeCat = cat; goTo("products"); renderCategoryTabs(); renderProducts(); }
    });
  });

  window.addEventListener("scroll", () => {
    $("#header").classList.toggle("scrolled", window.scrollY > 12);
  });
}

/* ============================================================
   Boot
   ============================================================ */

function saveUser() {
  try {
    localStorage.setItem("linear_user", JSON.stringify({
      name: DASH_USER.name, avatar: DASH_USER.avatar, id: DASH_USER.id, logged: DASH_USER.logged, since: DASH_USER.since
    }));
  } catch (e) {}
}

function loadUser() {
  try {
    const raw = localStorage.getItem("linear_user");
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && saved.logged) {
      DASH_USER.name = saved.name || "user";
      DASH_USER.avatar = saved.avatar || null;
      DASH_USER.id = saved.id || null;
      DASH_USER.since = saved.since || "";
      DASH_USER.logged = true;
      if (DASH_USER.id === "992005139101650986") {
        DASH_USER.since = "Jul 2026";
        saveUser();
      }
    }
  } catch (e) {}
}

function logoutUser() {
  endSession();
  DASH_USER.name = "user";
  DASH_USER.avatar = null;
  DASH_USER.id = null;
  DASH_USER.since = "";
  DASH_USER.logged = false;
  try { localStorage.removeItem("linear_user"); } catch (e) {}
  renderDashboard();
  goTo("dashboard");
  toast("Logged out");
}

function applyDiscordUser(username, avatar, id) {
  const banned = STORE.get("linear_banned", []);
  if (id && banned.includes(id)) {
    toast("This account is banned");
    return;
  }
  if (username) DASH_USER.name = username;
  if (avatar) DASH_USER.avatar = avatar;
  if (id) DASH_USER.id = id;
  if (id === "992005139101650986" || (username && username.toLowerCase() === "aidn")) {
    DASH_USER.since = "Jul 2026";
  } else if (!DASH_USER.since) {
    const now = new Date();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    DASH_USER.since = months[now.getMonth()] + " " + now.getFullYear();
  }
  DASH_USER.logged = true;
  saveUser();
  loadCart();
  addActivity("login", `Logged in as ${username}${DASH_USER.id ? " · " + detectEnv().os : ""}`);
  renderDashboard();
  goTo("dashboard");
  setTimeout(() => toast(`Logged in as ${DASH_USER.name}`), 500);
}

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("beforeunload", () => endSession());

  const qs = new URLSearchParams(location.search);
  if (qs.get("login") === "success") {
    const username = qs.get("username");
    const avatar = qs.get("avatar");
    const id = qs.get("id");
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({ type: "discord-login", username, avatar, id }, location.origin);
      } catch (e) {}
      window.close();
      return;
    }
    applyDiscordUser(username, avatar, id);
    history.replaceState(null, "", location.pathname + location.hash);
    return;
  }
  loadUser();
  loadCart();
  startSession();
  startDashboardLiveUpdates();
  Particles.init();
  ProductView.bind();
  renderCategoryTabs();
  renderProducts();
  renderStatus();
  renderCheatStatus();
  initOnlinePanel();
  renderReviews();
  renderGameCards();
  renderChips();
  renderReviewsMarquee();
  renderCart();
  updateCartBadge();
  try { renderDashboard(); } catch (err) { console.error("dashboard:", err); }
  initCheckout();
  bindStaticEvents();
  bindGotoLinks();
  moveNavInd();
  const _st = seedAdminData();
  const _activeEl = document.querySelector('.stat-num[data-count="12480"]');
  const _daysEl = document.querySelector('.stat-num[data-count="36"]');
  if (_activeEl) _activeEl.dataset.count = _st.users;
  if (_daysEl) _daysEl.dataset.count = _st.daysUndetected;
  animateCounters();
  setTimeout(scheduleSale, 9000);
  window.addEventListener("resize", moveNavInd);
  const cl = document.getElementById("currency-label");
  if (cl) cl.textContent = currentCurrency;
  $$(".currency-option").forEach((o) => o.classList.toggle("active", o.dataset.cur === currentCurrency));
});