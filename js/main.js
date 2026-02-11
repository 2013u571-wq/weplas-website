document.addEventListener('DOMContentLoaded', () => {

  /* ======================
     Header
     ====================== */

  const header = document.querySelector('.header');

  function syncHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty(
      '--header-h',
      `${header.offsetHeight}px`
    );
  }

  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);

  // Check if page has a dark hero (video background)
  const heroSection = document.querySelector('#hero, .hero');
  const hasHeroVideo = heroSection && heroSection.querySelector('video, .hero-bg-video');
  
  function handleHeaderScroll() {
    if (!header) return;
    // If no hero video, always show scrolled (dark) header
    if (!hasHeroVideo) {
      header.classList.add('scrolled', 'is-scrolled');
      return;
    }
    header.classList.toggle('scrolled', window.scrollY > 20);
  }

  handleHeaderScroll();
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // Immersive header: toggle is-scrolled for glass effect
  const onScroll = () => {
    // If no hero video, always keep scrolled state
    if (!hasHeroVideo) {
      header.classList.add('is-scrolled');
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ======================
     Mobile Drawer Navigation
     ====================== */
  
  function initMobileNav() {
    if (window.__mnavInited) return;
    window.__mnavInited = true;

    const toggle = document.querySelector('.mnav-toggle');
    const drawer = document.querySelector('#mnav');
    const backdrop = document.querySelector('.mnav-backdrop');
    const closeBtn = drawer ? drawer.querySelector('.mnav-close') : null;

    if (!toggle || !drawer || !backdrop) return;

    // Hard reset on init (avoid stale state after page reload)
    const hardReset = () => {
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.documentElement.classList.remove('mnav-open');
      document.documentElement.classList.remove('is-locked');
      document.body.classList.remove('is-locked');
    };
    hardReset();

    const views = Array.from(drawer.querySelectorAll('.mnav-view'));
    const rootViewName = 'root';

    const getView = (name) => drawer.querySelector(`.mnav-view[data-view="${name}"]`);
    const isOpen = () => drawer.getAttribute('aria-hidden') === 'false';

    const showView = (name) => {
      views.forEach(v => {
        const active = v.getAttribute('data-view') === name;
        v.classList.toggle('is-active', active);
        v.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
    };

    const openDrawer = () => {
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
      backdrop.classList.add('is-open');
      document.documentElement.classList.add('mnav-open');
      document.documentElement.classList.add('is-locked');
      document.body.classList.add('is-locked');
      showView(rootViewName);
    };

    const closeDrawer = () => {
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      document.documentElement.classList.remove('mnav-open');
      document.documentElement.classList.remove('is-locked');
      document.body.classList.remove('is-locked');
      showView(rootViewName);
      toggle.focus();
    };

    // Toggle
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen() ? closeDrawer() : openDrawer();
    });

    // Close btn
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Backdrop
    backdrop.addEventListener('click', closeDrawer);

    // ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closeDrawer();
    });

    // Go to subview
    drawer.addEventListener('click', (e) => {
      const goBtn = e.target.closest('[data-mnav-go]');
      if (goBtn) {
        const target = goBtn.getAttribute('data-mnav-go');
        const view = getView(target);
        if (view) showView(target);
        return;
      }
      const backBtn = e.target.closest('[data-mnav-back]');
      if (backBtn) {
        showView(rootViewName);
        return;
      }
    });

    // Optional: auto-close on resize to desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 980 && isOpen()) closeDrawer();
      }, 120);
    });
  }
  
  // Call initMobileNav inside DOMContentLoaded
  initMobileNav();
  
  // Call initMobileCtaBar inside DOMContentLoaded
  initMobileCtaBar();

  // Call initProductCarousel inside DOMContentLoaded
  initProductCarousel();

  // Load unified WhatsApp floating widget (replaces legacy wa-fab/wa-float)
  (function() {
    var s = document.createElement('script');
    s.src = '/js/whatsapp-float.js';
    s.async = false;
    (document.head || document.body).appendChild(s);
  })();


  /* ======================
     Mega Menu Tabs (Content Switching Only)
     ====================== */

  const megaProducts = document.getElementById('mega-products');
  const isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Products mega menu: hover switching (desktop only)
  if (megaProducts && isDesktopHover) {
    const productsTabs = megaProducts.querySelectorAll('.mega-tab');
    const productsPanels = megaProducts.querySelectorAll('.mega-panel');

    const switchPanel = (tab) => {
      if (tab.classList.contains('active')) return;

      productsTabs.forEach(t => t.classList.remove('active'));
      productsPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');

      const target = tab.dataset.target;
      const panel = megaProducts.querySelector(
        `.mega-panel[data-panel="${target}"]`
      );

      if (panel) panel.classList.add('active');
    };

    productsTabs.forEach(tab => {
      // Desktop: hover to switch
      tab.addEventListener('pointerenter', () => switchPanel(tab));
      
      // Keyboard: focus to switch
      tab.addEventListener('focusin', () => switchPanel(tab));

      // Desktop: click prevents default (no navigation), but still switches
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchPanel(tab);
      });
    });
  }

  // All mega menus: click switching (mobile/fallback)
  const megaTabs = document.querySelectorAll('.mega-tab');
  const megaPanels = document.querySelectorAll('.mega-panel');

  megaTabs.forEach(tab => {
    // Skip if already handled by Products hover logic (desktop)
    if (megaProducts && tab.closest('#mega-products') && isDesktopHover) {
      return;
    }

    tab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (tab.classList.contains('active')) return;

      // Find the mega menu container
      const megaMenu = tab.closest('.mega-menu');
      if (!megaMenu) return;

      const menuTabs = megaMenu.querySelectorAll('.mega-tab');
      const menuPanels = megaMenu.querySelectorAll('.mega-panel');

      menuTabs.forEach(t => t.classList.remove('active'));
      menuPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');

      const target = tab.dataset.target;
      const panel = megaMenu.querySelector(
        `.mega-panel[data-panel="${target}"]`
      );

      if (panel) panel.classList.add('active');
    });
  });


  /* ======================
     Hero Video (Immediate Play)
     ====================== */

  const v = document.querySelector('#hero .hero-bg-video');
  if (v) {
    v.muted = true;
    v.playsInline = true;

    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    // 尽快播放
    tryPlay();
    // 有些浏览器需要等 metadata
    v.addEventListener('loadedmetadata', tryPlay, { once: true });
  }


  /* ======================
     Form Modal
     ====================== */

  // Support both old (.form-modal) and new (.modal) modal systems
  const modal = document.querySelector('.form-modal') || document.getElementById('leadModal');
  const closer = document.querySelector('.form-close') || document.querySelector('.modal__close');
  const phoneInput = document.querySelector('#phone');

  const thankYouModal = document.getElementById('thankYouModal');
  const thankYouClose = document.getElementById('thankYouClose');

  if (thankYouModal) {
    thankYouModal.classList.remove('active');
  }

  let phoneInputInstance = null;

  function closeModal() {
    if (!modal) return;
    // Support both old (.form-modal.active) and new (.modal[aria-hidden]) systems
    if (modal.classList.contains('form-modal')) {
      modal.classList.remove('active');
    } else if (modal.classList.contains('modal')) {
      modal.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('modal-lock');
    document.body.style.overflow = '';
  }

  function openThankYou() {
    if (thankYouModal) {
      thankYouModal.classList.add('active');
    }
  }

  if (thankYouClose && thankYouModal) {
    thankYouClose.addEventListener('click', () => {
      thankYouModal.classList.remove('active');
    });
  }

  function initPhoneInput() {
    if (!phoneInput || phoneInputInstance) return;

    if (window.intlTelInput) {
      phoneInputInstance = window.intlTelInput(phoneInput, {
        initialCountry: "auto",
        geoIpLookup: (cb) => {
          fetch("https://ipapi.co/json/")
            .then(res => res.json())
            .then(data => cb(data.country_code))
            .catch(() => cb("US"));
        },
        preferredCountries: ["us", "de", "in", "br", "id", "tr", "mx"],
        separateDialCode: true,
        utilsScript:
          "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
      });
    }
  }

  if (modal) {
    // Delegated event listener for [data-open-form] buttons (legacy support)
    // Note: New [data-modal-target] system is handled by separate script in index.html
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-open-form]');
      if (opener) {
        e.preventDefault();
        e.stopPropagation();
        // Support both old and new modal systems
        if (modal.classList.contains('form-modal')) {
          modal.classList.add('active');
        } else if (modal.classList.contains('modal')) {
          modal.setAttribute('aria-hidden', 'false');
        }
        document.body.classList.add('modal-lock');
        document.body.style.overflow = 'hidden';
        setTimeout(initPhoneInput, 100);
      }
    });

    // Legacy close button support (if using old system)
    if (closer && modal.classList.contains('form-modal')) {
      closer.addEventListener('click', closeModal);
    }

    // Legacy overlay click support
    if (modal.classList.contains('form-modal')) {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('form-modal-overlay')) {
          closeModal();
        }
      });
    }
  }


  /* ======================
     Form Submission
     ====================== */

  const form = document.getElementById('contactFormElement');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.name?.value || '';
      const company = form.company?.value || '';
      const email = form.email?.value || '';
      const material = form.material?.value || '';
      const capacity = form.capacity?.value || '';
      const message = form.message?.value || '';

      let phone = phoneInput?.value || '';
      if (window.intlTelInputGlobals && phoneInput) {
        const iti = window.intlTelInputGlobals.getInstance(phoneInput);
        if (iti) phone = iti.getNumber();
      }

      const text = `
Hello Gangsu Machinery Team,

Name: ${name}
Company: ${company}
Email: ${email}
Phone: ${phone}

Material: ${material}
Capacity: ${capacity}

Message:
${message}
      `.trim();

      window.open(
        "https://wa.me/8618913609266?text=" + encodeURIComponent(text),
        "_blank"
      );

      fetch(
        "https://script.google.com/macros/s/AKfycbzClsdMzYrJngPHFCkk5PcXQQigTwr2qeu7DDehPUxH0t3qvABBj4AmpoJGWEiTqDU0Cg/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            company,
            email,
            phone,
            material,
            capacity,
            message,
            source: "Gangsu Machinery Website"
          })
        }
      );

      form.reset();
      closeModal();
      if (typeof gsRedirectToThankYou === 'function') gsRedirectToThankYou(form);
    });
  }

});

