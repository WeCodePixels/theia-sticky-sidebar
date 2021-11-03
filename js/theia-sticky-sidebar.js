/*!
 * Theia Sticky Sidebar v1.7.0
 * https://github.com/WeCodePixels/theia-sticky-sidebar
 *
 * Glues your website's sidebars, making them permanently visible while scrolling.
 *
 * Copyright 2013-2016 WeCodePixels and other contributors
 * Released under the MIT license
 */

import resizeSensor from 'resize-sensor';
import {theiaEventHandler} from './theiaEventHandler'

const theiaStickySidebar = (target, options) => {
    const defaults = {
        'containerSelector': '',
        'additionalMarginTop': 0,
        'additionalMarginBottom': 0,
        'updateSidebarHeight': true,
        'minWidth': 0,
        'disableOnResponsiveLayouts': true,
        'sidebarBehavior': 'modern',
        'defaultPosition': 'relative',
        'namespace': 'TSS'
    };
    options = Object.assign(defaults, options);

    // Validate options
    options.additionalMarginTop = parseInt(options.additionalMarginTop) || 0;
    options.additionalMarginBottom = parseInt(options.additionalMarginBottom) || 0;

    tryInitOrHookIntoEvents(options, target);

    // Try doing init, otherwise hook into window.resize and document.scroll and try again then.
    function tryInitOrHookIntoEvents(options, $that) {
        const success = tryInit(options, $that);

        if (!success) {
            console.log('TSS: Body width smaller than options.minWidth. Init is delayed.');

            theiaEventHandler.addEventListener(document, 'scroll.' + options.namespace, function (options, $that) {
                return function () {
                    const success = tryInit(options, $that);

                    if (success) {
                        theiaEventHandler.removeEventListener(document, 'scroll.' + options.namespace);
                    }
                };
            }(options, $that));
            theiaEventHandler.addEventListener(window, 'resize.' + options.namespace, function (options, $that) {
                return function () {
                    const success = tryInit(options, $that);

                    if (success) {
                        theiaEventHandler.removeEventListener(window, 'resize.' + options.namespace);
                    }
                };
            }(options, $that))
        }
    }

    // Try doing init if proper conditions are met.
    function tryInit(options, $that) {
        if (options.initialized === true) {
            return true;
        }

        if (document.querySelector('body').getBoundingClientRect().width < options.minWidth) {
            return false;
        }

        init(options, $that);

        return true;
    }

    // Init the sticky sidebar(s).
    function init(options, $that) {
        options.initialized = true;

        // Add CSS
        const existingStylesheet = document.querySelectorAll('#theia-sticky-sidebar-stylesheet-' + options.namespace);

        if (existingStylesheet.length === 0) {
            document.querySelector('head').insertAdjacentHTML(
                "beforeend", '<style id="theia-sticky-sidebar-stylesheet-' + options.namespace + '">.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>');
        }

        $that.forEach(function (element) {
            const o = {};

            o.sidebar = element;

            // Save options
            o.options = options || {};

            // Get container
            o.container = o.options.containerSelector === '' ? [] : document.querySelectorAll(o.options.containerSelector);
            if (o.container.length == 0) {
                o.container = o.sidebar.parentNode;
            }

            // Create sticky sidebar
            let parentNode = o.sidebar.parentNode;
            while (parentNode && parentNode !== document) {
                parentNode.style.setProperty('-webkit-transform', 'none'); // Fix for WebKit bug - https://code.google.com/p/chromium/issues/detail?id=20574
                parentNode = parentNode.parentNode;
            }

            for (const [key, value] of Object.entries({
                'position': o.options.defaultPosition,
                'overflow': 'visible',
                // The "box-sizing" must be set to "content-box" because we set a fixed height to this element when the sticky sidebar has a fixed position.
                '-webkit-box-sizing': 'border-box',
                '-moz-box-sizing': 'border-box',
                'box-sizing': 'border-box'
            })) {
                o.sidebar.style.setProperty(key, value);
            }

            // Get the sticky sidebar element. If none has been found, then create one.
            o.stickySidebar = o.sidebar.querySelector('.theiaStickySidebar');
            if (o.stickySidebar === null) {
                // Remove <script> tags, otherwise they will be run again when added to the stickySidebar.
                const javaScriptMIMETypes = /(?:text|application)\/(?:x-)?(?:javascript|ecmascript)/i;
                Array.from(o.sidebar.querySelectorAll('script')).forEach((script) => {
                    if (script.type.length === 0 || script.type.match(javaScriptMIMETypes)) {
                        script.remove();
                    }
                });

                o.stickySidebar = document.createElement('div');
                o.stickySidebar.classList.add('theiaStickySidebar');
                Array.from(o.sidebar.children).forEach(child => {
                    o.stickySidebar.appendChild(child);
                })
                o.sidebar.appendChild(o.stickySidebar);
            }

            // Get existing top and bottom margins and paddings
            const computedStyle = window.getComputedStyle(o.sidebar);
            o.marginBottom = parseInt(computedStyle.getPropertyValue('margin-bottom'));
            o.paddingTop = parseInt(computedStyle.getPropertyValue('padding-top'));
            o.paddingBottom = parseInt(computedStyle.getPropertyValue('padding-bottom'));

            // Add a temporary padding rule to check for collapsable margins.
            let collapsedTopHeight = o.stickySidebar.getBoundingClientRect().top + window.pageYOffset;
            let collapsedBottomHeight = o.stickySidebar.getBoundingClientRect().height;
            o.stickySidebar.style.setProperty('padding-top',1);
            o.stickySidebar.style.setProperty('padding-bottom', 1);
            collapsedTopHeight -= o.stickySidebar.getBoundingClientRect().top + window.pageYOffset;
            collapsedBottomHeight = o.stickySidebar.getBoundingClientRect().height - collapsedBottomHeight - collapsedTopHeight;
            if (collapsedTopHeight == 0) {
                o.stickySidebar.style.setProperty('padding-top', 0);
                o.stickySidebarPaddingTop = 0;
            } else {
                o.stickySidebarPaddingTop = 1;
            }

            if (collapsedBottomHeight == 0) {
                o.stickySidebar.style.setProperty('padding-bottom', 0);
                o.stickySidebarPaddingBottom = 0;
            } else {
                o.stickySidebarPaddingBottom = 1;
            }

            // We use this to know whether the user is scrolling up or down.
            o.previousScrollTop = null;

            // Scroll top (value) when the sidebar has fixed position.
            o.fixedScrollTop = 0;

            // Set sidebar to default values.
            resetSidebar();

            o.onScroll = function (o) {
                // Stop if the sidebar isn't visible.
                if (o.stickySidebar.style.display === 'none') {
                    return;
                }

                // Stop if the window is too small.
                if (document.querySelector('body').getBoundingClientRect().width < o.options.minWidth) {
                    resetSidebar();
                    return;
                }

                // Stop if the sidebar width is larger than the container width (e.g. the theme is responsive and the sidebar is now below the content)
                if (o.options.disableOnResponsiveLayouts) {
                    // const sidebarWidth = o.sidebar.outerWidth(o.sidebar.style.float === 'none');
                    const sidebarWidth = o.sidebar.getBoundingClientRect().width;

                    if (sidebarWidth + 50 > o.container.getBoundingClientRect().width) {
                        resetSidebar();
                        return;
                    }
                }

                const scrollTop = window.scrollY;
                let position = 'static';
                let top = 0;

                // Position of element relative to document = position of element relative to screen + window scrolling position
                const sidebarOffset = o.sidebar.getBoundingClientRect().top + window.pageYOffset;

                // If the user has scrolled down enough for the sidebar to be clipped at the top, then we can consider changing its position.
                if (scrollTop >= sidebarOffset + (o.paddingTop - o.options.additionalMarginTop)) {
                    // The top and bottom offsets, used in various calculations.
                    const offsetTop = o.paddingTop + options.additionalMarginTop;
                    const offsetBottom = o.paddingBottom + o.marginBottom + options.additionalMarginBottom;

                    // All top and bottom positions are relative to the window, not to the parent elements.
                    const containerTop = o.sidebar.getBoundingClientRect().top + window.pageYOffset;
                    const containerBottom = o.sidebar.getBoundingClientRect().top + window.pageYOffset + getClearedHeight(o.container);

                    // The top and bottom offsets relative to the window screen top (zero) and bottom (window height).
                    const windowOffsetTop = 0 + options.additionalMarginTop;
                    let windowOffsetBottom;

                    const sidebarSmallerThanWindow = (o.stickySidebar.getBoundingClientRect().height + offsetTop + offsetBottom) < window.innerHeight;
                    if (sidebarSmallerThanWindow) {
                        windowOffsetBottom = windowOffsetTop + o.stickySidebar.getBoundingClientRect().height;
                    } else {
                        windowOffsetBottom = window.innerHeight - o.marginBottom - o.paddingBottom - options.additionalMarginBottom;
                    }

                    const staticLimitTop = containerTop - scrollTop + o.paddingTop;
                    const staticLimitBottom = containerBottom - scrollTop - o.paddingBottom - o.marginBottom;

                    top = o.stickySidebar.getBoundingClientRect().top + window.pageYOffset - scrollTop;
                    const scrollTopDiff = o.previousScrollTop - scrollTop;

                    // If the sidebar position is fixed, then it won't move up or down by itself. So, we manually adjust the top coordinate.
                    if (o.stickySidebar.style.position === 'fixed') {
                        if (o.options.sidebarBehavior === 'modern') {
                            top += scrollTopDiff;
                        }
                    }

                    if (o.options.sidebarBehavior === 'stick-to-top') {
                        top = options.additionalMarginTop;
                    }

                    if (o.options.sidebarBehavior === 'stick-to-bottom') {
                        top = windowOffsetBottom - o.stickySidebar.getBoundingClientRect().height;
                    }

                    if (scrollTopDiff > 0) { // If the user is scrolling up.
                        top = Math.min(top, windowOffsetTop);
                    } else { // If the user is scrolling down.
                        top = Math.max(top, windowOffsetBottom - o.stickySidebar.getBoundingClientRect().height);
                    }

                    top = Math.max(top, staticLimitTop);

                    top = Math.min(top, staticLimitBottom - o.stickySidebar.getBoundingClientRect().height);

                    // If the sidebar is the same height as the container, we won't use fixed positioning.
                    const sidebarSameHeightAsContainer = o.container.getBoundingClientRect().height === o.stickySidebar.getBoundingClientRect().height;

                    if (!sidebarSameHeightAsContainer && top == windowOffsetTop) {
                        position = 'fixed';
                    } else if (!sidebarSameHeightAsContainer && top == windowOffsetBottom - o.stickySidebar.getBoundingClientRect().height) {
                        position = 'fixed';
                    } else if (scrollTop + top - (o.sidebar.getBoundingClientRect().top + window.pageYOffset) - o.paddingTop <= options.additionalMarginTop) {
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
                if (position === 'fixed') {
                    const scrollLeft = window.scrollX;

                    for (const [key, value] of Object.entries({
                        'position': 'fixed',
                        'width': getWidthForObject(o.stickySidebar) + 'px',
                        'transform': 'translateY(' + top + 'px)',
                        'left': (o.sidebar.getBoundingClientRect().left + parseInt(o.sidebar.style.paddingLeft) - scrollLeft) + 'px',
                        'top': '0px'
                    })) {
                        o.stickySidebar.style.setProperty(key, value);
                    }
                } else if (position === 'absolute') {
                    const css = {};

                    if (o.stickySidebar.style.position !== 'absolute') {
                        css.position = 'absolute';
                        css.transform = 'translateY(' + (scrollTop + top - (o.sidebar.getBoundingClientRect().top + window.pageYOffset) - o.stickySidebarPaddingTop - o.stickySidebarPaddingBottom) + 'px)';
                        css.top = '0px';
                    }

                    css.width = getWidthForObject(o.stickySidebar) + 'px';
                    css.left = '';

                    for (const [key, value] of Object.entries(css)) {
                        o.stickySidebar.style.setProperty(key, value);
                    }
                } else if (position === 'static') {
                    resetSidebar();
                }

                if (position !== 'static') {
                    if (o.options.updateSidebarHeight === true) {
                        o.sidebar.style.setProperty('min-height', o.stickySidebar.outerHeight +
                            (o.stickySidebar.getBoundingClientRect().top + window.pageYOffset) -
                            (o.sidebar.getBoundingClientRect().top + window.pageYOffset) + o.paddingBottom);
                    }
                }

                o.previousScrollTop = scrollTop;
            };

            // Initialize the sidebar's position.
            o.onScroll(o);

            // Recalculate the sidebar's position on every scroll and resize.
            document.addEventListener('scroll', function (o) {
                return function () {
                    o.onScroll(o);
                };
            }(o));
            window.addEventListener('resize', function (o) {
                return function () {
                    o.stickySidebar.style.setProperty('position', 'static');
                    o.onScroll(o);
                };
            }(o));

            // Recalculate the sidebar's position every time the sidebar changes its size.
            if (typeof resizeSensor !== 'undefined') {
                new resizeSensor(o.stickySidebar, function (o) {
                    return function () {
                        o.onScroll(o);
                    };
                }(o));
            }

            // Reset the sidebar to its default state
            function resetSidebar() {
                o.fixedScrollTop = 0;
                o.sidebar.style.setProperty('min-height', '1px');
                for (const [key, value] of Object.entries({
                    'position': 'static',
                    'width': '',
                    'transform': 'none'
                })) {
                    o.stickySidebar.style.setProperty(key, value);
                }
            }

            // Get the height of a div as if its floated children were cleared. Note that this function fails if the floats are more than one level deep.
            function getClearedHeight(e) {
                let height = e.getBoundingClientRect().height;

                Array.from(e.children).forEach(child => {
                    height = Math.max(height, child.getBoundingClientRect().height);
                });

                return height;
            }
        });
    }

    function getWidthForObject(object) {
        let width;

        try {
            width = object[0].getBoundingClientRect().width;
        } catch (err) {
        }

        if (typeof width === "undefined") {
            width = object.getBoundingClientRect().width;
        }

        return width;
    }

    return this;
}

export default theiaStickySidebar;
