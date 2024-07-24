var w = Object.defineProperty;
var T = (a, e, o) => e in a ? w(a, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : a[e] = o;
var p = (a, e, o) => T(a, typeof e != "symbol" ? e + "" : e, o);
/*!
 * Theia Sticky Sidebar v2.0.0
 * https://github.com/WeCodePixels/theia-sticky-sidebar
 *
 * Glues your website's sidebars, making them permanently visible while scrolling.
 *
 * Copyright 2013-2024 WeCodePixels and other contributors
 * Released under the MIT license
 */
class M {
  constructor(e) {
    p(this, "options");
    p(this, "elements");
    p(this, "initialized", !1);
    p(this, "stickySidebars", []);
    const t = { ...{
      elements: "",
      containerSelector: "",
      additionalMarginTop: 0,
      additionalMarginBottom: 0,
      updateSidebarHeight: !0,
      minWidth: 0,
      disableOnResponsiveLayouts: !0,
      sidebarBehavior: "modern",
      defaultPosition: "relative",
      verbose: !1
    }, ...e };
    t.additionalMarginTop = parseInt(e.additionalMarginTop) || 0, t.additionalMarginBottom = parseInt(e.additionalMarginBottom) || 0, t.elements instanceof HTMLElement ? this.elements = [t.elements] : t.elements instanceof Array ? this.elements = t.elements : this.elements = Array.from(document.querySelectorAll(t.elements)), this.options = t, this.tryInitOrHookIntoEvents();
  }
  unbind() {
    document.removeEventListener("scroll", this.tryDelayedInit), window.removeEventListener("resize", this.tryDelayedInit), this.stickySidebars.forEach((e) => {
      document.removeEventListener("scroll", e.onScroll), window.removeEventListener("resize", e.onScroll), e.resizeObserver.disconnect();
    });
  }
  // Try doing init, otherwise hook into window.resize and document.scroll and try again then.
  tryInitOrHookIntoEvents() {
    this.tryInit() || (this.options.verbose && console.log("TSS: Body width smaller than options.minWidth. Init is delayed."), document.addEventListener("scroll", this.tryDelayedInit), window.addEventListener("resize", this.tryDelayedInit));
  }
  tryDelayedInit() {
    this.tryInit() && (document.removeEventListener("scroll", this.tryDelayedInit), window.removeEventListener("resize", this.tryDelayedInit));
  }
  // Try doing init if proper conditions are met.
  tryInit() {
    return this.initialized ? !0 : document.body.getBoundingClientRect().width < this.options.minWidth ? !1 : (this.init(), !0);
  }
  // Init the sticky sidebar(s).
  init() {
    this.initialized = !0, document.querySelector("#theia-sticky-sidebar-stylesheet") || document.head.insertAdjacentHTML("beforeend", '<style id="theia-sticky-sidebar-stylesheet">.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>'), this.elements.forEach((o) => {
      const t = {};
      if (t.sidebar = o, t.options = this.options || {}, t.container = t.options.containerSelector && document.querySelector(t.options.containerSelector), t.container || (t.container = t.sidebar.parentNode), Object.assign(t.sidebar.style, {
        position: t.options.defaultPosition,
        overflow: "visible",
        boxSizing: "border-box"
      }), t.stickySidebar = t.sidebar.querySelector(".theiaStickySidebar"), !t.stickySidebar) {
        const n = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
        Array.from(t.sidebar.querySelectorAll("script")).forEach((s) => {
          (s.type.length === 0 || s.type.match(n)) && s.remove();
        }), t.stickySidebar = document.createElement("div"), t.stickySidebar.classList.add("theiaStickySidebar"), t.stickySidebar.append(...t.sidebar.children), t.sidebar.append(t.stickySidebar);
      }
      const h = getComputedStyle(t.sidebar);
      t.marginBottom = parseFloat(h.marginBottom), t.paddingTop = parseFloat(h.paddingTop), t.paddingBottom = parseFloat(h.paddingBottom);
      let f = d(t.stickySidebar).top, g = t.stickySidebar.offsetHeight;
      t.stickySidebar.style.paddingTop = "1px", t.stickySidebar.style.paddingBottom = "1px", f -= d(t.stickySidebar).top, g = t.stickySidebar.offsetHeight - g - f, f == 0 ? (t.stickySidebar.style.paddingTop = "0px", t.stickySidebarPaddingTop = 0) : t.stickySidebarPaddingTop = 1, g == 0 ? (t.stickySidebar.style.paddingBottom = "0px", t.stickySidebarPaddingBottom = 0) : t.stickySidebarPaddingBottom = 1, t.previousScrollTop = 0, t.fixedScrollTop = 0, this.resetSidebar(t), t.onScroll = () => {
        if (!this.isVisible(t.stickySidebar))
          return;
        if (document.body.getBoundingClientRect().width < t.options.minWidth) {
          this.resetSidebar(t);
          return;
        }
        if (t.options.disableOnResponsiveLayouts && (getComputedStyle(t.sidebar).float === "none" ? this.getOuterWidth(t.sidebar) : t.sidebar.offsetWidth) + 50 > t.container.getBoundingClientRect().width) {
          this.resetSidebar(t);
          return;
        }
        const n = window.scrollY;
        let s = "static";
        const l = d(t.sidebar);
        let i = 0;
        if (n >= l.top + (t.paddingTop - t.options.additionalMarginTop)) {
          const r = t.paddingTop + this.options.additionalMarginTop, S = t.paddingBottom + t.marginBottom + this.options.additionalMarginBottom, u = l.top, k = d(t.container).top + this.getClearedHeight(t.container), b = this.options.additionalMarginTop;
          let c;
          t.stickySidebar.offsetHeight + r + S < window.innerHeight ? c = b + t.stickySidebar.offsetHeight : c = window.innerHeight - t.marginBottom - t.paddingBottom - this.options.additionalMarginBottom;
          const v = u - n + t.paddingTop, B = k - n - t.paddingBottom - t.marginBottom;
          i = d(t.stickySidebar).top - n;
          const y = t.previousScrollTop - n;
          getComputedStyle(t.stickySidebar).position === "fixed" && t.options.sidebarBehavior == "modern" && (i += y), t.options.sidebarBehavior == "stick-to-top" && (i = this.options.additionalMarginTop), t.options.sidebarBehavior == "stick-to-bottom" && (i = c - t.stickySidebar.offsetHeight), y > 0 ? i = Math.min(i, b) : i = Math.max(i, c - t.stickySidebar.offsetHeight), i = Math.max(i, v), i = Math.min(i, B - t.stickySidebar.offsetHeight);
          const m = t.container.getBoundingClientRect().height == t.stickySidebar.offsetHeight;
          !m && i == b || !m && i == c - t.stickySidebar.offsetHeight ? s = "fixed" : n + i - l.top - t.paddingTop <= this.options.additionalMarginTop ? s = "static" : s = "absolute";
        }
        if (s == "fixed")
          Object.assign(t.stickySidebar.style, {
            position: "fixed",
            width: t.stickySidebar.getBoundingClientRect().width + "px",
            transform: "translateY(" + i + "px)",
            left: d(t.sidebar).left + parseFloat(getComputedStyle(t.sidebar).paddingLeft) - window.scrollX + "px",
            top: "0px"
          });
        else if (s == "absolute") {
          const r = {};
          getComputedStyle(t.stickySidebar).position !== "absolute" && (r.position = "absolute", r.transform = "translateY(" + (n + i - l.top - t.stickySidebarPaddingTop - t.stickySidebarPaddingBottom) + "px)", r.top = "0px"), r.width = t.stickySidebar.getBoundingClientRect().width + "px", r.left = "", Object.assign(t.stickySidebar.style, r);
        } else s == "static" && this.resetSidebar(t);
        s != "static" && t.options.updateSidebarHeight && (t.sidebar.style.minHeight = t.stickySidebar.offsetHeight + d(t.stickySidebar).top - l.top + t.paddingBottom + "px"), t.previousScrollTop = n;
      }, t.onScroll(), document.addEventListener("scroll", t.onScroll), window.addEventListener("resize", t.onScroll), t.resizeObserver = new ResizeObserver(() => {
        t.onScroll();
      }), t.resizeObserver.observe(t.stickySidebar), this.stickySidebars.push(t);
    });
  }
  getOuterWidth(e) {
    const o = getComputedStyle(e);
    return e.getBoundingClientRect().width + parseFloat(o.marginLeft) + parseFloat(o.marginRight);
  }
  isVisible(e) {
    return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
  }
  // Reset the sidebar to its default state
  resetSidebar(e) {
    e.fixedScrollTop = 0, e.sidebar.style.minHeight = "1px", Object.assign(e.stickySidebar.style, {
      position: "static",
      width: "",
      transform: "none"
    });
  }
  // Get the height of a div as if its floated children were cleared. Note that this function fails if the floats are more than one level deep.
  getClearedHeight(e) {
    let o = e.getBoundingClientRect().height;
    return Array.from(e.children).forEach((t) => {
      o = Math.max(o, t.getBoundingClientRect().height);
    }), o;
  }
}
function d(a) {
  const e = a.getBoundingClientRect();
  return {
    top: e.top + window.scrollY - document.documentElement.clientTop,
    left: e.left + window.scrollX - document.documentElement.clientLeft
  };
}
export {
  M as TheiaStickySidebar,
  d as getOffset
};
