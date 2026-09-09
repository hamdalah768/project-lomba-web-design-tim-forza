(function () {
  "use strict";

  var SESSION_KEY = "lokanaik_session_v1";
  var DRAFT_KEY = "lokanaik_catalog_draft_v1";
  var PROGRESS_KEY = "lokanaik_progress_v1";
  var SAFE_NEXT = ["index.html", "search.html", "learn.html", "path.html", "studio.html", "stories.html", "brand.html"];

  function byId(id) { return document.getElementById(id); }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function setSession(provider, name) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        provider: provider,
        name: name,
        createdAt: new Date().toISOString()
      }));
    } catch (error) {
      // A private browsing environment may block storage. The UI still works.
    }
  }

  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (error) { /* no-op */ }
  }

  function safeNext() {
    var next = new URLSearchParams(window.location.search).get("next");
    return SAFE_NEXT.indexOf(next) >= 0 ? next : "index.html";
  }

  function currentFile() {
    var file = window.location.pathname.split("/").pop();
    return file || "index.html";
  }

  function showToast(title, message, tone) {
    var region = byId("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    var toast = document.createElement("div");
    toast.className = "toast";
    if (tone === "success") toast.style.borderColor = "rgba(183,231,122,.55)";
    if (tone === "error") toast.style.borderColor = "rgba(255,130,112,.55)";
    var icon = document.createElement("span");
    icon.textContent = tone === "error" ? "!" : tone === "success" ? "✓" : "✦";
    icon.style.color = tone === "error" ? "var(--coral)" : tone === "success" ? "var(--lime)" : "var(--gold)";
    icon.style.fontWeight = "900";
    var copy = document.createElement("div");
    var heading = document.createElement("strong");
    heading.textContent = title;
    var body = document.createElement("p");
    body.textContent = message;
    copy.appendChild(heading);
    copy.appendChild(body);
    toast.appendChild(icon);
    toast.appendChild(copy);
    region.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add("out");
      window.setTimeout(function () { toast.remove(); }, 260);
    }, 4200);
  }

  function applySessionUI() {
    var session = getSession();
    document.querySelectorAll("[data-session-label]").forEach(function (node) {
      node.textContent = session ? session.name : "Masuk / Profil";
    });
    document.querySelectorAll("[data-session-status]").forEach(function (node) {
      node.textContent = session ? "Tervalidasi • Sesi lokal" : "Tamu • Sesi lokal";
    });
    document.querySelectorAll("[data-logout]").forEach(function (node) {
      node.hidden = !session;
    });
  }

  function goToLogin() {
    var next = currentFile();
    if (SAFE_NEXT.indexOf(next) < 0) next = "index.html";
    window.location.href = "login.html?next=" + encodeURIComponent(next);
  }

  function setupNavigation() {
    var page = document.body.getAttribute("data-page") || currentFile().replace(".html", "");
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var isActive = link.getAttribute("data-nav") === page;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    var menuToggle = byId("menu-toggle");
    var mobileNav = byId("mobile-nav");
    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
      });
      mobileNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          mobileNav.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    document.querySelectorAll("[data-open-search]").forEach(function (button) {
      button.addEventListener("click", function () { window.location.href = "search.html"; });
    });

    document.querySelectorAll("[data-notification]").forEach(function (button) {
      button.addEventListener("click", function () {
        showToast("Pusat notifikasi", "Belum ada notifikasi baru. Progress terakhir tersimpan di perangkat ini.", "success");
      });
    });

    document.querySelectorAll("[data-profile]").forEach(function (button) {
      button.addEventListener("click", function () {
        var session = getSession();
        if (!session) {
          showToast("Sesi belum aktif", "Masuk dengan sesi lokal untuk menyimpan progress lokal.");
          window.setTimeout(goToLogin, 450);
          return;
        }
        showToast("Profil aktif", session.name + " • login " + session.provider + " tersimpan untuk sesi ini.", "success");
      });
    });

    document.querySelectorAll("[data-logout]").forEach(function (button) {
      button.addEventListener("click", function () {
        clearSession();
        applySessionUI();
        showToast("Sesi diakhiri", "Data kredensial tidak disimpan oleh demo ini.", "success");
      });
    });

    document.querySelectorAll("[data-require-session]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (!getSession()) {
          event.preventDefault();
          showToast("Masuk diperlukan", "Silakan aktifkan sesi lokal sebelum memakai fitur ini.");
          window.setTimeout(goToLogin, 500);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        window.location.href = "search.html";
      }
    });
  }

  function setupReveal() {
    var nodes = document.querySelectorAll(".reveal");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries, instance) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function setupTilt() {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll("[data-tilt]").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - .5;
        var y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = "perspective(900px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  function setupAuth() {
    var authRoot = byId("auth-root");
    if (!authRoot) return;

    var tabs = document.querySelectorAll("[data-auth-tab]");
    var emailSection = byId("email-section");
    var phoneSection = byId("phone-section");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-auth-tab");
        tabs.forEach(function (item) { item.classList.toggle("active", item === tab); });
        if (emailSection) emailSection.classList.toggle("hidden", target !== "email");
        if (phoneSection) phoneSection.classList.toggle("active", target === "phone");
      });
    });

    document.querySelectorAll("[data-demo-provider]").forEach(function (button) {
      button.addEventListener("click", function () {
        var provider = button.getAttribute("data-demo-provider");
        var names = { Google: "Akun Google", Facebook: "Akun Facebook", Apple: "Akun Apple" };
        showToast("Menghubungkan " + provider, "Ini hanya demo OAuth lokal; tidak ada kredensial yang dikirim atau disimpan.");
        window.setTimeout(function () {
          setSession(provider.toLowerCase(), names[provider] || "Akun LokaNaik");
          window.location.href = safeNext();
        }, 850);
      });
    });

    var emailForm = byId("email-form");
    if (emailForm) {
      emailForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var email = byId("email");
        var password = byId("password");
        if (!email || !password || !email.checkValidity()) {
          showToast("Email belum valid", "Gunakan format email yang benar.", "error");
          if (email) email.focus();
          return;
        }
        if (password.value.length < 8) {
          showToast("Kata sandi terlalu pendek", "Demo memerlukan minimal 8 karakter dan tidak menyimpan kata sandi.", "error");
          password.focus();
          return;
        }
        var localName = email.value.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
        showToast("Login berhasil", "Tidak ada kata sandi yang disimpan. Mengalihkan ke panggung usaha…", "success");
        setSession("email", localName || "Akun LokaNaik");
        window.setTimeout(function () { window.location.href = safeNext(); }, 650);
      });
    }

    var phoneForm = byId("phone-form");
    var otpForm = byId("otp-form");
    var otpBox = byId("otp-box");
    var otpPreview = byId("otp-preview");
    var activePhone = "";
    if (phoneForm) {
      phoneForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var phone = byId("phone");
        if (!phone || !/^(?:\+62|08)[0-9]{8,13}$/.test(phone.value.replace(/[\s-]/g, ""))) {
          showToast("Nomor belum valid", "Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxx.", "error");
          if (phone) phone.focus();
          return;
        }
        activePhone = phone.value.replace(/[\s-]/g, "");
        var random = new Uint32Array(1);
        if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(random);
        else random[0] = Math.floor(Math.random() * 1000000);
        var code = String(random[0] % 1000000).padStart(6, "0");
        try { sessionStorage.setItem("lokanaik_demo_otp", code); } catch (error) { /* no-op */ }
        if (otpPreview) otpPreview.textContent = code;
        if (otpBox) otpBox.classList.add("visible");
        showToast("OTP dibuat", "Kode hanya tampil karena ini simulasi lokal; SMS sungguhan belum terhubung.", "success");
      });
    }
    if (otpForm) {
      otpForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var otp = byId("otp");
        var expected = "";
        try { expected = sessionStorage.getItem("lokanaik_demo_otp") || ""; } catch (error) { /* no-op */ }
        if (!otp || otp.value !== expected || !expected) {
          showToast("OTP tidak cocok", "Gunakan kode demo yang tampil di panel OTP.", "error");
          return;
        }
        setSession("phone", activePhone || "Akun via HP");
        showToast("Nomor terverifikasi", "Sesi demo aktif. Mengalihkan…", "success");
        window.setTimeout(function () { window.location.href = safeNext(); }, 650);
      });
    }

    document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var input = byId(button.getAttribute("data-password-toggle"));
        if (!input) return;
        var visible = input.type === "text";
        input.type = visible ? "password" : "text";
        button.textContent = visible ? "◉" : "○";
        button.setAttribute("aria-label", visible ? "Tampilkan kata sandi" : "Sembunyikan kata sandi");
      });
    });

    document.querySelectorAll("[data-forgot]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        showToast("Pemulihan akun belum tersambung", "Pada produksi, hubungkan alur reset password di backend/OAuth provider.");
      });
    });
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
    if (!input || !cards.length) return;
    var activeFilter = "all";
    var count = byId("result-count");
    var emptyState = byId("empty-state");
    function run() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.textContent + " " + (card.getAttribute("data-category") || "")).toLowerCase();
        var category = (card.getAttribute("data-category") || "all").toLowerCase();
        var matches = (!query || text.indexOf(query) >= 0) && (activeFilter === "all" || category.indexOf(activeFilter) >= 0);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      if (count) count.textContent = visible + " modul ditemukan";
      if (emptyState) emptyState.hidden = visible !== 0;
    }
    input.addEventListener("input", run);
    document.querySelectorAll("[data-search-filter]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = chip.getAttribute("data-search-filter") || "all";
        document.querySelectorAll("[data-search-filter]").forEach(function (item) { item.classList.toggle("active", item === chip); });
        run();
      });
    });
    document.querySelectorAll("[data-search-suggestion]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-search-suggestion") || "";
        run();
        input.focus();
      });
    });
    run();
  }

  function readProgress() {
    try {
      var raw = localStorage.getItem(PROGRESS_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveProgress(items) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(items)); } catch (error) { /* no-op */ }
  }

  function setupProgress() {
    var progress = readProgress();
    document.querySelectorAll("[data-progress-check]").forEach(function (input) {
      var key = input.getAttribute("data-progress-check");
      input.checked = progress.indexOf(key) >= 0;
      input.addEventListener("change", function () {
        var next = readProgress();
        if (input.checked && next.indexOf(key) < 0) next.push(key);
        if (!input.checked) next = next.filter(function (item) { return item !== key; });
        saveProgress(next);
        updateProgressUI();
        showToast(input.checked ? "Progress tersimpan" : "Progress diperbarui", input.checked ? "Langkah ditandai selesai di perangkat ini." : "Tanda selesai dihapus.", "success");
      });
    });
    updateProgressUI();
  }

  function updateProgressUI() {
    var progress = readProgress();
    var checks = document.querySelectorAll("[data-progress-check]").length;
    var done = document.querySelectorAll("[data-progress-check]:checked").length;
    var percent = checks ? Math.round((done / checks) * 100) : Math.min(100, progress.length * 12);
    document.querySelectorAll("[data-progress-value]").forEach(function (node) { node.textContent = percent + "%"; });
    document.querySelectorAll("[data-progress-bar]").forEach(function (bar) { bar.style.width = percent + "%"; });
  }

  function setupStudio() {
    var studio = byId("studio-root");
    if (!studio) return;
    var state = { image: "" };
    var nameInput = byId("product-name");
    var descInput = byId("product-description");
    var priceInput = byId("product-price");
    var categoryInput = byId("product-category");
    var previewName = byId("preview-name");
    var previewDescription = byId("preview-description");
    var previewPrice = byId("preview-price");
    var previewCategory = byId("preview-category");
    var previewSize = byId("preview-size");
    var previewStatus = byId("preview-status");

    function formatPrice(value) {
      var digits = String(value || "").replace(/[^0-9]/g, "");
      return digits ? "Rp " + new Intl.NumberFormat("id-ID").format(Number(digits)) : "Rp 0";
    }
    function update() {
      if (previewName && nameInput) previewName.textContent = nameInput.value.trim() || "Nama Produk Lokal";
      if (previewDescription && descInput) previewDescription.textContent = descInput.value.trim() || "Deskripsi singkat produk dengan cerita dan kualitas lokal.";
      if (previewPrice && priceInput) previewPrice.textContent = formatPrice(priceInput.value);
      if (previewCategory && categoryInput) previewCategory.textContent = categoryInput.value || "Fashion & Kriya";
    }
    studio.querySelectorAll("[data-product-field]").forEach(function (input) { input.addEventListener("input", update); input.addEventListener("change", update); });
    studio.querySelectorAll("[data-preview-choice]").forEach(function (input) {
      input.addEventListener("change", function () {
        var target = input.getAttribute("data-preview-choice");
        if (target === "size" && previewSize) previewSize.textContent = input.value;
        if (target === "status" && previewStatus) previewStatus.textContent = input.value;
      });
    });

    var fileInput = byId("product-image");
    var previewImage = byId("preview-image");
    var productImage = byId("product-image-frame");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
          showToast("File ditolak", "Pilih gambar JPG/PNG/WebP maksimal 5 MB.", "error");
          fileInput.value = "";
          return;
        }
        var reader = new FileReader();
        reader.onload = function () {
          state.image = String(reader.result || "");
          if (previewImage) { previewImage.src = state.image; previewImage.alt = "Pratinjau produk"; }
          if (productImage) productImage.classList.add("has-image");
          showToast("Foto siap", "Pratinjau katalog diperbarui di perangkat ini.", "success");
        };
        reader.readAsDataURL(file);
      });
    }

    var saveButton = byId("save-draft");
    if (saveButton) saveButton.addEventListener("click", function () {
      var draft = {
        name: nameInput ? nameInput.value : "",
        description: descInput ? descInput.value : "",
        price: priceInput ? priceInput.value : "",
        category: categoryInput ? categoryInput.value : "",
        savedAt: new Date().toISOString()
      };
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (error) { /* no-op */ }
      showToast("Draft tersimpan", "Draft katalog disimpan lokal tanpa mengirim data ke server.", "success");
    });

    try {
      var saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved) {
        if (nameInput) nameInput.value = saved.name || "";
        if (descInput) descInput.value = saved.description || "";
        if (priceInput) priceInput.value = saved.price || "";
        if (categoryInput) categoryInput.value = saved.category || "Fashion & Kriya";
        update();
      }
    } catch (error) { /* no-op */ }

    var copyButton = byId("copy-product-link");
    if (copyButton) copyButton.addEventListener("click", function () {
      var name = nameInput && nameInput.value ? nameInput.value : "produk-lokal";
      var link = window.location.href.split("?")[0] + "?produk=" + encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(function () { showToast("Link disalin", "Link pratinjau siap dibagikan.", "success"); }).catch(function () { showToast("Link siap", link); });
      } else showToast("Link siap", link);
    });

    var whatsappButton = byId("whatsapp-product");
    if (whatsappButton) whatsappButton.addEventListener("click", function () {
      var name = nameInput && nameInput.value ? nameInput.value : "Produk Lokal";
      var price = priceInput && priceInput.value ? formatPrice(priceInput.value) : "hubungi penjual";
      var message = "Halo, saya tertarik dengan " + name + ". Harga: " + price + ".";
      window.open("https://wa.me/?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
    });

    var downloadButton = byId("download-card");
    if (downloadButton) downloadButton.addEventListener("click", function () {
      var name = nameInput && nameInput.value ? nameInput.value : "Produk Lokal";
      var desc = descInput && descInput.value ? descInput.value : "Produk pilihan dari pelaku usaha lokal.";
      var price = priceInput && priceInput.value ? formatPrice(priceInput.value) : "Rp 0";
      var category = categoryInput && categoryInput.value ? categoryInput.value : "Fashion & Kriya";
      var imageBlock = state.image ? '<img src="' + escapeHtml(state.image) + '" alt="Produk" />' : '<div class="mock">LOKANAIK</div>';
      var html = '<!doctype html><html lang="id"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(name) + ' • LokaNaik</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#070a16;color:#f8f3e6;font:16px Arial,sans-serif}.card{width:min(92vw,460px);overflow:hidden;border:1px solid #a8792d;border-radius:24px;background:#151e3a;box-shadow:0 25px 70px #000;padding-bottom:20px}.image{height:270px;display:grid;place-items:center;background:linear-gradient(135deg,#1a2444,#5b482b)}.image img{width:100%;height:100%;object-fit:cover}.mock{font-size:28px;font-weight:bold;color:#f6d36c}.copy{padding:22px}.tag{color:#b7e77a;font-size:11px;font-weight:bold;letter-spacing:.1em;text-transform:uppercase}.price{color:#ffe99a;font-size:28px;font-weight:bold;margin-top:20px}</style><article class="card"><div class="image">' + imageBlock + '</div><div class="copy"><div class="tag">' + escapeHtml(category) + '</div><h1>' + escapeHtml(name) + '</h1><p>' + escapeHtml(desc) + '</p><div class="price">' + escapeHtml(price) + '</div></div></article></html>';
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "lokanaik-kartu-produk.html";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showToast("Kartu diunduh", "File HTML katalog berhasil dibuat di perangkat ini.", "success");
    });
    update();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function setupModal() {
    var modal = byId("app-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "app-modal";
      modal.className = "modal-backdrop";
      modal.hidden = true;
      modal.innerHTML = '<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title"></h2><p id="modal-copy"></p></div><button class="modal-close" type="button" data-modal-close aria-label="Tutup">×</button></div><div class="modal-content" id="modal-content"></div><div class="modal-actions"><button class="button gold small" type="button" data-modal-close>Tutup</button></div></section>';
      document.body.appendChild(modal);
    }
    function close() { modal.hidden = true; }
    modal.querySelectorAll("[data-modal-close]").forEach(function (button) { button.addEventListener("click", close); });
    modal.addEventListener("click", function (event) { if (event.target === modal) close(); });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape" && !modal.hidden) close(); });
    document.querySelectorAll("[data-modal-title]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        byId("modal-title").textContent = trigger.getAttribute("data-modal-title") || "Info LokaNaik";
        byId("modal-copy").textContent = trigger.getAttribute("data-modal-copy") || "";
        var content = byId("modal-content");
        content.textContent = "";
        var extra = trigger.getAttribute("data-modal-extra");
        if (extra) {
          var note = document.createElement("div");
          note.className = "security-note";
          note.textContent = extra;
          content.appendChild(note);
        }
        modal.hidden = false;
      });
    });
  }

  function setupStoryCards() {
    document.querySelectorAll("[data-story-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var title = button.getAttribute("data-story-title") || "Cerita lokal";
        var copy = button.getAttribute("data-story-copy") || "Kisah pelaku usaha lokal yang terus bertumbuh.";
        var modal = byId("app-modal");
        if (modal) {
          byId("modal-title").textContent = title;
          byId("modal-copy").textContent = copy;
          byId("modal-content").textContent = "Insight utama: mulai dari kualitas produk, dokumentasi yang rapi, dan satu langkah digital yang bisa diulang setiap hari.";
          modal.hidden = false;
        }
      });
    });
  }

  function setupStoryFilter() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-story-card]"));
    var filters = document.querySelectorAll("[data-story-filter]");
    if (!cards.length || !filters.length) return;
    filters.forEach(function (filter) {
      filter.addEventListener("click", function () {
        var selected = filter.getAttribute("data-story-filter") || "all";
        filters.forEach(function (item) { item.classList.toggle("active", item === filter); });
        var visible = 0;
        cards.forEach(function (card) {
          var category = card.getAttribute("data-category") || "";
          var show = selected === "all" || category.indexOf(selected) >= 0;
          card.hidden = !show;
          if (show) visible += 1;
        });
        var count = byId("story-count");
        if (count) count.textContent = visible + " cerita tampil";
      });
    });
  }

  function setupActions() {
    document.querySelectorAll("[data-toast]").forEach(function (button) {
      button.addEventListener("click", function () {
        showToast(button.getAttribute("data-toast-title") || "Aksi berhasil", button.getAttribute("data-toast") || "Perubahan diproses.", "success");
      });
    });
    document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = byId(button.getAttribute("data-scroll-target"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applySessionUI();
    setupNavigation();
    setupReveal();
    setupTilt();
    setupAuth();
    setupSearch();
    setupProgress();
    setupStudio();
    setupModal();
    setupStoryCards();
    setupStoryFilter();
    setupActions();
  });
})();
