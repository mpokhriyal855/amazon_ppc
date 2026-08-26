/* =========================================================
   PPC GROWTH EXPERT - KNOWLEDGE HUB & BLOG JAVASCRIPT
   File: js/blog.js
   Pure Vanilla JS for Interactive Blog Features
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // --- 1. INSTANT SEARCH & CATEGORY FILTERING ---
    const searchInput = document.getElementById("blogSearchInput");
    const categoryChips = document.querySelectorAll(".category-chip");
    const articleCards = document.querySelectorAll(".article-card, .featured-hero-card");
    const emptyState = document.getElementById("emptySearchState");

    let currentCategory = "all";
    let currentQuery = "";

    function filterArticles() {
        let visibleCount = 0;

        articleCards.forEach(card => {
            const title = card.getAttribute("data-title") || card.querySelector("h2, h3")?.innerText.toLowerCase() || "";
            const category = card.getAttribute("data-category") || card.querySelector(".category-pill, .article-card-badge")?.innerText.toLowerCase() || "";
            const tags = card.getAttribute("data-tags") || "";
            const textContent = card.innerText.toLowerCase();

            const matchesCategory = (currentCategory === "all") || (category.includes(currentCategory.toLowerCase()));
            const matchesSearch = !currentQuery || textContent.includes(currentQuery.toLowerCase()) || tags.includes(currentQuery.toLowerCase());

            if (matchesCategory && matchesSearch) {
                card.style.display = card.classList.contains("featured-hero-card") ? "grid" : "flex";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? "block" : "none";
        }
    }

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

    // Goal Cards click handler
    const goalCards = document.querySelectorAll(".goal-card");
    goalCards.forEach(card => {
        card.addEventListener("click", function () {
            const goalCat = this.getAttribute("data-goal-category") || "all";
            categoryChips.forEach(c => {
                if (c.getAttribute("data-category") === goalCat) {
                    c.click();
                }
            });
            const articlesSection = document.getElementById("latestStrategies");
            if (articlesSection) {
                articlesSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // --- 2. READING PROGRESS BAR ---
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

    // --- 3. STICKY TABLE OF CONTENTS HIGHLIGHTING ---
    const tocLinks = document.querySelectorAll(".toc-links a");
    const sections = document.querySelectorAll(".article-body-prose section, .article-body-prose h2");

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

    // --- 4. MINI ACOS & BREAK-EVEN CALCULATOR ---
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

    // --- 5. INTERACTIVE CHECKLIST (LOCALSTORAGE) ---
    const checklistItems = document.querySelectorAll(".checklist-item");
    const storageKey = "ppc_checklist_" + (window.location.pathname.split("/").pop() || "general");

    let savedChecklist = [];
    try {
        savedChecklist = JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (e) { }

    checklistItems.forEach((item, index) => {
        if (savedChecklist.includes(index)) {
            item.classList.add("checked");
            const box = item.querySelector(".checklist-checkbox");
            if (box) box.innerText = "✓";
        }

        item.addEventListener("click", function () {
            this.classList.toggle("checked");
            const box = this.querySelector(".checklist-checkbox");
            const isChecked = this.classList.contains("checked");

            if (box) box.innerText = isChecked ? "✓" : "";

            let currentSaved = [];
            document.querySelectorAll(".checklist-item").forEach((el, idx) => {
                if (el.classList.contains("checked")) currentSaved.push(idx);
            });

            try {
                localStorage.setItem(storageKey, JSON.stringify(currentSaved));
            } catch (e) { }
        });
    });

    // --- 6. SAVE ARTICLE BOOKMARK (LOCALSTORAGE) ---
    const saveArticleBtn = document.getElementById("saveArticleBtn");
    const pageSlug = window.location.pathname.split("/").pop() || "blog-article";

    if (saveArticleBtn) {
        let savedArticles = [];
        try {
            savedArticles = JSON.parse(localStorage.getItem("ppc_saved_articles")) || [];
        } catch (e) { }

        if (savedArticles.includes(pageSlug)) {
            saveArticleBtn.innerHTML = "🔖 Saved";
            saveArticleBtn.classList.add("saved");
        }

        saveArticleBtn.addEventListener("click", function () {
            let current = [];
            try {
                current = JSON.parse(localStorage.getItem("ppc_saved_articles")) || [];
            } catch (e) { }

            if (current.includes(pageSlug)) {
                current = current.filter(id => id !== pageSlug);
                saveArticleBtn.innerHTML = "♡ Save Article";
                saveArticleBtn.classList.remove("saved");
            } else {
                current.push(pageSlug);
                saveArticleBtn.innerHTML = "🔖 Saved";
                saveArticleBtn.classList.add("saved");
            }

            try {
                localStorage.setItem("ppc_saved_articles", JSON.stringify(current));
            } catch (e) { }
        });
    }

    // --- 7. COPY ARTICLE LINK ---
    const copyLinkBtn = document.getElementById("copyLinkBtn");
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", function () {
            navigator.clipboard.writeText(window.location.href).then(() => {
                const originalText = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = "✓ Link Copied";
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalText;
                }, 2000);
            });
        });
    }

    // --- 8. WAS THIS HELPFUL FEEDBACK ---
    const helpfulBtns = document.querySelectorAll(".helpful-btn");
    const helpfulResponse = document.getElementById("helpfulResponse");

    helpfulBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            helpfulBtns.forEach(b => b.style.display = "none");
            if (helpfulResponse) {
                helpfulResponse.style.display = "block";
                helpfulResponse.innerText = "Thank you! Glad this guide helped your Amazon PPC growth.";
            }
        });
    });

    // --- 9. TOPIC RECOMMENDATION FORM SUBMISSION ---
    const topicForm = document.getElementById("topicRecForm");
    const topicMessage = document.getElementById("topicRecSuccess");

    if (topicForm) {
        topicForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const input = topicForm.querySelector("input[type='text']");
            if (input && input.value.trim().length > 0) {
                if (topicMessage) {
                    topicMessage.style.display = "block";
                    topicMessage.innerText = "✓ Thanks! We've added your recommendation to our upcoming content roadmap.";
                }
                topicForm.reset();
            }
        });
    }

});
