/* =========================
   FÄM — app.js
   Works with your index.html + styles.css
   ========================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------- Helpers ----------
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // ---------- Age gate ----------
  const AGE_KEY = "fam_age_verified_v1";

  function setupAgeGate() {
    const ageGate = $("#agegate");
    const ageYes = $("#age-yes");

    if (!ageGate || !ageYes) return;

    const show = () => {
      ageGate.style.display = "grid"; // matches CSS (place-items)
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };

    const hide = () => {
      ageGate.style.display = "none";
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };

    // Show gate unless verified
    const verified = localStorage.getItem(AGE_KEY) === "true";
    if (!verified) show();
    else hide();

    ageYes.addEventListener("click", () => {
      localStorage.setItem(AGE_KEY, "true");
      hide();
    });

    // Optional: allow ESC to close only if already verified (avoid bypass)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && localStorage.getItem(AGE_KEY) === "true") hide();
    });
  }

  // ---------- Mobile nav / Burger ----------
  function setupNav() {
    const burger = $("#burger");
    const navlinks = $("#navlinks");
    if (!burger || !navlinks) return;

    const open = () => {
      navlinks.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
    };

    const close = () => {
      navlinks.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    };

    const toggle = () => {
      navlinks.classList.contains("open") ? close() : open();
    };

    burger.addEventListener("click", toggle);

    // Close on link click (mobile)
    navlinks.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      close();
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!navlinks.classList.contains("open")) return;
      const insideNav = e.target.closest("#navlinks");
      const insideBurger = e.target.closest("#burger");
      if (!insideNav && !insideBurger) close();
    });

    // Close on resize up (when desktop menu shows)
    window.addEventListener("resize", () => {
      if (window.innerWidth > 720) close();
    });
  }

  // ---------- Products (inject cards) ----------
  function setupProducts() {
    const productsWrap = $("#products");
    if (!productsWrap) return;

    // Use assets you already referenced in HTML.
    // If you add more images later, just extend this array.
    const products = [
      {
        name: "FÄM Original",
        desc: "Värske ja kerge sparkling cocktail. Parim jääkülmalt.",
        img: "assets/fam-can-orange.png",
        badges: ["5.5% vol", "330 ml", "Serve cold"],
      },
      {
        name: "FÄM Green Series",
        desc: "Roheline seeria — hetkede jook, mis sobib nii peole kui rahulikuks õhtuks.",
        img: "assets/fam-cans-green.png",
        badges: ["Kihisev", "Kerge", "Party-ready"],
      },
      {
        name: "FÄM Orange",
        desc: "Tsitruselisem vibe. Hea jääga highball’ina.",
        img: "assets/fam-can-orange.png",
        badges: ["Citrus", "Ice", "Simple"],
      },
    ];

    const cards = products
      .map((p) => {
        const badgeHtml = (p.badges || [])
          .slice(0, 4)
          .map((b) => `<span class="badge">${escapeHtml(b)}</span>`)
          .join("");

        return `
          <article class="product-card reveal">
            <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy" />
            <h3>${escapeHtml(p.name)}</h3>
            <p class="muted" style="margin-top:8px; line-height:1.6;">
              ${escapeHtml(p.desc)}
            </p>
            <div class="product-meta">${badgeHtml}</div>
          </article>
        `;
      })
      .join("");

    productsWrap.innerHTML = cards;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ---------- Reveal on scroll ----------
  function setupReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    // If browser doesn't support IO, just show all
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        });
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => obs.observe(el));
  }

  // ---------- Footer year ----------
  function setupYear() {
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  // ---------- Contact form (client-side only) ----------
  function setupContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Basic validation (browser already does required/email)
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !email || !message) return;

      // Lightweight UX feedback
      const btn = form.querySelector('button[type="submit"]');
      const oldText = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Saadetud ✓";
      }

      // Reset after a moment
      window.setTimeout(() => {
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = oldText || "Saada";
        }
      }, 1400);
    });
  }

  // ---------- Init ----------
  document.addEventListener("DOMContentLoaded", () => {
    setupAgeGate();
    setupNav();
    setupProducts();
    setupYear();
    setupContactForm();

    // Reveal must be after products injected (so their cards animate too)
    setupReveal();
  });
})();
