/* =========================================================
   UNIVERSAL MOBILE NAVBAR CONTROLLER
   File: js/navbar.js
   Works on all pages: index, services, case-studies, about, contact
========================================================= */

(function() {
    // Global toggle function
    window.toggleMobileNav = function(e) {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
            e.stopPropagation();
        }
        const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        
        if (!mobileToggle || !navLinks) return;

        const isOpen = navLinks.classList.contains("mobile-open");
        if (isOpen) {
            window.closeMobileNav();
        } else {
            window.openMobileNav();
        }
    };

    window.openMobileNav = function() {
        const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        if (!mobileToggle || !navLinks) return;

        navLinks.classList.add("mobile-open");
        mobileToggle.classList.add("is-active");
        mobileToggle.setAttribute("aria-expanded", "true");
        mobileToggle.innerHTML = "✕";
    };

    window.closeMobileNav = function() {
        const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        if (!navLinks) return;

        navLinks.classList.remove("mobile-open");
        if (mobileToggle) {
            mobileToggle.classList.remove("is-active");
            mobileToggle.setAttribute("aria-expanded", "false");
            mobileToggle.innerHTML = "☰";
        }
    };

    // Global Event Delegation for clicks and touch
    let lastToggleTime = 0;
    function handleToggleEvent(e) {
        const toggleBtn = e.target.closest("#mobileToggle, .mobile-toggle");
        if (toggleBtn) {
            const now = Date.now();
            if (now - lastToggleTime < 300) return; // Prevent double trigger on mobile
            lastToggleTime = now;
            
            e.preventDefault();
            e.stopPropagation();
            window.toggleMobileNav(e);
            return true;
        }
        return false;
    }

    document.addEventListener("pointerdown", function(e) {
        const toggleBtn = e.target.closest("#mobileToggle, .mobile-toggle");
        if (toggleBtn) {
            handleToggleEvent(e);
        }
    }, { passive: false });

    document.addEventListener("click", function(e) {
        if (handleToggleEvent(e)) return;

        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        if (!navLinks) return;

        // 2. Click on link inside Nav Links
        if (navLinks.contains(e.target) && e.target.closest("a")) {
            window.closeMobileNav();
            return;
        }

        // 3. Click outside Nav Links when open
        if (navLinks.classList.contains("mobile-open")) {
            if (!navLinks.contains(e.target)) {
                window.closeMobileNav();
            }
        }
    });

    // Close on Escape Key
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            window.closeMobileNav();
        }
    });
})();
