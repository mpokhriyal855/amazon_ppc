/* =========================================================
   ABOUT PAGE INTERACTIVE SCRIPT
   File: js/about.js
========================================================= */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        /* 1. COUNT-UP STAT COUNTERS */

        const statNumbers = document.querySelectorAll(".stat-number[data-count]");


        if (statNumbers.length) {

            const countObserver = new IntersectionObserver((entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        const el = entry.target;

                        const target = parseInt(el.getAttribute("data-count"), 10);

                        const suffix = el.getAttribute("data-suffix") || "";

                        const prefix = el.getAttribute("data-prefix") || "";

                        let count = 0;

                        const duration = 1800;

                        const stepTime = Math.abs(Math.floor(duration / target));


                        const timer = setInterval(() => {

                            count += Math.ceil(target / 40);

                            if (count >= target) {

                                count = target;

                                clearInterval(timer);

                            }

                            el.textContent = prefix + count.toLocaleString() + suffix;

                        }, 35);


                        observer.unobserve(el);

                    }

                });

            }, { threshold: 0.2 });


            statNumbers.forEach(num => countObserver.observe(num));

        }


        /* 2. SCROLL REVEAL FOR VALUES AND FOUNDER SECTION */

        const revealElements = document.querySelectorAll(".value-card, .founder-section, .tldr-box");


        if (revealElements.length) {

            const revealObserver = new IntersectionObserver((entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.style.opacity = "1";

                        entry.target.style.transform = "translateY(0)";

                        observer.unobserve(entry.target);

                    }

                });

            }, { threshold: 0.1 });


            revealElements.forEach(el => {

                el.style.opacity = "0";

                el.style.transform = "translateY(25px)";

                el.style.transition = "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";

                revealObserver.observe(el);

            });

        }

    });

})();
