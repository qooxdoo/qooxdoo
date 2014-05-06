addSample(".accordion", {
  html: [
    '<div id="accordion-example">',
    '  <ul>',
    '    <li data-qx-accordion-page="#page0"><button>First Page</button></li>',
    '    <li id="page0">First Page Content</li>',
    '    <li data-qx-accordion-page="#page1"><button>Second Page</button></li>',
    '    <li id="page1">Second Page Content</li>',
    '  </ul>',
    '</div>'
  ],
  javascript: function() {
q("#accordion-example").accordion();
  },
  executable: true,
  showMarkup: true
});

addSample(".accordion", {
  javascript: function() {
    // programmatic Accordion creation (no pre-existing markup)
    var accordion = q.create('<div></div>')
    .appendTo(document.body)
    .accordion()
    .addButton('First Page', '#page0');

    accordion.find("ul").append(q.create('<li id="page0" class="qx-accordion-page">First Page Content</li>'));
    accordion.addButton('Second Page', '#page1')
    .find("ul").append(q.create('<li id="page1" class="qx-accordion-page">Second Page Content</li>'));
    accordion.render();
  },
  executable: true
});
