addSample(".tabs", {
  html : [
    '<div id="tabs-example">',
    '  <ul>',
    '    <li><button data-qx-tab-page="#page0">First Page</button></li>',
    '    <li><button data-qx-tab-page="#page1">Second Page</button></li>',
    '  </ul>',
    '  <div id="page0">First Page Content</div>',
    '  <div id="page1">Second Page Content</div>',
    '</div>'
  ],
  javascript: function() {
    q("#tabs-example").tabs();
  },
  executable: true,
  showMarkup: true
});
