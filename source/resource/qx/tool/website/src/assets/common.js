// Common JavaScript for qooxdoo startpage
$(function() {
  // Set current year
  var currentYear = new Date().getFullYear();
  $('.current-year').html(currentYear);

  // Initialize Bootstrap tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // Navigation bar scroll effect
  var scroll = function() {
    var scrollPosition = $(window).scrollTop();
    var navigationBar = $('#navigationBar');
    var navigationLogo = $('#navigationLogo');

    if (navigationBar.length > 0 && navigationLogo.length > 0) {
      if (scrollPosition < 250) {
        navigationBar.css('backgroundColor', 'transparent');
        navigationLogo.css('width', '0').addClass('invisible');
      } else {
        navigationBar.css('backgroundColor', 'rgba(0, 40, 56, 0.9)');
        navigationLogo.css('width', '').removeClass('invisible');
      }
    }
  };

  $(window).on('scroll', scroll);
  scroll();
});

