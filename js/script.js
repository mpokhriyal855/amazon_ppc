/* =========================================================
   PPC GROWTH EXPERT
   Main JavaScript
========================================================= */


/* =========================================================
   COUNTER ANIMATION
========================================================= */

const counters =
    document.querySelectorAll("[data-target]");


function animateCounters() {

    counters.forEach(counter => {

        const target =
            parseFloat(counter.dataset.target);

        const prefix =
            counter.dataset.prefix || "";

        const suffix =
            counter.dataset.suffix || "";

        const decimals =
            parseInt(
                counter.dataset.decimal || "0"
            );

        const duration = 1600;

        const startTime =
            performance.now();


        function update(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            /*
                Smooth ease-out animation
            */

            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            const current =
                target * eased;


            counter.textContent =
                prefix +
                current.toFixed(decimals) +
                suffix;


            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                counter.textContent =
                    prefix +
                    target.toFixed(decimals) +
                    suffix;

            }

        }


        requestAnimationFrame(update);

    });

}


/*
    Start counters shortly after page load
    so the user can see the animation.
*/

setTimeout(
    animateCounters,
    500
);



/* =========================================================
   MOBILE MENU
========================================================= */

window.toggleMobileNav = function(e) {
    if (e) e.stopPropagation();
    const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
    const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
    if (!mobileToggle || !navLinks) return;

    const isOpen = navLinks.classList.contains("mobile-open");
    if (isOpen) {
        navLinks.classList.remove("mobile-open");
        mobileToggle.classList.remove("is-active");
        mobileToggle.setAttribute("aria-expanded", "false");
        mobileToggle.innerHTML = "☰";
    } else {
        navLinks.classList.add("mobile-open");
        mobileToggle.classList.add("is-active");
        mobileToggle.setAttribute("aria-expanded", "true");
        mobileToggle.innerHTML = "✕";
    }
};

window.closeMobileNav = function() {
    const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
    const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
    if (navLinks && navLinks.classList.contains("mobile-open")) {
        navLinks.classList.remove("mobile-open");
        if (mobileToggle) {
            mobileToggle.classList.remove("is-active");
            mobileToggle.setAttribute("aria-expanded", "false");
            mobileToggle.innerHTML = "☰";
        }
    }
};

function initMobileMenuSystem() {
    const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
    const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");

    if (!navLinks) return;

    // Auto-close menu when clicking any link inside the nav menu
    const links = navLinks.querySelectorAll("a");
    links.forEach(link => {
        link.addEventListener("click", () => {
            window.closeMobileNav();
        });
    });

    // Auto-close menu when clicking outside the menu / toggle
    document.addEventListener("click", (e) => {
        if (navLinks.classList.contains("mobile-open")) {
            if (!navLinks.contains(e.target) && mobileToggle && !mobileToggle.contains(e.target)) {
                window.closeMobileNav();
            }
        }
    });

    // Auto-close menu on ESC key press
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.closeMobileNav();
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileMenuSystem);
} else {
    initMobileMenuSystem();
}



/* =========================================================
   NAVBAR SCROLL EFFECT
========================================================= */

const navbarContainer =
    document.getElementById("navbarContainer") || document.querySelector(".navbar");


const scrollIndicator =
    document.querySelector(".scroll-indicator");


window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 20) {

            navbarContainer?.classList.add("navbar-scrolled");

        } else {

            navbarContainer?.classList.remove("navbar-scrolled");

        }


        if (window.scrollY > 100) {

            if (scrollIndicator) {

                scrollIndicator.style.opacity = "0";

                scrollIndicator.style.pointerEvents = "none";

            }

        } else {

            if (scrollIndicator) {

                scrollIndicator.style.opacity = "1";

                scrollIndicator.style.pointerEvents = "auto";

            }

        }

    }
);



/* =========================================================
   DASHBOARD PARALLAX
========================================================= */

const dashboard =
    document.querySelector(
        ".analytics-dashboard"
    );


const heroRight =
    document.querySelector(
        ".hero-right"
    );


if (
    dashboard &&
    heroRight &&
    window.innerWidth > 900
) {

    heroRight.addEventListener(
        "mousemove",
        event => {

            const rect =
                heroRight.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;

            const y =
                event.clientY -
                rect.top;


            const centerX =
                rect.width / 2;

            const centerY =
                rect.height / 2;


            const rotateY =
                (x - centerX) /
                centerX *
                1.5;


            const rotateX =
                (centerY - y) /
                centerY *
                1.2;


            dashboard.style.transform =
                `
                perspective(1200px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-3px)
                scale(1.003)
                `;

        }
    );


    heroRight.addEventListener(
        "mouseleave",
        () => {

            dashboard.style.transform =
                "";

        }
    );

}



/* =========================================================
   POPUP NOTIFICATIONS HANDLED BY JS/NOTIFICATIONS.JS
========================================================= */



/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".service-card, .process-item, .result-grid div, .about-box"
    );


const revealObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(
                entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.style.opacity =
                            "1";

                        entry.target.style.transform =
                            "translateY(0)";

                        revealObserver.unobserve(
                            entry.target
                        );

                    }

                }
            );

        },
        {
            threshold: 0.15
        }
    );


revealElements.forEach(
    element => {

        element.style.opacity = "0";

        element.style.transform =
            "translateY(25px)";

        element.style.transition =
            "opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1)";

        revealObserver.observe(
            element
        );

    }
);



/* =========================================================
   REDUCED MOTION
========================================================= */

const reducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


if (reducedMotion.matches) {

    document
        .querySelectorAll("*")
        .forEach(element => {

            element.style.animationDuration =
                "0.001ms";

            element.style.transitionDuration =
                "0.001ms";

        });

}



