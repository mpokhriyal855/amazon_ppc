/* =========================================================
   3D FLIP TESTIMONIAL CARDS SCRIPT
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.testimonial-flip-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    });
});
