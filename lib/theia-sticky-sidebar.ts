/*!
 * Theia Sticky Sidebar v2.0.0
 * https://github.com/WeCodePixels/theia-sticky-sidebar
 *
 * Glues your website's sidebars, making them permanently visible while scrolling.
 *
 * Copyright 2013-2025 WeCodePixels and other contributors
 * Released under the MIT license
 */

interface Options {
    elements: string | HTMLElement | Array<HTMLElement>,
    containerSelector: string,
    additionalMarginTop: number,
    additionalMarginBottom: number,
    updateSidebarHeight: boolean,
    minWidth: number,
    disableOnResponsiveLayouts: boolean,
    sidebarBehavior: string,
    defaultPosition: string,
    verbose: boolean,
    requestAnimationFrame: boolean,
}

interface StickySidebar {
    options: Options,
    sidebar: HTMLElement,
    stickySidebar: HTMLElement,
    container: HTMLElement,
    onScroll: () => unknown,
    previousScrollTop: number,
    fixedScrollTop: number,
    stickySidebarPaddingTop: number,
    stickySidebarPaddingBottom: number,
    marginBottom: number,
    paddingTop: number,
    paddingBottom: number,
    resizeObserver: ResizeObserver,
    queuedForAnimationFrame: boolean,
}

export class TheiaStickySidebar {
    public options: Options;
    private elements: Array<HTMLElement>;
    private initialized: boolean = false;
    private stickySidebars: Array<StickySidebar> = [];

    public constructor(options: Partial<Options>) {
        const defaults: Options = {
            elements: '',
            containerSelector: '',
            additionalMarginTop: 0,
            additionalMarginBottom: 0,
            updateSidebarHeight: true,
            minWidth: 0,
            disableOnResponsiveLayouts: true,
            sidebarBehavior: 'modern',
            defaultPosition: 'relative',
            verbose: false,
            requestAnimationFrame: true,
        };
        const finalOptions = {...defaults, ...options};

        // Validate options
        finalOptions.additionalMarginTop = Math.floor(options.additionalMarginTop || 0);
        finalOptions.additionalMarginBottom = Math.floor(options.additionalMarginBottom || 0);

        if (finalOptions.elements instanceof HTMLElement) {
            this.elements = [finalOptions.elements];
        } else if (finalOptions.elements instanceof Array) {
            this.elements = finalOptions.elements
        } else {
            this.elements = Array.from(document.querySelectorAll(finalOptions.elements));
        }
        this.options = finalOptions;
        this.tryInitOrHookIntoEvents();
    }

    public unbind = () => {
        document.removeEventListener('scroll', this.tryDelayedInit);
        window.removeEventListener('resize', this.tryDelayedInit);

        this.stickySidebars.forEach(o => {
            document.removeEventListener('scroll', o.onScroll);
            window.removeEventListener('resize', o.onScroll);
            o.resizeObserver.disconnect();
        })
    };

    // Try doing init, otherwise hook into window.resize and document.scroll and try again then.
    private tryInitOrHookIntoEvents = () => {
        const success = this.tryInit();

        if (!success) {
            if (this.options.verbose) {
                console.log('TSS: Body width smaller than options.minWidth. Init is delayed.');
            }

            document.addEventListener('scroll', this.tryDelayedInit);
            window.addEventListener('resize', this.tryDelayedInit);
        }
    }

    private tryDelayedInit = () => {
        const success = this.tryInit();

        if (success) {
            document.removeEventListener('scroll', this.tryDelayedInit);
            window.removeEventListener('resize', this.tryDelayedInit);
        }
    }

    // Try doing init if proper conditions are met.
    private tryInit() {
        if (this.initialized) {
            return true;
        }

        if (document.body.getBoundingClientRect().width < this.options.minWidth) {
            return false;
        }

        this.init();

        return true;
    }

