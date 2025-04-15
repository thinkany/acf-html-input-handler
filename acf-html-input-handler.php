<?php
/*
Plugin Name: ACF HTML Input Handler
Plugin URI: https://github.com/thinkany/acf-html-input-handler
Description: Prevents ACF field updates when typing HTML tags in plain text fields to avoid 'InvalidCharacterError' within the Gutenberg editor
Version: 1.0.26
Author: thinkany
Author URI: https://thinkany.co
License: GPL v2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
*/

if (!defined('ABSPATH')) {
    exit;
}

function acf_html_input_handler_enqueue_scripts() {
    // Only load on post editing screens
    $screen = get_current_screen();
    if (!$screen || !method_exists($screen, 'is_block_editor') || !$screen->is_block_editor()) {
        return;
    }

    // Only load if ACF is active
    if (!class_exists('ACF')) {
        return;
    }

    wp_enqueue_script(
        'acf-html-input-handler',
        plugin_dir_url(__FILE__) . 'js/acf-html-input-handler.js',
        ['jquery', 'wp-blocks', 'wp-element', 'wp-editor'],
        '1.0.26',
        true
    );
}
add_action('admin_enqueue_scripts', 'acf_html_input_handler_enqueue_scripts');