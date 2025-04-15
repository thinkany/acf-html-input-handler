(function ($) {
    // Wait for both ACF and Gutenberg to be ready
    function waitForAcf() {
        if (typeof acf === "undefined" || !acf.field || !acf.field.Tab) {
            setTimeout(waitForAcf, 100);
            return;
        }

        // Wait for Gutenberg to be ready
        if (window.wp && wp.data && wp.data.subscribe) {
            const unsubscribe = wp.data.subscribe(() => {
                const isEditorReady = wp.data.select('core/editor') !== null;
                if (isEditorReady) {
                    unsubscribe();
                    initializePreviewDelay();
                }
            });
        } else {
            // Fallback for non-Gutenberg contexts
            initializePreviewDelay();
        }
    }

    // Start waiting for ACF
    waitForAcf();

    function initializePreviewDelay() {
        // Track HTML typing state globally
        let activeHtmlFields = new Set();
        let originalRefreshPreview;
        let isPreventingUpdates = false;

        // Block Gutenberg updates
        if (window.wp && wp.data && wp.data.dispatch) {
            const { lockPostSaving, unlockPostSaving } = wp.data.dispatch('core/editor');
            const originalUpdateBlockAttributes = wp.data.dispatch('core/block-editor').updateBlockAttributes;
            
            wp.data.dispatch('core/block-editor').updateBlockAttributes = function(...args) {
                if (isPreventingUpdates) {
                    return;
                }
                return originalUpdateBlockAttributes.apply(this, args);
            };
        }

        function containsHtml(value) {
            // More aggressive check - any < followed by a letter or number
            return /<[a-zA-Z0-9]/.test(value);
        }

        // Override ACF's refresh_preview completely
        if (acf.preview && acf.preview.refresh) {
            originalRefreshPreview = acf.preview.refresh;
            acf.preview.refresh = function() {
                if (activeHtmlFields.size > 0) {
                    return;
                }
                originalRefreshPreview.apply(this, arguments);
            };
        }

        function attachFieldListeners(context) {
            $(context).find(".acf-field[data-type='text'], .acf-field[data-type='textarea']").each(function () {
                let $field = $(this).find("[name]");
                let typingTimer;
                let lastKeyTime = 0;
                const DELAY = 1000; // 1 second delay for non-HTML content
                const fieldId = $field.attr('name') || $field.attr('id') || Date.now();

                // Add focus handler
                $field.on("focus", function() {
                    if (containsHtml($field.val())) {
                        activeHtmlFields.add(fieldId);
                        isPreventingUpdates = true;
                    }
                });

                // Monitor for < character specifically
                $field.on("keydown", function(e) {
                    if (e.key === '<') {
                        activeHtmlFields.add(fieldId);
                        isPreventingUpdates = true;
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                    }
                });

                $field.on("input", function(e) {
                    let fieldValue = $field.val();
                    clearTimeout(typingTimer);

                    // Update HTML tracking
                    if (containsHtml(fieldValue)) {
                        activeHtmlFields.add(fieldId);
                        isPreventingUpdates = true;
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                        e.preventDefault();
                        return false;
                    }

                    // For non-HTML content
                    if (!activeHtmlFields.has(fieldId)) {
                        isPreventingUpdates = false;
                        const now = Date.now();
                        lastKeyTime = now;

                        typingTimer = setTimeout(function () {
                            if (lastKeyTime === now) {
                                if (originalRefreshPreview) {
                                    originalRefreshPreview.call(acf.preview);
                                }
                            }
                        }, DELAY);
                    }
                });

                $field.on("blur", function () {
                    let fieldValue = $field.val();
                    
                    // Remove from active HTML fields
                    activeHtmlFields.delete(fieldId);
                    isPreventingUpdates = false;
                    
                    // Always update on blur, with a small delay to ensure field is settled
                    setTimeout(function() {
                        if (originalRefreshPreview) {
                            originalRefreshPreview.call(acf.preview);
                        }
                    }, 100);
                });
            });
        }

        // Check for existing fields on page load
        attachFieldListeners(document);

        // Observe Gutenberg for dynamically added ACF blocks
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    $(mutation.addedNodes).each(function () {
                        if ($(this).find(".acf-field").length) {
                            attachFieldListeners(this);
                        }
                    });
                }
            });
        });

        // Start observing changes inside the editor
        observer.observe(document.body, { childList: true, subtree: true });
    }
})(jQuery);
