document.addEventListener('DOMContentLoaded', () => {
  console.log("chatFull.js: DOM fully loaded.");

  let forceFullScreen = window.location.search.includes('fullscreen=1');
  const FULL_CHAT_CLASS = 'full-chat';

  // Debounce utility to limit rapid toggle calls
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Toggle full chat mode with state management
  function toggleFullChat(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const body = document.body;
    const docEl = document.documentElement;
    const isFullChat = body.classList.contains(FULL_CHAT_CLASS);

    requestAnimationFrame(() => {
      body.classList.toggle(FULL_CHAT_CLASS);
      if (!isFullChat) {
        docEl.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
      } else {
        docEl.style.overflow = '';
        body.style.overflow = '';
      }
      console.log(`chatFull.js: Full chat ${isFullChat ? 'disabled' : 'enabled'}`);
    });
  }

  // Force open full chat if not already open
  function forceOpenFullChat() {
    if (!document.body.classList.contains(FULL_CHAT_CLASS)) {
      toggleFullChat();
      console.log("chatFull.js: Forced full chat open.");
    }
  }

  // Attach event listeners with safeguards
  function attachListeners() {
    const fullChatIcon = document.getElementById('fullChat');
    if (fullChatIcon && !fullChatIcon.dataset.listenerAttached) {
      fullChatIcon.addEventListener('click', debouncedToggleFullChat);
      fullChatIcon.dataset.listenerAttached = 'true';
      console.log("chatFull.js: Full chat icon listener attached.");
    } else if (!fullChatIcon) {
      console.warn("chatFull.js: Full chat icon (#fullChat) not found.");
    }

    const closeButtons = document.querySelectorAll('.dialog-close-button');
    if (closeButtons.length === 0) {
      console.warn("chatFull.js: No close buttons (.dialog-close-button) found.");
    }

    closeButtons.forEach((button) => {
      if (!button.dataset.listenerAttached) {
        button.addEventListener('click', () => {
          requestAnimationFrame(() => {
            document.body.classList.remove(FULL_CHAT_CLASS);
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            console.log("chatFull.js: Full chat closed via close button.");
          });
        });
        button.dataset.listenerAttached = 'true';
      }
    });
  }

  // Debounced toggle function
  const debouncedToggleFullChat = debounce(toggleFullChat, 200); // 200ms debounce

  // Initialize with MutationObserver
  const observer = new MutationObserver((mutations, obs) => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer && chatContainer.offsetParent !== null) {
      attachListeners();
      if (forceFullScreen) {
        forceOpenFullChat();
        forceFullScreen = false;
      }
      obs.disconnect(); // Stop observing after initialization
      console.log("chatFull.js: Observer disconnected after initialization.");
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
	
	document.addEventListener('chatReinitialize', () => {
		console.log("chatFull.js: Reattaching listeners due to popup reopen.");
		attachListeners();
	});
});