/* Blinkit Profit Calculator Logic */
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("blinkitCalcForm");
    const resultDiv = document.getElementById("blinkitCalcResult");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const sp = parseFloat(document.getElementById("blinkitSp").value) || 0;
            const cogs = parseFloat(document.getElementById("blinkitCogs").value) || 0;
            const margin = sp * 0.22; // Estimated 22% quick-commerce margin
            const profit = sp - cogs - margin;
            
            resultDiv.innerHTML = `Estimated Vendor Profit: <strong>₹${profit.toFixed(2)}</strong> (Net Margin: ${((profit/sp)*100).toFixed(1)}%)`;
            resultDiv.style.display = "block";
        });
    }
});
