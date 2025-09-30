import { loadHeaderFooter } from './utils.mjs';

document.addEventListener('DOMContentLoaded', function() {
  loadHeaderFooter();
  displayOrderDetails();
});

function displayOrderDetails() {
  const orderDetails = JSON.parse(localStorage.getItem('lastOrder')) || {};
  
  document.getElementById('order-id').textContent = orderDetails.orderId || 'N/A';
  document.getElementById('order-date').textContent = orderDetails.date || new Date().toLocaleDateString();
  document.getElementById('order-total').textContent = `$${orderDetails.total || '0.00'}`;
}