(() => {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearNodes = document.querySelectorAll("[data-year]");
  const nowYear = new Date().getFullYear();
  yearNodes.forEach((n) => {
    n.textContent = String(nowYear);
  });

  const reveals = Array.from(document.querySelectorAll(".reveal"));
  reveals.forEach((el, index) => {
    el.style.setProperty("--reveal-delay", `${Math.min((index % 5) * 55, 220)}ms`);
  });
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  if (!prefersReducedMotion) {
    const progress = document.createElement("div");
    progress.className = "na-scroll-bridge";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    const river = document.querySelector(".noise-glow");
    const anchorSections = Array.from(
      document.querySelectorAll("[data-river-anchor]")
    );

    const anchorConfigs = {
      home: {
        aX: -0.8,
        aY: 0.4,
        bX: 0.6,
        bY: -0.3,
        cX: -0.4,
        cY: -0.8,
        sat: 1.03,
      },
      zenops: {
        aX: -1.6,
        aY: 0.6,
        bX: 1.2,
        bY: -0.4,
        cX: 0.4,
        cY: -1.2,
        sat: 1.07,
      },
      revalk: {
        aX: 0.5,
        aY: -0.2,
        bX: -0.8,
        bY: 0.5,
        cX: 0.9,
        cY: -0.4,
        sat: 1.02,
      },
      studio: {
        aX: -0.4,
        aY: 0.3,
        bX: 0.4,
        bY: -0.2,
        cX: -0.2,
        cY: -0.5,
        sat: 1.01,
      },
      footer: {
        aX: -1.0,
        aY: 0.7,
        bX: 0.8,
        bY: 0.3,
        cX: 0.1,
        cY: -0.9,
        sat: 1.0,
      },
    };

    const setRiverVars = (cfg, scrollRatio) => {
      if (!river || !cfg) return;
      const drift = (scrollRatio - 0.5) * 2; // -1..1
      river.style.setProperty("--river-a-x", `${(cfg.aX + drift * 0.45).toFixed(2)}%`);
      river.style.setProperty("--river-a-y", `${(cfg.aY + drift * -0.25).toFixed(2)}%`);
      river.style.setProperty("--river-b-x", `${(cfg.bX + drift * -0.35).toFixed(2)}%`);
      river.style.setProperty("--river-b-y", `${(cfg.bY + drift * 0.2).toFixed(2)}%`);
      river.style.setProperty("--river-c-x", `${(cfg.cX + drift * 0.3).toFixed(2)}%`);
      river.style.setProperty("--river-c-y", `${(cfg.cY + drift * -0.18).toFixed(2)}%`);
      river.style.setProperty("--river-sat", String(cfg.sat));
    };

    const pickAnchor = () => {
      if (!anchorSections.length) return "home";
      const viewportCenter = window.innerHeight * 0.42;
      let winner = null;
      let bestDistance = Infinity;
      for (const section of anchorSections) {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          winner = section.getAttribute("data-river-anchor") || "home";
        }
      }
      return winner || "home";
    };

    const syncProgress = () => {
      const root = document.documentElement;
      const max = Math.max(root.scrollHeight - root.clientHeight, 1);
      const value = Math.min(Math.max(window.scrollY / max, 0), 1);
      progress.style.setProperty("--progress", value.toFixed(4));

      const anchor = pickAnchor();
      setRiverVars(anchorConfigs[anchor] || anchorConfigs.home, value);
    };

    syncProgress();
    window.addEventListener("scroll", syncProgress, { passive: true });
    window.addEventListener("resize", syncProgress);
  }

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll(".nav a[data-match]").forEach((link) => {
    const match = link.getAttribute("data-match");
    if (!match) return;
    const isMatch = match === "/" ? path === "/" : path.startsWith(match);
    if (isMatch) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll("[data-chip-rail]").forEach((rail) => {
    const chips = Array.from(rail.querySelectorAll(".chip"));
    if (!chips.length) return;

    let current = 0;
    const cycleMs = Number(rail.getAttribute("data-cycle-ms")) || 1800;
    const setActive = (next) => {
      chips.forEach((chip, index) => {
        if (index === next) {
          chip.setAttribute("data-active", "true");
        } else {
          chip.removeAttribute("data-active");
        }
      });
    };

    setActive(current);

    if (prefersReducedMotion || chips.length < 2) return;

    window.setInterval(() => {
      current = (current + 1) % chips.length;
      setActive(current);
    }, cycleMs);
  });

  document.querySelectorAll(".workflow-strip").forEach((strip) => {
    const steps = Array.from(strip.querySelectorAll(".workflow-step"));
    if (!steps.length) return;

    const setActiveStep = (index) => {
      steps.forEach((step, i) => {
        if (i === index) {
          step.setAttribute("data-active", "true");
        } else {
          step.removeAttribute("data-active");
        }
      });
    };

    setActiveStep(0);
    if (prefersReducedMotion || steps.length < 2) return;

    let timer = null;
    let current = 0;

    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        current = (current + 1) % steps.length;
        setActiveStep(current);
      }, 1350);
    };

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.45 }
      );
      observer.observe(strip);
    } else {
      start();
    }
  });

  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const root = button.closest(".faq");
      if (!root) return;
      const open = root.getAttribute("data-open") === "true";
      root.setAttribute("data-open", String(!open));
      button.setAttribute("aria-expanded", String(!open));
    });
  });

  function track(name, detail = {}) {
    const payload = {
      event: name,
      source: "not-alone-studios-site",
      path: window.location.pathname,
      ...detail,
    };
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
    window.dispatchEvent(new CustomEvent("na-track", { detail: payload }));
    if (window.console && console.debug) {
      console.debug("[track]", payload);
    }
  }

  window.naTrack = track;

  document.querySelectorAll("[data-track]").forEach((el) => {
    el.addEventListener("click", () => {
      const name = el.getAttribute("data-track");
      if (name) track(name, { kind: "click" });
    });
  });

  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const action = form.getAttribute("action");
      if (!action || action === "#") {
        event.preventDefault();
        const output = form.querySelector("[data-form-output]");
        if (output) {
          output.textContent =
            "Form is in demo mode. Connect this to your Hostinger/PHP or external form endpoint when ready.";
        }
      }

      const eventName = form.getAttribute("data-track-submit");
      if (eventName) {
        track(eventName, { kind: "submit" });
      }
    });
  });
})();
