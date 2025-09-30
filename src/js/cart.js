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
      productList.innerHTML = '<p>Your cart is empty</p>';
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
          <p class="cart-card__quantity">Quantity: ${item.quantity || 1}</p>
          <p class="cart-card__price">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
          <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </li>
    `).join('');

    this.setupRemoveButtons();
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