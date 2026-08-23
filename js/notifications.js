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

        { title: "PPC Growth Audit delivered to Amazon Seller", time: "15 minutes ago", initial: "🎯" }

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
