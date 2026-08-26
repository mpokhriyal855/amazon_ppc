/* Meesho Profit Calculator Logic */
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("meeshoCalcForm");
    const resultDiv = document.getElementById("meeshoCalcResult");

    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            const sp = parseFloat(document.getElementById("meeshoSp").value) || 0;
            const cogs = parseFloat(document.getElementById("meeshoCogs").value) || 0;
            const shipping = 45; // Zero commission, estimated shipping deduction
            const profit = sp - cogs - shipping;
            
            resultDiv.innerHTML = `Estimated Meesho Profit: <strong>₹${profit.toFixed(2)}</strong> (Net Margin: ${((profit/sp)*100).toFixed(1)}%)`;
            resultDiv.style.display = "block";
        });
    }
});
