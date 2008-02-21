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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      this.base(arguments);

      var splits = location.href.split("/");
      var length = splits.length;
      var div = " " + String.fromCharCode(187) + " ";
      var category = splits[length-2].toUpperCase();
      var file = splits[length-1].replace(".html", "").replace("_", " ");

      document.title = "qooxdoo" + div + "Demo Browser" + div + category + div + file;
    }
  }
});
