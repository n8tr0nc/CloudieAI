document.addEventListener('DOMContentLoaded', () => {
  console.log("chatSave.js: DOM fully loaded.");

  // Debounce utility to prevent rapid repeated saves
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Save chat transcript to a file
  function saveChatToFile() {
    const chatLog = document.getElementById('chat-log');
    if (!chatLog) {
      console.warn("chatSave.js: Chat log (#chat-log) not found.");
      return;
    }

    try {
      const now = new Date();
      const month = ('0' + (now.getMonth() + 1)).slice(-2);
      const day = ('0' + now.getDate()).slice(-2);
      const year = now.getFullYear();
      const dateStr = month + day + year;
      const hours = ('0' + now.getHours()).slice(-2);
      const minutes = ('0' + now.getMinutes()).slice(-2);
      const seconds = ('0' + now.getSeconds()).slice(-2);
      const timeStr = hours + minutes + seconds;

      const header = 
`Cloudie Chat Transcript
Date: ${month}/${day}/${year}
Time: ${now.toTimeString().split(' ')[0]}
Session ID: ${dateStr}-${timeStr}\n
Legal: Informational only. Not legal advice. Data processed as per our Privacy Policy. Content is confidential and non-binding. Use implies acceptance of our Terms & Conditions. All rights reserved.

`;

      let text = header;
      const wrappers = document.querySelectorAll('#chat-log .chat-text');
      if (wrappers.length === 0) {
        text += "No chat messages available.\n";
      } else {
        wrappers.forEach(wrapper => {
          const bubble = wrapper.querySelector('div');
          if (bubble) {
            const senderTag = bubble.classList.contains('user-text') ? "User: " : "Cloudie: ";
            text += senderTag + bubble.innerText + "\n\n";
          }
        });
      }

      const blob = new Blob([text], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const fileName = `cloudie-chat-${dateStr}-${timeStr}.txt`;
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;

      // Use requestAnimationFrame for DOM manipulation
      requestAnimationFrame(() => {
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log("chatSave.js: Chat transcript saved as", fileName);
      });
    } catch (error) {
      console.error("chatSave.js: Error saving chat transcript:", error);
    }
  }

  // Debounced save function
  const debouncedSaveChatToFile = debounce(saveChatToFile, 300); // 300ms debounce

  // Attach listener to save button
  function attachSaveListener() {
    const saveChatButton = document.getElementById('saveChat');
    if (!saveChatButton) {
      console.warn("chatSave.js: Save button (#saveChat) not found.");
      return false;
    }

    if (saveChatButton.dataset.listenerAttached === "true") {
      console.log("chatSave.js: Save button listener already attached.");
      return true;
    }

    saveChatButton.addEventListener('click', (e) => {
      e.preventDefault();
      debouncedSaveChatToFile();
    });
    saveChatButton.dataset.listenerAttached = "true";
    console.log("chatSave.js: Save button listener attached.");
    return true;
  }

  // Initialize with MutationObserver
  const observer = new MutationObserver((mutations, obs) => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer && chatContainer.offsetParent !== null) {
      if (attachSaveListener()) {
        obs.disconnect(); // Stop observing after listener is attached
        console.log("chatSave.js: Observer disconnected after initialization.");
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
	
	document.addEventListener('chatReinitialize', () => {
		console.log("chatSave.js: Reattaching listener due to popup reopen.");
		attachSaveListener();
	});
});