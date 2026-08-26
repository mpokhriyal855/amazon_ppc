/* Swiggy Instamart Profit Calculator Logic */
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("swiggyCalcForm");
    const resultDiv = document.getElementById("swiggyCalcResult");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const sp = parseFloat(document.getElementById("swiggySp").value) || 0;
            const cogs = parseFloat(document.getElementById("swiggyCogs").value) || 0;
            const margin = sp * 0.22; // Estimated 22% quick commerce margin
            const profit = sp - cogs - margin;
            
            resultDiv.innerHTML = `Estimated Swiggy Instamart Profit: <strong>₹${profit.toFixed(2)}</strong> (Net Margin: ${((profit/sp)*100).toFixed(1)}%)`;
            resultDiv.style.display = "block";
        });
    }
});
