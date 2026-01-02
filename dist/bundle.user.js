// ==UserScript==
// @name         My Userscript
// @namespace    https://github.com/yourusername
// @version      1.0.0
// @author       Your Name
// @description  Description here
// @downloadURL  https://raw.githubusercontent.com/jg-allason/userscript-boilerplate/main/dist/bundle.user.js
// @updateURL    https://raw.githubusercontent.com/jg-allason/userscript-boilerplate/main/dist/bundle.user.js
// @match        https://example.com/*
// @connect      *
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  const gmStorage = {
    get(key, defaultValue) {
      const value = GM_getValue(key, defaultValue);
      return value;
    },
    set(key, value) {
      GM_setValue(key, value);
    },
    delete(key) {
      GM_deleteValue(key);
    },
    list() {
      return GM_listValues();
    },
    clear() {
      const keys = GM_listValues();
      for (const key of keys) {
        GM_deleteValue(key);
      }
    }
  };
  function createElement(tag, attributes, children) {
    const element = document.createElement(tag);
    if (attributes) {
      for (const [key, value] of Object.entries(attributes)) {
        if (key === "style" && typeof value === "object") {
          Object.assign(element.style, value);
        } else if (key === "style" && typeof value === "string") {
          element.setAttribute("style", value);
        } else if (key === "dataset" && typeof value === "object") {
          for (const [dataKey, dataValue] of Object.entries(value)) {
            element.dataset[dataKey] = dataValue;
          }
        } else if (key === "className" || key === "id" || key === "innerHTML" || key === "textContent") {
          element[key] = value;
        } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          element.setAttribute(key, String(value));
        }
      }
    }
    if (children) {
      if (typeof children === "string") {
        element.textContent = children;
      } else {
        for (const child of children) {
          if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
          } else {
            element.appendChild(child);
          }
        }
      }
    }
    return element;
  }
  function injectStyles(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  }
  const COUNTER_STORAGE_KEY = "example_counter";
  function getCounter(storage) {
    const data = storage.get(COUNTER_STORAGE_KEY);
    return (data == null ? void 0 : data.value) ?? 0;
  }
  function incrementCounter(storage) {
    const current = getCounter(storage);
    const newValue = current + 1;
    storage.set(COUNTER_STORAGE_KEY, { value: newValue, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() });
    return newValue;
  }
  function decrementCounter(storage) {
    const current = getCounter(storage);
    const newValue = Math.max(0, current - 1);
    storage.set(COUNTER_STORAGE_KEY, { value: newValue, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() });
    return newValue;
  }
  function resetCounter(storage) {
    storage.delete(COUNTER_STORAGE_KEY);
  }
  function formatCounterDisplay(value) {
    if (value === 0) return "Counter: 0 (click + to start)";
    return `Counter: ${value}`;
  }
  function isValidOperation(operation, currentValue) {
    switch (operation) {
      case "increment":
        return currentValue < Number.MAX_SAFE_INTEGER;
      case "decrement":
        return currentValue > 0;
      case "reset":
        return currentValue !== 0;
    }
  }
  const STYLES = `
  .userscript-example-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    z-index: 999999;
    min-width: 200px;
  }
  .userscript-example-widget__title {
    font-weight: 600;
    margin-bottom: 12px;
    font-size: 16px;
  }
  .userscript-example-widget__display {
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
    border-radius: 6px;
    margin-bottom: 12px;
    text-align: center;
  }
  .userscript-example-widget__buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
  .userscript-example-widget__btn {
    background: rgba(255, 255, 255, 0.25);
    border: none;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }
  .userscript-example-widget__btn:hover { background: rgba(255, 255, 255, 0.35); }
  .userscript-example-widget__btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .userscript-example-widget__btn--primary { background: rgba(255, 255, 255, 0.4); }
`;
  function updateUI(displayEl, decrementBtn, resetBtn, value) {
    displayEl.textContent = formatCounterDisplay(value);
    decrementBtn.disabled = !isValidOperation("decrement", value);
    resetBtn.disabled = !isValidOperation("reset", value);
  }
  function initExample(context) {
    const { storage } = context;
    injectStyles(STYLES);
    let currentValue = getCounter(storage);
    const displayEl = createElement("div", { className: "userscript-example-widget__display" });
    const decrementBtn = createElement("button", {
      className: "userscript-example-widget__btn",
      textContent: "−"
    });
    const incrementBtn = createElement("button", {
      className: "userscript-example-widget__btn userscript-example-widget__btn--primary",
      textContent: "+"
    });
    const resetBtn = createElement("button", {
      className: "userscript-example-widget__btn",
      textContent: "WATCH MODE WORKS"
    });
    incrementBtn.addEventListener("click", () => {
      currentValue = incrementCounter(storage);
      updateUI(displayEl, decrementBtn, resetBtn, currentValue);
    });
    decrementBtn.addEventListener("click", () => {
      currentValue = decrementCounter(storage);
      updateUI(displayEl, decrementBtn, resetBtn, currentValue);
    });
    resetBtn.addEventListener("click", () => {
      resetCounter(storage);
      currentValue = 0;
      updateUI(displayEl, decrementBtn, resetBtn, currentValue);
    });
    const buttonsEl = createElement("div", { className: "userscript-example-widget__buttons" }, [
      decrementBtn,
      incrementBtn,
      resetBtn
    ]);
    const widget = createElement("div", { className: "userscript-example-widget" }, [
      createElement("div", { className: "userscript-example-widget__title", textContent: "LIVE RELOAD 22:48" }),
      displayEl,
      buttonsEl
    ]);
    updateUI(displayEl, decrementBtn, resetBtn, currentValue);
    document.body.appendChild(widget);
    console.log("[Example Feature] Initialized");
  }
  const H1_STORAGE_KEY = "captured_h1s";
  function extractH1Text(html) {
    const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (!match) return null;
    const text = match[1].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").trim();
    return text || null;
  }
  function saveH1ToStorage(storage, h1Text, url) {
    const existing = storage.get(H1_STORAGE_KEY, []) ?? [];
    const newEntry = {
      text: h1Text,
      url,
      capturedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    existing.push(newEntry);
    storage.set(H1_STORAGE_KEY, existing);
  }
  function getStoredH1s(storage) {
    return storage.get(H1_STORAGE_KEY, []) ?? [];
  }
  function initH1Capture(context) {
    const { storage } = context;
    const html = document.body.innerHTML;
    const h1Text = extractH1Text(html);
    if (h1Text) {
      const url = window.location.href;
      saveH1ToStorage(storage, h1Text, url);
      console.log("[H1 Capture] Saved:", { text: h1Text, url });
    } else {
      console.log("[H1 Capture] No h1 found on page");
    }
    const allH1s = getStoredH1s(storage);
    console.log("[H1 Capture] All stored h1s:", allH1s);
  }
  function initialize() {
    const context = {
      storage: gmStorage
    };
    initExample(context);
    initH1Capture(context);
    console.log("[Userscript] Initialized");
  }
  initialize();

})();