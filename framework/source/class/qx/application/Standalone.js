/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * For a GUI application that looks & feels like native desktop application
 * (often called "RIA" - Rich Internet Application).
 *
 * Such a stand-alone application typically creates and updates all content
 * dynamically. Often it is called a "single-page application", since the
 * document itself is never reloaded or changed. Communication with the server
 * is done with AJAX.
 *
 * @require(qx.core.Init)
 */
qx.Class.define("qx.application.Standalone", {
  extend : qx.application.AbstractGui,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _createRootWidget : function() {
      return new qx.ui.root.Application(document);
    }
  }
});
