/**
 * DOM helper utilities for userscript development.
 */

/**
 * Waits for an element to appear in the DOM.
 */
export function waitForElement<T extends Element = Element>(
    selector: string,
    timeout = 10000
): Promise<T> {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector<T>(selector);
        if (existing) {
            resolve(existing);
            return;
        }

        const startTime = Date.now();
        const observer = new MutationObserver(() => {
            const element = document.querySelector<T>(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
                return;
            }
            if (Date.now() - startTime > timeout) {
                observer.disconnect();
                reject(new Error(`Timeout waiting for element: ${selector}`));
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            observer.disconnect();
            const element = document.querySelector<T>(selector);
            if (element) resolve(element);
            else reject(new Error(`Timeout waiting for element: ${selector}`));
        }, timeout);
    });
}

/** Attributes that can be set on an element */
type ElementAttributes<K extends keyof HTMLElementTagNameMap> = Partial<
    Omit<HTMLElementTagNameMap[K], 'style' | 'children'>
> & {
    style?: Partial<CSSStyleDeclaration> | string;
    dataset?: Record<string, string>;
};

/**
 * Creates a typed HTML element with attributes and children.
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    attributes?: ElementAttributes<K>,
    children?: (Node | string)[] | string
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'style' && typeof value === 'string') {
                element.setAttribute('style', value);
            } else if (key === 'dataset' && typeof value === 'object') {
                for (const [dataKey, dataValue] of Object.entries(value as Record<string, string>)) {
                    element.dataset[dataKey] = dataValue;
                }
            } else if (key === 'className' || key === 'id' || key === 'innerHTML' || key === 'textContent') {
                (element as unknown as Record<string, unknown>)[key] = value;
            } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                element.setAttribute(key, String(value));
            }
        }
    }

    if (children) {
        if (typeof children === 'string') {
            element.textContent = children;
        } else {
            for (const child of children) {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else {
                    element.appendChild(child);
                }
            }
        }
    }

    return element;
}

/**
 * Injects a stylesheet into the page.
 */
export function injectStyles(css: string): HTMLStyleElement {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    return style;
}

/**
 * Observes DOM changes on a target element.
 */
export function observeDOM(
    target: Node,
    callback: (mutations: MutationRecord[]) => void,
    options: { childList?: boolean; subtree?: boolean; attributes?: boolean } = {}
): () => void {
    const observer = new MutationObserver(callback);
    observer.observe(target, {
        childList: options.childList ?? true,
        subtree: options.subtree ?? true,
        attributes: options.attributes ?? false,
    });
    return () => observer.disconnect();
}
