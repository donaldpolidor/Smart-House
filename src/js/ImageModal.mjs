export default class ImageModal {
  constructor() {
    this.modal = null;
    this.modalImg = null;
    this.captionText = null;
    this.init();
  }

  init() {
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    // Vérifier si la modal existe déjà
    if (document.getElementById('imageModal')) {
      this.modal = document.getElementById('imageModal');
      this.modalImg = document.getElementById('modalImage');
      this.captionText = document.getElementById('modalCaption');
      return;
    }

    const modalHTML = `
      <div id="imageModal" class="image-modal">
        <span class="close-modal">&times;</span>
        <div class="modal-content">
          <img class="modal-image" id="modalImage">
          <div class="modal-caption" id="modalCaption"></div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    this.modal = document.getElementById('imageModal');
    this.modalImg = document.getElementById('modalImage');
    this.captionText = document.getElementById('modalCaption');
  }

  setupEventListeners() {
    const closeBtn = document.querySelector('.close-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal && this.modal.style.display === 'block') {
        this.closeModal();
      }
    });
  }

  openModal(imgElement) {
    if (!this.modal || !this.modalImg) {
      this.init();
    }
    
    this.modal.style.display = 'block';
    this.modalImg.src = imgElement.src;
    this.captionText.textContent = imgElement.alt || 'Product Image';
    
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
    document.body.style.overflow = 'auto';
  }

  attachToProductImages() {
    const productImages = document.querySelectorAll('.product-image, .product-detail-image');
    
    productImages.forEach(img => {
      img.style.cursor = 'zoom-in';
      
      // Remove existing listeners to avoid duplicates
      img.replaceWith(img.cloneNode(true));
      const newImg = document.querySelector(`[src="${img.src}"]`);
      
      if (newImg) {
        newImg.addEventListener('click', () => {
          this.openModal(newImg);
        });
        
        newImg.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.openModal(newImg);
          }
        });
        
        newImg.setAttribute('tabindex', '0');
        newImg.setAttribute('role', 'button');
        newImg.setAttribute('aria-label', `Zoom on ${newImg.alt || 'product image'}`);
      }
    });
  }
}