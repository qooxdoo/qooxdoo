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

************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.Iframe",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var iframe = qx.bom.Iframe.create({
        name : "testFrame",
        src : "http://www.qooxdoo.org"
      });

      qx.bom.Element.addListener(iframe, "load", function(e) {
        this.debug("Content loaded.");
      }, this);

      document.body.appendChild(iframe);

      /*
       * Due to a very strange bug in Opera 9.6 and higher, iframes are not
       * rendered if they have no width and height and the HTML page does not
       * get rendered again after inserting the iframe.
       * So we just change a small piece of content on this page:
       */
      document.getElementById("dummy").innerHTML = "";
    }
  }
});
