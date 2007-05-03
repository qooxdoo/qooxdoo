/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

/**
 * qx.ui.core.ClientDocumentBlocker blocks the inputs from the user.
 * This will be used internally to allow better modal dialogs for example.
 *
 * @appearance blocker
 */
qx.Class.define("qx.ui.core.ClientDocumentBlocker",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.initTop();
    this.initRight();
    this.initBottom();
    this.initLeft();

    this.initZIndex();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "client-document-blocker"
    },

    zIndex :
    {
      refine : true,
      init : 1e8
    },

    top :
    {
      refine : true,
      init : 0
    },

    right :
    {
      refine : true,
      init : 0
    },

    bottom :
    {
      refine : true,
      init : 0
    },

    left :
    {
      refine : true,
      init : 0
    },

    display :
    {
      refine : true,
      init : false
    }
  }
});
