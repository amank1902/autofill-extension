# AutoFill Assistant Browser Extension

A simple and efficient browser extension to automatically fill form fields with your saved data.

## Features

- 🚀 Quick form filling with one click
- 💾 Securely stores your data in browser storage
- 🎯 Smart field detection (name, email, phone, address, etc.)
- ✨ Visual feedback when forms are filled
- 🔒 Data stored locally in your browser

## Installation

### Chrome/Edge/Brave

1. Open your browser and navigate to extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`

2. Enable "Developer mode" (toggle in top-right corner)

3. Click "Load unpacked"

4. Select the `extension` folder

5. The extension icon should appear in your toolbar

### Firefox

1. Open Firefox and navigate to `about:debugging`

2. Click "This Firefox"

3. Click "Load Temporary Add-on"

4. Select the `manifest.json` file from the extension folder

## Usage

1. **Save Your Data**: Click the extension icon and enter your information in the popup

2. **Fill Forms**: Navigate to any webpage with a form, click the extension icon, and click "Fill Current Page"

3. **Manage Data**: Use the "Clear Data" button to remove all saved information

## Supported Fields

- Full Name (automatically splits into first/last name)
- Email Address
- Phone Number
- Address
- City
- Zip/Postal Code
- Country
- Company
- Job Title

## How It Works

The extension uses:
- **Content Script**: Detects and fills form fields on web pages
- **Popup Interface**: Manages your saved data
- **Chrome Storage API**: Securely stores your information

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- You can clear your data at any time

