/* ================================================================
   Body Stats Tracker — Landing Page
   script.js  |  Pure JavaScript, no frameworks

   Sections:
     1. Nav — scroll blur + active link highlight
     2. Mobile menu — hamburger toggle
     3. Smooth scroll — offset for fixed nav
     4. Version cards — staggered entrance via IntersectionObserver
     5. Roadmap — staggered slide-in via IntersectionObserver
     6. About card — fade-in via IntersectionObserver
   ================================================================ */


/* ──────────────────────────────────────────────────────────────
   1. NAV — SCROLL BLUR + ACTIVE LINK HIGHLIGHT
   ────────────────────────────────────────────────────────────── */

const nav        = document.getElementById('nav');
const navLinks   = document.querySelectorAll('.nav-links a[href^="#"]');
const sections   = document.querySelectorAll('main section[id]');

/** Apply/remove the frosted-glass class based on scroll position. */
function updateNavScroll() {
  if (window.scrollY > 24) {
    nav.classList.add('nav--scrolled');
  } else {
    nav.classList.remove('nav--scrolled');
  }
}

/** Highlight the nav link whose section is currently in view. */
const activeLinkObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  },
  {
    rootMargin: '-30% 0px -65% 0px', // trigger when section is near the center of the viewport
  }
);

sections.forEach((s) => activeLinkObserver.observe(s));

window.addEventListener('scroll', updateNavScroll, { passive: true });
updateNavScroll(); // run once on load in case the page is already scrolled


/* ──────────────────────────────────────────────────────────────
   2. MOBILE MENU — HAMBURGER TOGGLE
   ────────────────────────────────────────────────────────────── */

const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

/** Open or close the mobile navigation drawer. */
function toggleMobileMenu() {
  const isOpen = mobileMenu.hidden;

  mobileMenu.hidden = !isOpen;
  hamburger.setAttribute('aria-expanded', String(isOpen));

  // Prevent body scroll while the menu is open
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

hamburger.addEventListener('click', toggleMobileMenu);

// Close the menu when any link inside it is tapped
mobileMenu.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close the menu if the user taps outside of it
document.addEventListener('click', (e) => {
  if (
    !mobileMenu.hidden &&
    !mobileMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    mobileMenu.hidden = true;
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});


/* ──────────────────────────────────────────────────────────────
   3. SMOOTH SCROLL — OFFSET FOR FIXED NAV
   ────────────────────────────────────────────────────────────── */

/**
 * All anchor links that point to an on-page section (#...)
 * get offset-corrected smooth scrolling so the target
 * isn't hidden behind the fixed navigation bar.
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return; // skip logo link

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const navHeight = nav.offsetHeight;
    const top =
      target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ──────────────────────────────────────────────────────────────
   4. VERSION CARDS — STAGGERED ENTRANCE
   ────────────────────────────────────────────────────────────── */

const versionCards = document.querySelectorAll('.version-card');

/**
 * Cards start invisible (opacity: 0; translateY) in CSS.
 * When a card enters the viewport, we add `.is-visible` which
 * triggers the `cardReveal` keyframe animation.
 * A stagger delay (80 ms per card) is applied so cards in
 * the same row don't all pop in simultaneously.
 */
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const card  = entry.target;
      const delay = Number(card.dataset.stagger) || 0;

      setTimeout(() => {
        card.classList.add('is-visible');
      }, delay);

      // Observe each card only once
      cardObserver.unobserve(card);
    });
  },
  { threshold: 0.08 }
);

versionCards.forEach((card, index) => {
  // Stagger delay resets every 3 cards (one row on desktop)
  const positionInRow = index % 3;
  card.dataset.stagger = positionInRow * 90; // 0, 90, 180 ms
  cardObserver.observe(card);
});


/* ──────────────────────────────────────────────────────────────
   5. ROADMAP — STAGGERED SLIDE-IN
   ────────────────────────────────────────────────────────────── */

const roadmapSteps = document.querySelectorAll('.roadmap-step');

// Set initial hidden state via JS so it only applies when JS is available
roadmapSteps.forEach((step) => {
  step.style.opacity    = '0';
  step.style.transform  = 'translateX(-14px)';
  step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

const roadmapObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const step  = entry.target;
      const index = Array.from(roadmapSteps).indexOf(step);
      const delay = index * 90; // 90 ms stagger per step

      setTimeout(() => {
        step.style.opacity   = '1';
        step.style.transform = 'translateX(0)';
      }, delay);

      roadmapObserver.unobserve(step);
    });
  },
  { threshold: 0.15 }
);

roadmapSteps.forEach((step) => roadmapObserver.observe(step));


/* ──────────────────────────────────────────────────────────────
   6. ABOUT CARD — FADE-IN
   ────────────────────────────────────────────────────────────── */

const aboutCard = document.querySelector('.about-card');

if (aboutCard) {
  // Initial hidden state (only when JS runs, so no-JS fallback is visible)
  aboutCard.style.opacity   = '0';
  aboutCard.style.transform = 'translateY(18px)';
  aboutCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

  const aboutObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      aboutCard.style.opacity   = '1';
      aboutCard.style.transform = 'translateY(0)';
      aboutObserver.disconnect();
    },
    { threshold: 0.12 }
  );

  aboutObserver.observe(aboutCard);
}
