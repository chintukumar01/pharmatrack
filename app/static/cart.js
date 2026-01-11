// API Base URL
const API_BASE = window.location.origin;

// Auth token
let authToken = localStorage.getItem('token');

// Check authentication
if (!authToken) {
    window.location.href = '/static/login.html';
}

// Cart management
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ============== TOAST NOTIFICATION SYSTEM ==============
function createToastContainer() {
    if (!document.querySelector('.toast-container')) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info', title = '') {
    createToastContainer();
    
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const titles = {
        success: title || 'Success',
        error: title || 'Error',
        warning: title || 'Warning',
        info: title || 'Info'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">×</div>
    `;
    
    container.appendChild(toast);
    
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideInRight 0.3s reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, 3000);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

// Logout
document.getElementById('logout-link').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/static/login.html';
});

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/static/login.html';
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showToast(error.message, 'error');
        return null;
    }
}

// Render cart
function renderCart() {
    const container = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-state">Your cart is empty</div>';
        updateSummary();
        return;
    }
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p class="cart-item-price">₹${item.price.toFixed(2)} × ${item.quantity}</p>
            </div>
            <div class="medicine-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" readonly>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="btn-danger" onclick="removeFromCart(${index})">Remove</button>
            </div>
        </div>
    `).join('');
    
    updateSummary();
}

function updateQuantity(index, delta) {
    const item = cart[index];
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) {
        removeFromCart(index);
        return;
    }
    
    if (newQuantity > item.stock) {
        showToast(`Only ${item.stock} units available`, 'warning', 'Stock Limit');
        return;
    }
    
    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 50;
    const total = subtotal + delivery;
    
    document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
}

// Checkout modal
const checkoutModal = document.getElementById('checkout-modal');
const closeModal = document.querySelector('.close');
const cancelCheckout = document.getElementById('cancel-checkout');

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning', 'Empty Cart');
        return;
    }
    checkoutModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

cancelCheckout.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

// Checkout form
document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const address = document.getElementById('shipping-address').value;
    const paymentMode = document.getElementById('payment-mode').value;
    
    const orderData = {
        items: cart.map(item => ({
            medicine_id: item.medicine_id,
            quantity: item.quantity
        })),
        shipping_address: address,
        payment_mode: paymentMode
    };
    
    // Create order
    const order = await apiCall('/user/orders', 'POST', orderData);
    
    if (!order) return;
    
    // Process payment if UPI
    if (paymentMode === 'UPI') {
        const paymentResult = await apiCall(`/user/orders/${order.id}/payment`, 'POST', { payment_mode: 'UPI' });
        
        if (paymentResult) {
            if (paymentResult.success) {
                showToast('Order placed successfully! Payment completed.', 'success', 'Order Confirmed');
            } else {
                showToast('Order placed but payment failed. You can retry payment from My Orders.', 'warning', 'Payment Failed');
            }
        }
    } else {
        showToast('Order placed successfully! You can pay on delivery.', 'success', 'Order Confirmed');
    }
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Close modal and redirect
    checkoutModal.classList.remove('active');
    window.location.href = '/static/orders.html';
});

// Initial load
updateCartCount();
renderCart();
