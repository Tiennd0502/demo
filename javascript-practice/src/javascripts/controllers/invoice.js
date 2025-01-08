import Invoice from '../model/model.js';
import Templates from '../templates/templates.js';
import InvoiceView from '../views/view.js';
import * as formHandlers from './form-handlers.js';
import * as productHandlers from './product-handlers.js';

/**
 * This class handles the main logic for managing invoices, including rendering forms,
 * setting up event listeners, and handling invoice actions such as adding and saving invoices.
 *
 * Dependencies:
 * - Invoice: The model representing an invoice.
 * - Templates: Contains HTML templates for rendering forms and invoice lists.
 * - InvoiceView: Handles the rendering of invoices in the view.
 * - formHandlers: Contains functions for handling form-related events.
 * - productHandlers: Contains functions for handling product list-related events.
 */
class InvoiceController {
  constructor() {
    this.invoice = new Invoice();
    this.view = new InvoiceView();
    this.invoices = [];
    this.discountPercentage = 5;
    this.init();
  }

  /**
   * Initializes the controller by rendering forms and setting up event listeners.
   */
  init() {
    this.renderForms();
    this.setupEventListeners();
  }

  /**
   * Renders the create and edit forms using templates.
   */
  renderForms() {
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.innerHTML = Templates.genericForm('create') + Templates.genericForm('edit');
    }
  }

  /**
   * Sets up event listeners for invoice actions, form events, and product list events.
   */
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

  /**
   * Sets up event listeners for invoice actions in the invoice list.
   */
  setupInvoiceActions() {
    this.view.invoiceList.addEventListener('click', (e) => this.handleInvoiceActions(e));
  }

  /**
   * Sets up the event listener for the "Add Invoice" button.
   */
  setupAddInvoiceButton() {
    document
      .querySelector('.form__action-buttons--button-create')
      .addEventListener('click', () => this.addInvoice());
  }

  /**
   * Sets up the event listener for the "Save Changes" button.
   */
  setupSaveChangeButton() {
    document
      .querySelector('.form--edit .form__action-buttons--button-save')
      .addEventListener('click', () => this.saveChanges());
  }

  /**
   * Return the tbody element of the active form (create form or edit form)
   * @return {HTMLElement}The tbody element of the active form, or null if no form is active.
   */
  getActiveFormTbody() {
    const activeForm =
      document.querySelector('.form--create:not(.hidden)') ||
      document.querySelector('.form--edit:not(.hidden)');
    return activeForm?.querySelector('product-list__table tbody');
  }

  /**
   * Adds a new invoice based on the form data and product data.
   * Validates the form data and product data before creating the invoice.
   * Renders the updated invoice list and invoice preview.
   */
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

  /**
   * Handles actions (edit, delete) on invoices in the invoice list.
   *
   * @param {Event} e - The event object.
   */
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

  /**
   * Deletes an invoice by its ID after confirming with the user
   * @param {string} id - the ID of the invoice to delete
   */
  deleteInvoice(id) {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
      this.view.renderInvoiceList(this.invoices);
    }
  }

  /**
   * Edits an invoice by its ID
   * Show edit form and populate it with the invoice data
   * @param {string} id - the ID of the invoice to edit
   */
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

  /**
   * Saves changes to an existing invoice based on the form data and product data
   * Validates form and product data before updating the invoice
   * Render the updated invoice list and invoice preview
   */
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

  /**
   * Updates the invoice preview based on the current form data and product data.
   *  Uses try/catch to log an error if the preview update fails.
   */
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
