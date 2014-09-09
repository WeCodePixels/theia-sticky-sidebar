# Theia Sticky Sidebar

![Theia Sticky Sidebar logo](https://raw.githubusercontent.com/liviucmg/theia-sticky-sidebar/master/assets/logo.png "Theia Sticky Sidebar logo")

Glues your website's sidebars (or any vertical column for that matter), making them permanently visible when scrolling up and down. Useful when a sidebar is too tall or too short compared to the rest of the content. Works with virtually any design and supports multiple sidebars.

Check out these examples:

[3 columns example](http://htmlpreview.github.io/?https://github.com/liviucmg/theia-sticky-sidebar/blob/master/examples/3-columns.html)

[4 columns example](http://htmlpreview.github.io/?https://github.com/liviucmg/theia-sticky-sidebar/blob/master/examples/4-columns.html)

[Foundation example](http://htmlpreview.github.io/?https://github.com/liviucmg/theia-sticky-sidebar/blob/master/examples/foundation.html)

## Install

### Bower

If you are using Bower as your package manager, you can simply use:

```bash
bower install theia-sticky-sidebar
```

## Usage

Your website's HTML structure has to be similar to this in order to work:

```html
<div class="wrapper">
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

Note that the inner "theiaStickySidebar" divs are optional, but highly recommended.
If you don't supply them yourself, the script will create them for you, but this can be problematic
if you're using ads or iframes, since they will be moved around in the DOM and as a result will get reloaded.

For the above example, you can use the following JavaScript:

```html
<script type="text/javascript" src="http://code.jquery.com/jquery.min.js"></script>
<script type="text/javascript" src="theia-sticky-sidebar.js"></script>
		
<script type="text/javascript">
  jQuery(document).ready(function() {
    jQuery('.content, .sidebar').theiaStickySidebar({
	  // Settings
      additionalMarginTop: 30
    });
  });
</script>
```

## Settings

### containerSelector

The sidebar's container element. If not specified, it defaults to the sidebar's parent.

### additionalMarginTop

An additional top margin in pixels. Defaults to **0**.

### additionalMarginBottom

An additional bottom margin in pixels. Defaults to **0**.

### updateSidebarHeight

Updates the sidebar's height. Use this if the background isn't showing properly, for example. Defaults to **true**.

### minWidth

The sidebar returns to normal if its width is below this value. Useful for responsive designs. Defaults to **0**.