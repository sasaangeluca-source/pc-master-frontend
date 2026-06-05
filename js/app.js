let cart = [];
let allProducts = [];

// Адрес твоего Java-сервера в домашней сети
const BACKEND_URL = 'http://192.168.100.34:8080';

// 1. Получаем товары с Java
async function fetchProductsFromBackend() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/products`);
        allProducts = await response.json();
        
        const grid = document.getElementById("products-grid");
        if (!grid) return;
        grid.innerHTML = ""; 

        allProducts.forEach(product => {
            grid.innerHTML += `
                <div class="col">
                    <div class="card h-100 shadow-sm">
                        <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 180px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title fw-bold fs-6">${product.title}</h5>
                            <p class="card-text text-muted small">${product.description}</p>
                            <div class="d-flex justify-content-between align-items-center mt-auto">
                                <span class="fs-5 fw-bold text-primary">${product.price}</span>
                                <button class="btn btn-outline-success btn-sm" onclick="addToCart(${product.id})">В корзину</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Ошибка сервера:", error);
        document.getElementById("products-grid").innerHTML = `
            <div class="alert alert-danger w-100 text-center">
                Ошибка! Проверь, запущен ли Java-проект в IntelliJ IDEA.
            </div>
        `;
    }
}

// 2. Добавление в корзину
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
    }
}

// 3. Обновление корзины на экране
function updateCartUI() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) cartCount.innerText = Math.max(0, cart.length);

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

// 4. Отправка заказа на Java
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
            alert(`Спасибо, ${name}! Заказ отправлен на Java-сервер.`);
            cart = [];
            updateCartUI();
            bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
            document.getElementById("order-form").reset();
        }
    } catch (error) {
        alert("Ошибка отправки! Сервер недоступен.");
    }
}

document.addEventListener("DOMContentLoaded", fetchProductsFromBackend);