/* =========================================================
   WHATSAPP FLOATING CHAT WIDGET SCRIPT
   File: js/whatsapp.js
========================================================= */

document.addEventListener('DOMContentLoaded', function () {

    const triggerBtn = document.getElementById('whatsappTriggerBtn');

    const chatBox = document.getElementById('whatsappChatBox');

    const closeBtn = document.getElementById('whatsappCloseBtn');

    const form = document.getElementById('whatsappForm');


    const targetNumber = '918433232647'; // Number: 8433232647 with India country code 91


    if (!triggerBtn || !chatBox) return;


    // TOGGLE CHAT BOX

    function toggleChatBox(show) {

        const isActive = show !== undefined ? show : !chatBox.classList.contains('active');


        if (isActive) {

            chatBox.classList.add('active');

            chatBox.setAttribute('aria-hidden', 'false');

            triggerBtn.setAttribute('aria-expanded', 'true');

            // Focus on first input if available

            const firstInput = chatBox.querySelector('input');

            if (firstInput) setTimeout(() => firstInput.focus(), 150);

        } else {

            chatBox.classList.remove('active');

            chatBox.setAttribute('aria-hidden', 'true');

            triggerBtn.setAttribute('aria-expanded', 'false');

        }

    }


    triggerBtn.addEventListener('click', function (e) {

        e.stopPropagation();

        toggleChatBox();

    });


    if (closeBtn) {

        closeBtn.addEventListener('click', function (e) {

            e.stopPropagation();

            toggleChatBox(false);

        });

    }


    // CLOSE WHEN CLICKING OUTSIDE

    document.addEventListener('click', function (e) {

        if (chatBox.classList.contains('active') && !chatBox.contains(e.target) && !triggerBtn.contains(e.target)) {

            toggleChatBox(false);

        }

    });


    // PREVENT CLOSING WHEN CLICKING INSIDE POPUP

    chatBox.addEventListener('click', function (e) {

        e.stopPropagation();

    });


    // FORM SUBMISSION TO WHATSAPP

    if (form) {

        form.addEventListener('submit', function (e) {

            e.preventDefault();


            const nameInput = document.getElementById('waName');

            const mobileInput = document.getElementById('waMobile');

            const emailInput = document.getElementById('waEmail');


            const name = nameInput ? nameInput.value.trim() : '';

            const mobile = mobileInput ? mobileInput.value.trim() : '';

            const email = emailInput ? emailInput.value.trim() : '';


            let messageText = 'Hi Amazon Ads Expert! 👋\nI am reaching out from your website regarding Amazon PPC Growth.';


            if (name || mobile || email) {

                messageText += '\n\n*My Details:*';

                if (name) messageText += `\n• Name: ${name}`;

                if (mobile) messageText += `\n• Mobile: ${mobile}`;

                if (email) messageText += `\n• Email: ${email}`;

            }


            const encodedMessage = encodeURIComponent(messageText);

            const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;


            // Open WhatsApp in a new tab

            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');


            // Reset form & close chat box

            form.reset();

            toggleChatBox(false);

        });

    }

});
