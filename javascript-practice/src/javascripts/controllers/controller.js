import Invoice from '../model/model.js';
import InvoiceView from '../views/view.js';
class InvoiceController {
  constructor() {
    this.invoice = new Invoice();
    this.view = new InvoiceView();
    this.invoices = [];

    this.init();
  }

  init() {
    document.querySelector('.btn--primary').addEventListener('click', () => this.showCreateForm());
    document
      .querySelector('.form__action-buttons--button-create')
      .addEventListener('click', () => this.addInvoice());
    this.view.invoiceList.addEventListener('click', (e) => this.handleListClick(e));
    this.setupProductListHandlers();
  }

  setupProductListHandlers() {
    const addProductBtn = document.querySelector('.product-list__action-button--button-add');
    addProductBtn.addEventListener('click', () => this.addProductRow());

    document.querySelector('.product-list__table tbody').addEventListener('click', (e) => {
      if (e.target.closest('.product-list__action-button--button-delete')) {
        e.target.closest('tr').remove();
        this.updatePreview();
      }
    });
  }
  showCreateForm() {
    document.querySelector('.main').classList.add('hidden');
    document.querySelector('.content').style.display = 'grid';
    this.resetForm();
  }

  resetForm() {
    const inputs = document.querySelectorAll('.form__group-input');
    inputs.forEach((input) => (input.value = ''));
    document.querySelector('.product-list__table .product-list__table-body').innerHTML =
      this.getEmptyProductRow();
  }

  getEmptyProductRow() {
    return `
      <tr class="product-list__table-row">
        <td class="product-list__cell"><input type="text" class="product-input"></td>
        <td class="product-list__cell"><input type="number" class="rate-input"></td>
        <td class="product-list__cell"><input type="number" class="qty-input"></td>
        <td class="product-list__cell">$</td>
        <td class="product-list__cell">
          <button class="btn product-list__action-buttons product-list__action-button--button-delete">
            <img
              class="delete-icon"
              src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg"
              alt="delete icon"
            />
          </button>
        </td>
      </tr>
    `;
  }

  addProductRow() {
    const tbody = document.querySelector('.product-list__table .product-list__table-body');
    tbody.insertAdjacentHTML('beforeend', this.getEmptyProductRow());
  }

  collectFormData() {
    const products = [];
    const rows = document.querySelectorAll(
      '.product-list__table .product-list__table-body .product-list__table-row',
    );

    rows.forEach((row) => {
      const product = {
        name: row.querySelector('.product-input').value,
        rate: parseFloat(row.querySelector('.rate-input').value) || 0,
        quantity: parseInt(row.querySelector('.qty-input').value) || 0,
      };
      if (product.name) products.push(product);
    });

    return {
      id: `INV-${Date.now()}`,
      name: document.querySelector('.form__group-input[placeholder="Alison G."]').value,
      email: document.querySelector('.form__group-input[placeholder="example@gmail.com"]').value,
      date: document.querySelector('.form__group-input[type="date"]').value,
      address: document.querySelector('.form__group-input[placeholder="Street"]').value,
      status: 'Pending',
      products,
    };
  }

  addInvoice() {
    const data = this.collectFormData();
    if (!this.validateInvoice(data)) return;

    const invoice = new Invoice(
      data.id,
      data.name,
      data.email,
      data.date,
      data.address,
      data.status,
      data.products,
    );
    this.invoices.push(invoice);
    this.view.renderInvoiceList(this.invoices);
    this.view.renderInvoicePreview(invoice);
    document.querySelector('.content').style.display = 'none';
    document.querySelector('.main').classList.remove('hidden');
  }

  validateInvoice(data) {
    if (!data.name || !data.email || !data.date || data.products.length === 0) {
      alert('Please fill in all required fields and add at least one product');
      return false;
    }
    return true;
  }

  handleListClick(e) {
    const row = e.target.closest('.table__row');
    if (!row) return;

    const id = row.querySelector('[data-label="Invoice Id"]').textContent;

    if (e.target.closest('.btn--delete')) {
      this.deleteInvoice(id);
    } else if (e.target.closest('.btn--edit')) {
      this.editInvoice(id);
    }
  }

  deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
      this.view.renderInvoiceList(this.invoices);
    }
  }
  editInvoice(id) {
    const invoice = this.invoices.find((invoice) => invoice.id === id);
    if (!invoice) return;

    this.showCreateForm();
    document.querySelector('.form__group-input[placeholder="#876370"]').value = invoice.id;
    document.querySelector('.form__group-input[placeholder="Alison G."]').value = invoice.name;
    document.querySelector('.form__group-input[placeholder="example@gmail.com"]').value =
      invoice.email;
    document.querySelector('.form__group-input[type="date"]').value = invoice.date;
    document.querySelector('.form__group-input[placeholder="Street"]').value = invoice.address;
    const tbody = document.querySelector('.product-list__table .product-list__table-body');
    tbody.innerHTML = invoice.products
      .map(
        (product) => `
      <tr>
        <td class="product-list__cell"><input type="text" class="product-input" value="${product.name}"></td>
        <td class="product-list__cell"><input type="number" class="rate-input" value="${product.rate}"></td>
        <td class="product-list__cell"><input type="number" class="qty-input" value="${product.quantity}"></td>
        <td class="product-list__cell">$${product.rate * product.quantity}</td>
        <td class="product-list__cell">
          <button class="btn product-list__action-buttons product-list__action-button--button-delete">
            <img src="./assets/images/icons/create-invoice-modal-icons/Delete-icon.svg" alt="delete icon" class="delete-icon">
          </button>
        </td>
      </tr>
    `,
      )
      .join('');
  }
  updatePreview() {
    const data = this.collectFormData();
    const tempInvoice = new this.model(
      data.id,
      data.name,
      data.email,
      data.date,
      data.address,
      data.status,
      data.products,
    );
    this.view.renderInvoicePreview(tempInvoice);
  }
}
export default InvoiceController;
