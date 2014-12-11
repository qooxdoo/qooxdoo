addSample("rating.setValue", {
  javascript: function() {
    q.create("<div>").rating().appendTo(document).setValue(5);
  },
  executable: true
});

addSample("rating.getValue", {
  javascript: function() {
    console.log(
      q.create("<div>").rating().appendTo(document).getValue()
    );
  },
  executable: true
});

addSample(".rating", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").rating();
    // some time later
    q("#target").setTemplate("symbol", "•");
    // update the rating
    q("#target").render();
  },
  executable: true
});

addSample(".rating", {
  javascript: function() {
    q.create("<div>").rating(3, "π", 7).appendTo(document);
  },
  executable: true
});

addSample(".rating", {
  html: ['<div id="target"></div>'],
  javascript: function() {
    q("#target").rating();
  },
  executable: true,
  showMarkup: true
});
