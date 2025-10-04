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
          
          <!-- Contrôle de quantité -->
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
        // Si la quantité devient 0 ou moins, supprimer l'article
        this.removeFromCart(productId);
      } else {
        // Mettre à jour la quantité
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

  updateCartTotal() {
    const total = this.cartItems.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 1));
    }, 0);
    
    // Optionnel: Afficher le total général du panier
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
          <p>Subtotal: $${total.toFixed(2)}</p>
          <p>Shipping: $0.00</p>
          <p class="grand-total">Total: $${total.toFixed(2)}</p>
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