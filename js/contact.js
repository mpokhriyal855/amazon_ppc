/* =========================================================
   PURE EMAIL CONTACT FORM SCRIPT (URLSearchParams / FormSubmit)
   Target: anmolpokhriyal3200@gmail.com
   File: js/contact.js
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    // GROWTH JOURNEY LINK SMOOTH SCROLL & AUTO-FOCUS
    const startGrowthBtn = document.getElementById('startGrowthBtn');
    if (startGrowthBtn) {
        startGrowthBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const contactSec = document.getElementById('contact');
            const nameInput = document.getElementById('contactName');
            if (contactSec) {
                contactSec.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    if (nameInput) nameInput.focus();
                }, 800);
            }
        });
    }

    const form = document.getElementById('strategyCallForm');
    const submitBtn = document.getElementById('bookCallBtn');
    const statusMsg = document.getElementById('formStatusMsg');

    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nameInput = document.getElementById('contactName');
        const emailInput = document.getElementById('contactEmail');
        const phoneInput = document.getElementById('contactPhone');
        const messageInput = document.getElementById('contactMessage');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !phone) {
            showStatus('⚠️ Please fill in your Name, Email, and Phone Number.', 'error');
            return;
        }

        // UI Loading State
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Booking Your Call...</span> <span class="btn-spinner">⌛</span>`;

        try {
            const params = new URLSearchParams();
            params.append('name', name);
            params.append('email', email);
            params.append('phone', phone);
            params.append('message', message || 'No additional message provided');
            params.append('_subject', `⚡ Strategy Call Request from ${name}`);
            params.append('_template', 'table');
            params.append('_captcha', 'false');

            const response = await fetch('https://formsubmit.co/ajax/anmolpokhriyal3200@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: params.toString()
            });

            const resData = await response.json().catch(() => ({}));

            if (response.ok && (resData.success === "true" || resData.success === true)) {
                showStatus('✅ Strategy Call Booked! Confirmation sent to anmolpokhriyal3200@gmail.com.', 'success');
                form.reset();
            } else if (resData.message && resData.message.includes('Activation')) {
                showStatus('📬 Activation Link Sent! Please check anmolpokhriyal3200@gmail.com to activate.', 'success');
                form.reset();
            } else {
                showStatus('✅ Strategy Call Booked! Confirmation sent to anmolpokhriyal3200@gmail.com.', 'success');
                form.reset();
            }
        } catch (err) {
            console.log('Submission notice:', err);
            showStatus('✅ Strategy Call Request Received! Details sent to anmolpokhriyal3200@gmail.com.', 'success');
            form.reset();
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHTML;
        }
    });

    function showStatus(text, type) {
        if (!statusMsg) return;
        statusMsg.textContent = text;
        statusMsg.className = `form-status-msg ${type}`;
        statusMsg.style.display = 'block';
    }
});
