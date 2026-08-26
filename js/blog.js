/* =========================================================
   PPC GROWTH EXPERT - KNOWLEDGE HUB & BLOG JAVASCRIPT
   File: js/blog.js
   Pure Vanilla JS with Dynamic Date Sorting & Filters
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // --- DOM REFERENCES ---
    const searchInput = document.getElementById("blogSearchInput");
    const categoryChips = document.querySelectorAll(".category-chip");
    const emptyState = document.getElementById("emptySearchState");
    const articlesContainer = document.getElementById("articlesGrid");
    const heroCardContainer = document.getElementById("featuredHeroSlot");

    let currentCategory = "all";
    let currentQuery = "";

    // --- 1. FILTERING FUNCTION ---
    function filterArticles() {
        const heroCard = document.querySelector(".featured-hero-card");
        const gridCards = document.querySelectorAll(".articles-grid .article-card");
        let visibleCount = 0;

        if (heroCard) {
            const cat = (heroCard.getAttribute("data-category") || "").toLowerCase();
            const text = ((heroCard.getAttribute("data-title") || "") + " " + (heroCard.getAttribute("data-excerpt") || "")).toLowerCase();
            const matchesCat = (currentCategory === "all") || cat.includes(currentCategory.toLowerCase());
            const matchesSearch = !currentQuery || text.includes(currentQuery.toLowerCase());

            if (matchesCat && matchesSearch) {
                heroCard.style.display = "grid";
                visibleCount++;
            } else {
                heroCard.style.display = "none";
            }
        }

        gridCards.forEach(card => {
            const cat = (card.getAttribute("data-category") || "").toLowerCase();
            const text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-excerpt") || "")).toLowerCase();
            const matchesCat = (currentCategory === "all") || cat.includes(currentCategory.toLowerCase());
            const matchesSearch = !currentQuery || text.includes(currentQuery.toLowerCase());

            if (matchesCat && matchesSearch) {
                card.style.display = "flex";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? "block" : "none";
        }
    }

    // --- 2. DYNAMIC DATE SORTING & FEATURED POST PROMOTION ---
    function renderSortedArticles() {
        const rawArticles = Array.from(document.querySelectorAll(".article-item-source"));
        if (rawArticles.length === 0) return;

        // Sort by data-date descending (newest date first)
        rawArticles.sort((a, b) => {
            const dateA = new Date(a.getAttribute("data-date") || "2026-01-01");
            const dateB = new Date(b.getAttribute("data-date") || "2026-01-01");
            return dateB - dateA;
        });

        // The newest article becomes the Featured Hero post at top
        const featuredArticle = rawArticles[0];
        const gridArticles = rawArticles.slice(1);

        if (heroCardContainer && featuredArticle) {
            heroCardContainer.innerHTML = createFeaturedHeroHTML(featuredArticle);
        }

        if (articlesContainer) {
            articlesContainer.innerHTML = "";
            gridArticles.forEach(art => {
                articlesContainer.appendChild(createGridCardElement(art));
            });
        }

        // Apply filters after rendering
        filterArticles();
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    function createFeaturedHeroHTML(art) {
        const title = art.getAttribute("data-title") || "";
        const category = art.getAttribute("data-category") || "Amazon PPC";
        const dateRaw = art.getAttribute("data-date") || "";
        const dateFormatted = formatDateDisplay(dateRaw);
        const excerpt = art.getAttribute("data-excerpt") || "";
        const link = art.getAttribute("data-link") || "blog-reduce-amazon-acos.html";
        const author = art.getAttribute("data-author") || "Anmol Pokhriyal";
        const readTime = art.getAttribute("data-readtime") || "8 min read";

        return `
            <article class="featured-hero-card" data-category="${category.toLowerCase()}" data-title="${title.toLowerCase()}" data-excerpt="${excerpt.toLowerCase()}">
                <div class="featured-visual">
                    <svg viewBox="0 0 450 200" width="100%" height="100%" fill="none">
                        <rect width="450" height="200" rx="10" fill="#040711"/>
                        <path d="M 30 150 Q 120 140, 200 80 T 420 30" stroke="#38bdf8" stroke-width="3" fill="none"/>
                        <path d="M 30 150 Q 120 140, 200 80 T 420 30 L 420 180 L 30 180 Z" fill="url(#gradHero)" opacity="0.2"/>
                        <circle cx="420" cy="30" r="5" fill="#10b981"/>
                        <text x="210" y="75" fill="#38bdf8" font-family="Plus Jakarta Sans" font-size="12" font-weight="700">Ad Revenue +184%</text>
                        <defs>
                            <linearGradient id="gradHero" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#38bdf8"/>
                                <stop offset="100%" stop-color="#040711"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <a href="${link}" class="card-arrow-icon" aria-label="Read featured article">↗</a>
                </div>
                <div class="featured-content">
                    <div>
                        <div class="featured-meta-top">
                            <span class="category-pill">${category}</span>
                            <span class="publish-date">${dateFormatted}</span>
                        </div>
                        <h2 class="featured-title">
                            <a href="${link}">${title}</a>
                        </h2>
                        <p class="featured-description">${excerpt}</p>
                    </div>
                    <div class="featured-author-row">
                        <div class="author-info">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="${author}" class="author-avatar">
                            <div>
                                <span class="author-name">${author}</span>
                                <span class="read-time">${readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    function createGridCardElement(art) {
        const title = art.getAttribute("data-title") || "";
        const category = art.getAttribute("data-category") || "Amazon PPC";
        const dateRaw = art.getAttribute("data-date") || "";
        const dateFormatted = formatDateDisplay(dateRaw);
        const excerpt = art.getAttribute("data-excerpt") || "";
        const link = art.getAttribute("data-link") || "blog-reduce-amazon-acos.html";
        const author = art.getAttribute("data-author") || "Anmol Pokhriyal";
        const readTime = art.getAttribute("data-readtime") || "5 min read";

        const div = document.createElement("article");
        div.className = "article-card";
        div.setAttribute("data-category", category.toLowerCase());
        div.setAttribute("data-title", title.toLowerCase());
        div.setAttribute("data-excerpt", excerpt.toLowerCase());

        div.innerHTML = `
            <div class="article-card-image">
                <svg viewBox="0 0 320 160" width="100%" height="100%">
                    <rect width="320" height="160" fill="#040711"/>
                    <path d="M20 120 C100 120, 150 40, 300 20" stroke="#38bdf8" stroke-width="2.5" fill="none"/>
                    <circle cx="300" cy="20" r="4" fill="#38bdf8"/>
                </svg>
                <a href="${link}" class="card-arrow-icon" aria-label="Read article">↗</a>
            </div>
            <div class="article-card-body">
                <div>
                    <div class="article-card-meta">
                        <span class="category-pill">${category}</span>
                        <span class="publish-date">${dateFormatted}</span>
                    </div>
                    <h3 class="article-card-title">
                        <a href="${link}">${title}</a>
                    </h3>
                    <p class="article-card-excerpt">${excerpt}</p>
                </div>
                <div class="article-card-footer">
                    <div class="article-author-mini">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="${author}" class="article-author-avatar-mini">
                        <span>${author} · ${readTime}</span>
                    </div>
                </div>
            </div>
        `;

        return div;
    }

    // INITIALIZE SORTING AND RENDERING
    renderSortedArticles();

    // --- 3. SEARCH & CATEGORY LISTENERS ---
    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            currentQuery = e.target.value.trim();
            filterArticles();
        });
    }

    categoryChips.forEach(chip => {
        chip.addEventListener("click", function () {
            categoryChips.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            currentCategory = this.getAttribute("data-category") || "all";
            filterArticles();
        });
    });

    // --- 4. READING PROGRESS BAR ---
    const progressBar = document.getElementById("articleProgressBar");
    if (progressBar) {
        window.addEventListener("scroll", function () {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.scrollY / totalHeight) * 100;
                progressBar.style.width = Math.min(100, Math.max(0, progress)) + "%";
            }
        });
    }

    // --- 5. STICKY TOC HIGHLIGHTING ---
    const tocLinks = document.querySelectorAll(".toc-links a");
    const sections = document.querySelectorAll(".article-body-prose section");

    if (tocLinks.length > 0 && sections.length > 0) {
        window.addEventListener("scroll", function () {
            let current = "";
            sections.forEach(sec => {
                const sectionTop = sec.offsetTop - 120;
                if (window.scrollY >= sectionTop) {
                    current = sec.getAttribute("id");
                }
            });

            tocLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href") === "#" + current) {
                    link.classList.add("active");
                }
            });
        });
    }

    // --- 6. MINI ACOS CALCULATOR ---
    const calcSpend = document.getElementById("miniCalcSpend");
    const calcSales = document.getElementById("miniCalcSales");
    const calcResultAcos = document.getElementById("miniCalcResultAcos");
    const calcResultRoas = document.getElementById("miniCalcResultRoas");

    function updateMiniCalculator() {
        if (!calcSpend || !calcSales || !calcResultAcos || !calcResultRoas) return;
        const spend = parseFloat(calcSpend.value) || 0;
        const sales = parseFloat(calcSales.value) || 0;

        if (sales > 0 && spend >= 0) {
            const acos = ((spend / sales) * 100).toFixed(1);
            const roas = (sales / spend).toFixed(2);
            calcResultAcos.innerText = acos + "%";
            calcResultRoas.innerText = isFinite(roas) ? roas + "x" : "0x";
        } else {
            calcResultAcos.innerText = "0.0%";
            calcResultRoas.innerText = "0.0x";
        }
    }

    if (calcSpend && calcSales) {
        calcSpend.addEventListener("input", updateMiniCalculator);
        calcSales.addEventListener("input", updateMiniCalculator);
        updateMiniCalculator();
    }

    // --- 7. TOPIC RECOMMENDATION SUBMISSION & VIEWER ---
    const topicForm = document.getElementById("topicRecForm");
    const topicMessage = document.getElementById("topicRecSuccess");
    const recsToggleBtn = document.getElementById("toggleViewRecsBtn");
    const recsDisplayPanel = document.getElementById("recsDisplayPanel");

    function renderSavedRecommendations() {
        if (!recsDisplayPanel) return;
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem("ppc_topic_recommendations")) || [];
        } catch (e) { }

        if (saved.length === 0) {
            recsDisplayPanel.innerHTML = "<div style='color:#94a3b8; font-size:13px;'>No topic recommendations submitted yet. Be the first to suggest one!</div>";
        } else {
            recsDisplayPanel.innerHTML = saved.map(item => `
                <div class="rec-list-item">
                    <span>💡 ${escapeHTML(item.topic)}</span>
                    <span style="font-size:11px; color:#64748b;">${escapeHTML(item.date)}</span>
                </div>
            `).join("");
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    if (topicForm) {
        topicForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const input = topicForm.querySelector("input[type='text']");
            if (input && input.value.trim().length > 0) {
                const topicText = input.value.trim();
                let saved = [];
                try {
                    saved = JSON.parse(localStorage.getItem("ppc_topic_recommendations")) || [];
                } catch (e) { }

                const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                saved.unshift({ topic: topicText, date: todayStr });
                
                try {
                    localStorage.setItem("ppc_topic_recommendations", JSON.stringify(saved));
                } catch (e) { }

                if (topicMessage) {
                    topicMessage.style.display = "block";
                    topicMessage.innerText = "✓ Thanks! Your topic suggestion has been saved to our content roadmap.";
                }
                topicForm.reset();
                renderSavedRecommendations();
            }
        });
    }

    if (recsToggleBtn && recsDisplayPanel) {
        recsToggleBtn.addEventListener("click", function () {
            const isOpen = recsDisplayPanel.style.display === "block";
            recsDisplayPanel.style.display = isOpen ? "none" : "block";
            if (!isOpen) renderSavedRecommendations();
        });
    }

});
