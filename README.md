# Theia Sticky Sidebar

A lightweight JavaScript (TypeScript) library that glues your website's sidebars (or any vertical column), making them permanently visible when scrolling up and
down. Useful when a sidebar is too tall or too short compared to the rest of the content. Works with virtually any design and supports multiple sidebars.

Check out some examples:

- [3 columns example](http://theia-sticky-sidebar.wecodepixels.com/examples/3-columns.html)
- [4 columns example](http://theia-sticky-sidebar.wecodepixels.com/examples/4-columns.html)
- [Bootstrap 4 example](http://theia-sticky-sidebar.wecodepixels.com/examples/bootstrap-v4.html)
- [Foundation example](http://theia-sticky-sidebar.wecodepixels.com/examples/foundation.html)

![ESLint](https://github.com/WeCodePixels/theia-sticky-sidebar/actions/workflows/eslint.yml/badge.svg)
![Playwright and SonarQube](https://github.com/WeCodePixels/theia-sticky-sidebar/actions/workflows/playwright.yml/badge.svg)

## Install

| Package Manager | Install Command                 |
|-----------------|---------------------------------|
| NPM             | `npm add theia-sticky-sidebar`  |
| Yarn            | `yarn add theia-sticky-sidebar` |
| PNPM            | `pnpm add theia-sticky-sidebar` |

## Usage

Your website's HTML structure has to be similar to this in order to work:

```js
<div>
    <div class="content">
        <div class="theiaStickySidebar">
            ...
        </div>
    </div>
    <div class="sidebar">
        <div class="theiaStickySidebar">
            ...
        </div>
    </div>
</div>
```

Note that the inner `theiaStickySidebar` divs are optional, but highly recommended.
If you don't supply them yourself, they will be created for you, but this can be problematic:
ads or iframes will be moved around and may be loaded twice.

For the above example, you can use the following code:

### JavaScript

```html
<script src="node_modules/theia-sticky-sidebar/dist/theia-sticky-sidebar.umd.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const tss = new TheiaStickySidebar({
            elements: '.content, .sidebar',
            additionalMarginTop: 30
        });
    });
</script>
```

### TypeScript

```ts
import {TheiaStickySidebar} from "theia-sticky-sidebar";

document.addEventListener('DOMContentLoaded', function () {
    const tss = new TheiaStickySidebar({
        elements: '.content, .sidebar',
        additionalMarginTop: 30
    });
});
```

### React

This example uses just one sidebar.

```tsx
import React, {useEffect, useRef} from "react";
import {TheiaStickySidebar} from "theia-sticky-sidebar";

export const MyComponent = () => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const theiaStickySidebarRef = useRef<TheiaStickySidebar>();

    useEffect(() => {
        // Activate sticky sidebar once the component is mounted.
        theiaStickySidebarRef.current = new TheiaStickySidebar({
            elements: sidebarRef.current!,
            additionalMarginTop: 30
        });

        // Gracefully remove the sidebar once the component is unmounted.
        return () => {
            theiaStickySidebarRef.current!.unbind();
        };
    }, []);

    return <div>
        <div class="content">
            ...
        </div>
        <div class="sidebar" ref={sidebarRef}>
            <div class="theiaStickySidebar">
                ...
            </div>
        </div>
    </div>
}
```

## Settings

| Setting                      | Type                                          | Description                                                                                                                                                                                                                                                      |
|------------------------------|-----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `elements`                   | `string \| HTMLElement \| Array<HTMLElement>` | Required. Can be a simple string selector, like `.my-sidebar`, or `.my-sidebar-1, .my-sidebar-2`. Or, it can be a DOM element, like `document.querySelector('.my-sidebar')`. Or, it can be an array of DOM elements.                                             |
| `containerSelector`          | `string`                                      | Selector for the sidebar's container element. If not specified, it defaults to the sidebar's parent.                                                                                                                                                             |
| `additionalMarginTop`        | `number`                                      | An additional top margin in pixels. Defaults to **0**.                                                                                                                                                                                                           |
| `additionalMarginBottom`     | `number`                                      | An additional bottom margin in pixels. Defaults to **0**.                                                                                                                                                                                                        |
| `updateSidebarHeight`        | `boolean`                                     | Updates the sidebar's height. Use this if the background isn't showing properly, for example. Defaults to **true**.                                                                                                                                              |
| `minWidth`                   | `number`                                      | The sidebar returns to normal if its width is below this value. Useful for responsive designs. Defaults to **0**.                                                                                                                                                |
| `disableOnResponsiveLayouts` | `boolean`                                     | Try to detect responsive layouts automatically and disable the sticky functionality on smaller screens. More exactly, it detects when the container and the sidebar are moved one on top of the other, instead of showing up side-by-side. Defaults to **true**. |
| `defaultPosition`            | `string`                                      | The sidebar must have a non-static `position`, as the inner sticky-sidebar uses `position: absolute`. Defaults to **relative**.                                                                                                                                  |

## Development

If you want to work on this repository:

```bash
npm install
npm run dev
```

## WordPress

[![Theia Sticky Sidebar for WordPress](https://github.com/liviucmg/theia-sticky-sidebar/blob/master/assets/theia-sticky-sidebar-for-wordpress-banner.png)](https://wecodepixels.com/shop/theia-sticky-sidebar-for-wordpress/)

Also available as a [premium WordPress plugin](https://wecodepixels.com/shop/theia-sticky-sidebar-for-wordpress/) that comes with a user-friendly admin panel
and supports a plethora of themes out-of-the-box.
