/* ===============================================================
   PPC Growth Expert — Amazon Profit Calculator JS Logic
   File: js/calculator.js
================================================================*/

(function() {
    'use strict';

    // Categories and Referral Fee Slabs (India Market Examples)
    const CATEGORIES = [
        { id: 'electronics', name: 'Consumer Electronics & Accessories', rate: 10.5 },
        { id: 'apparel', name: 'Apparel & Clothing', rate: 13.0 },
        { id: 'footwear', name: 'Footwear & Shoes', rate: 12.0 },
        { id: 'beauty', name: 'Beauty & Personal Care', rate: 8.5 },
        { id: 'home', name: 'Home & Kitchen', rate: 11.0 },
        { id: 'grocery', name: 'Gourmet & Grocery', rate: 6.0 },
        { id: 'books', name: 'Books & Stationery', rate: 9.0 },
        { id: 'sports', name: 'Sports & Fitness Equipment', rate: 10.0 },
        { id: 'toys', name: 'Toys & Baby Products', rate: 9.5 },
        { id: 'automotive', name: 'Automotive & Accessories', rate: 12.5 },
        { id: 'other', name: 'General / Other Category', rate: 12.0 }
    ];

    // Helper functions
    const fmtRs = val => '₹' + Math.round(val).toLocaleString('en-IN');
    const fmtPct = val => (val || 0).toFixed(1) + '%';

    function initCalculator() {
        const catSelect = document.getElementById('category');
        if (!catSelect) return;

        // Populate Category Dropdown
        catSelect.innerHTML = CATEGORIES.map(c => `<option value="${c.id}" data-rate="${c.rate}">${c.name} (~${c.rate}%)</option>`).join('');

        // Attach listeners to inputs
        const inputs = document.querySelectorAll('#calcForm input, #calcForm select');
        inputs.forEach(inp => {
            inp.addEventListener('input', calculate);
            inp.addEventListener('change', calculate);
        });

        // Radios for fulfillment
        document.querySelectorAll('input[name="fulfillment"]').forEach(r => {
            r.addEventListener('change', () => {
                const isSelf = document.getElementById('ff-self').checked;
                const isFba = document.getElementById('ff-fba').checked;
                
                document.getElementById('sellerShipField').hidden = !isSelf;
                document.getElementById('zoneField').hidden = isSelf;
                document.getElementById('storageField').style.display = isFba ? 'block' : 'none';
                calculate();
            });
        });

        // Action Buttons
        document.getElementById('btnCalc')?.addEventListener('click', calculate);
        document.getElementById('btnReset')?.addEventListener('click', resetForm);
        document.getElementById('btnExample')?.addEventListener('click', loadExample);

        // Sliders
        const sliders = ['sfPrice', 'sfAcos', 'sfCpc', 'sfCvr'];
        sliders.forEach(sId => {
            document.getElementById(sId)?.addEventListener('input', updateSliders);
        });

        // Price optimization input
        document.getElementById('targetPriceMargin')?.addEventListener('input', calculate);

        // Set fee updated date
        const feeDate = document.getElementById('feeUpdated');
        if (feeDate) feeDate.textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

        // Initial Calculation
        calculate();
    }

    function calculate() {
        // Read Inputs
        const sellingPrice = parseFloat(document.getElementById('sellingPrice')?.value) || 0;
        const productCost = parseFloat(document.getElementById('productCost')?.value) || 0;
        const packagingCost = parseFloat(document.getElementById('packagingCost')?.value) || 0;
        const otherProductCost = parseFloat(document.getElementById('otherProductCost')?.value) || 0;

        const catEl = document.getElementById('category');
        const catRate = parseFloat(catEl?.options[catEl.selectedIndex]?.dataset?.rate) || 12.0;

        const weightG = parseFloat(document.getElementById('weight')?.value) || 500;
        const weightUnit = document.getElementById('weightUnit')?.value || 'g';
        const weightKg = weightUnit === 'g' ? weightG / 1000 : weightG;

        const fulfillment = document.querySelector('input[name="fulfillment"]:checked')?.value || 'fba';
        const zone = document.getElementById('zone')?.value || 'regional';
        const sellerShipping = parseFloat(document.getElementById('sellerShipping')?.value) || 0;

        const storageMonths = parseFloat(document.getElementById('storageMonths')?.value) || 0;
        const gstOnFeesPct = parseFloat(document.getElementById('gstOnFees')?.value) || 18;
        const otherAmazonCharges = parseFloat(document.getElementById('otherAmazonCharges')?.value) || 0;
        const gstCredit = document.getElementById('gstCredit')?.value === 'yes';

        const expectedAcos = parseFloat(document.getElementById('expectedAcos')?.value) || 0;
        const avgCpc = parseFloat(document.getElementById('avgCpc')?.value) || 0;
        const cvr = parseFloat(document.getElementById('cvr')?.value) || 0;
        const desiredMargin = parseFloat(document.getElementById('desiredMargin')?.value) || 15;
        const dailyBudget = parseFloat(document.getElementById('dailyBudget')?.value) || 0;
        const monthlyRevenue = parseFloat(document.getElementById('monthlyRevenue')?.value) || 0;

        const returnRate = parseFloat(document.getElementById('returnRate')?.value) || 0;
        const returnCost = parseFloat(document.getElementById('returnCost')?.value) || 0;
        const refundLoss = parseFloat(document.getElementById('refundLoss')?.value) || 0;
        const otherLoss = parseFloat(document.getElementById('otherLoss')?.value) || 0;

        // 1. Calculate Amazon Fees
        const referralFee = sellingPrice * (catRate / 100);

        // Closing Fee calculation based on price slabs
        let closingFee = 25;
        if (sellingPrice > 1000) closingFee = 55;
        else if (sellingPrice > 500) closingFee = 35;
        else if (sellingPrice > 250) closingFee = 20;

        // Fulfillment / Logistics Fee
        let fulfillmentFee = 0;
        if (fulfillment === 'fba') {
            const baseShip = zone === 'local' ? 42 : zone === 'regional' ? 58 : 75;
            const weightTier = Math.ceil(weightKg / 0.5);
            fulfillmentFee = baseShip + (weightTier > 1 ? (weightTier - 1) * 18 : 0);
            fulfillmentFee += (storageMonths * 25); // storage estimate
        } else if (fulfillment === 'easyship') {
            const baseShip = zone === 'local' ? 38 : zone === 'regional' ? 52 : 68;
            const weightTier = Math.ceil(weightKg / 0.5);
            fulfillmentFee = baseShip + (weightTier > 1 ? (weightTier - 1) * 15 : 0);
        } else {
            fulfillmentFee = sellerShipping;
        }

        const rawFeeTotal = referralFee + closingFee + fulfillmentFee + otherAmazonCharges;
        const gstOnFeesAmount = rawFeeTotal * (gstOnFeesPct / 100);
        const totalAmazonFee = rawFeeTotal + (gstCredit ? 0 : gstOnFeesAmount);

        // Render Fee Ledger
        const feeLedger = document.getElementById('feeLedger');
        if (feeLedger) {
            feeLedger.innerHTML = `
                <div class="row"><span class="lbl">Referral Fee (${catRate}%)</span><span class="val">${fmtRs(referralFee)}</span></div>
                <div class="row"><span class="lbl">Closing Fee</span><span class="val">${fmtRs(closingFee)}</span></div>
                <div class="row"><span class="lbl">Fulfillment / Shipping (${fulfillment.toUpperCase()})</span><span class="val">${fmtRs(fulfillmentFee)}</span></div>
                ${otherAmazonCharges > 0 ? `<div class="row"><span class="lbl">Other Amazon Charges</span><span class="val">${fmtRs(otherAmazonCharges)}</span></div>` : ''}
                <div class="row ${gstCredit ? 'muted-row' : ''}"><span class="lbl">GST on Fees (${gstOnFeesPct}% ${gstCredit ? '- Claimed Credit' : ''})</span><span class="val">${gstCredit ? '₹0 (Claimed)' : fmtRs(gstOnFeesAmount)}</span></div>
                <div class="row total"><span class="lbl">Total Amazon Fees</span><span class="val">${fmtRs(totalAmazonFee)}</span></div>
            `;
        }

        // 2. Unit Costs & Margins
        const totalLandedProductCost = productCost + packagingCost + otherProductCost;
        const returnLossPerUnit = (returnRate / 100) * (returnCost + refundLoss) + otherLoss;
        const preAdProfit = sellingPrice - totalLandedProductCost - totalAmazonFee - returnLossPerUnit;
        const adCostPerUnit = sellingPrice * (expectedAcos / 100);
        const netProfit = preAdProfit - adCostPerUnit;
        const netMargin = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

        // 3. PPC Economics
        const breakEvenAcos = sellingPrice > 0 ? (preAdProfit / sellingPrice) * 100 : 0;
        const targetAcos = Math.max(0, breakEvenAcos - desiredMargin);
        const maxCpc = (sellingPrice * (targetAcos / 100) * (cvr / 100));
        const reqCvr = (sellingPrice > 0 && targetAcos > 0) ? (avgCpc / (sellingPrice * (targetAcos / 100))) * 100 : 0;

        // TACOS
        let tacos = 0;
        if (monthlyRevenue > 0 && dailyBudget > 0) {
            tacos = ((dailyBudget * 30) / monthlyRevenue) * 100;
        } else {
            tacos = expectedAcos * 0.65; // Estimated blended organic ratio
        }

        // Render Headline & Metrics
        const netProfitEl = document.getElementById('netProfit');
        if (netProfitEl) {
            netProfitEl.textContent = fmtRs(netProfit);
            netProfitEl.className = 'big num ' + (netProfit >= 0 ? 'pos' : 'neg');
        }

        const netMarginEl = document.getElementById('netMargin');
        if (netMarginEl) netMarginEl.textContent = fmtPct(netMargin);

        const chipEl = document.getElementById('fulfilChip');
        if (chipEl) chipEl.textContent = fulfillment.toUpperCase();

        document.getElementById('mSelling').textContent = fmtRs(sellingPrice);
        document.getElementById('mProduct').textContent = fmtRs(totalLandedProductCost);
        document.getElementById('mProductPct').textContent = fmtPct((totalLandedProductCost / sellingPrice) * 100);

        document.getElementById('mFees').textContent = fmtRs(totalAmazonFee);
        document.getElementById('mFeesPct').textContent = fmtPct((totalAmazonFee / sellingPrice) * 100);

        document.getElementById('mAds').textContent = fmtRs(adCostPerUnit);
        document.getElementById('mAdsPct').textContent = fmtPct(expectedAcos);

        document.getElementById('mReturns').textContent = fmtRs(returnLossPerUnit);
        document.getElementById('mReturnsPct').textContent = fmtPct((returnLossPerUnit / sellingPrice) * 100);

        document.getElementById('mPreAd').textContent = fmtRs(preAdProfit);
        document.getElementById('mBeAcos').textContent = fmtPct(breakEvenAcos);
        document.getElementById('mTgtAcos').textContent = fmtPct(targetAcos);

        document.getElementById('mMaxCpc').textContent = fmtRs(maxCpc);
        document.getElementById('mReqCvr').textContent = fmtPct(reqCvr);
        document.getElementById('mTacos').textContent = fmtPct(tacos);
        document.getElementById('mAfterPpc').textContent = fmtRs(netProfit);

        // 4. Update Score & Recommendations
        updateScoreAndRecs(netMargin, breakEvenAcos, expectedAcos, cvr, avgCpc, maxCpc);

        // 5. Update Allocation Bar & Donut
        updateAllocations(sellingPrice, totalLandedProductCost, totalAmazonFee, adCostPerUnit, returnLossPerUnit, netProfit);

        // 6. Update Sliders & Scenarios
        updateScenarioTable(sellingPrice, totalLandedProductCost, totalAmazonFee, returnLossPerUnit, cvr, expectedAcos);

        // 7. Price Optimization Solver
        updatePriceOptimization(desiredMargin, totalLandedProductCost, catRate, weightKg, fulfillment, zone);

        // 8. Budget Insights
        updateBudgetLedger(dailyBudget, avgCpc, cvr, sellingPrice, netProfit);
    }

    function updateScoreAndRecs(netMargin, breakEvenAcos, expectedAcos, cvr, avgCpc, maxCpc) {
        const scoreBox = document.getElementById('scoreBox');
        const scoreIcon = document.getElementById('scoreIcon');
        const scoreTitle = document.getElementById('scoreTitle');
        const scoreText = document.getElementById('scoreText');
        const recList = document.getElementById('recList');

        if (!scoreBox) return;

        let statusClass = 'g';
        let title = 'Healthy Profitability';
        let icon = '🟢';
        let desc = 'Your unit economics leave healthy room for PPC advertising and profitable growth.';

        if (netMargin < 0) {
            statusClass = 'r';
            title = 'Unprofitable (Operating Loss)';
            icon = '🔴';
            desc = 'You are losing money on every sale after factoring in fees, ads and costs.';
        } else if (netMargin < 10) {
            statusClass = 'y';
            title = 'Thin Profit Margin';
            icon = '🟡';
            desc = 'Your net profit margin is below 10%. A small rise in returns or ad costs will create losses.';
        }

        scoreBox.className = 'score ' + statusClass;
        scoreIcon.textContent = icon;
        scoreTitle.textContent = title;
        scoreText.textContent = desc;

        // Generate Action Recommendations
        const recs = [];
        if (expectedAcos > breakEvenAcos) {
            recs.push({ type: 'bad', t: 'ACOS exceeds Break-even ACOS', d: `Your expected ACOS (${fmtPct(expectedAcos)}) is higher than your Break-even ACOS (${fmtPct(breakEvenAcos)}). Every ad sale loses money.` });
        } else if (expectedAcos > breakEvenAcos * 0.8) {
            recs.push({ type: 'warn', t: 'High ACOS Risk', d: 'Your current ACOS is consuming over 80% of your pre-ad margin.' });
        }

        if (avgCpc > maxCpc) {
            recs.push({ type: 'warn', t: 'CPC is above Maximum Target', d: `Your current CPC (${fmtRs(avgCpc)}) is higher than your Max CPC threshold (${fmtRs(maxCpc)}). Improve listing CVR to support higher bids.` });
        }

        if (cvr < 7) {
            recs.push({ type: 'warn', t: 'Low Listing Conversion Rate', d: 'Listing CVR below 7% forces higher ad costs. Optimize images, A+ content & pricing.' });
        } else {
            recs.push({ type: 'good', t: 'Strong Conversion Rate', d: 'Your conversion rate allows competitive bidding while maintaining target margin.' });
        }

        recList.innerHTML = recs.map(r => `
            <li class="rec ${r.type}">
                <div class="rt">${r.t}</div>
                <div class="rd">${r.d}</div>
            </li>
        `).join('');
    }

    function updateAllocations(sp, product, fees, ads, returns, profit) {
        if (sp <= 0) return;
        const pPct = Math.max(0, (product / sp) * 100);
        const fPct = Math.max(0, (fees / sp) * 100);
        const aPct = Math.max(0, (ads / sp) * 100);
        const rPct = Math.max(0, (returns / sp) * 100);
        const netPct = Math.max(0, (profit / sp) * 100);

        const allocBar = document.getElementById('allocBar');
        if (allocBar) {
            allocBar.innerHTML = `
                <span style="width:${pPct}%;background:#3b82f6" title="Product Cost"></span>
                <span style="width:${fPct}%;background:#8b5cf6" title="Amazon Fees"></span>
                <span style="width:${aPct}%;background:#f59e0b" title="Advertising"></span>
                <span style="width:${rPct}%;background:#ef4444" title="Returns"></span>
                <span style="width:${netPct}%;background:#10b981" title="Net Profit"></span>
            `;
        }

        const allocLegend = document.getElementById('allocLegend');
        if (allocLegend) {
            allocLegend.innerHTML = `
                <div class="legend-row"><div class="swatch" style="background:#3b82f6"></div><span class="lg-name">Product Cost</span><span class="lg-val">${fmtRs(product)}</span><span class="lg-pct">${fmtPct(pPct)}</span></div>
                <div class="legend-row"><div class="swatch" style="background:#8b5cf6"></div><span class="lg-name">Amazon Fees</span><span class="lg-val">${fmtRs(fees)}</span><span class="lg-pct">${fmtPct(fPct)}</span></div>
                <div class="legend-row"><div class="swatch" style="background:#f59e0b"></div><span class="lg-name">Advertising</span><span class="lg-val">${fmtRs(ads)}</span><span class="lg-pct">${fmtPct(aPct)}</span></div>
                <div class="legend-row"><div class="swatch" style="background:#ef4444"></div><span class="lg-name">Returns & Losses</span><span class="lg-val">${fmtRs(returns)}</span><span class="lg-pct">${fmtPct(rPct)}</span></div>
                <div class="legend-row"><div class="swatch" style="background:#10b981"></div><span class="lg-name">Net Profit Margin</span><span class="lg-val">${fmtRs(profit)}</span><span class="lg-pct">${fmtPct(netPct)}</span></div>
            `;
        }

        // Donut text
        const donutVal = document.getElementById('donutVal');
        if (donutVal) donutVal.textContent = fmtPct(netPct);
    }

    function updateScenarioTable(sp, product, fees, returns, cvr, acos) {
        const rows = document.getElementById('scenarioRows');
        if (!rows) return;

        const scenarios = [
            { name: 'Current Inputs', mult: 1.0 },
            { name: '+10% Selling Price', mult: 1.1 },
            { name: '-10% Selling Price', mult: 0.9 },
            { name: '+20% Listing CVR', multCVR: 1.2 }
        ];

        rows.innerHTML = scenarios.map((s, idx) => {
            const curSp = sp * (s.mult || 1.0);
            const curCvr = cvr * (s.multCVR || 1.0);
            const preAd = curSp - product - fees - returns;
            const adCost = curSp * (acos / 100);
            const netP = preAd - adCost;
            const netM = curSp > 0 ? (netP / curSp) * 100 : 0;
            const beAcos = curSp > 0 ? (preAd / curSp) * 100 : 0;
            const maxCpc = curSp * (beAcos * 0.7 / 100) * (curCvr / 100);

            return `
                <tr class="${idx === 0 ? 'is-current' : ''}">
                    <td>${s.name}</td>
                    <td>${fmtRs(netP)}</td>
                    <td>${fmtPct(netM)}</td>
                    <td>${fmtPct(beAcos)}</td>
                    <td>${fmtRs(maxCpc)}</td>
                    <td>${fmtPct(curCvr)}</td>
                </tr>
            `;
        }).join('');
    }

    function updatePriceOptimization(targetMargin, productCost, catRate, weightKg, fulfillment, zone) {
        const optPriceEl = document.getElementById('optPrice');
        const optNoteEl = document.getElementById('optNote');
        if (!optPriceEl) return;

        // Simplified price solver loop
        let solvedPrice = (productCost * 1.8);
        for (let p = productCost + 50; p <= productCost * 5; p += 10) {
            const ref = p * (catRate / 100);
            const close = p > 1000 ? 55 : (p > 500 ? 35 : 20);
            const ship = zone === 'local' ? 40 : 60;
            const fees = ref + close + ship;
            const margin = ((p - productCost - fees) / p) * 100;
            if (margin >= targetMargin) {
                solvedPrice = p;
                break;
            }
        }

        optPriceEl.textContent = fmtRs(solvedPrice);
        optNoteEl.textContent = `Selling at ${fmtRs(solvedPrice)} covers all fees & yields ~${targetMargin}% net margin.`;
    }

    function updateBudgetLedger(dailyBudget, cpc, cvr, sellingPrice, netProfit) {
        const ledger = document.getElementById('budgetLedger');
        const verdict = document.getElementById('budgetVerdict');
        if (!ledger) return;

        const estClicks = cpc > 0 ? Math.floor(dailyBudget / cpc) : 0;
        const estOrders = Math.floor(estClicks * (cvr / 100));
        const estSales = estOrders * sellingPrice;
        const estMonthlyProfit = estOrders * netProfit * 30;

        ledger.innerHTML = `
            <div class="row"><span class="lbl">Est. Daily Clicks</span><span class="val">${estClicks} clicks/day</span></div>
            <div class="row"><span class="lbl">Est. Daily Orders</span><span class="val">${estOrders} orders/day</span></div>
            <div class="row"><span class="lbl">Est. Daily Revenue</span><span class="val">${fmtRs(estSales)}/day</span></div>
            <div class="row total"><span class="lbl">Est. Monthly Profit from Ads</span><span class="val">${fmtRs(estMonthlyProfit)}/mo</span></div>
        `;

        if (verdict) {
            verdict.textContent = estOrders > 0
                ? `A daily budget of ${fmtRs(dailyBudget)} delivers ~${estOrders} ad orders daily at ${fmtRs(cpc)} CPC.`
                : 'Increase daily budget or improve conversion rate to see estimated order volume.';
        }
    }

    function updateSliders() {
        const pVal = document.getElementById('sfPrice')?.value;
        const aVal = document.getElementById('sfAcos')?.value;
        const cVal = document.getElementById('sfCpc')?.value;
        const rVal = document.getElementById('sfCvr')?.value;

        if (document.getElementById('sfPriceVal')) document.getElementById('sfPriceVal').textContent = '₹' + (pVal * 20);
        if (document.getElementById('sfAcosVal')) document.getElementById('sfAcosVal').textContent = aVal + '%';
        if (document.getElementById('sfCpcVal')) document.getElementById('sfCpcVal').textContent = '₹' + (cVal / 3).toFixed(1);
        if (document.getElementById('sfCvrVal')) document.getElementById('sfCvrVal').textContent = rVal + '%';
    }

    function resetForm() {
        document.getElementById('calcForm')?.reset();
        calculate();
    }

    function loadExample() {
        document.getElementById('sellingPrice').value = 1299;
        document.getElementById('productCost').value = 450;
        document.getElementById('expectedAcos').value = 18;
        document.getElementById('avgCpc').value = 12;
        document.getElementById('cvr').value = 9.5;
        calculate();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
        initCalculator();
    }

})();
