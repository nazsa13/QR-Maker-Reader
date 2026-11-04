/* QR Maker & Reader — client-side app logic (no tracking, no uploads). */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  /* ---------------- Tabs ---------------- */
  const tabs = [$("tab-generate"), $("tab-scan")];
  const panels = [$("panel-generate"), $("panel-scan")];
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t, j) => {
        t.classList.toggle("active", i === j);
        t.setAttribute("aria-selected", String(i === j));
        panels[j].classList.toggle("hidden", i !== j);
      });
      if (i !== 1) stopCamera(); // leaving scan tab
    });
  });

  /* ---------------- Generator ---------------- */
  const textEl = $("qr-text");
  const fillEl = $("qr-fill");
  const backEl = $("qr-back");
  const sizeEl = $("qr-size");
  const ecEl = $("qr-ec");
  const canvas = $("qr-canvas");
  const genStatus = $("gen-status");

  function setError(el, msg) {
    genStatus.textContent = msg || "";
    genStatus.className = "status" + (msg ? (msg.startsWith("✅") ? " ok" : " err") : "");
  }

  function renderQr() {
    const data = textEl.value.trim();
    if (!data) { setError(null, "Type a link or text to generate a QR code."); return; }

    const size = Math.min(Math.max(parseInt(sizeEl.value, 10) || 512, 128), 2048);
    // QRCode.toCanvas(canvas, text, opts, cb) — nudge the image into the canvas
    window.QRCode.toCanvas(canvas, data, {
      width: size,
      margin: 4,
      errorCorrectionLevel: ecEl.value,
      color: { dark: fillEl.value, light: backEl.value },
    }, function (err) {
      if (err) { setError(null, "⚠️ Couldn't render: " + err.message); return; }
      // The QR library writes inline pixel width/height, which beats our CSS and
      // stretches the canvas on narrow screens. Drop it so CSS sizes the preview
      // (square, capped at 340px, never wider than its column).
      canvas.style.width = "";
      canvas.style.height = "";
      setError(null, "");
    });
  }

  [textEl, fillEl, backEl, sizeEl, ecEl].forEach((el) =>
    el.addEventListener("input", renderQr)
  );

  /* PNG download */
  /* ---------------- Theme toggle ---------------- */
  const themeToggle = $("theme-toggle");

  /* ---------------- Language toggle ---------------- */
  const langToggle = $("lang-toggle");
  const CURRENT_LANG_KEY = "qr-maker-lang";
  const LANG_EN = "en";
  const LANG_AR = "ar";

  function applyLang(lang) {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.dir = lang === LANG_AR ? "rtl" : "ltr";
    langToggle.setAttribute("aria-pressed", lang === LANG_AR);
    document.getElementById("lang-en").style.display = lang === LANG_EN ? "inline" : "none";
    document.getElementById("lang-ar").style.display = lang === LANG_AR ? "inline" : "none";

    // Arabic translations for UI text
    const arTexts = {
      qrTextPlaceholder: "رابط أو نص لترميز",
      dlPng: "تحميل PNG",
      dlSvg: "تحميل SVG",
      copyImg: "نسخ للصورة",
      genStatusOk: "✅",
      genStatusErr: "⚠️",
      hint: "تصحيح الأخطاء الأعلى يبقى القابل للمسح عند التعطيل الجزئي — #{seeFAQ}",
      tabGenerate: "إنشاء QR",
      tabScan: "مسح QR",
      camStart: "بدء الكاميرا",
      camStop: "إيقاف",
      camStatusInit: "📷 اضبط على رمز QR — يتم التفريغ…",
      camStatusOk: "✅已解码!",
      browseFile: "اختر صورة"
    };
    const enTexts = {
      qrTextPlaceholder: "URL or text to encode",
      dlPng: "Download PNG",
      dlSvg: "Download SVG",
      copyImg: "Copy image",
      genStatusOk: "✅",
      genStatusErr: "⚠️",
      hint: "Higher error correction stays scannable when partially covered — #{seeFAQ}",
      tabGenerate: "Create QR",
      tabScan: "Scan QR",
      camStart: "Start camera",
      camStop: "Stop",
      camStatusInit: "📷 Point at a QR code — decoding…",
      camStatusOk: "✅ Decoded!",
      browseFile: "Click or drop a QR image here"
    };

    const t = lang === LANG_AR ? arTexts : enTexts;

    // Apply placeholder and text translations
    if (textEl) {
      textEl.placeholder = t.qrTextPlaceholder;
    }
    $("dl-png").textContent = t.dlPng;
    $("dl-svg").textContent = t.dlSvg;
    $("copy-img").textContent = t.copyImg;
    // genStatus is already handled via setError()
    const hintEl = $("hint");
    if (hintEl) {
      hintEl.textContent = t.hint;
    }
    if (tabGenerate) {
      tabGenerate.textContent = t.tabGenerate;
    }
    if (tabScan) {
      tabScan.textContent = t.tabScan;
    }
    const camStartEl = $("cam-start");
    if (camStartEl) {
      camStartEl.textContent = t.camStart;
    }
    const camStopEl = $("cam-stop");
    if (camStopEl) {
      camStopEl.textContent = t.camStop;
    }
    const camStatusEl = $("cam-status");
    if (camStatusEl) {
      camStatusEl.textContent = t.camStatusInit;
    }

    try { localStorage.setItem(CURRENT_LANG_KEY, lang); } catch (e) { /* ignore */ }
  }

  function readSavedLang() {
    let saved = null;
    try { saved = localStorage.getItem(CURRENT_LANG_KEY); } catch (e) { /* ignore */ }
    if (saved === LANG_EN || saved === LANG_AR) return saved;
    return LANG_EN; // default to English
  }

  const savedLang = readSavedLang();
  applyLang(savedLang);

  langToggle.addEventListener("click", () => {
    const next = langToggle.getAttribute("aria-pressed") === "true" ? LANG_EN : LANG_AR;
    applyLang(next);
  });

  $("dl-png").addEventListener("click", () => {
    const data = textEl.value.trim();
    if (!data) { setError(null, "Type a link or text first."); return; }
    window.QRCode.toCanvas(canvas.cloneNode(), data, {
      width: Math.min(Math.max(parseInt(sizeEl.value, 10) || 512, 128), 2048),
      margin: 4,
      errorCorrectionLevel: ecEl.value,
      color: { dark: fillEl.value, light: backEl.value },
    }, function (err, c) {
      if (err) { setError(null, "⚠️ Export failed."); return; }
      const a = document.createElement("a");
      a.download = "qr-code.png";
      a.href = c.toDataURL("image/png");
      a.click();
      setError(null, "✅ PNG downloaded.");
    });
  });

  /* SVG download */
  /* Copy image (Clipboard API, graceful fallback) */
  $("copy-img").addEventListener("click", async () => {
    try {
      const blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/png")
      );
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setError(null, "✅ Image copied to clipboard.");
    } catch (e) {
      setError(null, "⚠️ Clipboard blocked — use Download instead.");
    }
  });

  $("dl-png").addEventListener("click", () => {
    const data = textEl.value.trim();
    if (!data) { setError(null, "Type a link or text first."); return; }
    window.QRCode.toCanvas(canvas.cloneNode(), data, {
      width: Math.min(Math.max(parseInt(sizeEl.value, 10) || 512, 128), 2048),
      margin: 4,
      errorCorrectionLevel: ecEl.value,
      color: { dark: fillEl.value, light: backEl.value },
    }, function (err, c) {
      if (err) { setError(null, "⚠️ Export failed."); return; }
      const a = document.createElement("a");
      a.download = "qr-code.png";
      a.href = c.toDataURL("image/png");
      a.click();
      setError(null, "✅ PNG downloaded.");
    });
  });

  /* Copy image (Clipboard API, graceful fallback) */
  $("copy-img").addEventListener("click", async () => {
    try {
      const blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error("no blob"))), "image/png")
      );
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setError(null, "✅ Image copied to clipboard.");
    } catch (e) {
      setError(null, "⚠️ Clipboard blocked — use Download instead.");
    }
  });

  /* ---------------- Scanner ---------------- */
  const video = $("video");
  const camCanvas = $("cam-canvas");
  const camStatus = $("cam-status");
  const camStart = $("cam-start");
  const camStop = $("cam-stop");
  let stream = null;
  let rafId = 0;

  function camMsg(text, cls) {
    camStatus.textContent = text;
    camStatus.className = "status" + (cls ? " " + cls : "");
  }

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      camMsg("⚠️ Camera API not available in this browser (needs HTTPS).", "err");
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch (e) {
      camMsg("⚠️ Camera access denied or unavailable: " + e.name, "err");
      return;
    }
    video.srcObject = stream;
    await video.play();
    video.classList.add("on");
    camStart.disabled = true;
    camStop.disabled = false;
    camMsg("📷 Point at a QR code — decoding…" , "");
    tick();
  }

  function tick() {
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      camCanvas.width = video.videoWidth;
      camCanvas.height = video.videoHeight;
      const ctx = camCanvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, camCanvas.width, camCanvas.height);
      const img = ctx.getImageData(0, 0, camCanvas.width, camCanvas.height);
      const code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
      if (code && code.data) {
        camMsg("✅ Decoded!", "ok");
        showResult(code.data);
        stopCamera();
        return;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function stopCamera() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    video.classList.remove("on");
    camStart.disabled = false;
    camStop.disabled = true;
  }

  camStart.addEventListener("click", startCamera);
  camStop.addEventListener("click", stopCamera);

  /* ---- Image upload decode ---- */
  const scanStatus = $("scan-status");
  const resultBox = $("scan-result");
  const dropzone = $("dropzone");
  const fileInput = $("file-input");

  function showResult(data) {
    const isUrl = /^https?:\/\//i.test(data);
    resultBox.classList.remove("hidden");
    resultBox.innerHTML =
      "<p><strong>✅ QR Code Data:</strong></p>" +
      (isUrl
        ? '<p>⚠️ Check the link below before opening it.</p>' +
          '<p><a href="' + escapeHtml(data) + '" target="_blank" rel="noopener noreferrer nofollow">' + escapeHtml(data) + "</a></p>"
        : "<p><code>" + escapeHtml(data) + "</code></p>");
  }

  window.showResult = showResult;
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function decodeImageFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      scanStatus.textContent = "⚠️ Please choose an image file.";
      scanStatus.className = "status err";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, c.width, c.height);
        const code = window.jsQR(id.data, id.width, id.height, { inversionAttempts: "attemptBoth" });
        if (code && code.data) {
          scanStatus.textContent = "✅ QR decoded.";
          scanStatus.className = "status ok";
          showResult(code.data);
        } else {
          scanStatus.textContent = "⚠️ No QR code found in that image. Try a sharper or uncropped version.";
          scanStatus.className = "status err";
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) decodeImageFile(fileInput.files[0]);
  });

  ["dragenter", "dragover"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("drag");
    })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag");
    })
  );
  dropzone.addEventListener("drop", (e) => {
    if (e.dataTransfer.files.length) decodeImageFile(e.dataTransfer.files[0]);
  });

  /* Initial render with a pleasant default */
  textEl.value = "https://qr-maker-reader.vercel.app";
  renderQr();
})();
