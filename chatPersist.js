document.addEventListener('DOMContentLoaded', () => {
  console.log("chatPersist.js: DOM fully loaded.");

  if (typeof jQuery === 'undefined') {
    console.error("chatPersist.js: jQuery is required but not found. Script will not run.");
    return;
  }

  jQuery(document).ready(function($) {
    const popupId = 12698;
    const MAX_RETRIES = 20; // Reduced retries for efficiency
    const CHAT_RETRIES = 20; // Chat container retries

    // Utility to wait for an element with a timeout
    function waitForElement(selector, callback, maxAttempts = MAX_RETRIES, attempt = 0) {
      const $element = $(selector);
      if ($element.length) {
        callback($element);
      } else if (attempt < maxAttempts) {
        setTimeout(() => waitForElement(selector, callback, maxAttempts, attempt + 1), 100);
      } else {
        console.error(`chatPersist.js: Element ${selector} not found after ${maxAttempts} retries.`);
      }
    }

    // Show the popup with robust fallback
    function showPopup() {
      const $popup = $(`[data-elementor-id="${popupId}"]`);
      let popupShown = false;

      // Try Elementor Pro first
      if (typeof elementorProFrontend?.modules?.popup?.showPopup === 'function') {
        try {
          console.log("chatPersist.js: Attempting to show popup with Elementor Pro...");
          elementorProFrontend.modules.popup.showPopup({ id: popupId });
          popupShown = $popup.length && $popup.is(':visible');
          if (popupShown) console.log("chatPersist.js: Popup shown via Elementor Pro.");
        } catch (error) {
          console.warn("chatPersist.js: Elementor Pro failed:", error);
        }
      }

      // Fallback to jQuery if Elementor fails or popup isn’t visible
      if (!popupShown) {
        waitForElement(`[data-elementor-id="${popupId}"]`, ($popup) => {
          $popup.show().addClass('elementor-popup-modal--active dialog-visible');
          if ($popup.is(':visible')) {
            console.log("chatPersist.js: Popup shown via jQuery fallback.");
            popupShown = true;
          } else {
            console.error("chatPersist.js: Popup element found but not visible after jQuery attempt.");
          }
          finalizePopup(popupShown);
        });
      } else {
        finalizePopup(popupShown);
      }
    }

    // Finalize popup state and reinitialize chat
    function finalizePopup(popupShown) {
      if (popupShown) {
        sessionStorage.setItem('chatPopupActive', 'true');
        reinitializeChat();
      }
    }

    // Reinitialize chat with retry logic
    function reinitializeChat(retryAttempt = 0) {
      waitForElement('#chat-container', ($chatContainer) => {
        if ($chatContainer.is(':visible')) {
          const event = new CustomEvent('chatReinitialize');
          document.dispatchEvent(event);
          console.log("chatPersist.js: Chat reinitialized.");
        } else if (retryAttempt < CHAT_RETRIES) {
          console.warn(`chatPersist.js: Chat container not visible, retrying (${retryAttempt + 1}/${CHAT_RETRIES})...`);
          setTimeout(() => reinitializeChat(retryAttempt + 1), 100);
        } else {
          console.error("chatPersist.js: Chat container not visible after retries.");
        }
      }, CHAT_RETRIES, retryAttempt);
    }

    // Open popup and set session tag
    function openPopup() {
      console.log("chatPersist.js: Opening popup...");
      showPopup();
    }

    // Close popup and clear session tag
    function closePopup() {
      const $popup = $(`[data-elementor-id="${popupId}"]`);
      if ($popup.length) {
        $popup.hide().removeClass('elementor-popup-modal--active dialog-visible');
        console.log("chatPersist.js: Popup closed via jQuery.");
      }
      sessionStorage.removeItem('chatPopupActive');
      if (window.location.hash === '#cloudie') {
        history.replaceState(null, null, window.location.pathname);
        console.log("chatPersist.js: Removed #cloudie from URL.");
      }
    }

    // Simulate #cloudie on page load if tagged
    function checkPopupOnLoad() {
      if (sessionStorage.getItem('chatPopupActive') === 'true') {
        console.log("chatPersist.js: Chat popup tagged as active, simulating #cloudie...");
        if (window.location.hash !== '#cloudie') {
          window.location.hash = '#cloudie';
        } else {
          openPopup(); // Direct trigger if hash already present
        }
      }
    }

    // Event listeners
    function setupListeners() {
      // Open popup on #cloudie links
      $('a[href="#cloudie"]').on('click.cloudie', (e) => {
        e.preventDefault();
        openPopup();
      });

      // Close popup on Elementor hide event
      $(document).on('elementor/popup/hide.cloudie', (event, id) => {
        if (id === popupId) {
          console.log("chatPersist.js: Elementor popup hide detected.");
          closePopup();
        }
      });

      // Navigation: append #cloudie if popup active
      $('a:not([href="#cloudie"]):not([href^="javascript"])').on('click.cloudie', (e) => {
        const href = e.currentTarget.href;
        if (sessionStorage.getItem('chatPopupActive') === 'true' && href && !href.includes('#')) {
          e.preventDefault();
          console.log("chatPersist.js: Navigation detected, appending #cloudie to", href);
          window.location.href = href + '#cloudie';
        }
      });

      // Hash change triggers popup
      $(window).on('hashchange.cloudie', () => {
        if (window.location.hash === '#cloudie' && sessionStorage.getItem('chatPopupActive') === 'true') {
          console.log("chatPersist.js: Hashchange to #cloudie detected, opening popup...");
          openPopup();
        }
      });
    }

    // Initialize
    console.log("chatPersist.js: Starting initialization...");
    setupListeners();
    checkPopupOnLoad(); // Check immediately on load
    $(document).on('DOMContentLoaded elementor/loaded', () => {
      console.log("chatPersist.js: Page fully loaded, rechecking popup state...");
      checkPopupOnLoad();
    });
    console.log("chatPersist.js: Initialization complete.");
  });
});