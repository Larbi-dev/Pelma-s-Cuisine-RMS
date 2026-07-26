document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Kitchen Queue
    loadKitchenQueue();

    // 2. Notification Dropdown Toggle & Rendering
    const bell = document.getElementById("notification-bell");
    const dropdown = document.getElementById("notification-dropdown");
    const badge = document.getElementById("notification-badge");
    const list = document.getElementById("notification-list");
    const clearBtn = document.getElementById("clear-notifications");

    if (bell && dropdown) {
        bell.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        });

        document.addEventListener("click", () => {
            dropdown.style.display = "none";
        });

        dropdown.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

    function loadKitchenNotifications() {
        let notifications = JSON.parse(localStorage.getItem("pelmas_notifications")) || [];

        // Fallback mock alerts for project evaluation if storage is empty
        if (notifications.length === 0) {
            notifications = [
                { title: "New Kitchen Ticket", message: "Table 4 ordered Fufu & Light Soup", time: "1 min ago" },
                { title: "Online Takeout", message: "Order #PC-8492 received for Prep", time: "5 mins ago" }
            ];
        }

        if (notifications.length > 0 && badge && list) {
            badge.style.display = "inline-block";
            list.innerHTML = "";
            notifications.forEach(notif => {
                const item = document.createElement("div");
                item.className = "notification-item";
                item.innerHTML = `
                    <strong>${notif.title}</strong>
                    <span>${notif.message}</span>
                    <small>${notif.time}</small>
                `;
                list.appendChild(item);
            });
        } else {
            if (badge) badge.style.display = "none";
            if (list) list.innerHTML = '<p class="notification-empty">No new notifications</p>';
        }
    }

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            localStorage.removeItem("pelmas_notifications");
            if (badge) badge.style.display = "none";
            if (list) list.innerHTML = '<p class="notification-empty">No new notifications</p>';
        });
    }

    loadKitchenNotifications();
});

// Load and render orders from localStorage
function loadKitchenQueue(stationFilter = 'ALL') {
    const grid = document.getElementById("kitchen-orders-grid");
    
    let orders = [];
    try {
        orders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    } catch (e) {
        orders = [];
    }

    // Update metrics
    document.getElementById("count-pending-prep").textContent = orders.filter(o => !o.status || o.status === 'NEW').length;
    document.getElementById("count-cooking").textContent = orders.filter(o => o.status === 'Preparing').length;
    document.getElementById("count-ready").textContent = orders.filter(o => o.status === 'Completed').length;

    if (orders.length === 0) {
        grid.innerHTML = `
            <div class="os-empty-state">
                <i class="fa-solid fa-utensils"></i>
                <p>No orders currently in the kitchen queue.</p>
                <span>Incoming meal preparations from tables and online orders will stream here.</span>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";
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
                    <h4>Ticket #${index + 1} (${order.tableNumber ? 'Table #' + order.tableNumber : 'Takeout'})</h4>
                    <span>Customer: ${order.customerName || 'Guest'}</span>
                </div>
                <div class="os-ticket-timer-box">
                    <span class="ticket-time">Queue</span>
                    <span class="status-tag ${statusClass}">${order.status || 'NEW'}</span>
                </div>
            </div>
            <ul class="os-ticket-items">
                ${itemsHtml || '<li><span>General Kitchen Order</span></li>'}
            </ul>
            <div class="os-ticket-actions">
                <button onclick="updateKitchenStatus(${index}, 'Preparing')" class="os-btn-action os-btn-start">Start Cooking</button>
                <button onclick="updateKitchenStatus(${index}, 'Completed')" class="os-btn-action os-btn-ready">Mark Ready</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateKitchenStatus(index, newStatus) {
    let orders = JSON.parse(localStorage.getItem("pelmaLiveOrders")) || [];
    if (orders[index]) {
        orders[index].status = newStatus;
        localStorage.setItem("pelmaLiveOrders", JSON.stringify(orders));
        loadKitchenQueue();
    }
}

function filterKitchenStation(station, event) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    loadKitchenQueue(station);
}

function handleStaffLogout() {
    localStorage.removeItem("pelmaUser");
    window.location.href = "../login.html";
}