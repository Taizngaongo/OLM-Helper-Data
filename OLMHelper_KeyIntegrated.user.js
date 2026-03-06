// ==UserScript==
// @name         OLM Helper
// @namespace    http://tampermonkey.net/
// @version      1.5.3
// @description  Công cụ giúp bạn làm bài trên OLM dễ vcl =)))
// @author       Taiz Cu To
// @match        https://olm.vn/chu-de/*
// @match        https://olm.vn/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Taizngaongo/OLM-Helper-Data/main/OLMHelper_KeyIntegrated.user.js
// @downloadURL  https://raw.githubusercontent.com/Taizngaongo/OLM-Helper-Data/main/OLMHelper_KeyIntegrated.user.js
// @icon         https://play-lh.googleusercontent.com/PMA5MRr5DUJBUbDgdUn6arbGXteDjRBIZVO3P3z9154Kud2slXPjy-iiPwwKfvZhc4o=w240-h480-rw
// ==/UserScript==

(function () {
  "use strict";

  const TOGGLE_ICON_URL = "https://cdn.discordapp.com/avatars/1289927510938746900/archived/1464931603435356233/bf774c22d94fd4aca8c76c3c940912b6.png?size=1024";
  const BRAND_LINK_URL = "https://www.facebook.com/profile.php?id=61584048118869&locale=vi_VN";

  const UW = (typeof unsafeWindow !== "undefined" && unsafeWindow) ? unsafeWindow : window;
  const TARGET_URL_KEYWORD = "get-question-of-ids";
  const LS_SIZE = "olm_size";
  const LS_POS = "olm_pos";
  const LS_DARK = "olm_dark";
  const LS_TOGGLE_POS = "olm_toggle_pos";
  const LS_STEALTH = "olm_stealth";
  const LS_AUTO_SEARCH = "olm_auto_search";
  const LS_AUTO_SOLVE = "olm_auto_solve";
  const CURRENT_VERSION = "1.5.3";
  const VERSION_CHECK_URL = "https://raw.githubusercontent.com/Taizngaongo/OLM-Helper-Data/main/version.json";
  const UPDATE_URL = "https://raw.githubusercontent.com/Taizngaongo/OLM-Helper-Data/main/OLMHelper_KeyIntegrated.user.js";

  const LS_VISIBLE = "olm_visible";
  const LS_AUTH_KEY_V4 = "olm_auth_key_v4";
  const LS_AUTH_EXP_V4 = "olm_auth_exp_v4";
  const LS_AUTH_TYPE_V4 = "olm_auth_type_v4";
  const LS_PENDING_KEY = "olm_pending_key";
  const SS_ADMIN_AUTH = "olm_admin_session";
  const ADMIN_KEY_INTERNAL = "Key-Tavy2011";
  const YEUMONEY_TOKEN = "4a146c82930b07e958acbe5169a1b7b828bc09dfb5d750bb3d9da7d7c12553bb";
  const BYPASS_BASE_URL = "https://keybytaiz.edgeone.dev/";

  const HIGHLIGHT_CLASS = "olm-hl";
  const PAGE_HIGHLIGHT_CLASS = "olm-auto-ans";
  const AUTO_SOLVE_INTERVAL = 1200;
  const API_BASE_URL = "https://wanzdoan.site";
  const CONTENT_XOR_KEY = "1047823200";

  const ready = (fn) => {
    if (document.readyState === "complete" || document.readyState === "interactive") fn();
    else document.addEventListener("DOMContentLoaded", fn, { once: true });
  };
  const ensureHead = (node) => {
    if (document.head) document.head.appendChild(node);
    else ready(() => (document.head || document.documentElement).appendChild(node));
  };
  const ensureBody = (node) => {
    if (document.body) document.body.appendChild(node);
    else ready(() => document.body.appendChild(node));
  };
  const debounce = (fn, ms) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; };

  function generateDeviceId() {
    try {
      const components = [];

      if (screen.width && screen.height) {
        components.push(`${screen.width}x${screen.height}`);
      }

      if (screen.colorDepth) {
        components.push(`cd${screen.colorDepth}`);
      }

      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz) components.push(tz.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10));
      } catch { }

      if (navigator.language) {
        components.push(navigator.language.substring(0, 5));
      }

      if (navigator.platform) {
        components.push(navigator.platform.substring(0, 10).replace(/[^a-zA-Z0-9]/g, ''));
      }

      if (navigator.userAgent) {
        const ua = navigator.userAgent.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
        components.push(ua);
      }

      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('DeviceID', 2, 2);
        const canvasHash = canvas.toDataURL().substring(22, 42).replace(/[^a-zA-Z0-9]/g, '');
        components.push(canvasHash);
      } catch { }

      const combined = components.join('_');

      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      const hashStr = Math.abs(hash).toString(36).substring(0, 32);
      return hashStr || 'default_device_' + Date.now().toString(36).substring(0, 16);
    } catch (e) {
      return 'fallback_' + Date.now().toString(36).substring(0, 16);
    }
  }

  function getDeviceId() {
    try {
      let deviceId = localStorage.getItem('olm_device_id');
      if (!deviceId || deviceId.length < 8) {
        deviceId = generateDeviceId();
        try {
          localStorage.setItem('olm_device_id', deviceId);
        } catch { }
      }
      return deviceId;
    } catch {
      return generateDeviceId();
    }
  }

  const COPY_UNLOCK_EVENTS = ["copy", "cut", "paste", "contextmenu", "selectstart", "dragstart", "mousedown", "mouseup", "keydown", "keyup", "beforecopy"];
  const COPY_ATTRS = ["oncopy", "oncut", "onpaste", "oncontextmenu", "onselectstart", "ondragstart", "onmousedown", "onmouseup", "onkeydown", "onkeyup", "onbeforecopy", "onbeforecut", "onbeforepaste", "style"];
  const STEALTH_EVENTS = ["visibilitychange", "webkitvisibilitychange", "pagehide", "freeze", "blur", "focusout", "fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "msfullscreenchange"];
  let STEALTH_ACTIVE = false;

  function injectCopyUnlockCSS() {
    if (document.documentElement.querySelector("style[data-olm-copy-unlock]")) return;
    const css = document.createElement("style");
    css.dataset.olmCopyUnlock = "1";
    css.textContent = `
      html, body, body *:not(input):not(textarea):not([contenteditable="true"]) {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
        -webkit-touch-callout: default !important;
        touch-action: auto !important;
      }
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: auto !important;
        -moz-user-select: auto !important;
        -ms-user-select: auto !important;
        user-select: auto !important;
      }
    `.trim();
    ensureHead(css);
  }

  function scrubNodeRestrictions(node) {
    if (!(node instanceof Element)) return;
    COPY_ATTRS.forEach((attr) => {
      if (attr === "style") return;
      if (node.hasAttribute(attr)) node.removeAttribute(attr);
      if (attr in node) {
        try { node[attr] = null; } catch { }
      }
    });
    const style = node.style;
    if (!style) return;
    style.removeProperty("user-select");
    style.removeProperty("-moz-user-select");
    style.removeProperty("-ms-user-select");
    style.removeProperty("-webkit-user-drag");
    style.removeProperty("-webkit-user-select");
    style.removeProperty("-webkit-touch-callout");
    style.removeProperty("touch-action");
  }

  function scrubTree(root) {
    if (!root) return;
    if (root instanceof Element) scrubNodeRestrictions(root);
    const scope = root.querySelectorAll ? root.querySelectorAll("*") : [];
    scope.forEach(scrubNodeRestrictions);
  }

  function installCopyUnlock() {
    const swallow = (evt) => {
      if (!evt) return;
      if (typeof evt.stopImmediatePropagation === "function") evt.stopImmediatePropagation();
      if (typeof evt.stopPropagation === "function") evt.stopPropagation();
      evt.cancelBubble = true;
    };
    COPY_UNLOCK_EVENTS.forEach((evtName) => {
      window.addEventListener(evtName, swallow, { capture: true });
      document.addEventListener(evtName, swallow, { capture: true });
    });

    scrubTree(document.documentElement);
    ready(() => scrubTree(document.body || document.documentElement));

    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "attributes") {
            scrubNodeRestrictions(mutation.target);
          } else if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => scrubTree(node));
          }
        }
      });
      observer.observe(document.documentElement, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: COPY_ATTRS
      });
    }
  }

  function disableNativeAlerts() {
    const targets = new Set([window]);
    if (UW && UW !== window) targets.add(UW);
    targets.forEach((target) => {
      if (!target || typeof target.alert !== "function") return;
      const original = target.alert;
      const silentAlert = function (...args) {
        console.debug("[OLMHelper] Alert suppressed:", args[0]);
      };
      try { silentAlert.toString = original.toString.bind(original); } catch { }
      try { Object.defineProperty(silentAlert, "name", { value: "alert" }); } catch { }
      target.alert = silentAlert;
    });
  }

  injectCopyUnlockCSS();
  installCopyUnlock();
  disableNativeAlerts();

  const stealthEventHandler = (evt) => {
    if (!STEALTH_ACTIVE) return;
    evt.stopImmediatePropagation?.();
    evt.stopPropagation?.();
    evt.preventDefault?.();
  };

  function setStealthActive(flag) {
    STEALTH_ACTIVE = !!flag;
  }

  function installStealthGuards() {
    if (installStealthGuards._done) return;
    installStealthGuards._done = true;
    try {
      STEALTH_EVENTS.forEach((evt) => {
        document.addEventListener(evt, stealthEventHandler, true);
        window.addEventListener(evt, stealthEventHandler, true);
      });
    } catch (e) {
      console.error("installStealthGuards error:", e);
    }
    patchVisibilityProps();
  }

  function patchVisibilityProps() {
    if (patchVisibilityProps._done) return;
    patchVisibilityProps._done = true;
    const docProto = Object.getPrototypeOf(document);
    const visDesc = docProto ? Object.getOwnPropertyDescriptor(docProto, "visibilityState") : null;
    const hiddenDesc = docProto ? Object.getOwnPropertyDescriptor(docProto, "hidden") : null;
    const getVis = visDesc?.get ? visDesc.get.bind(document) : null;
    const getHidden = hiddenDesc?.get ? hiddenDesc.get.bind(document) : null;

    try {
      if (visDesc && visDesc.configurable !== false) {
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          enumerable: visDesc.enumerable,
          get() {
            if (STEALTH_ACTIVE) return "visible";
            return getVis ? getVis() : (visDesc.value ?? "visible");
          }
        });
      }
    } catch (e) {
      console.warn("Failed to override document.visibilityState:", e);
    }

    try {
      if (hiddenDesc && hiddenDesc.configurable !== false) {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          enumerable: hiddenDesc.enumerable,
          get() {
            if (STEALTH_ACTIVE) return false;
            return getHidden ? getHidden() : !!hiddenDesc.value;
          }
        });
      }
    } catch (e) {
      console.warn("Failed to override document.hidden:", e);
    }

    const fullscreenProps = [
      { name: "fullscreenElement", value: null },
      { name: "webkitFullscreenElement", value: null },
      { name: "mozFullScreenElement", value: null },
      { name: "msFullscreenElement", value: null },
      { name: "fullscreen", value: false },
      { name: "webkitIsFullScreen", value: false },
      { name: "mozFullScreen", value: false },
      { name: "msFullscreen", value: false }
    ];

    fullscreenProps.forEach(({ name, value }) => {
      try {
        const desc = docProto ? Object.getOwnPropertyDescriptor(docProto, name) : null;
        if (desc && desc.configurable !== false) {
          const getOriginal = desc?.get ? desc.get.bind(document) : null;
          Object.defineProperty(document, name, {
            configurable: true,
            enumerable: desc.enumerable,
            get() {
              if (STEALTH_ACTIVE) return value;
              return getOriginal ? getOriginal() : (desc.value ?? value);
            }
          });
        }
      } catch (e) {

      }
    });
  }

  installStealthGuards();

  function decodeBase64ToBytes(base64) {
    if (!base64 || typeof base64 !== "string") return null;
    try {
      const cleaned = base64.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
      if (!cleaned) return null;
      const padded = cleaned.length % 4 === 0 ? cleaned : `${cleaned}${"=".repeat(4 - (cleaned.length % 4))}`;
      const bin = atob(padded);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch {
      return null;
    }
  }

  function decodeBytesUtf8(bytes) {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) return "";
    try {
      return new TextDecoder("utf-8").decode(bytes).replace(/\uFFFD/g, "");
    } catch {
      let out = "";
      for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
      return out;
    }
  }

  function decodeBase64Utf8(base64) {
    const bytes = decodeBase64ToBytes(base64);
    return bytes ? decodeBytesUtf8(bytes) : "";
  }

  function decodeXorBase64Utf8(base64, key = CONTENT_XOR_KEY) {
    const data = decodeBase64ToBytes(base64);
    if (!data) return "";
    const keyBytes = new TextEncoder().encode(String(key || ""));
    if (!keyBytes.length) return "";
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    return decodeBytesUtf8(result);
  }

  function isLikelyBase64(str) {
    if (!str || typeof str !== "string") return false;
    const cleaned = str.replace(/\s+/g, "");
    if (cleaned.length < 12) return false;
    return /^[A-Za-z0-9+/=]+$/.test(cleaned);
  }

  function scoreDecodedText(text) {
    if (!text || typeof text !== "string") return Number.NEGATIVE_INFINITY;
    const value = text.trim();
    if (!value) return Number.NEGATIVE_INFINITY;

    let score = 0;
    if (value.length > 30) score += 2;
    if (/[<>]/.test(value)) score += 8;
    if (/<(?:div|p|span|ol|ul|li|table|tr|td|img|math|input|br|hr)\b/i.test(value)) score += 30;
    if (/(quiz-list|correctAnswer|loigiai|huong-dan-giai|data-accept|form-group|question-item|answer)/i.test(value)) score += 24;
    const controls = (value.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
    const replacementChars = (value.match(/\uFFFD/g) || []).length;
    score -= controls * 8;
    score -= replacementChars * 6;
    if (controls === 0) score += 4;
    return score;
  }

  function decodeQuestionPayload(question) {
    const payloads = [question?.content, question?.json_content]
      .filter((item) => typeof item === "string" && item.trim().length > 0);
    if (!payloads.length) return "";

    let best = "";
    let bestScore = Number.NEGATIVE_INFINITY;
    const pushCandidate = (value) => {
      const score = scoreDecodedText(value);
      if (score > bestScore) {
        best = value;
        bestScore = score;
      }
    };

    payloads.forEach((payload) => {
      pushCandidate(payload);

      const xorDecoded = decodeXorBase64Utf8(payload, CONTENT_XOR_KEY);
      pushCandidate(xorDecoded);

      const base64Decoded = decodeBase64Utf8(payload);
      pushCandidate(base64Decoded);

      if (isLikelyBase64(base64Decoded)) {
        pushCandidate(decodeXorBase64Utf8(base64Decoded, CONTENT_XOR_KEY));
        pushCandidate(decodeBase64Utf8(base64Decoded));
      }
    });

    return best || payloads[0] || "";
  }

  function mildLatexFix(html) {
    return html
      .replace(/\$\$([^$]+)\$(?!\$)/g, "$$$$${1}$$")
      .replace(/\$(?!\$)([^$]+)\$\$/g, "$$${1}$$");
  }

  function stripLeadingHashesFromElement(rootEl) {
    try {

      const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null);
      let node;
      while ((node = walker.nextNode())) {
        node.nodeValue = node.nodeValue.replace(/^\s*#\s*/g, '');
      }
    } catch (e) {
      console.error("stripLeadingHashesFromElement error:", e);
    }
  }

  function removeNoiseMetaLines(rootEl) {
    try {
      if (!rootEl) return;

      const re = /^\s*p\s*\.?\s*shuffle\s*=\s*0\s*[;:,\.]*\s*$/i;

      const toRemove = new Set();

      const candidates = rootEl.querySelectorAll('p,div,span,li,em,strong,b,i,u');
      candidates.forEach(el => {
        const txt = (el.textContent || '').trim();
        if (txt && re.test(txt)) toRemove.add(el);
      });

      const textWalker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null);
      let tnode;
      while ((tnode = textWalker.nextNode())) {
        const txt = (tnode.nodeValue || '').trim();
        if (!txt) continue;
        if (re.test(txt)) {
          const parent = tnode.parentNode;

          if (parent && parent.childNodes.length === 1) toRemove.add(parent); else toRemove.add(tnode);
        }
      }

      toRemove.forEach(n => {
        if (n.nodeType === Node.TEXT_NODE) n.remove(); else n.remove();
      });
    } catch (e) {
      console.error("removeNoiseMetaLines error:", e);
    }
  }

  function collapseWhitespace(str) {
    return (str || "")
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizeAnswerText(input) {
    if (!input) return "";
    let text = String(input)
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"');
    text = text
      .replace(/\\left|\\right/g, "")
      .replace(/\\(?:\(|\))/g, "")
      .replace(/\\\[|\\\]/g, "")
      .replace(/\\,/g, " ")
      .replace(/\\;/g, " ")
      .replace(/\\!/g, "")
      .replace(/\\cdot/g, "*")
      .replace(/\\times/g, "x")
      .replace(/\\pm/g, "±")
      .replace(/\\infty/g, "infty")
      .replace(/\\mathbb\{R\}/gi, "R")
      .replace(/\\lt/g, "<")
      .replace(/\\gt/g, ">")
      .replace(/\\le/g, "<=")
      .replace(/\\ge/g, ">=")
      .replace(/\\neq/g, "!=")
      .replace(/\$/g, "");
    text = collapseWhitespace(text);
    text = text.replace(/^[A-Ha-h]\s*[\)\.\-:]\s*/, "");
    text = text.replace(/^[A-Ha-h]\s*[\)\.\-:]/, "");
    text = text.replace(/^\d+\s*[\)\.\-:]\s*/, (match, _offset, str) => {
      const rest = str.slice(match.length).trim();
      return rest ? "" : match;
    });
    text = text.replace(/^\d+\s*[\)\.\-:]/, (match, _offset, str) => {
      const rest = str.slice(match.length).trim();
      return rest ? "" : match;
    });
    text = text.replace(/^#+\s*/, "");

    text = text.replace(/\s*([()\[\]{};,:\u2013\u2014])\s*/g, "$1");
    text = text.replace(/\s*([+\-*/^|<>!=])\s*/g, "$1");
    text = text.replace(/[.,;:!?]+$/g, "");
    return collapseWhitespace(text).toLowerCase();
  }

  function answersLooselyEqual(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    if (a.length > 12 && b.length > 12) {
      return a.includes(b) || b.includes(a);
    }
    return false;
  }

  function normalizeQuestionText(input) {
    if (!input) return "";
    let text = String(input)
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"');
    text = collapseWhitespace(text);
    text = text.replace(/^c(?:au|\u00E2u)\s*\d+[\.\:)]*\s*/i, "");
    return collapseWhitespace(text).toLowerCase();
  }

  const MATH_NODE_SELECTOR = ".katex, math, .mathquill, .MathJax";

  function extractMathNodeText(mathEl) {
    if (!mathEl) return "";
    if (typeof mathEl.querySelector !== "function") return mathEl.textContent || "";

    const annotation = mathEl.querySelector("annotation[encoding='application/x-tex']");
    if (annotation?.textContent) {
      let latex = annotation.textContent.trim();

      latex = latex.replace(/\\lt/g, "<").replace(/\\gt/g, ">");
      return latex;
    }
    if (mathEl.tagName && mathEl.tagName.toLowerCase() === "math") {
      return mathEl.textContent || "";
    }

    const katexMathml = mathEl.querySelector(".katex-mathml");
    if (katexMathml) {

      const mathmlText = katexMathml.textContent || "";
      if (mathmlText) {

        let converted = mathmlText
          .replace(/\u003C/g, "<")
          .replace(/\u003E/g, ">")
          .replace(/\u2264/g, "<=")
          .replace(/\u2265/g, ">=")
          .replace(/\u2260/g, "!=")
          .trim();
        return converted;
      }
    }

    return mathEl.textContent || "";
  }

  function collectMathAwareText(node) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.nodeValue || "";

      text = text.replace(/\$([^$]+)\$/g, (match, latex) => {

        return latex.trim().replace(/\\lt/g, "<").replace(/\\gt/g, ">").replace(/\s+/g, " ").trim();
      });
      return text;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    if (typeof node.matches === "function" && node.matches(MATH_NODE_SELECTOR)) {
      return extractMathNodeText(node);
    }
    let buffer = "";
    Array.from(node.childNodes || []).forEach((child) => {
      buffer += collectMathAwareText(child);
    });
    return buffer;
  }

  function getMathAwareText(target) {
    if (!target) return "";
    if (typeof target === "string") return target;
    try {
      if (target.nodeType === Node.TEXT_NODE) return target.nodeValue || "";
      if (target.nodeType === Node.ELEMENT_NODE) {
        const combined = collectMathAwareText(target);
        if (combined) return combined;
        return target.innerText || target.textContent || "";
      }
      if (target.textContent) return target.textContent;
      if (target.nodeValue) return target.nodeValue;
      return "";
    } catch {
      try {
        if (target instanceof Element) return target.innerText || target.textContent || "";
      } catch { }
      return target.nodeValue || "";
    }
  }

  function isElementVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    const rects = typeof el.getClientRects === "function" ? el.getClientRects() : null;
    if (!rects || rects.length === 0) return false;
    const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    if (style) {
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    }
    return true;
  }

  function encodeSvgToDataUri(svgMarkup) {
    try {
      const bytes = new TextEncoder().encode(svgMarkup);
      let binary = "";
      bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
      const encoded = window.btoa(binary);
      return `data:image/svg+xml;base64,${encoded}`;
    } catch (e) {
      console.error("encodeSvgToDataUri error:", e);
      return "";
    }
  }

  function highlightInElement(el, keyword) {
    el.querySelectorAll("." + HIGHLIGHT_CLASS).forEach((n) => {
      const p = n.parentNode;
      while (n.firstChild) p.insertBefore(n.firstChild, n);
      p.removeChild(n);
      p.normalize?.();
    });
    if (!keyword) return;
    const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const textRegex = new RegExp(safe, "gi");
    const mathRegex = new RegExp(safe, "i");
    const normalizedKeyword = collapseWhitespace(keyword).toLowerCase();
    const mathMatchesKeyword = (mathText = "") => {
      if (!mathText) return false;
      if (mathRegex.test(mathText)) return true;
      if (!normalizedKeyword) return false;
      const normalizedMath = collapseWhitespace(mathText).toLowerCase();
      if (!normalizedMath) return false;
      return (
        normalizedKeyword.includes(normalizedMath) ||
        normalizedMath.includes(normalizedKeyword)
      );
    };
    const wrapNodeWithMark = (node) => {
      if (!node?.parentNode) return;
      const wrapper = document.createElement("mark");
      wrapper.className = HIGHLIGHT_CLASS;
      node.parentNode.insertBefore(wrapper, node);
      wrapper.appendChild(node);
    };
    el.querySelectorAll(MATH_NODE_SELECTOR).forEach((mathNode) => {
      if (!(mathNode instanceof Element)) return;
      if (mathNode.closest("." + HIGHLIGHT_CLASS)) return;
      const mathText = getMathAwareText(mathNode);
      if (!mathMatchesKeyword(mathText)) return;
      wrapNodeWithMark(mathNode);
    });
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walk.nextNode())) {
      if (node.parentElement?.closest(MATH_NODE_SELECTOR)) continue;
      const t = node.nodeValue;
      if (!t || !t.trim()) continue;
      textRegex.lastIndex = 0;
      let m, last = 0, pieces = [];
      while ((m = textRegex.exec(t))) {
        pieces.push(document.createTextNode(t.slice(last, m.index)));
        const mark = document.createElement("mark");
        mark.className = HIGHLIGHT_CLASS;
        mark.textContent = t.slice(m.index, m.index + m[0].length);
        pieces.push(mark);
        last = m.index + m[0].length;
      }
      if (pieces.length) {
        pieces.push(document.createTextNode(t.slice(last)));
        const frag = document.createDocumentFragment();
        pieces.forEach((p) => frag.appendChild(p));
        node.parentNode.replaceChild(frag, node);
      }
    }
  }

  function ensureMathJax() {
    if (UW.MathJax) return;
    const cfg = document.createElement("script");
    cfg.type = "text/javascript";
    cfg.text = `
      window.MathJax = {
        tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$','$$'], ['\\\\[','\\\\]']], processEscapes: true, processEnvironments: true },
        options: { skipHtmlTags: ['noscript','style','textarea','pre','code'], ignoreHtmlClass: 'no-mathjax', renderActions: { addMenu: [] } },
        startup: { typeset: false }
      };
    `;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    ensureHead(cfg);
    ensureHead(s);
  }
  ensureMathJax();

  let html2pdfReadyPromise = null;
  function ensureHtml2Pdf() {
    if (UW.html2pdf) return Promise.resolve();
    if (html2pdfReadyPromise) return html2pdfReadyPromise;
    html2pdfReadyPromise = new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";
      sc.async = true;
      sc.onload = () => res();
      sc.onerror = () => rej(new Error("Không tải được html2pdf.js"));
      ensureHead(sc);
    });
    return html2pdfReadyPromise;
  }

  class AnswerDisplay {
    constructor() {
      this.isVisible = (() => {
        const saved = localStorage.getItem(LS_VISIBLE);
        if (saved !== null) return saved === "1";
        return true;
      })();

      this.dragState = { dragging: false, startX: 0, startY: 0, initX: 0, initY: 0 };
      this.resizeState = null;
      this.widthResizeState = null;

      const defaultH = Math.max(340, Math.round(window.innerHeight * 0.66));
      this.size = { w: Math.min(520, Math.max(340, Math.round(window.innerWidth * 0.9))), h: defaultH };
      this.pos = null;

      this.toggleDrag = { dragging: false, startX: 0, startY: 0, initL: 0, initT: 0, moved: false };
      this.togglePos = (() => {
        try { const p = JSON.parse(localStorage.getItem(LS_TOGGLE_POS) || "null"); if (Number.isFinite(p?.left) && Number.isFinite(p?.top)) return p; } catch { }
        return null;
      })();

      this.dark = (() => {
        const saved = localStorage.getItem(LS_DARK);
        if (saved !== null) return saved === "1";
        return window.matchMedia?.("(prefers-color-scheme: dark)").matches || false;
      })();
      this.stealthMode = (() => {
        const saved = localStorage.getItem(LS_STEALTH);
        return saved === "1";
      })();
      this.autoSearchEnabled = (() => {
        const saved = localStorage.getItem(LS_AUTO_SEARCH);
        if (saved === null) return true;
        return saved === "1";
      })();
      this.autoSolveEnabled = (() => {
        const saved = localStorage.getItem(LS_AUTO_SOLVE);
        if (saved === null) return false;
        return saved === "1";
      })();

      try { const saved = JSON.parse(localStorage.getItem(LS_SIZE) || "null"); if (saved?.w && saved?.h) this.size = saved; } catch { }
      try { const p = JSON.parse(localStorage.getItem(LS_POS) || "null"); if (Number.isFinite(p?.left) && Number.isFinite(p?.top)) this.pos = p; } catch { }

      this.filterDebounced = debounce(this.filterQuestions.bind(this), 140);
      this.autoSolveScrollHandler = debounce(() => this.scanAndHighlightCurrentQuestion(), 180);

      this.onKeyDown = this.onKeyDown.bind(this);
      this.onPointerDownDrag = this.onPointerDownDrag.bind(this);
      this.onPointerMoveDrag = this.onPointerMoveDrag.bind(this);
      this.onPointerUpDrag = this.onPointerUpDrag.bind(this);
      this.onPointerDownResize = this.onPointerDownResize.bind(this);
      this.onPointerMoveResize = this.onPointerMoveResize.bind(this);
      this.onPointerUpResize = this.onPointerUpResize.bind(this);
      this.onPointerDownWidthResize = this.onPointerDownWidthResize.bind(this);
      this.onPointerMoveWidthResize = this.onPointerMoveWidthResize.bind(this);
      this.onPointerUpWidthResize = this.onPointerUpWidthResize.bind(this);
      this.onWindowResize = this.onWindowResize.bind(this);

      this.onPointerDownToggle = this.onPointerDownToggle.bind(this);
      this.onPointerMoveToggle = this.onPointerMoveToggle.bind(this);
      this.onPointerUpToggle = this.onPointerUpToggle.bind(this);

      this.handleSelectionChange = this.handleSelectionChange.bind(this);
      this.lastSelectionText = "";
      this.onControlsPointerDown = this.onControlsPointerDown.bind(this);
      this.onControlsPointerMove = this.onControlsPointerMove.bind(this);
      this.onControlsPointerUp = this.onControlsPointerUp.bind(this);
      this.onControlsClickCapture = this.onControlsClickCapture.bind(this);
      this.updateSearchClearState = this.updateSearchClearState.bind(this);

      this.renderedPassages = new Set();
      this.controlsRow = null;
      this.autoSearchBtn = null;
      this.autoSolveBtn = null;
      this.controlsScroll = { dragging: false, startX: 0, scrollLeft: 0, moved: false };
      this.controlsDragPreventClick = false;
      this.searchClearBtn = null;
      this.nextQuestionNumber = 1;
      this.autoSolveInterval = null;
      this.lastHighlightedElements = [];
      this.questionBank = [];
      this.questionSignatureSet = new Set();
      this.currentMatchedSignature = null;

      this.isKeyValid = true;
      this.keyExpiresAt = null;
      this.currentKey = null;
      this.deviceId = getDeviceId();
      this.keyInput = null;
      this.keyStatusEl = null;
      this.checkKeyBtn = null;
      this.getKeyBtn = null;
      this.pendingData = [];
      this.lastAnswersUrl = null;
    }

    async checkAuth() {
      try {
        // Admin: Nhớ theo session (Reload không mất, đóng tab mất)
        if (sessionStorage.getItem(SS_ADMIN_AUTH) === "true") return true;

        // Free: Nhớ 6h theo localStorage
        const type = localStorage.getItem(LS_AUTH_TYPE_V4);
        const exp = localStorage.getItem(LS_AUTH_EXP_V4);
        const key = localStorage.getItem(LS_AUTH_KEY_V4);

        if (type === "free" && key && exp) {
          if (Date.now() < parseInt(exp, 10)) {
            // Kiểm tra format nghiêm ngặt Key-Taiz_
            return key.startsWith("Key-Taiz_");
          } else {
            localStorage.removeItem(LS_AUTH_KEY_V4);
            localStorage.removeItem(LS_AUTH_EXP_V4);
            localStorage.removeItem(LS_AUTH_TYPE_V4);
          }
        }
      } catch { }
      return false;
    }

    async checkUpdate() {
      console.log(`[OLM Helper] Checking for update... Current: ${CURRENT_VERSION}`);
      try {
        if (typeof GM_xmlhttpRequest === "undefined") {
          console.warn("[OLM Helper] GM_xmlhttpRequest is undefined. Cannot check for updates.");
          return null;
        }
        return new Promise((res) => {
          GM_xmlhttpRequest({
            method: "GET",
            url: VERSION_CHECK_URL + "?t=" + Date.now(),
            timeout: 5000,
            onload: (resp) => {
              try {
                const data = JSON.parse(resp.responseText);
                console.log("[OLM Helper] Version on server:", data.version);
                if (data.version && data.version !== CURRENT_VERSION) {
                  console.log("[OLM Helper] NEW VERSION DETECTED!");
                  res(data.version);
                } else {
                  console.log("[OLM Helper] Script is up to date.");
                  res(null);
                }
              } catch (e) {
                console.error("[OLM Helper] Error parsing version JSON:", e);
                res(null);
              }
            },
            onerror: (err) => {
              console.error("[OLM Helper] Update check failed:", err);
              res(null);
            }
          });
        });
      } catch (e) {
        console.error("[OLM Helper] checkUpdate Exception:", e);
        return null;
      }
    }

    async init() {
      this.injectCSS();
      const isAuthed = await this.checkAuth();
      const newVersion = await this.checkUpdate();

      if (!isAuthed || newVersion) {
        this.showAuthUI(newVersion);
        return;
      }

      this.createUI();
      this.addEventListeners();
      if (this.dark) this.container.classList.add("olm-dark");
      this.applyPosOnly();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const rect = this.container.getBoundingClientRect();
          const hasValidPosition = this.pos &&
            Number.isFinite(this.pos.left) &&
            Number.isFinite(this.pos.top) &&
            rect.left > 0 &&
            rect.top > 0 &&
            rect.left < window.innerWidth &&
            rect.top < window.innerHeight;

          if (!hasValidPosition) {
            this.ensureContainerInViewport();
          }
        });
      });

      this.applyTogglePos();
      this.ensureToggleInViewport();
      this.applyAutoSearchState(this.autoSearchEnabled);
      this.applyAutoSolveState(this.autoSolveEnabled);
      this.applyStealthMode(this.stealthMode);

      if (!this.isVisible) {
        this.container.classList.add("hidden");
        this.showToggleBtn();
      } else {
        this.hideToggleBtn();
      }

      this.isKeyValid = true;
      this.updateKeyLockedState();
      this.updateKeyInfoDisplay();
    }

    showAuthUI(newVersion = null) {
      if (document.getElementById("olm-auth-wrap")) return;
      this.authContainer = document.createElement("div");
      this.authContainer.id = "olm-auth-wrap";
      // Draggable logic setup
      this.authDrag = { dragging: false, startX: 0, startY: 0, initL: 0, initT: 0 };

      const css = `
        #olm-auth-wrap { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2147483647; width: 440px; padding: 0; border-radius: 32px; background: rgba(255,255,255,0.8); backdrop-filter: blur(35px) saturate(200%); border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 40px 100px rgba(0,0,0,0.35); font-family: -apple-system, system-ui, sans-serif; overflow: hidden; color: #0f172a; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .olm-dark #olm-auth-wrap { background: rgba(15, 23, 42, 0.92); color: #f8fafc; border-color: rgba(255,255,255,0.12); }
        
        .auth-bar { height: 40px; cursor: grab; background: rgba(0,0,0,0.03); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid rgba(0,0,0,0.05); }
        .auth-bar:active { cursor: grabbing; }
        .auth-bar::after { content: ""; width: 40px; height: 4px; border-radius: 2px; background: rgba(0,0,0,0.1); }
        .olm-dark .auth-bar::after { background: rgba(255,255,255,0.1); }
        
        .auth-inner { padding: 40px; }
        .auth-header img { width: 100px; height: 100px; border-radius: 28px; margin-bottom: 25px; box-shadow: 0 15px 45px rgba(37,99,235,0.4); border: 4px solid #fff; }
        .auth-title { font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #2563eb, #7c3aed, #db2777); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; letter-spacing: -1px; }
        .auth-subtitle { font-size: 16px; opacity: 0.7; margin-bottom: 35px; font-weight: 600; }
        
        .auth-tabs { display: flex; background: rgba(0,0,0,0.08); padding: 6px; border-radius: 20px; margin-bottom: 30px; }
        .auth-tab { flex: 1; padding: 15px; font-size: 15px; font-weight: 800; cursor: pointer; border-radius: 16px; transition: 0.3s; color: #64748b; }
        .auth-tab.active { background: #fff; color: #2563eb; box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
        .olm-dark .auth-tab.active { background: rgba(255,255,255,0.15); color: #fff; }
        
        .auth-input-group { margin-bottom: 25px; position: relative; }
        .auth-input { width: 100%; padding: 20px; border-radius: 20px; border: 2px solid rgba(0,0,0,0.05); background: #fff; text-align: center; font-size: 18px; font-weight: 800; outline: none; transition: 0.3s; color: #1e293b; font-family: monospace; }
        .olm-dark .auth-input { background: rgba(255,255,255,0.05); color: #fff; border-color: transparent; }
        .auth-input:focus { border-color: #2563eb; transform: scale(1.02); }
        
        .auth-btn-main { width: 100%; padding: 20px; border-radius: 20px; border: none; background: linear-gradient(135deg, #2563eb, #1e40af); color: #fff; font-weight: 900; cursor: pointer; transition: 0.4s; font-size: 18px; box-shadow: 0 15px 35px rgba(37,99,235,0.4); }
        .auth-btn-main:hover { transform: translateY(-4px); filter: brightness(1.1); box-shadow: 0 20px 50px rgba(37,99,235,0.5); }
        
        .yeumoney-box { display: none; margin-top: 25px; padding: 20px; background: rgba(37,99,235,0.05); border-radius: 24px; border: 1px dashed #2563eb; }
        .yeumoney-link { font-size: 13px; font-weight: 700; color: #2563eb; margin-bottom: 15px; word-break: break-all; background: rgba(255,255,255,0.5); padding: 10px; border-radius: 10px; }
        .btn-link-action { display: flex; gap: 10px; }
        .btn-link-action button { flex: 1; padding: 12px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: 0.2s; font-size: 13px; }
        .btn-open { background: #2563eb; color: #fff; }
        .btn-copy { background: #64748b; color: #fff; }
        
        #auth-toast { position: absolute; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100%); padding: 12px 25px; border-radius: 99px; font-size: 14px; font-weight: 800; color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); opacity: 0; pointer-events: none; }
        #auth-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
      `;
      const style = document.createElement("style");
      style.textContent = css;
      ensureHead(style);

      this.authContainer.innerHTML = `
        <div id="auth-toast"></div>
        <div class="auth-bar" id="auth-draggable-handle"></div>
        <div class="auth-inner">
          <div class="auth-header">
            <img src="https://play-lh.googleusercontent.com/PMA5MRr5DUJBUbDgdUn6arbGXteDjRBIZVO3P3z9154Kud2slXPjy-iiPwwKfvZhc4o=w240-h480-rw">
            <div class="auth-title">OLM Helper V1.5.1</div>
            <div class="auth-subtitle">Hệ thống xác thực bảo mật</div>
          </div>
          <div class="auth-tabs" ${newVersion ? 'style="display:none"' : ''}>
            <div class="auth-tab active" id="tab-free">Mã Truy Cập Free</div>
            <div class="auth-tab" id="tab-admin">Quyền Admin</div>
          </div>
          
          ${newVersion ? `
            <div id="section-update" style="padding: 20px; background: rgba(37,99,235,0.1); border-radius: 24px; border: 2px solid #2563eb; margin-bottom: 20px;">
              <div style="font-size: 18px; font-weight: 900; color: #2563eb; margin-bottom: 10px;">PHÁT HIỆN BẢN MỚI V${newVersion}!</div>
              <div style="font-size: 14px; font-weight: 600; opacity: 0.8; margin-bottom: 20px;">Vui lòng cập nhật để tiếp tục sử dụng các tính năng mới nhất và sửa lỗi bảo mật.</div>
              <button class="auth-btn-main" onclick="window.open('${UPDATE_URL}', '_blank'); location.reload();">CẬP NHẬT NGAY</button>
            </div>
          ` : ""}

          <div id="section-free" ${newVersion ? 'style="display:none"' : ''}>
            <div class="auth-input-group">
              <input type="text" class="auth-input" id="inp-free-key" placeholder="Dán mã Key-Taiz_ tại đây...">
            </div>
            <button class="auth-btn-main" id="btn-login-free">Xác Nhận Vào Tool</button>
            <div style="margin-top: 25px;">
              <div id="btn-show-yeumoney" style="font-size: 14px; font-weight: 800; color: #2563eb; cursor: pointer; opacity: 0.9;">Chưa có mã? Nhấn để lấy mã (6 Giờ)</div>
            </div>
            <div class="yeumoney-box" id="yeumoney-box">
              <div style="font-size: 12px; font-weight: 800; margin-bottom: 10px; color: #64748b;">LINK VƯỢT LẤY MÃ:</div>
              <div class="yeumoney-link" id="yeumoney-link-text">Đang tạo...</div>
              <div class="btn-link-action">
                <button class="btn-open" id="btn-open-link">MỞ LINK</button>
                <button class="btn-copy" id="btn-copy-link">SAO CHÉP</button>
              </div>
            </div>
          </div>
          <div id="section-admin" style="display:none">
            <div class="auth-input-group">
              <input type="password" class="auth-input" id="inp-admin-key" placeholder="Nhập mã Admin bí mật...">
            </div>
            <button class="auth-btn-main" id="btn-login-admin">Kích Hoạt Session</button>
          </div>
          <div style="margin-top: 40px; font-size: 12px; opacity: 0.5; font-weight: 800; color: #64748b; letter-spacing: 1px;">DEVELOPED BY NG TAI</div>
        </div>
      `;

      ensureBody(this.authContainer);

      const toast = this.authContainer.querySelector("#auth-toast");
      const showToast = (msg, type = "success") => {
        toast.innerText = msg;
        toast.style.background = type === "success" ? "#10b981" : "#ef4444";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
      };

      // Draggable logic
      const handle = this.authContainer.querySelector("#auth-draggable-handle");
      handle.onpointerdown = (e) => {
        this.authDrag.dragging = true;
        this.authDrag.startX = e.clientX;
        this.authDrag.startY = e.clientY;
        const rect = this.authContainer.getBoundingClientRect();
        this.authDrag.initL = rect.left + rect.width / 2;
        this.authDrag.initT = rect.top + rect.height / 2;
        this.authContainer.style.transition = "none";
        this.authContainer.style.cursor = "grabbing";
        e.preventDefault();
      };
      window.addEventListener("pointermove", (e) => {
        if (!this.authDrag.dragging) return;
        const dx = e.clientX - this.authDrag.startX;
        const dy = e.clientY - this.authDrag.startY;
        this.authContainer.style.left = (this.authDrag.initL + dx) + "px";
        this.authContainer.style.top = (this.authDrag.initT + dy) + "px";
        this.authContainer.style.transform = "translate(-50%, -50%)";
      });
      window.addEventListener("pointerup", () => {
        this.authDrag.dragging = false;
        this.authContainer.style.transition = "";
        this.authContainer.style.cursor = "";
      });

      const tabFree = this.authContainer.querySelector("#tab-free");
      const tabAdmin = this.authContainer.querySelector("#tab-admin");
      const secFree = this.authContainer.querySelector("#section-free");
      const secAdmin = this.authContainer.querySelector("#section-admin");

      tabFree.onclick = () => { tabFree.classList.add("active"); tabAdmin.classList.remove("active"); secFree.style.display = "block"; secAdmin.style.display = "none"; };
      tabAdmin.onclick = () => { tabAdmin.classList.add("active"); tabFree.classList.remove("active"); secAdmin.style.display = "block"; secFree.style.display = "none"; };

      // Free Key Logic
      const btnShowYeumoney = this.authContainer.querySelector("#btn-show-yeumoney");
      const yeuBox = this.authContainer.querySelector("#yeumoney-box");
      const yeuLinkText = this.authContainer.querySelector("#yeumoney-link-text");

      btnShowYeumoney.onclick = async () => {
        const random = Math.floor(100000 + Math.random() * 899999);
        const curKey = `Key-Taiz_${random}`;
        localStorage.setItem(LS_PENDING_KEY, curKey);

        btnShowYeumoney.innerText = "ĐANG TẠO LINK...";
        const url = `${BYPASS_BASE_URL}?ma=${curKey}`;

        try {
          const api = `https://yeumoney.com/QL_api.php?token=${YEUMONEY_TOKEN}&url=${encodeURIComponent(url)}&format=json`;

          if (typeof GM_xmlhttpRequest !== "undefined") {
            GM_xmlhttpRequest({
              method: "GET",
              url: api,
              onload: (response) => {
                try {
                  const data = JSON.parse(response.responseText);
                  if (data.status === "success" && data.shortenedUrl) {
                    yeuLinkText.innerText = data.shortenedUrl;
                    yeuBox.style.display = "block";
                    btnShowYeumoney.style.display = "none";
                    showToast("Đã tạo link rút gọn!");
                  } else {
                    throw new Error(data.status || "Lỗi API");
                  }
                } catch (e) {
                  yeuLinkText.innerText = url;
                  yeuBox.style.display = "block";
                  btnShowYeumoney.style.display = "none";
                  showToast(e.message || "Lỗi API Yeumoney", "error");
                }
              },
              onerror: () => {
                yeuLinkText.innerText = url;
                yeuBox.style.display = "block";
                btnShowYeumoney.style.display = "none";
                showToast("Lỗi kết nối API", "error");
              }
            });
          } else {
            // Fallback
            const resp = await fetch(api);
            const data = await resp.json();
            if (data.status === "success" && data.shortenedUrl) {
              yeuLinkText.innerText = data.shortenedUrl;
            } else {
              yeuLinkText.innerText = url;
            }
            yeuBox.style.display = "block";
            btnShowYeumoney.style.display = "none";
          }
        } catch {
          yeuLinkText.innerText = url;
          yeuBox.style.display = "block";
          btnShowYeumoney.style.display = "none";
        }
      };

      this.authContainer.querySelector("#btn-open-link").onclick = () => {
        window.open(yeuLinkText.innerText, "_blank");
      };
      this.authContainer.querySelector("#btn-copy-link").onclick = () => {
        navigator.clipboard.writeText(yeuLinkText.innerText);
        showToast("Đã copy link!");
      };

      this.authContainer.querySelector("#btn-login-free").onclick = () => {
        const val = this.authContainer.querySelector("#inp-free-key").value.trim();
        const pending = localStorage.getItem(LS_PENDING_KEY);

        if (pending && val === pending) {
          localStorage.setItem(LS_AUTH_KEY_V4, val);
          localStorage.setItem(LS_AUTH_TYPE_V4, "free");
          const sixHours = 6 * 60 * 60 * 1000;
          localStorage.setItem(LS_AUTH_EXP_V4, (Date.now() + sixHours).toString());
          showToast("Xác nhận thành công! Đang vào tool...");
          setTimeout(() => location.reload(), 1500);
        } else {
          showToast("Mã xác thực không chính xác!", "error");
        }
      };

      this.authContainer.querySelector("#btn-login-admin").onclick = () => {
        const val = this.authContainer.querySelector("#inp-admin-key").value.trim();
        if (val === ADMIN_KEY_INTERNAL) {
          sessionStorage.setItem(SS_ADMIN_AUTH, "true");
          showToast("Chào Admin! Đang mở khóa session...");
          setTimeout(() => location.reload(), 1500);
        } else {
          showToast("Sai mã Admin!", "error");
        }
      };
    }

    injectCSS() {
      const css = `
        :root{
          --panel-w: 520px;
          --panel-h: 70vh;
          --glass-border: rgba(0,0,0,0.12);
          --bg-glass: #ffffffcc;
          --bg-top: #ffffffaa;
          --bg-sub: #ffffff88;
          --shadow: 0 10px 24px rgba(17,24,39,0.18);
          --text-main: #0f172a;
          --text-sub: #334155;
          --muted: #6b7280;
          --btn-bg: #f3f4f6;
          --btn-fg: #111827;
          --btn-border: #d1d5db;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }
        #olm-answers-container{
          position: fixed;
          top: max(12px, env(safe-area-inset-top));
          width: var(--panel-w); height: var(--panel-h);
          z-index: 2147483647; display:flex; flex-direction:column;
          border-radius: 14px; overflow: hidden;
          -webkit-backdrop-filter: blur(10px) saturate(120%);
          backdrop-filter: blur(10px) saturate(120%);
          background: var(--bg-glass);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow);
          transition: transform .18s ease, opacity .18s ease, left .12s, right .12s;
          color: var(--text-main); user-select: none; min-width: 320px;
          max-width: calc(100vw - 24px);
          max-height: calc(100vh - 24px);
        }
        #olm-answers-container.hidden{ opacity:.0; transform: translateY(-6px) scale(.98); pointer-events:none; }

        #olm-answers-container.olm-dark{
          --glass-border: rgba(255,255,255,0.12);
          --bg-glass: rgba(27,31,40,0.75);
          --bg-top: rgba(255,255,255,0.06);
          --bg-sub: rgba(255,255,255,0.08);
          --shadow: 0 10px 30px rgba(0,0,0,0.55);
          --text-main: #e5e7eb; --text-sub: #f1f5f9;
          --btn-bg: #1f2937;
          --btn-fg: #e5e7eb;
          --btn-border: #4b5563;
          --muted: #e2e8f0;
        }

        .olm-topbar{
          display:flex; flex-direction:column; gap:6px;
          padding:10px 12px; background: var(--bg-top);
          border-bottom: 1px solid rgba(0,0,0,0.06); touch-action: none;
        }
        #olm-answers-container.olm-dark .olm-topbar{ border-bottom-color: rgba(255,255,255,0.06); }

        .olm-header{ display:flex; align-items:center; gap:10px; cursor: grab; user-select:none; }
        .olm-header:active{ cursor: grabbing; }
        .olm-brand{ display:flex; align-items:center; gap:10px; }
        .olm-logo{
          width:28px; height:28px; border-radius:6px; overflow:hidden; flex:0 0 auto;
          background:#eee;
        }
        .olm-logo img{ width:100%; height:100%; object-fit:cover; display:block; }
        .olm-title-line{ display:flex; align-items:baseline; gap:6px; flex-wrap:wrap; }
        .olm-title-line .tt-strong{ font-size:14px; font-weight:800; }
        .olm-title-line .tt-sub{ font-size:12px; color: var(--muted); }
        .olm-title-line .tt-sub .brand-link{
          color: inherit;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-decoration-color: currentColor;
          transition: color .15s ease, text-shadow .15s ease;
        }
        .olm-title-line .tt-sub .brand-link:hover{
          color: #fbbf24;
          text-shadow: 0 0 8px rgba(251,191,36,0.7);
        }

        .olm-controls-wrap{
          display:flex; flex-direction:column; gap:4px; position:relative; width:100%;
        }
        .olm-controls-row{
          display:flex; gap:8px; align-items:center; flex-wrap:nowrap;
          overflow-x:auto; -webkit-overflow-scrolling: touch; padding-top:2px;
          scrollbar-width: none;
          cursor: grab;
          user-select:none;
          touch-action: pan-x;
        }
        .olm-controls-row.is-dragging{ cursor: grabbing; }
        .olm-controls-row::-webkit-scrollbar{ height:0; }
        .olm-controls-row .olm-btn{ flex:0 0 auto; min-width:max-content; }

        #olm-answers-container .olm-btn{
          appearance: button;
          border: 1px solid var(--btn-border);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 700;
          line-height: 1;
          display:inline-flex; align-items:center; gap:6px;
          cursor:pointer;
          background: var(--btn-bg);
          color: var(--btn-fg);
          white-space: nowrap;
          user-select:none;
          position:relative;
          overflow:hidden;
          transition: background .2s ease, color .2s ease, box-shadow .2s ease, transform .2s ease;
        }
        #olm-answers-container .olm-btn svg{ fill: currentColor; }
        #olm-answers-container .olm-btn:active{ transform: translateY(1px); }
        #olm-answers-container .olm-btn.is-ghost{
          background: transparent;
          color: var(--text-main);
          border-color: var(--btn-border);
        }
        #olm-answers-container.olm-dark .olm-btn.is-ghost{ color: var(--text-main); }
        #olm-answers-container .olm-btn.glow-toggle{
          background:transparent;
          color:var(--text-main);
          border:1px solid rgba(15,23,42,0.2);
          box-shadow:none;
        }
        #olm-answers-container .olm-btn.glow-toggle:hover,
        #olm-answers-container .olm-btn.glow-toggle:focus-visible{
          box-shadow:0 0 0 1px rgba(37,99,235,0.35);
        }
        #olm-answers-container.olm-dark .olm-btn.glow-toggle{
          border:1px solid rgba(148,163,184,0.45);
          box-shadow:none;
        }
        #olm-answers-container .olm-btn.glow-toggle.is-active{
          border:1px solid transparent;
          background:
            linear-gradient(#fff,#fff) padding-box,
            linear-gradient(130deg,#2563eb,#06b6d4,#a855f7,#f97316,#facc15,#2563eb) border-box;
          background-size:100% 100%, 280% 280%;
          background-position:0 0, 0% 50%;
          color:var(--text-main);
          box-shadow:0 0 20px rgba(37,99,235,0.35);
          animation:glowSweep 3s linear infinite;
        }
        #olm-answers-container .olm-btn.glow-toggle.is-active::after{
          content:"";
          position:absolute;
          inset:2px;
          border-radius:inherit;
          border:1px solid rgba(255,255,255,0.4);
          pointer-events:none;
        }
        #olm-answers-container.olm-dark .olm-btn.glow-toggle.is-active{
          background:
            linear-gradient(rgba(15,23,42,0.25),rgba(15,23,42,0.25)) padding-box,
            linear-gradient(130deg,#38bdf8,#a855f7,#f97316,#facc15,#38bdf8) border-box;
          color:#f8fafc;
          box-shadow:0 0 24px rgba(14,165,233,0.5);
        }
        #olm-answers-container.olm-dark .olm-btn.glow-toggle.is-active::after{
          border-color:rgba(148,163,184,0.55);
        }
        @keyframes glowSweep{
          0%{ background-position:0 0, 0% 50%; }
          100%{ background-position:0 0, 300% 50%; }
        }

        .key-auth-wrap{ display:flex; flex-direction:column; gap:8px; padding:10px 12px; border-bottom:1px solid rgba(0,0,0,0.06); background: var(--bg-sub); }
        #olm-answers-container.olm-dark .key-auth-wrap{ border-bottom-color: rgba(255,255,255,0.06); }
        .key-input-group{ display:flex; gap:6px; align-items:stretch; flex-wrap:wrap; }
        .key-input{ flex:1 1 100%; min-width:0; padding:8px 10px; border-radius:8px; border:1px solid rgba(0,0,0,0.12); outline:none; background: rgba(255,255,255,0.9); font-size:12px; color:#111827; font-family: monospace; }
        #olm-answers-container.olm-dark .key-input{ background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.15); color: var(--text-main); }
        .key-input:disabled{ opacity:0.6; cursor:not-allowed; }
        .key-paste-btn, .key-check-btn, .key-get-btn{
          flex:0 0 auto; padding:8px 16px; border-radius:8px; border:none;
          background: var(--btn-bg); color: var(--btn-fg); font-size:12px; font-weight:600;
          cursor:pointer; white-space:nowrap;
          display:inline-flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .key-paste-btn::before, .key-check-btn::before, .key-get-btn::before{
          content:"";
          position:absolute;
          top:50%; left:50%;
          width:0; height:0;
          border-radius:50%;
          background:rgba(255,255,255,0.3);
          transform:translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
        }
        .key-paste-btn:hover::before, .key-check-btn:hover::before, .key-get-btn:hover::before{
          width:300px; height:300px;
        }
        .key-paste-btn:hover, .key-check-btn:hover, .key-get-btn:hover{
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .key-paste-btn:active, .key-check-btn:active, .key-get-btn:active{
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .key-check-btn{
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color:#fff;
          box-shadow: 0 2px 6px rgba(37,99,235,0.3);
        }
        .key-check-btn:hover{
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          box-shadow: 0 4px 12px rgba(37,99,235,0.4);
        }
        .key-check-btn:disabled{
          opacity:0.5;
          cursor:not-allowed;
          transform:none !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }
        .key-get-btn{
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color:#fff;
          box-shadow: 0 2px 6px rgba(16,185,129,0.3);
        }
        .key-get-btn:hover{
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          box-shadow: 0 4px 12px rgba(16,185,129,0.4);
        }
        .key-paste-btn{
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
          color:#fff;
          box-shadow: 0 2px 6px rgba(107,114,128,0.3);
        }
        .key-paste-btn:hover{
          background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
          box-shadow: 0 4px 12px rgba(107,114,128,0.4);
        }
        .key-status{ font-size:11px; color: var(--muted); padding:4px 0; min-height:16px; }
        .key-status.success{ color:#10b981; }
        .key-status.error{ color:#ef4444; }
        .key-status.warning{ color:#f59e0b; }
        .key-expires{ font-size:11px; color: var(--muted); margin-top:4px; }

        .search-wrap{ display:flex; gap:8px; align-items:center; padding:8px 12px; border-bottom:1px solid rgba(0,0,0,0.06); background: var(--bg-sub); }
        #olm-answers-container.olm-dark .search-wrap{ border-bottom-color: rgba(255,255,255,0.06); }
        .search-input{ flex:1; padding:8px 10px; border-radius:10px; border:1px solid rgba(0,0,0,0.06); outline:none; background: rgba(255,255,255,0.85); font-size:13px; color:#111827; }
        #olm-answers-container.olm-dark .search-input{ background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.12); color: var(--text-main); }
        .search-clear-btn{
          width:28px; height:28px; border-radius:999px; border:1px solid rgba(15,23,42,0.15);
          background:#fff; color:#0f172a; font-weight:700;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition: background .2s, color .2s, opacity .2s;
          opacity:0; pointer-events:none;
        }
        .search-clear-btn.is-visible{ opacity:1; pointer-events:auto; }
        #olm-answers-container.olm-dark .search-clear-btn{
          background:rgba(15,23,42,0.35); color:#e5e7eb; border-color: rgba(148,163,184,0.35);
        }
        .meta{ font-size:12px; color: var(--muted); min-width:74px; text-align:right; }

        #olm-answers-container.key-locked .olm-btn:not(.key-unlock-btn):not(.dark-mode-btn):not(.hide-btn){ opacity:0.5; pointer-events:none; }
        #olm-answers-container.key-locked #olm-answers-content{ opacity:0.3; pointer-events:none; }
        #olm-answers-container.key-locked .search-wrap{ display:none !important; }

        .key-auth-wrap.hidden{ display:none !important; }
        .key-info-display{
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 11px;
        }
        .key-info-display .key-label,
        .key-info-display .key-value,
        .key-info-display .key-time,
        .key-info-display .key-status-text{
          font-weight: 600;
          display: inline-block;
        }
        .key-info-display .key-label{
          color: #667eea;
          text-shadow: 0 0 8px rgba(102, 126, 234, 0.4);
          animation: keyGlowUnified 3s ease-in-out infinite;
        }
        .key-info-display .key-value{
          font-family: monospace;
          color: #f5576c;
          text-shadow: 0 0 8px rgba(245, 87, 108, 0.4);
          animation: keyGlowUnified 3s ease-in-out infinite;
        }
        .key-info-display .key-time{
          color: #667eea;
          text-shadow: 0 0 8px rgba(102, 126, 234, 0.4);
          animation: keyGlowUnified 3s ease-in-out infinite;
        }
        .key-info-display .key-status-text{
          color: #10b981;
          text-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
          animation: keyGlowUnified 3s ease-in-out infinite;
        }
        #olm-answers-container.olm-dark .key-info-display .key-label{
          color: #818cf8;
          text-shadow: 0 0 8px rgba(129, 140, 248, 0.5);
        }
        #olm-answers-container.olm-dark .key-info-display .key-value{
          color: #f472b6;
          text-shadow: 0 0 8px rgba(244, 114, 182, 0.5);
        }
        #olm-answers-container.olm-dark .key-info-display .key-time{
          color: #818cf8;
          text-shadow: 0 0 8px rgba(129, 140, 248, 0.5);
        }
        #olm-answers-container.olm-dark .key-info-display .key-status-text{
          color: #34d399;
          text-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
        }
        .key-info-display.warning .key-time{
          color: #f59e0b;
          text-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }
        .key-info-display.error{
          color: #ef4444;
        }
        .key-info-display.error .key-label,
        .key-info-display.error .key-value,
        .key-info-display.error .key-status-text{
          color: #ef4444;
          text-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
          animation: keyErrorGlow 1.5s ease-in-out infinite;
        }
        @keyframes keyGlowUnified{
          0%, 100%{ opacity: 1; text-shadow: 0 0 8px currentColor; }
          50%{ opacity: 0.85; text-shadow: 0 0 12px currentColor; }
        }
        @keyframes keyErrorGlow{
          0%, 100%{ opacity: 1; text-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
          50%{ opacity: 0.8; text-shadow: 0 0 14px rgba(239, 68, 68, 0.8); }
        }

        #olm-answers-content{ padding:10px; overflow-y:auto; -webkit-overflow-scrolling: touch; flex:1; display:flex; flex-direction:column; gap:10px; }
        .qa-block{ display:flex; flex-direction:column; gap:8px; padding:12px; border-radius:10px; background: #ffffffdd; border:1px solid rgba(15,23,42,0.05); page-break-inside: avoid; break-inside: avoid; }
        #olm-answers-container.olm-dark .qa-block{ background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.08); }

        .passage-block{ display:block; padding:12px; border-radius:10px; background:rgba(255,255,255,0.9); border:1px dashed rgba(15,23,42,0.15); color: var(--text-main); }
        #olm-answers-container.olm-dark .passage-block{ background:rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }

        .qa-top{ display:flex; align-items:flex-start; gap:10px; }
        .question-content{ font-weight:700; color:var(--text-main); font-size:14px; flex:1; }
        .q-index{ margin-right:6px; color: var(--text-sub); }
        .content-container{ padding-left:6px; color:#0b3c49; font-size:13px; }
        #olm-answers-container.olm-dark .content-container{ color: var(--text-main); }
        .content-container[data-type="answer"]{ font-weight:600; }
        .content-container[data-type="answer"] .correct-answer{ color: #10b981 !important; }

        .footer-bar{ padding:8px 10px; display:flex; align-items:center; gap:8px; border-top:1px solid rgba(0,0,0,0.06); background: var(--bg-sub); }
        #olm-answers-container.olm-dark .footer-bar{ border-top-color: rgba(255,255,255,0.08); }
        #count-badge{ font-weight:700; color:var(--muted); margin-left:auto; font-size:13px; }

        .resize-handle{ position:absolute; right:8px; bottom:8px; width:18px; height:18px; cursor: nwse-resize;
          border-right:2px solid rgba(0,0,0,0.25); border-bottom:2px solid rgba(0,0,0,0.25); opacity:.7; touch-action: none; }
        #olm-answers-container.olm-dark .resize-handle{ border-right-color: rgba(255,255,255,0.35); border-bottom-color: rgba(255,255,255,0.35); }
        .resize-width-handle{
          position:absolute;
          left:50%;
          bottom:6px;
          transform:translateX(-50%);
          width:34px;
          height:10px;
          cursor: ns-resize;
          border-radius:999px;
          background:rgba(15,23,42,0.18);
          border:1px solid rgba(15,23,42,0.25);
          touch-action:none;
          opacity:.85;
        }
        #olm-answers-container.olm-dark .resize-width-handle{
          background:rgba(148,163,184,0.25);
          border-color:rgba(148,163,184,0.45);
        }
        #olm-answers-container.resizing{ user-select:none; }

        mark.${HIGHLIGHT_CLASS}{ background: rgba(250, 204, 21, 0.35); padding: 0 2px; border-radius: 3px; }
        .${PAGE_HIGHLIGHT_CLASS}{
          position: relative;
          border-radius: 10px;
          box-shadow: 0 0 0 2px rgba(16,185,129,0.85) inset, 0 8px 18px rgba(16,185,129,0.25);
          animation: autoSolvePulse 1.5s ease-in-out infinite;
        }
        .${PAGE_HIGHLIGHT_CLASS}::before{
          content:"";
          position:absolute;
          inset:-3px;
          border-radius:inherit;
          border:1px dashed rgba(16,185,129,0.35);
          pointer-events:none;
        }
        .tf-row .clause.${PAGE_HIGHLIGHT_CLASS}{
          display:block;
          width:100%;
          padding:6px 10px;
          box-sizing:border-box;
        }
        @keyframes autoSolvePulse{
          0%{ box-shadow:0 0 0 2px rgba(16,185,129,0.85),0 6px 14px rgba(16,185,129,0.2); }
          100%{ box-shadow:0 0 0 4px rgba(16,185,129,0.4),0 16px 32px rgba(16,185,129,0.45); }
        }

        @media (max-width: 520px){
          #olm-answers-container{ left: 12px !important; right: 12px !important; width: auto !important; }
          .question-content{ font-size:13px; }
          .olm-controls-row{ gap:6px; }
          #olm-answers-container .olm-btn{ padding:6px 8px; font-size:12px; }
          .resize-width-handle{ width:44px; height:14px; bottom:4px; }

          .key-auth-wrap{ padding:8px 10px; gap:10px; }
          .key-input-group{ gap:8px; }
          .key-input{
            flex:1 1 100%;
            padding:10px 8px;
            font-size:13px;
            margin-bottom:4px;
          }
          .key-paste-btn, .key-check-btn, .key-get-btn{
            flex:1 1 calc(33.333% - 6px);
            padding:10px 8px;
            font-size:11px;
            text-align:center;
            min-width:0;
          }
          .key-paste-btn{ flex:0 0 auto; min-width:60px; }

          .key-status{ font-size:11px; padding:2px 0; line-height:1.4; }
          .key-expires{ font-size:10px; margin-top:2px; }
          .key-info-display{ font-size:10px; flex-wrap:wrap; gap:4px; }
        }

        #olm-toggle-btn{
          position: fixed;
          top: max(12px, env(safe-area-inset-top));
          right: 12px;
          width: 46px; height: 46px;
          border-radius: 999px;
          display:none; align-items:center; justify-content:center;
          z-index: 2147483647;
          border: none;
          background: transparent;
          cursor: grab; user-select: none;
          touch-action: none;
          will-change: transform;
          transition: transform 0.2s ease, filter 0.3s ease;
          overflow: visible;
          padding: 0;
          filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
          animation: techPulse 3s ease-in-out infinite;
        }
        #olm-toggle-btn::before{
          content: "";
          position: absolute;
          inset: -1.5px;
          border-radius: 999px;
          background: conic-gradient(
            from 0deg,
            rgba(0, 0, 0, 0.3) 0deg,
            rgba(100, 100, 100, 0.4) 90deg,
            rgba(200, 200, 200, 0.5) 180deg,
            rgba(255, 255, 255, 0.6) 270deg,
            rgba(0, 0, 0, 0.3) 360deg
          );
          animation: rotateGlow 4s linear infinite;
          z-index: -2;
          pointer-events: none;
          opacity: 0.6;
        }
        #olm-toggle-btn::after{
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 999px;
          background: conic-gradient(
            from 180deg,
            transparent 0deg,
            transparent 260deg,
            rgba(255, 255, 255, 0.7) 270deg,
            rgba(255, 255, 255, 0.9) 280deg,
            rgba(255, 255, 255, 0.7) 290deg,
            transparent 300deg,
            transparent 360deg
          );
          animation: rotateScan 3s linear infinite;
          z-index: -1;
          pointer-events: none;
        }
        @keyframes rotateGlow{
          0%{ transform: rotate(0deg); }
          100%{ transform: rotate(360deg); }
        }
        @keyframes rotateScan{
          0%{ transform: rotate(0deg); opacity: 0.6; }
          50%{ opacity: 0.9; }
          100%{ transform: rotate(360deg); opacity: 0.6; }
        }
        @keyframes techPulse{
          0%, 100%{
            filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
          }
          50%{
            filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
          }
        }
        #olm-toggle-btn:hover{
          transform: scale(1.05);
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
        }
        #olm-toggle-btn:active{
          cursor: grabbing;
          transform: scale(0.95);
        }
        #olm-toggle-btn.is-dragging{
          cursor: grabbing;
          transition: none;
          animation: none;
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.7));
        }
        #olm-toggle-btn.show{ display:flex; }
        #olm-toggle-btn img{
          width: calc(100% - 2px);
          height: calc(100% - 2px);
          object-fit: cover;
          border-radius: 999px;
          pointer-events: none;
          display: block;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2),
                      0 0 4px rgba(255, 255, 255, 0.2);
        }

        #olm-answers-container.olm-dark ~ #olm-toggle-btn::before{
          background: conic-gradient(
            from 0deg,
            rgba(255, 255, 255, 0.1) 0deg,
            rgba(200, 200, 200, 0.2) 90deg,
            rgba(150, 150, 150, 0.3) 180deg,
            rgba(255, 255, 255, 0.4) 270deg,
            rgba(255, 255, 255, 0.1) 360deg
          );
          opacity: 0.7;
        }
        #olm-answers-container.olm-dark ~ #olm-toggle-btn{
          border: none;
          background: transparent;
        }
        #olm-answers-container.olm-dark ~ #olm-toggle-btn img{
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05),
                      0 0 4px rgba(255, 255, 255, 0.3);
        }

        .pdf-root{ width: 900px; max-width: 100%; margin: 0 auto; line-height: 1.6; }
        .pdf-spacer{ height: 32px; }
        .pdf-root *{ line-height: inherit; }
        mjx-container{ page-break-inside: avoid; break-inside: avoid; }
        .pdf-root mjx-container{
          display: inline-block !important;
          vertical-align: baseline !important;
          line-height: 1 !important;
          margin: 0 2px;
        }
        .pdf-root mjx-container svg{
          vertical-align: baseline !important;
          display: inline-block !important;
        }

        .pdf-root mjx-container mjx-over{
          display: inline-block !important;
          width: auto !important;
          max-width: 100% !important;
          overflow: visible !important;
        }
        .pdf-root mjx-container mjx-over > mjx-utext{
          display: inline-block !important;
        }
        .pdf-root mjx-container mjx-over > svg{
          width: auto !important;
          max-width: 100% !important;
          overflow: visible !important;
        }

        .pdf-root p, .pdf-root div, .pdf-root span{
          line-height: 1.6;
        }
        .pdf-root p mjx-container, .pdf-root div mjx-container, .pdf-root span mjx-container{
          vertical-align: -0.1em !important;
        }
      `;
      const style = document.createElement("style");
      style.textContent = css;
      ensureHead(style);
    }

    createUI() {
      this.container = document.createElement("div");
      this.container.id = "olm-answers-container";
      this.container.style.width = this.size.w + "px";
      this.container.style.height = this.size.h + "px";

      const topbar = document.createElement("div");
      topbar.className = "olm-topbar";

      const header = document.createElement("div");
      header.className = "olm-header";

      const brand = document.createElement("div");
      brand.className = "olm-brand";

      const logo = document.createElement("div");
      logo.className = "olm-logo";
      const logoImg = document.createElement("img");
      logoImg.src = "https://play-lh.googleusercontent.com/PMA5MRr5DUJBUbDgdUn6arbGXteDjRBIZVO3P3z9154Kud2slXPjy-iiPwwKfvZhc4o=w240-h480-rw";
      logoImg.alt = "OLM logo";
      logo.appendChild(logoImg);

      const titleLine = document.createElement("div");
      titleLine.className = "olm-title-line";
      const ttStrong = document.createElement("span");
      ttStrong.className = "tt-strong";
      ttStrong.textContent = "OLM Helper";
      const ttSub = document.createElement("span");
      ttSub.className = "tt-sub";
      const brandLink = document.createElement("a");
      brandLink.className = "brand-link";
      brandLink.textContent = "Ng Tai";
      brandLink.href = BRAND_LINK_URL || "#";
      brandLink.rel = "noopener";
      if (BRAND_LINK_URL) brandLink.target = "_blank";
      ttSub.append("by ", brandLink);
      titleLine.append(ttStrong, ttSub);

      brand.append(logo, titleLine);
      header.append(brand);
      header.addEventListener("pointerdown", this.onPointerDownDrag);

      const controlsRow = document.createElement("div");
      controlsRow.className = "olm-controls-row";
      controlsRow.addEventListener("pointerdown", this.onControlsPointerDown);
      controlsRow.addEventListener("click", this.onControlsClickCapture, true);
      const controlsWrap = document.createElement("div");
      controlsWrap.className = "olm-controls-wrap";

      const darkBtn = document.createElement("button");
      darkBtn.className = "olm-btn is-ghost dark-mode-btn"; darkBtn.title = "Dark mode"; darkBtn.setAttribute("aria-label", "Toggle dark mode");
      darkBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
      darkBtn.addEventListener("click", () => this.toggleDarkMode());

      const stealthBtn = document.createElement("button");
      stealthBtn.className = "olm-btn glow-toggle";
      stealthBtn.title = "Chế độ chống phát hiện khi rời tab/app";
      stealthBtn.textContent = "Stealth";
      stealthBtn.addEventListener("click", () => this.toggleStealthMode());
      const autoSearchBtn = document.createElement("button");
      autoSearchBtn.className = "olm-btn glow-toggle";
      autoSearchBtn.title = "Bat/tat tu dong tim kiem khi boi den";
      autoSearchBtn.textContent = "Auto Search";
      autoSearchBtn.addEventListener("click", () => this.toggleAutoSearch());
      const autoSolveBtn = document.createElement("button");
      autoSolveBtn.className = "olm-btn glow-toggle";
      autoSolveBtn.title = "Bat/tat tu dong highlight dap an dang hien tren trang";
      autoSolveBtn.textContent = "Hiển thị đáp án";
      autoSolveBtn.addEventListener("click", () => this.toggleAutoSolve());

      const collapseBtn = document.createElement("button");
      collapseBtn.className = "olm-btn is-ghost hide-btn"; collapseBtn.title = "Ẩn/Hiện Menu";
      collapseBtn.textContent = "Ẩn Menu";
      collapseBtn.addEventListener("click", () => this.toggleVisibility());

      const exportTxtBtn = document.createElement("button");
      exportTxtBtn.id = "export-btn"; exportTxtBtn.className = "olm-btn is-ghost";
      exportTxtBtn.textContent = "TXT";
      exportTxtBtn.addEventListener("click", () => this.exportToTxt());

      const exportPdfBtn = document.createElement("button");
      exportPdfBtn.id = "export-pdf-btn"; exportPdfBtn.className = "olm-btn is-ghost";
      exportPdfBtn.textContent = "PDF";
      exportPdfBtn.addEventListener("click", () => this.exportToPDF());

      const exportWordBtn = document.createElement("button");
      exportWordBtn.id = "export-word-btn"; exportWordBtn.className = "olm-btn is-ghost";
      exportWordBtn.textContent = "WORD";
      exportWordBtn.addEventListener("click", (event) => this.downloadWordFile(event));

      const exportWordV2Btn = document.createElement("button");
      exportWordV2Btn.id = "export-word-v2-btn"; exportWordV2Btn.className = "olm-btn is-ghost";
      exportWordV2Btn.textContent = "WORD V2";
      exportWordV2Btn.addEventListener("click", (event) => this.exportWordV2(event));

      const keyInfoBtn = document.createElement("button");
      keyInfoBtn.className = "olm-btn is-ghost key-info-btn";
      keyInfoBtn.textContent = "Key Info";
      keyInfoBtn.title = "Thông tin key";
      keyInfoBtn.style.display = "none";
      keyInfoBtn.addEventListener("click", () => this.toggleKeyInfo());

      controlsRow.append(darkBtn, collapseBtn, stealthBtn, autoSearchBtn, autoSolveBtn, exportTxtBtn, exportPdfBtn, exportWordBtn, exportWordV2Btn);
      controlsWrap.append(controlsRow);
      topbar.append(header, controlsWrap);

      const keyAuthWrap = document.createElement("div");
      keyAuthWrap.className = "key-auth-wrap";

      const keyInputGroup = document.createElement("div");
      keyInputGroup.className = "key-input-group";

      const keyInput = document.createElement("input");
      keyInput.type = "text";
      keyInput.className = "key-input";
      keyInput.placeholder = "Nhập API Key...";
      keyInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.handleCheckKey();
        }
      });

      const pasteBtn = document.createElement("button");
      pasteBtn.className = "key-paste-btn";
      pasteBtn.textContent = "Dán";
      pasteBtn.title = "Click để focus và dán key (Ctrl+V hoặc Right-click > Paste)";
      pasteBtn.addEventListener("click", () => {
        keyInput.focus();
        keyInput.select();

        if (navigator.clipboard && navigator.clipboard.readText) {
          navigator.clipboard.readText().then(text => {
            if (text && text.trim()) {
              keyInput.value = text.trim();
              this.handleCheckKey();
            }
          }).catch(() => {

          });
        }
      });

      const checkKeyBtn = document.createElement("button");
      checkKeyBtn.className = "key-check-btn";
      checkKeyBtn.textContent = "Kiểm Tra";
      checkKeyBtn.addEventListener("click", () => this.handleCheckKey());

      const getKeyBtn = document.createElement("button");
      getKeyBtn.className = "key-get-btn";
      getKeyBtn.textContent = "Lấy Key";
      getKeyBtn.addEventListener("click", () => {
        window.open(`${API_BASE_URL}/getkey`, "_blank");
      });

      keyInputGroup.append(keyInput, pasteBtn, checkKeyBtn, getKeyBtn);

      const keyStatus = document.createElement("div");
      keyStatus.className = "key-status";

      const keyExpires = document.createElement("div");
      keyExpires.className = "key-expires";

      keyAuthWrap.append(keyInputGroup, keyStatus, keyExpires);

      this.keyInput = keyInput;
      this.keyStatusEl = keyStatus;
      this.keyExpiresEl = keyExpires;
      this.checkKeyBtn = checkKeyBtn;
      this.getKeyBtn = getKeyBtn;
      this.keyAuthWrap = keyAuthWrap;
      this.keyInfoBtn = keyInfoBtn;
      this.keyInfoVisible = false;

      const searchWrap = document.createElement("div"); searchWrap.className = "search-wrap";
      const searchInput = document.createElement("input");
      searchInput.className = "search-input";
      searchInput.placeholder = "Tìm theo từ khóa";
      searchInput.addEventListener("input", (e) => {
        this.filterDebounced(e.target.value);
        this.updateSearchClearState();
      });
      const clearSearchBtn = document.createElement("button");
      clearSearchBtn.type = "button";
      clearSearchBtn.className = "search-clear-btn";
      clearSearchBtn.setAttribute("aria-label", "Xóa tìm kiếm");
      clearSearchBtn.textContent = "×";
      clearSearchBtn.addEventListener("click", () => {
        if (!this.searchInput) return;
        if (!this.searchInput.value) return;
        this.searchInput.value = "";
        this.filterDebounced("");
        this.updateSearchClearState();
      });
      const meta = document.createElement("div"); meta.className = "meta"; meta.id = "meta-info"; meta.textContent = "0 câu";
      searchWrap.append(searchInput, clearSearchBtn, meta);

      this.contentArea = document.createElement("div"); this.contentArea.id = "olm-answers-content";

      const footer = document.createElement("div"); footer.className = "footer-bar";
      const keyInfoDisplay = document.createElement("div");
      keyInfoDisplay.className = "key-info-display";
      const countBadge = document.createElement("div"); countBadge.id = "count-badge"; countBadge.textContent = "0 câu";
      footer.append(keyInfoDisplay, countBadge);
      this.keyInfoDisplay = keyInfoDisplay;

      const handle = document.createElement("div");
      handle.className = "resize-handle"; handle.title = "Kéo để đổi kích thước";
      handle.addEventListener("pointerdown", this.onPointerDownResize);
      this.resizeHandle = handle;

      const widthHandle = document.createElement("div");
      widthHandle.className = "resize-width-handle";
      widthHandle.title = "Kéo để đổi chiều cao";
      widthHandle.addEventListener("pointerdown", this.onPointerDownWidthResize);
      this.resizeWidthHandle = widthHandle;

      this.container.append(topbar, searchWrap, this.contentArea, footer, handle, widthHandle);
      ensureBody(this.container);

      this.topbar = topbar;
      this.searchInput = searchInput;
      this.countBadge = countBadge;
      this.metaInfo = meta;
      this.darkBtn = darkBtn;
      this.stealthBtn = stealthBtn;
      this.autoSearchBtn = autoSearchBtn;
      this.autoSolveBtn = autoSolveBtn;
      this.controlsRow = controlsRow;
      this.searchClearBtn = clearSearchBtn;
      this.updateSearchClearState();

      const tbtn = document.createElement("div");
      tbtn.id = "olm-toggle-btn"; tbtn.title = "Hiện OLM Helper";
      const timg = document.createElement("img");
      timg.alt = "Toggle OLM Helper";
      timg.src = TOGGLE_ICON_URL;
      tbtn.appendChild(timg);

      tbtn.addEventListener("click", (e) => {
        if (tbtn.__dragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        this.isVisible = true;
        this.container.classList.remove("hidden");
        this.hideToggleBtn();
        try { localStorage.setItem(LS_VISIBLE, "1"); } catch { }
      });

      tbtn.addEventListener("pointerdown", this.onPointerDownToggle);
      ensureBody(tbtn);
      this.toggleBtn = tbtn;
    }

    addEventListeners() {
      window.addEventListener("keydown", this.onKeyDown);

      window.addEventListener("resize", this.onWindowResize);
      window.addEventListener("scroll", () => { }, { passive: true });
      document.addEventListener("selectionchange", this.handleSelectionChange);
    }

    onWindowResize() {
      this.ensureContainerInViewport();
      this.boundToggleInside();
      this.ensureToggleInViewport();
    }

    handleSelectionChange() {
      if (!this.autoSearchEnabled || !this.searchInput || !this.filterDebounced) return;
      const sel = document.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().trim();
      if (!text || text.length > 200) return;
      const anchor = sel.anchorNode;
      const focus = sel.focusNode;
      if ((anchor && this.container?.contains(anchor)) || (focus && this.container?.contains(focus))) return;
      if (text === this.lastSelectionText) return;
      this.lastSelectionText = text;
      this.searchInput.value = text;
      this.filterDebounced(text);
      this.updateSearchClearState();
    }

    updateSearchClearState() {
      if (!this.searchClearBtn || !this.searchInput) return;
      const hasText = !!this.searchInput.value;
      this.searchClearBtn.classList.toggle("is-visible", hasText);
      this.searchClearBtn.disabled = !hasText;
    }

    onControlsPointerDown(e) {
      if (!this.controlsRow) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      this.controlsScroll.dragging = true;
      this.controlsScroll.startX = e.clientX;
      this.controlsScroll.scrollLeft = this.controlsRow.scrollLeft;
      this.controlsScroll.moved = false;
      this.controlsRow.classList.add("is-dragging");
      window.addEventListener("pointermove", this.onControlsPointerMove, { passive: false });
      window.addEventListener("pointerup", this.onControlsPointerUp);
    }

    onControlsPointerMove(e) {
      if (!this.controlsScroll.dragging) return;
      const dx = e.clientX - this.controlsScroll.startX;
      if (!this.controlsScroll.moved && Math.abs(dx) > 3) this.controlsScroll.moved = true;
      if (!this.controlsScroll.moved) return;
      e.preventDefault();
      this.controlsRow.scrollLeft = this.controlsScroll.scrollLeft - dx;
    }

    onControlsPointerUp(e) {
      if (!this.controlsScroll.dragging) return;
      this.controlsScroll.dragging = false;
      window.removeEventListener("pointermove", this.onControlsPointerMove, { passive: false });
      window.removeEventListener("pointerup", this.onControlsPointerUp);
      this.controlsRow.classList.remove("is-dragging");
      const wasMoved = this.controlsScroll.moved;
      this.controlsScroll.moved = false;
      this.controlsScroll.startX = 0;
      this.controlsScroll.scrollLeft = this.controlsRow?.scrollLeft ?? 0;
      if (wasMoved) {
        this.controlsDragPreventClick = true;
        setTimeout(() => { this.controlsDragPreventClick = false; }, 60);
      }
    }

    onControlsClickCapture(e) {
      if (!this.controlsDragPreventClick) return;
      e.stopPropagation();
      e.preventDefault();
    }

    onPointerDownDrag(e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const rect = this.container.getBoundingClientRect();
      this.container.style.right = "auto";
      this.container.style.left = `${rect.left}px`;
      this.container.style.top = `${rect.top}px`;
      this.container.style.width = rect.width + "px";
      this.container.style.height = rect.height + "px";

      this.dragState = { dragging: true, startX: e.clientX, startY: e.clientY, initX: rect.left, initY: rect.top };
      this.container.style.transition = "none";
      window.addEventListener("pointermove", this.onPointerMoveDrag);
      window.addEventListener("pointerup", this.onPointerUpDrag);
    }
    onPointerMoveDrag(e) {
      if (!this.dragState.dragging) return;
      e.preventDefault();
      const dx = e.clientX - this.dragState.startX;
      const dy = e.clientY - this.dragState.startY;
      let left = this.dragState.initX + dx;
      let top = this.dragState.initY + dy;
      const rect = this.container.getBoundingClientRect();
      const maxL = window.innerWidth - rect.width - 6;
      const maxT = window.innerHeight - rect.height - 6;
      left = Math.max(6, Math.min(maxL, left));
      top = Math.max(6, Math.min(maxT, top));
      this.container.style.left = `${left}px`;
      this.container.style.top = `${top}px`;
    }
    onPointerUpDrag() {
      this.dragState.dragging = false;
      window.removeEventListener("pointermove", this.onPointerMoveDrag);
      window.removeEventListener("pointerup", this.onPointerUpDrag);
      this.container.style.transition = "";
      const rect = this.container.getBoundingClientRect();
      this.size = { w: Math.round(rect.width), h: Math.round(rect.height) };
      try { localStorage.setItem(LS_SIZE, JSON.stringify(this.size)); } catch { }
      try { localStorage.setItem(LS_POS, JSON.stringify({ left: Math.round(rect.left), top: Math.round(rect.top) })); } catch { }
      this.pos = { left: Math.round(rect.left), top: Math.round(rect.top) };
    }

    onPointerDownResize(e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      this.container.classList.add('resizing');
      const r = this.container.getBoundingClientRect();
      this.resizeState = { startX: e.clientX, startY: e.clientY, startW: r.width, startH: r.height };
      window.addEventListener('pointermove', this.onPointerMoveResize);
      window.addEventListener('pointerup', this.onPointerUpResize);
    }
    onPointerMoveResize(e) {
      if (!this.resizeState) return;
      const minW = 320, minH = 240;
      const maxW = Math.min(window.innerWidth - 16, 1200);
      const maxH = Math.min(window.innerHeight - 16, 1000);
      let newW = this.resizeState.startW + (e.clientX - this.resizeState.startX);
      let newH = this.resizeState.startH + (e.clientY - this.resizeState.startY);
      newW = Math.max(minW, Math.min(maxW, newW));
      newH = Math.max(minH, Math.min(maxH, newH));
      this.container.style.width = newW + 'px';
      this.container.style.height = newH + 'px';
    }
    onPointerUpResize() {
      if (!this.resizeState) return;
      this.container.classList.remove('resizing');
      window.removeEventListener('pointermove', this.onPointerMoveResize);
      window.removeEventListener('pointerup', this.onPointerUpResize);
      const rect = this.container.getBoundingClientRect();
      this.size = { w: Math.round(rect.width), h: Math.round(rect.height) };
      try { localStorage.setItem(LS_SIZE, JSON.stringify(this.size)); } catch { }
      this.resizeState = null;
    }

    onPointerDownWidthResize(e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      this.container.classList.add('resizing');
      const r = this.container.getBoundingClientRect();
      this.widthResizeState = { startY: e.clientY, startH: r.height };
      window.addEventListener('pointermove', this.onPointerMoveWidthResize);
      window.addEventListener('pointerup', this.onPointerUpWidthResize);
    }

    onPointerMoveWidthResize(e) {
      if (!this.widthResizeState) return;
      const minH = 240;
      const maxH = Math.min(window.innerHeight - 16, 1000);
      let newH = this.widthResizeState.startH + (e.clientY - this.widthResizeState.startY);
      newH = Math.max(minH, Math.min(maxH, newH));
      this.container.style.height = newH + 'px';
    }

    onPointerUpWidthResize() {
      if (!this.widthResizeState) return;
      this.container.classList.remove('resizing');
      window.removeEventListener('pointermove', this.onPointerMoveWidthResize);
      window.removeEventListener('pointerup', this.onPointerUpWidthResize);
      const rect = this.container.getBoundingClientRect();
      this.size = { w: Math.round(rect.width), h: Math.round(rect.height) };
      try { localStorage.setItem(LS_SIZE, JSON.stringify(this.size)); } catch { }
      this.widthResizeState = null;
      this.ensureContainerInViewport();
    }

    onPointerDownToggle(e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      e.preventDefault();
      e.stopPropagation();

      const rect = this.toggleBtn.getBoundingClientRect();
      this.toggleDrag.dragging = true;
      this.toggleBtn.__dragging = false;
      this.toggleDrag.startX = e.clientX;
      this.toggleDrag.startY = e.clientY;
      this.toggleDrag.initL = rect.left;
      this.toggleDrag.initT = rect.top;
      this.toggleDrag.moved = false;

      this.toggleBtn.classList.add("is-dragging");
      this.toggleBtn.setPointerCapture?.(e.pointerId);

      window.addEventListener("pointermove", this.onPointerMoveToggle, { passive: false });
      window.addEventListener("pointerup", this.onPointerUpToggle, { passive: false });
    }

    onPointerMoveToggle(e) {
      if (!this.toggleDrag.dragging) return;
      e.preventDefault();
      e.stopPropagation();

      const dx = e.clientX - this.toggleDrag.startX;
      const dy = e.clientY - this.toggleDrag.startY;

      if (!this.toggleDrag.moved && Math.abs(dx) + Math.abs(dy) > 3) {
        this.toggleDrag.moved = true;
        this.toggleBtn.__dragging = true;
      }

      if (!this.toggleDrag.moved) return;

      const w = this.toggleBtn.offsetWidth || 46;
      const h = this.toggleBtn.offsetHeight || 46;
      const maxL = window.innerWidth - w - 12;
      const maxT = window.innerHeight - h - 12;

      let left = this.toggleDrag.initL + dx;
      let top = this.toggleDrag.initT + dy;

      left = Math.max(12, Math.min(maxL, left));
      top = Math.max(12, Math.min(maxT, top));

      requestAnimationFrame(() => {
        if (!this.toggleBtn) return;
        this.toggleBtn.style.left = left + "px";
        this.toggleBtn.style.top = top + "px";
        this.toggleBtn.style.right = "auto";
      });
    }

    onPointerUpToggle(e) {
      if (!this.toggleDrag.dragging) return;

      e.preventDefault();
      e.stopPropagation();

      this.toggleDrag.dragging = false;
      this.toggleBtn.classList.remove("is-dragging");
      this.toggleBtn.releasePointerCapture?.(e.pointerId);

      window.removeEventListener("pointermove", this.onPointerMoveToggle);
      window.removeEventListener("pointerup", this.onPointerUpToggle);

      const rect = this.toggleBtn.getBoundingClientRect();
      const pos = { left: Math.round(rect.left), top: Math.round(rect.top) };
      this.togglePos = pos;
      try { localStorage.setItem(LS_TOGGLE_POS, JSON.stringify(pos)); } catch { }

      setTimeout(() => {
        this.toggleBtn.__dragging = false;
        this.toggleDrag.moved = false;
      }, 50);
    }
    applyTogglePos() {
      if (!this.toggleBtn) return;
      if (this.togglePos) {
        const w = this.toggleBtn.offsetWidth || 46;
        const h = this.toggleBtn.offsetHeight || 46;
        const maxL = window.innerWidth - w - 12;
        const maxT = window.innerHeight - h - 12;

        let left = this.togglePos.left;
        let top = this.togglePos.top;

        // Chuẩn hóa vị trí nếu ngoài màn hình
        const minLeft = 12;
        const minTop = 12;
        left = Math.max(minLeft, Math.min(maxL, left));
        top = Math.max(minTop, Math.min(maxT, top));

        this.toggleBtn.style.left = left + "px";
        this.toggleBtn.style.top = top + "px";
        this.toggleBtn.style.right = "auto";

        // Lưu lại vị trí đã chuẩn hóa
        if (left !== this.togglePos.left || top !== this.togglePos.top) {
          this.togglePos = { left: Math.round(left), top: Math.round(top) };
          try { localStorage.setItem(LS_TOGGLE_POS, JSON.stringify(this.togglePos)); } catch { }
        }
      } else {
        this.toggleBtn.style.top = Math.max(12, (this.pos?.top ?? 12)) + "px";
        this.toggleBtn.style.right = "12px";
        this.toggleBtn.style.left = "auto";
      }
    }
    boundToggleInside() {
      if (!this.toggleBtn || !this.toggleBtn.classList.contains("show")) return;

      // Ưu tiên sử dụng vị trí đã lưu thay vì đọc từ getBoundingClientRect()
      // vì getBoundingClientRect() có thể trả về giá trị không chính xác khi quay lại tab
      const w = this.toggleBtn.offsetWidth || 46;
      const h = this.toggleBtn.offsetHeight || 46;
      const maxL = window.innerWidth - w - 12;
      const maxT = window.innerHeight - h - 12;

      let left, top;

      // Sử dụng vị trí đã lưu nếu có và hợp lệ
      if (this.togglePos &&
        Number.isFinite(this.togglePos.left) &&
        Number.isFinite(this.togglePos.top)) {
        left = this.togglePos.left;
        top = this.togglePos.top;
      } else {
        // Fallback: đọc từ getBoundingClientRect() nhưng chỉ nếu có giá trị hợp lệ
        const rect = this.toggleBtn.getBoundingClientRect();
        if (rect.left > 0 || rect.top > 0 || (rect.left === 0 && rect.top === 0 && !this.togglePos)) {
          left = rect.left;
          top = rect.top;
        } else {
          // Mặc định về góc trên bên phải
          left = maxL;
          top = 12;
        }
      }

      // Chỉ điều chỉnh nếu vị trí thực sự ngoài viewport
      const needsAdjustment = left < 12 || left > maxL || top < 12 || top > maxT;
      if (needsAdjustment) {
        left = Math.max(12, Math.min(maxL, left));
        top = Math.max(12, Math.min(maxT, top));
      }

      this.toggleBtn.style.left = left + "px";
      this.toggleBtn.style.top = top + "px";
      this.toggleBtn.style.right = "auto";

      // Chỉ cập nhật và lưu nếu có thay đổi
      if (!this.togglePos || this.togglePos.left !== left || this.togglePos.top !== top) {
        const pos = { left: Math.round(left), top: Math.round(top) };
        this.togglePos = pos;
        try { localStorage.setItem(LS_TOGGLE_POS, JSON.stringify(pos)); } catch { }
      }
    }

    ensureToggleInViewport() {
      if (!this.toggleBtn || !this.toggleBtn.classList.contains("show")) return;

      const w = this.toggleBtn.offsetWidth || 46;
      const h = this.toggleBtn.offsetHeight || 46;
      const minLeft = 12;
      const minTop = 12;
      const maxLeft = window.innerWidth - w - 12;
      const maxTop = window.innerHeight - h - 12;

      // Ưu tiên sử dụng vị trí đã lưu thay vì đọc từ getBoundingClientRect()
      // vì getBoundingClientRect() có thể trả về giá trị không chính xác khi quay lại tab
      let left, top;

      if (this.togglePos &&
        Number.isFinite(this.togglePos.left) &&
        Number.isFinite(this.togglePos.top) &&
        this.togglePos.left >= minLeft &&
        this.togglePos.left <= maxLeft &&
        this.togglePos.top >= minTop &&
        this.togglePos.top <= maxTop &&
        this.toggleBtn.style.left &&
        this.toggleBtn.style.left !== "auto" &&
        !this.toggleBtn.style.right) {
        // Sử dụng vị trí đã lưu nếu hợp lệ
        left = this.togglePos.left;
        top = this.togglePos.top;
      } else {
        // Nếu vị trí đã lưu không hợp lệ, đọc từ getBoundingClientRect()
        // Nhưng chỉ nếu getBoundingClientRect() trả về giá trị hợp lệ
        const rect = this.toggleBtn.getBoundingClientRect();
        if (rect.left > 0 || rect.top > 0 || (rect.left === 0 && rect.top === 0 && !this.togglePos)) {
          left = rect.left;
          top = rect.top;
        } else if (this.togglePos) {
          // Nếu getBoundingClientRect() không hợp lệ nhưng có vị trí đã lưu, sử dụng vị trí đã lưu
          left = this.togglePos.left;
          top = this.togglePos.top;
        } else {
          // Mặc định về góc trên bên phải
          left = maxLeft;
          top = minTop;
        }
      }

      // Chỉ điều chỉnh nếu vị trí thực sự ngoài viewport
      let needsUpdate = false;

      if (left < minLeft) {
        left = minLeft;
        needsUpdate = true;
      } else if (left > maxLeft) {
        left = Math.max(minLeft, maxLeft);
        needsUpdate = true;
      }

      if (top < minTop) {
        top = minTop;
        needsUpdate = true;
      } else if (top > maxTop) {
        top = Math.max(minTop, maxTop);
        needsUpdate = true;
      }

      // Chỉ cập nhật nếu cần điều chỉnh hoặc chưa có style được set
      if (needsUpdate || !this.toggleBtn.style.left || this.toggleBtn.style.left === "auto") {
        this.toggleBtn.style.left = left + "px";
        this.toggleBtn.style.top = top + "px";
        this.toggleBtn.style.right = "auto";

        // Chỉ cập nhật và lưu nếu có thay đổi
        if (!this.togglePos || this.togglePos.left !== left || this.togglePos.top !== top) {
          const pos = { left: Math.round(left), top: Math.round(top) };
          this.togglePos = pos;
          try { localStorage.setItem(LS_TOGGLE_POS, JSON.stringify(pos)); } catch { }
        }
      }
    }

    exportToTxt() {
      const clean = (txt) => txt.replace(/\s+/g, " ").trim();
      let fullText = "";
      const blocks = [...this.contentArea.querySelectorAll(".qa-block")]
        .filter(b => b.style.display !== "none");

      blocks.forEach((block) => {
        const q = block.querySelector(".question-content");
        const content = block.querySelector(".content-container");
        if (!q || !content) return;

        const textQ = clean(q.textContent || "");
        let answerLines = [];

        if (content.dataset.type === "answer") {
          const correctNodes = [...content.querySelectorAll(".correct-answer")];
          const correctTexts = correctNodes
            .map(node => clean(node.textContent || ""))
            .filter(Boolean);
          if (correctTexts.length) {
            answerLines = correctTexts.map(text => `--> ${text}`);
          }
        }

        if (!answerLines.length) {
          const fallback = clean(content.textContent || "");
          if (fallback) answerLines = [`--> ${fallback}`];
        }

        if (answerLines.length) {
          fullText += `${textQ}\n${answerLines.join("\n")}\n\n`;
        }
      });

      const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dap-an-olm-${Date.now()}.txt`;
      ensureBody(link);
      link.click();
      link.remove();
    }

    async exportToPDF() {
      try {
        const visibleBlocks = [...this.contentArea.querySelectorAll(".qa-block")]
          .filter(b => b.style.display !== "none");
        if (!visibleBlocks.length) { alert("Không có nội dung để xuất."); return; }

        const root = document.createElement("div");
        root.className = "pdf-root";

        const header = document.createElement("div");
        header.style.cssText = "font-weight:700;font-size:18px;margin-bottom:6px;text-align:center";
        header.textContent = "Taiz cu to - PDF";
        root.append(header);

        visibleBlocks.forEach(b => {
          const clone = b.cloneNode(true);

          clone.querySelectorAll("mjx-assistive-mml").forEach(mml => mml.remove());
          clone.querySelectorAll("mjx-container").forEach(m => {
            m.style.pageBreakInside = "avoid";
            m.style.breakInside = "avoid";
            m.style.verticalAlign = "baseline";
            m.style.display = "inline-block";
            m.style.lineHeight = "1";
            m.style.margin = "0 2px";

            m.querySelectorAll("mjx-assistive-mml").forEach(mml => mml.remove());

            m.querySelectorAll("mjx-over").forEach(over => {
              over.style.display = "inline-block";
              over.style.width = "auto";
              over.style.maxWidth = "100%";
              over.style.overflow = "visible";

              over.querySelectorAll("svg").forEach(svg => {
                try {
                  const bbox = svg.getBBox();
                  if (bbox.width > 0) {
                    const currentWidth = svg.getAttribute("width");
                    const currentViewBox = svg.getAttribute("viewBox");
                    let viewBoxWidth = Infinity;
                    if (currentViewBox) {
                      const parts = currentViewBox.trim().split(/\s+/);
                      if (parts.length >= 3) {
                        viewBoxWidth = parseFloat(parts[2]);
                      }
                    }
                    if (!currentViewBox || isNaN(viewBoxWidth) || viewBoxWidth > bbox.width * 2) {
                      const padding = 2;
                      svg.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
                    }
                    const numWidth = currentWidth ? parseFloat(currentWidth) : NaN;
                    if (!currentWidth || isNaN(numWidth) || numWidth > bbox.width * 2) {
                      svg.setAttribute("width", (bbox.width + 4).toString());
                    }
                  }
                } catch (e) { }
                svg.style.width = "auto";
                svg.style.maxWidth = "100%";
                svg.style.overflow = "visible";

                svg.querySelectorAll("line").forEach(line => {
                  const x1 = parseFloat(line.getAttribute("x1") || "0");
                  const x2 = parseFloat(line.getAttribute("x2") || "0");
                  const width = Math.abs(x2 - x1);
                  if (width > 200) {
                    const newX2 = x1 + Math.min(width, 100);
                    line.setAttribute("x2", newX2.toString());
                  }
                });
                svg.querySelectorAll("rect").forEach(rect => {
                  const width = parseFloat(rect.getAttribute("width") || "0");
                  if (width > 200) {
                    rect.setAttribute("width", "100");
                  }
                });
              });
            });

            m.querySelectorAll("svg").forEach(svg => {
              svg.style.verticalAlign = "baseline";
              svg.style.display = "inline-block";
            });
          });
          clone.querySelectorAll("img").forEach(img => {
            try { img.src = new URL(img.getAttribute("src"), location.href).href; } catch { }
            img.style.maxWidth = "100%";
            img.style.height = "auto";
            img.style.verticalAlign = "middle";
          });
          root.appendChild(clone);
        });

        const spacer = document.createElement("div");
        spacer.className = "pdf-spacer";
        root.appendChild(spacer);

        await this.typesetForExport(root);

        root.querySelectorAll("mjx-assistive-mml").forEach(mml => mml.remove());
        root.querySelectorAll("mjx-container").forEach(m => {
          m.querySelectorAll("mjx-assistive-mml").forEach(mml => mml.remove());

          m.style.verticalAlign = "baseline";
          m.style.display = "inline-block";
          m.style.lineHeight = "1";
          m.style.margin = "0 2px";

          m.querySelectorAll("mjx-over").forEach(over => {
            over.style.display = "inline-block";
            over.style.width = "auto";
            over.style.maxWidth = "100%";
            over.style.overflow = "visible";

            over.querySelectorAll("svg").forEach(svg => {
              try {
                const bbox = svg.getBBox();
                if (bbox.width > 0) {

                  const currentWidth = svg.getAttribute("width");
                  const currentViewBox = svg.getAttribute("viewBox");
                  let viewBoxWidth = Infinity;
                  if (currentViewBox) {
                    const parts = currentViewBox.trim().split(/\s+/);
                    if (parts.length >= 3) {
                      viewBoxWidth = parseFloat(parts[2]);
                    }
                  }
                  if (!currentViewBox || isNaN(viewBoxWidth) || viewBoxWidth > bbox.width * 2) {

                    const padding = 2;
                    svg.setAttribute("viewBox", `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`);
                  }
                  const numWidth = currentWidth ? parseFloat(currentWidth) : NaN;
                  if (!currentWidth || isNaN(numWidth) || numWidth > bbox.width * 2) {
                    svg.setAttribute("width", (bbox.width + 4).toString());
                  }
                  svg.style.width = "auto";
                  svg.style.maxWidth = "100%";
                  svg.style.overflow = "visible";
                }
              } catch (e) {

                svg.style.width = "auto";
                svg.style.maxWidth = "100%";
                svg.style.overflow = "visible";
              }

              svg.querySelectorAll("line").forEach(line => {
                const x1 = parseFloat(line.getAttribute("x1") || "0");
                const x2 = parseFloat(line.getAttribute("x2") || "0");
                const width = Math.abs(x2 - x1);
                if (width > 200) {

                  const newX2 = x1 + Math.min(width, 100);
                  line.setAttribute("x2", newX2.toString());
                }
              });
              svg.querySelectorAll("rect").forEach(rect => {
                const width = parseFloat(rect.getAttribute("width") || "0");
                if (width > 200) {
                  rect.setAttribute("width", "100");
                }
              });
            });
          });

          m.querySelectorAll("svg").forEach(svg => {
            svg.style.verticalAlign = "baseline";
            svg.style.display = "inline-block";
          });
        });
        await this.waitImages(root);
        await ensureHtml2Pdf();

        const opt = {
          margin: [10, 10, 12, 10],
          filename: `olm-${Date.now()}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            windowWidth: Math.max(document.documentElement.clientWidth, root.scrollWidth),
            windowHeight: root.scrollHeight + 200,
            scrollY: 0
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        const stash = document.createElement("div");
        stash.style.cssText = "position:fixed;left:-99999px;top:-99999px;width:900px;opacity:0;pointer-events:none";
        stash.appendChild(root);
        ensureBody(stash);

        await new Promise(r => setTimeout(r, 60));

        await UW.html2pdf().set(opt).from(root).save();

        stash.remove();
      } catch (err) {
        console.error("Xuất PDF lỗi:", err);
        try {
          const w = window.open("", "_blank");
          if (!w) throw new Error("Popup bị chặn");
          w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title> Hư LéĐònm - PDF</title>
            <style>
              body{ font-family: Arial, Helvetica, sans-serif; padding: 16px; }
              .qa-block{ page-break-inside: avoid; break-inside: avoid; border:1px solid #ddd; border-radius:10px; padding:12px; margin-bottom:10px; }
              mjx-container{ page-break-inside: avoid; break-inside: avoid; }
              img{ max-width:100%; height:auto; }
              .pdf-spacer{ height: 24px; }
              h1{ font-size:18px; text-align:center; margin:0 0 6px; }
            </style>
          </head><body>
            <h1>Đòn Hư Lém - PDF</h1>
          </body></html>`);
          const body = w.document.body;
          const blocks = [...this.contentArea.querySelectorAll(".qa-block")].filter(b => b.style.display !== "none");
          blocks.forEach(b => body.appendChild(b.cloneNode(true)));
          body.appendChild(Object.assign(document.createElement("div"), { className: "pdf-spacer" }));
          const cfg = w.document.createElement("script");
          cfg.type = "text/javascript";
          cfg.text = `window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$','$$'], ['\\\\[','\\\\]']] }, startup: { typeset: true } };`;
          const mj = w.document.createElement("script");
          mj.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
          body.appendChild(cfg); body.appendChild(mj);
          mj.onload = () => setTimeout(() => { w.print(); }, 600);
        } catch {
          alert("Xuất PDF thất bại. Thử lại lần nữa giúp mình nhé!");
        }
      }
    }

    async exportWordV2(event) {
      const button = event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
      const originalText = button?.textContent ?? "WORD V2";
      if (button) {
        button.disabled = true;
        button.textContent = "Đang tạo...";
      }
      try {
        const visibleBlocks = [...this.contentArea.querySelectorAll(".qa-block")]
          .filter(b => b.style.display !== "none");
        if (!visibleBlocks.length) { alert("Không có nội dung để xuất."); return; }

        const wrapper = document.createElement("div");
        wrapper.className = "word-v2-wrapper";

        const header = document.createElement("div");
        header.className = "word-v2-header";
        header.innerHTML = `
          <h1>OLM Helper - WORD V2</h1>
        `;
        wrapper.appendChild(header);

        visibleBlocks.forEach((block, idx) => {
          const clone = block.cloneNode(true);
          const qIndex = clone.querySelector(".q-index");
          if (qIndex) qIndex.textContent = `Câu ${idx + 1}. `;
          wrapper.appendChild(clone);
        });

        await this.prepareWordCloneForDoc(wrapper);

        const styles = `
          body{ font-family:'Times New Roman',serif; color:#111827; padding:32px; line-height:1.5; font-size:14px; }
          .word-v2-header{text-align:center;margin-bottom:18px;}
          .word-v2-header h1{margin:0;font-size:20px;text-transform:uppercase;letter-spacing:0.05em;}
          .qa-block{border:1px solid #d1d5db;border-radius:10px;padding:14px 16px;margin-bottom:14px;background:#fff;}
          .question-content{font-weight:600;margin-bottom:10px;font-size:15px;}
          .question-content .q-index{color:#0f172a;margin-right:4px;}
          .content-container{font-weight:400;font-size:14px;}
          .content-container ul,.content-container ol{margin:6px 0 6px 22px;}
          .correct-answer{font-weight:600;color:#0f766e;}
          img{max-width:100%;height:auto;}
          table{border-collapse:collapse;width:100%;margin:10px 0;}
          table td, table th{border:1px solid #94a3b8;padding:6px;}
        `;

        const html = `<!DOCTYPE html>
          <html lang="vi">
            <head>
              <meta charset="utf-8" />
              <title>OLM Helper - WORD V2</title>
              <style>${styles}</style>
            </head>
            <body>${wrapper.innerHTML}</body>
          </html>`;

        const blob = new Blob(["\ufeff" + html], { type: "application/msword;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `olm-word-v2-${Date.now()}.doc`;
        ensureBody(link);
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        link.remove();
      } catch (err) {
        console.error("WORD V2 export error:", err);
        alert("Tạo WORD V2 thất bại. Thử lại giúp mình nhé!");
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = originalText;
        }
      }
    }

    async prepareWordCloneForDoc(root) {
      root.querySelectorAll("script, style").forEach((el) => el.remove());
      root.querySelectorAll("[contenteditable]").forEach((el) => el.removeAttribute("contenteditable"));
      root.querySelectorAll("button, input, textarea, select").forEach((el) => el.remove());
      root.querySelectorAll("." + HIGHLIGHT_CLASS).forEach((mark) => {
        const parent = mark.parentNode;
        if (!parent) return;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        mark.remove();
        parent.normalize?.();
      });
      root.querySelectorAll("a").forEach((a) => {
        const span = document.createElement("span");
        span.innerHTML = a.innerHTML || a.textContent || "";
        a.replaceWith(span);
      });
      await this.convertMathNodesToImages(root);
      root.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (!src) return img.remove();
        if (!src.startsWith("data:")) {
          try { img.src = new URL(src, location.href).href; } catch { }
        }
        img.removeAttribute("loading");
        img.removeAttribute("decoding");
        if (!img.style.maxWidth) img.style.maxWidth = "100%";
        img.style.height = "auto";
      });
    }

    async convertMathNodesToImages(root) {
      const mathNodes = root.querySelectorAll("mjx-container");
      if (!mathNodes.length) return;
      const MJ = UW.MathJax;
      const adaptor = MJ?.startup?.adaptor;
      if (!MJ || !MJ.mathml2svg || !adaptor) {
        mathNodes.forEach((node) => this.replaceMathWithFallback(node));
        return;
      }
      await Promise.all([...mathNodes].map(async (node) => {
        const mathEl = node.querySelector("mjx-assistive-mml math");
        if (!mathEl) { this.replaceMathWithFallback(node); return; }
        let svgElement;
        try {
          const serialized = new XMLSerializer().serializeToString(mathEl);
          const isDisplay = node.getAttribute("display") === "true";
          svgElement = MJ.mathml2svg(serialized, { display: isDisplay });
        } catch (error) {
          console.error("mathml2svg failed:", error);
          this.replaceMathWithFallback(node);
          return;
        }
        const svgMarkup = adaptor.outerHTML(svgElement);
        const dataUri = encodeSvgToDataUri(svgMarkup);
        if (!dataUri) { this.replaceMathWithFallback(node); return; }
        const img = document.createElement("img");
        img.src = dataUri;
        img.alt = (node.textContent || "").replace(/\s+/g, " ").trim() || "math";
        img.style.verticalAlign = "middle";
        img.style.maxWidth = "100%";
        node.replaceWith(img);
      }));
    }

    replaceMathWithFallback(node) {
      const span = document.createElement("span");
      span.textContent = (node.textContent || "").trim() || "[math]";
      node.replaceWith(span);
    }

    async downloadWordFile(event) {
      const button = event?.currentTarget ?? event?.target;
      const btnEl = button instanceof HTMLElement ? button : null;
      const originalText = btnEl?.textContent ?? "WORD";
      if (btnEl) {
        btnEl.textContent = "Đang xử lý...";
        btnEl.disabled = true;
      }
      try {
        const match = window.location.pathname.match(/(\d+)$/);
        if (!match || !match[0]) {
          alert("Lỗi: Không tìm thấy ID chủ đề");
          throw new Error("Không tìm thấy ID chủ đề.");
        }
        const id_cate = match[0];
        if (btnEl) btnEl.textContent = "Đang lấy link...";
        const apiUrl = `https://olm.vn/download-word-for-user?id_cate=${id_cate}&showAns=1&questionNotApproved=0`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Lỗi server OLM: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data || !data.file) {
          throw new Error("Response JSON không hợp lệ hoặc không có link file.");
        }
        const fileUrl = data.file;
        if (btnEl) btnEl.textContent = "Đang tải về...";
        const link = document.createElement("a");
        link.href = fileUrl;
        link.target = "_blank";
        let filename = fileUrl.split("/").pop();
        if (!filename || !filename.includes(".")) {
          filename = `olm-answers-${id_cate}.docx`;
        }
        link.download = filename;
        ensureBody(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Lỗi khi tải file Word:", error);
        alert(`Đã xảy ra lỗi: ${error.message}`);
      } finally {
        if (btnEl) {
          btnEl.textContent = originalText;
          btnEl.disabled = false;
        }
      }
    }

    async typesetForExport(root) {
      if (UW.MathJax?.typesetPromise) {
        const box = document.createElement("div");
        box.style.cssText = "position:fixed;left:-99999px;top:-99999px;width:900px;opacity:0;pointer-events:none";
        box.appendChild(root);
        ensureBody(box);
        try { await UW.MathJax.typesetPromise([box]); } catch { }
        document.body.appendChild(root);
        box.remove();
        await new Promise(r => setTimeout(r, 30));
      }
    }

    waitImages(root) {
      const imgs = [...root.querySelectorAll("img")];
      if (!imgs.length) return Promise.resolve();
      return Promise.allSettled(imgs.map(img => new Promise(res => {
        if (img.complete && img.naturalWidth) return res();
        img.addEventListener("load", () => res(), { once: true });
        img.addEventListener("error", () => res(), { once: true });
      })));
    }

    copyAllVisibleAnswers() {
      const blocks = [...this.contentArea.querySelectorAll(".qa-block")].filter(b => b.style.display !== "none");
      if (!blocks.length) return;
      let out = "";
      blocks.forEach((b) => {
        const q = b.querySelector(".question-content")?.innerText ?? "";
        const a = b.querySelector(".content-container")?.innerText ?? "";
        out += `${q}\n--> ${a}\n\n`;
      });
      const doCopy = (txt) => navigator.clipboard?.writeText(txt).catch(() => {
        const ta = document.createElement("textarea"); ta.value = txt; ensureBody(ta); ta.select(); document.execCommand("copy"); ta.remove();
      });
      doCopy(out);
    }

    onKeyDown(event) {
      if (event.altKey && !event.shiftKey && !event.ctrlKey) {
        const k = event.key.toLowerCase();
        if (k === "a") { event.preventDefault(); this.copyAllVisibleAnswers(); }
      }
    }

    toggleVisibility() {
      this.isVisible = !this.isVisible;
      this.container.classList.toggle("hidden", !this.isVisible);
      if (this.isVisible) this.hideToggleBtn(); else this.showToggleBtn();
      try { localStorage.setItem(LS_VISIBLE, this.isVisible ? "1" : "0"); } catch { }
    }

    toggleDarkMode() {
      this.dark = !this.dark;
      this.container.classList.toggle("olm-dark", this.dark);
      try { localStorage.setItem(LS_DARK, this.dark ? "1" : "0"); } catch { }
    }

    toggleStealthMode() {
      this.applyStealthMode(!this.stealthMode);
    }

    toggleAutoSearch() {
      this.applyAutoSearchState(!this.autoSearchEnabled);
    }

    applyAutoSearchState(force, saveToStorage = true) {
      this.autoSearchEnabled = !!force;
      if (this.autoSearchBtn) {
        this.autoSearchBtn.classList.toggle("is-active", this.autoSearchEnabled);
        this.autoSearchBtn.textContent = this.autoSearchEnabled ? "Auto Search ON" : "Auto Search";
        this.autoSearchBtn.setAttribute("aria-pressed", this.autoSearchEnabled ? "true" : "false");
      }
      if (!this.autoSearchEnabled) this.lastSelectionText = "";
      if (saveToStorage) {
        try { localStorage.setItem(LS_AUTO_SEARCH, this.autoSearchEnabled ? "1" : "0"); } catch { }
      }
    }

    toggleAutoSolve() {
      this.applyAutoSolveState(!this.autoSolveEnabled);
    }

    applyAutoSolveState(force, saveToStorage = true) {
      this.autoSolveEnabled = !!force;
      if (this.autoSolveBtn) {
        this.autoSolveBtn.classList.toggle("is-active", this.autoSolveEnabled);
        this.autoSolveBtn.textContent = this.autoSolveEnabled ? "Hiển thị đáp án ON" : "Hiển thị đáp án";
        this.autoSolveBtn.setAttribute("aria-pressed", this.autoSolveEnabled ? "true" : "false");
      }
      if (saveToStorage) {
        try { localStorage.setItem(LS_AUTO_SOLVE, this.autoSolveEnabled ? "1" : "0"); } catch { }
      }
      if (this.autoSolveEnabled) {
        this.startAutoSolveLoop();
        this.scanAndHighlightCurrentQuestion();
      } else {
        this.stopAutoSolveLoop();
        this.clearPageHighlights();
      }
    }

    startAutoSolveLoop() {
      if (this.autoSolveInterval) return;
      this.autoSolveInterval = window.setInterval(() => this.scanAndHighlightCurrentQuestion(), AUTO_SOLVE_INTERVAL);
      if (this.autoSolveScrollHandler) window.addEventListener("scroll", this.autoSolveScrollHandler, true);
    }

    stopAutoSolveLoop() {
      if (this.autoSolveInterval) {
        clearInterval(this.autoSolveInterval);
        this.autoSolveInterval = null;
      }
      if (this.autoSolveScrollHandler) window.removeEventListener("scroll", this.autoSolveScrollHandler, true);
    }

    applyStealthMode(force, saveToStorage = true) {
      this.stealthMode = !!force;

      setStealthActive(this.stealthMode);
      if (this.stealthBtn) {
        this.stealthBtn.classList.toggle("is-active", this.stealthMode);
        this.stealthBtn.textContent = this.stealthMode ? "Stealth ON" : "Stealth";
        this.stealthBtn.setAttribute("aria-pressed", this.stealthMode ? "true" : "false");
      }
      if (saveToStorage) {
        try { localStorage.setItem(LS_STEALTH, this.stealthMode ? "1" : "0"); } catch { }
      }
    }

    applyPosOnly() {
      const c = this.container;
      c.style.left = "";
      c.style.right = "";
      c.style.top = "";

      if (this.pos) {
        // Sử dụng kích thước đã lưu để tính toán (chính xác hơn khi container chưa render)
        const w = this.size.w || 520;
        const h = this.size.h || 400;

        // Tính toán giới hạn màn hình
        const maxLeft = Math.max(6, window.innerWidth - w - 6);
        const maxTop = Math.max(6, window.innerHeight - h - 6);
        const minLeft = 6;
        const minTop = 6;

        // Chuẩn hóa vị trí nếu ngoài màn hình
        let left = this.pos.left;
        let top = this.pos.top;

        left = Math.max(minLeft, Math.min(maxLeft, left));
        top = Math.max(minTop, Math.min(maxTop, top));

        // Áp dụng vị trí đã chuẩn hóa
        c.style.left = left + "px";
        c.style.top = top + "px";
        c.style.right = "auto";

        // Lưu lại vị trí đã chuẩn hóa nếu có thay đổi
        if (left !== this.pos.left || top !== this.pos.top) {
          this.pos = { left: Math.round(left), top: Math.round(top) };
          try { localStorage.setItem(LS_POS, JSON.stringify(this.pos)); } catch { }
        }
      } else {
        c.style.right = "12px";
        c.style.left = "auto";
        c.style.top = "12px";
      }
    }

    ensureContainerInViewport() {
      if (!this.container) return;
      const style = this.container.style;
      let rect = this.container.getBoundingClientRect();

      const maxWidth = Math.max(240, window.innerWidth - 16);
      const maxHeight = Math.max(240, window.innerHeight - 16);
      let adjustedSize = false;

      if (rect.width > maxWidth) {
        style.width = `${maxWidth}px`;
        adjustedSize = true;
      }
      if (rect.height > maxHeight) {
        style.height = `${maxHeight}px`;
        adjustedSize = true;
      }
      if (adjustedSize) rect = this.container.getBoundingClientRect();

      // Ưu tiên sử dụng vị trí đã lưu nếu có và hợp lệ
      // vì getBoundingClientRect() có thể trả về giá trị không chính xác khi container chưa render xong
      let left, top;
      const maxLeft = Math.max(6, window.innerWidth - rect.width - 6);
      const maxTop = Math.max(6, window.innerHeight - rect.height - 6);

      // Kiểm tra xem vị trí đã lưu có hợp lệ không
      if (this.pos &&
        Number.isFinite(this.pos.left) &&
        Number.isFinite(this.pos.top) &&
        this.pos.left >= 6 &&
        this.pos.left <= maxLeft &&
        this.pos.top >= 6 &&
        this.pos.top <= maxTop &&
        style.left &&
        style.left !== "auto" &&
        !style.right) {
        // Sử dụng vị trí đã lưu nếu hợp lệ
        left = this.pos.left;
        top = this.pos.top;
      } else {
        // Nếu vị trí đã lưu không hợp lệ hoặc chưa có, đọc từ getBoundingClientRect()
        // Nhưng chỉ nếu getBoundingClientRect() trả về giá trị hợp lệ (không phải 0,0)
        if (rect.left > 0 || rect.top > 0 || (rect.left === 0 && rect.top === 0 && !this.pos)) {
          left = rect.left;
          top = rect.top;
        } else if (this.pos) {
          // Nếu getBoundingClientRect() không hợp lệ nhưng có vị trí đã lưu, sử dụng vị trí đã lưu
          left = this.pos.left;
          top = this.pos.top;
        } else {
          // Mặc định về góc trên bên phải
          left = maxLeft;
          top = 6;
        }
      }

      // Chỉ điều chỉnh nếu vị trí thực sự ngoài màn hình
      const needsAdjustment = left < 6 || left > maxLeft || top < 6 || top > maxTop;

      if (needsAdjustment) {
        left = Math.min(Math.max(left, 6), maxLeft);
        top = Math.min(Math.max(top, 6), maxTop);
      }

      style.left = `${left}px`;
      style.right = "auto";
      style.top = `${top}px`;

      // Chỉ cập nhật và lưu vị trí nếu có thay đổi
      if (!this.pos || this.pos.left !== left || this.pos.top !== top) {
        this.pos = { left: Math.round(left), top: Math.round(top) };
        try { localStorage.setItem(LS_POS, JSON.stringify(this.pos)); } catch { }
      }

      if (adjustedSize) {
        this.size = { w: Math.round(this.container.offsetWidth), h: Math.round(this.container.offsetHeight) };
        try { localStorage.setItem(LS_SIZE, JSON.stringify(this.size)); } catch { }
      }
    }

    showToggleBtn() {
      this.toggleBtn?.classList.add("show");
      this.applyTogglePos();
      this.ensureToggleInViewport();
    }
    hideToggleBtn() { this.toggleBtn?.classList.remove("show"); }

    async handleCheckKey() {
      this.isKeyValid = true;
      this.updateKeyLockedState();
      this.updateKeyStatus("success", "Đã bỏ cơ chế kiểm tra key.");
    }

    async checkKey(key) {
      this.isKeyValid = true;
      this.currentKey = key || this.currentKey || "free-mode";
      this.keyExpiresAt = null;
      this.updateKeyLockedState();
      this.updateKeyStatus("success", "Đã bỏ cơ chế kiểm tra key.");
      this.updateKeyInfoDisplay();
    }

    updateKeyStatus(type, message) {
      if (!this.keyStatusEl) return;
      this.keyStatusEl.className = "key-status";
      if (type) this.keyStatusEl.classList.add(type);
      this.keyStatusEl.textContent = message || "";
    }

    updateKeyLockedState() {
      if (!this.container) return;
      this.isKeyValid = true;
      this.container.classList.remove("key-locked");
      if (this.keyInput) this.keyInput.disabled = false;
      if (this.keyAuthWrap) this.keyAuthWrap.classList.add("hidden");
      if (this.keyInfoBtn) this.keyInfoBtn.style.display = "none";
      if (this.keyExpiresEl) this.keyExpiresEl.textContent = "";
    }

    updateKeyExpiresDisplay() {
      if (!this.keyExpiresEl) return;
      this.keyExpiresEl.textContent = "";
    }

    updateKeyInfoDisplay() {
      if (!this.keyInfoDisplay) return;
      this.keyInfoDisplay.innerHTML = `<span class="key-status-text">OLMHHack by Taiz</span>`;
      this.keyInfoDisplay.className = "key-info-display";
    }

    toggleKeyInfo() {
      if (this.keyAuthWrap) this.keyAuthWrap.classList.add("hidden");
    }

    startExpiresTimer() {
      if (this.expiresTimer) clearInterval(this.expiresTimer);
    }

    clearAnswers() {
      if (this.contentArea) {
        this.contentArea.innerHTML = "";
      }
      this.questionBank = [];
      this.questionSignatureSet.clear();
      this.renderedPassages.clear();
      this.nextQuestionNumber = 1;
      this.updateCounts();
    }

    async refreshAnswers() {
      if (!this.lastAnswersUrl) return;
      try {
        const response = await fetch(this.lastAnswersUrl, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit'
        });
        if (response && response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            this.clearAnswers();
            this.renderDataInternal(data);
          }
        }
      } catch (error) {
        console.error("Refresh answers error:", error);
      }
    }

    renderContentWithMath(element) {
      const tryRender = () => {
        try {
          if (UW.MathJax?.typesetPromise) UW.MathJax.typesetPromise([element]).catch(() => { });
          else if (UW.MathJax?.Hub) UW.MathJax.Hub.Queue(["Typeset", UW.MathJax.Hub, element]);
        } catch (e) { console.error("Math render error:", e); }
      };
      setTimeout(tryRender, 50);
      setTimeout(tryRender, 250);
      setTimeout(tryRender, 600);
    }

    parseAnswersFromHtml(html) {
      try {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        tempDiv.querySelectorAll(
          ".loigiai, .huong-dan-giai, .explain, .solution, #solution, .guide, .exp, .exp-in"
        ).forEach(el => el.remove());
        removeNoiseMetaLines(tempDiv);

        const buildListFromItems = (items) => {
          if (!items.length) return null;
          const listElement = document.createElement("ul");
          items.forEach(it => {
            const li = document.createElement("li");
            const isCorrect = (
              (it.className && /correct|true|right/i.test(it.className)) ||
              !!it.querySelector(".correctAnswer, .is-correct, .answer-true")
            );
            if (isCorrect) li.classList.add("correct-answer");
            const tmp = document.createElement("div");
            tmp.innerHTML = it.innerHTML;
            stripLeadingHashesFromElement(tmp);
            while (tmp.firstChild) li.appendChild(tmp.firstChild);
            listElement.appendChild(li);
          });
          return listElement.children.length ? listElement : null;
        };

        const collectLists = (elements) => {
          const collected = [];
          elements.forEach((list) => {
            const scopeItems = Array.from(list.querySelectorAll(":scope > li"));
            const built = buildListFromItems(scopeItems);
            if (built) collected.push(built);
          });
          return collected;
        };

        const quizLists = Array.from(tempDiv.querySelectorAll("ol.quiz-list, ul.quiz-list, .quiz-list, ol.true-false, ul.true-false, .true-false"))
          .filter((el, idx, arr) => arr.indexOf(el) === idx);
        const processed = collectLists(quizLists);
        if (processed.length) {
          return { primary: processed[0], extras: processed.slice(1) };
        }

        const correctNodes = tempDiv.querySelectorAll(".correctAnswer, li.correctAnswer");
        if (correctNodes.length > 0) {
          const parentList = correctNodes[0].closest("ol, ul");
          if (parentList) {
            const built = collectLists([parentList]);
            if (built.length) return { primary: built[0], extras: built.slice(1) };
          } else {
            const listElement = document.createElement("ul");
            correctNodes.forEach(ans => {
              const li = document.createElement("li");
              li.className = "correct-answer";
              const tmp = document.createElement("div");
              tmp.innerHTML = ans.innerHTML;
              stripLeadingHashesFromElement(tmp);
              while (tmp.firstChild) li.appendChild(tmp.firstChild);
              listElement.appendChild(li);
            });
            if (listElement.children.length) return { primary: listElement, extras: [] };
          }
        }

        const fillInInput = tempDiv.querySelector("input[data-accept]");
        if (fillInInput) {
          const listElement = document.createElement("ul");
          fillInInput.getAttribute("data-accept").split("|").forEach((a) => {
            const li = document.createElement("li");
            li.className = "correct-answer";
            li.textContent = a.trim().replace(/^\s*#\s*/g, '');
            listElement.appendChild(li);
          });
          return { primary: listElement, extras: [] };
        }

        const fallbackLists = Array.from(tempDiv.querySelectorAll("ol, ul"));
        for (const list of fallbackLists) {
          const built = collectLists([list]);
          if (built.length) return { primary: built[0], extras: built.slice(1) };
        }

        return { primary: null, extras: [] };
      } catch (e) {
        console.error("parseAnswersFromHtml error:", e);
        return { primary: null, extras: [] };
      }
    }

    getSolutionAsDOM(decodedContent) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = decodedContent;
      const solutionNode = tempDiv.querySelector(".loigiai, .huong-dan-giai, .explain, .solution, #solution, .guide, .exp, .exp-in");
      if (!solutionNode) return null;

      const clone = solutionNode.cloneNode(true);
      stripLeadingHashesFromElement(clone);
      return clone;
    }

    buildQuestionMeta(questionEl, answersElement, overrideQuestionText = "") {
      if (!answersElement) return null;
      const rawQuestionText = overrideQuestionText && typeof overrideQuestionText === "string"
        ? overrideQuestionText
        : getMathAwareText(questionEl);
      const questionText = normalizeQuestionText(rawQuestionText);
      let answerNodes = Array.from(answersElement.children || []);
      if (!answerNodes.length) {
        answerNodes = Array.from(answersElement.querySelectorAll(":scope > li, :scope > div, :scope > p"));
      }
      const answersNormalized = [];
      const correctSet = new Set();
      const imageAnswers = new Map();
      answerNodes.forEach((node) => {
        if (!(node instanceof Element)) return;

        const images = node.querySelectorAll("img");
        let text = normalizeAnswerText(getMathAwareText(node));
        let imageSrc = null;
        if (images.length > 0) {

          imageSrc = images[0].getAttribute("src") || images[0].getAttribute("data-src") || "";
          if (imageSrc) {

            try {
              const url = new URL(imageSrc, location.href);
              imageSrc = url.href;
            } catch {
              imageSrc = imageSrc.trim();
            }

            if (!text) text = `__img__${imageSrc}`;
            imageAnswers.set(text, imageSrc);
          }
        }
        if (!text) return;
        answersNormalized.push(text);
        if (node.classList.contains("correct-answer") || /correct-answer/i.test(node.className || "")) {
          correctSet.add(text);
        }
      });
      if (!answersNormalized.length || !correctSet.size) return null;
      const signature = `${questionText}::${answersNormalized.join("|")}`;
      return { signature, questionText, answersNormalized, correctSet, imageAnswers };
    }

    registerQuestionMeta(meta) {
      if (!meta || !meta.signature) return;
      if (this.questionSignatureSet.has(meta.signature)) return;
      this.questionSignatureSet.add(meta.signature);
      this.questionBank.push(meta);
    }

    renderData(data) {
      if (!Array.isArray(data)) return;
      if (this.pendingData.length > 0) {
        const pending = [...this.pendingData];
        this.pendingData = [];
        this.renderDataInternal(pending);
      }

      this.renderDataInternal(data);
    }

    renderDataInternal(data) {
      if (!Array.isArray(data) || data.length === 0) return;

      const responseContainer = document.createElement("div");

      data.forEach((question) => {

        let decodedContent = decodeQuestionPayload(question);
        decodedContent = mildLatexFix(decodedContent);

        const parts = decodedContent.split(/<hr\b[^>]*>/gi).map(s => s.trim()).filter(s => s);
        let passage = null;
        let qChunks = parts;
        if (parts.length > 1) {
          passage = parts[0];
          qChunks = parts.slice(1);
        }

        if (qChunks.length === 0) qChunks = [decodedContent];

        if (passage) {
          const pd = document.createElement("div");
          pd.innerHTML = passage;
          pd.querySelectorAll("ol.quiz-list, ul.quiz-list, .interaction, .form-group, .loigiai, .huong-dan-giai, .explain, .solution, #solution, .guide, .exp, .exp-in, hr").forEach(el => el.remove());
          stripLeadingHashesFromElement(pd);
          removeNoiseMetaLines(pd);
          const pkey = pd.textContent.trim().replace(/\s+/g, " ");
          if (pkey && !this.renderedPassages.has(pkey)) {
            const pblock = document.createElement("div");
            pblock.className = "passage-block";
            while (pd.firstChild) pblock.appendChild(pd.firstChild);
            responseContainer.appendChild(pblock);
            this.renderedPassages.add(pkey);
          }
        }
        qChunks.forEach((chunk) => {
          const fullHtml = chunk;

          const parsedAnswers = this.parseAnswersFromHtml(fullHtml) || { primary: null, extras: [] };
          const answersElement = parsedAnswers.primary;
          const extraAnswerSets = Array.isArray(parsedAnswers.extras) ? parsedAnswers.extras : [];

          const solutionElement = this.getSolutionAsDOM(fullHtml);

          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = fullHtml;

          tempDiv.querySelectorAll("ol.quiz-list, ul.quiz-list, .interaction, .form-group, .loigiai, .huong-dan-giai, .explain, .solution, #solution, .guide, .exp, .exp-in, hr").forEach(el => el.remove());

          tempDiv.querySelectorAll(".trigger-curriculum-cate, .trigger-curriculum").forEach(el => el.remove());
          tempDiv.querySelectorAll("input[data-accept], input[data-placeholder-answer]").forEach((inputEl) => {
            const parent = inputEl.parentElement;
            if (parent && parent.childNodes.length === 1) parent.remove();
            else inputEl.remove();
          });

          stripLeadingHashesFromElement(tempDiv);
          removeNoiseMetaLines(tempDiv);

          const questionDiv = document.createElement("div");
          questionDiv.className = "qa-block";
          const questionNumber = this.nextQuestionNumber++;
          questionDiv.dataset.qIndex = String(questionNumber);
          const qaTop = document.createElement("div"); qaTop.className = "qa-top";
          const questionDisplayContainer = document.createElement("div"); questionDisplayContainer.className = "question-content";

          const indexSpan = document.createElement("span");
          indexSpan.className = "q-index";
          indexSpan.textContent = `Câu ${questionNumber}. `;
          questionDisplayContainer.appendChild(indexSpan);

          while (tempDiv.firstChild) questionDisplayContainer.appendChild(tempDiv.firstChild);

          if (questionDisplayContainer.childNodes.length === 1 && question.title) {
            const fallbackSpan = document.createElement("span");
            fallbackSpan.innerHTML = question.title;
            questionDisplayContainer.appendChild(fallbackSpan);
          }

          qaTop.append(questionDisplayContainer);

          const contentContainer = document.createElement("div"); contentContainer.className = "content-container";
          const rawQuestionText = getMathAwareText(questionDisplayContainer) || question.title || "";
          if (answersElement) {
            const meta = this.buildQuestionMeta(questionDisplayContainer, answersElement, rawQuestionText);
            if (meta) this.registerQuestionMeta(meta);
            contentContainer.dataset.type = "answer";
            contentContainer.appendChild(answersElement);
          } else if (solutionElement) {
            contentContainer.dataset.type = "solution";
            contentContainer.appendChild(solutionElement);
          } else {
            contentContainer.dataset.type = "not-found";
            const nf = document.createElement("div"); nf.style.cssText = "color:#6b7280;font-style:italic";
            nf.textContent = "Không tìm thấy đáp án hay lời giải.";
            contentContainer.appendChild(nf);
          }

          questionDiv.append(qaTop, contentContainer);
          responseContainer.appendChild(questionDiv);

          if (extraAnswerSets.length) {
            extraAnswerSets.forEach((extraList, extraIdx) => {
              const extraLabel = rawQuestionText ? `${rawQuestionText} [phần ${extraIdx + 2}]` : `Phần ${extraIdx + 2}`;
              const extraMeta = this.buildQuestionMeta(null, extraList, extraLabel);
              if (extraMeta) this.registerQuestionMeta(extraMeta);
            });
          }
        });
      });

      this.contentArea.prepend(responseContainer);
      this.renumber();
      this.updateCounts();
      this.renderContentWithMath(this.contentArea);
      const kw = this.searchInput?.value?.trim(); if (kw) highlightInElement(this.contentArea, kw);
      this.syncPassageBlocksVisibility();
      if (this.autoSolveEnabled) this.scanAndHighlightCurrentQuestion();
    }

    syncPassageBlocksVisibility() {
      const passages = this.contentArea.querySelectorAll(".passage-block");
      passages.forEach((passage) => {
        let next = passage.nextElementSibling;
        let hasVisible = false;
        while (next && !next.classList.contains("passage-block")) {
          if (next.classList.contains("qa-block") && next.style.display !== "none") {
            hasVisible = true;
            break;
          }
          next = next.nextElementSibling;
        }
        passage.style.display = hasVisible ? "" : "none";
      });
    }

    scanAndHighlightCurrentQuestion() {
      if (!this.autoSolveEnabled || !this.questionBank.length) return;
      try {
        const candidates = this.findPageOptionLists();
        if (!candidates.length) {
          this.clearPageHighlights();
          return;
        }
        const aggregatedTargets = [];
        const matchedSignatures = new Set();
        candidates.forEach((candidate) => {
          if (!candidate.answers.length) return;
          const match = this.matchQuestionByOptions(candidate.answers, candidate.questionText);
          if (!match) return;
          const correctSet = match.question.correctSet || new Set();
          const imageAnswers = match.question.imageAnswers || new Map();
          const candidateTargets = [];
          candidate.options.forEach((opt) => {
            let matched = false;

            for (const text of correctSet) {
              if (answersLooselyEqual(text, opt.normalized)) {
                candidateTargets.push(opt.element);
                matched = true;
                break;
              }
            }

            if (!matched && opt.imageSrc && imageAnswers.size > 0) {
              for (const [correctText, correctImageSrc] of imageAnswers.entries()) {
                if (correctSet.has(correctText) && opt.imageSrc === correctImageSrc) {
                  candidateTargets.push(opt.element);
                  matched = true;
                  break;
                }
              }
            }

            if (!matched && opt.imageSrc) {
              for (const text of correctSet) {
                if (text.startsWith("__img__")) {
                  const expectedSrc = text.replace("__img__", "");
                  if (opt.imageSrc === expectedSrc) {
                    candidateTargets.push(opt.element);
                    break;
                  }
                }
              }
            }
          });
          if (candidateTargets.length) {
            aggregatedTargets.push(...candidateTargets);
            matchedSignatures.add(match.question.signature);
          }
        });
        if (aggregatedTargets.length) {
          this.highlightPageOptions(aggregatedTargets);
          this.currentMatchedSignature = Array.from(matchedSignatures);
        } else {
          this.clearPageHighlights();
        }
      } catch (err) {
        console.warn("scanAndHighlightCurrentQuestion error:", err);
      }
    }

    highlightPageOptions(elements) {
      if (!Array.isArray(elements) || !elements.length) {
        this.clearPageHighlights();
        return;
      }
      this.clearPageHighlights();
      this.lastHighlightedElements = elements.filter((el) => el instanceof Element);
      this.lastHighlightedElements.forEach((el) => el.classList.add(PAGE_HIGHLIGHT_CLASS));
    }

    clearPageHighlights() {
      if (this.lastHighlightedElements && this.lastHighlightedElements.length) {
        this.lastHighlightedElements.forEach((el) => el?.classList?.remove(PAGE_HIGHLIGHT_CLASS));
      }
      document.querySelectorAll("." + PAGE_HIGHLIGHT_CLASS).forEach((node) => {
        if (node.closest("#olm-answers-container")) return;
        node.classList.remove(PAGE_HIGHLIGHT_CLASS);
      });
      this.lastHighlightedElements = [];
      this.currentMatchedSignature = null;
    }

    findPageOptionLists() {
      const selectors = [
        "ol.quiz-list",
        "ul.quiz-list",
        ".quiz-list",
        "ol.true-false",
        "ul.true-false",
        ".true-false"
      ];
      const seen = new Set();
      const out = [];
      selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((node) => {
          if (!(node instanceof Element)) return;
          if (seen.has(node)) return;
          if (node.closest("#olm-answers-container")) return;
          if (!isElementVisible(node)) return;
          const options = this.extractOptionItems(node);
          if (options.length < 2) return;
          seen.add(node);
          const answers = options.map((opt) => opt.normalized);
          const questionText = this.extractQuestionTextForList(node);
          out.push({ root: node, options, answers, questionText });
        });
      });

      const qselectContainers = new Set();
      document.querySelectorAll(".qselect, [data-ind].qselect").forEach((qselect) => {
        if (!(qselect instanceof Element)) return;
        if (qselect.closest("#olm-answers-container")) return;
        if (!isElementVisible(qselect)) return;

        let container = qselect.parentElement;
        if (!container) return;

        while (container && container !== document.body) {
          if (container.classList.contains("quiz-list") ||
            container.classList.contains("quiz-options") ||
            container.classList.contains("question-options") ||
            container.classList.contains("options-container") ||
            container.querySelectorAll(":scope > .qselect, :scope > [data-ind].qselect").length >= 2) {
            qselectContainers.add(container);
            break;
          }
          container = container.parentElement;
        }

        if (!qselectContainers.has(container) && container && container !== document.body && container instanceof Element) {
          const qselectCount = container.querySelectorAll(":scope > .qselect, :scope > [data-ind].qselect").length;
          if (qselectCount >= 2) {
            qselectContainers.add(container);
          }
        }
      });

      qselectContainers.forEach((container) => {
        if (!(container instanceof Element)) return;
        if (seen.has(container)) return;
        if (container.closest("#olm-answers-container")) return;
        if (!isElementVisible(container)) return;
        const options = this.extractOptionItems(container);
        if (options.length < 2) return;
        seen.add(container);
        const answers = options.map((opt) => opt.normalized);
        const questionText = this.extractQuestionTextForList(container);
        out.push({ root: container, options, answers, questionText });
      });

      return out;
    }

    extractOptionItems(rootEl) {
      const options = [];
      if (!rootEl || !(rootEl instanceof Element)) return options;
      if (rootEl.matches(".true-false") || rootEl.querySelector(".tf-row")) {
        const rows = Array.from(rootEl.querySelectorAll(".tf-row"));
        rows.forEach((row) => {
          if (!(row instanceof Element)) return;
          if (row.closest("#olm-answers-container")) return;
          if (!isElementVisible(row)) return;
          const clause = row.querySelector(".clause") || row;
          const normalized = normalizeAnswerText(getMathAwareText(clause));

          const images = clause.querySelectorAll("img");
          let imageSrc = null;
          if (images.length > 0) {
            imageSrc = images[0].getAttribute("src") || images[0].getAttribute("data-src") || "";
            if (imageSrc) {
              try {
                const url = new URL(imageSrc, location.href);
                imageSrc = url.href;
              } catch {
                imageSrc = imageSrc.trim();
              }
            }
          }

          const finalNormalized = normalized || (imageSrc ? `__img__${imageSrc}` : null);
          if (!finalNormalized) return;
          options.push({ element: clause, normalized: finalNormalized, imageSrc });
        });
        if (options.length) return options;
      }
      let nodes = [];
      const scopes = rootEl.matches("ol, ul")
        ? [":scope > li"]
        : [":scope > .qselect", ":scope > .quiz-option", ":scope > .option-item", ":scope > .answer", ":scope > [data-ind]", ":scope > li"];
      for (const selector of scopes) {
        nodes = Array.from(rootEl.querySelectorAll(selector)).filter((el) => el.parentElement === rootEl);
        if (nodes.length) break;
      }
      if (!nodes.length) nodes = Array.from(rootEl.children).filter((el) => el instanceof Element);
      nodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.closest("#olm-answers-container")) return;
        if (!isElementVisible(node)) return;

        let contentEl = node;
        if (node.classList.contains("qselect") || node.hasAttribute("data-ind")) {
          const qsign = node.querySelector(".qsign");
          if (qsign) {
            contentEl = qsign;
          }
        }
        const normalized = normalizeAnswerText(getMathAwareText(contentEl));

        const images = node.querySelectorAll("img");
        let imageSrc = null;
        if (images.length > 0) {
          imageSrc = images[0].getAttribute("src") || images[0].getAttribute("data-src") || "";
          if (imageSrc) {
            try {
              const url = new URL(imageSrc, location.href);
              imageSrc = url.href;
            } catch {
              imageSrc = imageSrc.trim();
            }
          }
        }

        const finalNormalized = normalized || (imageSrc ? `__img__${imageSrc}` : null);
        if (!finalNormalized) return;
        options.push({ element: node, normalized: finalNormalized, imageSrc });
      });
      return options;
    }

    extractQuestionTextForList(listEl) {
      if (!listEl || !(listEl instanceof Element)) return "";
      let container = listEl.closest(".question-item, .quiz-question, .main-question, .question, .quiz-content");
      if (!container) container = listEl.parentElement;
      if (!container) return "";
      const clone = container.cloneNode(true);
      clone.querySelectorAll(".quiz-list, ol.quiz-list, ul.quiz-list").forEach((el) => el.remove());
      const raw = collapseWhitespace(clone.textContent || "");
      if (raw) return normalizeQuestionText(raw);
      const segments = [];
      let prev = listEl.previousElementSibling;
      let guard = 0;
      while (prev && guard < 4) {
        const txt = collapseWhitespace(prev.textContent || "");
        if (txt) segments.unshift(txt);
        prev = prev.previousElementSibling;
        guard++;
      }
      return normalizeQuestionText(segments.join(" "));
    }

    matchQuestionByOptions(pageAnswers, candidateQuestionText) {
      if (!Array.isArray(pageAnswers) || !pageAnswers.length) return null;
      let best = null;
      this.questionBank.forEach((meta) => {
        if (!meta?.answersNormalized?.length) return;
        const matches = this.countAnswerMatches(pageAnswers, meta.answersNormalized);
        if (!matches) return;
        const ratioAgainstPage = matches / pageAnswers.length;
        const crossRatio = matches / Math.max(meta.answersNormalized.length, 1);
        const overlap = this.computeQuestionOverlap(meta.questionText, candidateQuestionText);
        if (pageAnswers.length >= 3 && ratioAgainstPage < 0.5) return;
        const score = ratioAgainstPage + overlap * 0.2 + (crossRatio === 1 ? 0.1 : 0);
        if (!best || score > best.score) {
          best = { question: meta, score, ratio: ratioAgainstPage, matches, overlap };
        }
      });
      if (!best) return null;
      const minMatchNeeded = pageAnswers.length <= 2 ? pageAnswers.length : Math.max(2, Math.ceil(pageAnswers.length * 0.5));
      if (best.matches < minMatchNeeded) return null;
      return best;
    }

    countAnswerMatches(currentAnswers, bankAnswers) {
      if (!Array.isArray(currentAnswers) || !Array.isArray(bankAnswers)) return 0;
      const used = new Set();
      let matches = 0;
      currentAnswers.forEach((ans) => {
        const idx = bankAnswers.findIndex((target, i) => !used.has(i) && (target === ans || answersLooselyEqual(target, ans)));
        if (idx !== -1) {
          used.add(idx);
          matches++;
        }
      });
      return matches;
    }

    computeQuestionOverlap(textA, textB) {
      if (!textA || !textB) return 0;
      if (textA === textB) return 1;
      if (textA.length > 20 && textB.length > 20 && (textA.includes(textB) || textB.includes(textA))) return 1;
      const tokensA = textA.split(" ").filter(Boolean).slice(0, 20);
      const tokensB = textB.split(" ").filter(Boolean).slice(0, 20);
      if (!tokensA.length || !tokensB.length) return 0;
      const setB = new Set(tokensB);
      let shared = 0;
      tokensA.forEach((token) => {
        if (token.length <= 3) return;
        if (setB.has(token)) shared++;
      });
      const denom = Math.max(1, Math.min(tokensA.length, setB.size));
      return shared / denom;
    }

    renumber() {
      const blocks = this.contentArea.querySelectorAll(".qa-block");
      let fallbackIdx = 1;
      blocks.forEach((b) => {
        const sp = b.querySelector(".q-index");
        if (!sp) return;
        if (!b.dataset.qIndex) {
          b.dataset.qIndex = String(fallbackIdx);
        }
        sp.textContent = `Câu ${b.dataset.qIndex}. `;
        fallbackIdx++;
      });
    }
    updateCounts() {
      const cnt = this.contentArea.querySelectorAll(".qa-block").length;
      const shown = [...this.contentArea.querySelectorAll(".qa-block")].filter(b => b.style.display !== "none").length;
      this.countBadge.textContent = `${shown} / ${cnt} hiển thị`;
      this.metaInfo.textContent = `${cnt} câu`;
    }
    filterQuestions(keyword) {
      const q = (keyword || "").trim().toLowerCase();
      const blocks = this.contentArea.querySelectorAll(".qa-block");
      let shown = 0;
      blocks.forEach((b) => {
        highlightInElement(b, "");
        const text = b.innerText.toLowerCase();
        const match = !q || text.includes(q);
        b.style.display = match ? "" : "none";
        if (match) { shown++; if (q) highlightInElement(b, q); }
      });
      this.countBadge.textContent = `${shown} / ${blocks.length} hiển thị`;
      this.renumber(); this.renderContentWithMath(this.contentArea);
      this.syncPassageBlocksVisibility();
    }

  }

  const answerUI = new AnswerDisplay();
  answerUI.init();

  const originalFetch = UW.fetch?.bind(UW) || fetch.bind(window);
  UW.fetch = function (...args) {
    const requestUrl = args[0] instanceof Request ? args[0].url : args[0];
    const p = originalFetch(...args);
    try {
      if (typeof requestUrl === "string" && requestUrl.includes(TARGET_URL_KEYWORD)) {
        answerUI.lastAnswersUrl = requestUrl;
        p.then((response) => {
          if (response && response.ok) {
            response.clone().json().then((data) => answerUI.renderData(data)).catch((err) => console.error(err));
          }
        }).catch(() => { });
      }
    } catch (e) { console.error(e); }
    return p;
  };

  if (UW.XMLHttpRequest) {
    const origOpen = UW.XMLHttpRequest.prototype.open;
    const origSend = UW.XMLHttpRequest.prototype.send;
    UW.XMLHttpRequest.prototype.open = function (...args) {
      this._olm_url = args[1] || ""; return origOpen.apply(this, args);
    };
    UW.XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("load", () => {
        try {
          const url = this._olm_url || this.responseURL || "";
          if (url.includes(TARGET_URL_KEYWORD) && this.status === 200) {
            answerUI.lastAnswersUrl = url;
            try { const data = JSON.parse(this.responseText); answerUI.renderData(data); } catch (e) { console.error(e); }
          }
        } catch (e) { }
      });
      return origSend.apply(this, args);
    };
  }
})();
