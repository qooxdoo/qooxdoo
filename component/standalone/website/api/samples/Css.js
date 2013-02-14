addSample(".addClass", function() {
  if (active) {
    // show loading indicator
    q('#dependency-loading-indicator').removeClass('hidden');
  } else {
    // hide loading indicator
    q('#dependency-loading-indicator').addClass('hidden');
  }
});
