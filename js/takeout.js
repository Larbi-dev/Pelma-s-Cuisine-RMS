document.addEventListener("DOMContentLoaded", () => {
    loadTakeoutOrders();
});

function loadTakeoutOrders(filterType = 'ALL') {
    const grid = document.getElementById("takeout-orders-grid");
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    } catch (e) {
        orders = [];
    }

    // Filter logic for Takeout/Delivery portal
    let takeoutOrders = orders.filter(o => o.type === 'Takeout' || o.type === 'Delivery' || !o.tableNumber);

    if (filterType !== 'ALL') {
        takeoutOrders = takeoutOrders.filter(o => (o.fulfillmentType || 'Pickup') === filterType);
    }

    document.getElementById("count-pending").textContent = takeoutOrders.length;

    if (takeoutOrders.length === 0) {
        grid.innerHTML = `
            <div class="os-empty-state">
                <i class="fa-solid fa-bag-shopping"></i>
                <p>No active takeout or delivery orders pending.</p>
                <span>Customer online app orders and campus drop-offs will appear here.</span>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";
    takeoutOrders.forEach((order, index) => {
        let itemsHtml = "";
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                itemsHtml += `<li><span>${item.quantity || 1}x ${item.name}</span> <span>₵${(item.price * (item.quantity || 1)).toFixed(2)}</span></li>`;
            });
        }

        const card = document.createElement("div");
        card.className = "os-ticket-card";
        card.innerHTML = `
            <div class="os-ticket-header">
                <div>
                    <h4>${order.fulfillmentType || 'Pickup'} #${index + 1}</h4>
                    <span>Client: ${order.customerName || 'Online Guest'}</span>
                </div>
                <div class="os-ticket-timer-box">
                    <span class="ticket-time">${order.phone || 'No Contact'}</span>
                    <span class="status-tag cooking">${order.status || 'PROCESSING'}</span>
                </div>
            </div>
            <ul class="os-ticket-items">
                ${itemsHtml || '<li><span>Custom Package Order</span></li>'}
            </ul>
            <div class="os-ticket-actions">
                <button onclick="updateTakeoutStatus(${index}, 'Out for Delivery')" class="os-btn-action os-btn-start">Dispatch</button>
                <button onclick="updateTakeoutStatus(${index}, 'Delivered')" class="os-btn-action os-btn-ready">Complete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateTakeoutStatus(index, status) {
    let orders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    if (orders[index]) {
        orders[index].status = status;
        localStorage.setItem("pelmaLiveOrders", JSON.stringify(orders));
        loadTakeoutOrders();
    }
}

function filterTakeoutType(type, event) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    loadTakeoutOrders(type);
}

function handleStaffLogout() {
    localStorage.removeItem("pelmaUser");
    window.location.href = "../login.html";
}