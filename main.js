/* ==========================================================
   KODE ASLI (jangan dihapus, ini yang menjalankan animasi bunga)
   ========================================================== */
onload = () => {
  document.body.classList.remove("container");
};


/* ==========================================================
   TAMBAHAN 1: kecilkan ukuran bunga
   ========================================================== */
(function () {
  "use strict";

  // 1 = ukuran asli, 0.85 = 15% lebih kecil, 0.7 = 30% lebih kecil
  var FLOWER_SCALE = 0.85;

  var el = document.querySelector(".flowers");
  if (!el) return;

  function applyScale() {
    // hapus override lama dulu supaya bisa membaca ukuran asli dari CSS kamu
    el.style.removeProperty("transform");
    var t = getComputedStyle(el).transform;
    var base = 1;
    if (t && t !== "none") {
      var m = t.match(/matrix\(([^)]+)\)/);
      if (m) base = parseFloat(m[1].split(",")[0]) || 1;
    }
    el.style.setProperty("transform", "scale(" + (base * FLOWER_SCALE) + ")", "important");
  }

  applyScale();
  window.addEventListener("resize", applyScale);
})();


/* ==========================================================
   TAMBAHAN 2: teks yang muncul bergantian
   ========================================================== */
(function () {
  "use strict";

  // ---------- Ganti teks sesuai keinginan kamu ----------
  var MESSAGES = [
    "SELAMAT ULANNG TAHUN NCISS",
    "SEMOGA SEHAT SELALU, SUKSES, DAN LANCAR SEMUANYA",
    "SEMOGA HARI-HARIMUU MENYENANGKAN YAA",
    "SEMOGA KEDEPANNYA MAKIN BANYAK KABAR BAIK"
  ];
  var TEXT_START_DELAY = 2500; // ms setelah halaman terbuka
  var TEXT_VISIBLE     = 3200; // ms tiap teks tampil
  var TEXT_FADE        = 900;  // ms jeda saat teks memudar
  var TEXT_TOP         = "9vh"; // posisi dari atas layar

  var style = document.createElement("style");
  style.textContent =
    "#flower-text{position:fixed;left:50%;top:" + TEXT_TOP + ";" +
    "transform:translate(-50%,12px);width:90%;max-width:700px;" +
    "text-align:center;color:#fff;font-size:clamp(18px,5vw,34px);" +
    "font-weight:600;letter-spacing:.04em;line-height:1.4;" +
    "text-shadow:0 0 8px rgba(255,255,255,.7),0 0 22px rgba(255,150,200,.8);" +
    "opacity:0;transition:opacity " + TEXT_FADE + "ms ease," +
    "transform " + TEXT_FADE + "ms ease;pointer-events:none;z-index:2;}" +
    "#flower-text.show{opacity:1;transform:translate(-50%,0);}";
  document.head.appendChild(style);

  var box = document.createElement("div");
  box.id = "flower-text";
  document.body.appendChild(box);

  function showMessage(i) {
    box.textContent = MESSAGES[i];
    // reflow kecil supaya transisi selalu terpicu
    void box.offsetWidth;
    box.classList.add("show");

    if (i < MESSAGES.length - 1) {
      setTimeout(function () {
        box.classList.remove("show");
        setTimeout(function () { showMessage(i + 1); }, TEXT_FADE + 200);
      }, TEXT_VISIBLE);
    }
    // teks terakhir dibiarkan tetap tampil
  }

  function go() { setTimeout(function () { showMessage(0); }, TEXT_START_DELAY); }

  if (document.readyState === "complete") go();
  else window.addEventListener("load", go);
})();


/* ==========================================================
   TAMBAHAN 3: efek kembang api
   ========================================================== */
