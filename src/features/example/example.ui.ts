/**
 * Example feature UI - handles all DOM interaction.
 */

import type { UserscriptContext } from '../../utils/types';
import { createElement, injectStyles } from '../../utils/dom';
import {
  getCounter,
  incrementCounter,
  decrementCounter,
  resetCounter,
  formatCounterDisplay,
  isValidOperation,
} from './example.logic';

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

function updateUI(
  displayEl: HTMLElement,
  decrementBtn: HTMLButtonElement,
  resetBtn: HTMLButtonElement,
  value: number
): void {
  displayEl.textContent = formatCounterDisplay(value);
  decrementBtn.disabled = !isValidOperation('decrement', value);
  resetBtn.disabled = !isValidOperation('reset', value);
}

export function initExample(context: UserscriptContext): void {
  const { storage } = context;

  injectStyles(STYLES);

  let currentValue = getCounter(storage);

  const displayEl = createElement('div', { className: 'userscript-example-widget__display' });

  const decrementBtn = createElement('button', {
    className: 'userscript-example-widget__btn',
    textContent: '−',
  }) as HTMLButtonElement;

  const incrementBtn = createElement('button', {
    className: 'userscript-example-widget__btn userscript-example-widget__btn--primary',
    textContent: '+',
  }) as HTMLButtonElement;

  const resetBtn = createElement('button', {
    className: 'userscript-example-widget__btn',
    textContent: 'WATCH MODE WORKS',
  }) as HTMLButtonElement;

  incrementBtn.addEventListener('click', () => {
    currentValue = incrementCounter(storage);
    updateUI(displayEl, decrementBtn, resetBtn, currentValue);
  });

  decrementBtn.addEventListener('click', () => {
    currentValue = decrementCounter(storage);
    updateUI(displayEl, decrementBtn, resetBtn, currentValue);
  });

  resetBtn.addEventListener('click', () => {
    resetCounter(storage);
    currentValue = 0;
    updateUI(displayEl, decrementBtn, resetBtn, currentValue);
  });

  const buttonsEl = createElement('div', { className: 'userscript-example-widget__buttons' }, [
    decrementBtn, incrementBtn, resetBtn,
  ]);

  const widget = createElement('div', { className: 'userscript-example-widget' }, [
    createElement("div", { className: "userscript-example-widget__title", textContent: "AUTO UPDATE TEST v1.0.2 (WAITING FOR TOMORROW)" }),
    displayEl,
    buttonsEl,
  ]);

  updateUI(displayEl, decrementBtn, resetBtn, currentValue);
  document.body.appendChild(widget);

  console.log('[Example Feature] Initialized');
}
