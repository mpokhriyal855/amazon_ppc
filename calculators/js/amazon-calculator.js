/* Amazon Profit Calculator Logic */
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("amazonCalcForm");
    const resultDiv = document.getElementById("amazonCalcResult");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const sp = parseFloat(document.getElementById("amazonSp").value) || 0;
            const cogs = parseFloat(document.getElementById("amazonCogs").value) || 0;
            const referralFee = sp * 0.15; // Estimated 15% referral fee
            const fbaFee = 60; // Estimated FBA pick/pack & weight handling
            const profit = sp - cogs - referralFee - fbaFee;
            
            resultDiv.innerHTML = `Estimated Amazon Net Profit: <strong>₹${profit.toFixed(2)}</strong> (Net Margin: ${((profit/sp)*100).toFixed(1)}%)`;
            resultDiv.style.display = "block";
        });
    }
});
