addSample(".slider", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").slider();
  },
  executable: true
});

addSample(".slider", {
  html: [
    '<div id="target">',
    '  <button class="qx-slider-knob"></button>',
    '</div>'
  ],
  javascript: function() {
    q("#target").slider(20, 10);
  },
  executable: true,
  showMarkup: true
});
