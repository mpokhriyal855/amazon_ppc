/* =========================================================
   ADVANCED 3D INTERACTIVE CASE SHOWCASE ENGINE
   File: js/case_3d.js
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. STAGE CATEGORY SWITCHER DATA
    const caseData = {
        gaming: {
            title: "Gaming Peripherals — 42% to 14% ACOS Reduction",
            badge: "🎮 Gaming Peripherals",
            acos: "42% → 14%",
            sales: "+78%",
            roas: "7.1x",
            time: "90 Days",
            challenge: "Amazon sales had plateaued despite consistent PPC spend. The account suffered from overlapping campaigns and budget drained on non-converting search terms.",
            solution: "Restructured PPC account into isolated branded vs non-branded campaigns, added 320+ negative exact keywords, and optimized placement multipliers for Top of Search.",
            graphPath: "M 0 70 Q 50 60, 100 45 T 200 25 T 300 8"
        },
        office: {
            title: "Office Products — 2.6x to 5.3x ROAS Scaling",
            badge: "💼 Office Products",
            acos: "28% → 18%",
            sales: "+78%",
            roas: "2.6x → 5.3x",
            time: "120 Days",
            challenge: "High-quality workspace products experienced stagnant sales. Campaigns generated impressions but struggled to capture conversion-ready buyers.",
            solution: "Targeted 45+ competitor ASIN detail pages, implemented dayparting schedules, and reallocated budget into top 20% margin SKUs.",
            graphPath: "M 0 75 Q 60 55, 120 38 T 220 18 T 300 5"
        },
        grocery: {
            title: "Grocery & Gourmet — +86% Revenue & 63% New Customer Growth",
            badge: "🛒 Grocery & Gourmet",
            acos: "32% → 15%",
            sales: "+86%",
            roas: "6.6x",
            time: "90 Days",
            challenge: "High repeat-purchase brand was over-reliant on 3 core keywords. Growth plateaued due to limited non-branded search visibility.",
            solution: "Harvested 85+ long-tail phrase match terms, launched Sponsored Brands video ads, and pushed Subscribe & Save retargeting.",
            graphPath: "M 0 80 Q 70 65, 140 40 T 230 20 T 300 6"
        },
        home: {
            title: "Home & Kitchen — +94% Ad Sales & 5.3x ROAS Benchmark",
            badge: "🏠 Home & Kitchen",
            acos: "35% → 19%",
            sales: "+94%",
            roas: "2.9x → 5.3x",
            time: "120 Days",
            challenge: "Uniform bidding across entire catalogue caused high-converting SKUs to run out of budget while underperforming SKUs wasted capital.",
            solution: "Segmented catalog into Hero, Growth, and Defensive tiers. Reallocated 60% of budget to top-tier winner ASINs.",
            graphPath: "M 0 85 Q 80 50, 160 30 T 250 12 T 300 3"
        }
    };

    // Tab Click Event
    const stageTabs = document.querySelectorAll('.stage-tab-btn');
    const stageTitle = document.getElementById('stageTitle');
    const stageBadge = document.getElementById('stageBadge');
    const stageAcos = document.getElementById('stageAcos');
    const stageSales = document.getElementById('stageSales');
    const stageRoas = document.getElementById('stageRoas');
    const stageTime = document.getElementById('stageTime');
    const stageChallenge = document.getElementById('stageChallenge');
    const stageSolution = document.getElementById('stageSolution');
    const stageGraphPath = document.getElementById('stageGraphPath');
    const stageCard3D = document.getElementById('stageCard3D');

    if (stageTabs.length > 0) {
        stageTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                stageTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const key = tab.dataset.case;
                const data = caseData[key];
                if (!data) return;

                // Animate stage update
                if (stageCard3D) {
                    stageCard3D.style.transform = 'perspective(1200px) rotateY(15deg) scale(0.96)';
                    stageCard3D.style.opacity = '0.5';
                }

                setTimeout(() => {
                    if (stageTitle) stageTitle.textContent = data.title;
                    if (stageBadge) stageBadge.textContent = data.badge;
                    if (stageAcos) stageAcos.textContent = data.acos;
                    if (stageSales) stageSales.textContent = data.sales;
                    if (stageRoas) stageRoas.textContent = data.roas;
                    if (stageTime) stageTime.textContent = data.time;
                    if (stageChallenge) stageChallenge.textContent = data.challenge;
                    if (stageSolution) stageSolution.textContent = data.solution;
                    if (stageGraphPath) stageGraphPath.setAttribute('d', data.graphPath);

                    if (stageCard3D) {
                        stageCard3D.style.transform = 'perspective(1200px) rotateY(0deg) scale(1)';
                        stageCard3D.style.opacity = '1';
                    }
                }, 200);
            });
        });
    }

    // 2. MOUSE TILT FOR ALL 3D CARDS
    const all3DCards = document.querySelectorAll('.tilt-card-3d');
    all3DCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
});
