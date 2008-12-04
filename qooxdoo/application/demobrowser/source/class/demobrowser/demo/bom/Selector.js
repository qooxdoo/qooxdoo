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

      console.debug("BODYs", qx.bom.Selector.query("body"));
      console.debug("H1s", qx.bom.Selector.query("h1"));
      console.debug("H2s", qx.bom.Selector.query("h2"));
      console.debug("H3s", qx.bom.Selector.query("h3"));
    }
  }
});
