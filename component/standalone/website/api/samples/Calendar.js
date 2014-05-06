addSample(".calendar", {
  html : ['<div id="calendar-example"></div>'],
  javascript: function() {
    q("#calendar-example").calendar(new Date());
  },
  executable: true,
  showMarkup: true
});
