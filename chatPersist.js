document.addEventListener('DOMContentLoaded', () => {
  console.log("chatPersist.js: DOM fully loaded.");

  if (typeof jQuery === 'undefined') {
    console.error("chatPersist.js: jQuery is required but not found. Script will not run.");
    return;
  }

  jQuery(document).ready(function($) {
    const popupId = 12698;
    const MAX_RETRIES = 50;
    let retryCount = 0;

    // Debounce utility
    function debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    // Wait for Elementor Pro with retry limit
    function waitForElementorPro(callback) {
      if (typeof elementorProFrontend !== 'undefined' &&
          typeof elementorProFrontend.modules !== 'undefined' &&
          typeof elementorProFrontend.modules.popup !== 'undefined') {
        console.log("chatPersist.js: Elementor Pro detected.");
        callback();
      } else if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`chatPersist.js: Waiting for Elementor Pro (attempt ${retryCount}/${MAX_RETRIES})...`);
        setTimeout(() => waitForElementorPro(callback), 100);
      } else {
        console.error("chatPersist.js: Elementor Pro not detected after max retries. Using fallback.");
        callback(true);
      }
    }

    // Show popup with reinitialization
    function showPopup(isFallbackMode = false) {
      try {
        if (!isFallbackMode && elementorProFrontend?.modules?.popup?.showPopup) {
          elementorProFrontend.modules.popup.showPopup({ id: popupId });
        } else {
          const $popup = $(`[data-elementor-id="${popupId}"]`);
          if ($popup.length) {
            $popup.show().addClass('elementor-popup-modal--active dialog-visible');
            console.log("chatPersist.js: Fallback - Popup shown via jQuery.");
          } else {
            console.warn("chatPersist.js: Popup element not found for ID", popupId);
            return;
          }
        }
        sessionStorage.setItem('popupShown', 'true');
        setTimeout(() => reinitializeChat(), 100);
      } catch (error) {
        console.error("chatPersist.js: Error triggering popup:", error);
      }
    }

    // Reinitialize chat UI with vanilla CustomEvent
    function reinitializeChat() {
      const chatContainer = document.getElementById('chat-container');
      if (!chatContainer || chatContainer.offsetParent === null) {
        console.warn("chatPersist.js: Chat container not visible yet, retrying...");
        setTimeout(reinitializeChat, 100);
        return;
      }
      const reinitializeEvent = new CustomEvent('chatReinitialize');
      document.dispatchEvent(reinitializeEvent);
      console.log("chatPersist.js: Dispatched chatReinitialize event.");
    }

    // Check popup state
    function checkPopupState(isFallbackMode = false) {
      if (sessionStorage.getItem('popupClosed') !== 'true' &&
          (window.location.hash === '#cloudie' || sessionStorage.getItem('popupShown') === 'true')) {
        showPopup(isFallbackMode);
      }
    }

    const debouncedCheckPopupState = debounce(checkPopupState, 200);

    // Handle link clicks to open popup
    function attachLinkListener() {
      const $links = $('a[href="#cloudie"]');
      if ($links.length === 0) console.warn("chatPersist.js: No links with href='#cloudie' found.");
      $links.off('click.cloudie').on('click.cloudie', function(e) {
        e.preventDefault();
        showPopup();
        sessionStorage.removeItem('popupClosed');
      });
    }

    // Handle popup hide
    $(document).off('elementor/popup/hide.cloudie').on('elementor/popup/hide.cloudie', function(event, id) {
      if (id === popupId) {
        sessionStorage.setItem('popupClosed', 'true');
        sessionStorage.removeItem('popupShown');
        if (window.location.hash === '#cloudie') {
          history.replaceState(null, null, window.location.pathname);
          console.log("chatPersist.js: Removed #cloudie from URL.");
        }
      }
    });

    // Preserve popup state on navigation
    function attachNavigationListener() {
      const $navLinks = $('a:not([href="#cloudie"])');
      if ($navLinks.length === 0) console.warn("chatPersist.js: No navigation links found.");
      $navLinks.off('click.cloudie').on('click.cloudie', function(e) {
        if (sessionStorage.getItem('popupShown') === 'true' && !this.href.includes('#')) {
          e.preventDefault();
          window.location.href = this.href + '#cloudie';
        }
      });
    }

    // Initialize
    waitForElementorPro((isFallbackMode) => {
      attachLinkListener();
      attachNavigationListener();
      checkPopupState(isFallbackMode);
      $(window).off('hashchange.cloudie').on('hashchange.cloudie', () => debouncedCheckPopupState(isFallbackMode));
      console.log("chatPersist.js: Initialization complete.");
    });
  });
});