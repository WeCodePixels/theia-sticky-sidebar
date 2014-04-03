# Theia Sticky Sidebar

Glues your website's sidebars, making them permanently visible.

## Install

### Bower

If you are using Bower as your package manager, you can simply use:

```bash
bower install theia-sticky-sidebar
```

## Usage

```javascript
<script type="text/javascript" src="http://code.jquery.com/jquery.min.js"></script>
<script type="text/javascript" src="theia-sticky-sidebar.js"></script>
		
<script type="text/javascript">
  jQuery(document).ready(function() {
    jQuery('.content, .sidebar').theiaStickySidebar({
	  // Settings
      additionalMarginTop': 30
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

Defaults to **true**.

### minWidth

The sidebar returns to normal if its width is below this value. Useful for responsive designs. Defaults to **0**.