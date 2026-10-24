/* =========================================================
   3D FLIP TESTIMONIAL CARDS SCRIPT
   Provides reliable hover flip, hover/click flip-back, and touch support
========================================================= */
function initTestimonialFlipCards() {
    const cards = document.querySelectorAll('.testimonial-flip-card');

    cards.forEach(card => {
        const flipBackBtn = card.querySelector('.back-flip-icon');

        // Function to flip back to front
        const flipBackToFront = (e) => {
            if (e) e.stopPropagation();
            card.classList.remove('is-flipped');
            card.classList.add('unflipped');
        };

        // Hover or click on the "Flip back" button flips back to front
        if (flipBackBtn) {
            flipBackBtn.addEventListener('mouseenter', flipBackToFront);
            flipBackBtn.addEventListener('click', flipBackToFront);
        }

        // Tapping / clicking the card flips or un-flips
        card.addEventListener('click', (e) => {
            if (e.target.closest('.back-flip-icon')) return;
            if (card.classList.contains('unflipped')) {
                card.classList.remove('unflipped');
                card.classList.add('is-flipped');
            } else {
                card.classList.toggle('is-flipped');
            }
        });

        // When mouse leaves the card, reset unflipped and is-flipped so clean hover works
        card.addEventListener('mouseleave', () => {
            card.classList.remove('unflipped');
            card.classList.remove('is-flipped');
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialFlipCards);
} else {
    initTestimonialFlipCards();
}
