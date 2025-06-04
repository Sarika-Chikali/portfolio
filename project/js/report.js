/**
 * Report functionality
 * Handles reporting lost and found items
 */

import { reportLostItem, reportFoundItem } from './api.js';

// Determine the page type
const isLostPage = window.location.pathname.includes('report-lost.html');
const isFoundPage = window.location.pathname.includes('report-found.html');

// Get the form element
const lostItemForm = document.getElementById('lost-item-form');
const foundItemForm = document.getElementById('found-item-form');

/**
 * Initialize the report page
 */
function initReportPage() {
  // Set today as the default date
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  dateInputs.forEach(input => {
    input.value = today;
  });
  
  // Add event listeners to forms
  if (lostItemForm) {
    lostItemForm.addEventListener('submit', handleLostItemSubmit);
    
    // Pre-fill user name if available in localStorage
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      const userNameInput = document.getElementById('userName');
      if (userNameInput) {
        userNameInput.value = savedUserName;
      }
    }
  }
  
  if (foundItemForm) {
    foundItemForm.addEventListener('submit', handleFoundItemSubmit);
    
    // Pre-fill user name if available in localStorage
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      const userNameInput = document.getElementById('userName');
      if (userNameInput) {
        userNameInput.value = savedUserName;
      }
    }
  }
}

/**
 * Handle lost item form submission
 * @param {Event} event Form submit event
 */
async function handleLostItemSubmit(event) {
  event.preventDefault();
  
  try {
    // Show processing state
    const submitButton = lostItemForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    // Get form data
    const formData = new FormData(lostItemForm);
    const lostItemData = Object.fromEntries(formData.entries());
    
    // Save user name to localStorage
    localStorage.setItem('userName', lostItemData.userName);
    
    // Submit the report
    await reportLostItem(lostItemData);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Your lost item has been reported successfully!';
    lostItemForm.parentNode.insertBefore(successMessage, lostItemForm);
    
    // Reset form
    lostItemForm.reset();
    
    // Pre-fill the user name again
    const userNameInput = document.getElementById('userName');
    if (userNameInput) {
      userNameInput.value = lostItemData.userName;
    }
    
    // Set today as the default date again
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Restore button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    
    // Remove success message after 5 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
    
  } catch (error) {
    console.error('Error submitting lost item:', error);
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = `Failed to report lost item: ${error.message}`;
    lostItemForm.parentNode.insertBefore(errorMessage, lostItemForm);
    
    // Restore button state
    const submitButton = lostItemForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Submit Report';
    submitButton.disabled = false;
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }
}

/**
 * Handle found item form submission
 * @param {Event} event Form submit event
 */
async function handleFoundItemSubmit(event) {
  event.preventDefault();
  
  try {
    // Show processing state
    const submitButton = foundItemForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;
    
    // Get form data
    const formData = new FormData(foundItemForm);
    const foundItemData = Object.fromEntries(formData.entries());
    
    // Convert turnedIn string to boolean
    foundItemData.turnedIn = foundItemData.turnedIn === 'true';
    
    // Save user name to localStorage
    localStorage.setItem('userName', foundItemData.userName);
    
    // Submit the report
    await reportFoundItem(foundItemData);
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Your found item has been reported successfully!';
    foundItemForm.parentNode.insertBefore(successMessage, foundItemForm);
    
    // Reset form
    foundItemForm.reset();
    
    // Pre-fill the user name again
    const userNameInput = document.getElementById('userName');
    if (userNameInput) {
      userNameInput.value = foundItemData.userName;
    }
    
    // Set today as the default date again
    const dateInput = document.getElementById('date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Restore button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;
    
    // Remove success message after 5 seconds
    setTimeout(() => {
      successMessage.remove();
    }, 5000);
    
  } catch (error) {
    console.error('Error submitting found item:', error);
    
    // Show error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = `Failed to report found item: ${error.message}`;
    foundItemForm.parentNode.insertBefore(errorMessage, foundItemForm);
    
    // Restore button state
    const submitButton = foundItemForm.querySelector('button[type="submit"]');
    submitButton.textContent = 'Submit Report';
    submitButton.disabled = false;
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      errorMessage.remove();
    }, 5000);
  }
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', initReportPage);