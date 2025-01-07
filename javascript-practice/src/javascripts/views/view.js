class InvoiceView {
  constructor() {
    this.invoiceList = document.querySelector('.table__body');
    this.previewSection = document.querySelector('.preview');
  }

  renderInvoiceList(invoices) {
    this.invoiceList.innerHTML = invoices
      .map(
        (invoice) => `
        <tr class="table__row">
          <td class="table__cell"><input type="checkbox" class="table__checkbox" /></td>
          <td class="table__cell" data-label="Invoice Id">${invoice.id}</td>
          <td class="table__cell" data-label="Name">
            <div class="table__user">
              <img
                class="table__user-avatar"
                src="./assets/images/recipient-image.png"
                alt="avatar"
              />
              <span class="table__user-name">${invoice.name}</span>
            </div>
          </td>
          <td class="table__cell" data-label="Email">
            <div class="table__user-email">
              <img
                src="./assets/images/icons/main-view-icons/email-icon.svg"
                alt="email icon"
              />
              <span class="table__user-email-text">${invoice.email}</span>
            </div>
          </td>
          <td class="table__cell" data-label="Date">
            <div class="table__date">
              <img
                class="table__date-icon"
                src="./assets/images/icons/main-view-icons/date-icon.svg"
                alt="date icon"
              />
              <span class="table__date-text">${invoice.date}</span>
            </div>
          </td>
          <td class="table__cell" data-label="Status">
            <span class="status status-${invoice.status.toLowerCase()}">${invoice.status}</span>
          </td>
          <td class="table__cell" data-label="Favorite">
            <img
              src="./assets/images/icons/main-view-icons/favorite-icon-inactive.svg"
              alt="favorite icon"
              class="favorite-icon-inactive"
            />
          </td>

          
          <td class="table__cell table__cell--actions" data-label="Actions">
            <span>...</span>
            <button class="btn btn--edit" data-id="${invoice.id}">
              <img
                src="./assets/images/icons/main-view-icons/edit-icon.svg"
                alt="edit icon"
              />
              Edit
            </button>
            <button class="btn btn--delete" data-id="${invoice.id}">
              <img
                src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg"
                alt="delete-icon"
              />
              Delete
            </button>
          </td>
        </tr>`,
      )
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
    const productRows = invoice.products
      .map(
        (product) => `
        <tr class="preview-table__row">
          <td class="product-list__cell">${product.name}</td>
          <td class="product-list__cell">${product.rate}</td>
          <td class="product-list__cell">${product.quantity}</td>
          <td class="product-list__cell">${product.rate * product.quantity}</td>
        </tr>`,
      )
      .join('');

    this.previewSection.querySelector('tbody').innerHTML = productRows;
    this.previewSection.querySelector('.preview-summary__value').innerHTML =
      `$${invoice.getTotalAmount()}`;
  }
}

export default InvoiceView;
