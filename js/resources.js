/* =========================================================
   PPC GROWTH EXPERT - RESOURCES PAGE CONTROLLER
   File: js/resources.js
========================================================= */

function initResourcesPage() {
    /* 1. QUICK TOOL FINDER CHIPS FILTERING */
    const chipButtons = document.querySelectorAll(".quick-chips-grid .chip-btn");
    const calcCards = document.querySelectorAll(".calculators-grid .calc-card");

    if (chipButtons.length > 0 && calcCards.length > 0) {
        chipButtons.forEach(function (btn) {
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                // Update active chip UI
                chipButtons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");

                const targetCategory = this.getAttribute("data-tool-category");

                // Filter cards
                calcCards.forEach(function (card) {
                    const cardCategory = card.getAttribute("data-category");

                    if (targetCategory === "all" || cardCategory === targetCategory) {
                        card.style.display = "flex";
                        card.style.opacity = "1";
                        card.style.transform = "translateY(0)";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    /* 2. PROBLEM FINDER CHIPS */
    const problemChips = document.querySelectorAll(".problem-chips-grid .problem-chip");
    const recTitle = document.getElementById("recOutputTitle");
    const recDesc = document.getElementById("recOutputDesc");
    const recBtn = document.getElementById("recOutputBtn");

    const problemData = {
        "acos-high": {
            title: "Amazon ACoS Calculator",
            desc: "Calculate your Advertising Cost of Sales and evaluate how efficiently your ad spend translates into revenue.",
            btnText: "Calculate ACoS →",
            url: "amazon-acos-calculator.html"
        },
        "low-cvr": {
            title: "Amazon PPC Conversion Rate Calculator",
            desc: "Diagnose why clicks aren't converting into orders and calculate your exact conversion rate percentage.",
            btnText: "Check Conversion Rate →",
            url: "amazon-ppc-conversion-rate-calculator.html"
        },
        "profit-check": {
            title: "Amazon India Profit Calculator",
            desc: "Calculate net margins, Amazon referral & closing fees, GST impact, and net seller payout.",
            btnText: "Calculate Net Profit →",
            url: "amazon-profit-calculator.html"
        },
        "fba-fee": {
            title: "Amazon FBA Fee Calculator India",
            desc: "Calculate pick & pack, weight handling, and referral fee breakdowns for FBA orders.",
            btnText: "Calculate FBA Fees →",
            url: "amazon-fba-fee-calculator.html"
        },
        "storage-fee": {
            title: "Amazon FBA Storage Fee Calculator",
            desc: "Estimate monthly inventory storage costs based on unit dimensions, volume, and sell-through velocity.",
            btnText: "Calculate Storage Fee →",
            url: "amazon-fba-storage-fee-calculator.html"
        },
        "ad-roi": {
            title: "Amazon Advertising ROI Calculator",
            desc: "Calculate true net profit return after subtracting ad spend, product COGS, and Amazon fees.",
            btnText: "Calculate Ad ROI →",
            url: "amazon-advertising-roi-calculator.html"
        },
        "tacos-check": {
            title: "Amazon TACoS Calculator",
            desc: "Evaluate total ad cost of sales against total brand revenue to measure organic flywheel & account health.",
            btnText: "Calculate TACoS →",
            url: "amazon-tacos-calculator.html"
        },
        "roas-check": {
            title: "Amazon ROAS Calculator",
            desc: "See how much attributed advertising revenue you generate for every ₹1 spent on PPC campaigns.",
            btnText: "Calculate ROAS →",
            url: "amazon-roas-calculator.html"
        }
    };

    if (problemChips.length > 0 && recTitle && recDesc && recBtn) {
        problemChips.forEach(function (chip) {
            chip.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                problemChips.forEach(c => c.classList.remove("active"));
                this.classList.add("active");

                const problemId = this.getAttribute("data-problem-id");
                const data = problemData[problemId];

                if (data) {
                    recTitle.textContent = data.title;
                    recDesc.textContent = data.desc;
                    recBtn.textContent = data.btnText;
                    recBtn.setAttribute("href", data.url);
                }
            });
        });
    }

    /* 3. FAQ ACCORDION SINGLE OPEN WITH SMOOTH TRANSITION */
    const faqItems = document.querySelectorAll(".resources-faq-section details");
    if (faqItems.length > 0) {
        faqItems.forEach(function (targetItem) {
            targetItem.addEventListener("toggle", function () {
                if (this.open) {
                    faqItems.forEach(function (item) {
                        if (item !== targetItem && item.open) {
                            item.removeAttribute("open");
                        }
                    });
                }
            });
        });
    }
}

// Execute immediately if DOM is ready, else wait
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResourcesPage);
} else {
    initResourcesPage();
}
