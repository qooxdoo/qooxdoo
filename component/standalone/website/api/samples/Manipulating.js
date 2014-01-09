addSample("q.create", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 4</li>',
         '</ul>'],
  css: ['.new {',
        '  color: red;',
        '}'],
  javascript: function() {
    var items = '<li class="new">item 2</li><li class="new">item 3</li>';
    q.create(items).insertAfter("li:first");
  },
  executable: true
});

addSample("q.create", function() {
  // won't work as expected - the result will only contain the 'title' element
  var headElement = q.create('<head><title>My title</title></head>');

  // better approach is to use
  var headElement = q.create('<head>').append('<title>My title</title>');
});

addSample(".after", {
  html: ['<ul id="move-pool">',
         '  <li>staying 1</li>',
         '  <li class="moveable">move-me 1</li>',
         '  <li class="moveable">move-me 2</li>',
         '  <li>staying 2</li>',
         '</ul>',
         '<ul id="target">',
         '  <li>target 1</li>',
         '  <li>target 2</li>',
         '</ul>'],
  css: ['#move-pool {',
        '  background-color: #dff;',
        '  margin-bottom: 15px;',
        '}',
        '#target {',
        '  background-color: #ffd;',
        '}',
        '.moveable {',
        '  color: red;',
        '}'],
  javascript: function() {
    // existing elements get relocated (not cloned!)
    q("#target li").after(q(".moveable"));

    // same as:
    // q(".moveable").insertAfter(q("#target li"));
  },
  executable: true
});

addSample(".after", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  css: ['.created {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("li").after('<li class="created">new item</li>');
  },
  executable: true
});

addSample(".append", {
  html: ['<ul>',
         '  <li class="moveable">move-me</li>',
         '</ul>',
         '<ul id="target">',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  css: ['.moveable {',
        '  color: red;',
        '}'],
  javascript: function() {
    // existing elements get relocated (not cloned!)
    q("#target").append(q(".moveable"));
    // note: the first <ul>-elem still exists (now empty)

    // same as:
    // q(".moveable").appendTo(q("#target"));
  },
  executable: true
});

addSample(".append", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    q("ul").append('<li>item 3</li>');

    // same as:
    // q.create('<li>item 3</li>').appendTo("ul");
  },
  executable: true
});

addSample(".appendTo", {
  html: ['<ul>',
         '  <li class="moveable">move-me</li>',
         '</ul>',
         '<ul id="target">',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  css: ['.moveable {',
        '  color: red;',
        '}'],
  javascript: function() {
    // existing elements get relocated (not cloned!)
    q(".moveable").appendTo(q("#target"));
    // note: the first <ul>-elem still exists (now empty)

    // same as:
    // q("#target").append(q(".moveable"));
  },
  executable: true
});

addSample(".appendTo", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    q.create('<li>item 3</li>').appendTo("ul");

    // same as:
    // q("ul").append('<li>item 3</li>');
  },
  executable: true
});

addSample(".before", {
  html: ['<ul id="move-pool">',
         '  <li>staying 1</li>',
         '  <li class="moveable">move-me 1</li>',
         '  <li class="moveable">move-me 2</li>',
         '  <li>staying 2</li>',
         '</ul>',
         '<ul id="target">',
         '  <li>target 1</li>',
         '  <li>target 2</li>',
         '</ul>'],
  css: ['#move-pool {',
        '  background-color: #dff;',
        '  margin-bottom: 15px;',
        '}',
        '#target {',
        '  background-color: #ffd;',
        '}',
        '.moveable {',
        '  color: red;',
        '}'],
  javascript: function() {
    // existing elements get relocated (not cloned!)
    q("#target li").before(q(".moveable"));
  },
  executable: true
});

addSample(".before", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  css: ['.created {',
        '  color: red;',
        '}'],
  javascript: function() {
    q("li").before('<li class="created">new item</li>');
  },
  executable: true
});

addSample(".blur", {
  html: ['<form action="#">',
         '  <div class="row">',
         '    <label for="name">name</label>',
         '    <input id="name" type="text" />',
         '  </div>',
         '  <div class="row">',
         '    <label for="password">password</label>',
         '    <input id="password" type="text" />',
         '  </div>',
         '</form>'],
  javascript: function() {
    // :first is default - being explicit here
    q("input:first").focus();

    // blur focus after 3sec
    setTimeout(function() {
      q("input:first").blur();
    }, 3000);
  },
  executable: true
});

addSample(".clone", {
  html: ['<ul id="clone-pool">',
         '  <li class="cloneable">clone-me 1</li>',
         '  <li class="cloneable">clone-me 2</li>',
         '</ul>',
         '<ul id="target">',
         '  <li>target 1</li>',
         '  <li>target 2</li>',
         '</ul>'],
  css: ['#clone-pool {',
        '  background-color: #dff;',
        '  margin-bottom: 15px;',
        '}',
        '#target {',
        '  background-color: #ffd;',
        '}',
        '.cloneable {',
        '  color: red;',
        '}'],
  javascript: function() {
    // caution: ids would be copied, too!
    q(".cloneable").clone().appendTo(q("#target"));
  },
  executable: true
});

