// Check if an order ID was passed via URL parameters (e.g. from checkout redirect)
const urlParams = new URLSearchParams(window.location.search);
const orderParam = urlParams.get('ref') || urlParams.get('id');

if (orderParam) {
    const orderInput = document.getElementById('orderCodeInput');
    if (orderInput) {
        orderInput.value = orderParam;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const orderInput = document.getElementById('orderCodeInput');
    const resultCard = document.getElementById('resultCard');
    const errorMsg = document.getElementById('errorMsg');
    
    // Only set the default value if no URL parameter was passed
    if (!orderParam && orderInput) {
        orderInput.value = "PELMA-84920";
    }

    let map = null;
    let riderMarker = null;
    let routeIndex = 0;
    let animationInterval = null;

    // Detailed street turning coordinates simulating a live ride in Kumasi
    const routeCoordinates = [
        [6.6885, -1.6244], // Restaurant / Kitchen Origin
        [6.6902, -1.6220], // Turn 1: Junction
        [6.6920, -1.6195], // Turn 2: Avenue Curve
        [6.6938, -1.6170], // Turn 3: Main Street Intersection
        [6.6955, -1.6142], // Turn 4: Final Approach Street
        [6.6972, -1.6115]  // Customer Destination
    ];

    searchBtn.addEventListener('click', handleSearch);
    orderInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    function handleSearch() {
        const query = orderInput.value.trim().toUpperCase();

        if (query === "" || query.includes("PELMA") || query === "PELMA-84920" || query.startsWith("PELMA_")) {
            errorMsg.style.display = "none";
            resultCard.classList.remove('active-reveal');
            void resultCard.offsetWidth; // Force CSS reflow for animation restart
            resultCard.classList.add('active-reveal');
            
            document.getElementById('displayOrderId').textContent = query || "PELMA-84920";

            // FETCH REAL STATUS FROM LOCALSTORAGE IF IT EXISTS
            const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
            const currentOrder = allOrders.find(o => o.id === query);
            
            // Default status if searched manually or default demo
            let orderStatus = currentOrder ? currentOrder.status : 'out_for_delivery'; 

            // Update Timeline steps dynamically based on actual status
            updateTimelineSteps(orderStatus);

            setTimeout(() => {
                initMap();
                if (map) {
                    map.invalidateSize(); // Fixes container sizing and tile rendering gaps instantly
                }
            }, 300);
        } else {
            resultCard.classList.remove('active-reveal');
            errorMsg.style.display = "block";
        }
    }

    function updateTimelineSteps(status) {
        const steps = document.querySelectorAll('.timeline-step');
        if (!steps.length) return;

        steps.forEach(step => step.classList.remove('active', 'completed'));

        // Map statuses ("confirmed", "preparing", "out_for_delivery", "delivered")
        steps[0].classList.add('completed'); // Order Placed is always complete if found
        
        if (status === 'preparing' || status === 'out_for_delivery' || status === 'delivered') {
            steps[1].classList.add('completed'); 
        } else {
            steps[1].classList.add('active');
        }

        if (status === 'out_for_delivery' || status === 'delivered') {
            if (steps[2]) steps[2].classList.add('active');
        }
    }

    function initMap() {
        if (!map) {
            map = L.map('liveMap').setView([6.6928, -1.6180], 14);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Kitchen Marker
            const kitchenIcon = L.divIcon({
                className: 'custom-pin',
                html: '<div style="background:#c80707;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;box-shadow:0 4px 12px rgba(200,7,7,0.4);font-size:15px;">🍳</div>',
                iconSize: [32, 32]
            });
            L.marker(routeCoordinates[0], {icon: kitchenIcon}).addTo(map).bindPopup("<b>Pelma's Cuisine Kitchen</b><br>Order dispatched.");

            // Customer Destination Marker
            const customerIcon = L.divIcon({
                className: 'custom-pin',
                html: '<div style="background:#10b981;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;box-shadow:0 4px 12px rgba(16,185,129,0.4);font-size:15px;">🏠</div>',
                iconSize: [32, 32]
            });
            L.marker(routeCoordinates[routeCoordinates.length - 1], {icon: customerIcon}).addTo(map).bindPopup("<b>Delivery Destination</b><br>Your Address.");

            // Route Polyline showing turns
            L.polyline(routeCoordinates, {
                color: '#c80707',
                weight: 6,
                opacity: 0.85,
                dashArray: '8, 10'
            }).addTo(map);

            // Animated Rider Marker with pulse ring
            const riderIcon = L.divIcon({
                className: 'rider-pin',
                html: '<div style="background:#1a1a1a;border:3px solid #c80707;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(200,7,7,0.6);font-size:18px;animation:activePinPulse 1.5s infinite;">🛵</div>',
                iconSize: [38, 38]
            });

            riderMarker = L.marker(routeCoordinates[0], {icon: riderIcon}).addTo(map).bindPopup("<b>Rider: Kwame</b><br>En route with your order!");

            startRiderSimulation();
        } else {
            map.invalidateSize();
        }
    }

    function startRiderSimulation() {
        if (animationInterval) clearInterval(animationInterval);
        routeIndex = 0;

        animationInterval = setInterval(() => {
            routeIndex++;
            if (routeIndex >= routeCoordinates.length) {
                routeIndex = 0; // Loops smoothly for continuous defense presentation
            }
            const nextCoord = routeCoordinates[routeIndex];
            if (riderMarker) {
                riderMarker.setLatLng(nextCoord);
                map.panTo(nextCoord, {animate: true, duration: 1.2});
            }
        }, 3200);
    }

    // Auto-trigger on page load
    setTimeout(() => {
        handleSearch();
    }, 200);
});