/* =========================================================
   TYPEWRITER EFFECT FOR HERO HEADLINE
========================================================= */

(function initTypewriter() {
    const wordsToType = [
        "Reduce ACOS.",
        "Profitable Growth.",
        "Maximize ROAS."
    ];

    let wordIndex = 0;
    let charIndex = wordsToType[0].length;
    let isDeleting = true;

    function typeEffect() {
        const typingElement = document.getElementById("typingText");
        if (!typingElement) return;

        const currentWord = wordsToType[wordIndex];

        if (isDeleting) {
            charIndex--;
        } else {
            charIndex++;
        }

        const currentSubstr = currentWord.substring(0, charIndex);
        typingElement.textContent = currentSubstr || "\u00A0";

        let typeSpeed = isDeleting ? 35 : 75;

        if (!isDeleting && charIndex === currentWord.length) {
            typeSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % wordsToType.length;
            typeSpeed = 350;
        }

        setTimeout(typeEffect, typeSpeed);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            setTimeout(typeEffect, 1800);
        });
    } else {
        setTimeout(typeEffect, 1800);
    }
})();


/* =========================================================
   SMOOTH FAQ ACCORDION TRANSITIONS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const faqSummaries = document.querySelectorAll(".abt-faq-item summary");

    faqSummaries.forEach(summary => {
        summary.addEventListener("click", (e) => {
            const details = summary.parentElement;
            const answer = details.querySelector(".abt-faq-answer");

            if (!answer) return;

            if (details.hasAttribute("open")) {
                e.preventDefault();
                answer.style.gridTemplateRows = "0fr";
                answer.style.opacity = "0";

                setTimeout(() => {
                    details.removeAttribute("open");
                    answer.style.gridTemplateRows = "";
                    answer.style.opacity = "";
                }, 350);
            } else {
                document.querySelectorAll(".abt-faq-item[open]").forEach(otherDetails => {
                    if (otherDetails !== details) {
                        const otherAnswer = otherDetails.querySelector(".abt-faq-answer");
                        if (otherAnswer) {
                            otherAnswer.style.gridTemplateRows = "0fr";
                            otherAnswer.style.opacity = "0";
                            setTimeout(() => {
                                otherDetails.removeAttribute("open");
                                otherAnswer.style.gridTemplateRows = "";
                                otherAnswer.style.opacity = "";
                            }, 350);
                        } else {
                            otherDetails.removeAttribute("open");
                        }
                    }
                });
            }
        });
    });
});

/* =========================================================
   SMART MOBILE ACCORDION / COLLAPSE SYSTEM FOR DENSE GRIDS
   Reduces vertical scroll on mobile and reveals content smoothly with buttons.
========================================================= */

function initMobileCollapseSystem() {
    if (window.innerWidth > 768) return;

    // Selector definitions for long mobile grids across the site
    const targetGridSelectors = [
        { selector: '.problem-grid', initialCount: 3, label: 'Problem Areas' },
        { selector: '.services-ref-grid', initialCount: 3, label: 'Services' },
        { selector: '.service-cards-container', initialCount: 2, label: 'Packages' },
        { selector: '.testimonials-grid', initialCount: 2, label: 'Testimonials' },
        { selector: '.index-faq-accordion-wrapper', initialCount: 3, label: 'FAQs' },
        { selector: '.abt-why-grid', initialCount: 3, label: 'Highlights' },
        { selector: '.abt-help-grid', initialCount: 2, label: 'Seller Types' },
        { selector: '.abt-tools-grid', initialCount: 6, label: 'Tools & Tech Stack' },
        { selector: '.case-faq-section .faq-grid', initialCount: 2, label: 'FAQs' },
        { selector: '.abt-faq-list', initialCount: 3, label: 'FAQs' },
        { selector: '.case-studies-grid', initialCount: 2, label: 'Case Studies' },
        { selector: '.reviews-grid', initialCount: 2, label: 'Reviews' }
    ];

    targetGridSelectors.forEach(({ selector, initialCount, label }) => {
        const containers = document.querySelectorAll(selector);

        containers.forEach(container => {
            if (container.dataset.mobileCollapseInit === 'true') return;

            // Direct children items
            const children = Array.from(container.children).filter(child => !child.classList.contains('mobile-expand-wrapper'));

            if (children.length <= initialCount) return;

            container.dataset.mobileCollapseInit = 'true';
            container.classList.add('mobile-collapsible-active');

            // Tag hidden items
            children.forEach((child, index) => {
                if (index >= initialCount) {
                    child.classList.add('mobile-hidden-item');
                }
            });

            // Create Show More / Less button
            const wrapper = document.createElement('div');
            wrapper.className = 'mobile-expand-wrapper';

            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'mobile-expand-btn';
            const hiddenCount = children.length - initialCount;
            button.innerHTML = `<span>Show ${hiddenCount} More ${label}</span> <span class="mobile-expand-icon">↓</span>`;

            wrapper.appendChild(button);

            // Append after container
            if (container.nextSibling) {
                container.parentNode.insertBefore(wrapper, container.nextSibling);
            } else {
                container.parentNode.appendChild(wrapper);
            }

            button.addEventListener('click', function () {
                const isExpanded = container.classList.contains('is-expanded');

                if (isExpanded) {
                    container.classList.remove('is-expanded');
                    button.classList.remove('is-open');
                    button.innerHTML = `<span>Show ${hiddenCount} More ${label}</span> <span class="mobile-expand-icon">↓</span>`;
                    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    container.classList.add('is-expanded');
                    button.classList.add('is-open');
                    button.innerHTML = `<span>Show Less</span> <span class="mobile-expand-icon">↓</span>`;
                }
            });
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileCollapseSystem);
} else {
    initMobileCollapseSystem();
}

window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        initMobileCollapseSystem();
    }
});