/* =========================================================
   PPC GROWTH EXPERT - KNOWLEDGE HUB & BLOG JAVASCRIPT
   File: js/blog.js
   Pure Vanilla JS for Interactive Blog Features & Auto-Sorting
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // --- 1. DYNAMIC AUTO-SORT ARTICLES BY DATE & PROMOTE NEWEST TO FEATURED HERO ---
    function sortAndPromoteArticles() {
        const articlesGrid = document.getElementById("articlesGrid");
        const featuredCard = document.getElementById("featuredHeroCard");
        if (!articlesGrid || !featuredCard) return;

        // Collect all articles (both grid items and featured item)
        const allArticles = Array.from(document.querySelectorAll("[data-article-item='true']"));

        if (allArticles.length === 0) return;

        // Parse date for each article (Format: YYYY-MM-DD or readable string)
        allArticles.forEach(item => {
            const dateStr = item.getAttribute("data-date") || "2026-08-01";
            item.parsedDate = new Date(dateStr).getTime() || 0;
        });

        // Sort descending: newest date first
        allArticles.sort((a, b) => b.parsedDate - a.parsedDate);

        // Top article becomes Featured Hero Article
        const newestArticle = allArticles[0];

        // Format date string for display (e.g. "27 Aug 2026")
        const rawDate = newestArticle.getAttribute("data-date") || "2026-08-27";
        const formattedDate = formatDateDisplay(rawDate);

        // Populate Featured Hero Card with newest article data
        const featuredTitle = featuredCard.querySelector(".featured-title a");
        const featuredDesc = featuredCard.querySelector(".featured-description");
        const featuredCat = featuredCard.querySelector(".category-pill");
        const featuredDate = featuredCard.querySelector(".publish-date");
        const featuredLink = featuredCard.querySelector(".read-article-btn");
        const featuredMetaTitle = featuredCard.querySelector(".featured-title");

        if (featuredTitle) {
            featuredTitle.innerText = newestArticle.getAttribute("data-title") || newestArticle.querySelector("h2, h3")?.innerText || "";
            featuredTitle.href = newestArticle.getAttribute("data-url") || "blog-reduce-amazon-acos.html";
        }
        if (featuredDesc) {
            featuredDesc.innerText = newestArticle.getAttribute("data-excerpt") || newestArticle.querySelector(".article-card-excerpt")?.innerText || "";
        }
        if (featuredCat) {
            featuredCat.innerText = (newestArticle.getAttribute("data-category") || "AMAZON PPC").toUpperCase();
        }
        if (featuredDate) {
            featuredDate.innerText = formattedDate;
        }
        if (featuredLink) {
            featuredLink.href = newestArticle.getAttribute("data-url") || "blog-reduce-amazon-acos.html";
        }
        featuredCard.setAttribute("data-category", newestArticle.getAttribute("data-category") || "amazon ppc");
        featuredCard.setAttribute("data-tags", newestArticle.getAttribute("data-tags") || "");
        featuredCard.setAttribute("data-title", newestArticle.getAttribute("data-title") || "");

        // Append remaining articles (index 1 onwards) into articlesGrid
        articlesGrid.innerHTML = "";
        for (let i = 1; i < allArticles.length; i++) {
            const article = allArticles[i];

            // Update visible date pill on card
            const datePill = article.querySelector(".publish-date, .article-card-footer span");
            const artRawDate = article.getAttribute("data-date") || "2026-08-20";
            if (datePill) {
                const artAuthor = article.getAttribute("data-author") || "Anmol P.";
                const artReadTime = article.getAttribute("data-readtime") || "6 min";
                datePill.innerText = artAuthor + " · " + formatDateDisplay(artRawDate) + " · " + artReadTime;
            }

            articlesGrid.appendChild(article);
        }
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return "27 Aug 2026";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    sortAndPromoteArticles();

    // --- 2. INSTANT SEARCH & CATEGORY FILTERING ---
    const searchInput = document.getElementById("blogSearchInput");
    const categoryChips = document.querySelectorAll(".category-chip");
    const featuredCard = document.getElementById("featuredHeroCard");
    const emptyState = document.getElementById("emptySearchState");

    let currentCategory = "all";
    let currentQuery = "";

    function filterArticles() {
        const articleCards = document.querySelectorAll(".article-card");
        let visibleCount = 0;

        // Check featured card first
        if (featuredCard) {
            const fTitle = featuredCard.getAttribute("data-title") || featuredCard.innerText.toLowerCase();
            const fCat = featuredCard.getAttribute("data-category") || "";
            const fTags = featuredCard.getAttribute("data-tags") || "";

            const fMatchesCat = (currentCategory === "all") || fCat.toLowerCase().includes(currentCategory.toLowerCase());
            const fMatchesQuery = !currentQuery || fTitle.toLowerCase().includes(currentQuery.toLowerCase()) || fTags.toLowerCase().includes(currentQuery.toLowerCase());

            if (fMatchesCat && fMatchesQuery) {
                featuredCard.parentElement.style.display = "block";
                visibleCount++;
            } else {
                featuredCard.parentElement.style.display = "none";
            }
        }

        // Check grid cards
        articleCards.forEach(card => {
            const title = card.getAttribute("data-title") || card.querySelector("h2, h3")?.innerText.toLowerCase() || "";
            const category = card.getAttribute("data-category") || card.querySelector(".article-card-badge")?.innerText.toLowerCase() || "";
            const tags = card.getAttribute("data-tags") || "";
            const textContent = card.innerText.toLowerCase();

            const matchesCategory = (currentCategory === "all") || (category.includes(currentCategory.toLowerCase()));
            const matchesSearch = !currentQuery || textContent.includes(currentQuery.toLowerCase()) || tags.includes(currentQuery.toLowerCase());

            if (matchesCategory && matchesSearch) {
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

    // --- 3. READING PROGRESS BAR ---
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

    // --- 4. STICKY TABLE OF CONTENTS HIGHLIGHTING ---
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

    // --- 5. MINI ACOS & BREAK-EVEN CALCULATOR ---
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

    // --- 6. INTERACTIVE CHECKLIST (LOCALSTORAGE) ---
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

    // --- 7. COMMUNITY TOPIC RECOMMENDATIONS ROADMAP DISPLAY & FORM ---
    const topicForm = document.getElementById("topicRecForm");
    const topicMessage = document.getElementById("topicRecSuccess");
    const communityTopicsList = document.getElementById("communityTopicsList");

    const defaultTopics = [
        { title: "Scaling Broad Match Without ACoS Spikes", votes: 42, isUser: false },
        { title: "Amazon DSP vs Sponsored Display Strategy", votes: 38, isUser: false },
        { title: "How to Tackle Listing Hijackers & Buy Box Losses", votes: 29, isUser: false },
        { title: "A+ Content Conversion Rate Optimization", votes: 25, isUser: false }
    ];

    async function fetchServerTopics() {
        try {
            const res = await fetch("save_topic.php");
            if (res.ok) {
                const serverData = await res.json();
                if (Array.isArray(serverData) && serverData.length > 0) {
                    return serverData;
                }
            }
        } catch (e) { }

        // Fallback to static topics.json
        try {
            const resStatic = await fetch("topics.json");
            if (resStatic.ok) {
                const staticData = await resStatic.json();
                if (Array.isArray(staticData) && staticData.length > 0) {
                    return staticData;
                }
            }
        } catch (e) { }

        return null;
    }

    async function renderCommunityTopics() {
        if (!communityTopicsList) return;

        let localTopics = [];
        try {
            localTopics = JSON.parse(localStorage.getItem("ppc_user_recommended_topics")) || [];
        } catch (e) { }

        let serverTopics = await fetchServerTopics();
        let combinedTopics = [];

        if (serverTopics) {
            combinedTopics = serverTopics;
        } else {
            combinedTopics = [...defaultTopics];
        }

        // Merge local device submissions at top if not already present
        localTopics.forEach(loc => {
            const titleStr = typeof loc === 'string' ? loc : loc.title;
            const exists = combinedTopics.some(s => (typeof s === 'string' ? s : s.title).toLowerCase() === titleStr.toLowerCase());
            if (!exists) {
                combinedTopics.unshift({ title: titleStr, votes: 1, isUser: true });
            }
        });

        communityTopicsList.innerHTML = "";

        combinedTopics.forEach(t => {
            const isUser = t.isUser || t.is_user || false;
            const titleText = typeof t === "string" ? t : t.title;
            const voteVal = t.votes || 1;

            const chip = document.createElement("div");
            chip.className = "community-topic-chip" + (isUser ? " user-submitted-topic" : "");
            if (isUser) {
                chip.style.borderColor = "#0284c7";
                chip.style.backgroundColor = "#e0f2fe";
                chip.style.color = "#0369a1";
            }
            chip.innerHTML = `<span>${isUser ? "✨" : "💡"} ${escapeHTML(titleText)}</span> <span class="vote-count">+${voteVal}</span>`;
            communityTopicsList.appendChild(chip);
        });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    renderCommunityTopics();

    // Global Admin Helper: Site Owner can call window.getSubmittedTopics() to view all recommendations
    window.getSubmittedTopics = async function () {
        try {
            const server = await fetchServerTopics();
            const local = JSON.parse(localStorage.getItem("ppc_user_recommended_topics")) || [];
            console.log("=== SERVER TOPICS ===");
            console.table(server);
            console.log("=== LOCAL TOPICS ===");
            console.table(local);
            return { server, local };
        } catch (e) {
            return [];
        }
    };

    if (topicForm) {
        topicForm.addEventListener("submit", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const input = topicForm.querySelector("input[type='text']");
            if (input && input.value.trim().length > 0) {
                const newTopicTitle = input.value.trim();

                // 1. PERSIST IN LOCALSTORAGE (Device level persistence)
                let stored = [];
                try {
                    stored = JSON.parse(localStorage.getItem("ppc_user_recommended_topics")) || [];
                } catch (e) { }

                const foundIndex = stored.findIndex(t => (typeof t === 'string' ? t : t.title).toLowerCase() === newTopicTitle.toLowerCase());
                if (foundIndex !== -1) {
                    if (typeof stored[foundIndex] === 'object') {
                        stored[foundIndex].votes = (stored[foundIndex].votes || 1) + 1;
                    }
                } else {
                    stored.unshift({ title: newTopicTitle, votes: 1, date: new Date().toLocaleDateString(), isUser: true });
                }
                try {
                    localStorage.setItem("ppc_user_recommended_topics", JSON.stringify(stored));
                } catch (e) { }

                // 2. SAVE TO SERVER FILE & INCREMENT VOTES ON SERVER
                try {
                    fetch("save_topic.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            topic: newTopicTitle,
                            url: window.location.href
                        })
                    }).then(function(res) { return res.json(); }).then(function(data) {
                        if (data && data.status === "success") {
                            renderCommunityTopics();
                        }
                    }).catch(function() {});
                } catch (err) { }

                // 3. SEND DIRECT EMAIL ALERT TO OWNER (FormSubmit AJAX API)
                try {
                    fetch("https://formsubmit.co/ajax/anmolpokhriyal3200@gmail.com", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            _subject: "🔥 New Blog Recommendation: " + newTopicTitle,
                            Suggested_Topic: newTopicTitle,
                            Submitted_At: new Date().toLocaleString(),
                            Page_URL: window.location.href,
                            Note: "User submitted a recommendation on your Amazon PPC blog."
                        })
                    }).catch(function() {});
                } catch (err) { }

                // 4. IMMEDIATELY RENDER DYNAMICALLY AT TOP OF ROADMAP
                renderCommunityTopics();

                if (topicMessage) {
                    topicMessage.style.display = "block";
                    topicMessage.innerHTML = "✓ <strong>Thank you!</strong> Your recommendation <em>\"" + escapeHTML(newTopicTitle) + "\"</em> has been added live to our community roadmap below and sent directly to our email!";
                }
                topicForm.reset();
            }
        });
    }

    // --- 8. SAVE ARTICLE BOOKMARK (LOCALSTORAGE) ---
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

    // --- 9. COPY ARTICLE LINK ---
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

    // --- 10. WAS THIS HELPFUL FEEDBACK ---
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

    // --- 11. NEWSLETTER SUBSCRIPTION SYSTEM ---
    const newsletterForms = document.querySelectorAll(".newsletter-form, #newsletterForm");
    newsletterForms.forEach(form => {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const emailInput = form.querySelector("input[type='email']");
            const successDiv = form.parentElement.querySelector("#newsletterSuccess") || document.getElementById("newsletterSuccess");
            const btn = form.querySelector("button[type='submit']");

            if (emailInput && emailInput.value.trim()) {
                const subEmail = emailInput.value.trim();

                if (btn) btn.disabled = true;

                // 1. Send to Server Endpoint (subscribers.json)
                try {
                    fetch("subscribe.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: subEmail,
                            url: window.location.href
                        })
                    }).catch(function() {});
                } catch (err) { }

                // 2. Backup Dispatch via FormSubmit
                try {
                    fetch("https://formsubmit.co/ajax/anmolpokhriyal3200@gmail.com", {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            _subject: "🎉 New Newsletter Subscriber: " + subEmail,
                            Subscriber_Email: subEmail,
                            Subscribed_At: new Date().toLocaleString(),
                            Page_URL: window.location.href
                        })
                    }).catch(function() {});
                } catch (err) { }

                if (successDiv) {
                    successDiv.style.display = "block";
                    successDiv.innerHTML = "✓ <strong>Subscribed!</strong> You're added to our weekly Amazon growth insights.";
                }

                form.reset();
                if (btn) btn.disabled = false;
            }
        });
    });

});
