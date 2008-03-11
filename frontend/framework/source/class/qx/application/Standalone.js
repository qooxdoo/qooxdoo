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
 * Base class for all GUI applications which should be used
 * without fundamental parts of HTML code e.g. like an real
 * native application. A standalone application normally
 * creates all content dynamically and is normally executed for
 * more than 15 minutes (updates happen through AJAX).
 */
qx.Class.define("qx.application.Standalone",
{
  extend : qx.application.AbstractGui,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _createRootWidget : function()
    {
      return new qx.ui.root.Application(document);
    }
  }
});
