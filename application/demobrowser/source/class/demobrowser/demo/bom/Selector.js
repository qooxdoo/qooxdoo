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

/* ************************************************************************
#ignore($)
************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Selector",
{
  extend : qx.application.Native,

  members :
  {
    /**
     * @lint ignoreUndefined($)
     * @lint ignoreDeprecated(alert)
     */
    main: function()
    {
      this.base(arguments);

      var Logger = qx.log.Logger;
      var Collection = qx.bom.Collection;



      // *************
      // ** BASICS ***
      // *************

      // Some basic style changes
      Collection.query("p").setStyle("color", "red");
      Collection.query("p:eq(1)").setStyle("fontWeight", "bold").setStyle("opacity", "0.5");

      Collection.query("h1").setStyles({
        "textAlign" : "center",
        "textDecoration" : "underline",
        "color" : "green"
      });

      // Work with attributes
      Logger.debug("href of first link: " + Collection.query("a").getAttribute("href"));
      Collection.query("a").setAttribute("title", "Click to follow the link");

      // Change classes
      Collection.query("h1,h2").addClass("header");

      // Add some events
      Collection.query("p").addListener("click", function() { alert(this.innerHTML) });





      // *************************
      // ** TRAVERSAL: FINDING ***
      // *************************

      // ADD

      // Work with collection
      (new qx.bom.Collection)
        .add("h2").setStyle("color", "orange")
        .add("li").setStyle("backgroundColor", "#eee")
        .end().setStyle("textAlign", "center");


      // CHILDREN

      // Select all "li" items from all ul/ol elements.
      // Yes this could be done with purely selector magic as well :)
      Logger.debug("Found " + qx.bom.Collection.query("ul,ol").children().length + " children of ul/ol elements using children().");

      // It is even possible to filter them
      Logger.debug("Found " + qx.bom.Collection.query("ul,ol").children(":first-child").length + " first children of ul/ol elements using children(selector)");


      // CLOSEST

      // All even 'li' elements and their next ul or ol parent
      // Do not make a lot of sense using this way, though
      Logger.debug("Number of ul/ol elements which are closest to a li element: " + qx.bom.Collection.query("li").closest("ul,ol").length);


      // CONTENTS

      // Detect children number (incl. text nodes)
      Logger.debug("Number of child nodes of the body: " + new qx.bom.Collection(document.body).contents().length);


      // FIND

      // Fast path
      var res = qx.bom.Collection.query("ul").find("li");
      Logger.debug("Found " + res.length + " li elements in uls using find()");

      // Testing find() for complexer cases
      var res = new qx.bom.Collection(document.body).find("h1,h2");
      Logger.debug("Found " + res.length + " headers using find()");


      // NEXT

      var res = qx.bom.Collection.query("ul").next()[0].tagName;
      Logger.debug("Tag following the UL element: " + res)


      // NEXT ALL

      var res = qx.bom.Collection.query("ul").nextAll().length;
      Logger.debug("Number of elements following the UL: " + res);


      // PARENT

      var res = qx.bom.Collection.query("li").parent().length;
      Logger.debug("Number of parent elements of all li elems: " + res);


      // PARENTS

      var res = qx.bom.Collection.query("input[type=submit]").parents().length;
      Logger.debug("Number of all parent elements of the submit button: " + res);


      // PREV

      var res = qx.bom.Collection.query("ul").prev()[0].tagName;
      Logger.debug("Tag before the UL element: " + res)


      // PREV ALL

      var res = qx.bom.Collection.query("ul").prevAll().length;
      Logger.debug("Number of elements preceding the UL: " + res);


      // SIBLINGS

      var res = qx.bom.Collection.query("ul li:contains('List Item 3')").siblings().length;
      Logger.debug("List Item 3 has " + res + " siblings");




      // ************************
      // ** TRAVERSAL: OFFSET ***
      // ************************

      // OFFSET PARENT
      var res = qx.bom.Collection.query("select").getOffsetParent()[0].tagName;
      Logger.debug("Offset parent of select box: " + res);


      // OFFSET
      var res = qx.bom.Collection.query("select").getOffset();
      Logger.debug("Offset of select box: ");
      Logger.debug(res);



      // ***************************
      // ** TRAVERSAL: FILTERING ***
      // ***************************

      // EQ

      // Select the second element from the collection
      Collection.query("li a").eq(1).setStyle("fontWeight", "bold");


      // FILTER

      // Filtering the collection using a selector
      var res = qx.bom.Collection.query("input").filter("[type=submit]");
      Logger.debug("Found " + res.length + " submit buttons using filter(selector)");

      // or a function
      var res = qx.bom.Collection.query("input").filter(function(item, index, array){
        return item.type === "submit";
      });
      Logger.debug("Found " + res.length + " submit button using filter(function)");


      // HASCLASS

      var res = qx.bom.Collection.query("h2").hasClass("form");
      Logger.debug("Any H2 with form has a class 'form': " + res);


      // IS

      var res = qx.bom.Collection.query("ul").find("li").is(":contains('List Item 1')");
      Logger.debug("Found li element with text 'List Item 1': " + res);


      // NOT

      var res = qx.bom.Collection.query("ul").find("li").not(":contains('List Item 1')");
      Logger.debug("Number of found li elements without text 'List Item 1': " + res.length);

      var res = qx.bom.Collection.query("ul").find("li").not(":first-child,:last-child");
      Logger.debug("Number of found li elements in the middle: " + res.length);




      // **********************************
      // ** MANIPULATION: INSERT INSIDE ***
      // **********************************

      qx.bom.Collection.query("ul,ol").append("<li>inserted via append()</li>");
      qx.bom.Collection.query("ul,ol").prepend("<li>inserted via prepend()</li>");

      qx.bom.Collection.query("ul").append("<script type='text/javascript'>qx.log.Logger.debug('Globally executed script');</script>");

      // Testing appendTo() with multiple targets
      // qx.bom.Collection.query("select[name=title],label[for=field-title]").appendTo("ul>li","ol>li");



      // ***********************************
      // ** MANIPULATION: INSERT OUTSIDE ***
      // ***********************************

      qx.bom.Collection.query("li:first-child").after("<li>inserted via after()</li>");
      qx.bom.Collection.query("li:last-child").before("<li>inserted via before()</li>");

      var select = document.createElement("select");
      var label = document.createElement("label");

      var selectCol = new qx.bom.Collection(select).setAttribute("id", "field-title").setAttribute("name", "title");
      new qx.bom.Collection(label).setAttribute("for", "field-title").setAttribute("text", " Title ");

      qx.bom.Collection.query("select").after(label, select);

      selectCol.append("<option>Mr</option>","<option>Mrs</option>","<option>Dr</option>", "<option>Prof</option>");

      // testing jQuery alias
      $("<h3>Dynamically Inserted H3</h3>").insertAfter("h2");





      // **************************
      // ** MANIPULATION: CLONE ***
      // **************************

      qx.bom.Collection.id("field-mail").addListener("input", function() {
        Logger.debug("Typing in e-mail field...");
      });

      var field = qx.bom.Collection.id("field-mail");
      var entry = field.add("label[for=field-mail]").reverse();
      field.after(entry.clone(true));




      // *************************************
      // ** MANIPULATION: INSERTING AROUND ***
      // *************************************

      qx.bom.Collection.query("#detail1,#detail2,#detail3").
        wrapAll('<div style="border:2px solid red"><div style="border:2px solid blue"></div></div>');

      qx.bom.Collection.query("#detail1,#detail2,#detail3").wrapInner("<b></b>");

      qx.bom.Collection.query("#detail2").wrap('<div style="background:#FFFFBB"></div>');
    }
  }
});
