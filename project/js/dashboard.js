/**
 * Dashboard functionality
 * Displays and manages user's items
 */

import { getUserItems, deleteLostItem, deleteFoundItem } from './api.js';

// DOM Elements
const userInfoSection = document.getElementById('user-info');
const userPrompt = document.getElementById('user-prompt');
const userForm = document.getElementById('user-form');
const usernameInput = document.getElementById('dashboard-username');
const userItemsContainer = document.getElementById('user-items-container');
const userItems = document.getElementById('user-items');
const tabButtons = document.querySelectorAll('.tab-btn');

// State variables
let currentUser = null;
let userItemsData = { lostItems: [], foundItems: [] };
let currentTab = 'all';

/**
 * Initialize the dashboard page
 */
function initDashboardPage() {
  // Check if username is already in localStorage
  const savedUserName = localStorage.getItem('userName');
  
  if (savedUserName) {
    // Auto-fill the username input
    if (usernameInput) {
      usernameInput.value = savedUserName;
    }
    
    // Automatically load user items if username exists
    loadUserDashboard(savedUserName);
  }
  
  // Add event listener to user form
  if (userForm) {
    userForm.addEventListener('submit', handleUserFormSubmit);
  }
  
  // Tab buttons event listeners
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

/**
 * Handle user form submission
 * @param {Event} event Form submit event
 */
function handleUserFormSubmit(event) {
  event.preventDefault();
  
  const userName = usernameInput.value.trim();
  if (!userName) return;
  
  // Save to localStorage and load dashboard
  localStorage.setItem('userName', userName);
  loadUserDashboard(userName);
}

/**
 * Load the user dashboard with their items
 * @param {string} userName Username to load items for
 */
async function loadUserDashboard(userName) {
  try {
    // Set current user
    currentUser = userName;
    
    // Show loading state
    userItems.innerHTML = '<div class="loading">Loading your items...</div>';
    
    // Show the user items container
    userItemsContainer.style.display = 'block';
    
    // Update user info section
    userInfoSection.innerHTML = `
      <div class="user-greeting">
        <h2>Welcome, ${userName}!</h2>
        <button id="change-user-btn" class="btn btn-secondary">Change User</button>
      </div>
      <div class="user-stats" id="user-stats">
        <div class="stat-card">
          <h3 id="lost-count">...</h3>
          <p>Lost Items</p>
        </div>
        <div class="stat-card">
          <h3 id="found-count">...</h3>
          <p>Found Items</p>
        </div>
        <div class="stat-card">
          <h3 id="total-count">...</h3>
          <p>Total Items</p>
        </div>
      </div>
    `;
    
    // Add event listener to change user button
    const changeUserBtn = document.getElementById('change-user-btn');
    if (changeUserBtn) {
      changeUserBtn.addEventListener('click', () => {
        // Hide user items container
        userItemsContainer.style.display = 'none';
        
        // Show user prompt
        userInfoSection.innerHTML = '';
        userInfoSection.appendChild(userPrompt);
        userPrompt.style.display = 'block';
        
        // Clear current user
        currentUser = null;
      });
    }
    
    // Fetch user items
    userItemsData = await getUserItems(userName);
    
    // Update stats
    updateUserStats();
    
    // Display items based on current tab
    displayUserItems();
    
  } catch (error) {
    console.error('Error loading user dashboard:', error);
    userItems.innerHTML = `
      <div class="error-state">
        <h3>Something went wrong</h3>
        <p>Failed to load your items. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Update user stats display
 */
function updateUserStats() {
  const lostCount = document.getElementById('lost-count');
  const foundCount = document.getElementById('found-count');
  const totalCount = document.getElementById('total-count');
  
  if (lostCount) lostCount.textContent = userItemsData.lostItems.length;
  if (foundCount) foundCount.textContent = userItemsData.foundItems.length;
  if (totalCount) totalCount.textContent = userItemsData.lostItems.length + userItemsData.foundItems.length;
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
  
  // Display items based on new tab
  displayUserItems();
}

/**
 * Display user items based on current tab
 */
function displayUserItems() {
  // Filter items based on current tab
  let itemsToDisplay = [];
  
  if (currentTab === 'all' || currentTab === 'lost') {
    itemsToDisplay = [
      ...itemsToDisplay,
      ...userItemsData.lostItems.map(item => ({ ...item, type: 'lost' }))
    ];
  }
  
  if (currentTab === 'all' || currentTab === 'found') {
    itemsToDisplay = [
      ...itemsToDisplay,
      ...userItemsData.foundItems.map(item => ({ ...item, type: 'found' }))
    ];
  }
  
  // Sort by newest first
  itemsToDisplay.sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });
  
  // Display items or show empty state
  if (itemsToDisplay.length === 0) {
    userItems.innerHTML = `
      <div class="no-items">
        <h3>No ${currentTab === 'all' ? '' : currentTab} items yet</h3>
        <p>You haven't reported any ${currentTab === 'all' ? 'lost or found' : currentTab} items yet.</p>
        <div class="buttons">
          ${currentTab === 'all' || currentTab === 'lost' ? 
            `<a href="report-lost.html" class="btn btn-primary">Report Lost Item</a>` : ''}
          ${currentTab === 'all' || currentTab === 'found' ? 
            `<a href="report-found.html" class="btn btn-secondary">Report Found Item</a>` : ''}
        </div>
      </div>
    `;
    return;
  }
  
  // Create user items HTML
  userItems.innerHTML = '<div class="items-grid">' + 
    itemsToDisplay.map((item, index) => createUserItemCard(item, index)).join('') + 
    '</div>';
  
  // Add event listeners to delete buttons
  document.querySelectorAll('.delete-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-id');
      const itemType = btn.getAttribute('data-type');
      confirmDeleteItem(itemId, itemType);
    });
  });
}

/**
 * Create a user item card
 * @param {Object} item Item data
 * @param {number} index Item index for animation delay
 * @returns {string} HTML for the item card
 */
function createUserItemCard(item, index) {
  const itemDate = new Date(item.date || item.createdAt).toLocaleDateString();
  const animationDelay = `style="animation-delay: ${index * 0.1}s"`;
  
  return `
    <div class="item-card ${item.type} user-item" ${animationDelay}>
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
              <span>${item.turnedIn ? 'Turned in to Lost & Found Office' : 'Being held by you'}</span>
            </div>
          ` : ''}
        </div>
        <p class="item-description">${item.description}</p>
      </div>
      <div class="item-card-footer">
        <span>Reported on: ${new Date(item.createdAt).toLocaleDateString()}</span>
        <div class="item-actions">
          <button class="btn btn-danger delete-item-btn" data-id="${item.id}" data-type="${item.type}">Delete</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show confirmation dialog for item deletion
 * @param {number} itemId ID of the item to delete
 * @param {string} itemType Type of the item (lost or found)
 */
function confirmDeleteItem(itemId, itemType) {
  // Create modal backdrop
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  
  // Create modal content
  modalBackdrop.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>Confirm Deletion</h3>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this ${itemType} item? This action cannot be undone.</p>
      </div>
      <div class="modal-footer">
        <button id="cancel-delete" class="btn btn-secondary">Cancel</button>
        <button id="confirm-delete" class="btn btn-danger">Delete</button>
      </div>
    </div>
  `;
  
  // Add modal to the body
  document.body.appendChild(modalBackdrop);
  
  // Add event listeners
  document.getElementById('cancel-delete').addEventListener('click', () => {
    modalBackdrop.remove();
  });
  
  document.getElementById('confirm-delete').addEventListener('click', async () => {
    try {
      // Show loading state
      document.getElementById('confirm-delete').textContent = 'Deleting...';
      document.getElementById('confirm-delete').disabled = true;
      
      // Delete the item
      if (itemType === 'lost') {
        await deleteLostItem(itemId);
      } else if (itemType === 'found') {
        await deleteFoundItem(itemId);
      }
      
      // Remove modal
      modalBackdrop.remove();
      
      // Refresh user items
      loadUserDashboard(currentUser);
      
    } catch (error) {
      console.error('Error deleting item:', error);
      
      // Show error in modal
      const modalBody = modalBackdrop.querySelector('.modal-body');
      modalBody.innerHTML = `
        <p class="error-message">Failed to delete item: ${error.message}</p>
      `;
      
      // Reset button
      document.getElementById('confirm-delete').textContent = 'Delete';
      document.getElementById('confirm-delete').disabled = false;
    }
  });
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboardPage);