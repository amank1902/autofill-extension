// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    fillFormFields(request.data, request.customFields || []);
    sendResponse({ success: true });
  }
  return true;
});

// Fill form fields on the page
function fillFormFields(data, customFields = []) {
  // Find and fill all input fields
  const inputs = document.querySelectorAll('input, textarea, select');
  
  inputs.forEach(input => {
    const inputName = input.name?.toLowerCase() || '';
    const inputId = input.id?.toLowerCase() || '';
    const inputType = input.type?.toLowerCase() || '';
    const placeholder = input.placeholder?.toLowerCase() || '';
    const label = findLabelForInput(input)?.toLowerCase() || '';
    
    // Combine all identifiers for matching
    const identifier = `${inputName} ${inputId} ${inputType} ${placeholder} ${label}`;
    
    // Skip if input is hidden or disabled
    if (input.type === 'hidden' || input.disabled || input.readOnly) {
      return;
    }
    
    // Match and fill based on field type
    // Check specific name fields first before generic "name"
    if (matchesField(identifier, ['first', 'firstname', 'first_name', 'fname', 'given', 'givenname', 'given_name'])) {
      fillInput(input, data.firstName);
      return; // Exit early to prevent custom field override
    } else if (matchesField(identifier, ['last', 'lastname', 'last_name', 'lname', 'surname', 'family', 'familyname', 'family_name'])) {
      fillInput(input, data.lastName);
      return;
    } else if (matchesField(identifier, ['name', 'full', 'fullname', 'full_name']) && !matchesField(identifier, ['first', 'last', 'given', 'family', 'surname'])) {
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      fillInput(input, fullName);
      return;
    } else if (matchesField(identifier, ['email', 'e-mail', 'mail'])) {
      fillInput(input, data.email);
      return;
    } else if (matchesField(identifier, ['phone', 'tel', 'mobile', 'telephone', 'contact', 'phonenumber', 'phone_number']) && !matchesField(identifier, ['extension', 'ext', 'code'])) {
      fillInput(input, data.phone);
      return; // Exit early - this is the key fix
    } else if (matchesField(identifier, ['address', 'street', 'address1', 'addr'])) {
      fillInput(input, data.address);
      return;
    } else if (matchesField(identifier, ['city', 'town'])) {
      fillInput(input, data.city);
      return;
    } else if (matchesField(identifier, ['zip', 'postal', 'postcode', 'zipcode', 'zip_code'])) {
      fillInput(input, data.zipCode);
      return;
    } else if (matchesField(identifier, ['country', 'nation'])) {
      fillInput(input, data.country);
      return;
    } else if (matchesField(identifier, ['company', 'organization', 'organisation', 'employer'])) {
      fillInput(input, data.company);
      return;
    } else if (matchesField(identifier, ['job', 'title', 'position', 'jobtitle', 'job_title'])) {
      fillInput(input, data.jobTitle);
      return;
    } else if (matchesField(identifier, ['location', 'work_location', 'office'])) {
      fillInput(input, data.location);
      return;
    } else if (matchesField(identifier, ['description', 'job_description', 'responsibilities', 'duties'])) {
      fillInput(input, data.description);
      return;
    } else if (matchesField(identifier, ['company2', 'previous', 'prev_company'])) {
      fillInput(input, data.company2);
      return;
    } else if (matchesField(identifier, ['jobtitle2', 'previous_title', 'prev_title'])) {
      fillInput(input, data.jobTitle2);
      return;
    } else if (matchesField(identifier, ['location2', 'prev_location'])) {
      fillInput(input, data.location2);
      return;
    } else if (matchesField(identifier, ['description2', 'prev_description'])) {
      fillInput(input, data.description2);
      return;
    } else if (matchesField(identifier, ['linkedin', 'linked_in', 'linked-in'])) {
      fillInput(input, data.linkedin);
      return;
    } else if (matchesField(identifier, ['portfolio', 'website', 'personal_website', 'site'])) {
      fillInput(input, data.portfolio);
      return;
    } else {
      // Check custom fields - require all keywords to match for better accuracy
      customFields.forEach(field => {
        const fieldKeywords = field.name.toLowerCase().split(/\s+/);
        // Check if all keywords from custom field name are present in identifier
        const allKeywordsMatch = fieldKeywords.every(keyword => 
          identifier.includes(keyword)
        );
        if (allKeywordsMatch && fieldKeywords.length > 0) {
          fillInput(input, field.value);
        }
      });
    }
  });
  
  // Show confirmation
  showFillConfirmation();
}

// Check if identifier matches any of the keywords
function matchesField(identifier, keywords) {
  return keywords.some(keyword => identifier.includes(keyword));
}

// Fill input field and trigger events
function fillInput(input, value) {
  if (!value) return;
  
  // Clear existing value first
  input.value = '';
  
  // Set new value
  input.value = value;
  
  // Trigger multiple events to ensure the page detects the change
  input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event('keyup', { bubbles: true, cancelable: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));
  
  // Trigger focus events for fields that need it
  input.focus();
  input.blur();
  
  // Add visual feedback
  input.style.transition = 'background-color 0.3s';
  input.style.backgroundColor = '#e7f3ff';
  setTimeout(() => {
    input.style.backgroundColor = '';
  }, 1000);
}

// Find label associated with input
function findLabelForInput(input) {
  // Check for label with for attribute
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent;
  }
  
  // Check for parent label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent;
  
  // Check for previous sibling label
  let prev = input.previousElementSibling;
  if (prev && prev.tagName === 'LABEL') {
    return prev.textContent;
  }
  
  return '';
}

// Show confirmation message
function showFillConfirmation() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 600;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = '✓ Form filled successfully!';
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