(() => {
  const header = document.getElementById('site-header');
  if (!header) return;

  const megaItems = Array.from(header.querySelectorAll('.nav-item.has-mega'));
  if (!megaItems.length) return;

  // Inject SVG chevron into Products/Solutions triggers
  megaItems.forEach(item => {
    const link = item.querySelector('a.nav-link');
    if (!link) return;

    link.setAttribute('aria-haspopup', 'true');
    link.setAttribute('aria-expanded', 'false');

    if (!link.querySelector('.nav-chev')) {
      const wrap = document.createElement('span');
      wrap.className = 'nav-chev';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = `
        <svg viewBox="0 0 12 12" focusable="false" aria-hidden="true">
          <path d="M2.2 4.5 L6 8.1 L9.8 4.5"></path>
        </svg>
      `;
      link.appendChild(wrap);
    }
  });

  let closeTimer = null;
  const cancelClose = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer = setTimeout(closeAll, 180);
  };

  const closeAll = () => {
    cancelClose();
    megaItems.forEach(i => {
      i.classList.remove('is-open');
      const a = i.querySelector('a.nav-link');
      if (a) {
        a.setAttribute('aria-expanded', 'false');
        a.classList.remove('is-mega-open', 'is-active');
      }
    });
    header.classList.remove('mega-open');
    document.body.classList.remove('mega-active');
  };

  const setOpen = (activeItem) => {
    cancelClose();
    megaItems.forEach(i => {
      const isActive = i === activeItem;
      i.classList.toggle('is-open', isActive);
      const a = i.querySelector('a.nav-link');
      if (a) {
        a.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        // Add is-mega-open and is-active class for styling (Solutions only)
        if (isActive) {
          a.classList.add('is-mega-open', 'is-active');
        } else {
          a.classList.remove('is-mega-open', 'is-active');
        }
      }
    });
    header.classList.add('mega-open');
    document.body.classList.add('mega-active');
  };

  // Hover to open + natural switch between Products/Solutions (desktop only)
  const isDesktop = () => window.innerWidth > 980;
  
  megaItems.forEach(item => {
    // Desktop: hover to open
    item.addEventListener('pointerover', () => {
      if (isDesktop()) setOpen(item);
    });
    
    const menu = item.querySelector('.mega-menu');
    if (menu) {
      menu.addEventListener('pointerenter', () => {
        if (isDesktop()) cancelClose();
      });
      menu.addEventListener('pointerleave', () => {
        if (isDesktop()) scheduleClose();
      });
    }
  });

  // Close mega when hovering non-mega top links (Projects/About) + CTA (desktop only)
  const topLinks = header.querySelectorAll('.nav-links > a.nav-link:not(.nav-cta)');
  topLinks.forEach(a => {
    if (!a.closest('.nav-item.has-mega')) {
      a.addEventListener('pointerover', () => {
        if (isDesktop()) closeAll();
      });
    }
  });

  const cta = header.querySelector('.nav-cta');
  if (cta) {
    cta.addEventListener('pointerover', () => {
      if (isDesktop()) closeAll();
    });
  }

  // Close on leaving header area (sticky Apple feel with short delay) - desktop only
  header.addEventListener('pointerover', () => {
    if (isDesktop()) cancelClose();
  });
  header.addEventListener('pointerout', (e) => {
    if (isDesktop() && !header.contains(e.relatedTarget)) {
      scheduleClose();
    }
  });

  // Close on ESC and click outside
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  document.addEventListener('pointerdown', (e) => {
    if (!header.contains(e.target) && !e.target.closest('.mega-menu')) {
      closeAll();
    }
  });
})();

/* =========================
   Mobile Bottom CTA Bar (Lightweight)
   - Shows after scrolling >= 200px
   - Hides when back to top
   - Uses requestAnimationFrame for scroll throttling
   ========================= */
function initMobileCtaBar() {
  if (window.__mobctaBarInited) return;
  window.__mobctaBarInited = true;

  const mobctaBar = document.getElementById('mobcta-bar');
  if (!mobctaBar) return;

  const quoteBtn = mobctaBar.querySelector('[data-mobcta-quote]');
  const whatsappLink = mobctaBar.querySelector('.mobcta-btn-primary');
  
  if (!quoteBtn) return;

  // Scroll threshold
  const SCROLL_THRESHOLD = 200;
  let lastScrollY = window.scrollY;
  let rafId = null;
  let isVisible = false;

  // Show/hide based on scroll position
  const updateVisibility = () => {
    const scrollY = window.scrollY;
    
    if (scrollY >= SCROLL_THRESHOLD && !isVisible) {
      mobctaBar.classList.add('is-visible');
      isVisible = true;
    } else if (scrollY < SCROLL_THRESHOLD && isVisible) {
      mobctaBar.classList.remove('is-visible');
      isVisible = false;
    }
    
    lastScrollY = scrollY;
    rafId = null;
  };

  // Throttled scroll handler using requestAnimationFrame
  const handleScroll = () => {
    if (rafId === null) {
      rafId = requestAnimationFrame(updateVisibility);
    }
  };

  // Only enable on mobile (<=768px)
  const isMobile = () => window.innerWidth <= 768;
  
  if (isMobile()) {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    updateVisibility();
  }

  // Re-check on resize
  window.addEventListener('resize', () => {
    if (isMobile()) {
      updateVisibility();
    } else {
      mobctaBar.classList.remove('is-visible');
      isVisible = false;
    }
  }, { passive: true });

  // Get Quote button click handler - always navigate to /contact/
  quoteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/contact/';
  });

  // WhatsApp link: ensure it has proper href (reuse existing if found)
  if (whatsappLink && !whatsappLink.getAttribute('href') || whatsappLink.getAttribute('href') === '#') {
    // Use existing WhatsApp number from project (found in main.js line 368)
    const whatsappNumber = '8618913609266';
    const defaultText = encodeURIComponent('Hello, I\'m interested in your plastic recycling solutions.');
    whatsappLink.setAttribute('href', `https://wa.me/${whatsappNumber}?text=${defaultText}`);
  }
}

