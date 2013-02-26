addSample(".addClass", {
  html: ['<ul>',
         '  <li class="pristine">item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  css: ['.pristine {',
        '  color: blue;',
        '}',
        '.edited {',
        '  color: red;',
        '}'],
  javascript: function() {
    q(":not(li.pristine)").addClass("edited");
  },
  executable: true
});

addSample(".addClasses", {
  html: ['<ul>',
         '  <li class="hint">item 0</li>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  css: ['.hint {',
        '  color: red;',
        '}',
        '.hint.odd {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    // remember regarding odd/even: counting begins at 0
    q("li:odd").addClasses(["hint", "odd"]);
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
    // styles === {"color":"rgb(255, 0, 0)",
    //             "padding-left": "10px"}
  },
  executable: true
});

addSample(".hasClass", {
  html: ['<ul>',
         '  <li class="selected">item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  css: [
        '.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    var isFirstSelected = q("li").hasClass("selected");
    // (isFirstSelected === true)
    var isLastSelected = q("li:last").hasClass("selected");
    // (isLastSelected === false)
  }
});

addSample(".hide", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li>item 3</li>',
         '</ul>'],
  javascript: function() {
    // index is 0-based
    q("li:nth(1)").hide();
  },
  executable: true
});

addSample(".removeClass", {
  html: ['<ul>',
         '  <li class="hint red">item 1</li>',
         '  <li class="red">item 2</li>',
         '  <li class="blue">item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: [
        '.hint {',
        '  background-color: #ffd;',
        '}',
        '.red {',
        '  color: red;',
        '}',
        '.blue {',
        '  color: blue;',
        '}'],
  javascript: function() {
    q("li").removeClass("red");
  },
  executable: true
});

addSample(".removeClasses", {
  html: ['<ul>',
         '  <li class="hint red">item 1</li>',
         '  <li class="red">item 2</li>',
         '  <li class="blue">item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: [
        '.hint {',
        '  background-color: #ffd;',
        '}',
        '.red {',
        '  color: red;',
        '}',
        '.blue {',
        '  color: blue;',
        '}'],
  javascript: function() {
    q("li").removeClasses(["red", "blue"]);
  },
  executable: true
});

addSample(".replaceClass", {
  html: ['<ul>',
         '  <li class="hint red">item 1</li>',
         '  <li class="red">item 2</li>',
         '  <li class="blue">item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: [
        '.hint {',
        '  background-color: #ffd;',
        '}',
        '.red {',
        '  color: red;',
        '}',
        '.blue {',
        '  color: blue;',
        '}',
        '.green {',
        '  color: green;',
        '}'],
  javascript: function() {
    q("li").replaceClass("red", "green");
  },
  executable: true
});

addSample(".setStyle", {
  html: ['<ul>',
         '  <li>item one</li>',
         '  <li>item two</li>',
         '  <li>item three</li>',
         '</ul>'],
  javascript: function() {
    q("li:contains(two)").setStyle("color", "red");
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
      "background-color": "#ffd"
    };
    q("li").setStyles(stylesMap);
  },
  executable: true
});

addSample(".toggleClass", {
  html: ['<ul>',
         '  <li class="selected">item 1</li>',
         '  <li class="selected">item 2</li>',
         '  <li>item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: ['.selected {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("li").toggleClass("selected");
  },
  executable: true
});

addSample(".show", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '  <li class="hidden">item 3</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: ['.hidden {',
        '  display: none;',
        '}'],
  javascript: function() {
    q("li:first").hide();
    q("li").show();
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
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    q("li").toggleClasses(["selected", "edited"]);
  },
  executable: true
});
