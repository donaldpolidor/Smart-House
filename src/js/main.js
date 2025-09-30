import ProductData from './ProductData.mjs';
import { updateCartCount, addProductToCart, getLocalStorage, setLocalStorage } from './utils.mjs';
import ImageModal from './ImageModal.mjs';

class ProductCatalog {
  constructor() {
    this.dataSource = new ProductData();
    this.currentCategory = 'kitchen';
    this.imageModal = new ImageModal();
    this.init();
  }

  async init() {
    await this.loadProducts('kitchen');
    this.setupEventListeners();
    updateCartCount();
    
    // Activer les previews d'images
    this.imageModal.attachToProductImages();
  }

  async loadProducts(category) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

    try {
      const products = await this.dataSource.getData(category);
      
      if (products.length === 0 && category !== 'kitchen') {
        this.displayComingSoon(category);
      } else {
        this.displayProducts(products);
        // Réattacher les événements de preview après le chargement
        setTimeout(() => {
          this.imageModal.attachToProductImages();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      productsGrid.innerHTML = '<div class="loading">Error loading products. Please try again.</div>';
    }
  }

  displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
      productsGrid.innerHTML = '<div class="loading">No products found in this category.</div>';
      return;
    }

    productsGrid.innerHTML = products.map(product => `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-image" 
             onerror="this.src='/images/placeholder.jpg'"
             loading="lazy"
             data-product-id="${product.id}">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-features">
          ${product.features ? product.features.slice(0, 3).map(feature => 
            `<span class="feature-tag">${feature}</span>`
          ).join('') : ''}
        </div>
        <div class="product-rating">
          ${this.generateStarRating(product.rating || 4.0)}
          <span class="rating-value">${(product.rating || 4.0).toFixed(1)}</span>
        </div>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        ${product.inStock ? 
          `<button class="add-to-cart-btn" data-id="${product.id}">
            Add to Cart
          </button>` : 
          `<p class="out-of-stock">Out of Stock</p>`
        }
      </div>
    `).join('');

    this.setupAddToCartButtons();
  }

  generateStarRating(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    
    if (hasHalfStar) {
      stars.push('✨');
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }
    
    return stars.join('');
  }

  displayComingSoon(category) {
    const productsGrid = document.getElementById('products-grid');
    const categoryName = this.getCategoryName(category);
    
    productsGrid.innerHTML = `
      <div class="coming-soon">
        <h3>${categoryName} Products Coming Soon!</h3>
        <p>We're working on adding amazing ${categoryName.toLowerCase()} products to our catalog.</p>
        <p>In the meantime, check out our kitchen products!</p>
      </div>
    `;
  }

  getCategoryName(categoryId) {
    const categories = {
      'kitchen': 'Kitchen',
      'bathroom': 'Bathroom',
      'cleaning': 'Cleaning',
      'decoration': 'Decoration'
    };
    return categories[categoryId] || categoryId;
  }

  setupAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const productId = e.target.getAttribute('data-id');
        await this.addToCart(productId);
      });
    });
  }

  async addToCart(productId) {
    try {
      const product = await this.dataSource.getProductById(productId);
      if (product && product.inStock) {
        const success = addProductToCart(product);
        if (success) {
          updateCartCount();
          this.showNotification('Product added to cart!');
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error adding product to cart');
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 1rem 2rem;
      border-radius: 5px;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  setupEventListeners() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.getAttribute('data-category');
        this.currentCategory = category;
        this.loadProducts(category);
      });
    });

    document.querySelector('.cart-section').addEventListener('click', () => {
      window.location.href = '/cart/index.html';
    });

    // Navigation au clavier pour les images
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('product-image')) {
          this.imageModal.openModal(focusedElement);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProductCatalog();
});