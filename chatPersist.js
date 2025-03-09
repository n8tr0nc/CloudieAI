document.addEventListener('DOMContentLoaded', () => {
  console.log("chatPersist.js: DOM fully loaded.");

  if (typeof jQuery === 'undefined') {
    console.error("chatPersist.js: jQuery is required but not found.");
    return;
  }

  jQuery(document).ready(function($) {
    const popupId = 12698;
    const MAX_RETRIES = 20;

    // Wait for element with streamlined retries
    function waitForElement(selector, callback, retries = MAX_RETRIES) {
      const $element = $(selector);
      if ($element.length) {
        callback($element);
      } else if (retries > 0) {
        setTimeout(() => waitForElement(selector, callback, retries - 1), 100);
      } else {
        console.error(`chatPersist.js: ${selector} not found after ${MAX_RETRIES} retries.`);
      }
    }

    // Show popup with robust fallback
    function showPopup() {
      const popupSelector = `[data-elementor-id="${popupId}"]`;
      let popupShown = false;

      if (typeof elementorProFrontend?.modules?.popup?.showPopup === 'function') {
        try {
          console.log("chatPersist.js: Attempting Elementor Pro popup...");
          elementorProFrontend.modules.popup.showPopup({ id: popupId });
          const $popup = $(popupSelector);
          popupShown = $popup.length && $popup.is(':visible');
          if (popupShown) console.log("chatPersist.js: Popup shown via Elementor Pro.");
        } catch (error) {
          console.warn("chatPersist.js: Elementor Pro failed:", error);
        }
      }

      if (!popupShown) {
        waitForElement(popupSelector, ($popup) => {
          $popup.show().addClass('elementor-popup-modal--active dialog-visible');
          popupShown = $popup.is(':visible');
          if (popupShown) console.log("chatPersist.js: Popup shown via jQuery fallback.");
          finalizePopup(popupShown);
        });
      } else {
        finalizePopup(popupShown);
      }
    }

    // Finalize popup state
    function finalizePopup(popupShown) {
      if (popupShown) {
        sessionStorage.setItem('chatPopupActive', 'true');
        console.log("chatPersist.js: Popup active, session tagged.");
        reinitializeChat();
      }
    }

    // Reinitialize chat
    function reinitializeChat(retries = MAX_RETRIES) {
      waitForElement('#chat-container', ($chatContainer) => {
        if ($chatContainer.is(':visible')) {
          document.dispatchEvent(new CustomEvent('chatReinitialize'));
          console.log("chatPersist.js: Chat reinitialized.");
        } else if (retries > 0) {
          console.warn(`chatPersist.js: #chat-container not visible, retrying (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
          setTimeout(() => reinitializeChat(retries - 1), 100);
        } else {
          console.error("chatPersist.js: #chat-container not visible after retries.");
        }
      }, retries);
    }

    // Open popup
    function openPopup() {
      console.log("chatPersist.js: Opening popup...");
      showPopup();
    }

    // Close popup
    function closePopup() {
      const $popup = $(`[data-elementor-id="${popupId}"]`);
      if ($popup.length) {
        $popup.hide().removeClass('elementor-popup-modal--active dialog-visible');
        console.log("chatPersist.js: Popup closed.");
      }
      sessionStorage.removeItem('chatPopupActive');
      if (window.location.hash === '#cloudie') {
        history.replaceState(null, null, window.location.pathname);
        console.log("chatPersist.js: Removed #cloudie from URL.");
      }
    }

    // Check popup state on load
    function checkPopupState() {
      if (sessionStorage.getItem('chatPopupActive') === 'true') {
        console.log("chatPersist.js: Chat popup active, ensuring #cloudie...");
        if (window.location.hash !== '#cloudie') {
          window.location.hash = '#cloudie';
        } else {
          openPopup();
        }
      }
    }

    // Setup event listeners
    function setupListeners() {
      $('a[href="#cloudie"]').on('click.cloudie', (e) => {
        e.preventDefault();
        openPopup();
      });

      $(document).on('elementor/popup/hide.cloudie', (event, id) => {
        if (id === popupId) {
          console.log("chatPersist.js: Elementor popup hide detected.");
          closePopup();
        }
      });

      $('a:not([href="#cloudie"]):not([href^="javascript"])').on('click.cloudie', (e) => {
        const href = e.currentTarget.href;
        if (sessionStorage.getItem('chatPopupActive') === 'true' && href && !href.includes('#')) {
          e.preventDefault();
          console.log("chatPersist.js: Navigation detected, appending #cloudie to", href);
          window.location.href = href + '#cloudie';
        }
      });

      $(window).on('hashchange.cloudie', () => {
        if (window.location.hash === '#cloudie' && sessionStorage.getItem('chatPopupActive') === 'true') {
          console.log("chatPersist.js: Hashchange to #cloudie, opening popup...");
          openPopup();
        }
      });
    }

    // Initialize
    console.log("chatPersist.js: Starting initialization...");
    setupListeners();
    checkPopupState();
    $(document).on('elementor/loaded', () => {
      console.log("chatPersist.js: Elementor loaded, rechecking popup state...");
      checkPopupState();
    });
    console.log("chatPersist.js: Initialization complete.");
  });
});