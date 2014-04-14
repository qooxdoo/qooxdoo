addSample("widget.setEnabled", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").widget().setEnabled(false);
  }
});


addSample("widget.getEnabled", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").widget().setEnabled(false);
    console.log(q("#target").getEnabled()); // false
  }
});

addSample("widget.getConfig", {
  html: ['<div id="target" data-qx-config-max="11"></div>'],
  javascript: function() {
    var w = q("#target").widget();
    console.log(w.getConfig("max")); // 11 (from the data attribute)
    w.setConfig("max", 22);
    console.log(w.getConfig("max")); // 22 (set value)
  },
  executable: true
});

addSample("widget.setConfig", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").widget().setConfig("max", 22);
  }
});

addSample("widget.getTemplate", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    var w = q("#target").widget();
    w.setTemplate("content", "{{data}}");
    w.setHtml(q.template.render(w.getTemplate("content"), {data: "My Content"}));
  },
  executable: true
});

addSample("widget.setTemplate", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").widget().setTemplate("max", "{{data}}");
  }
});


addSample("widget.render", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").widget().setTemplate("max", "{{data}}").render();
  }
});


addSample("widget.dispose", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").widget();
    // some more code...
    q("#target").dispose();
  }
});

addSample(".widget", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").widget(); // converts to a widget collection
    // some more code...
    q("#target"); // still a widget collection (autodetected)
  }
});

addSample(".$onFirstCollection", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").$onFirstCollection("click", clb); // adds a click listener
    q("#target").$onFirstCollection("click", clb); // does not add the same listener again

    q("#target").$offFirstCollection("click", clb); // remove the initial added listener
  }
});

addSample(".$offFirstCollection", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").$onFirstCollection("click", clb); // adds a click listener
    q("#target").$offFirstCollection("click", clb); // remove the initial added listener
  }
});
