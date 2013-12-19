/*
 * Copyright (C) 2013 Liviu Cristian Mirea Ghiban <contact@liviucmg.com>
 * 
 * All rights reserved. No warranty, explicit or implicit, provided.
 * 
 * Title: Theia Sticky Sidebar
 * Version: 1.1.0
 * Author: Liviu Cristian Mirea Ghiban
 * Email: contact@liviucmg.com
 * Website: http://liviucmg.com
 */

(function($) {
	$.fn.theiaStickySidebar = function(options) {
		var defaults = {
			'containerSelector': '',
			'additionalMarginTop': 0,
			'additionalMarginBottom': 0,
			'updateSidebarHeight': false,
			'minWidth': 0
		};
		options = $.extend(defaults, options);

		// Validate options
		options.additionalMarginTop = parseInt(options.additionalMarginTop) || 0;
		options.additionalMarginBottom = parseInt(options.additionalMarginBottom) || 0;
		options.updateSidebarHeight = options.updateSidebarHeight != false;
		
		// Add CSS
		$('head').append($('<style>.theiaStickySidebar:after {content: ""; display: table; clear: both;}</style>'));

		this.each(function() {
			var o = {};
			o.sidebar = $(this);

			// Save options
			o.options = options || {};

			// Get container
			o.container = $(o.options.containerSelector);
			if (o.container.size() == 0) {
				o.container = o.sidebar.parent();
			}

			// Create sticky sidebar
			o.sidebar.find('script').remove(); // Remove <script> tags, otherwise they will be run again on the next line.
			o.sidebar.parents().css('-webkit-transform', 'none'); // Fix for WebKit bug - https://code.google.com/p/chromium/issues/detail?id=20574
			o.stickySidebar = $('<div>').addClass('theiaStickySidebar').append(o.sidebar.children());
			o.sidebar.append(o.stickySidebar);

			// Add a 1px top and bottom padding to disable margin collapse. Otherwise, the sidebar's height will change when setting "position: fixed".
			o.stickySidebar.css('padding', '1px 0');

			// Get existing top and bottom margins and paddings
			o.marginTop = parseInt(o.sidebar.css('margin-top'));
			o.marginBottom = parseInt(o.sidebar.css('margin-bottom')) + 1;
			o.paddingTop = parseInt(o.sidebar.css('padding-top'));
			o.paddingBottom = parseInt(o.sidebar.css('padding-bottom'));

			// We use this to know whether the user is scrolling up or down.
			o.previousScrollTop = null;

			// Scroll top (value) when the sidebar has fixed position.
			o.fixedScrollTop = 0;

			o.onScroll = function(o) {				
				// Stop if the sidebar isn't visible.
				if (!o.stickySidebar.is(":visible")) {
					return;
				}
				
				// Stop if the window is too small.
				if ($('body').width() < o.options.minWidth) {
					resetSidebar();
					return;					
				}

				// Stop if the sidebar width is larger than the container width (e.g. the theme is responsive and the sidebar is now below the content)
				if (o.sidebar.outerWidth(true) + 50 >  o.container.width()) {
					resetSidebar();
					return;
				}

				var scrollTop = $(document).scrollTop();
				var fixed = false;
				var sidebarSmallerThanWindow = (o.stickySidebar.height() + o.marginTop + o.paddingTop + o.marginBottom + o.options.additionalMarginTop + o.options.additionalMarginBottom) < $(window).height();

				if (scrollTop >= o.container.offset().top - o.options.additionalMarginTop) {
					fixed = true;
				}
				else {
					fixed = false;
				}

				if (fixed) {
					var containerTop = o.container.offset().top;
					var containerBottom = o.container.offset().top + getClearedHeight(o.container);
					var fixedLimitTop = Math.max(0, containerTop - scrollTop) + o.paddingTop + o.marginTop + options.additionalMarginTop;
					var fixedLimitBottom = $(window).height() - o.marginBottom - o.paddingBottom - options.additionalMarginBottom;
					var staticLimitTop = containerTop - scrollTop - o.marginTop - o.paddingTop  + options.additionalMarginTop;
					var staticLimitBottom = containerBottom - scrollTop - o.paddingBottom - options.additionalMarginBottom;

					if (sidebarSmallerThanWindow) {
						fixedLimitBottom = fixedLimitTop + o.stickySidebar.height();
					}

					var top = o.stickySidebar.offset().top - scrollTop;
					var scrollTopDiff = o.previousScrollTop - scrollTop;
					top += scrollTopDiff;

					if (scrollTopDiff > 0) {
						top = Math.min(top, fixedLimitTop);
					}
					else {
						top = Math.max(top, fixedLimitBottom - o.stickySidebar.height());
					}

					top = Math.max(top, staticLimitTop);
					top = Math.min(top, staticLimitBottom - o.stickySidebar.height());

					if (o.options.updateSidebarHeight == false) {
						o.sidebar.css({
							'min-height': o.sidebar.height()
						});
					}

					o.stickySidebar.css({
						'position': 'fixed',
						'width': o.stickySidebar.width(),
						'top': top,
						'left': o.sidebar.offset().left + parseInt(o.sidebar.css('padding-left'))
					});

					o.stickySidebar.addClass('theiaStickySidebar-fixed');

					if (o.options.updateSidebarHeight == true) {
						o.sidebar.css({
							'min-height': o.stickySidebar.height() + o.stickySidebar.offset().top - o.sidebar.offset().top - (o.sidebar.innerHeight() - o.sidebar.height())
						});
					}
				}
				else {
					resetSidebar();
				}

				o.previousScrollTop = scrollTop;
			};

			// Initialize the sidebar's position.
			o.onScroll(o);

			// Recalculate the sidebar's position on every scroll and resize.
			$(document).scroll(function(o) {
				return function() {
					o.onScroll(o);
				};
			}(o));
			$(window).resize(function(o) {
				return function() {
					o.stickySidebar.css({'position': 'static'});
					o.onScroll(o);
				};
			}(o));

			// Reset the sidebar to its default state
			function resetSidebar() {
				o.fixedScrollTop = 0;
				o.sidebar.css({
					'min-height': '0'
				});
				o.stickySidebar.css({
					'position': 'static',
					'width': ''
				});
				o.stickySidebar.removeClass('theiaStickySidebar-fixed');
			}

			// Get the height of a div as if its floated children were cleared. Note that this function fails if the floats are more than one level deep.
			function getClearedHeight(e) {
				var height = e.height();

				e.children().each(function() {
					height = Math.max(height, $(this).height());
				});

				return height;
			}
		});
	}
})(jQuery);