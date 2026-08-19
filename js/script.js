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

const mobileToggle =
    document.getElementById("mobileToggle") || document.getElementById("mobileMenu");

const navLinks =
    document.getElementById("navLinks") || document.querySelector(".navigation");


mobileToggle?.addEventListener(
    "click",
    () => {

        navLinks?.classList.toggle(
            "mobile-open"
        );

    }
);



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

const typingElement = document.getElementById("typingText");

const wordsToType = [
    "Profitable Growth.",
    "Scalable Revenue.",
    "Higher ROAS.",
    "Lower ACoS."
];


let wordIndex = 0;

let charIndex = 0;

let isDeleting = false;


function typeEffect() {

    if (!typingElement) return;


    const currentWord = wordsToType[wordIndex];


    if (isDeleting) {

        charIndex--;

    } else {

        charIndex++;

    }


    const currentSubstr = currentWord.substring(0, charIndex);

    /* Use non-breaking space when empty to prevent layout height collapse */

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

        setTimeout(typeEffect, 500);

    });

} else {

    setTimeout(typeEffect, 500);

}


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