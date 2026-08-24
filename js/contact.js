/* =========================================================
   PURE EMAIL CONTACT FORM SCRIPT (URLSearchParams / FormSubmit)
   Targets: pokhriyalmansi378@gmail.com
   File: js/contact.js
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    // Security: HTML entity encoder to prevent XSS in dynamic content
    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Security: Basic email format validation
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Security: Basic phone validation (digits, spaces, +, -, min 7 chars)
    function isValidPhone(phone) {
        return /^[\d\s+\-().]{7,20}$/.test(phone);
    }

    // Helper: Floating Top Glass Toast Notification
    function showSuccessToast(name) {
        let toast = document.getElementById('strategySuccessToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'strategySuccessToast';
            toast.style.cssText = `
                position: fixed;
                top: 85px;
                right: 24px;
                z-index: 10000;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1.5px solid #10b981;
                border-left: 5px solid #10b981;
                border-radius: 16px;
                padding: 14px 18px;
                box-shadow: 0 20px 40px -10px rgba(16, 185, 129, 0.3), 0 4px 16px rgba(15, 23, 42, 0.08);
                display: flex;
                align-items: center;
                gap: 14px;
                max-width: 380px;
                width: calc(100vw - 32px);
                transform: translateY(-20px) scale(0.95);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                pointer-events: auto;
            `;
            document.body.appendChild(toast);
        }

        toast.innerHTML = `
            <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);">
                🎉
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14.5px; font-weight: 800; color: #047857; line-height: 1.25;">Strategy Call Booked!</div>
                <div style="font-size: 12px; color: #334155; font-weight: 600; margin-top: 3px; line-height: 1.35;">
                    Thank you <strong>${sanitizeHTML(name)}</strong>! We will reach out on WhatsApp &amp; Email within 2 hours.
                </div>
            </div>
            <button type="button" style="border:0; background:transparent; color:#94a3b8; font-size:18px; cursor:pointer; padding:0 4px;" onclick="this.parentElement.style.opacity='0'; this.parentElement.style.transform='translateY(-20px) scale(0.95)';">&times;</button>
        `;

        // Slide in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0) scale(1)';
        });

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            if (toast) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px) scale(0.95)';
            }
        }, 4000);
    }

    // GROWTH JOURNEY LINK SMOOTH SCROLL & AUTO-FOCUS
    const startGrowthBtn = document.getElementById('startGrowthBtn');
    if (startGrowthBtn) {
        startGrowthBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const contactSec = document.getElementById('contact');
            const targetInput = document.getElementById('bottomContactName') || (contactSec ? contactSec.querySelector('input') : null);
            if (contactSec) {
                contactSec.scrollIntoView({ behavior: 'smooth' });
                if (targetInput) {
                    setTimeout(() => {
                        targetInput.focus({ preventScroll: true });
                    }, 800);
                }
            }
        });
    }

    // Attach submit handlers to ALL strategy call / contact forms on the page
    const forms = document.querySelectorAll('form');

    forms.forEach((form, idx) => {
        const isStrategyForm = form.classList.contains('contact-strategy-form') || 
                               form.classList.contains('case-strategy-form') || 
                               (form.id && (form.id.includes('Strategy') || form.id.includes('contact')));

        if (!isStrategyForm) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const siteKey = window.RECAPTCHA_SITE_KEY || '6LeR8ZUtAAAAAM-5o0vgas6P9qTTz5E7gqI0KFFa';

        // Auto-inject visible reCAPTCHA Checkbox widget above submit button
        if (submitBtn && siteKey && !form.querySelector('.g-recaptcha')) {
            const recaptchaWrapper = document.createElement('div');
            recaptchaWrapper.className = 'recaptcha-widget-wrapper';
            recaptchaWrapper.style.cssText = 'margin: 14px 0; display: flex; justify-content: center; overflow: hidden; max-width: 100%;';
            
            const recaptchaDiv = document.createElement('div');
            recaptchaDiv.className = 'g-recaptcha';
            recaptchaDiv.setAttribute('data-sitekey', siteKey);
            recaptchaDiv.id = `g-recaptcha-${idx}`;
            
            recaptchaWrapper.appendChild(recaptchaDiv);
            submitBtn.parentNode.insertBefore(recaptchaWrapper, submitBtn);
        }

        let isSubmitting = false;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (isSubmitting) return;

            // Scope queries strictly to THIS form instance
            const nameInput = form.querySelector('input[name="name"]');
            const emailInput = form.querySelector('input[name="email"]');
            const phoneInput = form.querySelector('input[name="phone"]');
            const messageInput = form.querySelector('textarea[name="message"], input[name="message"]');
            const currentSubmitBtn = form.querySelector('button[type="submit"]');
            
            let statusMsg = form.querySelector('.form-status-msg');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            // Reset field highlights
            [nameInput, emailInput, phoneInput].forEach(input => {
                if (input) {
                    input.style.borderColor = '#cbd5e1';
                    input.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.04)';
                }
            });

            let missingFields = [];
            if (!name && nameInput) missingFields.push(nameInput);
            if (!email && emailInput) missingFields.push(emailInput);
            if (!phone && phoneInput) missingFields.push(phoneInput);

            // Security: Validate email format
            if (email && !isValidEmail(email)) {
                if (emailInput) {
                    emailInput.style.borderColor = '#ef4444';
                    emailInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.15)';
                }
                if (statusMsg) {
                    statusMsg.innerHTML = `
                        <div style="background: rgba(254, 242, 242, 0.95); border: 1.5px solid #fca5a5; border-radius: 12px; padding: 10px 14px; text-align: center; color: #b91c1c; font-size: 12.5px; font-weight: 700; margin-top: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);">
                            ⚠️ Please enter a valid email address.
                        </div>
                    `;
                    statusMsg.className = 'form-status-msg error';
                    statusMsg.style.display = 'block';
                }
                if (emailInput) emailInput.focus();
                return;
            }

            // Security: Validate phone format
            if (phone && !isValidPhone(phone)) {
                if (phoneInput) {
                    phoneInput.style.borderColor = '#ef4444';
                    phoneInput.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.15)';
                }
                if (statusMsg) {
                    statusMsg.innerHTML = `
                        <div style="background: rgba(254, 242, 242, 0.95); border: 1.5px solid #fca5a5; border-radius: 12px; padding: 10px 14px; text-align: center; color: #b91c1c; font-size: 12.5px; font-weight: 700; margin-top: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);">
                            ⚠️ Please enter a valid phone number.
                        </div>
                    `;
                    statusMsg.className = 'form-status-msg error';
                    statusMsg.style.display = 'block';
                }
                if (phoneInput) phoneInput.focus();
                return;
            }

            if (missingFields.length > 0) {
                missingFields.forEach(input => {
                    input.style.borderColor = '#ef4444';
                    input.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.15)';
                });
                if (statusMsg) {
                    statusMsg.innerHTML = `
                        <div style="background: rgba(254, 242, 242, 0.95); border: 1.5px solid #fca5a5; border-radius: 12px; padding: 10px 14px; text-align: center; color: #b91c1c; font-size: 12.5px; font-weight: 700; margin-top: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);">
                            ⚠️ Please fill in your Name, Email, and Phone Number above.
                        </div>
                    `;
                    statusMsg.className = 'form-status-msg error';
                    statusMsg.style.display = 'block';
                }
                if (missingFields[0]) missingFields[0].focus();
                return;
            }

            // VISIBLE RECAPTCHA CHECKBOX VALIDATION
            let recaptchaToken = '';
            if (window.grecaptcha) {
                // First check if user filled visible checkbox widget
                try {
                    const recaptchaWidget = form.querySelector('.g-recaptcha');
                    if (recaptchaWidget && typeof grecaptcha.getResponse === 'function') {
                        // Check if widget has response
                        recaptchaToken = grecaptcha.getResponse();
                    }
                } catch (e) {
                    console.log('reCAPTCHA widget check:', e);
                }

                // If visible checkbox is not ticked, ask user to tick it
                if (!recaptchaToken && form.querySelector('.g-recaptcha')) {
                    if (statusMsg) {
                        statusMsg.innerHTML = `
                            <div style="background: rgba(254, 242, 242, 0.95); border: 1.5px solid #fca5a5; border-radius: 12px; padding: 10px 14px; text-align: center; color: #b91c1c; font-size: 12.5px; font-weight: 700; margin-top: 8px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);">
                                🤖 Please check the "I'm not a robot" reCAPTCHA box above.
                            </div>
                        `;
                        statusMsg.className = 'form-status-msg error';
                        statusMsg.style.display = 'block';
                    }
                    return;
                }
            }

            // Lock submit state
            isSubmitting = true;

            // Hide any inline status message so form height never increases
            if (statusMsg) {
                statusMsg.style.display = 'none';
                statusMsg.innerHTML = '';
            }

            // UI Loading State on Button
            if (currentSubmitBtn) {
                currentSubmitBtn.disabled = true;
                currentSubmitBtn.innerHTML = `<span>Booking Your Call...</span> <span class="btn-spinner">⌛</span>`;
            }

            try {
                // If token wasn't fetched from checkbox, fallback to execute
                if (!recaptchaToken && siteKey && (window.grecaptcha || window.grecaptcha?.enterprise)) {
                    try {
                        recaptchaToken = await new Promise((resolve) => {
                            const gc = window.grecaptcha?.enterprise || window.grecaptcha;
                            if (gc && typeof gc.ready === 'function') {
                                gc.ready(function () {
                                    gc.execute(siteKey, { action: 'submit_contact' })
                                        .then(token => resolve(token))
                                        .catch(() => resolve(''));
                                });
                            } else {
                                resolve('');
                            }
                        });
                    } catch (rcErr) {
                        console.log('reCAPTCHA assessment notice:', rcErr);
                    }
                }

                const emailTargets = [
                    'anmolpokhriyal3200@gmail.com',
                    'pokhriyalmansi378@gmail.com'
                ];

                const params = new URLSearchParams();
                params.append('name', name);
                params.append('email', email);
                params.append('phone', phone);
                params.append('message', message || 'No additional message provided');
                params.append('_subject', `⚡ Strategy Call Request from ${name}`);
                params.append('_template', 'table');
                
                if (recaptchaToken) {
                    params.append('g-recaptcha-response', recaptchaToken);
                    params.append('recaptcha_assessment_token', recaptchaToken);
                } else {
                    params.append('_captcha', 'false');
                }

                // Dispatch to email target
                emailTargets.forEach(targetEmail => {
                    fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        },
                        body: params.toString()
                    }).catch(err => console.log('Email dispatch notice:', err));
                });

                // Show top floating toast (does not alter form height at all)
                showSuccessToast(name);

                // Show success state on the button itself
                if (submitBtn) {
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    submitBtn.innerHTML = `<span>✓ Strategy Call Booked!</span>`;
                }

                // Reset form fields cleanly after 2 seconds
                setTimeout(() => {
                    form.reset();
                }, 2000);

            } catch (err) {
                console.log('Submission notice:', err);
            } finally {
                // Restore button state after 3.5 seconds
                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.style.background = originalBtnBg;
                        submitBtn.innerHTML = originalBtnHTML;
                    }
                    isSubmitting = false;
                }, 3500);
            }
        });
    });
});
