// Load saved data when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadSavedData();
  loadCustomFields();

  // Event listeners
  document.getElementById('saveBtn').addEventListener('click', saveData);
  document.getElementById('fillBtn').addEventListener('click', fillCurrentPage);
  document.getElementById('clearBtn').addEventListener('click', clearData);
  document.getElementById('addFieldBtn').addEventListener('click', addCustomField);
});

// Load saved data from storage
function loadSavedData() {
  chrome.storage.sync.get(['autofillData'], (result) => {
    if (result.autofillData) {
      const data = result.autofillData;
      document.getElementById('firstName').value = data.firstName || '';
      document.getElementById('lastName').value = data.lastName || '';
      document.getElementById('email').value = data.email || '';
      document.getElementById('phone').value = data.phone || '';
      document.getElementById('address').value = data.address || '';
      document.getElementById('city').value = data.city || '';
      document.getElementById('zipCode').value = data.zipCode || '';
      document.getElementById('country').value = data.country || '';
      document.getElementById('company').value = data.company || '';
      document.getElementById('jobTitle').value = data.jobTitle || '';
      document.getElementById('location').value = data.location || '';
      document.getElementById('description').value = data.description || '';
      document.getElementById('company2').value = data.company2 || '';
      document.getElementById('jobTitle2').value = data.jobTitle2 || '';
      document.getElementById('location2').value = data.location2 || '';
      document.getElementById('description2').value = data.description2 || '';
      document.getElementById('linkedin').value = data.linkedin || '';
      document.getElementById('portfolio').value = data.portfolio || '';
    }
  });
}

// Save data to storage
function saveData() {
  const data = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    city: document.getElementById('city').value,
    zipCode: document.getElementById('zipCode').value,
    country: document.getElementById('country').value,
    company: document.getElementById('company').value,
    jobTitle: document.getElementById('jobTitle').value,
    location: document.getElementById('location').value,
    description: document.getElementById('description').value,
    company2: document.getElementById('company2').value,
    jobTitle2: document.getElementById('jobTitle2').value,
    location2: document.getElementById('location2').value,
    description2: document.getElementById('description2').value,
    linkedin: document.getElementById('linkedin').value,
    portfolio: document.getElementById('portfolio').value
  };

  chrome.storage.sync.set({ autofillData: data }, () => {
    showStatus('Data saved successfully!', 'success');
  });
}

// Fill current page
function fillCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    
    // Check if we can inject scripts on this page
    if (currentTab.url.startsWith('chrome://') || 
        currentTab.url.startsWith('edge://') || 
        currentTab.url.startsWith('about:') ||
        currentTab.url.startsWith('chrome-extension://')) {
      showStatus('Cannot fill forms on browser pages', 'error');
      return;
    }
    
    chrome.storage.sync.get(['autofillData', 'customFields'], (result) => {
      if (!result.autofillData) {
        showStatus('No saved data found', 'error');
        return;
      }
      
      // Try to send message, if fails, inject content script first
      chrome.tabs.sendMessage(
        currentTab.id,
        { action: 'fillForm', data: result.autofillData, customFields: result.customFields || [] },
        (response) => {
          if (chrome.runtime.lastError) {
            // Content script not loaded, inject it
            chrome.scripting.executeScript({
              target: { tabId: currentTab.id },
              files: ['content.js']
            }).then(() => {
              // Try again after injecting
              setTimeout(() => {
                chrome.tabs.sendMessage(
                  currentTab.id,
                  { action: 'fillForm', data: result.autofillData, customFields: result.customFields || [] },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      showStatus('Error: Could not fill form', 'error');
                    } else {
                      showStatus('Form filled successfully!', 'success');
                    }
                  }
                );
              }, 100);
            }).catch((error) => {
              showStatus('Error: Cannot access this page', 'error');
            });
          } else {
            showStatus('Form filled successfully!', 'success');
          }
        }
      );
    });
  });
}

// Clear all data
function clearData() {
  if (confirm('Are you sure you want to clear all saved data including custom fields?')) {
    chrome.storage.sync.remove(['autofillData', 'customFields'], () => {
      document.getElementById('firstName').value = '';
      document.getElementById('lastName').value = '';
      document.getElementById('email').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('address').value = '';
      document.getElementById('city').value = '';
      document.getElementById('zipCode').value = '';
      document.getElementById('country').value = '';
      document.getElementById('company').value = '';
      document.getElementById('jobTitle').value = '';
      document.getElementById('location').value = '';
      document.getElementById('description').value = '';
      document.getElementById('company2').value = '';
      document.getElementById('jobTitle2').value = '';
      document.getElementById('location2').value = '';
      document.getElementById('description2').value = '';
      document.getElementById('linkedin').value = '';
      document.getElementById('portfolio').value = '';
      loadCustomFields();
      showStatus('Data cleared', 'success');
    });
  }
}

// Load custom fields
function loadCustomFields() {
  chrome.storage.sync.get(['customFields'], (result) => {
    const customFields = result.customFields || [];
    const container = document.getElementById('customFieldsContainer');
    container.innerHTML = '';
    
    customFields.forEach((field, index) => {
      addCustomFieldToUI(field.name, field.value, index);
    });
  });
}

// Add custom field to UI
function addCustomFieldToUI(name, value, index) {
  const container = document.getElementById('customFieldsContainer');
  const fieldDiv = document.createElement('div');
  fieldDiv.className = 'custom-field-item';
  fieldDiv.innerHTML = `
    <input type="text" value="${name}" placeholder="Field Name" data-index="${index}" class="custom-name">
    <input type="text" value="${value}" placeholder="Value" data-index="${index}" class="custom-value">
    <button class="btn-remove" data-index="${index}">Remove</button>
  `;
  
  fieldDiv.querySelector('.btn-remove').addEventListener('click', (e) => {
    removeCustomField(parseInt(e.target.dataset.index));
  });
  
  fieldDiv.querySelector('.custom-name').addEventListener('input', saveCustomFields);
  fieldDiv.querySelector('.custom-value').addEventListener('input', saveCustomFields);
  
  container.appendChild(fieldDiv);
}

// Add new custom field
function addCustomField() {
  const nameInput = document.getElementById('newFieldName');
  const valueInput = document.getElementById('newFieldValue');
  
  const name = nameInput.value.trim();
  const value = valueInput.value.trim();
  
  if (!name || !value) {
    showStatus('Please enter both field name and value', 'error');
    return;
  }
  
  chrome.storage.sync.get(['customFields'], (result) => {
    const customFields = result.customFields || [];
    customFields.push({ name, value });
    
    chrome.storage.sync.set({ customFields }, () => {
      loadCustomFields();
      nameInput.value = '';
      valueInput.value = '';
      showStatus('Custom field added', 'success');
    });
  });
}

// Remove custom field
function removeCustomField(index) {
  chrome.storage.sync.get(['customFields'], (result) => {
    const customFields = result.customFields || [];
    customFields.splice(index, 1);
    
    chrome.storage.sync.set({ customFields }, () => {
      loadCustomFields();
      showStatus('Field removed', 'success');
    });
  });
}

// Save custom fields when edited
function saveCustomFields() {
  const customFields = [];
  document.querySelectorAll('.custom-field-item').forEach(item => {
    const name = item.querySelector('.custom-name').value.trim();
    const value = item.querySelector('.custom-value').value.trim();
    if (name && value) {
      customFields.push({ name, value });
    }
  });
  
  chrome.storage.sync.set({ customFields });
}

// Show status message
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}
