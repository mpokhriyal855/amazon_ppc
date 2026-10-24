/* =========================================================
   UNIVERSAL MOBILE NAVBAR CONTROLLER
   File: js/navbar.js
   Works on all pages: index, services, case-studies, about, contact
========================================================= */

(function() {
    let lastToggleTime = 0;

    // Global toggle function
    window.toggleMobileNav = function(e) {
        if (e) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
        }
        const now = Date.now();
        if (now - lastToggleTime < 250) return;
        lastToggleTime = now;

        const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        
        if (!mobileToggle || !navLinks) return;

        const isOpen = navLinks.classList.contains("mobile-open") || navLinks.classList.contains("active");
        if (isOpen) {
            window.closeMobileNav();
        } else {
            window.openMobileNav();
        }
    };

    window.openMobileNav = function() {
        const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        if (!navLinks) return;

        navLinks.classList.add("mobile-open");
        navLinks.classList.add("active");
        if (mobileToggle) {
            mobileToggle.classList.add("is-active");
            mobileToggle.setAttribute("aria-expanded", "true");
            mobileToggle.innerHTML = "✕";
        }
    };

    window.closeMobileNav = function() {
        const mobileToggle = document.getElementById("mobileToggle") || document.querySelector(".mobile-toggle");
        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        if (!navLinks) return;

        navLinks.classList.remove("mobile-open");
        navLinks.classList.remove("active");
        if (mobileToggle) {
            mobileToggle.classList.remove("is-active");
            mobileToggle.setAttribute("aria-expanded", "false");
            mobileToggle.innerHTML = "☰";
        }
    };

    // Global Event Delegation for clicks and mobile navigation
    document.addEventListener("click", function(e) {
        // 1. Mobile toggle button click
        const toggleBtn = e.target.closest("#mobileToggle, .mobile-toggle");
        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            window.toggleMobileNav(e);
            return;
        }

        // 2. On mobile: dropdown trigger click toggles submenu accordion
        const dropdownTrigger = e.target.closest('.nav-dropdown-trigger');
        if (dropdownTrigger && window.innerWidth <= 900) {
            e.preventDefault();
            e.stopPropagation();
            const parentDropdown = dropdownTrigger.closest('.nav-dropdown');
            if (parentDropdown) {
                const wasOpen = parentDropdown.classList.contains('is-open');
                document.querySelectorAll('.nav-dropdown.is-open').forEach(d => {
                    if (d !== parentDropdown) d.classList.remove('is-open');
                });
                parentDropdown.classList.toggle('is-open', !wasOpen);
            }
            return;
        }

        // 3. Close open desktop dropdowns when clicking outside
        document.querySelectorAll('.nav-dropdown.is-open').forEach(d => {
            if (!d.contains(e.target)) {
                d.classList.remove('is-open');
            }
        });

        const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
        if (!navLinks) return;

        // 4. Click on normal link inside Nav Links -> close mobile menu
        if (navLinks.contains(e.target) && e.target.closest("a:not(.nav-dropdown-trigger)")) {
            window.closeMobileNav();
            return;
        }

        // 5. Click outside Nav Links when open -> close mobile menu
        if (navLinks.classList.contains("mobile-open") || navLinks.classList.contains("active")) {
            if (!navLinks.contains(e.target) && !e.target.closest("#mobileToggle, .mobile-toggle")) {
                window.closeMobileNav();
            }
        }
    });

    // Dynamic Navbar Sync & Active State Controller
    document.addEventListener("DOMContentLoaded", function() {
        // 1. Ensure PPC OPTIMIZATION & Quick Commerce items are present in mega-menu-grid
        const megaGrid = document.querySelector(".mega-menu-grid");
        if (megaGrid && !megaGrid.querySelector('a[href*="amazon-ppc-waste-calculator.html"]')) {
            const optCol = document.createElement("div");
            optCol.className = "mega-menu-col";
            optCol.innerHTML = `
                <div class="mega-col-title">PPC OPTIMIZATION</div>
                <a href="amazon-ppc-waste-calculator.html" class="mega-menu-item">
                    <span class="mega-item-icon">🧯</span>
                    <div class="mega-item-text">
                        <span class="mega-item-title">Amazon PPC Waste Calculator</span>
                        <span class="mega-item-desc">Find inefficient ad spend</span>
                    </div>
                </a>
            `;
            // Insert before Quick Commerce or at end
            const qcCol = megaGrid.querySelector('a[href*="blinkit-cpm-calculator.html"]')?.closest('.mega-menu-col');
            if (qcCol) {
                megaGrid.insertBefore(optCol, qcCol);
            } else {
                megaGrid.appendChild(optCol);
            }
        }

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
        const pathname = window.location.pathname.toLowerCase();
        const currentPath = pathname.split("/").pop() || "index.html";
        const navItems = document.querySelectorAll(".nav-links > .nav-item, .nav-dropdown-trigger");
        
        navItems.forEach(item => {
            const href = (item.getAttribute("href") || "").toLowerCase();
            if (href === currentPath || (currentPath !== "index.html" && href.endsWith("/" + currentPath))) {
                item.classList.add("active");
            } else if (pathname.includes("/services/") || currentPath.includes("services")) {
                if (href.includes("services")) {
                    item.classList.add("active");
                }
            } else if (pathname.includes("/calculators/") || currentPath.includes("calculator") || currentPath.includes("resources")) {
                if (item.classList.contains("nav-dropdown-trigger") && (href.includes("calculators") || href.includes("resources"))) {
                    item.classList.add("active");
                }
            } else if (pathname.includes("/blog/") || currentPath.includes("blog")) {
                if (href.includes("blog")) {
                    item.classList.add("active");
                }
            }
        });
    });
})();
