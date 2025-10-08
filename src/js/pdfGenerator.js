// pdfGenerator.js - Gestion de la génération de PDF
function generatePDF() {
  const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
  
  if (!lastOrder) {
    alert('No order details available to download');
    return;
  }

  // Créer le contenu HTML pour le PDF
  const pdfContent = createPDFContent(lastOrder);
  
  // Options pour html2pdf - format amélioré avec plus d'espace
  const options = {
    margin: [10, 15, 10, 15], // [top, left, bottom, right] - plus d'espace
    filename: `order-${lastOrder.orderId || 'receipt'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0 // Important pour éviter le décalage
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  // Générer le PDF
  html2pdf().set(options).from(pdfContent).save();
}

function createPDFContent(order) {
  // Calculer la hauteur nécessaire pour les articles
  const itemsCount = order.items ? order.items.length : 0;
  const needsCompactView = itemsCount > 8; // Si plus de 8 articles, vue compacte

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body { 
          font-family: 'Arial', sans-serif; 
          color: #333;
          line-height: 1.3;
          padding: 5px;
          margin: 0;
          background: white;
        }
        .container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #4CAF50; 
          padding-bottom: 10px; 
          margin-bottom: 15px;
        }
        .header h1 { 
          color: #4CAF50; 
          margin: 3px 0;
          font-size: 22px;
        }
        .header h2 { 
          color: #666;
          margin: 3px 0;
          font-size: 16px;
          font-weight: normal;
        }
        .section { 
          margin-bottom: 12px; 
        }
        .section h3 { 
          color: #4CAF50; 
          border-bottom: 1px solid #ddd; 
          padding-bottom: 4px; 
          margin-bottom: 8px;
          font-size: 14px;
        }
        .order-info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 6px; 
          margin-bottom: 10px;
        }
        .info-item { 
          margin-bottom: 4px; 
          font-size: 10px;
        }
        .info-item strong { 
          display: inline-block; 
          width: 90px; 
          color: #555;
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 8px 0; 
          font-size: ${needsCompactView ? '9px' : '10px'};
          page-break-inside: avoid;
        }
        .items-table th { 
          background: #4CAF50; 
          color: white; 
          padding: 6px 4px; 
          text-align: left; 
          font-weight: bold;
          font-size: ${needsCompactView ? '9px' : '10px'};
        }
        .items-table td { 
          padding: 4px; 
          border-bottom: 1px solid #ddd; 
          vertical-align: top;
        }
        .items-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .product-name {
          max-width: 120px;
          word-wrap: break-word;
        }
        .totals-container { 
          margin-top: 12px; 
          text-align: right;
          border-top: 2px solid #4CAF50;
          padding-top: 8px;
        }
        .total-line { 
          margin: 3px 0; 
          font-size: 11px;
        }
        .grand-total { 
          font-size: 12px; 
          font-weight: bold; 
          border-top: 1px solid #4CAF50; 
          padding-top: 6px; 
          margin-top: 6px; 
        }
        .address-section {
          background: #f8f9fa;
          padding: 8px;
          border-radius: 4px;
          margin: 8px 0;
          font-size: 10px;
        }
        .address-section p {
          margin: 2px 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 15px; 
          color: #666; 
          font-size: 9px;
          border-top: 1px solid #ddd;
          padding-top: 8px;
        }
        .thank-you {
          text-align: center;
          margin: 10px 0;
          font-style: italic;
          color: #4CAF50;
          font-size: 11px;
        }
        
        /* Styles pour éviter les coupures */
        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .keep-together {
          page-break-inside: avoid;
        }

        /* Assurer que le contenu ne dépasse pas */
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .container {
            max-width: 100%;
            margin: 0;
          }
          .items-table {
            font-size: 9px !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartHome</h1>
          <h2>Order Confirmation Receipt</h2>
        </div>
        
        <div class="section no-break">
          <h3>Order Information</h3>
          <div class="order-info-grid">
            <div class="info-item"><strong>Order ID:</strong> ${order.orderId || 'N/A'}</div>
            <div class="info-item"><strong>Order Date:</strong> ${order.date || new Date().toLocaleDateString()}</div>
            <div class="info-item"><strong>Customer Name:</strong> ${order.customerName || 'Customer'}</div>
            <div class="info-item"><strong>Email:</strong> ${order.email || 'N/A'}</div>
          </div>
        </div>
        
        <div class="section no-break">
          <h3>Shipping Address</h3>
          <div class="address-section">
            <p><strong>Address:</strong> ${order.shippingAddress?.street || 'N/A'}</p>
            <p><strong>City:</strong> ${order.shippingAddress?.city || 'N/A'}</p>
            <p><strong>State/ZIP:</strong> ${order.shippingAddress?.state || 'N/A'} ${order.shippingAddress?.zip || ''}</p>
          </div>
        </div>
        
        <div class="section keep-together">
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%">Product Name</th>
                <th style="width: 15%">Qty</th>
                <th style="width: 20%">Unit Price</th>
                <th style="width: 15%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items && order.items.length > 0 ? order.items.map(item => {
                const name = item.Name || item.name || 'Product';
                const quantity = item.Quantity || item.quantity || 1;
                const price = (item.FinalPrice || item.Price || item.price || 0).toFixed(2);
                const total = (price * quantity).toFixed(2);
                
                // Nom du produit adaptatif
                const displayName = name.length > 40 ? name.substring(0, 40) + '...' : name;
                
                return `
                  <tr>
                    <td class="product-name">${displayName}</td>
                    <td>${quantity}</td>
                    <td>$${price}</td>
                    <td>$${total}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="4" style="text-align: center;">No items in order</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <div class="section no-break">
          <h3>Order Summary</h3>
          <div class="totals-container">
            <div class="total-line"><strong>Subtotal:</strong> $${order.subtotal || '0.00'}</div>
            <div class="total-line"><strong>Tax (6%):</strong> $${order.tax || '0.00'}</div>
            <div class="total-line"><strong>Shipping:</strong> $${order.shipping || '0.00'}</div>
            <div class="total-line grand-total"><strong>Total Amount:</strong> $${order.total || '0.00'}</div>
          </div>
        </div>
        
        <div class="thank-you">
          Thank you for your purchase! We appreciate your business.
        </div>
        
        <div class="footer">
          <p><strong>SmartHome - Your Smart Living Partner</strong></p>
          <p>Contact: support@smarthome.com | Website: www.smarthome.com</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Exporter les fonctions
export { generatePDF, createPDFContent };