    // Init the sticky sidebar(s).
    private init() {
        this.initialized = true;

        // Add CSS
        const existingStylesheet = document.querySelector('#theia-sticky-sidebar-stylesheet');
        if (!existingStylesheet) {
            document.head.insertAdjacentHTML('beforeend', '<style id="theia-sticky-sidebar-stylesheet">.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>');
        }

        this.elements.forEach(element => {
            const o: StickySidebar = {} as StickySidebar;

            o.sidebar = element;

            // Save options
            o.options = this.options || {};

            // Get container
            o.container = (o.options.containerSelector && document.querySelector(o.options.containerSelector)) as HTMLElement;
            if (!o.container) {
                o.container = o.sidebar.parentNode as HTMLElement;
            }

            // Create sticky sidebar
            Object.assign(o.sidebar.style, {
                position: o.options.defaultPosition,
                overflow: 'visible',
                boxSizing: 'border-box'
            });

            // Get the sticky sidebar element. If none has been found, then create one.
            o.stickySidebar = o.sidebar.querySelector('.theiaStickySidebar') as HTMLElement;
            if (!o.stickySidebar) {
                // Remove <script> tags, otherwise they will be run again when added to the stickySidebar.
                const javaScriptMIMETypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
                Array.from(o.sidebar.querySelectorAll('script')).forEach(script => {
                    if (script.type.length === 0 || script.type.match(javaScriptMIMETypes)) {
                        script.remove();
                    }
                });

                o.stickySidebar = document.createElement('div');
                o.stickySidebar.classList.add('theiaStickySidebar');
                o.stickySidebar.append(...o.sidebar.children);
                o.sidebar.append(o.stickySidebar);
            }

            // Get existing top and bottom margins and paddings
            const computedStyle = getComputedStyle(o.sidebar);
            o.marginBottom = parseFloat(computedStyle.marginBottom);
            o.paddingTop = parseFloat(computedStyle.paddingTop);
            o.paddingBottom = parseFloat(computedStyle.paddingBottom);

            // Add a temporary padding rule to check for collapsable margins.
            let collapsedTopHeight = getOffset(o.stickySidebar).top;
            let collapsedBottomHeight = o.stickySidebar.offsetHeight;
            o.stickySidebar.style.paddingTop = '1px';
            o.stickySidebar.style.paddingBottom = '1px';
            collapsedTopHeight -= getOffset(o.stickySidebar).top;
            collapsedBottomHeight = o.stickySidebar.offsetHeight - collapsedBottomHeight - collapsedTopHeight;
            if (collapsedTopHeight == 0) {
                o.stickySidebar.style.paddingTop = '0px';
                o.stickySidebarPaddingTop = 0;
            } else {
                o.stickySidebarPaddingTop = 1;
            }

            if (collapsedBottomHeight == 0) {
                o.stickySidebar.style.paddingBottom = '0px';
                o.stickySidebarPaddingBottom = 0;
            } else {
                o.stickySidebarPaddingBottom = 1;
            }

            // We use this to know whether the user is scrolling up or down.
            o.previousScrollTop = 0;

            // Scroll top (value) when the sidebar has fixed position.
            o.fixedScrollTop = 0;

            // Set sidebar to default values.
            this.resetSidebar(o);

            const f = () => {
                // Stop if the sidebar isn't visible.
                if (!this.isVisible(o.stickySidebar)) {
                    return;
                }

                // Stop if the window is too small.
                if (document.body.getBoundingClientRect().width < o.options.minWidth) {
                    this.resetSidebar(o);
                    return;
                }

                // Stop if the sidebar width is larger than the container width (e.g. the theme is responsive and the sidebar is now below the content)
                if (o.options.disableOnResponsiveLayouts) {
                    const sidebarWidth = getComputedStyle(o.sidebar).float === 'none' ? this.getOuterWidth(o.sidebar) : o.sidebar.offsetWidth;

                    if (sidebarWidth + 50 > o.container.getBoundingClientRect().width) {
                        this.resetSidebar(o);
                        return;
                    }
                }

                const scrollTop = window.scrollY;
                let position = 'static';
                const sidebarOffset = getOffset(o.sidebar);
                let top = 0;

                // If the user has scrolled down enough for the sidebar to be clipped at the top, then we can consider changing its position.
                if (scrollTop >= sidebarOffset.top + (o.paddingTop - o.options.additionalMarginTop)) {
                    // The top and bottom offsets, used in various calculations.
                    const offsetTop = o.paddingTop + this.options.additionalMarginTop;
                    const offsetBottom = o.paddingBottom + o.marginBottom + this.options.additionalMarginBottom;

                    // All top and bottom positions are relative to the window, not to the parent elemnts.
                    const containerTop = sidebarOffset.top;
                    const containerBottom = getOffset(o.container).top + this.getClearedHeight(o.container);

                    // The top and bottom offsets relative to the window screen top (zero) and bottom (window height).
                    const windowOffsetTop = this.options.additionalMarginTop;
                    let windowOffsetBottom;

                    const sidebarSmallerThanWindow = (o.stickySidebar.offsetHeight + offsetTop + offsetBottom) < window.innerHeight;
                    if (sidebarSmallerThanWindow) {
                        windowOffsetBottom = windowOffsetTop + o.stickySidebar.offsetHeight;
                    } else {
                        windowOffsetBottom = window.innerHeight - o.marginBottom - o.paddingBottom - this.options.additionalMarginBottom;
                    }

                    const staticLimitTop = containerTop - scrollTop + o.paddingTop;
                    const staticLimitBottom = containerBottom - scrollTop - o.paddingBottom - o.marginBottom;

                    top = getOffset(o.stickySidebar).top - scrollTop;
                    const scrollTopDiff = o.previousScrollTop - scrollTop;

                    // If the sidebar position is fixed, then it won't move up or down by itself. So, we manually adjust the top coordinate.
                    if (getComputedStyle(o.stickySidebar).position === 'fixed') {
                        if (o.options.sidebarBehavior == 'modern') {
                            top += scrollTopDiff;
                        }
                    }

                    if (o.options.sidebarBehavior == 'stick-to-top') {
                        top = this.options.additionalMarginTop;
                    }

                    if (o.options.sidebarBehavior == 'stick-to-bottom') {
                        top = windowOffsetBottom - o.stickySidebar.offsetHeight;
                    }

                    if (scrollTopDiff > 0) { // If the user is scrolling up.
                        top = Math.min(top, windowOffsetTop);
                    } else { // If the user is scrolling down.
                        top = Math.max(top, windowOffsetBottom - o.stickySidebar.offsetHeight);
                    }

                    top = Math.max(top, staticLimitTop);

                    top = Math.min(top, staticLimitBottom - o.stickySidebar.offsetHeight);

                    // If the sidebar is the same height as the container, we won't use fixed positioning.
                    const sidebarSameHeightAsContainer = o.container.getBoundingClientRect().height == o.stickySidebar.offsetHeight;

                    if (!sidebarSameHeightAsContainer && top == windowOffsetTop) {
                        position = 'fixed';
                    } else if (!sidebarSameHeightAsContainer && top == windowOffsetBottom - o.stickySidebar.offsetHeight) {
                        position = 'fixed';
                    } else if (scrollTop + top - sidebarOffset.top - o.paddingTop <= this.options.additionalMarginTop) {
                        // Stuck to the top of the page. No special behavior.
                        position = 'static';
                    } else {
                        // Stuck to the bottom of the page.
                        position = 'absolute';
                    }
                }

                /*
                 * Performance notice: It's OK to set these CSS values at each resize/scroll, even if they don't change.
                 * It's way slower to first check if the values have changed.
                 */
                if (position == 'fixed') {
                    Object.assign(o.stickySidebar.style, {
                        position: 'fixed',
                        width: o.stickySidebar.getBoundingClientRect().width + 'px',
                        transform: 'translateY(' + top + 'px)',
                        left: (getOffset(o.sidebar).left + parseFloat(getComputedStyle(o.sidebar).paddingLeft) - window.scrollX) + 'px',
                        top: '0px'
                    });
                } else if (position == 'absolute') {
                    const css: Partial<CSSStyleDeclaration> = {};

                    if (getComputedStyle(o.stickySidebar).position !== 'absolute') {
                        css.position = 'absolute';
                        css.transform = 'translateY(' + (scrollTop + top - sidebarOffset.top - o.stickySidebarPaddingTop - o.stickySidebarPaddingBottom) + 'px)';
                        css.top = '0px';
                    }

                    css.width = o.stickySidebar.getBoundingClientRect().width + 'px';
                    css.left = '';

                    Object.assign(o.stickySidebar.style, css);
                } else if (position == 'static') {
                    this.resetSidebar(o);
                }

                if (position != 'static') {
                    if (o.options.updateSidebarHeight) {
                        o.sidebar.style.minHeight = (o.stickySidebar.offsetHeight + getOffset(o.stickySidebar).top - sidebarOffset.top + o.paddingBottom) + 'px';
                    }
                }

                o.previousScrollTop = scrollTop;
            };
            o.onScroll = () => {
                if (o.options.requestAnimationFrame) {
                    // Throttle/debounce our scroll handler.
                    if (!o.queuedForAnimationFrame) {
                        o.queuedForAnimationFrame = true;
                        window.requestAnimationFrame(() => {
                            f();
                            o.queuedForAnimationFrame = false;
                        });
                    }
                } else {
                    f();
                }
            };

            // Initialize the sidebar's position.
            o.onScroll();

            // Recalculate the sidebar's position on every scroll and resize.
            document.addEventListener('scroll', o.onScroll);
            window.addEventListener('resize', o.onScroll);

            // Recalculate the sidebar's position every time the sidebar changes its size.
            o.resizeObserver = new ResizeObserver(() => {
                o.onScroll();
            });
            o.resizeObserver.observe(o.stickySidebar);

            this.stickySidebars.push(o);
        });
    }

    private getOuterWidth(element: HTMLElement): number {
        const style = getComputedStyle(element);

        return element.getBoundingClientRect().width + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    }

    private isVisible(element: HTMLElement) {
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    // Reset the sidebar to its default state
    private resetSidebar(s: StickySidebar) {
        s.fixedScrollTop = 0;
        s.sidebar.style.minHeight = '1px';
        Object.assign(s.stickySidebar.style, {
            'position': 'static',
            'width': '',
            'transform': 'none'
        });
    }

    // Get the height of a div as if its floated children were cleared. Note that this function fails if the floats are more than one level deep.
    private getClearedHeight(element: HTMLElement) {
        let height = element.getBoundingClientRect().height;

        Array.from(element.children).forEach(child => {
            height = Math.max(height, child.getBoundingClientRect().height);
        });

        return height;
    }
}

export function getOffset(element: HTMLElement): { top: number, left: number } {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.scrollY - document.documentElement.clientTop,
        left: rect.left + window.scrollX - document.documentElement.clientLeft
    };
}
