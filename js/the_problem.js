/* =========================================================
   THE PROBLEM SECTION INTERACTIVE CONTROLLER
   File: js/the_problem.js
========================================================= */

(function () {

    document.addEventListener("DOMContentLoaded", () => {

        const problemCards = document.querySelectorAll(".problem-card");


        if (!problemCards.length) return;


        /* Intersection Observer for staggered scroll reveal */

        const observerOptions = {

            threshold: 0.12,

            rootMargin: "0px 0px -40px 0px"

        };


        const cardObserver = new IntersectionObserver((entries, observer) => {

            entries.forEach((entry, index) => {

                if (entry.isIntersecting) {

                    setTimeout(() => {

                        entry.target.classList.add("problem-card-visible");

                        entry.target.classList.remove("problem-card-hidden");

                    }, (index % 3) * 110);


                    observer.unobserve(entry.target);

                }

            });

        }, observerOptions);


        problemCards.forEach(card => {

            card.classList.add("problem-card-hidden");

            cardObserver.observe(card);

        });

    });

})();
