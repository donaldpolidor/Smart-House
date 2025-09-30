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
             loading="lazy">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-features">
          ${product.features ? product.features.slice(0, 2).map(feature => 
            `<span class="feature-tag">${feature}</span>`
          ).join('') : ''}
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

  // ... (le reste du code reste identique)
}

document.addEventListener('DOMContentLoaded', () => {
  new ProductCatalog();
});