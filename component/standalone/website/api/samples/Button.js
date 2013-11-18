addSample(".button", {
  html: ['<button id="button-example"></button>'],
  javascript: function() {
    q("#button-example").button("Label");
  },
  executable: true,
  showMarkup: true
});
