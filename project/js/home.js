/**
 * Home page functionality
 * Displays recent lost and found items
 */

import { getRecentItems } from './api.js';

// DOM Elements
const recentItemsContainer = document.getElementById('recent-items-container');

/**
 * Initialize the home page
 */
async function initHomePage() {
  await loadRecentItems();
}

/**
 * Load and display recent items
 */
async function loadRecentItems() {
  try {
    // Show loading indicator
    recentItemsContainer.innerHTML = '<div class="loading">Loading recent items...</div>';
    
    // Fetch recent items
    const recentItems = await getRecentItems(6);
    
    // Display items or show empty state
    if (recentItems.length === 0) {
      recentItemsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Items Yet</h3>
          <p>Be the first to report a lost or found item!</p>
          <div class="buttons">
            <a href="report-lost.html" class="btn btn-primary">Report Lost Item</a>
            <a href="report-found.html" class="btn btn-secondary">Report Found Item</a>
          </div>
        </div>
      `;
      return;
    }
    
    // Clear loading indicator
    recentItemsContainer.innerHTML = '';
    
    // Create item cards with staggered animation delays
    recentItems.forEach((item, index) => {
      const itemCard = createItemCard(item);
      itemCard.style.animationDelay = `${index * 0.1}s`;
      recentItemsContainer.appendChild(itemCard);
    });
  } catch (error) {
    console.error('Error loading recent items:', error);
    recentItemsContainer.innerHTML = `
      <div class="error-state">
        <h3>Something went wrong</h3>
        <p>Failed to load recent items. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Create an item card element
 * @param {Object} item Item data
 * @returns {HTMLElement} Item card element
 */
function createItemCard(item) {
  const itemCard = document.createElement('div');
  itemCard.className = `item-card ${item.type} fade-in`;
  
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
      </div>
      <p class="item-description">${truncateText(item.description, 100)}</p>
    </div>
    <div class="item-card-footer">
      <span>Posted by: ${item.userName}</span>
      <a href="view-items.html" class="btn btn-primary contact-btn">View Details</a>
    </div>
  `;
  
  return itemCard;
}

/**
 * Truncate text to a specified length
 * @param {string} text Text to truncate
 * @param {number} maxLength Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', initHomePage);