/* =========================
   Product Portfolio Carousel (Mobile)
   - Single card carousel with dots indicator
   - Scroll-snap enabled
   ========================= */
function initProductCarousel() {
  const section = document.querySelector('.home-products');
  if (!section) return;

  const track = section.querySelector('[data-products-track]');
  const dotsWrap = section.querySelector('[data-products-dots]');
  
  if (!track || !dotsWrap) return;

  // Desktop: Hide dots completely and return early
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (!isMobile) {
    dotsWrap.innerHTML = '';
    dotsWrap.setAttribute('aria-hidden', 'true');
    return;
  }
  dotsWrap.setAttribute('aria-hidden', 'false');

  const mql = window.matchMedia('(max-width: 768px)');
  let observer = null;
  let cards = [];
  let initialScrollDone = false;

  // Teardown: Clean up dots and observer
  const teardown = () => {
    dotsWrap.innerHTML = '';
    dotsWrap.style.display = 'none';
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };

  // Setup: Initialize dots and observer for mobile
  const setup = () => {
    // Desktop: teardown and return
    if (!mql.matches) {
      teardown();
      return;
    }

    // Mobile: Setup dots and observer
    dotsWrap.style.display = 'flex';
    cards = Array.from(track.children);
    
    if (cards.length === 0) {
      teardown();
      return;
    }

    // Generate dots
    dotsWrap.innerHTML = '';
    cards.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'prod-dot';
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.setAttribute('data-dot-index', index.toString());
      
      // Click dot: scroll to corresponding card
      dot.addEventListener('click', () => {
        if (index >= 0 && index < cards.length) {
          cards[index].scrollIntoView({
            behavior: 'smooth',
            inline: 'start',
            block: 'nearest'
          });
        }
      });
      
      dotsWrap.appendChild(dot);
    });

    // IntersectionObserver: Detect which card is most visible
    observer = new IntersectionObserver((entries) => {
      // Find the entry with highest intersectionRatio that is intersecting
      let maxRatio = 0;
      let activeEntry = null;

      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          activeEntry = entry;
        }
      });

      if (activeEntry) {
        const activeIndex = cards.indexOf(activeEntry.target);
        if (activeIndex >= 0) {
          // Update dots
          const dots = dotsWrap.querySelectorAll('.prod-dot');
          dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === activeIndex);
          });
        }
      }
    }, {
      root: track,
      threshold: [0.5, 0.6, 0.7]
    });

    // Observe all cards
    cards.forEach(card => {
      observer.observe(card);
    });

    // Mobile: 首屏显示第二张卡片（02），第三张在右侧露出（等布局完成后再滚动）
    if (!initialScrollDone && cards.length >= 2) {
      requestAnimationFrame(() => {
        const gap = parseInt(getComputedStyle(track).gap, 10) || 16;
        const scrollAmount = cards[0].offsetWidth + gap;
        track.scrollLeft = scrollAmount;
        const dots = dotsWrap.querySelectorAll('.prod-dot');
        dots.forEach((d, i) => d.classList.toggle('is-active', i === 1));
        initialScrollDone = true;
      });
    }
  };

  // Initialize
  setup();

  // Listen for breakpoint changes
  mql.addEventListener('change', setup);
}

