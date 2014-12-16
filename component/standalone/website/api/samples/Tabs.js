(function() {
  var defaultHtml = [
      '<div id="tabs-example">',
      '  <ul>',
      '    <li data-qx-tabs-page="#page0"><button>First Page</button></li>',
      '    <li data-qx-tabs-page="#page1"><button>Second Page</button></li>',
      '  </ul>',
      '  <div id="page0">First Page Content</div>',
      '  <div id="page1">Second Page Content</div>',
      '</div>'
    ];

  addSample(".tabs", {
    html : defaultHtml,
    javascript: function() {
      q("#tabs-example").tabs();
    },
    executable: true,
    showMarkup: true
  });

  addSample(".tabs", {
    html : defaultHtml,
    javascript: function() {
      q("#tabs-example").tabs("justify", 1);
    },
    executable: true
  });

  addSample(".tabs", {
    html : defaultHtml,
    javascript: function() {
      q("#tabs-example").tabs().on("changeSelected", function(index) {
        console.log("Selected index", index)
      });
    },
    executable: true
  });


  addSample("tabs.addButton", {
    html : [
      '<div id="tabs-example"></div>'
    ],
    javascript: function() {
      q("#tabs-example")
      .tabs()
      .addButton("Button 1")
      .addButton("Button 2");
    },
    executable: true
  });

  addSample("tabs.addButton", {
    html : [
      '<div id="tabs-example"></div>'
    ],
    javascript: function() {
      q("#tabs-example")
      .tabs()
      .setTemplate("button", "<li><button>{{{content}}} {{{content}}}</button></li>")
      .addButton("Button 1");
    },
    executable: true
  });


  addSample(".tabs", {
    html : defaultHtml,
    javascript: function() {
      q("#tabs-example")
      .tabs()
      .setConfig("align", "right")
      .render();
    },
    executable: true
  });

  addSample("tabs.select", {
    html : defaultHtml,
    javascript: function() {
      q("#tabs-example")
      .tabs()
      .select(1);
    },
    executable: true
  });
})();
