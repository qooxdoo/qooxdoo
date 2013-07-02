addSample(".placeTo", {
  html: ['<div id="target">',
         '  Test',
         '</div>',
         '<div id="popup">Popup</div>'],
  css : ['div {',
         '  position: absolute;',
         '  background-color: #ddd;',
         '  padding: 5px;',
         '}',
         '',
         '#popup {',
         '  background-color: red;',
         '}'],
  javascript: function() {
    q("#popup").placeTo("#target", "right-top", {left: 10});
  },
  executable: true
});