// Mock Initial Dishes Array
let dishes = [
    { id: 1, name: "Special Seafood Waakye", category: "Rice Specials", price: 120.00, status: "In Stock", image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=100&q=80" },
    { id: 2, name: "Banku & Grilled Tilapia", category: "Local Delicacies", price: 150.00, status: "In Stock", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=100&q=80" },
    { id: 3, name: "Assorted Meat Fufu", category: "Swallow & Soup", price: 110.00, status: "In Stock", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80" },
    { id: 4, name: "Kpala Jollof Rice Deluxe", category: "Rice Specials", price: 95.00, status: "Sold Out", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80" },
    { id: 5, name: "Cold Bissap Juice", category: "Drinks & Beverages", price: 25.00, status: "In Stock", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=100&q=80" }
];

// Tab Navigation Switcher
function switchTab(tabId) {
    const tabs = ['overview', 'menu', 'staff', 'inventory', 'reports'];
    tabs.forEach(t => {
        document.getElementById(`view-${t}`).classList.add('hidden');
        const navBtn = document.getElementById(`nav-${t}`);
        if(navBtn) {
            navBtn.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all";
        }
    });
    document.getElementById(`view-${tabId}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`nav-${tabId}`);
    if(activeBtn) {
        activeBtn.className = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-brandRed text-white shadow-lg shadow-brandRed/20 transition-all";
    }
}

// Render Dishes Table
function renderDishesTable() {
    const tbody = document.getElementById('dishes-table-body');
    tbody.innerHTML = '';
    
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

    document.getElementById('dish-count-badge').innerText = `${dishes.length} Active Dishes`;
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgCol = type === 'success' ? 'bg-neonGreen/10 border-neonGreen/30 text-neonGreen' : 'bg-alertRed/10 border-alertRed/30 text-alertRed';
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl border ${bgCol} shadow-2xl backdrop-blur-md transition-all transform translate-y-2 animate-fade-in`;
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

// Handle Form Submit (Create & Update)
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

    closeDishModal();
    renderDishesTable();
}

// Delete Dish
function deleteDish(id) {
    if (confirm('Are you sure you want to remove this dish from the menu?')) {
        dishes = dishes.filter(d => d.id !== id);
        renderDishesTable();
        showToast('Dish removed from menu.', 'error');
    }
}

// Modal Controls for Report Configuration
function openReportConfigModal() {
    document.getElementById('report-modal').classList.remove('hidden');
}

function closeReportConfigModal() {
    document.getElementById('report-modal').classList.add('hidden');
}

// Generate Customized Two-Page Executive PDF Report
function generateCustomPDFReport() {
    const reportType = document.getElementById('report-type').value;
    const timeframe = document.getElementById('report-timeframe').value;
    const incCharts = document.getElementById('inc-charts').checked;
    const incBreakdown = document.getElementById('inc-breakdown').checked;
    const incTax = document.getElementById('inc-tax').checked;
    const incSignatures = document.getElementById('inc-signatures').checked;

    closeReportConfigModal();
    showToast(`Compiling 2-Page ${reportType.toUpperCase()} Report...`);

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
                    
                    .chart-mock { background: #f8fafc; border: 1px dashed #94a3b8; padding: 30px; text-align: center; border-radius: 6px; margin: 15px 0; color: #475569; font-size: 12px; font-weight: bold; }
                    
                    .sig-section { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; border-top: 1px solid #cbd5e1; }
                    .sig-box { width: 40%; text-align: center; font-size: 11px; color: #475569; }
                    .sig-line { border-bottom: 1px solid #334155; margin-bottom: 8px; height: 35px; }
                    
                    .footer { text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 20px; }
                </style>
            </head>
            <body>

                <!-- ================= PAGE 1 ================= -->
                <div class="page">
                    <div>
                        <div class="header">
                            <h1>PELMA'S CUISINE</h1>
                            <p>Official Executive ${reportType.toUpperCase()} Report • Period: ${timeframe}</p>
                        </div>

                        <div class="meta-box">
                            <span>Document ID: #REP-${Math.floor(Math.random() * 900000 + 100000)}</span>
                            <span>Generated: ${new Date().toLocaleString()}</span>
                            <span>Classification: RESTRICTED / AUDIT</span>
                        </div>

                        <div class="summary-grid">
                            <div class="box">
                                <h3>Total Gross Revenue</h3>
                                <p style="color: #10b981;">GH₵ 14,850.00</p>
                            </div>
                            <div class="box">
                                <h3>Operational Expenses</h3>
                                <p style="color: #ef4444;">GH₵ 5,600.00</p>
                            </div>
                            <div class="box">
                                <h3>Net Profit Margin</h3>
                                <p style="color: #3b82f6;">GH₵ 9,250.00</p>
                            </div>
                        </div>

                        ${incCharts ? `
                            <h2>Visual Analytics & Trend Overview</h2>
                            <div class="chart-mock">
                                [ VISUAL ANALYTICS CHART EMBEDDED ]<br>
                                Peak revenue recorded between 12:00 PM - 16:00 PM with robust customer turnover.
                            </div>
                        ` : ''}

                        ${incBreakdown ? `
                            <h2>Detailed Shift Financial Breakdown</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Time Window</th>
                                        <th>Active Orders</th>
                                        <th>Inflow (GH₵)</th>
                                        <th>Verified By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>08:00 - 10:00</td><td>14 Orders</td><td>GH₵ 2,400.00</td><td>Admin Master</td></tr>
                                    <tr><td>10:00 - 12:00</td><td>28 Orders</td><td>GH₵ 3,400.00</td><td>Admin Master</td></tr>
                                    <tr><td>12:00 - 14:00</td><td>45 Orders</td><td>GH₵ 3,400.00</td><td>Shift Lead A</td></tr>
                                    <tr><td>14:00 - 16:00</td><td>32 Orders</td><td>GH₵ 2,300.00</td><td>Shift Lead A</td></tr>
                                </tbody>
                            </table>
                        ` : ''}
                    </div>

                    <div class="footer">
                        <p>Page 1 of 2 • Pelma's Cuisine Management System • Confidential Enterprise Document</p>
                    </div>
                </div>

                <!-- ================= PAGE 2 ================= -->
                <div class="page">
                    <div>
                        <div class="header">
                            <h1>PELMA'S CUISINE</h1>
                            <p>Supplementary Audit & Compliance Breakdown (Page 2)</p>
                        </div>

                        ${incTax ? `
                            <h2>Statutory Tax & Levy Breakdown</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tax Description</th>
                                        <th>Rate</th>
                                        <th>Taxable Base (GH₵)</th>
                                        <th>Total Deducted (GH₵)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>Value Added Tax (VAT)</td><td>15.0%</td><td>GH₵ 14,850.00</td><td>GH₵ 2,227.50</td></tr>
                                    <tr><td>National Health Insurance Levy (NHIL)</td><td>2.5%</td><td>GH₵ 14,850.00</td><td>GH₵ 371.25</td></tr>
                                    <tr><td>Ghana Education Trust Fund (GetFund)</td><td>2.5%</td><td>GH₵ 14,850.00</td><td>GH₵ 371.25</td></tr>
                                    <tr><td>COVID-19 Health Recovery Levy</td><td>1.0%</td><td>GH₵ 14,850.00</td><td>GH₵ 148.50</td></tr>
                                </tbody>
                            </table>
                        ` : ''}

                        <h2>Inventory & Ingredient Utilization Index</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Raw Material</th>
                                    <th>Beginning Stock</th>
                                    <th>Consumed / Sold</th>
                                    <th>Remaining Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>Local Rice (Bag)</td><td>12 Bags</td><td>4 Bags</td><td>8 Bags (Stable)</td></tr>
                                <tr><td>Tilapia (Kg)</td><td>45 Kg</td><td>38 Kg</td><td>7 Kg (Low Stock)</td></tr>
                                <tr><td>Palm Oil (Gallons)</td><td>10 Gallons</td><td>3 Gallons</td><td>7 Gallons (Good)</td></tr>
                                <tr><td>Plantain (Crates)</td><td>15 Crates</td><td>12 Crates</td><td>3 Crates (Reorder)</td></tr>
                            </tbody>
                        </table>

                        ${incSignatures ? `
                            <div class="sig-section">
                                <div class="sig-box">
                                    <div class="sig-line"></div>
                                    <strong>Chief Financial Officer / Auditor</strong><br>Pelma's Cuisine
                                </div>
                                <div class="sig-box">
                                    <div class="sig-line"></div>
                                    <strong>Managing Director / Owner</strong><br>Pelma's Cuisine
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="footer">
                        <p>Page 2 of 2 • Pelma's Cuisine Management System • Confidential Enterprise Document</p>
                    </div>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }, 600);
}

// Initialize Charts on Load
window.addEventListener('DOMContentLoaded', () => {
    renderDishesTable();

    // Revenue Trend Line Chart
    const ctxRev = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctxRev, {
        type: 'line',
        data: {
            labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            datasets: [
                {
                    label: 'Revenue (GH₵)',
                    data: [1200, 2400, 5800, 9200, 11500, 13400, 14850],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'Expenses (GH₵)',
                    data: [400, 800, 1900, 3100, 4200, 5000, 5600],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
                y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } }
            }
        }
    });

    // Top Selling Dishes Doughnut Chart
    const ctxDish = document.getElementById('dishesChart').getContext('2d');
    new Chart(ctxDish, {
        type: 'doughnut',
        data: {
            labels: ['Waakye', 'Tilapia & Banku', 'Fufu', 'Jollof', 'Drinks'],
            datasets: [{
                data: [40, 25, 20, 10, 5],
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
});

// Mock Notifications Array
let notifications = [
    { id: 1, title: "Low Stock Warning", message: "Fresh Tilapia is down to 7 Kg.", time: "10 mins ago", read: false },
    { id: 2, title: "New Online Order", message: "Order #PC-9842 received via MTN MoMo.", time: "25 mins ago", read: false },
    { id: 3, title: "Shift Log Secured", message: "Morning shift register successfully locked.", time: "1 hour ago", read: true }
];

// Toggle Notification Dropdown
function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    dropdown.classList.toggle('hidden');
    
    // If opening, render the list and remove the red dot indicator
    if (!dropdown.classList.contains('hidden')) {
        renderNotifications();
        document.getElementById('notification-dot').classList.add('hidden');
    }
}

// Render Notifications inside Dropdown
function renderNotifications() {
    const listContainer = document.getElementById('notification-list');
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

// Mark All Notifications as Read
function markAllNotificationsRead() {
    notifications.forEach(n => n.read = true);
    renderNotifications();
    showToast('All notifications marked as read.');
}

// Close dropdown when clicking outside
window.addEventListener('click', (e) => {
    const bell = document.getElementById('notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    if (bell && dropdown && !bell.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});