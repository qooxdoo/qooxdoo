addSample(".scale", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").scale(3);
  },
  executable: true
});

addSample(".skew", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").skew("30deg");
  },
  executable: true
});

addSample(".rotate", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  css : ['div {',
         'position: absolute;',
         '}'],
  javascript: function() {
    q("#myId").rotate(["30deg", "20deg", "10deg"]); // X, Y, Z
  },
  executable: true
});

addSample(".translate", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").translate(["10px", "20px"]); // X, Y
  },
  executable: true
});

addSample(".transform", {
  html: ['<div id="myId">',
         '  Test',
         '</div>'],
  javascript: function() {
    q("#myId").transform({skew: "10deg", rotate: "-10deg"});
  },
  executable: true
});