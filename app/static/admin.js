// API Base URL
const API_BASE = window.location.origin;

// Auth token
let authToken = localStorage.getItem('token');
let userRole = localStorage.getItem('role');

// Check authentication
if (!authToken || userRole !== 'admin') {
    window.location.href = '/static/login.html';
}

// Set admin email
const adminEmail = localStorage.getItem('email');
document.getElementById('admin-email').textContent = adminEmail;

// Global state
let billItems = [];
let allMedicines = [];
let showingLowStock = false;

// ============== TOAST NOTIFICATION SYSTEM ==============
function createToastContainer() { if (!document.querySelector('.toast-container')) { const container = document.createElement('div'); container.className = 'toast-container'; document.body.appendChild(container); } }
function showToast(message, type = 'info', title = '') { createToastContainer(); const container = document.querySelector('.toast-container'); const toast = document.createElement('div'); toast.className = `toast ${type}`; const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }; const titles = { success: title || 'Success', error: title || 'Error', warning: title || 'Warning', info: title || 'Info' }; toast.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-content"><div class="toast-title">${titles[type]}</div><div class="toast-message">${message}</div></div><div class="toast-close">×</div>`; container.appendChild(toast); toast.querySelector('.toast-close').addEventListener('click', () => { toast.style.animation = 'slideInRight 0.3s reverse'; setTimeout(() => toast.remove(), 300); }); setTimeout(() => { if (toast.parentElement) { toast.style.animation = 'slideInRight 0.3s reverse'; setTimeout(() => toast.remove(), 300); } }, 3000); }

