import CheckoutProcess from './CheckoutProcess.mjs';
import { loadHeaderFooter, alertMessage } from './utils.mjs';

loadHeaderFooter();

const checkout = new CheckoutProcess('so-cart', '.order-totals');
checkout.init();

document.getElementById('zip')?.addEventListener('input', () => {
  checkout.calculateOrderTotal();
});

// Confirmation modal management
function setupConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  const closeBtn = document.querySelector('.close-modal');
  const confirmNoBtn = document.getElementById('confirm-no');
  
  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  confirmNoBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

// Calculate taxes and fees
function calculateTaxesAndShipping(subtotal) {
  const taxRate = 0.06; // 6%
  const shippingCost = 10.00; // Fixed shipping costs
  
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

// Display the confirmation modal
function showConfirmationModal(orderDetails) {
  const modal = document.getElementById('confirmation-modal');
  const reviewItems = document.getElementById('order-review-items');
  const reviewTotal = document.getElementById('review-total');
  
  // Calculate subtotal
  const subtotal = checkout.list.reduce((sum, item) => {
    const price = item.FinalPrice || item.Price || item.price || 0;
    const quantity = item.Quantity || item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  // Calculate taxes and fees
  const totals = calculateTaxesAndShipping(subtotal);
  
  // Display items in cart
  let itemsHTML = '';
  if (checkout.list && checkout.list.length > 0) {
    checkout.list.forEach(item => {
      const name = item.Name || item.name || 'Product';
      const quantity = item.Quantity || item.quantity || 1;
      const price = item.FinalPrice || item.Price || item.price || 0;
      const total = (price * quantity).toFixed(2);
      
      itemsHTML += `
        <div class="review-item">
          <span class="review-item-name">${name}</span>
          <span class="review-item-quantity">Qty: ${quantity}</span>
          <span class="review-item-price">$${total}</span>
        </div>
      `;
    });
    
    // Add details of taxes and fees
    itemsHTML += `
      <div class="review-summary">
        <div class="review-summary-line">
          <span>Subtotal:</span>
          <span>$${totals.subtotal}</span>
        </div>
        <div class="review-summary-line">
          <span>Tax (6%):</span>
          <span>$${totals.tax}</span>
        </div>
        <div class="review-summary-line">
          <span>Shipping:</span>
          <span>$${totals.shipping}</span>
        </div>
        <div class="review-summary-line grand-total">
          <span><strong>Total:</strong></span>
          <span><strong>$${totals.total}</strong></span>
        </div>
      </div>
    `;
  }
  
  reviewItems.innerHTML = itemsHTML;
  reviewTotal.textContent = totals.total;
  modal.style.display = 'block';
  
  setupConfirmYesButton(orderDetails, totals);
}

// Configure the confirmation button
function setupConfirmYesButton(orderDetails, totals) {
  const confirmYesBtn = document.getElementById('confirm-yes');
  
  confirmYesBtn.onclick = async () => {
    const modal = document.getElementById('confirmation-modal');
    const button = confirmYesBtn;
    
    button.disabled = true;
    button.textContent = 'Processing payment...';
    
    try {
      // Update the total in checkout before processing
      checkout.orderTotal = parseFloat(totals.total);
      
      const result = await checkout.checkout(orderDetails.formData);
      
      // Save data for the success page
      localStorage.setItem('lastOrder', JSON.stringify({
        orderId: result.orderId,
        total: totals.total,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        date: new Date().toLocaleDateString(),
        items: checkout.list,
        customerName: orderDetails.customerName,
        email: orderDetails.customerEmail,
        shippingAddress: orderDetails.shippingAddress
      }));
      
      localStorage.removeItem('so-cart');
      
      // Redirect to the success page
      window.location.href = '/checkout/success.html';
      
    } catch (error) {
      console.error('Error:', error);
      alertMessage('Error processing your order. Please try again.', true);
      button.disabled = false;
      button.textContent = 'Yes, Confirm Purchase';
    }
  };
}

// Update the shopping cart display
function updateCartSummary() {
  const subtotal = checkout.list.reduce((sum, item) => {
    const price = item.FinalPrice || item.Price || item.price || 0;
    const quantity = item.Quantity || item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  const totals = calculateTaxesAndShipping(subtotal);
  
  // Update display
  document.getElementById('item-total').textContent = `$${totals.subtotal}`;
  document.getElementById('tax').textContent = `$${totals.tax}`;
  document.getElementById('shipping').textContent = `$${totals.shipping}`;
  document.getElementById('order-total').textContent = `$${totals.total}`;
}

// Script to improve the user experience of the form
document.addEventListener('DOMContentLoaded', function() {
  // Automatic formatting of the card number
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = '';
      
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      e.target.value = formattedValue;
    });
  }
  
  // Automatic formatting of the expiration date
  const expirationInput = document.getElementById('expiration');
  if (expirationInput) {
    expirationInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length >= 2) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
      } else {
        e.target.value = value;
      }
    });
  }
  
  // Real-time validation
  const form = document.getElementById('checkout-form');
  if (form) {
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });
      
      input.addEventListener('input', function() {
        if (this.value) {
          validateField(this);
        }
      });
    });
  }
  
  function validateField(field) {
    if (field.validity.valid) {
      field.classList.add('valid');
      field.classList.remove('invalid');
    } else {
      field.classList.add('invalid');
      field.classList.remove('valid');
    }
  }
  
  // Update the shopping cart summary when loading
  updateCartSummary();
  
  // Initialize the modal
  setupConfirmationModal();
});

function validatePaymentFields() {
  const cardNumber = document.getElementById('cardNumber').value;
  const expiration = document.getElementById('expiration').value;
  const securityCode = document.getElementById('code').value;
  const email = document.getElementById('email').value;

  // Simple email verification
  if (!email || !email.includes('@') || !email.includes('.')) {
    alertMessage('Please enter a valid email address', true);
    return false;
  }

  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cleanCardNumber)) {
    alertMessage('Credit card number must be 16 digits', true);
    return false;
  }

  if (!/^\d{2}\/\d{2}$/.test(expiration)) {
    alertMessage('Expiration date must be in MM/YY format', true);
    return false;
  }

  const [month, year] = expiration.split('/');
  const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const currentDate = new Date();
  
  if (expDate < currentDate) {
    alertMessage('Expiration date must be in the future or current month', true);
    return false;
  }

  if (!/^\d{3,4}$/.test(securityCode)) {
    alertMessage('Security code must be 3 or 4 digits', true);
    return false;
  }

  return true;
}

// Main form submission handler
document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  if (!validatePaymentFields()) {
    return;
  }

  if (checkout.list.length === 0) {
    alertMessage('Your cart is empty', true);
    return;
  }

  const orderDetails = {
    customerName: `${formData.get('fname')} ${formData.get('lname')}`,
    customerEmail: formData.get('email'),
    shippingAddress: {
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip: formData.get('zip')
    },
    formData: form
  };

  showConfirmationModal(orderDetails);
});