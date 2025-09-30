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
    // Fermer la modal
    document.querySelector('.close-modal').addEventListener('click', () => {
      this.closeModal();
    });

    // Fermer en cliquant à l'extérieur
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Fermer avec la touche Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display === 'block') {
        this.closeModal();
      }
    });
  }

  openModal(imgElement) {
    this.modal.style.display = 'block';
    this.modalImg.src = imgElement.src;
    this.captionText.textContent = imgElement.alt || 'Product Image';
    
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  // Méthode pour attacher les événements aux images produits
  attachToProductImages() {
    const productImages = document.querySelectorAll('.product-image, .product-detail-image');
    
    productImages.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        this.openModal(img);
      });
      
      // Ajouter aussi la possibilité de zoom avec la touche Entrée
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.openModal(img);
        }
      });
      
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', `Zoom sur ${img.alt || 'image du produit'}`);
    });
  }
}