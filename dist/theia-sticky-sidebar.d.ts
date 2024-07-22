/*!
 * Theia Sticky Sidebar v2.0.0
 * https://github.com/WeCodePixels/theia-sticky-sidebar
 *
 * Glues your website's sidebars, making them permanently visible while scrolling.
 *
 * Copyright 2013-2024 WeCodePixels and other contributors
 * Released under the MIT license
 */
interface Options {
    elements: string;
    containerSelector: string;
    additionalMarginTop: number;
    additionalMarginBottom: number;
    updateSidebarHeight: boolean;
    minWidth: number;
    disableOnResponsiveLayouts: boolean;
    sidebarBehavior: string;
    defaultPosition: string;
    verbose: boolean;
}
export declare class TheiaStickySidebar {
    private readonly options;
    private elements;
    private initialized;
    constructor(options: Partial<Options>);
    private tryInitOrHookIntoEvents;
    private tryDelayedInit;
    private tryInit;
    private init;
    private getOuterWidth;
    private isVisible;
    private resetSidebar;
    private getClearedHeight;
}
export declare function getOffset(element: HTMLElement): {
    top: number;
    left: number;
};
export {};
