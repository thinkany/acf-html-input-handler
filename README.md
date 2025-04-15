# ACF HTML Input Handler

A WordPress plugin that prevents ACF field updates while typing HTML content to avoid the InvalidCharacterError.

## Description

This plugin solves the issue of ACF text and textarea fields breaking when typing HTML content by:
- Preventing automatic updates while HTML is being typed
- Allowing normal updates for plain text content (preview occurs as it normally would)
- Updating the preview of fields containing HTML will only happen once the field loses focus (clicked away from)
- HTML Content Example: 
```
<span>copy content</span> or <br> etc.
```
- If a field has HTML within the text value, upon removal of the HTML the preview update will occur when the field loses focus (clicked away from)

## Requirements

- WordPress 5.0 or higher
- Advanced Custom Fields Pro 5.0 or higher
- Tested with ACF Block architecture only
- Gutenberg editor (Block editor)
- Note: Not extensively tested with any other plugins that may manipulate ACF fields

## Installation

1. Upload the `acf-html-input-handler` folder to the `/wp-content/plugins/` directory

- Your Installation folder should look like the following
```
acf-html-input-handler/
├── acf-html-input-handler.php
├── README.md
└── js/
    └── acf-html-input-handler.js
```
2. Activate the plugin through the 'Plugins' menu in WordPress

## Usage

Once activated, the plugin works automatically with any ACF text or textarea fields in the Gutenberg editor. No additional configuration needed.

## Changelog

### 1.0.25
- Initial release
