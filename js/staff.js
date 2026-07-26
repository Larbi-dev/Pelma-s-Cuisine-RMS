document.addEventListener("DOMContentLoaded", () => {
    loadLiveOrders();
});

function loadLiveOrders() {
    const ordersGrid = document.getElementById("staff-orders-grid");
    
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    } catch (e) {
        orders = [];
    }

    updateMetrics(orders);

    if (orders.length === 0) {
        ordersGrid.innerHTML = `
            <div class="os-empty-state">
                <i class="fa-solid fa-clipboard-list"></i>
                <p>No active table orders or reservations at the moment.</p>
                <span>New orders from customer tables will stream here automatically.</span>
            </div>
        `;
        return;
    }

    ordersGrid.innerHTML = "";
    orders.forEach((order, index) => {
        let itemsHtml = "";
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                itemsHtml += `<li><span>${item.quantity || 1}x ${item.name}</span> <span>₵${(item.price * (item.quantity || 1)).toFixed(2)}</span></li>`;
            });
        }

        const statusClass = order.status === 'Preparing' ? 'cooking' : (order.status === 'Completed' ? 'cooking' : 'new');

        const card = document.createElement("div");
        card.className = "os-ticket-card";
        card.innerHTML = `
            <div class="os-ticket-header">
                <div>
                    <h4>Table #${order.tableNumber || '01'}</h4>
                    <span>Server: ${order.customerName || 'Customer'}</span>
                </div>
                <div class="os-ticket-timer-box">
                    <span class="ticket-time">Live</span>
                    <span class="status-tag ${statusClass}">${order.status || 'NEW'}</span>
                </div>
            </div>
            <ul class="os-ticket-items">
                ${itemsHtml || '<li><span>Table Reservation Request</span></li>'}
            </ul>
            <div class="os-ticket-actions">
                <button onclick="updateOrderStatus(${index}, 'Preparing')" class="os-btn-action os-btn-start">Start</button>
                <button onclick="updateOrderStatus(${index}, 'Completed')" class="os-btn-action os-btn-ready">Ready</button>
            </div>
        `;
        ordersGrid.appendChild(card);
    });
}

function updateOrderStatus(index, newStatus) {
    let orders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    if (orders[index]) {
        orders[index].status = newStatus;
        localStorage.setItem("pelmaLiveOrders", JSON.stringify(orders));
        loadLiveOrders();
    }
}

function updateMetrics(orders) {
    const activeEl = document.getElementById("count-active");
    if (activeEl) activeEl.textContent = orders.length;
}

function filterStation(station) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function handleStaffLogout() {
    localStorage.removeItem("pelmaUser");
    window.location.href = "../login.html";
}

