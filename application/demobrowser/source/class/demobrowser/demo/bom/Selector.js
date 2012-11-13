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
#require(qx.module.Core)
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
     * @lint ignoreDeprecated(alert)
     */
    main: function()
    {
      this.base(arguments);

      var Logger = qx.log.Logger;

      // *************
      // ** BASICS ***
      // *************

      // Some basic style changes
      q("p").setStyle("color", "red");
      q("p:eq(1)").setStyle("fontWeight", "bold").setStyle("opacity", "0.5");

      q("h1").setStyles({
        "textAlign" : "center",
        "textDecoration" : "underline",
        "color" : "green"
      });

      // Work with attributes
      Logger.debug("href of first link: " + q("a").getAttribute("href"));
      q("a").setAttribute("title", "Click to follow the link");

      // Change classes
      q("h1,h2").addClass("header");

      // Add some events
      q("p").on("click", function() { alert(this.innerHTML) });





      // *************************
      // ** TRAVERSAL: FINDING ***
      // *************************

      // ADD

      // Work with collection
      q().concat(q("h2")).setStyle("color", "orange")
        .concat(q("li")).setStyle("backgroundColor", "#eee");


      // CHILDREN

      // Select all "li" items from all ul/ol elements.
      // Yes this could be done with purely selector magic as well :)
      Logger.debug("Found " + q("ul,ol").getChildren().length + " children of ul/ol elements using children().");

      // It is even possible to filter them
      Logger.debug("Found " + q("ul,ol").getChildren(":first-child").length + " first children of ul/ol elements using children(selector)");


      // CLOSEST

      // All even 'li' elements and their next ul or ol parent
      // Do not make a lot of sense using this way, though
      Logger.debug("Number of ul/ol elements which are closest to a li element: " + q("li").getClosest("ul,ol").length);


      // CONTENTS

      // Detect children number (incl. text nodes)
      Logger.debug("Number of child nodes of the body: " + q(document.body).getContents().length);


      // FIND

      // Fast path
      var res = q("ul").find("li");
      Logger.debug("Found " + res.length + " li elements in uls using find()");

      // Testing find() for complexer cases
      var res = q(document.body).find("h1,h2");
      Logger.debug("Found " + res.length + " headers using find()");


      // NEXT

      var res = q("ul").getNext()[0].tagName;
      Logger.debug("Tag following the UL element: " + res)


      // NEXT ALL

      var res = q("ul").getNextAll().length;
      Logger.debug("Number of elements following the UL: " + res);


      // PARENT

      var res = q("li").getParents().length;
      Logger.debug("Number of parent elements of all li elems: " + res);


      // PARENTS

      var res = q("input[type=submit]").getAncestors().length;
      Logger.debug("Number of all parent elements of the submit button: " + res);


      // PREV

      var res = q("ul").getPrev()[0].tagName;
      Logger.debug("Tag before the UL element: " + res)


      // PREV ALL

      var res = q("ul").getPrevAll().length;
      Logger.debug("Number of elements preceding the UL: " + res);


      // SIBLINGS

      var res = q("ul li:contains('List Item 3')").getSiblings().length;
      Logger.debug("List Item 3 has " + res + " siblings");




      // ************************
      // ** TRAVERSAL: OFFSET ***
      // ************************

      // OFFSET PARENT
      var res = q("select").getOffsetParent()[0].tagName;
      Logger.debug("Offset parent of select box: " + res);


      // OFFSET
      var res = q("select").getOffset();
      Logger.debug("Offset of select box: ");
      Logger.debug(res);



      // ***************************
      // ** TRAVERSAL: FILTERING ***
      // ***************************

      // EQ

      // Select the second element from the collection
      q("li a").eq(1).setStyle("fontWeight", "bold");


      // FILTER

      // Filtering the collection using a selector
      var res = q("input").filter("[type=submit]");
      Logger.debug("Found " + res.length + " submit buttons using filter(selector)");

      // or a function
      var res = q("input").filter(function(item, index, array){
        return item.type === "submit";
      });
      Logger.debug("Found " + res.length + " submit button using filter(function)");


      // HASCLASS

      var res = q("h2").hasClass("form");
      Logger.debug("Any H2 with form has a class 'form': " + res);


      // IS

      var res = q("ul").find("li").is(":contains('List Item 1')");
      Logger.debug("Found li element with text 'List Item 1': " + res);


      // NOT

      var res = q("ul").find("li").not(":contains('List Item 1')");
      Logger.debug("Number of found li elements without text 'List Item 1': " + res.length);

      var res = q("ul").find("li").not(":first-child,:last-child");
      Logger.debug("Number of found li elements in the middle: " + res.length);




      // **********************************
      // ** MANIPULATION: INSERT INSIDE ***
      // **********************************
      q("ul,ol").append("<li>inserted via append()</li>");


      // ***********************************
      // ** MANIPULATION: INSERT OUTSIDE ***
      // ***********************************

      q("li:first-child").after("<li>inserted via after()</li>");
      q("li:last-child").before("<li>inserted via before()</li>");

      var select = document.createElement("select");
      var label = document.createElement("label");

      q(select).setAttribute("id", "field-title").setAttribute("name", "title");
      q(label).setAttribute("for", "field-title").setAttribute("text", " Title ");

      q("select").after(select).after(label);

      q.create("<option>Mr</option><option>Mrs</option><option>Dr</option><option>Prof</option>").appendTo(select);

      // testing noConflict alias
      qxWeb.create("<h3>Dynamically Inserted H3</h3>").insertAfter("h2");





      // **************************
      // ** MANIPULATION: CLONE ***
      // **************************

      q("#field-mail").on("input", function() {
        Logger.debug("Typing in e-mail field...");
      });

      var field = q("#field-mail");
      var entry = field.add(q("label[for=field-mail]")[0]).reverse();
      field.after(entry.clone(true));




      // *************************************
      // ** MANIPULATION: INSERTING AROUND ***
      // *************************************

      q("#detail1,#detail2,#detail3").wrap("<b></b>");

      q("#detail2").wrap('<div style="background:#FFFFBB"></div>');
    }
  }
});
