// contact.js - Gestion du formulaire de contact avec animation de dépliage
class ContactManager {
    constructor() {
        this.toggleBtn = document.getElementById('contactToggle');
        this.dropdown = document.getElementById('contactDropdown');
        this.form = document.getElementById('contactForm');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (this.toggleBtn && this.dropdown) {
            this.setupToggle();
        } else {
            console.warn('Contact toggle elements not found');
        }

        if (this.form) {
            this.setupForm();
        }
    }

    setupToggle() {
        this.toggleBtn.addEventListener('click', () => {
            this.toggleDropdown();
        });

        // Fermer en cliquant en dehors
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.toggleBtn.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Fermer avec la touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.isOpen = true;
        this.toggleBtn.classList.add('active');
        this.dropdown.classList.add('active');
        
        // Animation d'ouverture
        this.dropdown.style.display = 'block';
        setTimeout(() => {
            this.dropdown.style.overflow = 'visible';
        }, 500);
    }

    closeDropdown() {
        this.isOpen = false;
        this.toggleBtn.classList.remove('active');
        this.dropdown.classList.remove('active');
        
        // Réinitialiser pour l'animation
        setTimeout(() => {
            this.dropdown.style.overflow = 'hidden';
        }, 300);
    }

    setupForm() {
        this.form.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });

        // Validation en temps réel
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            this.sendMessage();
        }
    }

    validateForm() {
        let isValid = true;
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        this.clearFieldError(field);

        if (field.type === 'email') {
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!this.isValidEmail(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
        } else if (field.type === 'text' || field.tagName === 'TEXTAREA') {
            if (!value) {
                errorMessage = 'This field is required';
                isValid = false;
            } else if (field.id === 'name' && value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.showFieldSuccess(field);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.animation = 'shake 0.5s ease';
    }

    showFieldSuccess(field) {
        field.classList.remove('error');
        field.classList.add('success');
        
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearFieldError(field) {
        field.classList.remove('error', 'success');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    sendMessage() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        const mailtoLink = `mailto:donaldpolidor30@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`)}`;
        
        this.showNotification('Opening your email client... Please send the message to contact us.');
        
        setTimeout(() => {
            window.location.href = mailtoLink;
        }, 1000);
        
        this.resetForm();
    }

    resetForm() {
        this.form.reset();
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            this.clearFieldError(input);
        });
    }

    showNotification(message) {
        const existingNotification = document.querySelector('.contact-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'contact-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Initialiser le gestionnaire de contact
document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
});

// Ajouter l'animation shake pour les erreurs
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .form-group input.error,
    .form-group textarea.error {
        border-color: #ff4444 !important;
        background-color: #fff5f5;
        animation: shake 0.5s ease;
    }
    
    .form-group input.success,
    .form-group textarea.success {
        border-color: #4CAF50 !important;
        background-color: #f5fff5;
    }
    
    .error-message {
        color: #ff4444;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);