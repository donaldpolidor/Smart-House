function generatePDF() {
  const lastOrder = JSON.parse(localStorage.getItem('lastOrder'));
  
  if (!lastOrder) {
    alert('No order details available to download');
    return;
  }

  const pdfContent = createPDFContent(lastOrder);
  
  const options = {
    margin: [10, 15, 10, 15],
    filename: `order-${lastOrder.orderId || 'receipt'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };

  html2pdf().set(options).from(pdfContent).save();
}

function createPDFContent(order) {
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
          line-height: 1.4;
          padding: 10px;
          background: white;
        }
        .container {
          width: 100%;
          max-width: 100%;
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #4CAF50; 
          padding-bottom: 15px; 
          margin-bottom: 20px;
        }
        .header h1 { 
          color: #4CAF50; 
          margin: 5px 0;
          font-size: 24px;
        }
        .header h2 { 
          color: #666;
          margin: 5px 0;
          font-size: 16px;
          font-weight: normal;
        }
        .section { 
          margin-bottom: 15px; 
        }
        .section h3 { 
          color: #4CAF50; 
          border-bottom: 2px solid #4CAF50; 
          padding-bottom: 5px; 
          margin-bottom: 10px;
          font-size: 16px;
        }
        .order-info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 10px; 
          margin-bottom: 15px;
        }
        .info-item { 
          margin-bottom: 5px; 
          font-size: 12px;
        }
        .info-item strong { 
          display: inline-block; 
          width: 100px; 
          color: #555;
        }
        
        /* TABLEAU SIMPLIFIÉ */
        .items-table { 
          width: 100% !important; 
          border-collapse: collapse; 
          margin: 10px 0; 
          font-size: 11px;
        }
        .items-table th { 
          background: #4CAF50; 
          color: white; 
          padding: 6px 3px; 
          text-align: left; 
          font-weight: bold;
        }
        .items-table td { 
          padding: 5px 3px; 
          border-bottom: 1px solid #ddd; 
        }
        .items-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .product-name {
          max-width: 150px;
          word-wrap: break-word;
        }
        
        .totals-container { 
          width: 60%;
          margin: 15px auto 0 auto;
          text-align: center;
          border-top: 3px solid #4CAF50;
          padding-top: 15px;
        }
        .total-line { 
          display: flex;
          justify-content: space-between;
          margin: 8px 0; 
          font-size: 14px;
          padding: 0 10px;
        }
        .grand-total { 
          font-size: 16px; 
          font-weight: bold; 
          border-top: 2px solid #4CAF50; 
          padding-top: 10px; 
          margin-top: 10px; 
        }
        
        .amount {
          font-weight: bold;
        }
        
        .address-section {
          background: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          margin: 10px 0;
          font-size: 12px;
        }
        .address-section p {
          margin: 3px 0;
        }
        .footer { 
          text-align: center; 
          margin-top: 20px; 
          color: #666; 
          font-size: 10px;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .thank-you {
          text-align: center;
          margin: 15px 0;
          font-style: italic;
          color: #4CAF50;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SmartHome</h1>
          <h2>Order Confirmation Receipt</h2>
        </div>
        
        <div class="section">
          <h3>Order Information</h3>
          <div class="order-info-grid">
            <div class="info-item"><strong>Order ID:</strong> ${order.orderId || 'N/A'}</div>
            <div class="info-item"><strong>Order Date:</strong> ${order.date || new Date().toLocaleDateString()}</div>
            <div class="info-item"><strong>Customer Name:</strong> ${order.customerName || 'Customer'}</div>
            <div class="info-item"><strong>Email:</strong> ${order.email || 'N/A'}</div>
          </div>
        </div>
        
        <div class="section">
          <h3>Shipping Address</h3>
          <div class="address-section">
            <p><strong>Address:</strong> ${order.shippingAddress?.street || 'N/A'}</p>
            <p><strong>City:</strong> ${order.shippingAddress?.city || 'N/A'}</p>
            <p><strong>State/ZIP:</strong> ${order.shippingAddress?.state || 'N/A'} ${order.shippingAddress?.zip || ''}</p>
          </div>
        </div>
        
        <div class="section">
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items && order.items.length > 0 ? order.items.map(item => {
                const name = item.Name || item.name || 'Product';
                const quantity = item.Quantity || item.quantity || 1;
                const price = (item.FinalPrice || item.Price || item.price || 0).toFixed(2);
                const total = (price * quantity).toFixed(2);
                
                const displayName = name.length > 30 ? name.substring(0, 30) + '...' : name;
                
                return `
                  <tr>
                    <td class="product-name">${displayName}</td>
                    <td>${quantity}</td>
                    <td class="amount">$${price}</td>
                    <td class="amount">$${total}</td>
                  </tr>
                `;
              }).join('') : '<tr><td colspan="4" style="text-align: center;">No items in order</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>Order Summary</h3>
          <div class="totals-container">
            <div class="total-line">
              <span><strong>Subtotal:</strong></span>
              <span class="amount">$${order.subtotal || '0.00'}</span>
            </div>
            <div class="total-line">
              <span><strong>Tax (6%):</strong></span>
              <span class="amount">$${order.tax || '0.00'}</span>
            </div>
            <div class="total-line">
              <span><strong>Shipping:</strong></span>
              <span class="amount">$${order.shipping || '0.00'}</span>
            </div>
            <div class="total-line grand-total">
              <span><strong>Total Amount:</strong></span>
              <span class="amount">$${order.total || '0.00'}</span>
            </div>
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

export { generatePDF, createPDFContent };