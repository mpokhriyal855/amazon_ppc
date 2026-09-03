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

        // Dropdown toggle click handling (inline onclick handles toggle; prevent double toggle)
        const dropdownTrigger = e.target.closest('.nav-dropdown-trigger');
        if (dropdownTrigger) {
            return;
        }

        // Close dropdown when clicking outside
        document.querySelectorAll('.nav-dropdown.is-open').forEach(d => {
            if (!d.contains(e.target)) {
                d.classList.remove('is-open');
            }
        });

        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        if (!navLinks) return;

        // 2. Click on normal link inside Nav Links
        if (navLinks.contains(e.target) && e.target.closest("a:not(.nav-dropdown-trigger)")) {
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

    // Dynamic Navbar Sync & Active State Controller
    document.addEventListener("DOMContentLoaded", function() {
        // 1. Ensure Quick Commerce item is present in mega-menu-grid
        const megaGrid = document.querySelector(".mega-menu-grid");
        if (megaGrid && !megaGrid.querySelector('a[href*="blinkit-cpm-calculator.html"]')) {
            const qcCol = document.createElement("div");
            qcCol.className = "mega-menu-col";
            qcCol.innerHTML = `
                <div class="mega-col-title">QUICK COMMERCE</div>
                <a href="blinkit-cpm-calculator.html" class="mega-menu-item">
                    <span class="mega-item-icon">⚡</span>
                    <div class="mega-item-text">
                        <span class="mega-item-title">Blinkit CPM Calculator</span>
                        <span class="mega-item-desc">Measure cost per 1,000 impressions</span>
                    </div>
                </a>
            `;
            megaGrid.appendChild(qcCol);
        }

        // 2. Set dynamic active states
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        const navItems = document.querySelectorAll(".nav-links > .nav-item, .nav-dropdown-trigger");
        
        navItems.forEach(item => {
            const href = item.getAttribute("href");
            if (href === currentPath) {
                item.classList.add("active");
            } else if (currentPath.includes("calculator") || currentPath.includes("resources")) {
                if (item.classList.contains("nav-dropdown-trigger") || href === "resources.html") {
                    item.classList.add("active");
                }
            }
        });
    });
})();
