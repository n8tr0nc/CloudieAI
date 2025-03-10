// chatSave.js
(() => {
  "use strict";

  // Constants
  const CHAT_LOG_ID = "chat-log";
  const SAVE_BUTTON_ID = "saveChat";
  const POPUP_ID = "12698"; // Match chatMain.js Elementor popup ID
  const DEBOUNCE_DELAY = 300; // ms
  const FILE_PREFIX = "cloudie-chat";

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Format timestamp for filename and header
  function getTimestamp() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, "0");
    const dateStr = `${pad(now.getMonth() + 1)}${pad(now.getDate())}${now.getFullYear()}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return { dateStr, timeStr, fullDate: `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`, fullTime: now.toTimeString().split(" ")[0] };
  }

  // Generate chat transcript text
  function generateTranscript() {
    const chatLog = document.getElementById(CHAT_LOG_ID);
    if (!chatLog) {
      console.warn("chatSave.js: Chat log not found.");
      return null;
    }

    const { dateStr, timeStr, fullDate, fullTime } = getTimestamp();
    const header = 
`Cloudie Chat Transcript
Date: ${fullDate}
Time: ${fullTime}
Session ID: ${dateStr}-${timeStr}
Legal: Informational only. Not legal advice. Data processed as per our Privacy Policy. Content is confidential and non-binding. Use implies acceptance of our Terms & Conditions. All rights reserved.

`;

    const wrappers = chatLog.querySelectorAll(".chat-text");
    let text = header;
    if (wrappers.length === 0) {
      text += "No chat messages available.\n";
    } else {
      wrappers.forEach((wrapper) => {
        const bubble = wrapper.querySelector("div");
        if (bubble) {
          const senderTag = bubble.classList.contains("user-text") ? "User: " : "Cloudie: ";
          text += `${senderTag}${bubble.textContent.trim()}\n\n`;
        }
      });
    }
    return { text, fileName: `${FILE_PREFIX}-${dateStr}-${timeStr}.txt` };
  }

  // Save chat to file
  function saveChatToFile() {
    try {
      const transcript = generateTranscript();
      if (!transcript) return;

      const { text, fileName } = transcript;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      requestAnimationFrame(() => {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log("chatSave.js: Saving chat transcript as", fileName);
      });
    } catch (error) {
      console.error("chatSave.js: Error saving chat transcript:", error);
    }
  }

  // Initialize save functionality
  function initSaveChat() {
    const saveButton = document.getElementById(SAVE_BUTTON_ID);
    if (!saveButton) {
      console.warn("chatSave.js: Save button (#saveChat) not found in DOM.");
      return;
    }

    if (saveButton.dataset.listenerAttached === "true") {
      console.log("chatSave.js: Save button listener already attached.");
      return;
    }

    const debouncedSaveChat = debounce(saveChatToFile, DEBOUNCE_DELAY);
    saveButton.addEventListener("click", (e) => {
      e.preventDefault();
      debouncedSaveChat();
    });
    saveButton.dataset.listenerAttached = "true";
    console.log("chatSave.js: Save button listener active...");
  }

  // Setup triggers
  document.addEventListener("DOMContentLoaded", () => {
    // Elementor popup show event
    document.addEventListener("elementor/popup/show", (event) => {
      const { popupId } = event.detail || {};
      if (popupId === POPUP_ID) {
        console.log("chatSave.js: Elementor popup shown, initializing save functionality...");
        setTimeout(() => initSaveChat(), 300); // Match delay from chatMain.js
      }
    });

    // Manual trigger (e.g., <a href="#cloudie">)
    document.querySelectorAll('a[href="#cloudie"]').forEach(trigger => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        setTimeout(() => initSaveChat(), 300);
      });
    });

    // Reinitialize on chat reopen
    document.addEventListener("chatReinitialize", () => {
      console.log("chatSave.js: Reinitializing save functionality due to chat reopen...");
      initSaveChat();
    });
  });
})();