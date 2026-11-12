/* =========================================================
   PPC GROWTH EXPERT - KNOWLEDGE HUB JAVASCRIPT
   File: knowledge-hub/js/knowledge-hub.js
   Pure Vanilla JS (Zero external calls, zero 404 endpoints)
   Handles Hub filtering/search + Pillar Guide interactivity
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // =========================================================
    // 1. KNOWLEDGE HUB INDEX: SEARCH, CATEGORY CHIPS & GOALS
    // =========================================================
    const searchInput = document.getElementById("hubSearchInput");
    const categoryChips = document.querySelectorAll("#categoryChipsWrapper .category-chip");
    const goalCards = document.querySelectorAll(".goal-card[data-goal-category]");
    const featuredCard = document.getElementById("featuredHeroCard");
    const gridCards = document.querySelectorAll("#articlesGrid .article-card");
    const emptyState = document.getElementById("emptySearchState");
    const resetFilterBtn = document.getElementById("resetHubFilterBtn");
    const visibleCountEl = document.getElementById("hubVisibleCount");

    if (searchInput || categoryChips.length > 0) {
        let activeCategory = "all";
        let activeQuery = "";

        function normalize(str) {
            return (str || "").toLowerCase().trim();
        }

        function filterKnowledgeHub() {
            let visibleTotal = 0;
            const query = normalize(activeQuery);
            const cat = normalize(activeCategory);

            if (featuredCard) {
                const fCat = normalize(featuredCard.getAttribute("data-category"));
                const fTitle = normalize(featuredCard.getAttribute("data-title"));
                const fTags = normalize(featuredCard.getAttribute("data-tags"));
                const fText = normalize(featuredCard.textContent);

                const matchesCat = cat === "all" || fCat.includes(cat);
                const matchesQuery =
                    !query || fTitle.includes(query) || fTags.includes(query) || fText.includes(query);

                const wrapper = featuredCard.closest(".featured-hero-wrapper") || featuredCard;
                if (matchesCat && matchesQuery) {
                    wrapper.style.display = "block";
                    visibleTotal++;
                } else {
                    wrapper.style.display = "none";
                }
            }

            gridCards.forEach(function (card) {
                const cCat = normalize(card.getAttribute("data-category"));
                const cTitle = normalize(card.getAttribute("data-title"));
                const cTags = normalize(card.getAttribute("data-tags"));
                const cText = normalize(card.textContent);

                const matchesCat = cat === "all" || cCat.includes(cat);
                const matchesQuery =
                    !query || cTitle.includes(query) || cTags.includes(query) || cText.includes(query);

                if (matchesCat && matchesQuery) {
                    card.style.display = "flex";
                    visibleTotal++;
                } else {
                    card.style.display = "none";
                }
            });

            if (emptyState) {
                emptyState.style.display = visibleTotal === 0 ? "block" : "none";
            }

            if (visibleCountEl) {
                visibleCountEl.textContent = visibleTotal === 1 ? "1 guide" : visibleTotal + " guides";
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", function (e) {
                activeQuery = e.target.value || "";
                filterKnowledgeHub();
            });
        }

        categoryChips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                categoryChips.forEach(function (c) {
                    c.classList.remove("active");
                });
                this.classList.add("active");
                activeCategory = this.getAttribute("data-category") || "all";
                filterKnowledgeHub();
            });
        });

        goalCards.forEach(function (goal) {
            goal.addEventListener("click", function () {
                const targetCat = this.getAttribute("data-goal-category") || "all";
                goalCards.forEach(function (g) {
                    g.classList.remove("active");
                });
                this.classList.add("active");

                categoryChips.forEach(function (chip) {
                    if (chip.getAttribute("data-category") === targetCat) {
                        chip.click();
                    }
                });

                const gridSection = document.getElementById("knowledgeGrid");
                if (gridSection) {
                    gridSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });

        if (resetFilterBtn) {
            resetFilterBtn.addEventListener("click", function () {
                activeCategory = "all";
                activeQuery = "";
                if (searchInput) searchInput.value = "";
                goalCards.forEach(function (g) {
                    g.classList.remove("active");
                });
                categoryChips.forEach(function (c) {
                    c.classList.toggle("active", c.getAttribute("data-category") === "all");
                });
                filterKnowledgeHub();
            });
        }

        filterKnowledgeHub();
    }

    // =========================================================
    // 2. ARTICLE READING PROGRESS BAR
    // =========================================================
    const progressBar = document.getElementById("articleProgressBar");
    if (progressBar) {
        function updateProgressBar() {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.scrollY / totalHeight) * 100;
                progressBar.style.width = Math.min(100, Math.max(0, progress)) + "%";
            }
        }
        window.addEventListener("scroll", updateProgressBar, { passive: true });
        updateProgressBar();
    }

    // =========================================================
    // 3. STICKY TABLE OF CONTENTS SCROLL-SPY
    // =========================================================
    const tocLinks = document.querySelectorAll(".toc-links a");
    const proseSections = document.querySelectorAll(".article-body-prose section[id]");

    if (tocLinks.length > 0 && proseSections.length > 0) {
        function updateActiveToc() {
            let currentId = proseSections[0].getAttribute("id");
            const scrollPos = window.scrollY + 145;

            proseSections.forEach(function (sec) {
                if (sec.offsetTop <= scrollPos) {
                    currentId = sec.getAttribute("id");
                }
            });

            tocLinks.forEach(function (link) {
                const href = link.getAttribute("href");
                const isMatch = href === "#" + currentId;
                link.classList.toggle("active", isMatch);
            });
        }

        window.addEventListener("scroll", updateActiveToc, { passive: true });
        updateActiveToc();
    }

    // =========================================================
    // 4. SAVE BOOKMARK & COPY LINK ACTIONS
    // =========================================================
    const saveArticleBtn = document.getElementById("saveArticleBtn");
    const guideStorageKey = "kh_saved_guides";
    const guideId = window.location.pathname.replace(/\/+$/, "") || "knowledge-hub-guide";

    if (saveArticleBtn) {
        let savedList = [];
        try {
            savedList = JSON.parse(localStorage.getItem(guideStorageKey)) || [];
        } catch (err) {
            savedList = [];
        }

        if (savedList.includes(guideId)) {
            saveArticleBtn.innerHTML = "🔖 Saved Guide";
            saveArticleBtn.classList.add("saved");
        }

        saveArticleBtn.addEventListener("click", function () {
            let list = [];
            try {
                list = JSON.parse(localStorage.getItem(guideStorageKey)) || [];
            } catch (err) {
                list = [];
            }

            if (list.includes(guideId)) {
                list = list.filter(function (item) {
                    return item !== guideId;
                });
                saveArticleBtn.innerHTML = "♡ Save Guide";
                saveArticleBtn.classList.remove("saved");
            } else {
                list.push(guideId);
                saveArticleBtn.innerHTML = "🔖 Saved Guide";
                saveArticleBtn.classList.add("saved");
            }

            try {
                localStorage.setItem(guideStorageKey, JSON.stringify(list));
            } catch (err) {
                // Storage unavailable
            }
        });
    }

    const copyLinkBtn = document.getElementById("copyLinkBtn");
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", function () {
            const urlToCopy = window.location.href;
            const originalLabel = copyLinkBtn.innerHTML;

            function showCopied() {
                copyLinkBtn.innerHTML = "✓ Link Copied";
                setTimeout(function () {
                    copyLinkBtn.innerHTML = originalLabel;
                }, 2000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard
                    .writeText(urlToCopy)
                    .then(showCopied)
                    .catch(function () {
                        fallbackCopy(urlToCopy, showCopied);
                    });
            } else {
                fallbackCopy(urlToCopy, showCopied);
            }
        });
    }

    function fallbackCopy(text, onDone) {
        const tempInput = document.createElement("input");
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        try {
            document.execCommand("copy");
            onDone();
        } catch (err) {
            // Silent fail
        }
        document.body.removeChild(tempInput);
    }

    // =========================================================
    // 5. INTERACTIVE LAUNCH READINESS CHECKLIST (LOCALSTORAGE)
    // =========================================================
    const checklistItems = document.querySelectorAll(".checklist-item");
    const checklistProgress = document.getElementById("checklistProgressCount");
    const resetChecklistBtn = document.getElementById("resetChecklistBtn");
    const checklistStorageKey = "kh_checklist_how_to_sell_amazon_in_v1";

    if (checklistItems.length > 0) {
        function updateChecklistCounter() {
            const checkedCount = document.querySelectorAll(".checklist-item.checked").length;
            if (checklistProgress) {
                checklistProgress.textContent = checkedCount + " / " + checklistItems.length + " steps completed";
            }
        }

        function persistChecklist() {
            const savedIndices = [];
            checklistItems.forEach(function (item, idx) {
                if (item.classList.contains("checked")) {
                    savedIndices.push(idx);
                }
            });
            try {
                localStorage.setItem(checklistStorageKey, JSON.stringify(savedIndices));
            } catch (err) {
                // Storage unavailable
            }
            updateChecklistCounter();
        }

        let storedIndices = [];
        try {
            storedIndices = JSON.parse(localStorage.getItem(checklistStorageKey)) || [];
        } catch (err) {
            storedIndices = [];
        }

        checklistItems.forEach(function (item, index) {
            const box = item.querySelector(".checklist-checkbox");
            if (storedIndices.includes(index)) {
                item.classList.add("checked");
                if (box) box.textContent = "✓";
            }

            item.addEventListener("click", function () {
                this.classList.toggle("checked");
                const isChecked = this.classList.contains("checked");
                if (box) box.textContent = isChecked ? "✓" : "";
                persistChecklist();
            });
        });

        if (resetChecklistBtn) {
            resetChecklistBtn.addEventListener("click", function () {
                checklistItems.forEach(function (item) {
                    item.classList.remove("checked");
                    const box = item.querySelector(".checklist-checkbox");
                    if (box) box.textContent = "";
                });
                persistChecklist();
            });
        }

        updateChecklistCounter();
    }

    // =========================================================
    // 6. WAS THIS HELPFUL FEEDBACK (LOCALSTORAGE, ZERO NETWORK)
    // =========================================================
    const helpfulBtns = document.querySelectorAll(".helpful-btn");
    const helpfulResponse = document.getElementById("helpfulResponse");
    const helpfulStorageKey = "kh_helpful_feedback_how_to_sell_in";

    if (helpfulBtns.length > 0 && helpfulResponse) {
        try {
            const previousVote = localStorage.getItem(helpfulStorageKey);
            if (previousVote) {
                helpfulBtns.forEach(function (b) {
                    b.style.display = "none";
                });
                helpfulResponse.style.display = "block";
                helpfulResponse.textContent =
                    previousVote === "yes"
                        ? "Thank you! Glad this Amazon India seller guide helped your planning."
                        : "Thank you for the feedback. We regularly update this guide to improve clarity.";
            }
        } catch (err) {
            // Ignore
        }

        helpfulBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                const vote = this.getAttribute("data-vote") || "yes";
                helpfulBtns.forEach(function (b) {
                    b.style.display = "none";
                });
                helpfulResponse.style.display = "block";
                helpfulResponse.textContent =
                    vote === "yes"
                        ? "Thank you! Glad this Amazon India seller guide helped your planning."
                        : "Thank you for the feedback. We regularly update this guide to improve clarity.";
                try {
                    localStorage.setItem(helpfulStorageKey, vote);
                } catch (err) {
                    // Ignore
                }
            });
        });
    }

    // =========================================================
    // 7. INTERACTIVE AMAZON.IN SELLER PROFIT & REORDER SIMULATOR
    // =========================================================
    const priceInput = document.getElementById("khPrice");
    if (priceInput) {
        const cogsInput = document.getElementById("khCogs");
        const refPctInput = document.getElementById("khRefPct");
        const shipFeeInput = document.getElementById("khShipFee");
        const gstRateInput = document.getElementById("khGstRate");
        const returnRateInput = document.getElementById("khReturnRate");
        const targetTacosInput = document.getElementById("khTargetTacos");
        const dailyUnitsInput = document.getElementById("khDailyUnits");
        const leadDaysInput = document.getElementById("khLeadDays");

        const outProfit = document.getElementById("khResNetProfit");
        const outMargin = document.getElementById("khResNetMargin");
        const outBreakEven = document.getElementById("khResBreakEvenAcos");
        const outMaxCpa = document.getElementById("khResMaxCpa");
        const outFeesTotal = document.getElementById("khResFeesTotal");
        const outRopUnits = document.getElementById("khResRopUnits");
        const simNote = document.getElementById("khSimNote");
        const presetBtns = document.querySelectorAll(".kh-preset-btn");

        function fmtInr(num) {
            const sign = num < 0 ? "-" : "";
            return sign + "₹" + Math.abs(Math.round(num)).toLocaleString("en-IN");
        }

        function runSellerEconomics() {
            const price = Math.max(0, parseFloat(priceInput.value) || 0);
            const cogs = Math.max(0, parseFloat(cogsInput.value) || 0);
            const refPct = Math.max(0, parseFloat(refPctInput.value) || 0);
            const shipFee = Math.max(0, parseFloat(shipFeeInput.value) || 0);
            const gstPct = Math.max(0, parseFloat(gstRateInput.value) || 0);
            const returnPct = Math.min(80, Math.max(0, parseFloat(returnRateInput.value) || 0));
            const tacosPct = Math.max(0, parseFloat(targetTacosInput.value) || 0);
            const dailyUnits = Math.max(0, parseFloat(dailyUnitsInput.value) || 0);
            const leadDays = Math.max(1, parseFloat(leadDaysInput.value) || 1);

            if (price <= 0) {
                return;
            }

            // Selling price assumed GST-inclusive (standard consumer MRP/list display on Amazon.in)
            const preGstSaleValue = price / (1 + gstPct / 100);
            const outputGst = price - preGstSaleValue;

            // Referral fee applies on total selling price; closing + shipping fees entered pre-GST
            const referralFee = price * (refPct / 100);
            const baseAmazonFees = referralFee + shipFee;
            const gstOnAmazonFees = baseAmazonFees * 0.18;
            const totalAmazonDebit = baseAmazonFees + gstOnAmazonFees;

            // Illustrative effective fee cost assuming regular GST seller offsets 18% fee GST via ITC
            // While net product GST outflow is modeled against selling price ex-GST revenue
            const returnBufferCost = price * (returnPct / 100) * 0.25 + shipFee * (returnPct / 100);
            const adSpendPerUnit = price * (tacosPct / 100);

            // Pre-ad contribution before advertising = pre-GST revenue - COGS - base Amazon fees - return buffer
            const preAdProfit = preGstSaleValue - cogs - baseAmazonFees - returnBufferCost;
            const netProfitAfterAds = preAdProfit - adSpendPerUnit;
            const netMarginPct = (netProfitAfterAds / price) * 100;
            const breakEvenAcos = Math.max(0, (preAdProfit / price) * 100);

            // Inventory Reorder Point: (Daily Velocity * Lead Time) + 10-day Safety Stock
            const safetyStock = Math.ceil(dailyUnits * 10);
            const reorderPoint = Math.ceil(dailyUnits * leadDays) + safetyStock;

            if (outProfit) {
                outProfit.textContent = fmtInr(netProfitAfterAds);
                outProfit.style.color = netProfitAfterAds >= 0 ? "#059669" : "#dc2626";
            }
            if (outMargin) {
                outMargin.textContent = netMarginPct.toFixed(1) + "%";
                outMargin.style.color = netMarginPct >= 15 ? "#059669" : netMarginPct >= 0 ? "#d97706" : "#dc2626";
            }
            if (outBreakEven) {
                outBreakEven.textContent = breakEvenAcos.toFixed(1) + "%";
            }
            if (outMaxCpa) {
                outMaxCpa.textContent = fmtInr(Math.max(0, preAdProfit));
            }
            if (outFeesTotal) {
                outFeesTotal.textContent = fmtInr(totalAmazonDebit);
            }
            if (outRopUnits) {
                outRopUnits.textContent = reorderPoint.toLocaleString("en-IN") + " units";
            }

            if (simNote) {
                let statusText = "";
                if (netProfitAfterAds < 0) {
                    statusText =
                        "<strong>Margin Warning:</strong> At this price and fee mix, your post-ad unit contribution is negative (" +
                        fmtInr(netProfitAfterAds) +
                        "/unit). Consider increasing selling price, bundling multi-packs to spread fixed closing/shipping slabs, or reducing Target TACoS below " +
                        breakEvenAcos.toFixed(1) +
                        "%.";
                } else if (netMarginPct < 12) {
                    statusText =
                        "<strong>Thin Cushion:</strong> Your net profit after ads is " +
                        fmtInr(netProfitAfterAds) +
                        " (" +
                        netMarginPct.toFixed(1) +
                        "%). Verify GST Input Tax Credit (ITC) on your COGS invoice (" +
                        fmtInr(outputGst) +
                        " output GST on sale) and trigger FBA replenishment once stock drops to <strong>" +
                        reorderPoint.toLocaleString("en-IN") +
                        " units</strong> (includes 10-day safety buffer).";
                } else {
                    statusText =
                        "<strong>Healthy Unit Economics:</strong> Before ad spend, each delivered order contributes " +
                        fmtInr(preAdProfit) +
                        " (" +
                        breakEvenAcos.toFixed(1) +
                        "% break-even ACoS). Keeping blended TACoS at " +
                        tacosPct.toFixed(0) +
                        "% leaves " +
                        fmtInr(netProfitAfterAds) +
                        "/unit net profit. Reorder when stock reaches <strong>" +
                        reorderPoint.toLocaleString("en-IN") +
                        " units</strong>.";
                }
                simNote.innerHTML = statusText;
            }
        }

        [
            priceInput,
            cogsInput,
            refPctInput,
            shipFeeInput,
            gstRateInput,
            returnRateInput,
            targetTacosInput,
            dailyUnitsInput,
            leadDaysInput
        ].forEach(function (el) {
            if (el) {
                el.addEventListener("input", runSellerEconomics);
                el.addEventListener("change", runSellerEconomics);
            }
        });

        presetBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                presetBtns.forEach(function (b) {
                    b.classList.remove("active");
                });
                this.classList.add("active");

                const preset = this.getAttribute("data-preset");
                if (preset === "home") {
                    priceInput.value = 799;
                    cogsInput.value = 230;
                    refPctInput.value = 8;
                    shipFeeInput.value = 76;
                    gstRateInput.value = "12";
                    returnRateInput.value = 5;
                    targetTacosInput.value = 10;
                    dailyUnitsInput.value = 18;
                    leadDaysInput.value = 20;
                } else if (preset === "electronics") {
                    priceInput.value = 1299;
                    cogsInput.value = 460;
                    refPctInput.value = 11;
                    shipFeeInput.value = 84;
                    gstRateInput.value = "18";
                    returnRateInput.value = 7;
                    targetTacosInput.value = 11;
                    dailyUnitsInput.value = 12;
                    leadDaysInput.value = 30;
                } else if (preset === "beauty") {
                    priceInput.value = 499;
                    cogsInput.value = 120;
                    refPctInput.value = 6.5;
                    shipFeeInput.value = 69;
                    gstRateInput.value = "18";
                    returnRateInput.value = 4;
                    targetTacosInput.value = 12;
                    dailyUnitsInput.value = 25;
                    leadDaysInput.value = 18;
                }
                runSellerEconomics();
            });
        });

        runSellerEconomics();
    }
});

