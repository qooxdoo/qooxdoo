addSample(".button", {
  html: ['<button id="button-example"></button>'],
  javascript: function() {
    q("#button-example").button("Label");
  },
  executable: true,
  showMarkup: true
});

addSample("button.setLabel", {
  html: ['<button id="button-example"></button>'],
  javascript: function() {
    q("#button-example").button().setLabel("Label");
  },
  executable: true
});

addSample("button.setIcon", {
  html: ['<button id="button-example">Label</button>'],
  javascript: function() {
    q("#button-example").button().setIcon("samples/edit-clear.png");
  },
  executable: true
});

addSample("button.setMenu", {
  html: [
    '<ul id="button-menu">',
    '  <li>Item 1</li>',
    '  <li>Item 2</li>',
    '</ul>',
    '<button id="button-example"></button>'
  ],
  javascript: function() {
    q("#button-example").button().setMenu(q("#button-menu"));
  },
  executable: true
});
