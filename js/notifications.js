/* =========================================================
   FLOATING NOTIFICATION CONTROLLER (10s Rotation, Top-Right)
   File: js/notifications.js
========================================================= */

(function () {

    const notificationList = [
        { title: "Rajesh K. scaled PPC revenue by +42%", time: "Just now", initial: "R" },
        { title: "New Audit requested from Seller in US", time: "2 minutes ago", initial: "⚡" },
        { title: "Aman S. booked a 30-min strategy call", time: "5 minutes ago", initial: "A" },
        { title: "D2C Brand hit ₹12L monthly PPC sales", time: "8 minutes ago", initial: "📈" },
        { title: "Beauty Brand reduced ACOS from 34% to 14%", time: "12 minutes ago", initial: "✨" },
        { title: "PPC Growth Audit delivered to Amazon Seller", time: "15 minutes ago", initial: "🎯" },
        { title: "Priya M. increased ROAS from 2.8x to 5.4x", time: "18 minutes ago", initial: "P" },
        { title: "New Audit requested from UK Apparel Brand", time: "22 minutes ago", initial: "⚡" },
        { title: "Vikram R. saved ₹45,000 in wasted ad spend", time: "25 minutes ago", initial: "V" },
        { title: "Supplement Brand scaled to ₹25L monthly sales", time: "30 minutes ago", initial: "💊" },
        { title: "Siddharth T. booked a 1-on-1 strategy audit", time: "34 minutes ago", initial: "S" },
        { title: "Electronics Brand reduced TACoS to 7.8%", time: "39 minutes ago", initial: "⚡" },
        { title: "New Audit requested from Seller in Germany", time: "42 minutes ago", initial: "🎯" },
        { title: "Home & Kitchen Brand grew sales by +68%", time: "47 minutes ago", initial: "🏠" },
        { title: "Karan B. unlocked top #1 Sponsored placement", time: "52 minutes ago", initial: "K" },
        { title: "Fitness Brand cut wasted spend by 38%", time: "58 minutes ago", initial: "🏋️" },
        { title: "New Strategy Call scheduled with D2C Founder", time: "1 hour ago", initial: "📞" },
        { title: "Rohan V. achieved 6.2x ROAS on Sponsored Display", time: "1 hour ago", initial: "R" },
        { title: "Toys & Games Seller doubled monthly organic rank", time: "1 hour ago", initial: "🎲" },
        { title: "New Audit requested from Seller in UAE", time: "2 hours ago", initial: "⚡" },
        { title: "Neha G. cut CPC from ₹38 to ₹21 per click", time: "2 hours ago", initial: "N" },
        { title: "Gourmet Food Brand reached ₹18L PPC revenue", time: "2 hours ago", initial: "🍿" },
        { title: "Tarun P. booked a 30-min growth consultation", time: "3 hours ago", initial: "T" },
        { title: "Footwear Brand reduced ACoS from 41% to 16%", time: "3 hours ago", initial: "👟" },
        { title: "New Audit requested from Seller in Canada", time: "3 hours ago", initial: "⚡" },
        { title: "Organic Skincare Brand hit ₹30L Amazon sales", time: "4 hours ago", initial: "🌿" },
        { title: "Aditya S. eliminated 450+ non-converting search terms", time: "4 hours ago", initial: "A" },
        { title: "New Audit requested from Seller in Australia", time: "5 hours ago", initial: "🎯" },
        { title: "Jewelry Brand scaled Sponsored Brand video CTR to 2.4%", time: "5 hours ago", initial: "💎" },
        { title: "Meera D. booked a 1-on-1 account review", time: "6 hours ago", initial: "M" },
        { title: "Pet Care Brand lowered TACoS from 22% to 9.5%", time: "6 hours ago", initial: "🐾" },
        { title: "Automotive Seller saw +85% boost in ad impressions", time: "7 hours ago", initial: "🚗" },
        { title: "New Audit requested from Seller in Japan", time: "7 hours ago", initial: "⚡" },
        { title: "Bhavin K. achieved ₹50L revenue milestone", time: "8 hours ago", initial: "B" },
        { title: "Luggage Brand optimized Sponsored Products CPC by -32%", time: "8 hours ago", initial: "🧳" },
        { title: "Pooja R. booked a 30-min strategy session", time: "9 hours ago", initial: "P" },
        { title: "Baby Care Brand achieved 5.8x ROAS on Amazon India", time: "9 hours ago", initial: "👶" },
        { title: "New Audit requested from Seller in Singapore", time: "10 hours ago", initial: "🎯" },
        { title: "Deepak M. scaled daily PPC orders from 15 to 65", time: "10 hours ago", initial: "D" },
        { title: "Home Decor Brand reduced wasted ad spend by ₹62,000", time: "11 hours ago", initial: "🖼️" },
        { title: "Sunil K. booked a free PPC audit review", time: "11 hours ago", initial: "S" },
        { title: "Stationery Brand grew Amazon total sales by +54%", time: "12 hours ago", initial: "✏️" },
        { title: "New Audit requested from Seller in France", time: "12 hours ago", initial: "⚡" },
        { title: "Gaurav T. improved listing conversion rate to 18.5%", time: "13 hours ago", initial: "G" },
        { title: "Tea & Coffee Brand reached ₹40L total Amazon GMV", time: "14 hours ago", initial: "☕" },
        { title: "Nikhil P. booked a 30-min PPC growth call", time: "15 hours ago", initial: "N" },
        { title: "Outdoor Equipment Brand reduced ACoS from 38% to 15%", time: "16 hours ago", initial: "⛺" },
        { title: "New Audit requested from Seller in Italy", time: "17 hours ago", initial: "🎯" },
        { title: "Kavita S. increased Sponsored Video ROAS to 6.9x", time: "18 hours ago", initial: "K" },
        { title: "Bedding & Linen Brand cut advertising TACoS by half", time: "19 hours ago", initial: "🛏️" },
        { title: "Harsh V. booked a 1-on-1 PPC strategy session", time: "20 hours ago", initial: "H" },
        { title: "Kitchenware Brand hit 1,200 monthly ad orders", time: "21 hours ago", initial: "🍳" },
        { title: "New Audit requested from Seller in Spain", time: "22 hours ago", initial: "⚡" },
        { title: "Alok N. scaled profit margins by +24% after PPC audit", time: "23 hours ago", initial: "A" },
        { title: "Nutritional Brand achieved 5.1x overall account ROAS", time: "1 day ago", initial: "🥛" }
    ];


    let currentIndex = 0;

    let toastTimeout = null;


    function getElements() {

        return {

            toast: document.getElementById("notificationToast"),

            title: document.getElementById("toastTitle"),

            time: document.getElementById("toastTime"),

            avatar: document.getElementById("toastAvatar"),

            close: document.getElementById("toastClose")

        };

    }


    function showToast() {

        /* Strictly check if user is on top home section */

        if (window.scrollY > 250) {

            hideToast();

            return;

        }


        const el = getElements();

        if (!el.toast || !el.title || !el.time) return;


        const item = notificationList[currentIndex % notificationList.length];

        el.title.textContent = item.title;

        el.time.textContent = item.time;

        if (el.avatar) el.avatar.textContent = item.initial;


        el.toast.classList.add("show");

        currentIndex++;


        /* Auto hide after 4.5 seconds */

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {

            hideToast();

        }, 4500);

    }


    function hideToast() {

        const el = getElements();

        if (el.toast) {

            el.toast.classList.remove("show");

        }

    }


    /* Scroll listener to hide immediately when scrolling down */

    window.addEventListener("scroll", () => {

        if (window.scrollY > 250) {

            hideToast();

        }

    });


    /* Initial trigger after 3 seconds */

    setTimeout(showToast, 3000);


    /* 10-second rotation interval */

    setInterval(showToast, 10000);


    /* Close button handler */

    document.addEventListener("click", (e) => {

        if (e.target && (e.target.id === "toastClose" || e.target.classList.contains("toast-close"))) {

            hideToast();

        }

    });

})();