addSample(".empty", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <ul id="remove-my-children">',
         '    <li>item 1</li>',
         '    <li>item 2</li>',
         '  </ul>',
         '  <p>para 2</p>',
         '</div>'],
  javascript: function() {
    q("#remove-my-children").empty();

    // see .remove() if <ul>-elem should not stay
  },
  executable: true
});

addSample(".focus", {
  html: ['<form action="#">',
         '  <div class="row">',
         '    <label for="name">name</label>',
         '    <input id="name" type="text" />',
         '  </div>',
         '  <div class="row">',
         '    <label for="password">password</label>',
         '    <input id="password" type="text" />',
         '  </div>',
         '</form>'],
  javascript: function() {
    // :first is default - being explicit here
    q("input:first").focus();
  },
  executable: true
});

addSample(".getScrollTop", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var scrollTop = q("li:last").getScrollTop();
    // (scrollTop === 0)
  },
  executable: true
});

addSample(".getScrollLeft", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  javascript: function() {
    var scrollLeft = q("li:last").getScrollLeft();
    // (scrollLeft === 0)
  },
  executable: true
});

addSample(".insertAfter", {
  html: ['<ul id="move-pool">',
         '  <li>staying 1</li>',
         '  <li class="moveable">move-me 1</li>',
         '  <li class="moveable">move-me 2</li>',
         '  <li>staying 2</li>',
         '</ul>',
         '<ul id="target">',
         '  <li>target 1</li>',
         '  <li>target 2</li>',
         '</ul>'],
  css: ['#move-pool {',
        '  background-color: #dff;',
        '  margin-bottom: 15px;',
        '}',
        '#target {',
        '  background-color: #ffd;',
        '}',
        '.moveable {',
        '  color: red;',
        '}'],
  javascript: function() {
    // existing elements get relocated (not cloned!)
    q(".moveable").insertAfter(q("#target li:last"));

    // same as:
    // q("#target li:last").after(q(".moveable"));
  },
  executable: true
});

addSample(".insertBefore", {
  html: ['<ul id="move-pool">',
         '  <li>staying 1</li>',
         '  <li class="moveable">move-me 1</li>',
         '  <li class="moveable">move-me 2</li>',
         '  <li>staying 2</li>',
         '</ul>',
         '<ul id="target">',
         '  <li>target 1</li>',
         '  <li>target 2</li>',
         '</ul>'],
  css: ['#move-pool {',
        '  background-color: #dff;',
        '  margin-bottom: 15px;',
        '}',
        '#target {',
        '  background-color: #ffd;',
        '}',
        '.moveable {',
        '  color: red;',
        '}'],
  javascript: function() {
    // existing elements get relocated (not cloned!)
    q(".moveable").insertBefore(q("#target li:first"));

    // same as:
    // q("#target li:first").before(q(".moveable"));
  },
  executable: true
});

addSample(".remove", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <ul id="remove-me-and-my-children">',
         '    <li>item 1</li>',
         '    <li>item 2</li>',
         '  </ul>',
         '  <p>para 2</p>',
         '</div>'],
  javascript: function() {
    q("#remove-me-and-my-children").remove();

    // see .empty() if <ul>-elem should stay
  },
  executable: true
});

addSample(".setScrollTop", {
  html: ['<ul>',
         '  <li>item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  css: ['ul {',
       '  border: 1px solid #ddd;',
       '  width: 200px;',
       '  height: 100px;',
       '  overflow: auto;',
       ' }',
       'li {',
       '  width:400px;',
       '  height:100px;',
       '}'],
  javascript: function() {
    q("ul").setScrollTop(70);
  },
  executable: true
});

addSample(".setScrollLeft", {
  html: ['<ul>',
         '  <li>a veeeeeeeeeeery long item 1</li>',
         '  <li>item 2</li>',
         '</ul>'],
  css: ['ul {',
       '  border: 1px solid #ddd;',
       '  width: 200px;',
       '  height: 100px;',
       '  overflow: auto;',
       ' }',
       'li {',
       '  width:400px;',
       '  height:100px;',
       '}'],
  javascript: function() {
    q("ul").setScrollLeft(50);
  },
  executable: true
});

addSample(".wrap", {
  html: ['<div>',
         '  <p>para 1</p>',
         '  <!-- <div class="wrapper"> -->',
         '    <p>para 2</p>',
         '  <!-- </div> -->',
         '  <!-- <div class="wrapper"> -->',
         '    <p>para 3</p>',
         '  <!-- </div> -->',
         '  <p>para 4</p>',
         '</div>'],
  css: ['div .wrapper p {',
        '  background-color: #dff;',
        '}',
        'div p {',
        '  background-color: #ffd;',
        '}'],
  javascript: function() {
    q("p").slice(1,3).wrap('<div class="wrapper">');
  },
  executable: true
});