// ============== NAVIGATION ==============
const navItems = document.querySelectorAll('.nav-item:not(.logout)');
const sections = document.querySelectorAll('.content-section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;
        
        // Update active states
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show selected section
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${sectionId}-section`).classList.add('active');
        
        // Update header title
        const titles = {
            'offline-sales': 'Offline Sales & Billing',
            'appointments': 'Appointment Management',
            'orders': 'Order Management',
            'inventory': 'Inventory Management',
            'analytics': 'Sales Analytics'
        };
        document.getElementById('section-title').textContent = titles[sectionId];
        
        // Load section data
        loadSectionData(sectionId);
    });
});

// ============== LOGOUT ==============
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = '/static/login.html';
});

// ============== API HELPER ==============
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

// ============== LOAD DASHBOARD STATS ==============
async function loadDashboardStats() {
    const stats = await apiCall('/admin/analytics/dashboard');
    if (stats) {
        document.getElementById('stat-revenue').textContent = `₹${stats.today_revenue.toFixed(2)}`;
        document.getElementById('stat-orders').textContent = stats.today_orders;
        document.getElementById('stat-low-stock').textContent = stats.low_stock_items;
        document.getElementById('stat-appointments').textContent = stats.pending_appointments;
    }
}

// ============== SECTION DATA LOADERS ==============
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'offline-sales':
            loadMedicinesForBilling();
            loadOfflineSales();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'inventory':
            loadInventory();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// ============== OFFLINE SALES & BILLING ==============
async function loadMedicinesForBilling() {
    allMedicines = await apiCall('/admin/medicines');
    if (allMedicines) {
        const select = document.getElementById('medicine-select');
        select.innerHTML = '<option value="">Select Medicine</option>';
        allMedicines.forEach(med => {
            if (med.stock > 0) {
                select.innerHTML += `<option value="${med.id}" data-price="${med.price}" data-name="${med.name}" data-stock="${med.stock}">${med.name} - ₹${med.price} (Stock: ${med.stock})</option>`;
            }
        });
    }
}

document.getElementById('add-medicine-btn').addEventListener('click', () => {
    const select = document.getElementById('medicine-select');
    const quantity = parseInt(document.getElementById('medicine-quantity').value);
    
    if (!select.value) {
        showToast('Please select a medicine', 'warning', 'Selection Required');
        return;
    }
    
    const option = select.options[select.selectedIndex];
    const medicineId = parseInt(select.value);
    const medicineName = option.dataset.name;
    const price = parseFloat(option.dataset.price);
    const stock = parseInt(option.dataset.stock);
    
    if (quantity > stock) {
        showToast(`Only ${stock} units available in stock`, 'warning', 'Stock Limit');
        return;
    }
    
    // Check if already added
    const existing = billItems.find(item => item.medicine_id === medicineId);
    if (existing) {
        existing.quantity += quantity;
        existing.subtotal = existing.price * existing.quantity;
    } else {
        billItems.push({
            medicine_id: medicineId,
            medicine_name: medicineName,
            price: price,
            quantity: quantity,
            subtotal: price * quantity
        });
    }
    
    renderBillItems();
    select.value = '';
    document.getElementById('medicine-quantity').value = 1;
});

function renderBillItems() {
    const tbody = document.getElementById('bill-items-body');
    
    if (billItems.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No items added yet</td></tr>';
        updateBillSummary();
        return;
    }
    
    tbody.innerHTML = billItems.map((item, index) => `
        <tr>
            <td>${item.medicine_name}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>₹${item.subtotal.toFixed(2)}</td>
            <td><button class="btn-danger btn-small" onclick="removeBillItem(${index})">Remove</button></td>
        </tr>
    `).join('');
    
    updateBillSummary();
}

function removeBillItem(index) {
    billItems.splice(index, 1);
    renderBillItems();
}

function updateBillSummary() {
    const subtotal = billItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    document.getElementById('bill-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('bill-tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('bill-total').textContent = `₹${total.toFixed(2)}`;
}

document.getElementById('complete-sale-btn').addEventListener('click', async () => {
    if (billItems.length === 0) {
        showToast('Please add items to the bill', 'warning', 'Empty Bill');
        return;
    }
    
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const paymentMode = document.getElementById('payment-mode').value;
    
    const payload = {
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        items: billItems,
        payment_mode: paymentMode
    };
    
    const result = await apiCall('/admin/offline-sales', 'POST', payload);
    if (result) {
        showToast(`Sale completed! Invoice: ${result.invoice_number}`, 'success', 'Sale Completed');
        
        // Reset form
        billItems = [];
        renderBillItems();
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        
        // Reload data
        loadMedicinesForBilling();
        loadOfflineSales();
        loadDashboardStats();
    }
});

async function loadOfflineSales() {
    const sales = await apiCall('/admin/offline-sales?limit=50');
    const tbody = document.getElementById('offline-sales-body');
    
    if (!sales || sales.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No sales yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = sales.map(sale => {
        const items = JSON.parse(sale.items || '[]');
        const date = new Date(sale.created_at).toLocaleString();
        return `
            <tr>
                <td>${sale.invoice_number}</td>
                <td>${sale.customer_name || 'Walk-in'}</td>
                <td>${items.length} items</td>
                <td>₹${sale.total_amount.toFixed(2)}</td>
                <td><span class="badge badge-success">${sale.payment_mode}</span></td>
                <td>${date}</td>
                <td><button class="btn-primary btn-small" onclick="printBill(${sale.id})">Print</button></td>
            </tr>
        `;
    }).join('');
}

function printBill(saleId) {
    // Find the sale from the loaded data
    apiCall('/admin/offline-sales?limit=50').then(sales => {
        const sale = sales.find(s => s.id === saleId);
        if (!sale) {
            showToast('Sale not found', 'error');
            return;
        }
        
        const items = JSON.parse(sale.items || '[]');
        
        // Create printable invoice
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice - ${sale.invoice_number}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #1e3a8a; }
                    .info { margin-bottom: 20px; }
                    .info p { margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background: #1e3a8a; color: white; }
                    .totals { text-align: right; margin-top: 20px; }
                    .totals p { margin: 8px 0; font-size: 16px; }
                    .total { font-weight: bold; font-size: 20px; color: #1e3a8a; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🏥 PharmaTrack</h1>
                    <p>Pharmacy Management System</p>
                    <h2>INVOICE</h2>
                </div>
                
                <div class="info">
                    <p><strong>Invoice Number:</strong> ${sale.invoice_number}</p>
                    <p><strong>Date:</strong> ${new Date(sale.created_at).toLocaleString()}</p>
                    <p><strong>Customer:</strong> ${sale.customer_name || 'Walk-in Customer'}</p>
                    ${sale.customer_phone ? `<p><strong>Phone:</strong> ${sale.customer_phone}</p>` : ''}
                    <p><strong>Payment Mode:</strong> ${sale.payment_mode}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Medicine</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${item.medicine_name}</td>
                                <td>${item.quantity}</td>
                                <td>₹${item.price.toFixed(2)}</td>
                                <td>₹${item.subtotal.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="totals">
                    <p>Subtotal: ₹${sale.subtotal.toFixed(2)}</p>
                    <p>Tax (5%): ₹${sale.tax.toFixed(2)}</p>
                    <p class="total">Total Amount: ₹${sale.total_amount.toFixed(2)}</p>
                </div>
                
                <div style="margin-top: 50px; text-align: center;">
                    <p>Thank you for your business!</p>
                    <button onclick="window.print()" style="padding: 10px 30px; background: #1e3a8a; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Print Invoice</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    });
}

// ============== APPOINTMENTS ==============
async function loadAppointments() {
    const status = document.getElementById('appointment-status-filter').value;
    const date = document.getElementById('appointment-date-filter').value;
    
    let endpoint = '/admin/appointments?';
    if (status) endpoint += `status=${status}&`;
    if (date) endpoint += `date=${date}&`;
    
    const appointments = await apiCall(endpoint);
    const tbody = document.getElementById('appointments-body');
    
    if (!appointments || appointments.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No appointments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = appointments.map(apt => {
        const date = new Date(apt.appointment_date).toLocaleDateString();
        const statusBadge = `badge-${apt.status.toLowerCase()}`;
        
        return `
            <tr>
                <td>${apt.id}</td>
                <td>${apt.user?.email || 'N/A'}</td>
                <td>${apt.doctor_name}</td>
                <td>${apt.specialization}</td>
                <td>${date} ${apt.appointment_time}</td>
                <td><span class="badge ${statusBadge}">${apt.status}</span></td>
                <td>
                    ${apt.status === 'Pending' ? `
                        <button class="btn-success btn-small" onclick="updateAppointmentStatus(${apt.id}, 'Approved')">Approve</button>
                        <button class="btn-danger btn-small" onclick="updateAppointmentStatus(${apt.id}, 'Rejected')">Reject</button>
                    ` : apt.status === 'Approved' ? `
                        <button class="btn-primary btn-small" onclick="updateAppointmentStatus(${apt.id}, 'Completed')">Complete</button>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

async function updateAppointmentStatus(id, status) {
    const result = await apiCall(`/admin/appointments/${id}/status`, 'PUT', { status });
    if (result) {
        showToast(result.message, 'success', 'Status Updated');
        loadAppointments();
        loadDashboardStats();
    }
}

document.getElementById('appointment-status-filter').addEventListener('change', loadAppointments);
document.getElementById('appointment-date-filter').addEventListener('change', loadAppointments);

// ============== ORDERS ==============
async function loadOrders() {
    const status = document.getElementById('order-status-filter').value;
    let endpoint = '/admin/orders';
    if (status) endpoint += `?status=${status}`;
    
    const orders = await apiCall(endpoint);
    const tbody = document.getElementById('orders-body');
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="8">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.created_at).toLocaleDateString();
        const statusBadge = `badge-${order.status.toLowerCase()}`;
        
        return `
            <tr>
                <td>${order.order_number}</td>
                <td>${order.user?.email || 'N/A'}</td>
                <td>${order.items?.length || 0} items</td>
                <td>₹${order.total_amount.toFixed(2)}</td>
                <td><span class="badge">${order.payment_mode}</span></td>
                <td><span class="badge ${statusBadge}">${order.status}</span></td>
                <td>${date}</td>
                <td>
                    ${order.status !== 'Delivered' && order.status !== 'Cancelled' ? `
                        <select onchange="updateOrderStatus(${order.id}, this.value)" class="order-status-select">
                            <option value="">Change Status</option>
                            <option value="Placed">Placed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');
}

async function updateOrderStatus(id, status) {
    if (!status) return;
    
    const result = await apiCall(`/admin/orders/${id}/status`, 'PUT', { status });
    if (result) {
        showToast(result.message, 'success', 'Status Updated');
        loadOrders();
        loadDashboardStats();
    }
}

document.getElementById('order-status-filter').addEventListener('change', loadOrders);

// ============== INVENTORY ==============
let filteredMedicines = [];

async function loadInventory(lowStockOnly = false) {
    let endpoint = '/admin/medicines';
    if (lowStockOnly) endpoint += '?low_stock=true';
    
    const medicines = await apiCall(endpoint);
    allMedicines = medicines || [];
    filteredMedicines = allMedicines;
    renderInventory();
}

function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    
    if (filteredMedicines.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No medicines found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredMedicines.map(med => {
        const lowStock = med.stock <= med.low_stock_threshold;
        return `
            <tr ${lowStock ? 'style="background: #fef3c7;"' : ''}>
                <td>${med.id}</td>
                <td>${med.name}</td>
                <td>${med.category}</td>
                <td>₹${med.price.toFixed(2)}</td>
                <td ${lowStock ? 'style="color: #dc2626; font-weight: 700;"' : ''}>${med.stock}</td>
                <td>${med.manufacturer || '-'}</td>
                <td>
                    <button class="btn-primary btn-small" onclick="editMedicine(${med.id})">Edit</button>
                    <button class="btn-danger btn-small" onclick="deleteMedicine(${med.id})">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('inventory-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filteredMedicines = allMedicines.filter(med => 
                med.name.toLowerCase().includes(searchTerm) ||
                med.category.toLowerCase().includes(searchTerm) ||
                (med.manufacturer && med.manufacturer.toLowerCase().includes(searchTerm))
            );
            renderInventory();
        });
    }
});

