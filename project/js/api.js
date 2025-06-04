/**
 * API Service for the Lost and Found application
 * Handles all data operations and API requests
 */

const API_URL = 'http://localhost:3000';

/**
 * Get all lost items from the server
 * @returns {Promise<Array>} Array of lost items
 */
export async function getLostItems() {
  try {
    const response = await fetch(`${API_URL}/lostItems`);
    
    if (!response.ok) {
      throw new Error(`Error fetching lost items: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch lost items:', error);
    return [];
  }
}

/**
 * Get all found items from the server
 * @returns {Promise<Array>} Array of found items
 */
export async function getFoundItems() {
  try {
    const response = await fetch(`${API_URL}/foundItems`);
    
    if (!response.ok) {
      throw new Error(`Error fetching found items: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch found items:', error);
    return [];
  }
}

/**
 * Get all items (both lost and found) from the server
 * @returns {Promise<Object>} Object containing both lost and found items
 */
export async function getAllItems() {
  try {
    const [lostItems, foundItems] = await Promise.all([
      getLostItems(),
      getFoundItems()
    ]);
    
    return { lostItems, foundItems };
  } catch (error) {
    console.error('Failed to fetch all items:', error);
    return { lostItems: [], foundItems: [] };
  }
}

/**
 * Submit a new lost item report
 * @param {Object} itemData Data for the lost item
 * @returns {Promise<Object>} Created item data
 */
export async function reportLostItem(itemData) {
  try {
    const response = await fetch(`${API_URL}/lostItems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...itemData,
        createdAt: new Date().toISOString(),
        status: 'active'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error reporting lost item: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to report lost item:', error);
    throw error;
  }
}

/**
 * Submit a new found item report
 * @param {Object} itemData Data for the found item
 * @returns {Promise<Object>} Created item data
 */
export async function reportFoundItem(itemData) {
  try {
    const response = await fetch(`${API_URL}/foundItems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...itemData,
        createdAt: new Date().toISOString(),
        status: 'active'
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Error reporting found item: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to report found item:', error);
    throw error;
  }
}

/**
 * Delete a lost item by ID
 * @param {number} id ID of the item to delete
 * @returns {Promise<void>}
 */
export async function deleteLostItem(id) {
  try {
    const response = await fetch(`${API_URL}/lostItems/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting lost item: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete lost item:', error);
    throw error;
  }
}

/**
 * Delete a found item by ID
 * @param {number} id ID of the item to delete
 * @returns {Promise<void>}
 */
export async function deleteFoundItem(id) {
  try {
    const response = await fetch(`${API_URL}/foundItems/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting found item: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to delete found item:', error);
    throw error;
  }
}

/**
 * Update a lost item
 * @param {number} id ID of the item to update
 * @param {Object} itemData Updated item data
 * @returns {Promise<Object>} Updated item
 */
export async function updateLostItem(id, itemData) {
  try {
    const response = await fetch(`${API_URL}/lostItems/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating lost item: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update lost item:', error);
    throw error;
  }
}

/**
 * Update a found item
 * @param {number} id ID of the item to update
 * @param {Object} itemData Updated item data
 * @returns {Promise<Object>} Updated item
 */
export async function updateFoundItem(id, itemData) {
  try {
    const response = await fetch(`${API_URL}/foundItems/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating found item: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to update found item:', error);
    throw error;
  }
}

/**
 * Get user items by username
 * @param {string} userName Username to filter by
 * @returns {Promise<Object>} Object containing user's lost and found items
 */
export async function getUserItems(userName) {
  try {
    const [lostItems, foundItems] = await Promise.all([
      fetch(`${API_URL}/lostItems?userName=${encodeURIComponent(userName)}`).then(res => res.json()),
      fetch(`${API_URL}/foundItems?userName=${encodeURIComponent(userName)}`).then(res => res.json())
    ]);
    
    return { lostItems, foundItems };
  } catch (error) {
    console.error('Failed to fetch user items:', error);
    return { lostItems: [], foundItems: [] };
  }
}

/**
 * Get recent items (both lost and found)
 * @param {number} limit Maximum number of items to return
 * @returns {Promise<Array>} Array of recent items
 */
export async function getRecentItems(limit = 6) {
  try {
    const { lostItems, foundItems } = await getAllItems();
    
    // Combine both arrays and sort by creation date (newest first)
    const allItems = [
      ...lostItems.map(item => ({ ...item, type: 'lost' })),
      ...foundItems.map(item => ({ ...item, type: 'found' }))
    ];
    
    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Return only the specified number of items
    return allItems.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch recent items:', error);
    return [];
  }
}