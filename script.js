const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');
const cartQuantitySpan = document.querySelector('#header #lg-bag .quantity');

function updateCartQuantityDisplay() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartQuantitySpan) {
        cartQuantitySpan.textContent = totalQuantity;
    }
}

// Function to add a product to the cart
function addToCart(productId, productName, productPrice, productImage, quantityToAdd = 1) {
    if (!productId) {
        console.error('Error: Product ID is undefined. Cannot add to cart.');
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantityToAdd;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: productImage,
            quantity: quantityToAdd
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartQuantityDisplay();
    console.log('Product added to cart:', { productId, productName, productPrice, productImage, quantityAdded: quantityToAdd });
}

// Event listener for mobile navigation toggle
if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    });
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    });
}

// Initial update of cart quantity when the page loads
document.addEventListener('DOMContentLoaded', updateCartQuantityDisplay);

// Add event listeners to "Add to Cart" buttons dynamically
document.addEventListener('click', (event) => {

    const cartButton = event.target.closest('.pro .cart, #prodetails .single-pro-details button.normal');

    if (cartButton) {
        event.preventDefault();

        let productId, productName, productPrice, productImage;
        let quantity = 1;
        if (cartButton.classList.contains('cart')) {
            const productDiv = cartButton.closest('.pro');
            if (productDiv) {
                productId = productDiv.dataset.productId;
                productName = productDiv.querySelector('.des h5')?.textContent || 'Unknown Product';
                productPrice = productDiv.querySelector('.des h4')?.textContent?.replace('Rs.', '').replace(',', '') || '0';
                // Fallback image for product cards
                productImage = productDiv.querySelector('img')?.src || 'https://placehold.co/70x70/cccccc/000000?text=No+Image';
            } else {
                console.warn('Warning: Could not find parent .pro div for cart button.');
            }
        }
        // Logic for single product page (sproduct1.html)
        else if (cartButton.closest('#prodetails')) {
            const proDetails = cartButton.closest('#prodetails');
            if (proDetails) {
                productId = proDetails.dataset.productId;
                productName = proDetails.querySelector('.single-pro-details h4')?.textContent || 'Unknown Single Product';
                productPrice = proDetails.querySelector('.single-pro-details h2')?.textContent?.replace('Rs.', '').replace(',', '') || '0';
                // Main product image for single product page
                productImage = proDetails.querySelector('#MainImg')?.src || 'https://placehold.co/70x70/cccccc/000000?text=No+Image';
                const quantityInput = proDetails.querySelector('.single-pro-details input[type="number"]');
                quantity = parseInt(quantityInput ? quantityInput.value : '1');
                if (isNaN(quantity) || quantity < 1) {
                    quantity = 1;
                    if (quantityInput) quantityInput.value = 1;
                }
            } else {
                console.warn('Warning: Could not find parent #prodetails section for add to cart button.');
            }
        }

        if (!productId) {
            console.error('Error: Product ID is missing. Please ensure data-product-id is set on product elements (e.g., <div class="pro" data-product-id="p1">).');

            productId = 'fallback-product-' + Math.random().toString(36).substr(2, 9);
            console.warn('Using fallback ID:', productId);
        }

        addToCart(productId, productName, productPrice, productImage, quantity);
    }
});

// Cart page specific functions (moved from inline script in cart.html)
document.addEventListener('DOMContentLoaded', () => {

    if (document.getElementById('cart-items-body')) {
        const cartItemsBody = document.getElementById('cart-items-body');
        const cartSubtotalElement = document.getElementById('cart-subtotal');
        const cartTotalElement = document.getElementById('cart-total');

        // Function to load and display cart items
        function loadCartItems() {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartItemsBody.innerHTML = '';

            let subtotal = 0;

            if (cart.length === 0) {
                cartItemsBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Your cart is empty.</td></tr>';
            } else {
                cart.forEach(item => {
                    const itemPrice = parseFloat(item.price);
                    const itemQuantity = parseInt(item.quantity);
                    const itemSubtotal = itemPrice * itemQuantity;
                    subtotal += itemSubtotal;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><a href="#" class="remove-item" data-product-id="${item.id}"><i class="far fa-times-circle"></i></a></td>
                        <td><img src="${item.image}" alt="${item.name}"></td>
                        <td>${item.name}</td>
                        <td>Rs.${itemPrice.toFixed(2)}</td>
                        <td><input type="number" value="${itemQuantity}" min="1" class="update-quantity" data-product-id="${item.id}"></td>
                        <td>Rs.${itemSubtotal.toFixed(2)}</td>
                    `;
                    cartItemsBody.appendChild(row);
                });
            }

            cartSubtotalElement.textContent = `Rs.${subtotal.toFixed(2)}`;
            cartTotalElement.textContent = `Rs.${subtotal.toFixed(2)}`;
        }

        // Function to remove an item from the cart
        cartItemsBody.addEventListener('click', (event) => {
            if (event.target.closest('.remove-item')) {
                event.preventDefault();
                const productIdToRemove = event.target.closest('.remove-item').dataset.productId;
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart = cart.filter(item => item.id !== productIdToRemove);
                localStorage.setItem('cart', JSON.stringify(cart));
                loadCartItems();
                updateCartQuantityDisplay();
            }
        });

        // Function to update item quantity
        cartItemsBody.addEventListener('change', (event) => {
            if (event.target.classList.contains('update-quantity')) {
                const productIdToUpdate = event.target.dataset.productId;
                let newQuantity = parseInt(event.target.value);

                if (isNaN(newQuantity) || newQuantity < 1) {
                    newQuantity = 1;
                    event.target.value = 1;
                }

                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const itemToUpdate = cart.find(item => item.id === productIdToUpdate);

                if (itemToUpdate) {
                    itemToUpdate.quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    loadCartItems();
                    updateCartQuantityDisplay();
                }
            }
        });

        loadCartItems();
    }
});

// Function to update the order summary on the checkout page
function updateCheckoutOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);

    const checkoutSubtotalElement = document.getElementById('checkout-subtotal');
    const checkoutTotalElement = document.getElementById('checkout-total');

    if (checkoutSubtotalElement) {
        checkoutSubtotalElement.textContent = `Rs.${subtotal.toFixed(2)}`;
    }
    if (checkoutTotalElement) {
        checkoutTotalElement.textContent = `Rs.${subtotal.toFixed(2)}`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    updateCheckoutOrderSummary();
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - checkout.js is running.');
    const placeOrderBtn = document.querySelector('.place-order-btn');
    const orderMessageBox = document.getElementById('orderMessageBox');
    const checkoutForm = document.querySelector('#checkout-details form');

    console.log('placeOrderBtn:', placeOrderBtn);
    console.log('orderMessageBox:', orderMessageBox);
    console.log('checkoutForm:', checkoutForm);

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(event) {
            console.log('Place Order button clicked!');
            event.preventDefault();

            if (!checkoutForm.checkValidity()) {
                console.log('Form is invalid.');
                checkoutForm.reportValidity();
                return;
            }

            orderMessageBox.style.display = 'block';
            console.log('Message box should be visible.');

            localStorage.removeItem('cart');
            updateCartQuantityDisplay();
            updateCheckoutOrderSummary();

            setTimeout(function() {
                orderMessageBox.style.display = 'none';
                checkoutForm.reset();
                console.log('Form should be reset and message box hidden.');

            }, 1000);
        });
    } else {
        console.error('Error: Place Order button not found!');
    }


});