import CheckoutProcess from './CheckoutProcess.mjs';
import { loadHeaderFooter, alertMessage } from './utils.mjs';

loadHeaderFooter();

const checkout = new CheckoutProcess('so-cart', '.order-totals');
checkout.init();

document.getElementById('zip')?.addEventListener('input', () => {
  checkout.calculateOrderTotal();
});

function validatePaymentFields() {
  const cardNumber = document.getElementById('cardNumber').value;
  const expiration = document.getElementById('expiration').value;
  const securityCode = document.getElementById('code').value;

  if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
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

  if (securityCode !== '123') {
    alertMessage('Invalid security code', true);
    return false;
  }

  return true;
}

document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  
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

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Processing...';

  try {
    const result = await checkout.checkout(form);
    
    localStorage.setItem('lastOrder', JSON.stringify({
      orderId: result.orderId,
      total: checkout.orderTotal.toFixed(2),
      date: new Date().toLocaleDateString()
    }));
    
    localStorage.removeItem('so-cart');
    window.location.href = '/checkout/success.html';
    
  } catch (error) {
    alertMessage('Error processing your order. Please try again.', true);
    button.disabled = false;
    button.textContent = 'Payment';
  }
});