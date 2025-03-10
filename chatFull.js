// chatFull.js
(() => {
  "use strict";

  // Constants
  const FULL_CHAT_CLASS = "full-chat";
  const POPUP_ID = "12698"; // Elementor popup ID

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Toggle full chat mode
  function toggleFullChat(e) {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    const body = document.body;
    const docEl = document.documentElement;
    const isFullChat = body.classList.contains(FULL_CHAT_CLASS);

    body.classList.toggle(FULL_CHAT_CLASS);
    if (!isFullChat) {
      docEl.style.overflow = "hidden";
      body.style.overflow = "hidden";
    } else {
      docEl.style.overflow = "";
      body.style.overflow = "";
      const chatLog = document.getElementById("chat-log");
      if (chatLog) {
        chatLog.scrollTop = chatLog.scrollHeight; // Silent scroll restore
      }
    }
    console.log(`chatFull.js: Full chat ${isFullChat ? "disabled..." : "enabled..."}`);
  }

  // Force open full chat if not already open
  function forceOpenFullChat() {
    if (!document.body.classList.contains(FULL_CHAT_CLASS)) {
      toggleFullChat();
      console.log("chatFull.js: Forced full chat open.");
    }
  }

  // Attach event listeners
  function attachListeners() {
    const fullChatIcon = document.getElementById("fullChat");
    if (fullChatIcon) {
      if (!fullChatIcon.dataset.listenerAttached) {
        fullChatIcon.addEventListener("click", debouncedToggleFullChat);
        fullChatIcon.dataset.listenerAttached = "true";
        console.log("chatFull.js: Full chat listener active...");
      }
    } else {
      console.warn("chatFull.js: Full chat icon (#fullChat) not found.");
    }

    const closeButtons = document.querySelectorAll(".dialog-close-button");
    if (closeButtons.length === 0) {
      console.warn("chatFull.js: No close buttons (.dialog-close-button) found.");
    }

    closeButtons.forEach((button) => {
      if (!button.dataset.listenerAttached) {
        button.addEventListener("click", () => {
          document.body.classList.remove(FULL_CHAT_CLASS);
          document.documentElement.style.overflow = "";
          document.body.style.overflow = "";
          const chatLog = document.getElementById("chat-log");
          if (chatLog) {
            chatLog.scrollTop = chatLog.scrollHeight; // Silent scroll restore
          }
          // No console.log here
        });
        button.dataset.listenerAttached = "true";
      }
    });

    // Check URL parameter for fullscreen
    const forceFullScreen = window.location.search.includes("fullscreen=1");
    if (forceFullScreen) {
      forceOpenFullChat();
    }
  }

  // Debounced toggle function
  const debouncedToggleFullChat = debounce(toggleFullChat, 200);

  // Trigger setup
  document.addEventListener("DOMContentLoaded", () => {
    // Manual trigger (e.g., <a href="#cloudie">)
    document.querySelectorAll('a[href="#cloudie"]').forEach(trigger => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        if (typeof elementorProFrontend?.modules?.popup?.showPopup === "function") {
          elementorProFrontend.modules.popup.showPopup({ id: POPUP_ID });
        }
        setTimeout(() => attachListeners(), 300); // Matches chatMain.js delay
      });
    });

    // Elementor popup event
    document.addEventListener("elementor/popup/show", (event) => {
      const { popupId } = event.detail || {};
      if (popupId === POPUP_ID) {
        setTimeout(() => attachListeners(), 300); // Matches chatMain.js delay
      }
    });

    // Custom reinitialize event
    document.addEventListener("chatReinitialize", () => {
      console.log("chatFull.js: Reinitializing full chat...");
      attachListeners();
    });
  });
})();