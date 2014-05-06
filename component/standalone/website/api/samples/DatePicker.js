addSample(".datepicker", {
  html : ['<input type="text" id="datepicker-example"></input>'],
  javascript: function() {
q("#datepicker-example").datepicker(new Date());
  },
  executable: true,
  showMarkup: true
});

addSample(".datepicker", {
  html : ['<input type="text" id="datepicker-example"></input>'],
  javascript: function() {
var datepicker = q("#datepicker-example").datepicker(new Date());
// customize the format function to change the value which is
// set to the input element
datepicker.setConfig('format', function(date) {
  return date.toLocaleString();
});

// Update the datepicker by rendering it
datepicker.render();
  },
  executable: true,
  showMarkup: true
});

addSample(".datepicker", {
  html : ['<input type="text" id="datepicker-example"></input>'],
  javascript: function() {
var datepicker = q("#datepicker-example").datepicker(new Date());

// configure calendar widget
// only allow to select week days
datepicker.getCalendar().setConfig('selectableWeekdays', [ 1, 2, 3, 4, 5 ]);

// only allow to select today and future days
datepicker.getCalendar().setConfig('minDate', new Date());

// Update the datepicker by rendering it
datepicker.render();
  },
  executable: true,
  showMarkup: true
});

addSample(".datepicker", {
  html : ['<input type="text" id="datepicker-example"></input>'],
  javascript: function() {
var datepicker = q("#datepicker-example").datepicker(new Date());

// allow user input on the connected input element
datepicker.setConfig('readonly', false);

// Update the datepicker by rendering it
datepicker.render();
  },
  executable: true,
  showMarkup: true
});