import { getLocalStorage, updateCartCount, loadHeaderFooter } from './utils.mjs';

class Cart {
  constructor() {
    this.cartItems = getLocalStorage('so-cart') || [];
    this.init();
  }

  init() {
    loadHeaderFooter();
    this.displayCartItems();
    this.setupEventListeners();
    updateCartCount();
  }

  displayCartItems() {
    const productList = document.querySelector('.product-list');
    
    if (this.cartItems.length === 0) {
      productList.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
          <a href="/index.html" class="btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    productList.innerHTML = this.cartItems.map(item => `
      <li class="cart-card divider">
        <div class="cart-card__image">
          <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}" 
               onerror="this.src='/images/placeholder.jpg'">
        </div>
        <div class="cart-card__content">
          <h2 class="card__name">${item.name}</h2>
          <p class="cart-card__description">${item.description || ''}</p>
          <p class="cart-card__price">$${(item.price || 0).toFixed(2)} each</p>
          
          <div class="quantity-controls">
            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
            <span class="quantity-display">${item.quantity || 1}</span>
            <button class="quantity-btn increase" data-id="${item.id}">+</button>
          </div>
          
          <p class="item-total">Total: $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </li>
    `).join('');

    this.setupRemoveButtons();
    this.setupQuantityControls();
    this.updateCartTotal();
  }

  setupQuantityControls() {
    const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
    const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
    
    decreaseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        this.updateQuantity(productId, -1);
      });
    });
    
    increaseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        this.updateQuantity(productId, 1);
      });
    });
  }

  updateQuantity(productId, change) {
    const itemIndex = this.cartItems.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      const currentQuantity = this.cartItems[itemIndex].quantity || 1;
      const newQuantity = currentQuantity + change;
      
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.cartItems[itemIndex].quantity = newQuantity;
        localStorage.setItem('so-cart', JSON.stringify(this.cartItems));
        this.displayCartItems();
        updateCartCount();
      }
    }
  }

  setupRemoveButtons() {
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-id');
        this.removeFromCart(productId);
      });
    });
  }

  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    localStorage.setItem('so-cart', JSON.stringify(this.cartItems));
    this.displayCartItems();
    updateCartCount();
  }

  calculateTaxesAndShipping(subtotal) {
    const taxRate = 0.06; 
    const shippingCost = 10.00; 
    
    const tax = subtotal * taxRate;
    const shipping = shippingCost;
    const total = subtotal + tax + shipping;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2)
    };
  }

  // CORRECTION: Synchronized with checkout.js
  updateCartTotal() {
    const subtotal = this.cartItems.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    // Use the SAME calculations
    const totals = this.calculateTaxesAndShipping(subtotal);
    
    const cartActions = document.querySelector('.cart-actions');
    if (cartActions && this.cartItems.length > 0) {
      const existingTotal = document.querySelector('.cart-total');
      if (existingTotal) {
        existingTotal.remove();
      }
      
      const totalElement = document.createElement('div');
      totalElement.className = 'cart-total';
      totalElement.innerHTML = `
        <div class="total-summary">
          <h3>Cart Summary</h3>
          <div class="total-line">
            <span>Subtotal:</span>
            <span>$${totals.subtotal}</span>
          </div>
          <div class="total-line">
            <span>Taxes (6%):</span>
            <span>$${totals.tax}</span>
          </div>
          <div class="total-line">
            <span>Shipping Costs:</span>
            <span>$${totals.shipping}</span>
          </div>
          <div class="total-line grand-total">
            <span>Total:</span>
            <span>$${totals.total}</span>
          </div>
        </div>
      `;
      cartActions.parentNode.insertBefore(totalElement, cartActions);
    }
  }

  setupEventListeners() {
    const checkoutBtn = document.querySelector('.btn-primary');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        if (this.cartItems.length === 0) {
          e.preventDefault();
          alert('Your cart is empty');
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Cart();
});