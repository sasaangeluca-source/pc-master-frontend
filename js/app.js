let cart = [];
let allProducts = [];
let currentCategory = 'all';
let currentPriceFilter = 'all';

// Адрес твоего Java-сервера в домашней сети
const BACKEND_URL = 'http://192.168.100.34:8080';

// 1. Получаем товары с Java
async function fetchProductsFromBackend() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/products`);
        allProducts = await response.json();
        renderProducts(); 
    } catch (error) {
        console.error("Ошибка сервера:", error);
        document.getElementById("products-grid").innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Ошибка подключения к Java-серверу! Проверь IntelliJ IDEA.
            </div>
        `;
    }
}

// 2. Функция отрисовки карточек с учетом фильтров
function renderProducts() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;
    grid.innerHTML = ""; 

    // Фильтруем массив товаров
    const filtered = allProducts.filter(product => {
        // Прямая проверка категории из Java поля "category"
        const matchCategory = (currentCategory === 'all' || product.category === currentCategory);

        // Проверка цены
        const numericPrice = parseInt(product.price.replace(/\s/g, ''));
        let matchPrice = true;
        if (currentPriceFilter === 'budget') matchPrice = (numericPrice <= 15000);
        if (currentPriceFilter === 'top') matchPrice = (numericPrice > 15000);

        return matchCategory && matchPrice;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="text-muted text-center w-100 my-4">Нет товаров, соответствующих фильтрам</div>`;
        return;
    }

    filtered.forEach(product => {
        grid.innerHTML += `
            <div class="col">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${product.image}" class="card-img-top rounded-top" alt="${product.title}" style="height: 140px; object-fit: cover;">
                    <div class="card-body d-flex flex-column p-3">
                        <h6 class="card-title fw-bold text-dark mb-1" style="font-size: 0.95rem;">${product.title}</h6>
                        <p class="card-text text-muted mb-3" style="font-size: 0.8rem; line-height: 1.3;">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mt-auto">
                            <span class="fw-bold text-primary" style="font-size: 1.1rem;">${product.price}</span>
                            <button class="btn btn-success btn-sm px-2 py-1" style="font-size: 0.8rem;" onclick="addToCart(${product.id})">🛒 В корзину</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// Клик по категориям в левом сайдбаре
function filterCategory(category, buttonElement) {
    currentCategory = category;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    renderProducts();
}

// Клик по фильтру цен в левом сайдбаре
function filterPrice(priceType) {
    currentPriceFilter = priceType;
    renderProducts();
}

// Добавление в корзину
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
    }
}

// Обновление корзины на экране
function updateCartUI() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) cartCount.innerText = cart.length;

    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalSpan = document.getElementById("cart-total-price");

    if (cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = `<p class="text-muted text-center">Корзина пока пуста</p>`;
        if (cartTotalSpan) cartTotalSpan.innerText = "0 грн";
        return;
    }

    let htmlContent = `<ul class="list-group mb-3">`;
    let totalPrice = 0;

    cart.forEach(item => {
        htmlContent += `
            <li class="list-group-item d-flex justify-content-between lh-sm">
                <div><h6 class="my-0 fw-bold small">${item.title}</h6></div>
                <span class="text-muted small">${item.price}</span>
            </li>
        `;
        const numericPrice = parseInt(item.price.replace(/\s/g, ''));
        totalPrice += numericPrice;
    });

    htmlContent += `</ul>`;
    if (cartItemsContainer) cartItemsContainer.innerHTML = htmlContent;
    if (cartTotalSpan) cartTotalSpan.innerText = totalPrice.toLocaleString() + " грн";
}

// Отправка заказа на Java-сервер
async function submitOrder() {
    const name = document.getElementById("customer-name").value;
    const phone = document.getElementById("customer-phone").value;

    if (!name || !phone) {
        alert("Заполните поля!");
        return;
    }

    const orderData = { customerName: name, customerPhone: phone, items: cart };

    try {
        const response = await fetch(`${BACKEND_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert(`Спасибо, ${name}! Заказ отправлен на сервер.`);
            cart = [];
            updateCartUI();
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
            document.getElementById("order-form").reset();
        }
    } catch (error) {
        alert("Ошибка отправки! Проверь бэкенд.");
    }
}

document.addEventListener("DOMContentLoaded", fetchProductsFromBackend);