document.getElementById('low-stock-filter-btn').addEventListener('click', () => {
    showingLowStock = !showingLowStock;
    loadInventory(showingLowStock);
    document.getElementById('low-stock-filter-btn').textContent = showingLowStock ? '📋 All Items' : '⚠️ Low Stock';
});

// Medicine Modal
const medicineModal = document.getElementById('medicine-modal');
const closeModal = document.querySelector('.close');
const cancelBtn = document.getElementById('cancel-modal-btn');

document.getElementById('add-medicine-modal-btn').addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Add Medicine';
    document.getElementById('medicine-form').reset();
    document.getElementById('medicine-id').value = '';
    medicineModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    medicineModal.classList.remove('active');
});

cancelBtn.addEventListener('click', () => {
    medicineModal.classList.remove('active');
});

document.getElementById('medicine-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('medicine-id').value;
    const payload = {
        name: document.getElementById('med-name').value,
        category: document.getElementById('med-category').value,
        description: document.getElementById('med-description').value || null,
        price: parseFloat(document.getElementById('med-price').value),
        stock: parseInt(document.getElementById('med-stock').value),
        low_stock_threshold: parseInt(document.getElementById('med-threshold').value) || 10,
        manufacturer: document.getElementById('med-manufacturer').value || null
    };
    
    const endpoint = id ? `/admin/medicines/${id}` : '/admin/medicines';
    const method = id ? 'PUT' : 'POST';
    
    const result = await apiCall(endpoint, method, payload);
    if (result) {
        showToast(id ? 'Medicine updated successfully' : 'Medicine added successfully', 'success', id ? 'Medicine Updated' : 'Medicine Added');
        medicineModal.classList.remove('active');
        loadInventory(showingLowStock);
        loadDashboardStats();
    }
});

