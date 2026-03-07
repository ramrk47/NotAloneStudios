(() => {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearNodes = document.querySelectorAll("[data-year]");
  const nowYear = new Date().getFullYear();
  yearNodes.forEach((n) => {
    n.textContent = String(nowYear);
  });

  if (prefersReducedMotion) {
    document.querySelectorAll("video[data-decorative-video]").forEach((video) => {
      try {
        video.pause();
        video.removeAttribute("autoplay");
        video.currentTime = 0;
      } catch {
        // no-op
      }
    });
  }

  const heroSection = document.querySelector(".hero");
  const heroLiving = document.querySelector("[data-hero-living]");
  const heroLivingVideo = heroLiving
    ? heroLiving.querySelector("video[data-hero-living-video]")
    : null;

  const setHeroLivingVars = (open, visible) => {
    if (!heroLiving) return;
    heroLiving.style.setProperty(
      "--hero-video-open",
      String(Math.min(Math.max(open, 0), 1).toFixed(4))
    );
    heroLiving.style.setProperty(
      "--hero-video-visible",
      String(Math.min(Math.max(visible, 0), 1).toFixed(4))
    );
  };

  const syncHeroLivingVisual = (globalProgress = 0) => {
    if (!heroLiving || !heroSection || prefersReducedMotion) return;
    const rect = heroSection.getBoundingClientRect();
    const viewportH = Math.max(window.innerHeight || 0, 1);
    const visiblePx = Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0);
    const visible = Math.min(Math.max(visiblePx / Math.max(Math.min(rect.height, viewportH), 1), 0), 1);
    const unlockWindow = Math.max(Math.min(viewportH * 0.28, rect.height * 0.36), 1);
    const localBoot = Math.min(
      Math.max((-rect.top + viewportH * 0.06) / unlockWindow, 0),
      1
    );
    const bridgeBoot = Math.min(Math.max(globalProgress / 0.28, 0), 1);
    const open = Math.min(Math.max(localBoot * 0.72 + bridgeBoot * 0.28, 0), 1);
    setHeroLivingVars(open, visible);
  };

  const syncHeroLivingPlayback = () => {
    if (!heroLiving || !heroLivingVideo || prefersReducedMotion) return;
    const visible = heroLiving.getAttribute("data-hero-visible") === "true";
    const shouldPlay = visible && document.visibilityState !== "hidden";
    heroLiving.setAttribute("data-video-playing", String(shouldPlay));
    try {
      if (shouldPlay) {
        const maybePromise = heroLivingVideo.play();
        if (maybePromise && typeof maybePromise.catch === "function") {
          maybePromise.catch(() => { });
        }
      } else {
        heroLivingVideo.pause();
      }
    } catch {
      // no-op
    }
  };

  if (heroLiving) {
    heroLiving.setAttribute("data-video-playing", "false");
    heroLiving.setAttribute("data-hero-visible", "false");
    if (prefersReducedMotion) {
      setHeroLivingVars(0.18, 0.9);
    }
  }

  if (heroSection && heroLiving && heroLivingVideo && !prefersReducedMotion) {
    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            heroLiving.setAttribute(
              "data-hero-visible",
              String(entry.isIntersecting && entry.intersectionRatio > 0.08)
            );
          });
          syncHeroLivingPlayback();
        },
        { threshold: [0, 0.08, 0.2, 0.4] }
      );
      heroObserver.observe(heroSection);
    } else {
      heroLiving.setAttribute("data-hero-visible", "true");
      syncHeroLivingPlayback();
    }

    document.addEventListener("visibilitychange", syncHeroLivingPlayback);
    window.addEventListener("pagehide", () => {
      try {
        heroLivingVideo.pause();
      } catch {
        // no-op
      }
    });
  }

  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const revealStaggerGroups = new Map();
  reveals.forEach((el) => {
    // Stagger reveals locally within their container to avoid page-wide delays.
    const group =
      el.closest("[data-stagger-root]") || el.parentElement || document.body;
    const groupIndex = revealStaggerGroups.get(group) || 0;
    const delay = el.classList.contains("is-visible")
      ? 0
      : Math.min(groupIndex * 70, 280);
    revealStaggerGroups.set(group, groupIndex + 1);
    el.style.setProperty("--reveal-delay", `${delay}ms`);
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
    // Safety fallback: force-show reveals that haven't triggered after 1.8s
    setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains("is-visible")) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }, 1800);
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
      syncHeroLivingVisual(value);
    };

    syncProgress();
    window.addEventListener("scroll", syncProgress, { passive: true });
    window.addEventListener("resize", syncProgress);
  }

  if (!prefersReducedMotion) {
    syncHeroLivingVisual(0);
    syncHeroLivingPlayback();
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

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    if (!slides.length) return;

    const dotButtons = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const autoplayMs = Number(carousel.getAttribute("data-autoplay-ms")) || 7000;
    let current = Math.max(
      0,
      slides.findIndex((slide) => slide.getAttribute("data-active") === "true")
    );
    if (current < 0) current = 0;
    let timer = null;
    let resumeTimer = null;
    let isVisible = true;
    let isTransitioning = false;
    let isHovering = false;
    let isFocusInside = false;
    let touchPauseUntil = 0;

    // Expose autoplay duration as CSS custom property for progress bar
    carousel.style.setProperty("--carousel-autoplay-ms", `${autoplayMs}ms`);

    const syncSlideMedia = () => {
      slides.forEach((slide, index) => {
        const video = slide.querySelector("[data-carousel-slide-video]");
        if (!(video instanceof HTMLVideoElement)) return;
        const shouldPlay =
          !prefersReducedMotion && isVisible && index === current && slide.getAttribute("data-active") === "true";
        try {
          if (shouldPlay) {
            const p = video.play();
            if (p && typeof p.catch === "function") p.catch(() => { });
          } else {
            video.pause();
          }
        } catch {
          // no-op
        }
      });
    };

    const setActive = (nextIndex, direction) => {
      const resolved = (nextIndex + slides.length) % slides.length;
      if (resolved === current && slides.length > 1) return;
      if (isTransitioning) return;

      // Determine direction if not explicitly provided
      const dir = direction || (resolved > current ? "next" : "prev");

      // Mark the outgoing slide
      const outgoing = slides[current];
      outgoing.setAttribute("data-leaving", dir);
      outgoing.setAttribute("data-active", "false");
      outgoing.setAttribute("aria-hidden", "true");

      // Set carousel direction so CSS can position the incoming slide
      carousel.setAttribute("data-direction", dir);

      // Force a reflow so the incoming slide starts from the correct side
      void carousel.offsetHeight;

      // Remove direction immediately so the incoming slide transitions to center
      carousel.removeAttribute("data-direction");

      // Activate the new slide
      current = resolved;
      const incoming = slides[current];
      incoming.setAttribute("data-active", "true");
      incoming.setAttribute("aria-hidden", "false");

      // Update dots
      dotButtons.forEach((btn, index) => {
        btn.setAttribute("aria-pressed", String(index === current));
      });

      carousel.style.setProperty("--carousel-index", String(current));
      syncSlideMedia();

      // Clean up the leaving slide after transition
      isTransitioning = true;
      setTimeout(() => {
        outgoing.removeAttribute("data-leaving");
        isTransitioning = false;
      }, 540); // Matches CSS transition duration
    };

    const setPaused = (paused) => {
      carousel.setAttribute("data-paused", String(paused));
    };

    const clearResumeTimer = () => {
      if (!resumeTimer) return;
      window.clearTimeout(resumeTimer);
      resumeTimer = null;
    };

    const canAutoplay = () =>
      !prefersReducedMotion &&
      slides.length >= 2 &&
      isVisible &&
      !timer &&
      !isHovering &&
      !isFocusInside &&
      Date.now() >= touchPauseUntil;

    const stop = () => {
      clearResumeTimer();
      setPaused(true);
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (!canAutoplay()) return;
      setPaused(false);
      timer = window.setInterval(() => {
        setActive(current + 1, "next");
      }, autoplayMs);
    };

    const pauseForInteraction = (delayMs = Math.max(autoplayMs * 2, 12000)) => {
      touchPauseUntil = Date.now() + delayMs;
      stop();
      resumeTimer = window.setTimeout(() => {
        resumeTimer = null;
        start();
      }, delayMs);
    };

    prevButton?.addEventListener("click", () => {
      setActive(current - 1, "prev");
      pauseForInteraction();
    });

    nextButton?.addEventListener("click", () => {
      setActive(current + 1, "next");
      pauseForInteraction();
    });

    dotButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const raw = Number(btn.getAttribute("data-carousel-dot"));
        if (Number.isNaN(raw)) return;
        const dir = raw > current ? "next" : "prev";
        setActive(raw, dir);
        pauseForInteraction();
      });
    });

    // Pause on hover / focus
    carousel.addEventListener("mouseenter", () => {
      isHovering = true;
      stop();
    });
    carousel.addEventListener("mouseleave", () => {
      isHovering = false;
      start();
    });
    carousel.addEventListener("focusin", () => {
      isFocusInside = true;
      stop();
    });
    carousel.addEventListener("focusout", () => {
      isFocusInside = carousel.contains(document.activeElement);
      if (!isFocusInside) start();
    });

    // Keyboard arrow navigation
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive(current + 1, "next");
        pauseForInteraction();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive(current - 1, "prev");
        pauseForInteraction();
      }
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    carousel.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
      pauseForInteraction();
    }, { passive: true });

    carousel.addEventListener("touchend", (e) => {
      if (!isSwiping || !e.changedTouches.length) return;
      isSwiping = false;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only trigger if horizontal swipe > 40px and more horizontal than vertical
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) {
          setActive(current + 1, "next");
        } else {
          setActive(current - 1, "prev");
        }
      }
    }, { passive: true });

    carousel.addEventListener("touchcancel", () => {
      isSwiping = false;
      pauseForInteraction();
    }, { passive: true });

    // Visibility observer
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting && entry.intersectionRatio > 0.2;
          });
          syncSlideMedia();
          if (isVisible) start();
          else stop();
        },
        { threshold: [0, 0.2, 0.5] }
      );
      io.observe(carousel);
    }

    // Initialize
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.setAttribute("data-active", String(active));
      slide.setAttribute("aria-hidden", String(!active));
    });
    dotButtons.forEach((btn, index) => {
      btn.setAttribute("aria-pressed", String(index === current));
    });
    carousel.style.setProperty("--carousel-index", String(current));
    syncSlideMedia();
    start();
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

    strip.style.setProperty("--workflow-step-count", String(steps.length));

    const setActiveStep = (index) => {
      const travel =
        steps.length <= 1 ? 0 : Math.min(Math.max(index / (steps.length - 1), 0), 1);
      const progress = Math.min(Math.max((index + 1) / steps.length, 0.2), 1);
      strip.style.setProperty("--workflow-travel", travel.toFixed(4));
      strip.style.setProperty("--workflow-progress", progress.toFixed(4));

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

  const syncFaqPanelState = (root) => {
    if (!root) return null;
    const panel = root.querySelector(".faq-panel");
    if (!panel) return null;
    root.style.setProperty("--faq-panel-max", `${panel.scrollHeight}px`);
    panel.setAttribute("aria-hidden", String(root.getAttribute("data-open") !== "true"));
    return panel;
  };

  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    const root = button.closest(".faq");
    syncFaqPanelState(root);

    button.addEventListener("click", () => {
      const root = button.closest(".faq");
      if (!root) return;
      const open = root.getAttribute("data-open") === "true";
      const panel = root.querySelector(".faq-panel");
      if (panel) panel.setAttribute("aria-hidden", String(open));
      root.setAttribute("data-open", String(!open));
      button.setAttribute("aria-expanded", String(!open));
      syncFaqPanelState(root);
    });
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll(".faq").forEach((root) => {
      syncFaqPanelState(root);
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
