// JavaScript Logic
// Synchronized Initial State from localStorage keys
let dishes = JSON.parse(localStorage.getItem('menuDishes')) || [
    { id: 1, name: "Special Seafood Waakye", category: "Rice Specials", price: 120.00, status: "In Stock", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=100&q=80" },
    { id: 2, name: "Banku & Grilled Tilapia", category: "Local Delicacies", price: 150.00, status: "In Stock", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=100&q=80" },
    { id: 3, name: "Assorted Meat Fufu", category: "Swallow & Soup", price: 110.00, status: "In Stock", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80" },
    { id: 4, name: "Kpala Jollof Rice Deluxe", category: "Rice Specials", price: 95.00, status: "Sold Out", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80" },
    { id: 5, name: "Cold Bissap Juice", category: "Drinks & Beverages", price: 25.00, status: "In Stock", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=100&q=80" }
];

let liveOrders = JSON.parse(localStorage.getItem('pelmaLiveOrders')) || 
                 JSON.parse(localStorage.getItem('allorders')) || 
                 JSON.parse(localStorage.getItem('staffShiftOrders')) || 
                 JSON.parse(localStorage.getItem('shiftOrders')) || [];

let notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [
    { id: 1, title: "Low Stock Warning", message: "Fresh Tilapia is down to 7 Kg.", time: "10 mins ago", read: false },
    { id: 2, title: "New Online Order", message: "Order #PC-9842 received via MTN MoMo.", time: "25 mins ago", read: false },
    { id: 3, title: "Shift Log Secured", message: "Morning shift register successfully locked.", time: "1 hour ago", read: true }
];

// Enforce Authentication Check on Page Load & Prevent Back Button Cache
if (!localStorage.getItem('adminSessionToken')) {
    window.location.replace('../login.html');
}

// Persist State helper
function persistState() {
    localStorage.setItem('menuDishes', JSON.stringify(dishes));
    localStorage.setItem('pelmaLiveOrders', JSON.stringify(liveOrders));
}

// Chart Global References for Dynamic Updates
let revenueChartInstance = null;
let dishesChartInstance = null;

// Tab Navigation Switcher
function switchTab(tabId) {
    const tabs = ['overview', 'menu', 'staff', 'inventory', 'reports'];
    tabs.forEach(t => {
        const viewEl = document.getElementById(`view-${t}`);
        const navBtn = document.getElementById(`nav-${t}`);
        if (viewEl) viewEl.classList.add('hidden');
        if (navBtn) {
            navBtn.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all w-full text-left";
        }
    });
    
    const targetView = document.getElementById(`view-${tabId}`);
    const targetNav = document.getElementById(`nav-${tabId}`);
    if (targetView) targetView.classList.remove('hidden');
    if (targetNav) {
        targetNav.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-brandRed text-white shadow-lg shadow-brandRed/20 transition-all w-full text-left";
    }

    if (tabId === 'overview') {
        updateDashboardMetrics();
    }
}

// Update Metrics & Render Real Data
function updateDashboardMetrics() {
    const totalRevenue = liveOrders.reduce((sum, order) => sum + parseFloat(order.total || order.amount || 0), 0);
    const revenueEl = document.getElementById('metric-revenue');
    if (revenueEl) revenueEl.innerText = `GH₵ ${totalRevenue.toFixed(2)}`;

    const activeOrdersEl = document.getElementById('metric-orders');
    if (activeOrdersEl) activeOrdersEl.innerText = liveOrders.length;

    const uniqueCustomers = new Set(liveOrders.map(o => o.customer || o.customerName || 'Walk-in')).size;
    const customersEl = document.getElementById('metric-customers');
    if (customersEl) customersEl.innerText = uniqueCustomers;

    const tbody = document.getElementById('live-orders-body');
    if (tbody) {
        tbody.innerHTML = '';
        if (liveOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500 text-xs">No live orders recorded yet from checkout terminal.</td></tr>`;
        } else {
            liveOrders.forEach(order => {
                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-800/30 transition-colors";
                tr.innerHTML = `
                    <td class="py-3 px-4 font-bold text-white">#${order.id || 'PC-' + Math.floor(1000 + Math.random() * 9000)}</td>
                    <td class="py-3 px-4 text-slate-300">${order.customer || order.customerName || 'Walk-in Customer'}</td>
                    <td class="py-3 px-4 text-slate-400">${order.items || order.dishSummary || 'Standard Meal Package'}</td>
                    <td class="py-3 px-4 font-bold text-white">GH₵ ${parseFloat(order.total || order.amount || 0).toFixed(2)}</td>
                    <td class="py-3 px-4 text-right">
                        <span class="px-2.5 py-1 bg-neonGreen/10 text-neonGreen border border-neonGreen/20 text-[10px] font-bold rounded-full">${order.status || 'Completed'}</span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    renderDynamicCharts();
}

// Render Dishes Table
function renderDishesTable() {
    const tbody = document.getElementById('dishes-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (dishes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-500 text-xs">No active dishes added to menu.</td></tr>`;
        const badge = document.getElementById('dish-count-badge');
        if (badge) badge.innerText = `0 Active Dishes`;
        return;
    }

    dishes.forEach(dish => {
        const statusBadge = dish.status === 'In Stock' 
            ? '<span class="px-2.5 py-1 bg-neonGreen/10 border border-neonGreen/20 text-neonGreen text-xs font-semibold rounded-full flex items-center gap-1.5 w-max"><span class="h-1.5 w-1.5 rounded-full bg-neonGreen"></span> In Stock</span>'
            : '<span class="px-2.5 py-1 bg-alertRed/10 border border-alertRed/20 text-alertRed text-xs font-semibold rounded-full flex items-center gap-1.5 w-max"><span class="h-1.5 w-1.5 rounded-full bg-alertRed"></span> Sold Out</span>';

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/30 transition-colors";
        tr.innerHTML = `
            <td class="py-4 px-6 flex items-center gap-3">
                <img src="${dish.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}" alt="" class="h-10 w-10 rounded-xl object-cover border border-borderCol">
                <div>
                    <div class="font-bold text-white">${dish.name}</div>
                    <div class="text-xs text-slate-400">ID: #PC-${dish.id}</div>
                </div>
            </td>
            <td class="py-4 px-6 text-slate-300 font-medium">${dish.category}</td>
            <td class="py-4 px-6 font-bold text-white">GH₵ ${parseFloat(dish.price).toFixed(2)}</td>
            <td class="py-4 px-6">${statusBadge}</td>
            <td class="py-4 px-6 text-right space-x-2">
                <button onclick="openEditDishModal(${dish.id})" class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all" title="Edit">
                    <i class="fa-solid fa-pen text-xs"></i>
                </button>
                <button onclick="deleteDish(${dish.id})" class="p-2 bg-alertRed/10 hover:bg-alertRed/20 text-alertRed rounded-lg transition-all" title="Delete">
                    <i class="fa-solid fa-trash text-xs"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const badge = document.getElementById('dish-count-badge');
    if (badge) badge.innerText = `${dishes.length} Active Dishes`;
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const bgCol = type === 'success' ? 'bg-neonGreen/10 border-neonGreen/30 text-neonGreen' : 'bg-alertRed/10 border-alertRed/30 text-alertRed';
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border ${bgCol} shadow-2xl backdrop-blur-md transition-all transform translate-y-2`;
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span class="text-xs font-bold text-white">${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Modal Controls for Dishes
function openAddDishModal() {
    document.getElementById('modal-title').innerText = 'Add New Dish';
    document.getElementById('dish-id').value = '';
    document.getElementById('dish-form').reset();
    document.getElementById('dish-modal').classList.remove('hidden');
}

function openEditDishModal(id) {
    const dish = dishes.find(d => d.id === id);
    if (!dish) return;
    document.getElementById('modal-title').innerText = 'Edit Dish Details';
    document.getElementById('dish-id').value = dish.id;
    document.getElementById('dish-name').value = dish.name;
    document.getElementById('dish-category').value = dish.category;
    document.getElementById('dish-price').value = dish.price;
    document.getElementById('dish-status').value = dish.status;
    document.getElementById('dish-image').value = dish.image;
    document.getElementById('dish-modal').classList.remove('hidden');
}

function closeDishModal() {
    document.getElementById('dish-modal').classList.add('hidden');
}

function handleDishSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('dish-id').value;
    const name = document.getElementById('dish-name').value;
    const category = document.getElementById('dish-category').value;
    const price = parseFloat(document.getElementById('dish-price').value);
    const status = document.getElementById('dish-status').value;
    const image = document.getElementById('dish-image').value;

    if (id) {
        const index = dishes.findIndex(d => d.id == id);
        if (index !== -1) {
            dishes[index] = { id: parseInt(id), name, category, price, status, image };
            showToast('Dish updated successfully!');
        }
    } else {
        const newDish = { id: Date.now(), name, category, price, status, image };
        dishes.unshift(newDish);
        showToast('New dish successfully added to live menu!');
    }

    persistState();
    closeDishModal();
    renderDishesTable();
    updateDashboardMetrics();
}

function deleteDish(id) {
    if (confirm('Are you sure you want to remove this dish from the menu?')) {
        dishes = dishes.filter(d => d.id !== id);
        persistState();
        renderDishesTable();
        updateDashboardMetrics();
        showToast('Dish removed from menu.', 'error');
    }
}

function openReportConfigModal() {
    document.getElementById('report-modal').classList.remove('hidden');
}

function closeReportConfigModal() {
    document.getElementById('report-modal').classList.add('hidden');
}

function generateCustomPDFReport() {
    const reportType = document.getElementById('report-type').value;
    closeReportConfigModal();
    showToast(`Compiling Executive Audit Report from Local Storage...`);

    const totalRev = liveOrders.reduce((sum, o) => sum + parseFloat(o.total || o.amount || 0), 0);
    const totalExp = totalRev * 0.45;
    const netProfit = totalRev - totalExp;

    setTimeout(() => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Pelma's Cuisine - Executive Audit Report</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 30px; color: #111; line-height: 1.5; }
                    .page { page-break-after: always; min-height: 95vh; display: flex; flex-direction: column; justify-content: space-between; }
                    .header { text-align: center; border-bottom: 3px solid #c80707; padding-bottom: 15px; margin-bottom: 25px; }
                    .header h1 { color: #c80707; margin: 0; font-size: 26px; letter-spacing: 1px; }
                    .header p { color: #555; font-size: 11px; margin: 4px 0 0; text-transform: uppercase; font-weight: 600; }
                    .meta-box { background: #f1f5f9; padding: 12px 18px; border-radius: 6px; display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 20px; font-weight: bold; color: #333; }
                    .summary-grid { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 25px; }
                    .box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; text-align: center; }
                    .box h3 { margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase; }
                    .box p { margin: 6px 0 0; font-size: 18px; font-weight: 800; color: #0f172a; }
                    h2 { font-size: 15px; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-top: 25px; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 11px; }
                    th { background-color: #f8fafc; color: #334155; font-weight: 700; }
                    .footer { text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="page">
                    <div>
                        <div class="header">
                            <h1>PELMA'S CUISINE</h1>
                            <p>Official Executive ${reportType.toUpperCase()} Report • Live Storage Data Audit</p>
                        </div>
                        <div class="meta-box">
                            <span>Document ID: #REP-${Math.floor(Math.random() * 900000 + 100000)}</span>
                            <span>Generated: ${new Date().toLocaleString()}</span>
                            <span>Total Synchronized Orders: ${liveOrders.length}</span>
                        </div>
                        <div class="summary-grid">
                            <div class="box">
                                <h3>Total Gross Revenue</h3>
                                <p style="color: #10b981;">GH₵ ${totalRev.toFixed(2)}</p>
                            </div>
                            <div class="box">
                                <h3>Operational Expenses</h3>
                                <p style="color: #ef4444;">GH₵ ${totalExp.toFixed(2)}</p>
                            </div>
                            <div class="box">
                                <h3>Net Profit Margin</h3>
                                <p style="color: #3b82f6;">GH₵ ${netProfit.toFixed(2)}</p>
                            </div>
                        </div>
                        <h2>Live Transactions Breakdown</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items Summary</th>
                                    <th>Amount (GH₵)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${liveOrders.length > 0 ? liveOrders.map(o => `
                                    <tr>
                                        <td>#${o.id || 'N/A'}</td>
                                        <td>${o.customer || o.customerName || 'Walk-in'}</td>
                                        <td>${o.items || o.dishSummary || 'Custom Meal'}</td>
                                        <td>GH₵ ${parseFloat(o.total || o.amount || 0).toFixed(2)}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4" style="text-align: center;">No orders recorded in live storage.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                    <div class="footer">
                        <p>Pelma's Cuisine Management System • Secure Automated Financial Audit</p>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }, 600);
}

function renderDynamicCharts() {
    const ctxRev = document.getElementById('revenueChart');
    if (ctxRev) {
        if (revenueChartInstance) revenueChartInstance.destroy();

        const revenuePoints = liveOrders.length > 0 ? liveOrders.map(o => parseFloat(o.total || o.amount || 0)) : [0, 0, 0, 0];
        const labels = liveOrders.length > 0 ? liveOrders.map((_, i) => `Order #${i+1}`) : ['08:00', '12:00', '16:00', '20:00'];
        const runningTotals = [];
        let sum = 0;
        revenuePoints.forEach(val => { sum += val; runningTotals.push(sum); });

        revenueChartInstance = new Chart(ctxRev.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cumulative Revenue (GH₵)',
                    data: runningTotals.length ? runningTotals : [0, 0, 0, 0],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, labels: { color: '#94a3b8' } } },
                scales: {
                    x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
                    y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } }
                }
            }
        });
    }

    const ctxDish = document.getElementById('dishesChart');
    if (ctxDish) {
        if (dishesChartInstance) dishesChartInstance.destroy();

        const categoryCounts = {};
        dishes.forEach(d => {
            categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
        });

        const catLabels = Object.keys(categoryCounts).length ? Object.keys(categoryCounts) : ['Rice Specials', 'Local Delicacies'];
        const catData = Object.keys(categoryCounts).length ? Object.values(categoryCounts) : [1, 1];

        dishesChartInstance = new Chart(ctxDish.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catData,
                    backgroundColor: ['#c80707', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } }
                }
            }
        });
    }
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;
    dropdown.classList.toggle('hidden');
    
    if (!dropdown.classList.contains('hidden')) {
        renderNotifications();
        const dot = document.getElementById('notification-dot');
        if (dot) dot.classList.add('hidden');
    }
}

function renderNotifications() {
    const listContainer = document.getElementById('notification-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (notifications.length === 0) {
        listContainer.innerHTML = `<div class="p-6 text-center text-slate-400">No new notifications</div>`;
        return;
    }

    notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = `p-3.5 hover:bg-slate-800/40 transition-colors flex gap-3 cursor-pointer ${notif.read ? 'opacity-60' : 'bg-slate-900/20'}`;
        item.innerHTML = `
            <div class="h-2 w-2 rounded-full ${notif.read ? 'bg-transparent' : 'bg-brandRed'} mt-1.5 shrink-0"></div>
            <div class="flex-1">
                <div class="flex justify-between items-center mb-0.5">
                    <h5 class="font-bold text-white text-xs">${notif.title}</h5>
                    <span class="text-[10px] text-slate-500">${notif.time}</span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">${notif.message}</p>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
    showToast('All notifications marked as read.');
}

function triggerLogout() {
    const modal = document.getElementById('logout-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeLogoutModal() {
    const modal = document.getElementById('logout-modal');
    if (modal) modal.classList.add('hidden');
}

function executeLogout() {
    localStorage.removeItem('adminSessionToken');
    sessionStorage.clear();
    showToast('Session terminated. Redirecting...');
    setTimeout(() => {
        window.location.replace('../login.html');
    }, 500);
}

window.addEventListener('click', (e) => {
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (bell && dropdown && !bell.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    renderDishesTable();
    updateDashboardMetrics();

    window.addEventListener('storage', (event) => {
        if (['pelmaLiveOrders', 'allorders', 'staffShiftOrders', 'shiftOrders', 'menuDishes'].includes(event.key)) {
            if (event.key === 'menuDishes') {
                dishes = JSON.parse(event.newValue) || [];
                renderDishesTable();
            } else {
                liveOrders = JSON.parse(event.newValue) || [];
            }
            updateDashboardMetrics();
            showToast('Dashboard synchronized with live terminal data.');
        }
    });
});