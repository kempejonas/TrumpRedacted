const toggle = document.getElementById("toggle");

// Load saved state (default: enabled)
chrome.storage.local.get({ enabled: true }, (data) => {
  toggle.checked = data.enabled;
});

// Save state on toggle
toggle.addEventListener("change", () => {
  chrome.storage.local.set({ enabled: toggle.checked });
});
