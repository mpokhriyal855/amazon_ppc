/* Zepto Profit Calculator Logic */
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("zeptoCalcForm");
    const resultDiv = document.getElementById("zeptoCalcResult");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const sp = parseFloat(document.getElementById("zeptoSp").value) || 0;
            const cogs = parseFloat(document.getElementById("zeptoCogs").value) || 0;
            const zeptoMargin = sp * 0.20; // Estimated 20% quick commerce margin
            const profit = sp - cogs - zeptoMargin;
            
            resultDiv.innerHTML = `Estimated Zepto Vendor Profit: <strong>₹${profit.toFixed(2)}</strong> (Net Margin: ${((profit/sp)*100).toFixed(1)}%)`;
            resultDiv.style.display = "block";
        });
    }
});
