// Set current year
document.addEventListener('DOMContentLoaded', function() {
  var currentYear = new Date().getFullYear();
  var yearElements = document.querySelectorAll('.current-year');
  yearElements.forEach(function(elem) {
    elem.textContent = currentYear;
  });

  // Initialize Bootstrap tooltips (if Bootstrap tooltips are used)
  var tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
  if (tooltipElements.length > 0 && typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
    tooltipElements.forEach(function(elem) {
      new bootstrap.Tooltip(elem);
    });
  }
});

// Navigation bar scroll effect
var scroll = function() {
  var scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  var navigationBar = document.getElementById('navigationBar');
  var navigationLogo = document.getElementById('navigationLogo');

  if (navigationBar && navigationLogo) {
    if (scrollPosition < 250) {
      navigationBar.style.backgroundColor = 'transparent';
      navigationLogo.style.width = '0';
      navigationLogo.classList.add('invisible');
    } else {
      navigationBar.style.backgroundColor = 'rgba(0, 40, 56, 0.9)';
      navigationLogo.style.width = '';
      navigationLogo.classList.remove('invisible');
    }
  }
};

window.addEventListener('scroll', scroll);
scroll();
