/* =========================================================
   PPC GROWTH EXPERT - KNOWLEDGE HUB JAVASCRIPT
   File: knowledge-hub/js/knowledge-hub.js
   Lightweight chapter navigation scroll-spy + rail indicator
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const tocRail = document.querySelector(".kh-toc-rail");
    const tocLinks = document.querySelectorAll(".kh-toc-links a");
    const proseSections = document.querySelectorAll(".kh-doc-content section[id]");
    const mobileToc = document.querySelector(".kh-mobile-toc");
    const railBadge = document.getElementById("khRailBadge");
    const railProgress = document.getElementById("khRailProgress");

    if (tocLinks.length > 0 && proseSections.length > 0) {
        let lastActiveId = "";

        function updateActiveChapter() {
            let currentIndex = 0;
            let currentId = proseSections[0].getAttribute("id");

            proseSections.forEach(function (section, index) {
                if (section.getBoundingClientRect().top <= 160) {
                    currentId = section.getAttribute("id");
                    currentIndex = index;
                }
            });

            if (currentId === lastActiveId) {
                return;
            }
            lastActiveId = currentId;

            let activeLink = null;
            tocLinks.forEach(function (link) {
                const isActive = link.getAttribute("href") === "#" + currentId;
                link.classList.toggle("active", isActive);
                if (isActive) {
                    activeLink = link;
                }
            });

            if (railBadge) {
                const label = String(currentIndex + 1).padStart(2, "0") + " / " + proseSections.length;
                railBadge.textContent = label;
            }

            if (railProgress) {
                const pct = Math.max(5, Math.round(((currentIndex + 1) / proseSections.length) * 100));
                railProgress.style.width = pct + "%";
            }

            if (tocRail && activeLink && tocRail.scrollHeight > tocRail.clientHeight) {
                const linkTop = activeLink.offsetTop;
                const linkBottom = linkTop + activeLink.offsetHeight;
                const viewTop = tocRail.scrollTop;
                const viewBottom = viewTop + tocRail.clientHeight;
                if (linkTop < viewTop + 20 || linkBottom > viewBottom - 20) {
                    tocRail.scrollTop = Math.max(0, linkTop - tocRail.clientHeight / 2 + activeLink.offsetHeight / 2);
                }
            }
        }

        window.addEventListener("scroll", updateActiveChapter, { passive: true });
        updateActiveChapter();
    }

    if (mobileToc) {
        mobileToc.querySelectorAll("a[href^='#']").forEach(function (anchor) {
            anchor.addEventListener("click", function () {
                mobileToc.open = false;
            });
        });
    }
});
