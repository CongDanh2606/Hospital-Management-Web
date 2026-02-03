const API_BASE = 'http://localhost:3000/api';

// Check connection status on load
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        const hospitalStatus = document.getElementById('hospital-status');
        const ecommerceStatus = document.getElementById('ecommerce-status');
        
        if (data.success) {
            hospitalStatus.innerHTML = `Hospital: <span class="${data.connections.hospital === 'Connected' ? 'connected' : 'disconnected'}">${data.connections.hospital}</span>`;
            ecommerceStatus.innerHTML = `Ecommerce: <span class="${data.connections.ecommerce === 'Connected' ? 'connected' : 'disconnected'}">${data.connections.ecommerce}</span>`;
            
            if (data.connections.hospital === 'Connected') {
                hospitalStatus.classList.add('connected');
            }
            if (data.connections.ecommerce === 'Connected') {
                ecommerceStatus.classList.add('connected');
            }
        }
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

// Load doctors from Hospital DB
async function loadDoctors() {
    const loadingEl = document.getElementById('doctors-loading');
    const errorEl = document.getElementById('doctors-error');
    const listEl = document.getElementById('doctors-list');
    const countEl = document.getElementById('doctors-count');
    
    loadingEl.style.display = 'block';
    errorEl.classList.remove('show');
    listEl.innerHTML = '';
    countEl.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/doctors`);
        const data = await response.json();
        
        loadingEl.style.display = 'none';
        
        if (data.success && data.data.length > 0) {
            countEl.innerHTML = `📊 Total Doctors: ${data.count}`;
            
            data.data.forEach(doctor => {
                const card = createDoctorCard(doctor);
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">No doctors found in database</p>';
        }
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = `❌ Error loading doctors: ${error.message}`;
        errorEl.classList.add('show');
    }
}

// Load products from Ecommerce DB
async function loadProducts() {
    const loadingEl = document.getElementById('products-loading');
    const errorEl = document.getElementById('products-error');
    const listEl = document.getElementById('products-list');
    const countEl = document.getElementById('products-count');
    
    loadingEl.style.display = 'block';
    errorEl.classList.remove('show');
    listEl.innerHTML = '';
    countEl.innerHTML = '';
    
    try {
        const response = await fetch(`${API_BASE}/products`);
        const data = await response.json();
        
        loadingEl.style.display = 'none';
        
        if (data.success && data.data.length > 0) {
            countEl.innerHTML = `📊 Total Products: ${data.count}`;
            
            data.data.forEach(product => {
                const card = createProductCard(product);
                listEl.appendChild(card);
            });
        } else {
            listEl.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">No products found in database</p>';
        }
    } catch (error) {
        loadingEl.style.display = 'none';
        errorEl.textContent = `❌ Error loading products: ${error.message}`;
        errorEl.classList.add('show');
    }
}

// Create doctor card HTML
function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
        <h3>👨‍⚕️ ${doctor.name || 'N/A'}</h3>
        ${doctor.department ? `<div class="card-field"><strong>Department:</strong><span class="badge badge-department">${doctor.department}</span></div>` : ''}
        ${doctor.specialization ? `<div class="card-field"><strong>Specialization:</strong><span class="badge badge-specialty">${doctor.specialization}</span></div>` : ''}
        ${doctor.experience ? `<div class="card-field"><strong>Experience:</strong><span>${doctor.experience} years</span></div>` : ''}
        ${doctor.email ? `<div class="card-field"><strong>Email:</strong><span>${doctor.email}</span></div>` : ''}
        ${doctor.phone ? `<div class="card-field"><strong>Phone:</strong><span>${doctor.phone}</span></div>` : ''}
        ${doctor.qualification ? `<div class="card-field"><strong>Qualification:</strong><span>${doctor.qualification}</span></div>` : ''}
    `;
    
    return card;
}

// Create product card HTML
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'card';
    
    card.innerHTML = `
        <h3>📦 ${product.name || product.title || 'N/A'}</h3>
        ${product.category ? `<div class="card-field"><strong>Category:</strong><span class="badge badge-category">${product.category}</span></div>` : ''}
        ${product.price ? `<div class="card-field"><strong>Price:</strong><span class="badge badge-price">$${product.price}</span></div>` : ''}
        ${product.description ? `<div class="card-field"><strong>Description:</strong><span>${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</span></div>` : ''}
        ${product.stock !== undefined ? `<div class="card-field"><strong>Stock:</strong><span>${product.stock}</span></div>` : ''}
        ${product.brand ? `<div class="card-field"><strong>Brand:</strong><span>${product.brand}</span></div>` : ''}
        ${product.rating ? `<div class="card-field"><strong>Rating:</strong><span>⭐ ${product.rating}</span></div>` : ''}
    `;
    
    return card;
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data if not loaded yet
    if (tabName === 'doctors' && document.getElementById('doctors-list').children.length === 0) {
        loadDoctors();
    } else if (tabName === 'products' && document.getElementById('products-list').children.length === 0) {
        loadProducts();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkHealth();
    loadDoctors(); // Load doctors by default
});
