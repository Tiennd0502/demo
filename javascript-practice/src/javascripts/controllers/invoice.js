import Invoice from '../model/model.js';
import Templates from '../templates/templates.js';
import InvoiceView from '../views/view.js';
import * as formHandlers from './form-handlers.js';
import * as productHandlers from './product-handlers.js';

class InvoiceController {
  constructor() {
    this.invoice = new Invoice();
    this.view = new InvoiceView();
    this.invoices = [];
    this.discountPercentage = 5;
    this.init();
  }

  init() {
    this.renderForms();
    this.setupEventListeners();
  }

  renderForms() {
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.innerHTML = Templates.genericForm('create') + Templates.genericForm('edit');
    }
  }

  setupEventListeners() {
    this.setupInvoiceActions();
    this.setupAddInvoiceButton();
    this.setupSaveChangeButton();

    formHandlers.setupFormEventListeners((newDiscount) => {
      this.discountPercentage = newDiscount;
      const tbody = this.getActiveFormTbody();
      if (tbody) {
        productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
      }
    });

    productHandlers.setupProductListHandlers(() => this.updatePreview());
  }

  setupInvoiceActions() {
    this.view.invoiceList.addEventListener('click', (e) => this.handleInvoiceActions(e));
  }

  setupAddInvoiceButton() {
    document
      .querySelector('.form__action-buttons--button-create')
      .addEventListener('click', () => this.addInvoice());
  }

  setupSaveChangeButton() {
    document
      .querySelector('.form--edit .form__action-buttons--button-save')
      .addEventListener('click', () => this.saveChanges());
  }

  getActiveFormTbody() {
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');
    return activeForm?.querySelector('product-list__table tbody');
  }

  addInvoice() {
    const formData = formHandlers.collectFormData();
    if (!formData || !formHandlers.validateFormData(formData)) return;

    const products = productHandlers.collectProductData();
    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    const invoice = new Invoice(
      formData.id,
      formData.name,
      formData.email,
      formData.date,
      formData.address,
      formData.status,
      products,
    );

    this.invoices.push(invoice);
    this.view.renderInvoiceList(this.invoices);
    this.view.renderInvoicePreview(invoice);
    formHandlers.resetFormStates();
  }

  handleInvoiceActions(e) {
    const row = e.target.closest('.table__row');
    if (!row) return;

    const idCell = row.querySelector('[data-label="Invoice Id"]');
    if (!idCell) return;

    const id = idCell.textContent;
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

    formHandlers.showEditForm();
    formHandlers.setFormData(invoice, this.discountPercentage);

    const tbody = document.querySelector(
      '.form--edit .product-list__table .product-list__table-body',
    );
    productHandlers.setProductData(invoice.products, tbody);
    productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
  }

  saveChanges() {
    const formData = formHandlers.collectFormData();
    if (!formData || !formHandlers.validateFormData(formData)) return;

    const products = productHandlers.collectProductData();
    if (products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    const index = this.invoices.findIndex((inv) => inv.id === formData.id);
    if (index === -1) return;

    this.invoices[index] = new Invoice(
      formData.id,
      formData.name,
      formData.email,
      formData.date,
      formData.address,
      formData.status,
      products,
    );

    this.view.renderInvoiceList(this.invoices);
    this.view.renderInvoicePreview(this.invoices[index]);
    formHandlers.resetFormStates();
  }

  updatePreview() {
    const formData = formHandlers.collectFormData();
    if (!formData) return;

    const products = productHandlers.collectProductData();

    try {
      const tempInvoice = new Invoice(
        formData.id,
        formData.name,
        formData.email,
        formData.date,
        formData.address,
        formData.status,
        products,
      );
      this.view.renderInvoicePreview(tempInvoice);
    } catch (error) {
      console.error('Error updating preview:', error);
    }
  }
}

export default InvoiceController;
