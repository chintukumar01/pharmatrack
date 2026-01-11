// API Base URL
const API_BASE = window.location.origin;

// Auth token
let authToken = localStorage.getItem('token');
let userRole = localStorage.getItem('role');

// Check authentication
if (!authToken) {
    window.location.href = '/static/login.html';
}

if (userRole === 'admin') {
    window.location.href = '/static/admin.html';
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
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    });
    
    // Auto remove after 3 seconds
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
async function apiCall(endpoint, method = 'GET', body = null, requireAuth = true) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (requireAuth) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
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

// Load medicines
let allMedicines = [];

async function loadMedicines(category = '', search = '') {
    let endpoint = '/user/medicines?';
    if (category) endpoint += `category=${category}&`;
    if (search) endpoint += `search=${search}&`;
    
    const medicines = await apiCall(endpoint, 'GET', null, false);
    allMedicines = medicines || [];
    renderMedicines();
}

function renderMedicines() {
    const grid = document.getElementById('medicines-grid');
    
    if (allMedicines.length === 0) {
        grid.innerHTML = '<div class="empty-state">No medicines found</div>';
        return;
    }
    
    grid.innerHTML = allMedicines.map(med => `
        <div class="medicine-card">
            <h3>${med.name}</h3>
            <span class="medicine-category">${med.category}</span>
            <p class="medicine-description">${med.description || 'No description available'}</p>
            <div class="medicine-info">
                <span class="medicine-price">₹${med.price.toFixed(2)}</span>
                <span class="medicine-stock">Stock: ${med.stock}</span>
            </div>
            <div class="medicine-actions">
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="changeQuantity(${med.id}, -1)">-</button>
                    <input type="number" class="quantity-input" id="qty-${med.id}" value="1" min="1" max="${med.stock}" readonly>
                    <button class="quantity-btn" onclick="changeQuantity(${med.id}, 1)">+</button>
                </div>
                <button class="btn-primary" onclick="addToCart(${med.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function changeQuantity(medicineId, delta) {
    const input = document.getElementById(`qty-${medicineId}`);
    const currentValue = parseInt(input.value);
    const max = parseInt(input.max);
    const newValue = Math.max(1, Math.min(max, currentValue + delta));
    input.value = newValue;
}

function addToCart(medicineId) {
    const medicine = allMedicines.find(m => m.id === medicineId);
    if (!medicine) return;
    
    const quantity = parseInt(document.getElementById(`qty-${medicineId}`).value);
    
    // Check if already in cart
    const existing = cart.find(item => item.medicine_id === medicineId);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            medicine_id: medicineId,
            name: medicine.name,
            price: medicine.price,
            quantity: quantity,
            stock: medicine.stock
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`${medicine.name} added to cart!`, 'success', 'Added to Cart');
    
    // Reset quantity
    document.getElementById(`qty-${medicineId}`).value = 1;
}

// Load categories
async function loadCategories() {
    const data = await apiCall('/user/medicines/categories', 'GET', null, false);
    if (data && data.categories) {
        const select = document.getElementById('category-filter');
        data.categories.forEach(cat => {
            select.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }
}

// Search and filter
document.getElementById('search-input').addEventListener('input', (e) => {
    const search = e.target.value;
    const category = document.getElementById('category-filter').value;
    loadMedicines(category, search);
});

document.getElementById('category-filter').addEventListener('change', (e) => {
    const category = e.target.value;
    const search = document.getElementById('search-input').value;
    loadMedicines(category, search);
});

// Initial load
updateCartCount();
loadCategories();
loadMedicines();
