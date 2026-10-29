let cart = JSON.parse(localStorage.getItem('ruchka_uz_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loader = document.getElementById('loaderOverlay');
        if (loader) loader.classList.add('hidden');
    }, 500);

    initApp();
});

function initApp() {
    updateCartUI();
    setupEventListeners();
}

function setupEventListeners() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    const ordersBtn = document.getElementById('ordersBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const ordersDropdown = document.getElementById('ordersDropdown');
    const settingsDropdown = document.getElementById('settingsDropdown');

    if (ordersBtn) {
        ordersBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsDropdown.classList.remove('show');
            ordersDropdown.classList.toggle('show');
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            ordersDropdown.classList.remove('show');
            settingsDropdown.classList.toggle('show');
        });
    }

    document.addEventListener('click', () => {
        if (ordersDropdown) ordersDropdown.classList.remove('show');
        if (settingsDropdown) settingsDropdown.classList.remove('show');
    });

    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('typeFilter').addEventListener('change', filterProducts);

    const productsGrid = document.getElementById('productsGrid');
    productsGrid.addEventListener('click', (e) => {
        const detailBtn = e.target.closest('.btn-detail');
        const addCartBtn = e.target.closest('.btn-add-cart');
        const card = e.target.closest('.product-card');

        if (card) {
            const id = parseInt(card.getAttribute('data-id'));
            const name = card.querySelector('.product-title').innerText;
            const price = parseInt(card.getAttribute('data-price'));
            const img = card.querySelector('img').src;
            const desc = card.getAttribute('data-desc');
            const color = card.getAttribute('data-color');
            const rating = card.getAttribute('data-rating');

            if (addCartBtn) {
                addToCart({ id, name, price, img });
            } else if (detailBtn) {
                openDetailModal({ id, name, price, img, desc, color, rating });
            }
        }
    });

    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('newsletterEmail');
        if (input.value) {
            showToast("Muvaffaqiyatli obuna bo'ldingiz!");
            input.value = '';
        }
    });

    document.getElementById('checkoutBtn').addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("Savatchangiz bo'sh!");
            return;
        }
        showToast("Buyurtmangiz qabul qilindi!");
        cart = [];
        saveCart();
        updateCartUI();
        closeCart();
    });

    const modalClose = document.getElementById('modalClose');
    const detailModal = document.getElementById('detailModal');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            detailModal.classList.remove('active');
        });
    }
}

function filterProducts() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const typeVal = document.getElementById('typeFilter').value;

    const cards = Array.from(document.querySelectorAll('.product-card'));

    cards.forEach(card => {
        const title = card.querySelector('.product-title').innerText.toLowerCase();
        const category = card.getAttribute('data-category');

        const matchesSearch = title.includes(searchVal);
        const matchesType = typeVal === 'all' || category === typeVal;

        if (matchesSearch && matchesType) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`${product.name} savatchaga qo'shildi!`);
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('ruchka_uz_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const container = document.getElementById('cartItems');
    const totalSumEl = document.getElementById('cartTotalSum');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (badge) badge.innerText = totalQty;
    if (totalSumEl) totalSumEl.innerText = `${totalPrice.toLocaleString()} so'm`;

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: #64748b; margin-top: 40px;">Savatchangiz hozircha bo'sh</p>`;
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.img}" alt="rasm">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} so'm</div>
                <div class="cart-item-qty">
                    <button onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function openCart() {
    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartSidebar').classList.add('active');
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartSidebar').classList.remove('active');
}

function openDetailModal(product) {
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center;">
            <img src="${product.img}" alt="rasm" style="width: 200px; height: 200px; object-fit: contain; border-radius: 12px; background: #ffffff; border: 1px solid #f1f5f9;">
            <div style="flex: 1;">
                <h2 style="margin-bottom: 10px;">${product.name}</h2>
                <p style="color: #4f46e5; font-weight: 700; font-size: 1.2rem; margin-bottom: 10px;">${product.price.toLocaleString()} so'm</p>
                <p style="color: #64748b; margin-bottom: 15px;">${product.desc}</p>
                <p><strong>Rang:</strong> ${product.color}</p>
                <p style="margin-bottom: 20px;"><strong>Reyting:</strong> ${product.rating} / 5</p>
                <button class="btn btn-primary" onclick="addToCart({id: ${product.id}, name: '${product.name.replace(/'/g, "\\'")}', price: ${product.price}, img: '${product.img}'}); document.getElementById('detailModal').classList.remove('active');">Savatchaga qo'shish</button>
            </div>
        </div>
    `;
    document.getElementById('detailModal').classList.add('active');
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check" style="color: #4f46e5;"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}