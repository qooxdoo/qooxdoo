addSample(".slider", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").slider();
  },
  executable: true
});

addSample(".slider", {
  javascript: function() {
    q.create("<div>").slider().appendTo(document);
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

addSample(".slider", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").slider(4, [2, 4, 8, 16, 32]);
  },
  executable: true
});

addSample("slider.setValue", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").slider().setValue(50);
  },
  executable: true
});

addSample("slider.getValue", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    console.log(q("#target").slider(30).getValue());
  },
  executable: true
});

addSample(".slider", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target")
    .slider()
    .setConfig("minimum", 20)
    .setConfig("maximum", 80)
    .render();
  },
  executable: true
});

addSample(".slider", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target")
    .slider()
    .setConfig("step", 0.1)
    .setConfig("offset", 30)
    .render();
  },
  executable: true
});

addSample(".slider", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target")
    .slider()
    .setTemplate("knobContent", "{{value}}%")
    .render();
  },
  executable: true
});