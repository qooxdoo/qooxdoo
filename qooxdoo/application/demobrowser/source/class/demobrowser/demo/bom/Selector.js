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
      var Selector = qx.bom.Selector;
      
      
      
      // *************
      // ** BASICS ***
      // *************

      // Some basic style changes
      Selector.query("p").setStyle("color", "red");
      Selector.query("p:eq(1)").setStyle("fontWeight", "bold").setStyle("opacity", "0.5");
      
      Selector.query("h1").setStyles({
        "textAlign" : "center",
        "textDecoration" : "underline",
        "color" : "green"
      });

      // Work with attributes
      Logger.debug("href of first link: " + Selector.query("a").getAttribute("href"));
      Selector.query("a").setAttribute("title", "Click to follow the link");
      
      // Change classes
      Selector.query("h1,h2").addClass("header");
      
      // Add some events
      Selector.query("p").addListener("click", function() { alert(this.innerHTML) });
      

        
        
        
      // **************
      // ** FINDING ***
      // **************
      
      // ADD
      
      // Work with collection
      (new qx.bom.Collection)
        .add("h2").setStyle("color", "orange")
        .add("li").setStyle("backgroundColor", "#eee")
        .end().setStyle("textAlign", "center");
              

      // CHILDREN
      
      // Select all "li" items from all ul/ol elements.
      // Yes this could be done with purely selector magic as well :)
      Logger.debug("Found " + qx.bom.Selector.query("ul,ol").children().length + " children of ul/ol elements using children().");
      
      // It is even possible to filter them
      Logger.debug("Found " + qx.bom.Selector.query("ul,ol").children(":first-child").length + " first children of ul/ol elements using children(selector)");
      
      
      // FIND

      // Fast path
      var res = qx.bom.Selector.query("ul").find("li");
      Logger.debug("Found " + res.length + " li elements in uls using find()");

      // Testing find() for complexer cases
      var res = new qx.bom.Collection(document.body).find("h1,h2");
      Logger.debug("Found " + res.length + " headers using find()");



      // ****************
      // ** FILTERING ***
      // ****************

      // EQ
        
      // Selector to collection
      Selector.query("li a").eq(1).setStyle("fontWeight", "bold");
      
    
      // FILTER
      
      // Filtering the collection using a selector
      var res = qx.bom.Selector.query("input").filter("[type=submit]");
      Logger.debug("Found " + res.length + " submit buttons using filter(selector)");
      
      // or a function
      var res = qx.bom.Selector.query("input").filter(function(item, index, array){
        return item.type === "submit";
      });
      Logger.debug("Found " + res.length + " submit button using filter(function)");
      
      
      // IS
      
      var res = qx.bom.Selector.query("ul").find("li").is(":contains('List Item 1')");
      Logger.debug("Found li element with text 'List Item 1': " + res);
      
      
      // NOT

      var res = qx.bom.Selector.query("ul").find("li").not(":contains('List Item 1')");
      Logger.debug("Number of found li elements without text 'List Item 1': " + res.length);
      
      var res = qx.bom.Selector.query("ul").find("li").not(":first-child,:last-child");
      Logger.debug("Number of found li elements in the middle: " + res.length);

    }
  }
});
