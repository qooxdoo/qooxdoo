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

addSample(".setAttributes", {
  html: ['<div id="container"></div>'],
  javascript: function() {var input = q.create('<input type="text"></input>');
input.setAttributes({
  value: 'foo',
  placeholder: 'Search ...',
  name: 'searchBox',
  tabIndex: 5,
  style: 'color:red'
});
input.appendTo('#container');
},
  executable: true
});

addSample(".removeAttribute", {
  html: ['<p class="foo">Foo</p>',
         '<p class="bar">Bar</p>',
         '<p class="foo bar">Foo Bar</p>'],
  css: ['.foo {color: red;}',
        '.bar {font-weight: bold;}'],
  javascript: function() {
    // remove the 'class' attribute from all p elements
    q("p").removeAttribute("class");
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
