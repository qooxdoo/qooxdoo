addSample(".setTextSelection", {
  html: ['<p>This text is in a paragraph element</p>'],
  javascript: function() {
    q("p").setTextSelection(0, 9);
  },
  executable: true
});
