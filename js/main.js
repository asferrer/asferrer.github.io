document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
  initNav();
  initSmoothScroll();
  initScrollReveal();
  initCounters();
  initProjectFilters();
  initProjectExpand();
  initParticles();
  initContactForm();
  initPodcastToggle();
  initBackToTop();
});

/* ==============================
   NAVIGATION
   ============================== */
function initNav() {
  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const langToggle = document.getElementById("langToggle");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  });

  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    hamburger.classList.toggle("active");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("active");
    });
  });

  langToggle.addEventListener("click", () => {
    setLanguage(currentLang === "en" ? "es" : "en");
  });

  // Active section highlight
  const sections = document.querySelectorAll("section[id]");
  const navItems = navLinks.querySelectorAll("a");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(a => a.classList.remove("active"));
        const active = navLinks.querySelector(`a[href="#${entry.target.id}"]`);
        if (active) active.classList.add("active");
      }
    });
  }, { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" });

  sections.forEach(s => observer.observe(s));
}

/* ==============================
   SMOOTH SCROLL
   ============================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ==============================
   SCROLL REVEAL
   ============================== */
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
}

/* ==============================
   ANIMATED COUNTERS
   ============================== */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  let animated = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animated) {
      animated = true;
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute("data-count"), 10);
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
    }
  }, { threshold: 0.3 });

  const aboutSection = document.getElementById("about");
  if (aboutSection) observer.observe(aboutSection);
}

/* ==============================
   PROJECT FILTERS
   ============================== */
function initProjectFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");

      cards.forEach(card => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.classList.remove("card-hidden");
        } else {
          card.classList.add("card-hidden");
          card.classList.remove("expanded");
        }
      });
    });
  });
}

/* ==============================
   PROJECT EXPAND + LAZY VIDEO
   ============================== */
function initProjectExpand() {
  document.querySelectorAll(".project-expand-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".project-card");
      const wasExpanded = card.classList.contains("expanded");
      card.classList.toggle("expanded");

      // Lazy load YouTube iframe
      if (!wasExpanded) {
        const videoDiv = card.querySelector(".project-video[data-video]");
        if (videoDiv && !videoDiv.querySelector("iframe")) {
          const videoId = videoDiv.getAttribute("data-video");
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube.com/embed/${videoId}`;
          iframe.setAttribute("loading", "lazy");
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
          videoDiv.appendChild(iframe);
        }
      }
    });
  });
}

/* ==============================
   PARTICLES (Hero Canvas)
   ============================== */
function initParticles() {
  const canvas = document.getElementById("particlesCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let particles = [];
  let animId;
  let isVisible = true;

  function resize() {
    const hero = document.getElementById("hero");
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(40, Math.floor(canvas.width * canvas.height / 20000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.3 + 0.1
      });
    }
  }

  function draw() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(246, 51, 102, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(246, 51, 102, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
    animId = requestAnimationFrame(draw);
  }

  // Pause when hero not visible
  const visObserver = new IntersectionObserver(entries => {
    isVisible = entries[0].isIntersecting;
    if (isVisible && !animId) draw();
    if (!isVisible) { cancelAnimationFrame(animId); animId = null; }
  }, { threshold: 0 });
  visObserver.observe(document.getElementById("hero"));

  resize();
  createParticles();
  draw();
  window.addEventListener("resize", () => { resize(); createParticles(); });
}

/* ==============================
   CONTACT FORM (Web3Forms)
   ============================== */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const status = document.getElementById("formStatus");
    const btn = document.getElementById("submitBtn");
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    status.textContent = "";
    status.className = "form-status";

    const data = new FormData(form);
    data.append("subject", "New contact from portfolio — " + data.get("name"));

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data
      });
      const json = await res.json();

      if (json.success) {
        status.textContent = translations[currentLang]["contact.success"];
        status.classList.add("success");
        form.reset();
      } else {
        throw new Error(json.message);
      }
    } catch {
      status.textContent = translations[currentLang]["contact.error"];
      status.classList.add("error");
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/* ==============================
   PODCAST TOGGLE
   ============================== */
function initPodcastToggle() {
  const buttons = document.querySelectorAll(".podcast-lang-btn");
  const iframe = document.getElementById("podcastIframe");
  if (!iframe) return;

  const urls = {
    en: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2036352016&color=%23f63366&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true",
    es: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2036351652&color=%23f63366&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true"
  };

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      iframe.src = urls[btn.getAttribute("data-podcast")];
    });
  });
}

/* ==============================
   BACK TO TOP
   ============================== */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
