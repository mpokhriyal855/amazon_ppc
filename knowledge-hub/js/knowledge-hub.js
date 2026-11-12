/* =========================================================
   PPC GROWTH EXPERT - KNOWLEDGE HUB JAVASCRIPT
   File: knowledge-hub/js/knowledge-hub.js
   - Dynamic Knowledge Hub Module Promotion & Archive Grid
   - Lightweight chapter navigation scroll-spy + rail indicator
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // --- 1. DYNAMIC MODULE PROMOTION & ARCHIVE IN #khSyllabus ---
    function formatKhDate(dateStr) {
        if (!dateStr) return "Nov 2026";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
    }

    function createArchiveCardFromFeatured(featuredEl) {
        const title = featuredEl.getAttribute("data-title") || featuredEl.querySelector(".kh-flagship-title a")?.textContent.trim() || "";
        const url = featuredEl.getAttribute("data-url") || featuredEl.querySelector(".kh-flagship-title a")?.getAttribute("href") || "#";
        const dateStr = featuredEl.getAttribute("data-date") || "2026-11-11";
        const edition = featuredEl.getAttribute("data-edition") || "GUIDE MODULE";
        const scope = featuredEl.getAttribute("data-scope") || "Complete Guide";
        const verified = featuredEl.getAttribute("data-verified") || ("Verified " + formatKhDate(dateStr));
        const excerpt = featuredEl.getAttribute("data-excerpt") || featuredEl.querySelector(".kh-flagship-desc")?.textContent.trim() || "";
        const author = featuredEl.getAttribute("data-author") || featuredEl.querySelector(".kh-byline-text strong")?.textContent.trim() || "Anmol Pokhriyal";
        const authorRole = featuredEl.getAttribute("data-author-role") || "Founder & Amazon Growth Consultant";
        const cta = featuredEl.getAttribute("data-cta") || "Read Complete Guide";
        const badge = featuredEl.getAttribute("data-badge") || edition;

        const card = document.createElement("article");
        card.className = "kh-module-card kh-guide-card";
        card.setAttribute("data-kh-guide", "true");
        card.setAttribute("data-date", dateStr);
        card.setAttribute("data-url", url);
        card.setAttribute("data-title", title);
        card.setAttribute("data-edition", edition);
        card.setAttribute("data-scope", scope);
        card.setAttribute("data-verified", verified);
        card.setAttribute("data-excerpt", excerpt);
        card.setAttribute("data-author", author);
        card.setAttribute("data-author-role", authorRole);
        card.setAttribute("data-cta", cta);
        card.setAttribute("data-badge", badge);

        const visualSvg = featuredEl.querySelector(".kh-flagship-visual")?.innerHTML || "";
        card.innerHTML =
            '<div class="kh-module-header">' +
                '<span class="kh-module-badge"></span>' +
                '<span class="kh-module-scope"></span>' +
            '</div>' +
            '<div class="kh-module-body">' +
                '<h3 class="kh-module-title"><a href=""></a></h3>' +
                '<p class="kh-guide-excerpt"></p>' +
                '<div class="kh-guide-footer">' +
                    '<span class="kh-guide-meta"></span>' +
                    '<a href="" class="kh-guide-read-link">Read Guide →</a>' +
                '</div>' +
            '</div>';

        card.querySelector(".kh-module-badge").textContent = badge;
        card.querySelector(".kh-module-scope").textContent = scope;
        const link = card.querySelector(".kh-module-title a");
        link.href = url;
        link.textContent = title;
        card.querySelector(".kh-guide-excerpt").textContent = excerpt;
        card.querySelector(".kh-guide-meta").textContent = author + " · " + formatKhDate(dateStr);
        card.querySelector(".kh-guide-read-link").href = url;

        if (visualSvg) {
            const tpl = document.createElement("template");
            tpl.className = "kh-guide-visual-tpl";
            tpl.innerHTML = visualSvg;
            card.appendChild(tpl);
        }
        return card;
    }

    function sortAndPromoteKhModules() {
        const featuredCard = document.getElementById("khFlagshipCard");
        const syllabusGrid = document.getElementById("khSyllabusGrid");
        if (!featuredCard || !syllabusGrid) return;

        const archiveCards = Array.from(syllabusGrid.querySelectorAll("[data-kh-guide='true']"));
        const seenUrls = new Set();
        const allModules = [];

        archiveCards.forEach(function (card) {
            const url = (card.getAttribute("data-url") || card.querySelector(".kh-module-title a")?.getAttribute("href") || "").trim();
            if (!url || seenUrls.has(url)) return;
            seenUrls.add(url);
            allModules.push(card);
        });

        // Support updating #khFlagshipCard directly while keeping older [data-kh-guide] cards in #khSyllabus
        const featuredUrl = (featuredCard.getAttribute("data-url") || featuredCard.querySelector(".kh-flagship-title a")?.getAttribute("href") || "").trim();
        if (featuredUrl && !seenUrls.has(featuredUrl)) {
            seenUrls.add(featuredUrl);
            allModules.push(createArchiveCardFromFeatured(featuredCard));
        }

        if (allModules.length === 0) return;

        allModules.forEach(function (card) {
            const ds = card.getAttribute("data-date") || "2026-01-01";
            card._khParsedDate = new Date(ds).getTime() || 0;
        });

        allModules.sort(function (a, b) {
            return b._khParsedDate - a._khParsedDate;
        });

        // Promote newest module into #khFlagshipCard
        const newest = allModules[0];
        const nTitle = newest.getAttribute("data-title") || newest.querySelector(".kh-module-title a")?.textContent.trim() || "";
        const nUrl = newest.getAttribute("data-url") || newest.querySelector(".kh-module-title a")?.getAttribute("href") || "";
        const nEdition = newest.getAttribute("data-edition") || "FLAGSHIP MANUAL";
        const nScope = newest.getAttribute("data-scope") || "";
        const nDate = newest.getAttribute("data-date") || "";
        const nVerified = newest.getAttribute("data-verified") || ("Verified " + formatKhDate(nDate));
        const nExcerpt = newest.getAttribute("data-excerpt") || newest.querySelector(".kh-guide-excerpt")?.textContent.trim() || "";
        const nAuthor = newest.getAttribute("data-author") || "Anmol Pokhriyal";
        const nAuthorRole = newest.getAttribute("data-author-role") || "Founder & Amazon Growth Consultant";
        const nCta = newest.getAttribute("data-cta") || "Read Complete Guide";

        const metaTags = featuredCard.querySelectorAll(".kh-meta-tag");
        if (metaTags[0] && nEdition) metaTags[0].textContent = nEdition;
        if (metaTags[1] && nScope) metaTags[1].textContent = nScope;
        const verifiedEl = featuredCard.querySelector(".kh-meta-verified");
        if (verifiedEl) verifiedEl.textContent = nVerified;

        const titleLink = featuredCard.querySelector(".kh-flagship-title a");
        if (titleLink) {
            titleLink.textContent = nTitle;
            titleLink.href = nUrl;
        }
        const descEl = featuredCard.querySelector(".kh-flagship-desc");
        if (descEl && nExcerpt) descEl.textContent = nExcerpt;

        const authorStrong = featuredCard.querySelector(".kh-byline-text strong");
        const authorSpan = featuredCard.querySelector(".kh-byline-text span");
        if (authorStrong) authorStrong.textContent = nAuthor;
        if (authorSpan) authorSpan.textContent = nAuthorRole + " · " + nVerified;

        const ctaBtn = featuredCard.querySelector(".kh-btn-primary");
        if (ctaBtn) {
            ctaBtn.href = nUrl;
            const ctaSpan = ctaBtn.querySelector("span");
            if (ctaSpan) ctaSpan.textContent = nCta;
        }

        const tpl = newest.querySelector("template.kh-guide-visual-tpl");
        const visualContainer = featuredCard.querySelector(".kh-flagship-visual");
        if (tpl && visualContainer && tpl.innerHTML.trim()) {
            visualContainer.innerHTML = tpl.innerHTML;
        }

        // Keep newest module hidden from #khSyllabus archive grid; show previous modules in 3-col grid
        newest.style.display = "none";

        const firstStaticCard = Array.from(syllabusGrid.children).find(function (el) {
            return el.nodeType === 1 && !el.hasAttribute("data-kh-guide");
        }) || null;

        for (let i = 1; i < allModules.length; i++) {
            const prevCard = allModules[i];
            prevCard.style.display = "flex";
            const pDate = prevCard.getAttribute("data-date") || "";
            const pAuthor = prevCard.getAttribute("data-author") || "Anmol Pokhriyal";
            const metaEl = prevCard.querySelector(".kh-guide-meta");
            if (metaEl && !metaEl.textContent.trim()) {
                metaEl.textContent = pAuthor + " · " + formatKhDate(pDate);
            }
            syllabusGrid.insertBefore(prevCard, firstStaticCard);
        }
    }

    sortAndPromoteKhModules();

    // --- 2. CHAPTER NAVIGATION SCROLL-SPY + RAIL INDICATOR ---
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
