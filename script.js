let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterMenu(category);
            
            categoryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }

    const checkboxes = document.querySelectorAll('.item-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateCartFromCheckboxes();
        });
    });

    updateOrderDisplay();

    initCarousel();
    initReviews();
});

let currentSlide = 0;
let carouselInterval;
const totalSlides = 6;

function initCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDotsContainer = document.getElementById('carouselDots');
    
    if (!carouselTrack || !carouselDotsContainer) return;
    
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        carouselDotsContainer.appendChild(dot);
    }
    
    startAutoCarousel();
}

function updateCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function moveCarousel(direction) {
    currentSlide += direction;
    
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }
    
    updateCarousel();
    resetAutoCarousel();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updateCarousel();
    resetAutoCarousel();
}

function startAutoCarousel() {
    carouselInterval = setInterval(() => {
        moveCarousel(1);
    }, 4000);
}

function resetAutoCarousel() {
    clearInterval(carouselInterval);
    startAutoCarousel();
}

function filterMenu(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.category-section');
    
    if (category === 'all') {
        menuItems.forEach(item => item.style.display = 'block');
        sections.forEach(section => section.style.display = 'block');
    } else {
        sections.forEach(section => {
            const sectionId = section.id;
            if (sectionId === category + '-section') {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }
}

function updateCartFromCheckboxes() {
    const checkboxes = document.querySelectorAll('.item-checkbox input[type="checkbox"]');
    
    const menuAddedItems = cart.filter(item => item.fromMenu === true);
    
    const checkboxItems = [];
    checkboxes.forEach(checkbox => {
        const itemName = checkbox.getAttribute('data-name');
        const itemPrice = parseInt(checkbox.getAttribute('data-price'));
        
        if (checkbox.checked) {
            checkboxItems.push({
                name: itemName,
                price: itemPrice,
                quantity: 1,
                fromCheckbox: true
            });
        }
    });
    
    cart = [...menuAddedItems, ...checkboxItems];
    
    updateOrderDisplay();
}

function showToast(message) {
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2000);
}

function addToOrder(button) {
    const menuItem = button.closest('.menu-item');
    const itemName = menuItem.getAttribute('data-name');
    const itemPrice = parseInt(menuItem.getAttribute('data-price'));
    
    const existingItem = cart.find(item => item.name === itemName && item.fromMenu === true);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1,
            fromMenu: true
        });
    }
    
    updateOrderDisplay();
    showToast('Added to cart!');
    
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-plus"></i>';
    }, 1000);
}

function removeFromOrder(index) {
    const removedItem = cart[index];
    cart.splice(index, 1);
    
    if (removedItem && removedItem.fromCheckbox) {
        const checkboxes = document.querySelectorAll('.item-checkbox input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.getAttribute('data-name') === removedItem.name) {
                checkbox.checked = false;
            }
        });
    }
    
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderItemsContainer = document.getElementById('orderItems');
    const orderTotalContainer = document.getElementById('orderTotal');
    const totalAmountSpan = document.getElementById('totalAmount');
    
    if (!orderItemsContainer) return;
    
    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. Add items from the menu above!</p>';
        if (orderTotalContainer) orderTotalContainer.style.display = 'none';
        return;
    }
    
    let total = 0;
    let html = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const sourceLabel = item.fromMenu ? ' (from menu)' : '';
        
        html += `
            <div class="order-item">
                <div class="order-item-info">
                    <div class="order-item-name">${item.name}${sourceLabel}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="order-item-price">₦${itemTotal.toLocaleString()}</div>
                <button class="remove-item" onclick="removeFromOrder(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = html;
    if (totalAmountSpan) totalAmountSpan.textContent = `₦${total.toLocaleString()}`;
    if (orderTotalContainer) orderTotalContainer.style.display = 'flex';
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        alert('Please add items to your order before submitting!');
        return;
    }
    
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const branch = document.getElementById('branch').value;
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    const specialInstructions = document.getElementById('specialInstructions').value;
    
    let orderMessage = `*NEW ORDER FROM MEDDY'S AFRICANA BUKA*\n\n`;
    orderMessage += `*Customer:* ${customerName}\n`;
    orderMessage += `*Phone:* ${customerPhone}\n`;
    orderMessage += `*Branch:* ${branch}\n`;
    orderMessage += `*Delivery Address:* ${deliveryAddress}\n\n`;
    orderMessage += `*ORDER DETAILS:*\n`;
    orderMessage += `-------------------\n`;
    
    let total = 0;
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderMessage += `${index + 1}. ${item.name}\n`;
        orderMessage += `   Qty: ${item.quantity} x ₦${item.price.toLocaleString()} = ₦${itemTotal.toLocaleString()}\n\n`;
    });
    
    orderMessage += `-------------------\n`;
    orderMessage += `*TOTAL: ₦${total.toLocaleString()}*\n\n`;
    
    if (specialInstructions) {
        orderMessage += `*Special Instructions:*\n${specialInstructions}\n\n`;
    }
    
    orderMessage += `_Thank you for ordering from Meddy's Africana Buka!_`;
    
    const whatsappNumber = '2348127629913';
    const encodedMessage = encodeURIComponent(orderMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    cart = [];
    const checkboxes = document.querySelectorAll('.item-checkbox input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    updateOrderDisplay();
    document.getElementById('orderForm').reset();
    
    alert('Your order has been prepared! You will be redirected to WhatsApp to send it.');
}

let currentReview = 0;
let reviewInterval;
const totalReviews = 4;

function initReviews() {
    const reviewsTrack = document.getElementById('reviewsTrack');
    const reviewDotsContainer = document.getElementById('reviewDots');
    
    if (!reviewsTrack || !reviewDotsContainer) return;
    
    for (let i = 0; i < totalReviews; i++) {
        const dot = document.createElement('div');
        dot.className = 'review-dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToReview(i));
        reviewDotsContainer.appendChild(dot);
    }
    
    startAutoReviews();
}

function updateReviews() {
    const reviewsTrack = document.getElementById('reviewsTrack');
    const dots = document.querySelectorAll('.review-dot');
    
    if (reviewsTrack) {
        reviewsTrack.style.transform = `translateX(-${currentReview * 100}%)`;
    }
    
    dots.forEach((dot, index) => {
        if (index === currentReview) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function moveReview(direction) {
    currentReview += direction;
    
    if (currentReview < 0) {
        currentReview = totalReviews - 1;
    } else if (currentReview >= totalReviews) {
        currentReview = 0;
    }
    
    updateReviews();
    resetAutoReviews();
}

function goToReview(index) {
    currentReview = index;
    updateReviews();
    resetAutoReviews();
}

function startAutoReviews() {
    reviewInterval = setInterval(() => {
        moveReview(1);
    }, 5000);
}

function resetAutoReviews() {
    clearInterval(reviewInterval);
    startAutoReviews();
}

document.addEventListener('click', function(e) {
    const navMenu = document.getElementById('navMenu');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (navMenu && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    }
});
