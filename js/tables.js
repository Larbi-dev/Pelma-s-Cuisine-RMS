document.addEventListener("DOMContentLoaded", () => {
    loadFloorTables();
});

function loadFloorTables(zoneFilter = 'ALL') {
    const grid = document.getElementById("tables-grid");
    
    // Pull real orders from localStorage
    let liveOrders = [];
    try {
        liveOrders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    } catch (e) {
        liveOrders = [];
    }

    // Show active orders on the floor (maps table number or falls back to index/ID for online orders)
    let tableOrders = liveOrders.map((order, idx) => ({
        ...order,
        tableNumber: order.tableNumber || `Online #${order.id ? order.id.slice(-4) : (idx + 1)}`,
        serverName: order.serverName || 'Larbi'
    }));

    if (zoneFilter !== 'ALL') {
        tableOrders = tableOrders.filter(o => (o.zone || 'Main Hall') === zoneFilter);
    }

    // Update Metrics
    document.getElementById("count-total-tables").textContent = tableOrders.length;
    document.getElementById("count-occupied").textContent = tableOrders.filter(o => o.status !== 'Completed').length;
    document.getElementById("count-available").textContent = tableOrders.length === 0 ? "8" : "0"; 

    if (tableOrders.length === 0) {
        grid.innerHTML = `
            <div class="os-empty-state">
                <i class="fa-solid fa-chair"></i>
                <p>No active table orders on the floor.</p>
                <span>Active customer table reservations and orders will appear here automatically.</span>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";
    tableOrders.forEach((order, index) => {
        let itemsHtml = "";
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                itemsHtml += `<li><span>${item.quantity || 1}x ${item.name}</span> <span>₵${(item.price * (item.quantity || 1)).toFixed(2)}</span></li>`;
            });
        }

        const card = document.createElement("div");
        card.className = "os-ticket-card";
        card.style.borderLeftColor = "#3b82f6";
        
        card.innerHTML = `
            <div class="os-ticket-header">
                <div>
                    <h4>Table #${order.tableNumber}</h4>
                    <span>Server: ${order.serverName}</span>
                </div>
                <div class="os-ticket-timer-box">
                    <span class="status-tag cooking">${order.status || 'ACTIVE'}</span>
                </div>
            </div>
            <ul class="os-ticket-items">
                ${itemsHtml || '<li><span>Custom Table Order</span></li>'}
            </ul>
            <div class="os-ticket-actions">
                <button onclick="clearTableOrder(${index})" class="os-btn-action os-btn-ready">Clear Table</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function clearTableOrder(index) {
    let orders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    if (orders[index]) {
        orders.splice(index, 1);
        localStorage.setItem("pelmaLiveOrders", JSON.stringify(orders));
        loadFloorTables();
    }
}

function filterTableZone(zone, event) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    loadFloorTables(zone);
}

function handleStaffLogout() {
    localStorage.removeItem("pelmaUser");
    window.location.href = "../login.html";
}