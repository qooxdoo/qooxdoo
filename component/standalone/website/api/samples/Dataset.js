addSample(".getAllData", {
  html: ['<div id="myId" data-x="1" data-y="2"></div>'],
  javascript: function() {
    var data = q("#myId").getAllData();
    q("#myId").setHtml("X:" + data.x + " " + "Y:" + data.y);
  },
  executable: true
});

addSample(".getData", {
  html: ['<div id="myId" data-x="1"></div>'],
  javascript: function() {
    q("#myId").setHtml(q("#myId").getData("x"));
  },
  executable: true
});

addSample(".removeData", {
  html: ['<div id="myId" data-x="1">init</div>'],
  javascript: function() {
    q("#myId").removeData("x");
    q("#myId").setHtml(q("#myId").getData("x"));
  },
  executable: true
});

addSample(".setData", {
  html: ['<div id="myId" data-x="1"></div>'],
  javascript: function() {
    q("#myId").setData("x", 2);
    q("#myId").setHtml(q("#myId").getData("x"));
  },
  executable: true
});