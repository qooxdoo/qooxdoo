/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Selector",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);
      
      var Logger = qx.log.Logger;
      
      
// Some wrapping for Sizzle tests
      
var test = function(name, func) 
{
  Logger.info("Testing: " + name);
  func();
};

var t = function(label, selector, ids)
{
  var res = qx.bom.Selector.query(selector);
  var resIds =[];
  
  for (var i=0, l=res.length; i<l; i++) {
    resIds.push(res[i].id)
  }
  
  var resList = resIds.join(",");
  var list = ids.join(",");
  
  var intro = resList == list ? " - OK: " : " - FAIL: ";

  Logger.info(intro + label);
  
  if (resList != list) {
    Logger.error(resList + " <-> " + list); 
  }
};


// Use some of the original Sizzle tests

test("id", function() {
	t( "ID Selector", "#body", ["body"] );
	t( "ID Selector w/ Element", "body#body", ["body"] );
	t( "ID Selector w/ Element", "ul#first", [] );
	t( "ID selector with existing ID descendant", "#firstp #simon1", ["simon1"] );
	t( "ID selector with non-existant descendant", "#firstp #foobar", [] );
	t( "ID selector using UTF8", "#台北Táiběi", ["台北Táiběi"] );
	t( "Multiple ID selectors using UTF8", "#台北Táiběi, #台北", ["台北Táiběi","台北"] );
	t( "Descendant ID selector using UTF8", "div #台北", ["台北"] );
	t( "Child ID selector using UTF8", "form > #台北", ["台北"] );
	
	t( "Escaped ID", "#foo\\:bar", ["foo:bar"] );
	t( "Escaped ID", "#test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
	t( "Descendant escaped ID", "div #foo\\:bar", ["foo:bar"] );
	t( "Descendant escaped ID", "div #test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
	t( "Child escaped ID", "form > #foo\\:bar", ["foo:bar"] );
	t( "Child escaped ID", "form > #test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
	
	t( "ID Selector, child ID present", "#form > #radio1", ["radio1"] ); // bug #267
	t( "ID Selector, not an ancestor ID", "#form #first", [] );
	t( "ID Selector, not a child ID", "#form > #option1a", [] );
	
	t( "All Children of ID", "#foo > *", ["sndp", "en", "sap"] );
	t( "All Children of ID with no children", "#firstUL > *", [] );
	
	t( "ID selector with non-existant ancestor", "#asdfasdf #foobar", [] );
});

test("class", function() {
	t( "Class Selector", ".blog", ["mark","simon"] );
	t( "Class Selector", ".blog.link", ["simon"] );
	t( "Class Selector w/ Element", "a.blog", ["mark","simon"] );
	t( "Parent Class Selector", "p .blog", ["mark","simon"] );
	
	t( "Class selector using UTF8", ".台北Táiběi", ["utf8class1"] );
	t( "Class selector using UTF8", ".台北Táiběi.台北", ["utf8class1"] );
	t( "Class selector using UTF8", ".台北Táiběi, .台北", ["utf8class1","utf8class2"] );
	t( "Descendant class selector using UTF8", "div .台北Táiběi", ["utf8class1"] );
	t( "Child class selector using UTF8", "form > .台北Táiběi", ["utf8class1"] );
	
	t( "Escaped Class", ".foo\\:bar", ["foo:bar"] );
	t( "Escaped Class", ".test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
	t( "Descendant scaped Class", "div .foo\\:bar", ["foo:bar"] );
	t( "Descendant scaped Class", "div .test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
	t( "Child escaped Class", "form > .foo\\:bar", ["foo:bar"] );
	t( "Child escaped Class", "form > .test\\.foo\\[5\\]bar", ["test.foo[5]bar"] );
});

test("name", function() {
	t( "Name selector", "input[name=action]", ["text1"] );
	t( "Name selector with single quotes", "input[name='action']", ["text1"] );
	t( "Name selector with double quotes", 'input[name="action"]', ["text1"] );

	t( "Name selector non-input", "*[name=iframe]", ["iframe"] );

	t( "Name selector for grouped input", "input[name='types[]']", ["types_all", "types_anime", "types_movie"] )
});


test("multiple", function() {
	var results = ["mark","simon","firstp","ap","sndp","en","sap","first"];
	
	if ( document.querySelectorAll ) {
		results = ["firstp","ap","mark","sndp","en","sap","simon","first"];
	}
	
	t( "Comma Support", "a.blog, p", results);
	t( "Comma Support", "a.blog , p", results);
	t( "Comma Support", "a.blog ,p", results);
	t( "Comma Support", "a.blog,p", results);
});

test("child and adjacent", function() {
	t( "Child", "p > a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child", "p> a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child", "p >a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child", "p>a", ["simon1","google","groups","mark","yahoo","simon"] );
	t( "Child w/ Class", "p > a.blog", ["mark","simon"] );
	t( "All Children", "code > *", ["anchor1","anchor2"] );
	t( "All Grandchildren", "p > * > *", ["anchor1","anchor2"] );
	t( "Adjacent", "a + a", ["groups"] );
	t( "Adjacent", "a +a", ["groups"] );
	t( "Adjacent", "a+ a", ["groups"] );
	t( "Adjacent", "a+a", ["groups"] );
	t( "Adjacent", "p + p", ["ap","en","sap"] );
	t( "Comma, Child, and Adjacent", "a + a, code > a", ["groups","anchor1","anchor2"] );

	t( "Non-existant ancestors", ".fototab > .thumbnails > a", [] );
	
	t( "First Child", "p:first-child", ["firstp","sndp"] );
	t( "Nth Child", "p:nth-child(1)", ["firstp","sndp"] );
	
	t( "Last Child", "p:last-child", ["sap"] );
	t( "Last Child", "a:last-child", ["simon1","anchor1","mark","yahoo","anchor2","simon"] );
	
	t( "Nth-child", "#main form#form > *:nth-child(2)", ["text1"] );
	t( "Nth-child", "#main form#form > :nth-child(2)", ["text1"] );

	t( "Nth-child", "#form select:first option:nth-child(3)", ["option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(0n+3)", ["option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(1n+0)", ["option1a", "option1b", "option1c", "option1d"] );
	t( "Nth-child", "#form select:first option:nth-child(1n)", ["option1a", "option1b", "option1c", "option1d"] );
	t( "Nth-child", "#form select:first option:nth-child(n)", ["option1a", "option1b", "option1c", "option1d"] );
	t( "Nth-child", "#form select:first option:nth-child(even)", ["option1b", "option1d"] );
	t( "Nth-child", "#form select:first option:nth-child(odd)", ["option1a", "option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(2n)", ["option1b", "option1d"] );
	t( "Nth-child", "#form select:first option:nth-child(2n+1)", ["option1a", "option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(3n)", ["option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(3n+1)", ["option1a", "option1d"] );
	t( "Nth-child", "#form select:first option:nth-child(3n+2)", ["option1b"] );
	t( "Nth-child", "#form select:first option:nth-child(3n+3)", ["option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(3n-1)", ["option1b"] );
	t( "Nth-child", "#form select:first option:nth-child(3n-2)", ["option1a", "option1d"] );
	t( "Nth-child", "#form select:first option:nth-child(3n-3)", ["option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(3n+0)", ["option1c"] );
	t( "Nth-child", "#form select:first option:nth-child(-n+3)", ["option1a", "option1b", "option1c"] );
});

test("attributes", function() {
	t( "Attribute Exists", "a[title]", ["google"] );
	t( "Attribute Exists", "*[title]", ["google"] );
	t( "Attribute Exists", "[title]", ["google"] );
	t( "Attribute Exists", "a[ title ]", ["google"] );
	
	t( "Attribute Equals", "a[rel='bookmark']", ["simon1"] );
	t( "Attribute Equals", 'a[rel="bookmark"]', ["simon1"] );
	t( "Attribute Equals", "a[rel=bookmark]", ["simon1"] );
	t( "Attribute Equals", "a[href='http://www.google.com/']", ["google"] );
	t( "Attribute Equals", "a[ rel = 'bookmark' ]", ["simon1"] );

	document.getElementById("anchor2").href = "#2";
	t( "href Attribute", "p a[href^=#]", ["anchor2"] );
	t( "href Attribute", "p a[href*=#]", ["simon1", "anchor2"] );

	t( "for Attribute", "form label[for]", ["label-for"] );
	t( "for Attribute in form", "#form [for=action]", ["label-for"] );
	
	var results = ["hidden1","radio1","radio2"];
	
	if ( document.querySelectorAll ) {
		results = ["radio1", "radio2", "hidden1"];
	}
	
	t( "Multiple Attribute Equals", "#form input[type='hidden'],#form input[type='radio']", results );
	t( "Multiple Attribute Equals", "#form input[type=\"hidden\"],#form input[type='radio']", results );
	t( "Multiple Attribute Equals", "#form input[type=hidden],#form input[type=radio]", results );
	
	t( "Attribute selector using UTF8", "span[lang=中文]", ["台北"] );
	
	t( "Attribute Begins With", "a[href ^= 'http://www']", ["google","yahoo"] );
	t( "Attribute Ends With", "a[href $= 'org/']", ["mark"] );
	t( "Attribute Contains", "a[href *= 'google']", ["google","groups"] );
	
	t("Select options via :selected", "#select1 option:selected", ["option1a"] );
	t("Select options via :selected", "#select2 option:selected", ["option2d"] );
	t("Select options via :selected", "#select3 option:selected", ["option3b", "option3c"] );
	
	t( "Grouped Form Elements", "input[name='foo[bar]']", ["hidden2"] );
	
	t( ":not() Existing attribute", "#form select:not([multiple])", ["select1", "select2"]);
	t( ":not() Equals attribute", "#form select:not([name=select1])", ["select2", "select3"]);
	t( ":not() Equals quoted attribute", "#form select:not([name='select1'])", ["select2", "select3"]);
});

test("pseudo (:) selectors", function() {
	t( "First Child", "p:first-child", ["firstp","sndp"] );
	t( "Last Child", "p:last-child", ["sap"] );
	t( "Only Child", "a:only-child", ["simon1","anchor1","yahoo","anchor2"] );
	t( "Empty", "ul:empty", ["firstUL"] );
	t( "Enabled UI Element", "#form input:not([type=hidden]):enabled", ["text1","radio1","radio2","check1","check2","hidden2","name"] );
	t( "Disabled UI Element", "#form input:disabled", ["text2"] );
	t( "Checked UI Element", "#form input:checked", ["radio2","check1"] );
	t( "Selected Option Element", "#form option:selected", ["option1a","option2d","option3b","option3c"] );
	t( "Text Contains", "a:contains('Google')", ["google","groups"] );
	t( "Text Contains", "a:contains('Google Groups')", ["groups"] );
	t( "Element Preceded By", "p ~ div", ["foo","fx-queue","fx-tests", "moretests","tabindex-tests"] );
	t( "Not", "a.blog:not(.link)", ["mark"] );
	t( "Not - multiple", "#form option:not(:contains('Nothing'),#option1b,:selected)", ["option1c", "option1d", "option2b", "option2c", "option3d", "option3e"] );
	t( "Not - recursive", "#form option:not(:not(:selected))[id^='option3']", [ "option3b", "option3c"] );
	
	t( "nth Element", "p:nth(1)", ["ap"] );
	t( "First Element", "p:first", ["firstp"] );
	t( "Last Element", "p:last", ["first"] );
	t( "Even Elements", "p:even", ["firstp","sndp","sap"] );
	t( "Odd Elements", "p:odd", ["ap","en","first"] );
	t( "Position Equals", "p:eq(1)", ["ap"] );
	t( "Position Greater Than", "p:gt(0)", ["ap","sndp","en","sap","first"] );
	t( "Position Less Than", "p:lt(3)", ["firstp","ap","sndp"] );
	t( "Is A Parent", "p:parent", ["firstp","ap","sndp","en","sap","first"] );
	
	t( "Form element :input", "#form :input", ["text1", "text2", "radio1", "radio2", "check1", "check2", "hidden1", "hidden2", "name", "button", "area1", "select1", "select2", "select3"] );
	t( "Form element :radio", "#form :radio", ["radio1", "radio2"] );
	t( "Form element :checkbox", "#form :checkbox", ["check1", "check2"] );
	t( "Form element :text", "#form :text", ["text1", "text2", "hidden2", "name"] );
	t( "Form element :radio:checked", "#form :radio:checked", ["radio2"] );
	t( "Form element :checkbox:checked", "#form :checkbox:checked", ["check1"] );
	t( "Form element :checkbox:checked, :radio:checked", "#form :checkbox:checked, #form :radio:checked", ["check1", "radio2"] );

	t( "Headers", ":header", ["header", "banner", "userAgent"] );
	t( "Has Children - :has()", "p:has(a)", ["firstp","ap","en","sap"] );
});
    }
  }
});
