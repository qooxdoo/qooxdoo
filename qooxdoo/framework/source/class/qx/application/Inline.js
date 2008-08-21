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

************************************************************************ */

/* ************************************************************************

#require(qx.core.Init)

************************************************************************ */

/**
 * For a GUI application on a traditional, HTML-dominated web page.
 *
 * The ideal environment for typical portal sites which use just a few qooxdoo
 * widgets. {qx.ui.root.Inline} can be used to embed qooxdoo widgets
 * into the page flow.
 */
qx.Class.define("qx.application.Inline",
{
  extend : qx.application.AbstractGui,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _createRootWidget : function() {
      return new qx.ui.root.Page(document);
    }
  }
});
