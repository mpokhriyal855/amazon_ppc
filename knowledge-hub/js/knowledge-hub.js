/* =========================================================
   PPC GROWTH EXPERT - KNOWLEDGE HUB JAVASCRIPT
   File: knowledge-hub/js/knowledge-hub.js
   Lightweight chapter navigation scroll-spy only
   (Zero localStorage widgets, zero network dependencies)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const tocRail = document.querySelector(".kh-toc-rail");
    const tocLinks = document.querySelectorAll(".kh-toc-links a");
    const proseSections = document.querySelectorAll(".kh-doc-content section[id]");
    const mobileToc = document.querySelector(".kh-mobile-toc");

    if (tocLinks.length > 0 && proseSections.length > 0) {
        let lastActiveId = "";

        function updateActiveChapter() {
            let currentId = proseSections[0].getAttribute("id");

            proseSections.forEach(function (section) {
                if (section.getBoundingClientRect().top <= 150) {
                    currentId = section.getAttribute("id");
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
