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
 * Shared code for typical demo applications
 */
qx.Mixin.define("demobrowser.MDemoApplication",
{
  members :
  {
    initDemo : function()
    {
      this.__updateTitle();
      this.__insertSourceLink();
    },


    __updateTitle : function()
    {
      var splits = location.href.split("/");
      var length = splits.length;
      var div = " " + String.fromCharCode(187) + " ";
      var category = splits[length-2].toUpperCase();
      var file = splits[length-1].replace(".html", "").replace("_", " ");

      document.title = "qooxdoo" + div + "Demo Browser" + div + category + div + file;
    },

    __insertSourceLink : function()
    {
      // if the current frame is the top frame
      if(window.top == window)
      {
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
    }
  }
});
