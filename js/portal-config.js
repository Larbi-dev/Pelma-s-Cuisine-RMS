// portal-config.js - Automatically applies saved portal settings to any staff page
window.addEventListener('DOMContentLoaded', () => {
    const savedConfig = localStorage.getItem('pelma_terminal_settings');
    if (!savedConfig) return;

    const config = JSON.parse(savedConfig);

    // 1. Update Terminal Name wherever it appears on the page
    const terminalElements = document.querySelectorAll('.active-terminal-name, #current-terminal-label');
    terminalElements.forEach(el => {
        if (config.terminalName) el.innerText = config.terminalName;
    });

    // 2. Apply Currency Symbol across prices/tables if elements exist
    if (config.currencySymbol) {
        const currencyElements = document.querySelectorAll('.currency-symbol-display');
        currencyElements.forEach(el => {
            el.innerText = config.currencySymbol;
        });
    }

    // 3. Make Tax rate available globally for calculations
    window.currentServiceTax = parseFloat(config.serviceTax) || 0.00;

    // 4. Store receipt headers/footers globally for when receipts/takeout print
    window.receiptConfig = {
        header: config.receiptHeader || "Pelma's Cuisine",
        footer: config.receiptFooter || "Thank you for dining with us!"
    };

    // 5. Store hardware / printer preferences
    window.printerConfig = {
        ip: config.printerIp,
        autoPrint: config.autoPrint
    };

    // 6. Store alert configurations
    window.alertConfig = {
        chime: config.alertChime,
        flash: config.alertFlash
    };
});