/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/flash/fo_tester.swf)

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Flash",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var domElement = qx.dom.Element.create("div");
      qx.bom.element.Style.set(domElement, "position", "absolute");
      qx.bom.element.Style.set(domElement, "top", "20px");
      qx.bom.element.Style.set(domElement, "bottom", "20px");
      qx.bom.element.Style.set(domElement, "right", "20px");
      qx.bom.element.Style.set(domElement, "left", "20px");
      document.body.appendChild(domElement);

      var movieUri = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/flash/fo_tester.swf");

      var variables = {
        flashVarText: "this is passed in via FlashVars"
      };

      var params = {
        bgcolor: "#FF6600",
        scale: "noscale",
        wmode: "opaque"
      };

      qx.bom.Flash.create(domElement, { movie : movieUri, id : "movie" }, variables, params);
    }
  }
});
