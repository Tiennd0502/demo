import NotificationUtils from '../helpers/notification-utils.js';
/**
 * Setup event listener for any form related actions
 * @param {Function} onDiscountChange - callback function to handle discount input changes
 */
export function setupFormEventListeners(onDiscountChange) {
  setupFormCloseButton();
  setupCreateFormButton();
  setupDiscountInputHandler(onDiscountChange);
}

/**
 * Setup event listener for button to close forms
 */
export function setupFormCloseButton() {
  document.querySelectorAll('.form__header-close').forEach((btn) => {
    btn.addEventListener('click', () => closeForm());
  });
}

/**
 * setup event listener for the create form button
 */
export function setupCreateFormButton() {
  document.querySelector('.btn--primary').addEventListener('click', () => showCreateForm());
}

/**
 * setup event listener for discount input field
 * @param {Function} onDiscountChange - callback function to handle input discount changes
 */
export function setupDiscountInputHandler(onDiscountChange) {
  const discountInput = document.querySelectorAll('.discount-input');
  discountInput.forEach((input) => {
    input.addEventListener('input', (e) => {
      const discountPercentage = parseFloat(e.target.value) || 0;
      onDiscountChange?.(discountPercentage);
    });
  });
}

/**
 * Helper methods to show/hide forms
 *
 * @param {Object} options - to control which form to show/hide
 * @param {boolean} options.showCreate - to show create form
 * @param {boolean} options.showEdit - to show edit form
 */
export function toggleForm({ showCreate = false, showEdit = false }) {
  document.querySelector('.main').classList.toggle('hidden', showCreate || showEdit);
  document.querySelector('.content').style.display = showCreate || showEdit ? 'grid' : 'none';
  document.querySelector('.form--create').classList.toggle('hidden', !showCreate);
  document.querySelector('.form--edit').classList.toggle('hidden', !showEdit);
}

/**
 * Closes the currently open form and resets it.
 */
export function closeForm() {
  toggleForm({});
  resetForm();
}

/**
 * Shows the create form and resets it.
 */
export function showCreateForm() {
  toggleForm({ showCreate: true });
  resetForm();
}

/**
 * Shows the edit form and resets it
 */
export function showEditForm() {
  toggleForm({ showEdit: true });
}

/**
 * Resets the form states by hiding all forms.
 */
export function resetFormStates() {
  toggleForm({});
}

/**
 * Resets the form fields to their default states and clears the product list.
 * @param {Function} onResetForm - Callback function to handle additional reset actions.
 */
export function resetForm(onResetForm) {
  const inputs = document.querySelectorAll('.form__group-input');
  inputs.forEach((input) => (input.value = ''));

  const activeForm = document.querySelector('.form--create:not(.hidden), .form--edit:not(.hidden)');
  if (activeForm) {
    const tbody = activeForm.querySelector('.product-list__table .product-list__table-body');
    tbody.innerHTML = '';
    onResetForm?.(tbody);
  }
}

/**
 * Collects form data from active form (create or edit)
 * @returns {Object} - the collected from data, null if no form is active
 */
export function collectFormData() {
  const activeForm =
    document.querySelector('.form--create:not(.hidden)') ||
    document.querySelector('.form--edit:not(.hidden)');

  if (!activeForm) return null;

  return {
    id: activeForm.querySelector('input[placeholder="#876370"]')?.value || `INV-${Date.now()}`,
    name: activeForm.querySelector('input[placeholder="Alison G."]')?.value || '',
    email: activeForm.querySelector('input[type="email"]')?.value || '',
    date: activeForm.querySelector('input[type="date"]')?.value || '',
    address: activeForm.querySelector('input[placeholder="Street"]')?.value || '',
    status: activeForm.querySelector('#status').value,
  };
}

/**
 * Sets form data for the edit form based on the provided invoice and discount percentage.
 * @param {Object} invoice - The invoice data to populate the form.
 * @param {number} discountPercentage - The discount percentage to set in the form.
 */
export function setFormData(invoice, discountPercentage) {
  const editForm = document.querySelector('.form--edit');
  editForm.querySelector('input[placeholder="#876370"]').value = invoice.id;
  editForm.querySelector('input[placeholder="Alison G."]').value = invoice.name;
  editForm.querySelector('input[type="email"]').value = invoice.email;
  editForm.querySelector('input[type="date"]').value = invoice.date;
  editForm.querySelector('input[placeholder="Street"]').value = invoice.address;
  editForm.querySelector('#status').value = invoice.status;

  const discountInput = editForm.querySelector('.discount-input');
  if (discountInput) {
    discountInput.value = discountPercentage;
  }
}

/**
 * validates the collected form data
 * @param {Object} - form data to validate
 * @returns {boolean} - true of form data is valid
 */
export function validateFormData(data) {
  if (!data.name || !data.email || !data.date) {
    new NotificationUtils().alert(
      'Please fill in all required fields and add at least one product',
      { type: 'warning' },
    );
    return false;
  }
  return true;
}
