addSample(".addClass", function() {
  if (active) {
    // show loading indicator
    q('#dependency-loading-indicator').removeClass('hidden');
  } else {
    // hide loading indicator
    q('#dependency-loading-indicator').addClass('hidden');
  }
});

addSample(".addClasses", {
  html: ['<ul>',
         '  <li>item 0</li>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li class="hint">item 3</li>',
         '</ul>'],
  css: ['.hint {',
        '  color: red;',
        '}',
        '.hint.even {',
        '  color: blue;',
        '}'],
  javascript: function() {
    // remember regarding odd/even: counting begins at 0
    q("li:even").addClasses(["hint", "even"]);
  },
  executable: true
});

addSample(".getClass", {
  html: ['<ul>',
         '  <li class="first">item 1</li>',
         '  <li class="second">item 2</li>',
         '  <li>item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  javascript: function() {
    var className = q("li").getClass();
    // (className === "first")
  }
});

addSample(".getStyle", {
  html: ['<ul>',
         '  <li class="hint">item 1</li>',
         '  <li>item 2</li>',
         '  <li class="info">item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: ['.hint {',
        '  color: red;',
        '}',
        '.info {',
        '  padding: 10px;',
        '}'],
  javascript: function() {
    var collection = q("li.hint");
    var color = collection.getStyle("color");
    // (color === "rgb(255, 0, 0)")
    var paddingTop = q("li.info").getStyle("padding-top");
    // (paddingTop === "10px")
  },
  executable: true
});

addSample(".getStyles", {
  html: ['<ul>',
         '  <li class="hint">item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  css: ['.hint {',
        '  color: red;',
        '  padding-left: 10px;',
        '}'],
  javascript: function() {
    var styles = q("li").getStyles(["color", "padding-left"]);
    // styles === {"color":"rgb(255, 0, 0)", "padding-left": "10px"} => wtf :D
  },
  executable: true
});

addSample(".setStyles", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  javascript: function() {
    var stylesMap = {
      "color": "red",
      "padding-left": "10px",
      "background-color": "#ffe"
    };
    q("li").setStyles(stylesMap);
  },
  executable: true
});

addSample(".toggleClasses", {
  html: ['<ul>',
         '  <li class="selected">item 1</li>',
         '  <li class="selected">item 2</li>',
         '  <li>item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: ['.selected {',
        '  color: red;',
        '}',
        '.edited {',
        '  background-color: #ffe;',
        '}'],
  javascript: function() {
    q("li").toggleClasses(["selected", "edited"]);
  },
  executable: true
});
