export function setupFormEventListeners(onDiscountChange) {
  setupFormCloseButton();
  setupCreateFormButton();
  setupDiscountInputHandler(onDiscountChange);
}

export function setupFormCloseButton() {
  document.querySelectorAll('.form__header-close').forEach((btn) => {
    btn.addEventListener('click', () => closeForm());
  });
}

export function setupCreateFormButton() {
  document.querySelector('.btn--primary').addEventListener('click', () => showCreateForm());
}

export function setupDiscountInputHandler(onDiscountChange) {
  const discountInput = document.querySelectorAll('.discount-input');
  discountInput.forEach((input) => {
    input.addEventListener('input', (e) => {
      const discountPercentage = parseFloat(e.target.value) || 0;
      onDiscountChange?.(discountPercentage);
    });
  });
}

export function toggleForm({ showCreate = false, showEdit = false }) {
  document.querySelector('.main').classList.toggle('hidden', showCreate || showEdit);
  document.querySelector('.content').style.display = showCreate || showEdit ? 'grid' : 'none';
  document.querySelector('.form--create').classList.toggle('hidden', !showCreate);
  document.querySelector('.form--edit').classList.toggle('hidden', !showEdit);
}

export function closeForm() {
  toggleForm({});
  resetForm();
}

export function showCreateForm() {
  toggleForm({ showCreate: true });
  resetForm();
}

export function showEditForm() {
  toggleForm({ showEdit: true });
  resetForm();
}

export function resetFormStates() {
  toggleForm({});
}

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
    status: 'Pending',
  };
}

export function setFormData(invoice, discountPercentage) {
  const editForm = document.querySelector('.form--edit');
  editForm.querySelector('input[placeholder="#876370"]').value = invoice.id;
  editForm.querySelector('input[placeholder="Alison G."]').value = invoice.name;
  editForm.querySelector('input[type="email"]').value = invoice.email;
  editForm.querySelector('input[type="date"]').value = invoice.date;
  editForm.querySelector('input[placeholder="Street"]').value = invoice.address;

  const discountInput = editForm.querySelector('.discount-input');
  if (discountInput) {
    discountInput.value = discountPercentage;
  }
}

export function validateFormData(data) {
  if (!data.name || !data.email || !data.date) {
    alert('Please fill in all required fields and add at least one product');
    return false;
  }
  return true;
}
