const products = {
  'prod-shirt': {
    id: 'prod-shirt',
    name: 'Organic Cotton Tee',
    price: 68,
    description: 'Soft, breathable essentials made from GOTS-certified organic fibers.',
  },
  'prod-shoes': {
    id: 'prod-shoes',
    name: 'Recycled Leather Sneakers',
    price: 128,
    description: 'Minimal design with an eco-conscious sole and premium finish.',
  },
  'prod-bag': {
    id: 'prod-bag',
    name: 'Recycled Canvas Tote',
    price: 92,
    description: 'Carry more with a roomy, durable bag crafted from post-consumer waste.',
  },
  'prod-watch': {
    id: 'prod-watch',
    name: 'Eco-Edge Watch',
    price: 198,
    description: 'Refined timepiece built with sustainable materials and timeless appeal.',
  },
};

const cart = {};
const cartCount = document.getElementById('cart-count');
const cartItemsNode = document.getElementById('cart-items');
const cartTotalNode = document.getElementById('cart-total');
const cartEmpty = document.getElementById('cart-empty');
const cartDrawer = document.querySelector('.cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const checkoutButton = document.getElementById('checkout-button');

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function updateCartUI() {
  const items = Object.values(cart);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  cartCount.textContent = totalQuantity;
  cartTotalNode.textContent = formatPrice(total);

  cartItemsNode.innerHTML = '';
  if (!items.length) {
    cartEmpty.classList.remove('hidden');
    checkoutButton.disabled = true;
    return;
  }

  cartEmpty.classList.add('hidden');
  checkoutButton.disabled = false;

  items.forEach((item) => {
    const itemRow = document.createElement('div');
    itemRow.className = 'cart-item';
    itemRow.innerHTML = `
      <div class="cart-item-details">
        <strong>${item.name}</strong>
        <span>${item.quantity} × ${formatPrice(item.price)}</span>
      </div>
      <button class="cart-remove" data-product-id="${item.id}" type="button">Remove</button>
    `;
    cartItemsNode.appendChild(itemRow);
  });
}

function addToCart(productId) {
  const product = products[productId];
  if (!product) return;

  // Get quantity from input field
  const quantityInput = document.getElementById(`qty-${productId}`);
  const quantity = quantityInput ? Math.max(1, parseInt(quantityInput.value) || 1) : 1;

  if (!cart[productId]) {
    cart[productId] = { ...product, quantity: 0 };
  }
  cart[productId].quantity += quantity;
  updateCartUI();
  openCart();
}

function removeFromCart(productId) {
  if (!cart[productId]) return;
  delete cart[productId];
  updateCartUI();
}

function openCart() {
  cartDrawer.classList.remove('hidden');
  cartOverlay.classList.remove('hidden');
}

function closeCart() {
  cartDrawer.classList.add('hidden');
  cartOverlay.classList.add('hidden');
}

function initCart() {
  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => addToCart(button.dataset.productId));
  });

  document.querySelector('.cart-close').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  document.querySelector('.cart-toggle').addEventListener('click', openCart);
  cartItemsNode.addEventListener('click', (event) => {
    if (event.target.matches('.cart-remove')) {
      removeFromCart(event.target.dataset.productId);
    }
  });

  checkoutButton.addEventListener('click', () => {
    if (Object.keys(cart).length === 0) {
      alert('Your cart is empty. Add a product before checking out.');
      return;
    }
    alert('Checkout is ready to integrate with Stripe or PayPal.\nUse a secure payment gateway to complete purchase.');
  });

  updateCartUI();
}

initCart();

// Feedback form handling
function initFeedbackForm() {
  const feedbackForm = document.getElementById('feedback-form');
  const formMessage = document.getElementById('form-message');

  if (!feedbackForm) return;

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const category = document.getElementById('category').value;
    const message = document.getElementById('message').value.trim();

    // Validate form
    if (!name || !email || !category || !message) {
      showFormMessage('Please fill in all fields.', 'error');
      return;
    }

    // Collect feedback data
    const feedbackData = {
      name,
      email,
      category,
      message,
      timestamp: new Date().toISOString(),
      _replyto: email,
      _subject: 'New feedback from EverRoot Collective website',
    };

    try {
      const response = await fetch('https://formspree.io/f/mjgdedlg', {
        method: 'POST',
        body: JSON.stringify(feedbackData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Formspree request failed (${response.status})`);
      }

      const responseData = await response.json();
      console.log('Formspree response:', responseData);

      // Store in localStorage (for demo purposes)
      const feedbackList = JSON.parse(localStorage.getItem('feedback') || '[]');
      feedbackList.push(feedbackData);
      localStorage.setItem('feedback', JSON.stringify(feedbackList));

      // Show success message
      showFormMessage(
        `Thanks ${name}! Your feedback has been submitted successfully.`,
        'success'
      );

      // Reset form
      feedbackForm.reset();
    } catch (error) {
      console.error('Form submit error:', error);
      showFormMessage(
        'We could not send your feedback right now. Please try again later.',
        'error'
      );
    }
  });
}

function showFormMessage(message, type) {
  const formMessage = document.getElementById('form-message');
  if (!formMessage) return;

  formMessage.textContent = message;
  formMessage.className = `form-message form-message--${type}`;

  // Clear message after 5 seconds
  setTimeout(() => {
    formMessage.textContent = '';
    formMessage.className = 'form-message';
  }, 5000);
}

// Initialize feedback form when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeedbackForm);
} else {
  initFeedbackForm();
}
