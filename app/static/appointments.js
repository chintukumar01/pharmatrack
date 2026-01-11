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
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const titles = { success: title || 'Success', error: title || 'Error', warning: title || 'Warning', info: title || 'Info' };
    toast.innerHTML = `<div class="toast-icon">${icons[type]}</div><div class="toast-content"><div class="toast-title">${titles[type]}</div><div class="toast-message">${message}</div></div><div class="toast-close">×</div>`;
    container.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => { toast.style.animation = 'slideInRight 0.3s reverse'; setTimeout(() => toast.remove(), 300); });
    setTimeout(() => { if (toast.parentElement) { toast.style.animation = 'slideInRight 0.3s reverse'; setTimeout(() => toast.remove(), 300); } }, 3000);
}

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

// Load doctors
let doctors = [];

async function loadDoctors() {
    doctors = await apiCall('/user/doctors', 'GET', null);
    if (doctors) {
        const select = document.getElementById('doctor-select');
        select.innerHTML = '<option value="">Select Doctor</option>';
        doctors.forEach(doc => {
            select.innerHTML += `<option value="${doc.id}" data-name="${doc.name}" data-spec="${doc.specialization}">${doc.name} - ${doc.specialization}</option>`;
        });
    }
}

// Load appointments
async function loadAppointments() {
    const appointments = await apiCall('/user/appointments');
    const container = document.getElementById('appointments-list');
    
    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments yet</div>';
        return;
    }
    
    container.innerHTML = appointments.map(apt => {
        const date = new Date(apt.appointment_date).toLocaleDateString();
        const statusClass = apt.status.toLowerCase();
        
        return `
            <div class="appointment-card">
                <div class="appointment-info">
                    <h3>Dr. ${apt.doctor_name}</h3>
                    <p class="appointment-detail"><strong>Specialization:</strong> ${apt.specialization}</p>
                    <p class="appointment-detail"><strong>Date:</strong> ${date} at ${apt.appointment_time}</p>
                    ${apt.notes ? `<p class="appointment-detail"><strong>Notes:</strong> ${apt.notes}</p>` : ''}
                </div>
                <div>
                    <span class="appointment-status ${statusClass}">${apt.status}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Appointment modal
const appointmentModal = document.getElementById('appointment-modal');
const closeModal = document.querySelector('.close');
const cancelAppointment = document.getElementById('cancel-appointment');

document.getElementById('book-appointment-btn').addEventListener('click', () => {
    appointmentModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
    appointmentModal.classList.remove('active');
});

cancelAppointment.addEventListener('click', () => {
    appointmentModal.classList.remove('active');
});

// Set minimum date to today
const dateInput = document.getElementById('appointment-date');
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

// Appointment form
document.getElementById('appointment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const doctorSelect = document.getElementById('doctor-select');
    const selectedOption = doctorSelect.options[doctorSelect.selectedIndex];
    
    const doctorName = selectedOption.dataset.name;
    const specialization = selectedOption.dataset.spec;
    const appointmentDate = document.getElementById('appointment-date').value;
    const appointmentTime = document.getElementById('appointment-time').value;
    const notes = document.getElementById('appointment-notes').value;
    
    const appointmentData = {
        doctor_name: doctorName,
        specialization: specialization,
        appointment_date: new Date(appointmentDate).toISOString(),
        appointment_time: appointmentTime,
        notes: notes || null
    };
    
    const result = await apiCall('/user/appointments', 'POST', appointmentData);
    
    if (result) {
        showToast('Appointment booked successfully! Waiting for admin approval.', 'success', 'Appointment Booked');
        appointmentModal.classList.remove('active');
        document.getElementById('appointment-form').reset();
        loadAppointments();
    }
});

// Initial load
updateCartCount();
loadDoctors();
loadAppointments();
