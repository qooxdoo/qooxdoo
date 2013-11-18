addSample(".accordion", {
  html : [
    '<div id="accordion-example">',
    '  <ul>',
    '    <li><button data-qx-tab-page="#page0">First Page</button></li>',
    '    <li id="page0">First Page Content</li>',
    '    <li><button data-qx-tab-page="#page1">Second Page</button></li>',
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