(function () {
  "use strict";

  // ---------- Pengaturan (silakan diubah) ----------
  var START_DELAY   = 3500;        // ms, kembang api mulai setelah bunga mulai mekar
  var LAUNCH_EVERY  = [600, 1400]; // jeda acak antar peluncuran (ms)
  var Z_INDEX       = 1;           // ganti ke -1 jika ingin kembang api di belakang bunga
  var GRAVITY       = 0.04;
  var FRICTION      = 0.985;
  var CLICK_TO_FIRE = true;        // klik/tap layar untuk menembakkan kembang api

  // ---------- Canvas ----------
  var canvas = document.createElement("canvas");
  canvas.id = "fireworks-canvas";
  canvas.style.cssText =
    "position:fixed;left:0;top:0;width:100%;height:100%;" +
    "pointer-events:none;z-index:" + Z_INDEX + ";";
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function rand(min, max) { return Math.random() * (max - min) + min; }
  var isMobile = W < 600;

  var rockets = [];
  var particles = [];

  function launch(targetX, targetY) {
    var x = targetX !== undefined ? targetX : rand(W * 0.15, W * 0.85);
    var startX = x + rand(-60, 60);
    var ty = targetY !== undefined ? targetY : rand(H * 0.12, H * 0.5);
    var dist = H - ty;
    rockets.push({
      x: startX,
      y: H,
      tx: x,
      ty: ty,
      vx: (x - startX) / (dist / 9),
      vy: -9,
      hue: rand(0, 360)
    });
  }

  function makeParticle(x, y, vx, vy, hue) {
    return {
      x: x, y: y, vx: vx, vy: vy,
      hue: hue + rand(-15, 15),
      alpha: 1,
      decay: rand(0.008, 0.018),
      size: rand(1.2, 2.4)
    };
  }

  function explode(x, y, hue) {
    var count = isMobile ? 60 : 110;
    var shape = Math.random();
    for (var i = 0; i < count; i++) {
      var angle, speed;
      if (shape < 0.35) {
        // bentuk hati
        var t = (i / count) * Math.PI * 2;
        var hx = 16 * Math.pow(Math.sin(t), 3);
        var hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) -
                   2 * Math.cos(3 * t) - Math.cos(4 * t));
        particles.push(makeParticle(x, y, hx * 0.28, hy * 0.28, hue));
        continue;
      }
      angle = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
      speed = shape < 0.7 ? rand(1, 5.5) : (i % 2 ? 5 : 3);
      particles.push(makeParticle(x, y, Math.cos(angle) * speed,
                                   Math.sin(angle) * speed, hue));
    }
  }

  var running = false;
  var started = false;
  var nextLaunch = 0;

  function frame(now) {
    if (!running) return;

    // memudarkan frame sebelumnya -> efek jejak, latar tetap transparan
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    if (now >= nextLaunch) {
      launch();
      if (Math.random() < 0.3) launch(); // kadang dua sekaligus
      nextLaunch = now + rand(LAUNCH_EVERY[0], LAUNCH_EVERY[1]);
    }

    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.06;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(" + r.hue + ",100%,75%)";
      ctx.fill();
      if (r.vy >= -1 || r.y <= r.ty) {
        explode(r.x, r.y, r.hue);
        rockets.splice(i, 1);
      }
    }

    for (var j = particles.length - 1; j >= 0; j--) {
      var p = particles[j];
      p.vx *= FRICTION;
      p.vy = p.vy * FRICTION + GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) { particles.splice(j, 1); continue; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + p.hue + ",100%,65%," + p.alpha + ")";
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    nextLaunch = 0;
    requestAnimationFrame(frame);
  }

  // hemat baterai saat tab disembunyikan
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { running = false; }
    else if (started) { start(); }
  });

  if (CLICK_TO_FIRE) {
    window.addEventListener("click", function (e) {
      if (!started) return;
      launch(e.clientX, e.clientY);
    });
  }

  function begin() {
    started = true;
    start();
  }

  // addEventListener tidak menimpa `onload` milikmu di atas
  if (document.readyState === "complete") {
    setTimeout(begin, START_DELAY);
  } else {
    window.addEventListener("load", function () {
      setTimeout(begin, START_DELAY);
    });
  }
})();