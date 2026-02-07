// ============================================
// FBT — V4 Modern Interactions + Tennis Ball
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // TENNIS BALL SCROLL ANIMATION
    // ============================================
    const tennisBall = document.getElementById('tennisBall');

    if (tennisBall) {
        const pageHeight = () => Math.max(1, document.body.scrollHeight - window.innerHeight);
        const isMobile = () => window.innerWidth < 769;
        let ballActive = false;
        let currentX = 0, currentY = 0, currentRotation = 0;
        let targetX = 0, targetY = 0;

        // Ball size offset (center the ball on its position)
        const ballSize = () => isMobile() ? 34 : 48;

        // Build waypoints dynamically based on screen width
        const buildWaypoints = () => {
            const w = window.innerWidth;
            const bs = ballSize();
            const margin = isMobile() ? 10 : 60;
            const rightEdge = w - bs - margin;
            const leftEdge = margin;

            return [
                { scroll: 0,    x: -bs - 20 },
                { scroll: 0.04, x: leftEdge },
                { scroll: 0.12, x: rightEdge },
                { scroll: 0.22, x: leftEdge },
                { scroll: 0.32, x: rightEdge },
                { scroll: 0.42, x: leftEdge },
                { scroll: 0.52, x: rightEdge },
                { scroll: 0.62, x: leftEdge },
                { scroll: 0.72, x: rightEdge },
                { scroll: 0.82, x: leftEdge },
                { scroll: 0.92, x: rightEdge },
                { scroll: 1,    x: w + 20 }
            ];
        };

        let waypoints = buildWaypoints();
        window.addEventListener('resize', () => { waypoints = buildWaypoints(); });

        // Interpolate between waypoints with easing
        const getXForScroll = (scrollPct) => {
            for (let i = 0; i < waypoints.length - 1; i++) {
                const a = waypoints[i];
                const b = waypoints[i + 1];
                if (scrollPct >= a.scroll && scrollPct <= b.scroll) {
                    const t = (scrollPct - a.scroll) / (b.scroll - a.scroll);
                    const eased = t < 0.5
                        ? 4 * t * t * t
                        : 1 - Math.pow(-2 * t + 2, 3) / 2;
                    return a.x + (b.x - a.x) * eased;
                }
            }
            return waypoints[waypoints.length - 1].x;
        };

        const tbSvg = tennisBall.querySelector('.tb-svg');
        const tbShadow = tennisBall.querySelector('.tb-shadow');

        const animateBall = () => {
            const scrollPct = window.scrollY / pageHeight();

            // Show/hide ball
            if (scrollPct > 0.03 && scrollPct < 0.95) {
                if (!ballActive) {
                    ballActive = true;
                    tennisBall.classList.add('active');
                }
            } else {
                if (ballActive) {
                    ballActive = false;
                    tennisBall.classList.remove('active');
                }
            }

            // Target X from waypoints
            targetX = getXForScroll(scrollPct);

            // Y: oscillate within viewport using sine wave
            const amplitude = isMobile() ? 50 : 80;
            const centerY = window.innerHeight * 0.4;
            const sineOffset = Math.sin(scrollPct * Math.PI * 12) * amplitude;
            targetY = centerY + sineOffset;

            // Smooth follow (slightly faster on mobile for responsiveness)
            const lerp = isMobile() ? 0.1 : 0.08;
            currentX += (targetX - currentX) * lerp;
            currentY += (targetY - currentY) * lerp;

            // Rotation based on horizontal movement direction
            const scrollDelta = targetX - currentX;
            currentRotation += scrollDelta * 0.8;

            // Apply transforms
            tennisBall.style.transform = `translate(${currentX}px, ${currentY}px)`;
            tbSvg.style.transform = `rotate(${currentRotation}deg)`;

            // Shadow reacts to bounce
            const shadowScale = 0.6 + Math.abs(Math.sin(scrollPct * Math.PI * 12)) * 0.4;
            tbShadow.style.transform = `scaleX(${shadowScale})`;
            tbShadow.style.opacity = 0.3 + shadowScale * 0.3;

            if (ballActive) {
                requestAnimationFrame(animateBall);
            } else {
                rafRunning = false;
            }
        };

        // Start/stop rAF based on scroll to avoid running when ball is hidden
        let rafRunning = false;
        const startBallAnimation = () => {
            if (!rafRunning) {
                rafRunning = true;
                requestAnimationFrame(animateBall);
            }
        };

        const onScroll = () => {
            const scrollPct = window.scrollY / pageHeight();
            if (scrollPct > 0.02 && scrollPct < 0.96) {
                startBallAnimation();
            } else {
                rafRunning = false;
                ballActive = false;
                tennisBall.classList.remove('active');
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Initial check
    }

    // ============================================
    // NAVBAR
    // ============================================
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile toggle + overlay + body lock
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const navOverlay = document.getElementById('navOverlay');

    const openMenu = () => {
        toggle.classList.add('active');
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        document.body.classList.add('menu-open');
    };

    const closeMenu = () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    };

    toggle.addEventListener('click', () => {
        navLinks.classList.contains('active') ? closeMenu() : openMenu();
    });

    navOverlay.addEventListener('click', closeMenu);

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ============================================
    // ACTIVE NAV LINK
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    const highlightNav = () => {
        const scrollPos = window.scrollY + 150;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinksAll.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });

    // ============================================
    // ANIMATED COUNTERS
    // ============================================
    const counters = document.querySelectorAll('.hs-item strong[data-target]');
    let countersAnimated = false;

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.dataset.target;
            const duration = 2500;
            const startTime = performance.now();

            const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutQuart(progress);
                counter.textContent = Math.round(easedProgress * target);
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            };
            requestAnimationFrame(update);
        });
    };

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    animateCounters();
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(heroStats);
    }

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const scrollObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.anim, .stagger').forEach(el => scrollObserver.observe(el));

    // ============================================
    // CONTACT FORM
    // ============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const btn = contactForm.querySelector('.btn-submit');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span><i class="fas fa-check" style="margin-right:8px"></i>Message envoyé !</span>';
            btn.style.background = '#2AA653';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // ============================================
    // TICKER DUPLICATION
    // ============================================
    const tickerTrack = document.querySelector('.ticker-track');
    const tickerContent = document.querySelector('.ticker-content');
    if (tickerTrack && tickerContent) {
        const clone = tickerContent.cloneNode(true);
        tickerTrack.appendChild(clone);
    }
});
