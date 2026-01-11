// API Base URL
const API_BASE = window.location.origin;

// Auth token
let authToken = localStorage.getItem('token');

// Check authentication
if (!authToken) {
    window.location.href = '/static/login.html';
}

// Cart count
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

// ============== TOAST NOTIFICATION SYSTEM ==============
function createToastContainer() { if (!document.querySelector('.toast-container')) { const container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); } }
function showToast(message, type = 'info', title = '') { createToastContainer(); const container = document.querySelector('.toast-container'); const toast = document.createElement('div'); toast.className = `toast ${type}`; const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }; const titles = { success: title || 'Success', error: title || 'Error', warning: title || 'Warning', info: title || 'Info' }; toast.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-content"><div class="toast-title">${titles[type]}</div><div class="toast-message">${message}</div></div><div class="toast-close">×</div>`; container.appendChild(toast); toast.querySelector('.toast-close').addEventListener('click', () => { toast.style.animation = 'slideInRight 0.3s reverse'; setTimeout(() => toast.remove(), 300); }); setTimeout(() => { if (toast.parentElement) { toast.style.animation = 'slideInRight 0.3s reverse'; setTimeout(() => toast.remove(), 300); } }, 3000); }

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

// Load orders
async function loadOrders() {
    const orders = await apiCall('/user/orders');
    const container = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="empty-state">No orders yet</div>';
        return;
    }
    
    container.innerHTML = orders.map(order => {
        const date = new Date(order.created_at).toLocaleString();
        const statusClass = order.status.toLowerCase();
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-number">${order.order_number}</div>
                        <div class="order-date">${date}</div>
                    </div>
                    <div>
                        <span class="order-status ${statusClass}">${order.status}</span>
                    </div>
                </div>
                
                <div class="order-items">
                    <h4>Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.medicine_name} × ${item.quantity}</span>
                            <span>₹${item.subtotal.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-footer">
                    <div>
                        <div><strong>Payment:</strong> ${order.payment_mode} (${order.payment_status})</div>
                        <div><strong>Address:</strong> ${order.shipping_address}</div>
                    </div>
                    <div class="order-total">₹${order.total_amount.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Initial load
updateCartCount();
loadOrders();
