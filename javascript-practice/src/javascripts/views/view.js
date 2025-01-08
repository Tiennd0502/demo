import Templates from '../templates/templates.js';

class InvoiceView {
  constructor() {
    this.invoiceList = document.querySelector('.table__body');
    this.previewSection = document.querySelector('.preview');
  }

  renderInvoiceList(invoices) {
    this.invoiceList.innerHTML = invoices
      .map((invoice) => {
        return Templates.invoiceTemplate
          .replace(/{{id}}/g, invoice.id)
          .replace(/{{name}}/g, invoice.name)
          .replace(/{{email}}/g, invoice.email)
          .replace(/{{date}}/g, invoice.date)
          .replace(/{{status}}/g, invoice.status)
          .replace(/{{statusLower}}/g, invoice.status.toLowerCase());
      })
      .join('');
  }

  renderInvoicePreview(invoice) {
    this.previewSection.querySelector('.preview__invoice-label--id').innerHTML = `Invoice No: <br/>
      <span>${invoice.id}</span>`;
    this.previewSection.querySelector('.preview-company__email .email-address').innerHTML =
      invoice.email;

    this.previewSection.querySelector('.preview__invoice .recipient__name').innerHTML =
      invoice.name;
    this.previewSection.querySelector('.preview__invoice .recipient__address').innerHTML =
      invoice.address;
    this.previewSection.querySelector('.preview__invoice-label--date').innerHTML =
      `Invoice Date: <br/>
      <span>${invoice.date}</span>`;

    const previewTbody = this.previewSection.querySelector('tbody');
    previewTbody.innerHTML = ''; // Clear previous rows
    const productRows = invoice.products
      .map(
        (product) => `
        <tr class="preview-table__row">
          <td class="product-list__cell">${product.name}</td>
          <td class="product-list__cell">${product.rate}</td>
          <td class="product-list__cell">${product.quantity}</td>
          <td class="product-list__cell">${(product.rate * product.quantity).toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    previewTbody.innerHTML = productRows;
    const summarySection = this.previewSection.querySelector('.preview-summary');
    summarySection.querySelector('.preview-summary__value').textContent =
      `$${invoice.getTotalAmount().toFixed(2)}`;
    console.log('renderInvoicePreview called with invoice:', invoice);
  }
}
export default InvoiceView;
