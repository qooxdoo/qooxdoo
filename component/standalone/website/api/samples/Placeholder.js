addSample("q.placeholder.update", {
  html: ['<input type="text" placeholder="abc"></input>'],
  javascript: function() {
    // make sure the placeholders work on older browsres
    q.placeholder.update();
  },
  executable: true
});