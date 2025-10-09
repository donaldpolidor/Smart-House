import { loadHeaderFooter } from './utils.mjs';
import { generatePDF } from './pdfGenerator.js';

document.addEventListener('DOMContentLoaded', function() {
  loadHeaderFooter();
  displayOrderDetails();
  setupPDFDownload();
});

function displayOrderDetails() {
  const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
  
  if (lastOrder) {
    // Show order details
    document.getElementById('order-id').textContent = lastOrder.orderId || 'N/A';
    document.getElementById('order-date').textContent = lastOrder.date || new Date().toLocaleDateString();
    document.getElementById('order-total').textContent = `$${lastOrder.total || '0.00'}`;
    document.getElementById('order-subtotal').textContent = `$${lastOrder.subtotal || '0.00'}`;
    document.getElementById('order-tax').textContent = `$${lastOrder.tax || '0.00'}`;
    document.getElementById('order-shipping').textContent = `$${lastOrder.shipping || '0.00'}`;
    document.getElementById('customer-name').textContent = lastOrder.customerName || 'Customer';
    
    // Display articles
    const itemsContainer = document.getElementById('order-items');
    if (lastOrder.items && lastOrder.items.length > 0) {
      itemsContainer.innerHTML = lastOrder.items.map(item => {
        const name = item.Name || item.name || 'Product';
        const quantity = item.Quantity || item.quantity || 1;
        const price = item.FinalPrice || item.Price || item.price || 0;
        const total = (price * quantity).toFixed(2);
        
        return `
          <div class="order-item">
            <span class="item-name">${name}</span>
            <span class="item-quantity">Qty: ${quantity}</span>
            <span class="item-price">$${total}</span>
          </div>
        `;
      }).join('');
    } else {
      itemsContainer.innerHTML = '<div class="order-item">No items found</div>';
    }
    
    // Display the delivery address
    const addressContainer = document.getElementById('shipping-address');
    if (lastOrder.shippingAddress) {
      addressContainer.innerHTML = `
        <p>${lastOrder.shippingAddress.street || ''}</p>
        <p>${lastOrder.shippingAddress.city || ''}, ${lastOrder.shippingAddress.state || ''} ${lastOrder.shippingAddress.zip || ''}</p>
      `;
    }
  } else {
    // No orders found
    document.getElementById('order-id').textContent = 'N/A';
    document.getElementById('order-date').textContent = new Date().toLocaleDateString();
    document.getElementById('order-total').textContent = '$0.00';
    document.getElementById('order-subtotal').textContent = '$0.00';
    document.getElementById('order-tax').textContent = '$0.00';
    document.getElementById('order-shipping').textContent = '$0.00';
    document.getElementById('customer-name').textContent = 'Customer';
    document.getElementById('order-items').innerHTML = '<div class="order-item">No order details available</div>';
  }
}

function setupPDFDownload() {
  const downloadBtn = document.getElementById('download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', generatePDF);
  }
}