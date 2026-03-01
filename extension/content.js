/**
 * Trump Redacted – Content Script
 * Walks the DOM and places black boxes over specified name variants.
 *
 * Targets (case-insensitive):
 *   "Donald J. Trump", "Donald J Trump", "Donald Trump", "Trump", "Donald"
 *
 * Matching is done longest-first so "Donald J. Trump" is matched before
 * the shorter substrings. "Donald" is matched only as a whole word to
 * avoid false positives (e.g. "McDonald's").
 */

(function () {
  "use strict";

  // ---- Configuration -------------------------------------------------- //

  // Patterns ordered longest → shortest so greedy matches win.
  // Each entry: [regex, replacement class]
  const PATTERNS = [
    // "Donald J. Trump" / "Donald J Trump"
    /\bDonald\s+J\.?\s+Trump\b/gi,
    // "Donald Trump"
    /\bDonald\s+Trump\b/gi,
    // "Trump" as a standalone word (not part of another word)
    /\bTrump\b/g,
    // "Donald" as a standalone word
    /\bDonald\b/g,
  ];

  const REDACT_CLASS = "trump-redacted";
  const DISABLED_CLASS = "trump-redacted-disabled";

  // Skip these elements to avoid breaking page functionality
  const SKIP_TAGS = new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "CODE",
    "PRE",
    "SVG",
    "MATH",
  ]);

  // ---- State ---------------------------------------------------------- //

  let observer = null;

  // ---- Helpers -------------------------------------------------------- //

  /**
   * Returns true if the node (or an ancestor) should be skipped.
   */
  function shouldSkip(node) {
    if (!node) return true;
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (SKIP_TAGS.has(node.tagName)) return true;
      if (node.isContentEditable) return true;
      if (node.classList && node.classList.contains(REDACT_CLASS)) return true;
    }
    return false;
  }

  /**
   * Redact all matching names inside a single text node.
   * Replaces the text node with a mix of text nodes and <span> elements.
   */
  function redactTextNode(textNode) {
    const text = textNode.nodeValue;
    if (!text || !text.trim()) return;

    // Build a combined regex from all patterns
    const combined = new RegExp(
      PATTERNS.map((r) => r.source).join("|"),
      "gi"
    );

    if (!combined.test(text)) return;

    // Reset lastIndex after test
    combined.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match;

    while ((match = combined.exec(text)) !== null) {
      // Text before the match
      if (match.index > lastIndex) {
        fragment.appendChild(
          document.createTextNode(text.slice(lastIndex, match.index))
        );
      }

      // The redacted span
      const span = document.createElement("span");
      span.className = REDACT_CLASS;
      span.setAttribute("aria-hidden", "true");
      span.textContent = match[0]; // keep original text (hidden by CSS)
      fragment.appendChild(span);

      lastIndex = combined.lastIndex;
    }

    // Remaining text after last match
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  }

  // ---- DOM Walker ----------------------------------------------------- //

  /**
   * Walk a subtree and redact all text nodes.
   */
  function walkAndRedact(root) {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (shouldSkip(node.parentNode)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    // Collect nodes first to avoid live-tree mutation issues
    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach(redactTextNode);
  }

  // ---- Observer ------------------------------------------------------- //

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            if (!shouldSkip(node.parentNode)) {
              redactTextNode(node);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (!shouldSkip(node)) {
              walkAndRedact(node);
            }
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // ---- Toggle --------------------------------------------------------- //

  function enable() {
    document.body.classList.remove(DISABLED_CLASS);
    walkAndRedact(document.body);
    startObserver();
  }

  function disable() {
    document.body.classList.add(DISABLED_CLASS);
    stopObserver();
  }

  // ---- Init ----------------------------------------------------------- //

  chrome.storage.local.get({ enabled: true }, (data) => {
    if (data.enabled) {
      enable();
    } else {
      disable();
    }
  });

  // Listen for toggle changes from the popup
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.enabled) {
      if (changes.enabled.newValue) {
        enable();
      } else {
        disable();
      }
    }
  });
})();
