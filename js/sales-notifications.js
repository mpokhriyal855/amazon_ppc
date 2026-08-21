/* =========================================================
   LIVE SALES & BOOKING NOTIFICATION WIDGET - PPC GROWTH EXPERT
   File: js/sales-notifications.js
========================================================= */

document.addEventListener('DOMContentLoaded', function () {
    const notifications = [
        { name: "Rahul S.", city: "Delhi", service: "Listing Optimization (₹700)", time: "2 mins ago" },
        { name: "Priya M.", city: "Mumbai", service: "A+ Content & Images (₹2,999)", time: "5 mins ago" },
        { name: "Amit K.", city: "Bengaluru", service: "Amazon Growth Package (₹4,999)", time: "12 mins ago" },
        { name: "Vikram R.", city: "Hyderabad", service: "PPC Audit (₹1,499)", time: "18 mins ago" },
        { name: "Neha G.", city: "Jaipur", service: "Amazon Starter Package (₹1,999)", time: "24 mins ago" },
        { name: "Siddharth T.", city: "Pune", service: "20% OFF Launch Deal", time: "32 mins ago" },
        { name: "Karan B.", city: "Ahmedabad", service: "Keyword Research (₹999)", time: "45 mins ago" }
    ];

    // Create Toast DOM Container if not exists
    let container = document.getElementById('salesNotifyContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'salesNotifyContainer';
        container.className = 'sales-notification-container';
        document.body.appendChild(container);
    }

    let currentIndex = 0;

    // Security: HTML entity encoder to prevent XSS
    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showNextNotification() {
        const item = notifications[currentIndex];
        currentIndex = (currentIndex + 1) % notifications.length;

        const firstLetter = sanitizeHTML(item.name.charAt(0));
        const safeName = sanitizeHTML(item.name);
        const safeCity = sanitizeHTML(item.city);
        const safeService = sanitizeHTML(item.service);
        const safeTime = sanitizeHTML(item.time);
        const cardHtml = `
            <div class="sales-notification-card" id="activeNotifyCard">
                <div class="sales-avatar-circle">${firstLetter}</div>
                <div class="sales-notify-content">
                    <div class="sales-notify-title"><strong>${safeName}</strong> (${safeCity}) booked <strong>${safeService}</strong></div>
                    <div class="sales-notify-time">⚡ Verified Order · ${safeTime}</div>
                </div>
                <button class="sales-notify-close" onclick="closeNotifyCard()">&times;</button>
            </div>
        `;

        container.innerHTML = cardHtml;

        setTimeout(() => {
            const card = document.getElementById('activeNotifyCard');
            if (card) card.classList.add('active');
        }, 100);

        // Auto hide after 6 seconds
        setTimeout(() => {
            closeNotifyCard();
        }, 6000);
    }

    window.closeNotifyCard = function () {
        const card = document.getElementById('activeNotifyCard');
        if (card) {
            card.classList.remove('active');
            setTimeout(() => {
                card.remove();
            }, 500);
        }
    };

    // First toast popup after 5 seconds
    setTimeout(showNextNotification, 5000);

    // Repeat every 16 seconds
    setInterval(showNextNotification, 16000);
});
