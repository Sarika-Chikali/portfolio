/**
 * View Items functionality
 * Displays and filters all lost and found items
 */

import { getAllItems } from './api.js';

// DOM Elements
const itemsGrid = document.getElementById('items-grid');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const filterType = document.getElementById('filter-type');
const filterCategory = document.getElementById('filter-category');
const filterDate = document.getElementById('filter-date');
const tabButtons = document.querySelectorAll('.tab-btn');
const paginationContainer = document.getElementById('pagination');

// State variables
let allItems = { lostItems: [], foundItems: [] };
let filteredItems = [];
let currentTab = 'all';
let currentPage = 1;
const itemsPerPage = 9;

/**
 * Initialize the view items page
 */
async function initViewPage() {
  // Load all items
  await loadAllItems();
  
  // Add event listeners
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  filterType.addEventListener('change', applyFilters);
  filterCategory.addEventListener('change', applyFilters);
  filterDate.addEventListener('change', applyFilters);
  
  // Tab buttons event listeners
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

/**
 * Load all items from the API
 */
async function loadAllItems() {
  try {
    // Show loading state
    itemsGrid.innerHTML = '<div class="loading">Loading items...</div>';
    
    // Fetch all items
    allItems = await getAllItems();
    
    // Process and display items
    processItems();
  } catch (error) {
    console.error('Error loading items:', error);
    itemsGrid.innerHTML = `
      <div class="error-state">
        <h3>Something went wrong</h3>
        <p>Failed to load items. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Process items data and apply current filters
 */
function processItems() {
  // Reset pagination
  currentPage = 1;
  
  // Apply current filters and display items
  applyFilters();
}

/**
 * Apply all filters and display items
 */
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const typeFilter = filterType.value;
  const categoryFilter = filterCategory.value;
  const dateFilter = filterDate.value;
  
  // Combine lost and found items with type indicator
  let combinedItems = [
    ...allItems.lostItems.map(item => ({ ...item, type: 'lost' })),
    ...allItems.foundItems.map(item => ({ ...item, type: 'found' }))
  ];
  
  // Apply type filter
  if (typeFilter !== 'all') {
    combinedItems = combinedItems.filter(item => item.type === typeFilter);
  }
  
  // Apply tab filter
  if (currentTab !== 'all') {
    combinedItems = combinedItems.filter(item => item.type === currentTab);
  }
  
  // Apply category filter
  if (categoryFilter !== 'all') {
    combinedItems = combinedItems.filter(item => item.category === categoryFilter);
  }
  
  // Apply date filter
  if (dateFilter !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(today.getMonth() - 1);
    
    combinedItems = combinedItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      
      if (dateFilter === 'today') {
        return itemDate >= today;
      } else if (dateFilter === 'week') {
        return itemDate >= weekAgo;
      } else if (dateFilter === 'month') {
        return itemDate >= monthAgo;
      }
      
      return true;
    });
  }
  
  // Apply search filter
  if (searchTerm) {
    combinedItems = combinedItems.filter(item => {
      // Search in multiple fields
      return (
        (item.itemName && item.itemName.toLowerCase().includes(searchTerm)) ||
        (item.description && item.description.toLowerCase().includes(searchTerm)) ||
        (item.location && item.location.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.toLowerCase().includes(searchTerm))
      );
    });
  }
  
  // Sort by newest first
  combinedItems.sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });
  
  // Update filtered items
  filteredItems = combinedItems;
  
  // Display items with pagination
  displayItems();
}

/**
 * Handle search button click
 */
function handleSearch() {
  applyFilters();
}

/**
 * Switch between tabs
 * @param {string} tab Tab to switch to
 */
function switchTab(tab) {
  // Update active tab
  currentTab = tab;
  
  // Update tab button active state
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Reset to first page
  currentPage = 1;
  
  // Apply filters with new tab
  applyFilters();
}

/**
 * Display filtered items with pagination
 */
function displayItems() {
  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = filteredItems.slice(startIndex, endIndex);
  
  // Display items or show empty state
  if (filteredItems.length === 0) {
    itemsGrid.innerHTML = `
      <div class="empty-state">
        <h3>No Items Found</h3>
        <p>Try adjusting your filters or search criteria.</p>
      </div>
    `;
    
    // Hide pagination
    paginationContainer.innerHTML = '';
    return;
  }
  
  // Clear previous items
  itemsGrid.innerHTML = '';
  
  // Create item cards with staggered animation delays
  itemsToShow.forEach((item, index) => {
    const itemCard = createItemCard(item);
    itemCard.style.animationDelay = `${index * 0.1}s`;
    itemsGrid.appendChild(itemCard);
  });
  
  // Update pagination
  updatePagination(totalPages);
}

/**
 * Create an item card element
 * @param {Object} item Item data
 * @returns {HTMLElement} Item card element
 */
function createItemCard(item) {
  const itemCard = document.createElement('div');
  itemCard.className = `item-card ${item.type}`;
  
  const itemDate = new Date(item.date || item.createdAt).toLocaleDateString();
  
  itemCard.innerHTML = `
    <div class="item-card-header">
      <h3>${item.itemName}</h3>
      <span class="item-type ${item.type}">${item.type === 'lost' ? 'Lost' : 'Found'}</span>
    </div>
    <div class="item-card-body">
      <div class="item-details">
        <div class="item-detail">
          <span class="item-detail-label">Category:</span>
          <span>${item.category || 'Not specified'}</span>
        </div>
        <div class="item-detail">
          <span class="item-detail-label">Location:</span>
          <span>${item.location || 'Not specified'}</span>
        </div>
        <div class="item-detail">
          <span class="item-detail-label">Date:</span>
          <span>${itemDate}</span>
        </div>
        ${item.type === 'found' && item.turnedIn !== undefined ? `
          <div class="item-detail">
            <span class="item-detail-label">Status:</span>
            <span>${item.turnedIn ? 'Turned in to Lost & Found Office' : 'Being held by finder'}</span>
          </div>
        ` : ''}
      </div>
      <p class="item-description">${item.description}</p>
    </div>
    <div class="item-card-footer">
      <span>Posted by: ${item.userName}</span>
      <button class="btn btn-primary contact-btn" onclick="showContactInfo('${item.contact}')">Contact</button>
    </div>
  `;
  
  return itemCard;
}

/**
 * Update pagination controls
 * @param {number} totalPages Total number of pages
 */
function updatePagination(totalPages) {
  paginationContainer.innerHTML = '';
  
  // Don't show pagination if only one page
  if (totalPages <= 1) return;
  
  // Previous button
  const prevButton = document.createElement('button');
  prevButton.innerHTML = '&laquo;';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(prevButton);
  
  // Page buttons
  const maxButtons = 5; // Maximum number of page buttons to show
  const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'active' : '';
    pageButton.addEventListener('click', () => {
      currentPage = i;
      displayItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    paginationContainer.appendChild(pageButton);
  }
  
  // Next button
  const nextButton = document.createElement('button');
  nextButton.innerHTML = '&raquo;';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayItems();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Show contact info function (defined globally for button onclick)
window.showContactInfo = function(contact) {
  alert(`Contact Information: ${contact}`);
};

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', initViewPage);