async function editMedicine(id) {
    const medicine = allMedicines.find(m => m.id === id);
    if (!medicine) {
        // Fetch if not in memory
        const med = await apiCall(`/admin/medicines`);
        const found = med.find(m => m.id === id);
        if (found) {
            populateMedicineForm(found);
        }
    } else {
        populateMedicineForm(medicine);
    }
}

function populateMedicineForm(med) {
    document.getElementById('modal-title').textContent = 'Edit Medicine';
    document.getElementById('medicine-id').value = med.id;
    document.getElementById('med-name').value = med.name;
    document.getElementById('med-category').value = med.category;
    document.getElementById('med-description').value = med.description || '';
    document.getElementById('med-price').value = med.price;
    document.getElementById('med-stock').value = med.stock;
    document.getElementById('med-threshold').value = med.low_stock_threshold;
    document.getElementById('med-manufacturer').value = med.manufacturer || '';
    medicineModal.classList.add('active');
}

async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    
    const result = await apiCall(`/admin/medicines/${id}`, 'DELETE');
    if (result) {
        showToast('Medicine deleted successfully', 'success', 'Medicine Deleted');
        loadInventory(showingLowStock);
        loadDashboardStats();
    }
}

// ============== ANALYTICS ==============
async function loadAnalytics() {
    const period = document.getElementById('analytics-period').value;
    const analytics = await apiCall(`/admin/analytics/sales?period=${period}`);
    
    if (!analytics) return;
    
    document.getElementById('analytics-total-revenue').textContent = `₹${analytics.total_revenue.toFixed(2)}`;
    document.getElementById('analytics-online-revenue').textContent = `₹${analytics.online_revenue.toFixed(2)}`;
    document.getElementById('analytics-offline-revenue').textContent = `₹${analytics.offline_revenue.toFixed(2)}`;
    
    // Payment split
    const paymentContainer = document.getElementById('payment-split-container');
    const paymentSplit = analytics.payment_split || {};
    
    if (Object.keys(paymentSplit).length === 0) {
        paymentContainer.innerHTML = '<p style="text-align: center; color: #6b7280;">No payment data available</p>';
    } else {
        const maxRevenue = Math.max(...Object.values(paymentSplit).map(p => p.revenue));
        paymentContainer.innerHTML = Object.entries(paymentSplit).map(([mode, data]) => {
            const percentage = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
            return `
                <div class="chart-bar">
                    <div class="chart-label">
                        <span>${mode}</span>
                        <span>₹${data.revenue.toFixed(2)} (${data.orders} orders)</span>
                    </div>
                    <div class="chart-progress">
                        <div class="chart-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Top medicines
    const topMedicinesBody = document.getElementById('top-medicines-body');
    const topMedicines = analytics.top_medicines || [];
    
    if (topMedicines.length === 0) {
        topMedicinesBody.innerHTML = '<tr class="empty-state"><td colspan="3">No sales data available</td></tr>';
    } else {
        topMedicinesBody.innerHTML = topMedicines.map(med => `
            <tr>
                <td>${med.name}</td>
                <td>${med.quantity_sold}</td>
                <td>₹${med.revenue.toFixed(2)}</td>
            </tr>
        `).join('');
    }
}

document.getElementById('analytics-period').addEventListener('change', loadAnalytics);

// ============== REFRESH BUTTON ==============
document.getElementById('refresh-btn').addEventListener('click', () => {
    loadDashboardStats();
    const activeSection = document.querySelector('.nav-item.active').dataset.section;
    loadSectionData(activeSection);
});

// ============== INITIAL LOAD ==============
loadDashboardStats();
loadMedicinesForBilling();
loadOfflineSales();
