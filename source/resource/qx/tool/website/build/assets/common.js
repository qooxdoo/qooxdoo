// Common JavaScript for qooxdoo startpage using qxWeb
qx.ready(function() {
  // Set current year
  var currentYear = new Date().getFullYear();
  q('.current-year').setHtml(currentYear);

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

  // Simple navbar toggle for mobile
  q('.navbar-toggler').on('click', function() {
    q('#navbarNav').toggleClass('show');
  });
});

