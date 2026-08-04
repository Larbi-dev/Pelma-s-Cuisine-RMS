// js/checkout.js - Frontend Checkout, Paystack, Cash Handling, and Backend Integration

document.addEventListener("DOMContentLoaded", () => {
    updateTotals(); 
    updateNavCartCount(); 

    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            handleCheckoutPayment();
        });
    }
});

function updateTotals() {
    const cart = JSON.parse(localStorage.getItem("pelma_cart")) || [];
    const fulfillment = document.getElementById("fulfillment")?.value || "delivery";
    const locationGroup = document.getElementById("location-group");

    if (locationGroup) {
        locationGroup.style.display = (fulfillment === "pickup") ? "none" : "block";
    }

    const list = document.getElementById("cart-items-list");
    
    if (cart.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding: 20px 0; color: #64748b;'>Your cart is empty.</p>";
        document.getElementById("summary-subtotal").innerText = "GH₵ 0.00";
        document.getElementById("summary-delivery").innerText = "GH₵ 0.00";
        document.getElementById("summary-total").innerText = "GH₵ 0.00";
        return;
    }

    list.innerHTML = cart.map((item, index) => `
        <div class="summary-item-card">
            <div class="summary-item-info">
                <div class="summary-item-title">${item.name}</div>
                <div class="summary-item-unit-price">GH₵ ${item.price.toFixed(2)} each</div>
            </div>
            
            <div class="summary-item-qty">
                <button type="button" onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity || 1}</span>
                <button type="button" onclick="changeQuantity(${index}, 1)">+</button>
            </div>

            <div class="summary-item-price-action">
                <div class="summary-item-total-price">GH₵ ${(item.price * (item.quantity || 1)).toFixed(2)}</div>
                <button type="button" class="summary-item-remove" onclick="removeItem(${index})">Remove</button>
            </div>
        </div>
    `).join("");

    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const deliveryFee = (fulfillment === "delivery") ? 20.00 : 0.00;
    const total = subtotal + deliveryFee;

    document.getElementById("summary-subtotal").innerText = `GH₵ ${subtotal.toFixed(2)}`;
    document.getElementById("summary-delivery").innerText = `GH₵ ${deliveryFee.toFixed(2)}`;
    document.getElementById("summary-total").innerText = `GH₵ ${total.toFixed(2)}`;
}

function changeQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem("pelma_cart")) || [];
    
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
    }
    
    localStorage.setItem("pelma_cart", JSON.stringify(cart));
    updateTotals();          
    updateNavCartCount();    
}

function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem("pelma_cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("pelma_cart", JSON.stringify(cart));
    updateTotals();          
    updateNavCartCount();    
}

function updateNavCartCount() {
    const cart = JSON.parse(localStorage.getItem("pelma_cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badges = document.querySelectorAll(".cart-badge, #cart-count, .cart-count-badge");
    
    if (badges.length > 0) {
        badges.forEach(badge => {
            badge.textContent = totalCount;
            badge.style.display = totalCount > 0 ? "inline-block" : "none";
        });
    } else {
        setTimeout(updateNavCartCount, 150);
    }
}

function handleCheckoutPayment() {
    const cart = JSON.parse(localStorage.getItem("pelma_cart")) || [];
    if (cart.length === 0) {
        alert("Your cart is empty! Please add items before checking out.");
        return;
    }

    const fullName = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const fulfillment = document.getElementById("fulfillment").value;
    const location = document.getElementById("location").value;
    const paymentMethod = document.getElementById("payment-method-select")?.value || "Paystack (MoMo / Card)";

    const totalText = document.getElementById("summary-total").innerText.replace('GH₵ ', '');
    const totalAmount = parseFloat(totalText);

    const orderData = {
        customer: { fullName, email, phone, fulfillment, location },
        items: cart,
        total: totalAmount,
        payment: paymentMethod
    };

    const reference = 'PELMA_' + Math.floor((Math.random() * 1000000000) + 1);

    // If Cash is selected, bypass Paystack popup and save directly
    if (paymentMethod === "Cash") {
        finalizeAndSaveOrder(reference, orderData);
        return;
    }

    let handler = PaystackPop.setup({
        key: 'pk_test_74cd900629cbba7145b4b05b6945f8b593512185', 
        email: email,
        amount: totalAmount * 100, 
        currency: 'GHS',
        ref: reference,
        callback: function(response) {
            verifyOrderWithBackend(response.reference, orderData);
        },
        onClose: function() {
            alert('Payment window closed. Your transaction was not completed.');
        }
    });

    handler.openIframe();
}

function finalizeAndSaveOrder(reference, orderData) {
    const staffOrder = {
        id: reference,
        customerName: orderData.customer.fullName,
        phone: orderData.customer.phone,
        address: orderData.customer.fulfillment === 'pickup' ? 'Pickup Order' : orderData.customer.location,
        status: 'new', 
        items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity || 1,
            price: item.price
        })),
        deliveryFee: orderData.customer.fulfillment === 'pickup' ? 0 : 20.00,
        total: orderData.total,
        payment: orderData.payment, 
        type: orderData.customer.fulfillment === 'pickup' ? 'Takeout' : 'Delivery',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    let existingLiveOrders = JSON.parse(localStorage.getItem('pelmaLiveOrders')) || [];
    existingLiveOrders.unshift(staffOrder);
    localStorage.setItem('pelmaLiveOrders', JSON.stringify(existingLiveOrders));

    let existingAllOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    existingAllOrders.unshift(staffOrder);
    localStorage.setItem('allOrders', JSON.stringify(existingAllOrders));

    localStorage.removeItem("pelma_cart");
    window.location.href = `order-success.html?ref=${reference}`;
}

async function verifyOrderWithBackend(reference, orderData) {
    try {
        const payload = { reference, order: orderData };
        finalizeAndSaveOrder(reference, orderData);

        await fetch('https://api.yourdomain.com/v1/orders/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error("Network error:", error);
    }
}