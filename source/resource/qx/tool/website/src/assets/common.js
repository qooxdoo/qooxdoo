// Using qxWeb for better readability and qooxdoo consistency
qx.ready(function() {
  // Set current year
  var currentYear = new Date().getFullYear();
  q('.current-year').setHtml(currentYear);

  // Initialize Bootstrap tooltips (if Bootstrap is available)
  var tooltipElements = q('[data-toggle="tooltip"]');
  if (tooltipElements.length > 0 && typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    tooltipElements.forEach(function(elem) {
      new bootstrap.Tooltip(elem);
    });
  }

  // Navigation bar scroll effect
  var scroll = function() {
    var scrollPosition = q(window).getScrollTop();
    var navigationBar = q('#navigationBar');
    var navigationLogo = q('#navigationLogo');

    if (navigationBar.length > 0 && navigationLogo.length > 0) {
      if (scrollPosition < 250) {
        navigationBar.setStyle('backgroundColor', 'transparent');
        navigationLogo.setStyle('width', '0').addClass('invisible');
      } else {
        navigationBar.setStyle('backgroundColor', 'rgba(0, 40, 56, 0.9)');
        navigationLogo.setStyle('width', '').removeClass('invisible');
      }
    }
  };

  q(window).on('scroll', scroll);
  scroll();
});
