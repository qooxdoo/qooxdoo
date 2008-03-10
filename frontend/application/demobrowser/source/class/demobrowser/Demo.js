/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Basic demo application
 */
qx.Class.define("demobrowser.Demo",
{
  extend : qx.application.Abstract,


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    __initTitle : function()
    {
      var splits = location.href.split("/");
      var length = splits.length;
      var div = " " + String.fromCharCode(187) + " ";
      var category = splits[length-2].toUpperCase();
      var file = splits[length-1].replace(".html", "").replace("_", " ");

      document.title = "qooxdoo" + div + "Demo Browser" + div + category + div + file;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    main : function()
    {
      this.base(arguments);

      // if the current frame is the top frame
      if(window.top == window) {
        this.__showSourceLink();
      }

      var text = "*{margin:0;padding:0} html,body{font:11px Verdana,sans-serif;}";
      qx.bom.Stylesheet.createElement(text);
    },

    __showSourceLink: function() {
      // create a dvi
      div = qx.bom.Element.create("div");
      // set the css
      qx.bom.element.Style.setCss(div, "position: absolute; top: 0; right: 0; z-index: 5000; padding: 5px");
      // create the URI to the source script
      var jsFileURL = "../../script/" + this.constructor.classname + ".src.js";
      // set the link
      div.innerHTML ="<a href='" + jsFileURL + "' target='_blank'>Show Javascript Source</a>";
      // append the div to the document
      document.body.appendChild(div);
    }
  },



  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : { "demobrowser.resourceUri" : "../../resource" },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__initTitle();
  }
});
