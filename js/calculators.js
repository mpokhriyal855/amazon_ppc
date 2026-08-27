/* =========================================================
   PPC GROWTH EXPERT - CALCULATORS & RESOURCES JAVASCRIPT
   File: js/calculators.js
   Pure Vanilla JS with Input Sanitization, Live Math & Validation
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    // --- HELPER FUNCTIONS ---
    function parseNum(val) {
        if (!val || isNaN(val)) return 0;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
    }

    function formatCurr(num) {
        if (isNaN(num) || !isFinite(num)) return "₹0";
        return "₹" + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }

    function formatPct(num) {
        if (isNaN(num) || !isFinite(num)) return "0.00%";
        return num.toFixed(2) + "%";
    }

    function formatNum(num) {
        if (isNaN(num) || !isFinite(num)) return "0.00";
        return num.toFixed(2);
    }

    // --- 1. ACOS CALCULATOR ---
    const acosSpend = document.getElementById("acosSpend");
    const acosSales = document.getElementById("acosSales");
    const acosResultVal = document.getElementById("acosResultVal");
    const acosRoasVal = document.getElementById("acosRoasVal");
    const acosSubText = document.getElementById("acosSubText");
    const acosBarAd = document.getElementById("acosBarAd");
    const acosBarRem = document.getElementById("acosBarRem");
    const acosAdviceBox = document.getElementById("acosAdviceBox");

    function calculateACoS() {
        if (!acosSpend || !acosSales) return;
        const spend = Math.max(0, parseNum(acosSpend.value));
        const sales = Math.max(0, parseNum(acosSales.value));

        if (sales <= 0 || spend <= 0) {
            if (acosResultVal) acosResultVal.innerText = "0.00%";
            if (acosRoasVal) acosRoasVal.innerText = "0.00x";
            if (acosSubText) acosSubText.innerText = "Enter ad spend and ad sales to calculate ACoS.";
            if (acosBarAd) acosBarAd.style.width = "0%";
            if (acosBarRem) acosBarRem.style.width = "100%";
            if (acosAdviceBox) acosAdviceBox.innerHTML = "<strong>Guidance:</strong> Enter your campaign spend and revenue to see how much of your ad sales goes toward advertising costs.";
            return;
        }

        const acos = (spend / sales) * 100;
        const roas = sales / spend;
        const remPct = Math.max(0, 100 - acos);

        if (acosResultVal) acosResultVal.innerText = formatPct(acos);
        if (acosRoasVal) acosRoasVal.innerText = formatNum(roas) + "x";
        if (acosSubText) acosSubText.innerText = `${formatCurr(spend)} of ad spend generated ${formatCurr(sales)} in sales.`;

        if (acosBarAd) acosBarAd.style.width = Math.min(100, acos) + "%";
        if (acosBarRem) acosBarRem.style.width = Math.min(100, remPct) + "%";

        if (acosAdviceBox) {
            acosAdviceBox.innerHTML = `<strong>What does this mean?</strong> Your ads consume <strong>${formatPct(acos)}</strong> (${formatCurr((acos / 100))} of every ₹1 revenue). Compare this against your product margin and <a href="amazon-break-even-acos-calculator.html" style="color:#0284c7; text-decoration:underline;">Break-Even ACoS</a> to evaluate true profitability.`;
        }
    }

    if (acosSpend && acosSales) {
        acosSpend.addEventListener("input", calculateACoS);
        acosSales.addEventListener("input", calculateACoS);
        calculateACoS();
    }

    // --- 2. ROAS CALCULATOR ---
    const roasSpend = document.getElementById("roasSpend");
    const roasSales = document.getElementById("roasSales");
    const roasResultVal = document.getElementById("roasResultVal");
    const roasAcosVal = document.getElementById("roasAcosVal");
    const roasSubText = document.getElementById("roasSubText");
    const roasAdviceBox = document.getElementById("roasAdviceBox");

    function calculateROAS() {
        if (!roasSpend || !roasSales) return;
        const spend = Math.max(0, parseNum(roasSpend.value));
        const sales = Math.max(0, parseNum(roasSales.value));

        if (spend <= 0 || sales <= 0) {
            if (roasResultVal) roasResultVal.innerText = "0.00x";
            if (roasAcosVal) roasAcosVal.innerText = "0.00%";
            if (roasSubText) roasSubText.innerText = "Enter ad spend and ad sales to calculate ROAS.";
            if (roasAdviceBox) roasAdviceBox.innerHTML = "<strong>Guidance:</strong> ROAS measures return per ₹1 ad spend.";
            return;
        }

        const roas = sales / spend;
        const acos = (spend / sales) * 100;

        if (roasResultVal) roasResultVal.innerText = formatNum(roas) + "x";
        if (roasAcosVal) roasAcosVal.innerText = formatPct(acos);
        if (roasSubText) roasSubText.innerText = `You generated ${formatCurr(roas)} in revenue for every ₹1 spent on ads.`;

        if (roasAdviceBox) {
            roasAdviceBox.innerHTML = `<strong>What does this mean?</strong> A ROAS of <strong>${formatNum(roas)}x</strong> corresponds to an ACoS of <strong>${formatPct(acos)}</strong>. Check campaign goals to see if this supports your target growth.`;
        }
    }

    if (roasSpend && roasSales) {
        roasSpend.addEventListener("input", calculateROAS);
        roasSales.addEventListener("input", calculateROAS);
        calculateROAS();
    }

    // --- 3. BREAK-EVEN ACOS CALCULATOR ---
    const bePrice = document.getElementById("bePrice");
    const beCogs = document.getElementById("beCogs");
    const beRefPct = document.getElementById("beRefPct");
    const beFbaFee = document.getElementById("beFbaFee");
    const beOtherFee = document.getElementById("beOtherFee");

    const beResultVal = document.getElementById("beResultVal");
    const beMarginVal = document.getElementById("beMarginVal");
    const beSubText = document.getElementById("beSubText");
    const beAdviceBox = document.getElementById("beAdviceBox");
    const beBarMargin = document.getElementById("beBarMargin");

    function calculateBreakEven() {
        if (!bePrice || !beCogs) return;
        const price = Math.max(0, parseNum(bePrice.value));
        const cogs = Math.max(0, parseNum(beCogs.value));
        const refPct = Math.max(0, parseNum(beRefPct ? beRefPct.value : 15));
        const fbaFee = Math.max(0, parseNum(beFbaFee ? beFbaFee.value : 0));
        const otherFee = Math.max(0, parseNum(beOtherFee ? beOtherFee.value : 0));

        if (price <= 0) {
            if (beResultVal) beResultVal.innerText = "0.00%";
            if (beMarginVal) beMarginVal.innerText = "₹0.00";
            if (beSubText) beSubText.innerText = "Enter selling price and costs to calculate Break-Even ACoS.";
            return;
        }

        const refAmount = price * (refPct / 100);
        const totalCosts = cogs + refAmount + fbaFee + otherFee;
        const margin = price - totalCosts;
        const beAcos = (margin / price) * 100;

        if (beResultVal) beResultVal.innerText = formatPct(Math.max(0, beAcos));
        if (beMarginVal) beMarginVal.innerText = formatCurr(margin);
        if (beSubText) beSubText.innerText = `Product contribution margin is ${formatCurr(margin)} before advertising.`;

        if (beBarMargin) beBarMargin.style.width = Math.max(0, Math.min(100, beAcos)) + "%";

        if (beAdviceBox) {
            if (beAcos <= 0) {
                beAdviceBox.innerHTML = `<strong>Warning:</strong> Product costs exceed selling price before advertising! Check price or unit economics.`;
            } else {
                beAdviceBox.innerHTML = `<strong>What does this mean?</strong> If your PPC campaign ACoS is below <strong>${formatPct(beAcos)}</strong>, your advertising is profitable. If it exceeds <strong>${formatPct(beAcos)}</strong>, ads consume margin.`;
            }
        }
    }

    if (bePrice && beCogs) {
        [bePrice, beCogs, beRefPct, beFbaFee, beOtherFee].forEach(el => {
            if (el) el.addEventListener("input", calculateBreakEven);
        });
        calculateBreakEven();
    }

    // --- 4. TACOS CALCULATOR ---
    const tacosSpend = document.getElementById("tacosSpend");
    const tacosTotalSales = document.getElementById("tacosTotalSales");
    const tacosResultVal = document.getElementById("tacosResultVal");
    const tacosSubText = document.getElementById("tacosSubText");

    function calculateTACoS() {
        if (!tacosSpend || !tacosTotalSales) return;
        const spend = Math.max(0, parseNum(tacosSpend.value));
        const totalSales = Math.max(0, parseNum(tacosTotalSales.value));

        if (totalSales <= 0 || spend <= 0) {
            if (tacosResultVal) tacosResultVal.innerText = "0.00%";
            if (tacosSubText) tacosSubText.innerText = "Enter ad spend and total Amazon sales to calculate TACoS.";
            return;
        }

        const tacos = (spend / totalSales) * 100;
        if (tacosResultVal) tacosResultVal.innerText = formatPct(tacos);
        if (tacosSubText) tacosSubText.innerText = `Ad spend represents ${formatPct(tacos)} of overall business revenue.`;
    }

    if (tacosSpend && tacosTotalSales) {
        tacosSpend.addEventListener("input", calculateTACoS);
        tacosTotalSales.addEventListener("input", calculateTACoS);
        calculateTACoS();
    }

    // --- 5. CONVERSION RATE CALCULATOR ---
    const cvrClicks = document.getElementById("cvrClicks");
    const cvrOrders = document.getElementById("cvrOrders");
    const cvrResultVal = document.getElementById("cvrResultVal");
    const cvrRatioVal = document.getElementById("cvrRatioVal");
    const cvrSubText = document.getElementById("cvrSubText");

    function calculateCVR() {
        if (!cvrClicks || !cvrOrders) return;
        const clicks = Math.max(0, parseNum(cvrClicks.value));
        const orders = Math.max(0, parseNum(cvrOrders.value));

        if (clicks <= 0 || orders <= 0) {
            if (cvrResultVal) cvrResultVal.innerText = "0.00%";
            if (cvrRatioVal) cvrRatioVal.innerText = "0.00";
            if (cvrSubText) cvrSubText.innerText = "Enter clicks and orders to calculate PPC Conversion Rate.";
            return;
        }

        const cvr = (orders / clicks) * 100;
        const clicksPerOrder = clicks / orders;

        if (cvrResultVal) cvrResultVal.innerText = formatPct(cvr);
        if (cvrRatioVal) cvrRatioVal.innerText = formatNum(clicksPerOrder);
        if (cvrSubText) cvrSubText.innerText = `Average of 1 order generated every ${formatNum(clicksPerOrder)} ad clicks.`;
    }

    if (cvrClicks && cvrOrders) {
        cvrClicks.addEventListener("input", calculateCVR);
        cvrOrders.addEventListener("input", calculateCVR);
        calculateCVR();
    }

    // --- 6. CPC CALCULATOR ---
    const cpcSpend = document.getElementById("cpcSpend");
    const cpcClicks = document.getElementById("cpcClicks");
    const cpcResultVal = document.getElementById("cpcResultVal");
    const cpcSubText = document.getElementById("cpcSubText");

    function calculateCPC() {
        if (!cpcSpend || !cpcClicks) return;
        const spend = Math.max(0, parseNum(cpcSpend.value));
        const clicks = Math.max(0, parseNum(cpcClicks.value));

        if (clicks <= 0 || spend <= 0) {
            if (cpcResultVal) cpcResultVal.innerText = "₹0.00";
            if (cpcSubText) cpcSubText.innerText = "Enter ad spend and total clicks to calculate CPC.";
            return;
        }

        const cpc = spend / clicks;
        if (cpcResultVal) cpcResultVal.innerText = formatCurr(cpc);
        if (cpcSubText) cpcSubText.innerText = `Average cost for each shopper click on your ad.`;
    }

    if (cpcSpend && cpcClicks) {
        cpcSpend.addEventListener("input", calculateCPC);
        cpcClicks.addEventListener("input", calculateCPC);
        calculateCPC();
    }

    // --- 7. CTR CALCULATOR ---
    const ctrImpressions = document.getElementById("ctrImpressions");
    const ctrClicks = document.getElementById("ctrClicks");
    const ctrResultVal = document.getElementById("ctrResultVal");
    const ctrSubText = document.getElementById("ctrSubText");

    function calculateCTR() {
        if (!ctrImpressions || !ctrClicks) return;
        const imp = Math.max(0, parseNum(ctrImpressions.value));
        const clicks = Math.max(0, parseNum(ctrClicks.value));

        if (imp <= 0 || clicks <= 0) {
            if (ctrResultVal) ctrResultVal.innerText = "0.00%";
            if (ctrSubText) ctrSubText.innerText = "Enter impressions and clicks to calculate CTR.";
            return;
        }

        const ctr = (clicks / imp) * 100;
        if (ctrResultVal) ctrResultVal.innerText = formatPct(ctr);
        if (ctrSubText) ctrSubText.innerText = `Ad clicked ${clicks.toLocaleString()} times out of ${imp.toLocaleString()} impressions.`;
    }

    if (ctrImpressions && ctrClicks) {
        ctrImpressions.addEventListener("input", calculateCTR);
        ctrClicks.addEventListener("input", calculateCTR);
        calculateCTR();
    }

    // --- 8. BUDGET CALCULATOR ---
    const bgtTargetSales = document.getElementById("bgtTargetSales");
    const bgtContribPct = document.getElementById("bgtContribPct");
    const bgtAcosPct = document.getElementById("bgtAcosPct");
    const bgtResultVal = document.getElementById("bgtResultVal");
    const bgtDailyVal = document.getElementById("bgtDailyVal");
    const bgtSubText = document.getElementById("bgtSubText");

    function calculateBudget() {
        if (!bgtTargetSales) return;
        const totalSales = Math.max(0, parseNum(bgtTargetSales.value));
        const contrib = Math.max(0, parseNum(bgtContribPct ? bgtContribPct.value : 40));
        const acos = Math.max(0, parseNum(bgtAcosPct ? bgtAcosPct.value : 25));

        if (totalSales <= 0) {
            if (bgtResultVal) bgtResultVal.innerText = "₹0";
            if (bgtDailyVal) bgtDailyVal.innerText = "₹0";
            if (bgtSubText) bgtSubText.innerText = "Enter target monthly sales to estimate ad budget.";
            return;
        }

        const adRevenue = totalSales * (contrib / 100);
        const monthlyBudget = adRevenue * (acos / 100);
        const dailyBudget = monthlyBudget / 30;

        if (bgtResultVal) bgtResultVal.innerText = formatCurr(monthlyBudget);
        if (bgtDailyVal) bgtDailyVal.innerText = formatCurr(dailyBudget);
        if (bgtSubText) bgtSubText.innerText = `Based on generating ${formatCurr(adRevenue)} PPC sales at ${formatPct(acos)} ACoS.`;
    }

    if (bgtTargetSales) {
        [bgtTargetSales, bgtContribPct, bgtAcosPct].forEach(el => {
            if (el) el.addEventListener("input", calculateBudget);
        });
        calculateBudget();
    }

    // --- 9. TARGET ACOS / BID CALCULATOR ---
    const bidPrice = document.getElementById("bidPrice");
    const bidCvrPct = document.getElementById("bidCvrPct");
    const bidAcosPct = document.getElementById("bidAcosPct");
    const bidResultVal = document.getElementById("bidResultVal");
    const bidSpendOrderVal = document.getElementById("bidSpendOrderVal");
    const bidSubText = document.getElementById("bidSubText");

    function calculateTargetBid() {
        if (!bidPrice) return;
        const price = Math.max(0, parseNum(bidPrice.value));
        const cvr = Math.max(0, parseNum(bidCvrPct ? bidCvrPct.value : 10));
        const acos = Math.max(0, parseNum(bidAcosPct ? bidAcosPct.value : 25));

        if (price <= 0 || cvr <= 0) {
            if (bidResultVal) bidResultVal.innerText = "₹0.00";
            if (bidSpendOrderVal) bidSpendOrderVal.innerText = "₹0.00";
            if (bidSubText) bidSubText.innerText = "Enter product selling price and conversion rate to estimate target bid.";
            return;
        }

        const allowableSpendPerOrder = price * (acos / 100);
        const maxCpc = allowableSpendPerOrder * (cvr / 100);

        if (bidResultVal) bidResultVal.innerText = formatCurr(maxCpc);
        if (bidSpendOrderVal) bidSpendOrderVal.innerText = formatCurr(allowableSpendPerOrder);
        if (bidSubText) bidSubText.innerText = `Maximum recommended CPC to maintain ${formatPct(acos)} target ACoS.`;
    }

    if (bidPrice) {
        [bidPrice, bidCvrPct, bidAcosPct].forEach(el => {
            if (el) el.addEventListener("input", calculateTargetBid);
        });
        calculateTargetBid();
    }

    // --- 10. INTERACTIVE TOOL FINDER ON RESOURCES.HTML ---
    const problemChips = document.querySelectorAll("[data-problem-id]");
    const recOutputTitle = document.getElementById("recOutputTitle");
    const recOutputDesc = document.getElementById("recOutputDesc");
    const recOutputBtn = document.getElementById("recOutputBtn");

    const problemMap = {
        "acos-high": {
            title: "Break-Even ACoS & ACoS Calculator",
            desc: "Find out if your high ACoS is consuming profit margin and calculate your exact break-even threshold.",
            link: "amazon-break-even-acos-calculator.html",
            btnText: "Find Break-Even ACoS →"
        },
        "low-cvr": {
            title: "PPC Conversion Rate & CPC Calculator",
            desc: "Diagnose whether shoppers clicking your ads are bouncing or if your traffic cost is too high.",
            link: "amazon-ppc-conversion-rate-calculator.html",
            btnText: "Check Conversion Rate →"
        },
        "budget-plan": {
            title: "Amazon PPC Budget Calculator",
            desc: "Estimate a working monthly and daily advertising budget based on your target revenue and ACoS.",
            link: "amazon-ppc-budget-calculator.html",
            btnText: "Plan PPC Budget →"
        },
        "profit-check": {
            title: "Break-Even ACoS & ROAS Calculator",
            desc: "Understand how much advertising cost your unit margin can support before ad spend consumes profit.",
            link: "amazon-break-even-acos-calculator.html",
            btnText: "Check Profitability →"
        },
        "tacos-check": {
            title: "Amazon TACoS Calculator",
            desc: "Measure advertising spend against total Amazon sales to understand overall organic + paid momentum.",
            link: "amazon-tacos-calculator.html",
            btnText: "Calculate TACoS →"
        },
        "bid-setting": {
            title: "Target ACoS & Bid Calculator",
            desc: "Estimate a practical cost-per-click bid range using your conversion rate, price, and target ACoS.",
            link: "amazon-target-acos-bid-calculator.html",
            btnText: "Estimate Target Bid →"
        }
    };

    if (problemChips.length > 0) {
        problemChips.forEach(chip => {
            chip.addEventListener("click", function () {
                problemChips.forEach(c => c.classList.remove("active"));
                this.classList.add("active");
                const probId = this.getAttribute("data-problem-id");
                const data = problemMap[probId];
                if (data && recOutputTitle && recOutputDesc && recOutputBtn) {
                    recOutputTitle.innerText = data.title;
                    recOutputDesc.innerText = data.desc;
                    recOutputBtn.href = data.link;
                    recOutputBtn.innerText = data.btnText;
                }
            });
        });
    }

    // --- 11. QUICK TOOL FILTER CHIPS ON RESOURCES.HTML ---
    const toolCategoryChips = document.querySelectorAll("[data-tool-category]");
    const calcCards = document.querySelectorAll(".calc-card[data-category]");

    if (toolCategoryChips.length > 0) {
        toolCategoryChips.forEach(chip => {
            chip.addEventListener("click", function () {
                const cat = this.getAttribute("data-tool-category");
                toolCategoryChips.forEach(c => c.classList.remove("active"));
                this.classList.add("active");

                calcCards.forEach(card => {
                    if (cat === "all" || card.getAttribute("data-category") === cat) {
                        card.style.display = "flex";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // --- 12. RESET BUTTON GENERIC EVENT LISTENER ---
    const resetBtns = document.querySelectorAll(".btn-calc-reset");
    resetBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            const form = this.closest(".calc-inputs-col");
            if (form) {
                const inputs = form.querySelectorAll("input");
                inputs.forEach(i => i.value = "");
                const firstInput = inputs[0];
                if (firstInput) {
                    firstInput.dispatchEvent(new Event("input"));
                }
            }
        });
    });

});
