import ProductData from './ProductData.mjs';
import { updateCartCount, addProductToCart, getLocalStorage, setLocalStorage } from './utils.mjs';
import ImageModal from './ImageModal.mjs';

class ProductCatalog {
  constructor() {
    this.dataSource = new ProductData();
    this.currentCategory = 'kitchen';
    this.imageModal = new ImageModal();
    this.productsData = []; // Store product data
    this.allProducts = []; // Store all products for search functionality
    this.isSearching = false;
    this.init();
  }

  async init() {
    await this.loadAllProducts(); // Load all products for search
    await this.loadProducts('kitchen');
    this.setupEventListeners();
    updateCartCount();
    
    // Enable image previews
    setTimeout(() => {
      this.attachImagePreviews();
    }, 200);
  }

  async loadAllProducts() {
    try {
      const categories = ['kitchen', 'bathroom', 'cleaning', 'decoration'];
      this.allProducts = [];
      
      for (const category of categories) {
        const products = await this.dataSource.getData(category);
        this.allProducts = this.allProducts.concat(products);
      }
      console.log(`Loaded ${this.allProducts.length} products for search`);
    } catch (error) {
      console.error('Error loading all products for search:', error);
    }
  }

  async loadProducts(category) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

    try {
      const products = await this.dataSource.getData(category);
      this.productsData = products; // Save data
      
      if (products.length === 0 && category !== 'kitchen') {
        this.displayComingSoon(category);
      } else {
        this.displayProducts(products);
        // Reattach preview events after loading
        setTimeout(() => {
          this.attachImagePreviews();
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
        ${product.isNew ? '<span class="new-badge">NEW</span>' : ''}
        ${product.onSale ? '<span class="promo-badge">SALE</span>' : ''}
        ${!product.inStock ? '<span class="out-of-stock">Out of Stock</span>' : ''}
        
        <img src="${product.image}" alt="${product.name}" class="product-image" 
             onerror="this.src='/images/placeholder.jpg'"
             loading="lazy"
             data-product-id="${product.id}"
             tabindex="0"
             role="button"
             aria-label="Click to preview ${product.name}">
        
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
        
        ${product.onSale ? `
          <div class="product-price">
            <span class="discount-price">$${(product.price * 0.8).toFixed(2)}</span>
            <span class="original-price">$${product.price.toFixed(2)}</span>
          </div>
          <div class="stock-alert">Limited Time Offer!</div>
        ` : `
          <p class="product-price">$${product.price.toFixed(2)}</p>
        `}
        
        ${product.inStock ? 
          `<button class="add-to-cart-btn ${product.onSale ? 'btn-accent' : ''}" data-id="${product.id}">
            ${product.onSale ? 'Buy Now - 20% OFF' : 'Add to Cart'}
          </button>` : 
          `<p class="out-of-stock">Out of Stock</p>`
        }
      </div>
    `).join('');

    this.setupAddToCartButtons();
  }

  // NEW METHOD: Product search
  searchProducts(searchTerm) {
    const productsGrid = document.getElementById('products-grid');
    
    if (!searchTerm.trim()) {
      // If search is empty, return to current category products
      this.isSearching = false;
      this.loadProducts(this.currentCategory);
      return;
    }

    this.isSearching = true;
    
    // Filter products based on search term
    const filteredProducts = this.allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.features && product.features.some(feature => 
        feature.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );

    if (filteredProducts.length > 0) {
      // Display found products
      this.displaySearchResults(filteredProducts, searchTerm);
    } else {
      // No products found
      this.displayNoResults(searchTerm);
    }
  }

  displaySearchResults(products, searchTerm) {
    const productsGrid = document.getElementById('products-grid');
    
    productsGrid.innerHTML = `
      <div class="search-results-header">
        <h3>Search Results for "${searchTerm}"</h3>
        <p>Found ${products.length} product(s)</p>
        <button class="btn-secondary clear-search-btn">Clear Search</button>
      </div>
      ${products.map(product => `
        <div class="product-card" data-id="${product.id}">
          ${product.isNew ? '<span class="new-badge">NEW</span>' : ''}
          ${product.onSale ? '<span class="promo-badge">SALE</span>' : ''}
          ${!product.inStock ? '<span class="out-of-stock">Out of Stock</span>' : ''}
          
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
          
          ${product.onSale ? `
            <div class="product-price">
              <span class="discount-price">$${(product.price * 0.8).toFixed(2)}</span>
              <span class="original-price">$${product.price.toFixed(2)}</span>
            </div>
            <div class="stock-alert">Limited Time Offer!</div>
          ` : `
            <p class="product-price">$${product.price.toFixed(2)}</p>
          `}
          
          ${product.inStock ? 
            `<button class="add-to-cart-btn ${product.onSale ? 'btn-accent' : ''}" data-id="${product.id}">
              ${product.onSale ? 'Buy Now - 20% OFF' : 'Add to Cart'}
            </button>` : 
            `<p class="out-of-stock">Out of Stock</p>`
          }
        </div>
      `).join('')}
    `;

    this.setupAddToCartButtons();
    this.setupClearSearchButton();
    this.attachImagePreviews();
  }

  displayNoResults(searchTerm) {
    const productsGrid = document.getElementById('products-grid');
    
    productsGrid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>No products found for "${searchTerm}"</h3>
        <p>This item is not yet available.</p>
        <div class="suggestions">
          <p>Suggestions:</p>
          <ul>
            <li>Check the spelling</li>
            <li>Try more general keywords</li>
            <li>Browse by category</li>
          </ul>
        </div>
        <button class="btn-primary clear-search-btn">Back to Catalog</button>
      </div>
    `;

    this.setupClearSearchButton();
  }

  setupClearSearchButton() {
    const clearButtons = document.querySelectorAll('.clear-search-btn');
    clearButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.clearSearch();
      });
    });
  }

  clearSearch() {
    const searchInput = document.querySelector('.search-input');
    searchInput.value = '';
    this.isSearching = false;
    this.loadProducts(this.currentCategory);
  }

  // NEW METHOD: Attach image previews
  attachImagePreviews() {
    const productImages = document.querySelectorAll('.product-image');
    
    productImages.forEach(img => {
      // Remove existing listeners to avoid duplicates
      const newImg = img.cloneNode(true);
      img.parentNode.replaceChild(newImg, img);
      
      // Find corresponding product
      const productId = newImg.getAttribute('data-product-id');
      const product = this.allProducts.find(p => p.id === productId);
      
      if (product) {
        // Add event listeners
        newImg.addEventListener('click', () => {
          this.imageModal.openModal(newImg, product);
        });
        
        newImg.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.imageModal.openModal(newImg, product);
          }
        });
        
        // Style to indicate it's clickable
        newImg.style.cursor = 'zoom-in';
        newImg.style.transition = 'transform 0.2s ease';
        
        newImg.addEventListener('mouseenter', () => {
          newImg.style.transform = 'scale(1.02)';
        });
        
        newImg.addEventListener('mouseleave', () => {
          newImg.style.transform = 'scale(1)';
        });
      }
    });
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
        if (this.isSearching) {
          this.clearSearch();
        }
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.getAttribute('data-category');
        this.currentCategory = category;
        this.loadProducts(category);
      });
    });

    // Search events
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    // Search on button click
    searchBtn.addEventListener('click', () => {
      const searchTerm = searchInput.value.trim();
      this.searchProducts(searchTerm);
    });

    // Search with Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        this.searchProducts(searchTerm);
      }
    });

    document.querySelector('.cart-section').addEventListener('click', () => {
      window.location.href = '/cart/index.html';
    });

    // Keyboard navigation for images
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('product-image')) {
          const productId = focusedElement.getAttribute('data-product-id');
          const product = this.allProducts.find(p => p.id === productId);
          if (product) {
            this.imageModal.openModal(focusedElement, product);
          }
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProductCatalog();
});