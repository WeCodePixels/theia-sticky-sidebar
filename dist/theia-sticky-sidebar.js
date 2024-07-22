var w = Object.defineProperty;
var v = (d, i, o) => i in d ? w(d, i, { enumerable: !0, configurable: !0, writable: !0, value: o }) : d[i] = o;
var p = (d, i, o) => v(d, typeof i != "symbol" ? i + "" : i, o);
/*!
 * Theia Sticky Sidebar v2.0.0
 * https://github.com/WeCodePixels/theia-sticky-sidebar
 *
 * Glues your website's sidebars, making them permanently visible while scrolling.
 *
 * Copyright 2013-2024 WeCodePixels and other contributors
 * Released under the MIT license
 */
class C {
  constructor(i) {
    p(this, "options");
    p(this, "elements");
    p(this, "initialized", !1);
    i = { ...{
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
    }, ...i }, i.additionalMarginTop = parseInt(i.additionalMarginTop) || 0, i.additionalMarginBottom = parseInt(i.additionalMarginBottom) || 0, this.elements = document.querySelectorAll(i.elements), this.options = i, this.tryInitOrHookIntoEvents();
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
      const g = getComputedStyle(t.sidebar);
      t.marginBottom = parseFloat(g.marginBottom), t.paddingTop = parseFloat(g.paddingTop), t.paddingBottom = parseFloat(g.paddingBottom);
      let h = l(t.stickySidebar).top, b = t.stickySidebar.offsetHeight;
      t.stickySidebar.style.paddingTop = "1px", t.stickySidebar.style.paddingBottom = "1px", h -= l(t.stickySidebar).top, b = t.stickySidebar.offsetHeight - b - h, h == 0 ? (t.stickySidebar.style.paddingTop = "0px", t.stickySidebarPaddingTop = 0) : t.stickySidebarPaddingTop = 1, b == 0 ? (t.stickySidebar.style.paddingBottom = "0px", t.stickySidebarPaddingBottom = 0) : t.stickySidebarPaddingBottom = 1, t.previousScrollTop = 0, t.fixedScrollTop = 0, this.resetSidebar(t), t.onScroll = () => {
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
        const r = l(t.sidebar);
        let e = 0;
        if (n >= r.top + (t.paddingTop - t.options.additionalMarginTop)) {
          const a = t.paddingTop + this.options.additionalMarginTop, S = t.paddingBottom + t.marginBottom + this.options.additionalMarginBottom, u = r.top, k = r.top + this.getClearedHeight(t.container), f = this.options.additionalMarginTop;
          let c;
          t.stickySidebar.offsetHeight + a + S < window.innerHeight ? c = f + t.stickySidebar.offsetHeight : c = window.innerHeight - t.marginBottom - t.paddingBottom - this.options.additionalMarginBottom;
          const B = u - n + t.paddingTop, T = k - n - t.paddingBottom - t.marginBottom;
          e = l(t.stickySidebar).top - n;
          const y = t.previousScrollTop - n;
          getComputedStyle(t.stickySidebar).position === "fixed" && t.options.sidebarBehavior == "modern" && (e += y), t.options.sidebarBehavior == "stick-to-top" && (e = this.options.additionalMarginTop), t.options.sidebarBehavior == "stick-to-bottom" && (e = c - t.stickySidebar.offsetHeight), y > 0 ? e = Math.min(e, f) : e = Math.max(e, c - t.stickySidebar.offsetHeight), e = Math.max(e, B), e = Math.min(e, T - t.stickySidebar.offsetHeight);
          const m = t.container.getBoundingClientRect().height == t.stickySidebar.offsetHeight;
          !m && e == f || !m && e == c - t.stickySidebar.offsetHeight ? s = "fixed" : n + e - r.top - t.paddingTop <= this.options.additionalMarginTop ? s = "static" : s = "absolute";
        }
        if (s == "fixed")
          Object.assign(t.stickySidebar.style, {
            position: "fixed",
            width: t.stickySidebar.getBoundingClientRect().width + "px",
            transform: "translateY(" + e + "px)",
            left: l(t.sidebar).left + parseFloat(getComputedStyle(t.sidebar).paddingLeft) - window.scrollX + "px",
            top: "0px"
          });
        else if (s == "absolute") {
          const a = {};
          getComputedStyle(t.stickySidebar).position !== "absolute" && (a.position = "absolute", a.transform = "translateY(" + (n + e - r.top - t.stickySidebarPaddingTop - t.stickySidebarPaddingBottom) + "px)", a.top = "0px"), a.width = t.stickySidebar.getBoundingClientRect().width + "px", a.left = "", Object.assign(t.stickySidebar.style, a);
        } else s == "static" && this.resetSidebar(t);
        s != "static" && t.options.updateSidebarHeight && (t.sidebar.style.minHeight = t.stickySidebar.offsetHeight + l(t.stickySidebar).top - r.top + t.paddingBottom + "px"), t.previousScrollTop = n;
      }, t.onScroll(), document.addEventListener("scroll", t.onScroll), window.addEventListener("resize", t.onScroll), new ResizeObserver(() => {
        t.onScroll();
      }).observe(t.stickySidebar);
    });
  }
  getOuterWidth(i) {
    const o = getComputedStyle(i);
    return i.getBoundingClientRect().width + parseFloat(o.marginLeft) + parseFloat(o.marginRight);
  }
  isVisible(i) {
    return !!(i.offsetWidth || i.offsetHeight || i.getClientRects().length);
  }
  // Reset the sidebar to its default state
  resetSidebar(i) {
    i.fixedScrollTop = 0, i.sidebar.style.minHeight = "1px", Object.assign(i.stickySidebar.style, {
      position: "static",
      width: "",
      transform: "none"
    });
  }
  // Get the height of a div as if its floated children were cleared. Note that this function fails if the floats are more than one level deep.
  getClearedHeight(i) {
    let o = i.getBoundingClientRect().height;
    return Array.from(i.children).forEach((t) => {
      o = Math.max(o, t.getBoundingClientRect().height);
    }), o;
  }
}
function l(d) {
  const i = d.getBoundingClientRect();
  return {
    top: i.top + window.scrollY - document.documentElement.clientTop,
    left: i.left + window.scrollX - document.documentElement.clientLeft
  };
}
export {
  C as TheiaStickySidebar,
  l as getOffset
};
