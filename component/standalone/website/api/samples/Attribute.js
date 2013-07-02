addSample(".getAttribute", {
  html: ['<a id="myId" href="http://qooxdoo.org">',
         '  qooxdoo',
         '</a>'],
  javascript: function() {
    var link = q("#myId").getAttribute("href");
    q("#myId").setHtml(link);
  },
  executable: true
});

addSample(".getHtml", {
  html: ['<div id="myId">',
         '  <b>qooxdoo</b>',
         '</div>'],
  javascript: function() {
    console.log(q("#myId").getHtml());
  },
  executable: true
});


addSample(".getValue", {
  html: ['<input id="myId" value="123">',
         '</input>'],
  javascript: function() {
    console.log(q("input").getValue());
  },
  executable: true
});
