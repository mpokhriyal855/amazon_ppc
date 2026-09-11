/* Flipkart Profit Calculator Logic */
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("flipkartCalcForm");
    const resultDiv = document.getElementById("flipkartCalcResult");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const sp = parseFloat(document.getElementById("flipkartSp").value) || 0;
            const cogs = parseFloat(document.getElementById("flipkartCogs").value) || 0;
            const fee = sp * 0.15; // Estimated 15% marketplace fee
            const profit = sp - cogs - fee;
            
            resultDiv.innerHTML = `Estimated Profit: <strong>₹${profit.toFixed(2)}</strong> (Net Margin: ${((profit/sp)*100).toFixed(1)}%)`;
            resultDiv.style.display = "block";
        });
    }
});
