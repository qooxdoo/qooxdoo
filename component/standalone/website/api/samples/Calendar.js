addSample(".calendar", {
  html : ['<div id="calendar-example"></div>'],
  javascript: function() {
q("#calendar-example").calendar(new Date());
  },
  executable: true,
  showMarkup: true
});

addSample(".calendar", {
  html : ['<div id="calendar-example"></div>'],
  javascript: function() {
var renderHook = function() {

  // get all days of the next month in reversed order
  var futureDays = this.find(".qx-calendar-next-month").reverse();

  if (futureDays.length >= 7) {

    // 'display:none' for the last seven days
    futureDays.slice(0, 7).hide();

    // hide all other days - use the children (button) DOM nodes
    futureDays.slice(7).getChildren().setStyle('visibility', 'hidden');

  } else {

    // hide all days of the next month - use the children (button) DOM nodes
    futureDays.getChildren().setStyle('visibility', 'hidden');

  }
};
var calendar = q("#calendar-example").calendar(new Date());
calendar.on("rendered", renderHook);
},
  executable: true,
  showMarkup: true
});