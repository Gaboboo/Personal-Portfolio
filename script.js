/**
 * Developer MMV - Personal Portfolio
 * Vanilla JavaScript (ES6+) - Zero External Dependencies
 * Modules:
 *  1. ThemeManager
 *  2. NavigationManager (Smooth Slide Transitions & Sliding Nav Pill)
 *  3. TechCarouselManager (Carousel of Pills/Tabs with Logos & Spotlight)
 *  4. ProjectFilterManager
 *  5. TerminalManager (Hooking Interactive CLI Shell with Matrix Digital Rain)
 *  6. SimulatorManager
 *  7. AccordionManager
 *  8. ModalManager
 *  9. ContactFormManager
 * 10. CardTiltManager (Tactile 3D Tilt Effect)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ========================================================================
     1. Theme Management (Light / Dark Mode with System Preference & Storage)
     ======================================================================== */
  const ThemeManager = (() => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootElement = document.documentElement;
    const STORAGE_KEY = 'mmv_portfolio_theme';

    const getPreferredTheme = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const applyTheme = (theme) => {
      rootElement.setAttribute('data-theme', theme);
      if (themeToggleBtn) {
        const isDark = theme === 'dark';
        themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      }
      localStorage.setItem(STORAGE_KEY, theme);
    };

    const toggleTheme = () => {
      const current = rootElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    };

    const init = () => {
      const initialTheme = getPreferredTheme();
      applyTheme(initialTheme);

      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
      }

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    };

    return { init, toggleTheme, applyTheme };
  })();

  /* ========================================================================
     2. Navigation Manager (Requirement 1: Smooth Slide Transition)
     ======================================================================== */
  const NavigationManager = (() => {
    const menuToggleBtn = document.getElementById('mobile-menu-toggle');
    const primaryNav = document.getElementById('primary-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const slidingPill = document.querySelector('.nav-sliding-pill');
    const siteHeader = document.querySelector('.site-header');

    // Move sliding pill indicator under active link
    const updateSlidingPill = (linkElement) => {
      if (!slidingPill || !linkElement || window.innerWidth < 1024) return;
      const navList = linkElement.closest('.nav-list');
      if (!navList) return;

      const listRect = navList.getBoundingClientRect();
      const linkRect = linkElement.getBoundingClientRect();

      const offsetLeft = linkRect.left - listRect.left;
      const width = linkRect.width;

      slidingPill.style.transform = `translateY(-50%) translateX(${offsetLeft}px)`;
      slidingPill.style.width = `${width}px`;
      slidingPill.classList.add('is-active');
    };

    const toggleMenu = () => {
      const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
      const nextState = !isExpanded;
      menuToggleBtn.setAttribute('aria-expanded', String(nextState));
      menuToggleBtn.setAttribute('aria-label', nextState ? 'Close navigation menu' : 'Open navigation menu');
      primaryNav.classList.toggle('is-open', nextState);
    };

    const closeMenu = () => {
      if (primaryNav && primaryNav.classList.contains('is-open')) {
        menuToggleBtn.setAttribute('aria-expanded', 'false');
        menuToggleBtn.setAttribute('aria-label', 'Open navigation menu');
        primaryNav.classList.remove('is-open');
      }
    };

    // Requirement 1: Smooth Slide Transition when navigation is clicked
    const handleSmoothSlideNavigation = (e) => {
      const targetAnchor = e.currentTarget;
      const targetHref = targetAnchor.getAttribute('href');

      if (!targetHref || !targetHref.startsWith('#')) return;

      const targetId = targetHref.slice(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        e.preventDefault();
        closeMenu();

        // Calculate dynamic offset to clear the sticky navbar
        const headerOffset = siteHeader ? siteHeader.offsetHeight + 12 : 75;
        const sectionPosition = targetSection.getBoundingClientRect().top + window.pageYOffset;
        const targetScrollPosition = sectionPosition - headerOffset;

        // Perform smooth slide scroll
        window.scrollTo({
          top: targetScrollPosition,
          behavior: 'smooth'
        });

        // Trigger section slide animation
        targetSection.classList.remove('section-sliding-in');
        // Trigger reflow
        void targetSection.offsetWidth;
        targetSection.classList.add('section-sliding-in');

        // Update nav active states and sliding indicator pill
        navLinks.forEach((l) => l.classList.remove('active'));
        targetAnchor.classList.add('active');
        updateSlidingPill(targetAnchor);

        // Update URL cleanly without sudden browser jump
        if (history.pushState) {
          history.pushState(null, null, targetHref);
        }
      }
    };

    const init = () => {
      if (menuToggleBtn && primaryNav) {
        menuToggleBtn.addEventListener('click', toggleMenu);

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
            closeMenu();
            menuToggleBtn.focus();
          }
        });
      }

      // Attach smooth slide handler to all navigation anchor links
      const allInternalLinks = document.querySelectorAll('a[href^="#"]');
      allInternalLinks.forEach((link) => {
        link.addEventListener('click', handleSmoothSlideNavigation);
      });

      // Highlight active section on scroll & update sliding pill
      const sections = document.querySelectorAll('section[id]');
      if ('IntersectionObserver' in window && sections.length) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const id = entry.target.getAttribute('id');
              if (entry.isIntersecting) {
                // Find matching nav link for this section
                let matched = false;
                navLinks.forEach((link) => {
                  if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                    updateSlidingPill(link);
                    matched = true;
                  } else {
                    link.classList.remove('active');
                  }
                });
                // No nav link matches (e.g. #hero at top) — hide pill
                if (!matched) {
                  navLinks.forEach((link) => link.classList.remove('active'));
                  if (slidingPill) slidingPill.classList.remove('is-active');
                }
              }
            });
          },
          { rootMargin: '-10% 0px -60% 0px' }
        );

        sections.forEach((sec) => observer.observe(sec));
      }

      // Reposition pill on resize (only if a link is already active)
      window.addEventListener('resize', () => {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) updateSlidingPill(activeLink);
      });

      // Hard rule: scrollY === 0 → no pill, no active link
      const clearPillAtTop = () => {
        if (window.scrollY === 0) {
          navLinks.forEach((link) => link.classList.remove('active'));
          if (slidingPill) slidingPill.classList.remove('is-active');
        }
      };
      window.addEventListener('scroll', clearPillAtTop, { passive: true });
      clearPillAtTop(); // run once on load
    };

    return { init, updateSlidingPill };
  })();

  /* ========================================================================
     3. Tech Carousel Manager (Requirement 2: Pills/Tabs Carousel with Logos)
     ======================================================================== */
  const TechCarouselManager = (() => {
    const categoryTabs = document.querySelectorAll('.carousel-tab-btn');
    const pills = document.querySelectorAll('.tech-pill');
    const carouselWrapper = document.getElementById('tech-carousel-wrapper');
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');

    // Spotlight Elements
    const spotlightCategory = document.getElementById('spotlight-category');
    const spotlightTitle = document.getElementById('spotlight-title');
    const spotlightExp = document.getElementById('spotlight-exp');
    const spotlightDesc = document.getElementById('spotlight-desc');
    const spotlightUsecase = document.getElementById('spotlight-usecase');
    const spotlightProjectLink = document.getElementById('spotlight-project-link');

    // Rich database for technologies & frameworks
    const techData = {
      'js': {
        title: 'JavaScript (ES2024+)',
        category: 'Languages / Primary Core',
        exp: '6+ Years In Production',
        desc: 'Deep fluency with modern ECMAScript standards, asynchronous Event Loop pipelines, Web Workers, and direct DOM manipulation with zero framework overhead.',
        usecase: 'Ultra-fast web apps, zero-bloat state engines, reactive DOM interfaces.',
        project: 'ApexMetrics Cloud Analytics',
        href: '#projects'
      },
      'ts': {
        title: 'TypeScript',
        category: 'Languages / Type Systems',
        exp: '5+ Years In Production',
        desc: 'Strict type safety, generic utility types, conditional types, and compile-time contract enforcement for scalable, fault-tolerant software architecture.',
        usecase: 'Large-scale distributed systems, client SDKs, enterprise REST/GraphQL APIs.',
        project: 'PromptForge Evaluation Suite',
        href: '#projects'
      },
      'python': {
        title: 'Python (AsyncIO / FastAPI)',
        category: 'Languages & Machine Intelligence',
        exp: '5+ Years In Production',
        desc: 'Concurrent asynchronous backend services, data modeling, automated regression testing, and production LLM orchestration architectures.',
        usecase: 'Machine learning evaluation pipelines, background microservices, analytical data jobs.',
        project: 'PromptForge Evaluation Suite',
        href: '#projects'
      },
      'go': {
        title: 'Golang (Go)',
        category: 'Languages / Concurrent Systems',
        exp: '4+ Years In Production',
        desc: 'High-throughput microservices using Goroutines, buffered channels, lightweight HTTP routers, and compiled zero-dependency static binaries.',
        usecase: 'Distributed task orchestrators, high-concurrency event ingestion brokers.',
        project: 'Strata Distributed Orchestrator',
        href: '#projects'
      },
      'rust': {
        title: 'Rust',
        category: 'Languages / Memory-Safe Systems',
        exp: '3+ Years In Production',
        desc: 'Zero-cost abstractions, fearless concurrency, memory safety without garbage collection, and high-performance WebAssembly compilation.',
        usecase: 'Cryptographic hash chain verification, secure append-only ledger systems.',
        project: 'Verity Immutable Audit Ledger',
        href: '#projects'
      },
      'node': {
        title: 'Node.js Runtime',
        category: 'Frameworks & Runtimes',
        exp: '6+ Years In Production',
        desc: 'Server-side JavaScript runtime engineering, event-driven streaming, native clustering, HTTP/2 servers, and low-latency WebSocket backends.',
        usecase: 'Real-time telemetry pipelines, REST & GraphQL servers, CLI automation.',
        project: 'ApexMetrics Cloud Analytics',
        href: '#projects'
      },
      'html5': {
        title: 'HTML5 & Semantic Web',
        category: 'Frameworks & Standards',
        exp: '6+ Years In Production',
        desc: 'Strict semantic structuring, WCAG 2.1 AAA accessibility compliance, landmark regions, ARIA state binding, and screen-reader optimizations.',
        usecase: 'Accessible web architecture, SEO optimization, device-agnostic markup.',
        project: 'Chronicle Notes & Studio',
        href: '#projects'
      },
      'css3': {
        title: 'Modern CSS3 (Grid & Flexbox)',
        category: 'Frameworks & Styling',
        exp: '6+ Years In Production',
        desc: 'Custom properties design systems, fluid responsive typography, sub-millisecond hardware-accelerated animations, and responsive media queries.',
        usecase: 'Minimalist fluid layouts, dark/light themes, zero-dependency stylesheets.',
        project: 'Developer MMV Portfolio',
        href: '#about'
      },
      'react': {
        title: 'React & Web Components',
        category: 'Frameworks & UI Architecture',
        exp: '5+ Years In Production',
        desc: 'Custom Web Components with Shadow DOM encapsulation, custom HTML elements, and lightweight declarative state synchronization.',
        usecase: 'Reusable design systems, cross-platform micro-frontends, modular widgets.',
        project: 'ApexMetrics Cloud Analytics',
        href: '#projects'
      },
      'postgres': {
        title: 'PostgreSQL',
        category: 'Data & Cloud Infrastructure',
        exp: '5+ Years In Production',
        desc: 'Relational data modeling, ACID transactions, complex indexed queries, JSONB storage, partitioned tables, and write-ahead log replication.',
        usecase: 'Enterprise data persistence, ledger audit trails, user access stores.',
        project: 'Verity Immutable Audit Ledger',
        href: '#projects'
      },
      'redis': {
        title: 'Redis In-Memory Store',
        category: 'Data & Cloud Infrastructure',
        exp: '5+ Years In Production',
        desc: 'Ultra-low latency key-value caching, Pub/Sub event distribution, atomic counters, and distributed mutex locks for high-throughput concurrency.',
        usecase: 'Task queuing, real-time rate limiting, session persistence, fast caching.',
        project: 'Strata Distributed Orchestrator',
        href: '#projects'
      },
      'docker': {
        title: 'Docker & Containerization',
        category: 'Data & Cloud Infrastructure',
        exp: '5+ Years In Production',
        desc: 'Multi-stage lean Docker container builds, reproducible runtime sandboxes, minimal Alpine images, and container orchestration.',
        usecase: 'Hermetic development environments, CI/CD automated deployments.',
        project: 'Strata Distributed Orchestrator',
        href: '#projects'
      },
      'graphql': {
        title: 'GraphQL & Federated APIs',
        category: 'Frameworks & APIs',
        exp: '4+ Years In Production',
        desc: 'Schema-first API design, query resolution optimization, DataLoader batching to solve N+1 bottlenecks, and strongly typed clients.',
        usecase: 'Data aggregation gateways, mobile/web client data fetching.',
        project: 'Nexus Cloud Infrastructure',
        href: '#skills'
      },
      'git': {
        title: 'Git & GitHub Actions CI/CD',
        category: 'Data & Cloud Infrastructure',
        exp: '6+ Years In Production',
        desc: 'Automated continuous integration pipelines, trunk-based deployment, automated linting, security audits, and automated static page generation.',
        usecase: 'Continuous delivery, automated regression test runs, static hosting.',
        project: 'Developer MMV Open Source',
        href: '#projects'
      },
      'linux': {
        title: 'Linux Systems & POSIX Shell',
        category: 'Data & Cloud Infrastructure',
        exp: '6+ Years In Production',
        desc: 'POSIX shell scripting, kernel tuning, process monitoring, systemd services, SSH key governance, and cloud server provisioning.',
        usecase: 'Automated server orchestration, pipeline scripting, remote operations.',
        project: 'ApexMetrics Telemetry Nodes',
        href: '#skills'
      },
      'websockets': {
        title: 'WebSockets & WebCrypto API',
        category: 'Frameworks & Security',
        exp: '5+ Years In Production',
        desc: 'Bi-directional full-duplex persistent connections, heartbeat pings, sub-protocol negotiation, and native client-side SHA-256 cryptographic hashing.',
        usecase: 'Real-time telemetry feeds, chat protocols, client-side digital signatures.',
        project: 'ApexMetrics & Verity Ledger',
        href: '#projects'
      }
    };

    const updateSpotlight = (techId) => {
      const data = techData[techId];
      if (!data) return;

      if (spotlightCategory) spotlightCategory.textContent = data.category;
      if (spotlightTitle) spotlightTitle.textContent = data.title;
      if (spotlightExp) spotlightExp.textContent = data.exp;
      if (spotlightDesc) spotlightDesc.textContent = data.desc;
      if (spotlightUsecase) spotlightUsecase.textContent = data.usecase;
      if (spotlightProjectLink) {
        spotlightProjectLink.textContent = `${data.project} \u2192`;
        spotlightProjectLink.setAttribute('href', data.href);
      }
    };

    const filterPills = (category) => {
      pills.forEach((pill) => {
        const pillCat = pill.getAttribute('data-category');
        if (category === 'all' || pillCat === category) {
          pill.classList.remove('is-hidden');
        } else {
          pill.classList.add('is-hidden');
        }
      });
    };

    const init = () => {
      if (!pills.length) return;

      // Category tab filtering
      categoryTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          categoryTabs.forEach((t) => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');

          const category = tab.getAttribute('data-category') || 'all';
          filterPills(category);
        });
      });

      // Pill click selection to update spotlight
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          const techId = pill.getAttribute('data-tech-id');
          if (techId) updateSpotlight(techId);
        });
      });

      // Manual navigation buttons for carousel
      if (carouselWrapper && prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
          carouselWrapper.scrollBy({ left: -260, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
          carouselWrapper.scrollBy({ left: 260, behavior: 'smooth' });
        });
      }

      // Smooth horizontal auto-ticker (pauses on mouseenter or touch)
      let autoScrollTimer = null;
      let isPaused = false;

      const startAutoScroll = () => {
        if (!carouselWrapper) return;
        autoScrollTimer = setInterval(() => {
          if (!isPaused) {
            if (carouselWrapper.scrollLeft + carouselWrapper.clientWidth >= carouselWrapper.scrollWidth - 10) {
              carouselWrapper.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              carouselWrapper.scrollBy({ left: 1, behavior: 'auto' });
            }
          }
        }, 35);
      };

      if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => { isPaused = true; });
        carouselWrapper.addEventListener('mouseleave', () => { isPaused = false; });
        carouselWrapper.addEventListener('touchstart', () => { isPaused = true; }, { passive: true });
        carouselWrapper.addEventListener('touchend', () => { isPaused = false; }, { passive: true });
        startAutoScroll();
      }
    };

    return { init };
  })();

  /* ========================================================================
     4. Project Category Filter Controls
     ======================================================================== */
  const ProjectFilterManager = (() => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    const filterProjects = (category) => {
      projectCards.forEach((card) => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.classList.remove('is-hidden');
          card.removeAttribute('aria-hidden');
        } else {
          card.classList.add('is-hidden');
          card.setAttribute('aria-hidden', 'true');
        }
      });
    };

    const init = () => {
      if (!filterButtons.length) return;

      filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          filterButtons.forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });

          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          const category = btn.getAttribute('data-filter') || 'all';
          filterProjects(category);
        });
      });
    };

    return { init };
  })();

  /* ========================================================================
     5. Terminal Manager (Requirement 4: Hooking Interactive Terminal Shell)
     ======================================================================== */
  const TerminalManager = (() => {
    const terminalScreen = document.getElementById('terminal-screen');
    const terminalForm = document.getElementById('terminal-form');
    const terminalInput = document.getElementById('terminal-input');
    const terminalHistory = document.getElementById('terminal-history');
    const clearBtn = document.getElementById('term-clear-btn');
    const matrixToggleBtn = document.getElementById('matrix-toggle-btn');
    const matrixCanvas = document.getElementById('matrix-canvas');
    const quickChips = document.querySelectorAll('.term-chip');

    let commandHistoryList = [];
    let historyIndex = -1;
    let matrixRunning = false;
    let matrixInterval = null;

    // Canvas Matrix Digital Rain Effect
    const initMatrix = () => {
      if (!matrixCanvas) return;
      const ctx = matrixCanvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        matrixCanvas.width = matrixCanvas.offsetWidth || 800;
        matrixCanvas.height = matrixCanvas.offsetHeight || 400;
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const letters = '0101010101MMVDEV<>{}[]=+*~#@!ABCDEF';
      const fontSize = 12;
      const columns = Math.floor(matrixCanvas.width / fontSize);
      const drops = Array.from({ length: columns }).fill(1);

      const draw = () => {
        ctx.fillStyle = 'rgba(14, 14, 18, 0.1)';
        ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

        ctx.fillStyle = '#00ff66';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = letters.charAt(Math.floor(Math.random() * letters.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      const toggleMatrix = () => {
        matrixRunning = !matrixRunning;
        if (matrixRunning) {
          matrixCanvas.classList.add('is-active');
          matrixInterval = setInterval(draw, 45);
          printOutput('<span class="term-success">[Matrix Engine Activated] Cascading digital rain running in background.</span>');
        } else {
          matrixCanvas.classList.remove('is-active');
          if (matrixInterval) clearInterval(matrixInterval);
          ctx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
          printOutput('<span class="term-warning">[Matrix Engine Deactivated] Canvas cleared.</span>');
        }
      };

      if (matrixToggleBtn) {
        matrixToggleBtn.addEventListener('click', toggleMatrix);
      }

      return { toggleMatrix };
    };

    const printOutput = (htmlContent) => {
      if (!terminalHistory) return;
      const entry = document.createElement('div');
      entry.className = 'term-entry';
      entry.innerHTML = `<div class="term-output-block">${htmlContent}</div>`;
      terminalHistory.appendChild(entry);
      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    };

    const executeCommand = (cmdRaw) => {
      const cmd = cmdRaw.trim().toLowerCase();
      if (!cmd) return;

      // Add user prompt echo
      const echoEntry = document.createElement('div');
      echoEntry.className = 'term-entry';
      echoEntry.innerHTML = `<div class="term-command-line">
        <span class="prompt-user">guest</span><span class="prompt-at">@</span><span class="prompt-host">mmv-dev</span><span class="prompt-colon">:</span><span class="prompt-path">~</span><span class="prompt-dollar">$</span>
        <strong>${cmdRaw}</strong>
      </div>`;
      terminalHistory.appendChild(echoEntry);

      commandHistoryList.push(cmdRaw);
      historyIndex = commandHistoryList.length;

      // Command dispatch
      switch (cmd) {
        case 'help':
          printOutput(`
<span class="term-text-highlight">AVAILABLE COMMANDS:</span>
  <span class="term-success">skills</span>        - Display Developer MMV's technical proficiency matrix
  <span class="term-success">projects</span>      - List core projects with clickable instant previews
  <span class="term-success">hire</span>          - View collaboration terms and copy contact email
  <span class="term-success">matrix</span>        - Toggle the real-time Matrix digital rain visualizer
  <span class="term-success">theme</span>         - Toggle between Light and Dark mode
  <span class="term-success">ping</span>          - Check telemetry response time to MMV's cloud core
  <span class="term-success">clear</span>         - Clear the terminal console buffer
  <span class="term-success">cat bio.md</span>    - Print Developer MMV's engineering philosophy
  <span class="term-success">coffee</span>       - Fuel developer caffeine reserves
  <span class="term-success">sudo</span>         - Attempt superuser elevation
          `);
          break;

        case 'skills':
          printOutput(`
<span class="term-text-highlight">CORE TECHNICAL PROFICIENCY MATRIX:</span>
[ Frontend ] JavaScript ES2024+  [====================] 100%
[ Frontend ] TypeScript          [==================..] 92%
[ Backend  ] Node.js / Express   [====================] 98%
[ Backend  ] Go / Concurrency    [=================...] 88%
[ Data     ] PostgreSQL & SQL    [==================..] 90%
[ Data     ] Redis / In-Memory   [==================..] 90%
[ Cloud    ] Docker & Linux      [=================...] 86%
[ Quality  ] WCAG 2.1 AAA a11y   [====================] 100%
          `);
          break;

        case 'projects':
          printOutput(`
<span class="term-text-highlight">FEATURED ENGINEERING PROJECTS:</span>
1. <a class="term-action-link" onclick="document.querySelector('[data-project-id=\\'1\\']').click()">ApexMetrics Cloud Analytics</a> - Real-time WebSocket telemetry dashboard
2. <a class="term-action-link" onclick="document.querySelector('[data-project-id=\\'2\\']').click()">Strata Distributed Orchestrator</a> - Go/Redis background worker engine
3. <a class="term-action-link" onclick="document.querySelector('[data-project-id=\\'3\\']').click()">Chronicle Notes &amp; Studio</a> - Offline-first IndexedDB knowledge base
4. <a class="term-action-link" onclick="document.querySelector('[data-project-id=\\'4\\']').click()">PromptForge Evaluation Suite</a> - LLM benchmarking & latency grading
5. <a class="term-action-link" onclick="document.querySelector('[data-project-id=\\'5\\']').click()">Verity Immutable Audit Ledger</a> - WebCrypto SHA-256 cryptographic chain
6. <a class="term-action-link" onclick="document.querySelector('[data-project-id=\\'6\\']').click()">Kuro Headless Commerce</a> - Sub-second conversion storefront
<em>Click any project above to launch its full modal window!</em>
          `);
          break;

        case 'hire':
          printOutput(`
<span class="term-success">\u2714 AVAILABLE FOR WORK:</span>
Developer MMV is accepting contract architecture and full-stack engagements.
Direct Email: <a href="mailto:developer.mmv@example.com" class="term-info">developer.mmv@example.com</a>
SLA Response: &lt; 24 business hours.
<a href="#contact" class="term-action-link">&rarr; Jump to Contact Form Section</a>
          `);
          break;

        case 'matrix':
          if (matrixController) matrixController.toggleMatrix();
          break;

        case 'theme':
          const newTheme = ThemeManager.toggleTheme();
          printOutput(`<span class="term-warning">Color theme switched to: [${newTheme.toUpperCase()} MODE]</span>`);
          break;

        case 'ping':
          const latency = (Math.random() * 0.4 + 0.1).toFixed(2);
          printOutput(`
64 bytes from cloud.mmv.dev (192.0.2.1): icmp_seq=1 ttl=64 time=${latency} ms
64 bytes from cloud.mmv.dev (192.0.2.1): icmp_seq=2 ttl=64 time=${(parseFloat(latency) + 0.04).toFixed(2)} ms
<span class="term-success">--- cloud.mmv.dev ping statistics ---</span>
2 packets transmitted, 2 received, 0% packet loss, time ${latency}ms
          `);
          break;

        case 'clear':
          terminalHistory.innerHTML = '';
          break;

        case 'cat bio.md':
        case 'bio':
          printOutput(`
<span class="term-text-highlight"># Developer MMV — Digital Systems Architect</span>
"I build software that respects client memory and user attention.
Zero unnecessary frameworks. 100% adherence to modern web standards."
Location: Global Remote / San Francisco timezone overlap.
Years of Craft: 6+
          `);
          break;

        case 'sudo':
          printOutput(`<span class="term-error">Permission denied: Developer MMV is the primary superuser here! But feel free to hire them ;)</span>`);
          break;

        case 'coffee':
          printOutput(`\u2615 Brewing 100% single-origin Arabica roast... Developer cognitive performance boosted to 100%.`);
          break;

        default:
          printOutput(`<span class="term-error">Command not recognized: '${cmdRaw}'. Type <strong>help</strong> for a list of available actions.</span>`);
      }

      terminalScreen.scrollTop = terminalScreen.scrollHeight;
    };

    let matrixController = null;

    const init = () => {
      matrixController = initMatrix();

      if (terminalForm && terminalInput) {
        terminalForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const val = terminalInput.value;
          terminalInput.value = '';
          executeCommand(val);
        });

        // Up / Down arrow history navigation
        terminalInput.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
              historyIndex--;
              terminalInput.value = commandHistoryList[historyIndex] || '';
            }
          } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistoryList.length - 1) {
              historyIndex++;
              terminalInput.value = commandHistoryList[historyIndex] || '';
            } else {
              historyIndex = commandHistoryList.length;
              terminalInput.value = '';
            }
          }
        });
      }

      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          terminalHistory.innerHTML = '';
        });
      }

      // Quick chip clicks
      quickChips.forEach((chip) => {
        chip.addEventListener('click', () => {
          const cmd = chip.getAttribute('data-cmd');
          if (cmd) executeCommand(cmd);
        });
      });
    };

    return { init, executeCommand };
  })();

  /* ========================================================================
     6. Performance Simulator Sandbox
     ======================================================================== */
  const SimulatorManager = (() => {
    const networkSelect = document.getElementById('network-profile');
    const assetSelect = document.getElementById('asset-bundle');
    const runBtn = document.getElementById('run-simulation-btn');

    const ttiEl = document.getElementById('sim-tti');
    const payloadEl = document.getElementById('sim-payload');
    const scoreEl = document.getElementById('sim-score');
    const a11yEl = document.getElementById('sim-a11y');

    const updateSimulation = () => {
      if (!networkSelect || !assetSelect) return;

      const network = networkSelect.value;
      const asset = assetSelect.value;

      let tti = '0.34s';
      let payload = '18.4 KB (Gzip)';
      let score = '100 / 100';
      let a11y = 'WCAG AAA Certified';

      if (asset === 'vanilla') {
        if (network === 'fast3g') {
          tti = '0.52s';
        } else if (network === 'broadband') {
          tti = '0.12s';
        } else {
          tti = '0.34s';
        }
        payload = '18.4 KB (Gzip)';
        score = '100 / 100';
      } else {
        if (network === 'fast3g') {
          tti = '3.85s';
        } else if (network === 'broadband') {
          tti = '1.18s';
        } else {
          tti = '2.40s';
        }
        payload = '512.6 KB (Gzip)';
        score = '78 / 100';
      }

      if (ttiEl) ttiEl.textContent = tti;
      if (payloadEl) payloadEl.textContent = payload;
      if (scoreEl) scoreEl.textContent = score;
      if (a11yEl) a11yEl.textContent = a11y;
    };

    const init = () => {
      if (runBtn) runBtn.addEventListener('click', updateSimulation);
      if (networkSelect) networkSelect.addEventListener('change', updateSimulation);
      if (assetSelect) assetSelect.addEventListener('change', updateSimulation);
    };

    return { init };
  })();

  /* ========================================================================
     7. Accessible FAQ Accordion
     ======================================================================== */
  const AccordionManager = (() => {
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');

    const toggleItem = (trigger) => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId = trigger.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      if (!panel) return;

      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        accordionTriggers.forEach((otherTrigger) => {
          if (otherTrigger !== trigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            const otherPanelId = otherTrigger.getAttribute('aria-controls');
            const otherPanel = document.getElementById(otherPanelId);
            if (otherPanel) otherPanel.hidden = true;
          }
        });

        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    };

    const init = () => {
      accordionTriggers.forEach((trigger) => {
        trigger.addEventListener('click', () => toggleItem(trigger));
      });
    };

    return { init };
  })();

  /* ========================================================================
     8. Accessible Project Modal Dialog
     ======================================================================== */
  const ModalManager = (() => {
    const modalBackdrop = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const dismissBtn = document.getElementById('modal-dismiss-btn');
    const openButtons = document.querySelectorAll('.open-modal-btn');

    const modalTitle = document.getElementById('modal-project-title');
    const modalImage = document.getElementById('modal-image');
    const modalCategory = document.getElementById('modal-category');
    const modalDescription = document.getElementById('modal-description');
    const modalTags = document.getElementById('modal-tags');

    let previousActiveElement = null;

    const projectDetails = {
      '1': {
        title: 'ApexMetrics Cloud Analytics',
        category: 'Full-Stack',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        description: 'Engineered a real-time telemetry streaming dashboard processing thousands of metrics per second. Leveraged native WebSocket protocols and SVG rendering to deliver 60 FPS charts without heavy third-party graphics runtimes.',
        tags: ['JavaScript ES6+', 'WebSockets', 'Node.js', 'PostgreSQL', 'SVG Visualizations']
      },
      '2': {
        title: 'Strata Distributed Task Orchestrator',
        category: 'Systems & APIs',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
        description: 'Architected a distributed background job runner with automated worker heartbeat verification, dead-letter queues, and zero external runtime dependencies. Capable of processing 100,000+ tasks per minute.',
        tags: ['Go', 'Redis', 'Docker', 'REST API', 'Concurrency']
      },
      '3': {
        title: 'Chronicle Notes & Studio',
        category: 'Web App',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        description: 'A distraction-free, offline-first personal knowledge base built using native IndexedDB storage, Web Workers for client-side search indexing, and modern CSS Grid layouts for multi-pane split viewing.',
        tags: ['HTML5', 'CSS Grid', 'IndexedDB', 'Web Workers', 'Offline-First']
      },
      '4': {
        title: 'PromptForge Evaluation Suite',
        category: 'Full-Stack',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        description: 'An AI developer tool providing programmatic prompt variation comparisons, latency telemetry, token pricing estimations, and automated semantic regression testing.',
        tags: ['TypeScript', 'Python', 'FastAPI', 'SQLite', 'LLM Benchmarking']
      },
      '5': {
        title: 'Verity Immutable Audit Ledger',
        category: 'Systems & APIs',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        description: 'A cryptographic append-only event log utilizing WebCrypto SHA-256 hash chains for verifying the provenance and immutability of system audits and compliance records.',
        tags: ['Rust', 'WebCrypto API', 'PostgreSQL', 'Docker', 'Security']
      },
      '6': {
        title: 'Kuro Headless Commerce',
        category: 'Web App',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        description: 'High-speed headless e-commerce storefront delivering sub-second page transitions, full keyboard checkout navigability, and client-side cart persistence via CacheStorage API.',
        tags: ['Vanilla JS', 'CSS Flexbox', 'Stripe API', 'Service Workers', 'WCAG AAA']
      }
    };

    const openModal = (projectId) => {
      const data = projectDetails[projectId];
      if (!data || !modalBackdrop) return;

      previousActiveElement = document.activeElement;

      if (modalTitle) modalTitle.textContent = data.title;
      if (modalCategory) modalCategory.textContent = data.category;
      if (modalImage) {
        modalImage.src = data.image;
        modalImage.alt = `Detailed screenshot preview of ${data.title}`;
      }
      if (modalDescription) modalDescription.textContent = data.description;
      if (modalTags) {
        modalTags.innerHTML = '';
        data.tags.forEach((tag) => {
          const span = document.createElement('span');
          span.textContent = tag;
          modalTags.appendChild(span);
        });
      }

      modalBackdrop.classList.add('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      if (closeBtn) closeBtn.focus();
    };

    const closeModal = () => {
      if (!modalBackdrop) return;
      modalBackdrop.classList.remove('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    };

    const init = () => {
      if (!modalBackdrop) return;

      openButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-project-id');
          if (id) openModal(id);
        });
      });

      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
          closeModal();
        }
      });
    };

    return { init, openModal };
  })();

  /* ========================================================================
     9. Contact Form Validation & Static Feedback UI
     ======================================================================== */
  const ContactFormManager = (() => {
    const form = document.getElementById('contact-form');
    const feedbackBanner = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('contact-submit-btn');

    const fields = {
      name: {
        input: document.getElementById('contact-name'),
        error: document.getElementById('name-error'),
        validate: (val) => val.trim().length >= 2,
        msg: 'Please enter your name (at least 2 characters).'
      },
      email: {
        input: document.getElementById('contact-email'),
        error: document.getElementById('email-error'),
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
        msg: 'Please provide a valid email address.'
      },
      subject: {
        input: document.getElementById('contact-subject'),
        error: document.getElementById('subject-error'),
        validate: (val) => Boolean(val),
        msg: 'Please select an engagement topic.'
      },
      message: {
        input: document.getElementById('contact-message'),
        error: document.getElementById('message-error'),
        validate: (val) => val.trim().length >= 10,
        msg: 'Please enter a message of at least 10 characters.'
      }
    };

    const validateField = (fieldObj) => {
      const { input, error, validate, msg } = fieldObj;
      if (!input || !error) return true;

      const isValid = validate(input.value);
      if (!isValid) {
        error.textContent = msg;
        input.setAttribute('aria-invalid', 'true');
        return false;
      } else {
        error.textContent = '';
        input.removeAttribute('aria-invalid');
        return true;
      }
    };

    const init = () => {
      if (!form) return;

      Object.values(fields).forEach((fieldObj) => {
        if (fieldObj.input) {
          fieldObj.input.addEventListener('blur', () => validateField(fieldObj));
          fieldObj.input.addEventListener('input', () => {
            if (fieldObj.error && fieldObj.error.textContent) {
              validateField(fieldObj);
            }
          });
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        let allValid = true;
        Object.values(fields).forEach((fieldObj) => {
          const valid = validateField(fieldObj);
          if (!valid) allValid = false;
        });

        if (!allValid) {
          if (feedbackBanner) {
            feedbackBanner.className = 'form-feedback-banner error';
            feedbackBanner.textContent = 'Please correct the highlighted fields above before submitting.';
          }
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending Message...';
        }

        setTimeout(() => {
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Send Message</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>`;
          }

          if (feedbackBanner) {
            feedbackBanner.className = 'form-feedback-banner success';
            feedbackBanner.textContent = 'Thank you! Your message has been received. Developer MMV will respond within 24 business hours.';
          }
        }, 600);
      });
    };

    return { init };
  })();

  /* ========================================================================
     10. Card 3D Tilt Manager (Tactile Interactive Polish)
     ======================================================================== */
  const CardTiltManager = (() => {
    const tiltElements = document.querySelectorAll('.interactive-tilt');

    const handleMouseMove = (e, card) => {
      if (window.innerWidth < 1024) return; // Desktop only
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    };

    const handleMouseLeave = (card) => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    };

    const init = () => {
      tiltElements.forEach((card) => {
        card.addEventListener('mousemove', (e) => handleMouseMove(e, card));
        card.addEventListener('mouseleave', () => handleMouseLeave(card));
      });
    };

    return { init };
  })();

  /* ========================================================================
     Initialize All Modules
     ======================================================================== */
  ThemeManager.init();
  NavigationManager.init();
  TechCarouselManager.init();
  ProjectFilterManager.init();
  TerminalManager.init();
  SimulatorManager.init();
  AccordionManager.init();
  ModalManager.init();
  ContactFormManager.init();
  CardTiltManager.init();
});
