/**
 * Sets up the mobile sort dropdown functionality
 */
function setupMobileSortDropdown() {
  const dropdownButton = document.querySelector('.sort-dropdown__button');
  const dropdownMenu = document.querySelector('.sort-dropdown__menu');
  const dropdownOptions = document.querySelectorAll('.sort-dropdown__option');

  const sortIcon = dropdownButton.querySelector('.sort-icon--mobile');

  // Keep track of current sort state
  let currentSort = {
    field: 'name',
    order: 'asc',
  };

  // Toggle dropdown on button click
  dropdownButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = dropdownMenu.classList.contains('active');

    // Toggle dropdown menu
    dropdownMenu.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sort-dropdown')) {
      dropdownMenu.classList.remove('active');
    }
  });

  // Handle sort icon click to toggle sort order
  sortIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    //Toggle sort order
    currentSort.order = currentSort.sort === 'asc' ? 'desc' : 'asc';
    //Update icon rotation based on sort order
    sortIcon.style.transform = currentSort.order === 'asc' ? 'rotate(0deg)' : 'rotate(180deg)';
    //Trigger sort on current field
    const tableHeader = document.querySelector(`.table__header[data-field="${currentSort.field}"]`);
    if (tableHeader) {
      tableHeader.click();
    }
  });

  // Handle option selection
  dropdownOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const field = option.dataset.sort;

      // Trigger sort on the invoice list
      const tableHeader = document.querySelector(`.table__header[data-field="${field}"]`);
      if (tableHeader) {
        tableHeader.click();
      }

      // Close dropdown
      dropdownMenu.classList.remove('active');
    });
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdownMenu.classList.contains('active')) {
      dropdownMenu.classList.remove('active');
    }
  });
}

export function initializeMobileSort() {
  setupMobileSortDropdown();
}
