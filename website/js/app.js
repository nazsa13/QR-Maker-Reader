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
  /* ---------------- Language toggle ---------------- */
  const languageToggle = $("language-toggle");
  const languageLabel = languageToggle.querySelector(".language-toggle__label");
  const languageCurrent = languageToggle.querySelector(".language-toggle__current");
  const LANGUAGE_KEY = "qr-maker-language";
  let currentLanguage = "en";

  const translations = {
    en: {
      languageLabel: "العربية",
      languageCurrent: "ع",
      theme: "Theme",
      heroTitle: "Free QR Code Generator & Scanner — online, instant, and 100% private",
      heroDescription: "<strong>QR Maker &amp; Reader</strong> creates QR codes for links and text in seconds and reads QR codes straight from your camera — free, with no sign-up, no ads and no uploads. <strong>Everything runs inside your browser</strong>: the QR you generate or the camera frame you scan is never sent to any server.",
      appLabel: "QR code tool",
      createQr: "Create QR",
      scanQr: "Scan QR",
      encodeLabel: "URL or text to encode",
      encodePlaceholder: "https://example.com — or any text, Wi-Fi string, contact data…",
      dotColor: "Dot color",
      background: "Background",
      sizePx: "Size (px)",
      errorCorrection: "Error correction",
      errorHint: "Higher error correction stays scannable when partially covered — ",
      seeFaq: "see FAQ",
      downloadPng: "Download PNG",
      downloadSvg: "Download SVG",
      copyImage: "Copy image",
      scanCamera: "Scan with your camera",
      startCamera: "Start camera",
      stop: "Stop",
      decodeImage: "Decode an image",
      dropImage: "Click or drop a QR image here",
      whyTitle: "Why use QR Maker & Reader instead of typical QR websites?",
      feature: "Feature",
      typicalSites: "Typical QR sites",
      faqTitle: "QR code FAQ",
      cliTitle: "Prefer the command line?",
      price: "Price",
      freeForever: "Free forever, MIT open source",
      limitedFree: "Free tier with usage limits; “dynamic” QRs expire",
      signup: "Sign-up",
      none: "None",
      accountRequired: "Account often required",
      adsTrackers: "Ads & trackers",
      zero: "Zero",
      adBanners: "Ad banners, redirects, tracking pixels",
      yourData: "Your data",
      neverUploaded: "Never uploaded — runs in your browser",
      serverProcessed: "Encoded content processed server-side",
      qrLifespan: "Requested QR lifespan",
      permanentStatic: "Permanent (static)",
      dynamicStop: "Dynamic QR links can stop working",
      faqFreeQuestion: "Is this QR code generator really free?",
      faqFreeAnswer: "Yes — 100% free with no sign-up, no accounts, no ads and no limits. The <a href=\"https://github.com/nazsa13/QR-Maker-Reader\" rel=\"noopener noreferrer\" target=\"_blank\">source code is MIT-licensed and on GitHub</a>, so you can also run it locally.",
      faqPrivacyQuestion: "Are my QR codes private? Does my data get uploaded?",
      faqPrivacyAnswer: "The app is fully client-side. Camera frames and any text you encode never leave your device — no upload, no tracking of your QR content.",
      faqDamageQuestion: "How much damage can a QR code survive?",
      faqDamageAnswer: "Per the QR error-correction spec (ISO/IEC 18004), levels L, M, Q and H can restore codewords damaged up to approximately <strong>7%, 15%, 25% and 30%</strong> respectively. Choose <strong>H</strong> if the code may be partially covered, printed small or displayed on worn surfaces.",
      faqBorderQuestion: "What size border should a QR code have?",
      faqBorderAnswer: "The QR specification requires a quiet zone of at least <strong>4 modules</strong> around the code so scanners can find its edges. This tool uses a 4-module border by default; scanning often fails below that.",
      faqFormatQuestion: "PNG or SVG — which should I use?",
      faqFormatAnswer: "Use <strong>SVG for print</strong> (posters, business cards): it scales to any size with sharp edges. Use <strong>PNG for screens</strong>: web pages, chat apps and social-media previews.",
      faqScanQuestion: "How do I scan a QR code without installing an app?",
      faqScanAnswer: "Open this page on your phone, switch to <strong>Scan QR</strong> and allow camera access. You can also decode a QR from an image you already saved — just drop it in the panel.",
      cliDescription: "The <a href=\"https://github.com/nazsa13/QR-Maker-Reader\" rel=\"noopener noreferrer\" target=\"_blank\">QR Maker &amp; Reader repo</a> includes a Python CLI: <code>python qr_cli.py generate \"https://example.com\" -o link.png</code> generates, and <code>python qr_cli.py read link.png</code> decodes — the same privacy guarantee, no browser needed.",
      github: "GitHub",
      madeBy: "Made by",
      footerBuilt: "Built with <strong>zero trackers</strong> · QR codes generated here never expire",
    },
    ar: {
      languageLabel: "English",
      languageCurrent: "EN",
      theme: "المظهر",
      heroTitle: "منشئ وقارئ رموز QR مجاني — فوري، عبر الإنترنت، وخصوصي 100٪",
      heroDescription: "ينشئ <strong>QR Maker &amp; Reader</strong> رموز QR للروابط والنصوص خلال ثوانٍ ويقرأها مباشرة من الكاميرا — مجانًا، بلا تسجيل أو إعلانات أو رفع للملفات. <strong>كل شيء يعمل داخل متصفحك</strong>، ولا يتم إرسال الرمز الذي تنشئه أو إطار الكاميرا الذي تمسحه إلى أي خادم.",
      appLabel: "أداة رموز QR",
      createQr: "إنشاء QR",
      scanQr: "مسح QR",
      encodeLabel: "الرابط أو النص المراد ترميزه",
      encodePlaceholder: "https://example.com — أو أي نص أو شبكة Wi‑Fi أو بيانات اتصال…",
      dotColor: "لون النقاط",
      background: "الخلفية",
      sizePx: "الحجم (بكسل)",
      errorCorrection: "تصحيح الأخطاء",
      errorHint: "يحافظ التصحيح الأعلى على قابلية المسح عند تغطية الرمز جزئيًا — ",
      seeFaq: "راجع الأسئلة الشائعة",
      downloadPng: "تنزيل PNG",
      downloadSvg: "تنزيل SVG",
      copyImage: "نسخ الصورة",
      scanCamera: "المسح بالكاميرا",
      startCamera: "بدء الكاميرا",
      stop: "إيقاف",
      decodeImage: "فك ترميز صورة",
      dropImage: "انقر أو أسقط صورة QR هنا",
      whyTitle: "لماذا تستخدم QR Maker & Reader بدلًا من مواقع QR التقليدية؟",
      feature: "الميزة",
      typicalSites: "مواقع QR التقليدية",
      faqTitle: "الأسئلة الشائعة حول QR",
      cliTitle: "تفضل سطر الأوامر؟",
      price: "السعر",
      freeForever: "مجاني دائمًا ومفتوح المصدر بترخيص MIT",
      limitedFree: "نسخة مجانية بحدود استخدام؛ رموز QR الديناميكية تنتهي",
      signup: "التسجيل",
      none: "لا يوجد",
      accountRequired: "غالبًا ما يُطلب حساب",
      adsTrackers: "الإعلانات وأدوات التتبع",
      zero: "صفر",
      adBanners: "لافتات إعلانية وإعادات توجيه وبكسلات تتبع",
      yourData: "بياناتك",
      neverUploaded: "لا يتم رفعها — يعمل داخل متصفحك",
      serverProcessed: "تتم معالجة المحتوى المرمّز على الخادم",
      qrLifespan: "العمر المطلوب لرمز QR",
      permanentStatic: "دائم (ثابت)",
      dynamicStop: "قد تتوقف روابط QR الديناميكية عن العمل",
      faqFreeQuestion: "هل منشئ رموز QR هذا مجاني حقًا؟",
      faqFreeAnswer: "نعم — مجاني 100٪ بلا تسجيل أو حسابات أو إعلانات أو حدود. <a href=\"https://github.com/nazsa13/QR-Maker-Reader\" rel=\"noopener noreferrer\" target=\"_blank\">الشفرة المصدرية مرخصة بترخيص MIT ومتاحة على GitHub</a>، ويمكنك تشغيلها محليًا.",
      faqPrivacyQuestion: "هل رموز QR الخاصة بي آمنة؟ هل يتم رفع بياناتي؟",
      faqPrivacyAnswer: "يعمل التطبيق بالكامل على جهازك. لا تغادر إطارات الكاميرا أو أي نص ترمّزه جهازك — لا رفع ولا تتبع لمحتوى QR الخاص بك.",
      faqDamageQuestion: "ما مقدار التلف الذي يمكن لرمز QR تحمله؟",
      faqDamageAnswer: "وفقًا لمواصفة تصحيح أخطاء QR ‏(ISO/IEC 18004)، يمكن للمستويات L وM وQ وH استعادة كلمات بيانات متضررة بنسبة تقريبية <strong>7٪ و15٪ و25٪ و30٪</strong> على التوالي. اختر <strong>H</strong> إذا كان الرمز قد يُغطى جزئيًا أو يُطبع بحجم صغير أو يُعرض على أسطح مهترئة.",
      faqBorderQuestion: "ما حجم الهامش الذي يجب أن يكون حول رمز QR؟",
      faqBorderAnswer: "تتطلب مواصفة QR منطقة هادئة لا تقل عن <strong>4 وحدات</strong> حول الرمز حتى تتمكن الماسحات من تحديد حوافه. تستخدم هذه الأداة هامشًا من 4 وحدات افتراضيًا؛ وغالبًا يفشل المسح بأقل من ذلك.",
      faqFormatQuestion: "PNG أم SVG — أيهما أستخدم؟",
      faqFormatAnswer: "استخدم <strong>SVG للطباعة</strong> (الملصقات وبطاقات العمل) لأنه يتدرج لأي حجم بوضوح تام. استخدم <strong>PNG للشاشات</strong> مثل صفحات الويب وتطبيقات المحادثة ومعاينات وسائل التواصل.",
      faqScanQuestion: "كيف أمسح رمز QR دون تثبيت تطبيق؟",
      faqScanAnswer: "افتح هذه الصفحة على هاتفك، وانتقل إلى <strong>مسح QR</strong> واسمح بالوصول إلى الكاميرا. يمكنك أيضًا فك ترميز QR من صورة محفوظة — ما عليك سوى إسقاطها في اللوحة.",
      cliDescription: "يتضمن <a href=\"https://github.com/nazsa13/QR-Maker-Reader\" rel=\"noopener noreferrer\" target=\"_blank\">مستودع QR Maker &amp; Reader</a> أداة سطر أوامر بلغة Python: ينشئ الأمر <code>python qr_cli.py generate \"https://example.com\" -o link.png</code> رمزًا، ويفك الأمر <code>python qr_cli.py read link.png</code> ترميزه — مع ضمان الخصوصية نفسه ودون الحاجة إلى متصفح.",
      github: "GitHub",
      madeBy: "صُنع بواسطة",
      footerBuilt: "مبني بلا <strong>أي أدوات تتبع</strong> · رموز QR التي تنشئها هنا لا تنتهي صلاحيتها",
    },
  };

  function applyLanguage(language) {
    currentLanguage = language === "ar" ? "ar" : "en";
    const strings = translations[currentLanguage];
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (strings[key]) element.textContent = strings[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const key = element.dataset.i18nHtml;
      if (strings[key]) element.innerHTML = strings[key];
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      element.dataset.i18nAttr.split(",").forEach((entry) => {
        const [attribute, key] = entry.split(":");
        if (attribute && key && strings[key]) element.setAttribute(attribute, strings[key]);
      });
    });
    languageLabel.textContent = strings.languageLabel;
    languageCurrent.textContent = strings.languageCurrent;
    languageToggle.setAttribute("aria-pressed", String(currentLanguage === "ar"));
    languageToggle.setAttribute("aria-label", currentLanguage === "ar" ? "Switch to English" : "التبديل إلى العربية");
    try { localStorage.setItem(LANGUAGE_KEY, currentLanguage); } catch (e) { /* ignore */ }
  }

  let savedLanguage = null;
  try { savedLanguage = localStorage.getItem(LANGUAGE_KEY); } catch (e) { /* ignore */ }
  applyLanguage(savedLanguage === "ar" ? "ar" : "en");
  languageToggle.addEventListener("click", () => {
    applyLanguage(currentLanguage === "ar" ? "en" : "ar");
  });

  /* ---------------- Theme toggle ---------------- */
  const themeToggle = $("theme-toggle");

  const THEME_KEY = "qr-maker-theme";
  const DARK = "theme-dark";
  const LIGHT = "theme-light";

  function applyTheme(theme) {
    document.body.classList.remove(DARK, LIGHT);
    document.body.classList.add(theme === "light" ? LIGHT : DARK);
    themeToggle.setAttribute("aria-pressed", String(theme === "light"));
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
  }

  function readSavedTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    if (saved === "light" || saved === "dark") return saved;
    return null;
  }

  if (readSavedTheme() === "light") {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }

  themeToggle.addEventListener("click", () => {
    const next = document.body.classList.contains(LIGHT) ? "dark" : "light";
    applyTheme(next);
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
  $("dl-svg").addEventListener("click", () => {
    const data = textEl.value.trim();
    if (!data) { setError(null, "Type a link or text first."); return; }
    window.QRCode.toString(data, {
      type: "svg",
      width: Math.min(Math.max(parseInt(sizeEl.value, 10) || 512, 128), 2048),
      margin: 4,
      errorCorrectionLevel: ecEl.value,
      color: { dark: fillEl.value, light: backEl.value },
    }, function (err, svg) {
      if (err) { setError(null, "⚠️ Export failed."); return; }
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.download = "qr-code.svg";
      a.href = URL.createObjectURL(blob);
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      setError(null, "✅ SVG downloaded.");
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
