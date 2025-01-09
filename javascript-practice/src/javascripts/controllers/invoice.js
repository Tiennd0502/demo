import Invoice from '../model/model.js';
import Templates from '../templates/templates.js';
import InvoiceView from '../views/view.js';
import ValidationUtils from '../helpers/validation-utils.js';
import NotificationUtils from '../helpers/notification-utils.js';
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
    this.validator = new ValidationUtils();
    this.notification = new NotificationUtils();
    this.invoices = [];

    this.discountPercentage = 5;
    this.init();
  }

  /**
   * Initializes the controller by rendering forms and setting up event listeners.
   */
  init() {
    console.log('Initializing InvoiceController');
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
    // Remove any existing listeners first
    const existingInvoiceList = this.view.invoiceList;
    const newInvoiceList = existingInvoiceList.cloneNode(true);
    existingInvoiceList.parentNode.replaceChild(newInvoiceList, existingInvoiceList);
    this.view.invoiceList = newInvoiceList;

    // Set up new listeners
    this.view.invoiceList.addEventListener(
      'click',
      (e) => {
        this.handleInvoiceActions(e);
      },
      { capture: true },
    ); // Use capture phase to handle event first

    this.setupAddInvoiceButton();
    this.setupSaveChangeButton();
    this.setupPopupMenu();
    this.setupMultipleInvoiceDeletion();

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
   * Setup event listener to hide popup when user uses specific actions
   */
  setupPopupMenu() {
    // Single event delegation handler for all popups
    document.addEventListener('click', (e) => {
      // Close any active popups when clicking outside
      if (!e.target.closest('.popup-menu')) {
        const activePopups = document.querySelectorAll('.popup-content.active');
        activePopups.forEach((popup) => popup.classList.remove('active'));
      }

      // Toggle popup when trigger is clicked
      if (e.target.closest('.btn-trigger')) {
        e.preventDefault();
        e.stopPropagation();
        const popup = e.target.closest('.table__row').querySelector('.popup-content');
        popup?.classList.toggle('active');
      }
    });

    // Close popup on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activePopups = document.querySelectorAll('.popup-content.active');
        activePopups.forEach((popup) => popup.classList.remove('active'));
      }
    });
  }

  /**
   *  Confirmation dialog for deleting invoices.
   * @param {number} count - The number of invoices to delete.
   * @param {string} [id=null] - The ID of the single invoice to delete (optional).
   * @returns {boolean} True if the user confirms the deletion, false otherwise.
   */
  async confirmDeletion(count, id = null) {
    const message =
      count > 1
        ? `Are you sure you want to delete ${count} selected invoice(s)?`
        : `Are you sure you want to delete invoice #${id}?`;

    return await this.notification.confirm(message, {
      type: 'warning',
      title: 'Delete Invoice',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }

  /**
   * Sets up event listeners for handling multiple invoice deletions.
   * This includes:
   * - Listening for changes to the header checkbox to select/deselect all invoices.
   * - Listening for clicks on the multiple deletion icon to delete selected invoices.
   * - Listening for individual delete button clicks using event delegation.
   */
  setupMultipleInvoiceDeletion() {
    this.tableBody = document.querySelector('.table__body');
    this.headerCheckbox = document.querySelector('.table__head .checkbox');
    this.deleteIcon = document.querySelector('.table__delete-icon');

    // Listen for header checkbox changes
    this.headerCheckbox?.addEventListener('change', this.handleHeaderCheckboxChange.bind(this));

    // Listen for bulk delete icon clicks
    this.deleteIcon?.addEventListener('click', async () => {
      const checkedRows = this.tableBody.querySelectorAll('.table__checkbox:checked');
      await this.handleInvoiceDeletion(Array.from(checkedRows));
    });
  }

  /**
   * Selects all checkbox invoice when users choose header checkbox
   */
  handleHeaderCheckboxChange(event) {
    const isChecked = event.target.checked;
    const rowCheckboxes = this.tableBody.querySelectorAll('.table__checkbox');

    rowCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  }

  /**
   * Handle deletion of invoices, for single or multiple invoice at same time
   * @param {Event,Array} identifier - event for single deletion or array of checkboxes for multiple deletion
   */
  async handleInvoiceDeletion(identifier) {
    // Handle both multiple deletion and single deletion cases
    if (Array.isArray(identifier)) {
      // Multiple deletion
      if (identifier.length === 0) {
        this.notification.show('Please select at least one invoice to delete', {
          type: 'warning',
        });
        return;
      }

      const confirmed = await this.confirmDeletion(identifier.length);
      if (confirmed) {
        identifier.forEach((checkbox) => {
          const row = checkbox.closest('.table__row');
          const id = row.querySelector('.btn--delete').dataset.id;
          this.invoices = this.invoices.filter((invoice) => invoice.id !== id);
        });
        this.headerCheckbox.checked = false;
        this.notification.show('Invoice deleted successfully', { type: 'success' });
      }
    } else {
      // Single deletion
      const deleteBtn = identifier.target.closest('.btn--delete');
      if (!deleteBtn) return;

      const invoiceId = deleteBtn.dataset.id;

      const confirmed = await this.confirmDeletion(1, invoiceId);
      if (confirmed) {
        this.invoices = this.invoices.filter((invoice) => invoice.id !== invoiceId);
        this.notification.show('Invoice deleted successfully', { type: 'success' });
      }
    }

    // Update view after any type of deletion
    this.view.renderInvoiceList(this.invoices);
    this.updateHeaderCheckbox();
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

    // Validate complete invoice data
    const validation = this.validator.validateCompleteInvoice({
      ...formData,
      products,
    });

    if (!validation.isValid) {
      const errorMessages = this.validator.formatValidationErrors(validation.errors);
      errorMessages.forEach((message) => {
        this.notification.show(message, { type: 'error' });
      });
      return;
    }

    // Proceed with adding invoice if validation passes
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
    this.notification.show('Invoice created successfully', { type: 'success' });
  }

  /**
   * Handles actions (edit, delete) on invoices in the invoice list.
   *
   * @param {Event} e - The event object.
   */
  async handleInvoiceActions(e) {
    const row = e.target.closest('.table__row');
    if (!row) return;

    const idCell = row.querySelector('[data-label="Invoice Id"]');
    if (!idCell) return;

    const id = idCell.textContent;

    // Handle delete button click
    if (e.target.closest('.btn--delete')) {
      e.preventDefault();
      e.stopPropagation();

      const popupContent = e.target.closest('.popup-content');
      await this.handleInvoiceDeletion(e);
      if (popupContent) {
        popupContent.classList.remove('active');
      }
      return;
    }

    // Handle edit button click
    if (e.target.closest('.btn--edit')) {
      e.preventDefault();
      e.stopPropagation();
      this.editInvoice(id);
      const popupContent = e.target.closest('.popup-content');
      if (popupContent) {
        popupContent.classList.remove('active');
      }
      return;
    }
  }

  /**
   * Update the state of the header checkbox base on the individual checkboxes
   * If all checkboxes are checked, header checkbox will be checked and vice versa
   */
  updateHeaderCheckbox() {
    const totalRows = this.tableBody.querySelectorAll('.table__checkbox').length;
    const checkedRows = this.tableBody.querySelectorAll(`${'.table__checkbox'}:checked`).length;

    this.headerCheckbox.checked = totalRows > 0 && totalRows === checkedRows;
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
    // productHandlers.updateAmounts(tbody, () => this.updatePreview(), this.discountPercentage);
  }

  /**
   * Saves changes to an existing invoice based on the form data and product data
   * Validates form and product data before updating the invoice
   * Render the updated invoice list and invoice preview
   */
  saveChanges() {
    const formData = formHandlers.collectFormData();
    const products = productHandlers.collectProductData();

    // Validate complete invoice data
    const validation = this.validator.validateCompleteInvoice({
      ...formData,
      products,
    });

    if (!validation.isValid) {
      const errorMessages = this.validator.formatValidationErrors(validation.errors);
      errorMessages.forEach((message) => {
        this.notification.show(message, { type: 'error' });
      });
      return;
    }

    // Proceed with saving changes if validation passes
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
    this.notification.show('Invoice updated successfully', { type: 'success' });
    formHandlers.resetFormStates();
  }

  /**
   * Updates the invoice preview based on the current form data and product data.
   *  Uses try/catch to log an error if the preview update fails.
   */
  updatePreview() {
    console.log('updatePreview called');
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
