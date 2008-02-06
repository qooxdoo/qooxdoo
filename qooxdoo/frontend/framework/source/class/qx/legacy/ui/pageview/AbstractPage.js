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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

qx.Class.define("qx.ui.pageview.AbstractPage",
{
  type : "abstract",
  extend : qx.ui.layout.CanvasLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vButton)
  {
    this.base(arguments);

    if (vButton !== undefined) {
      this.setButton(vButton);
    }

    this.initTop();
    this.initRight();
    this.initBottom();
    this.initLeft();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
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

    /**
     * Make element displayed (if switched to true the widget will be created, if needed, too).
     *  Instead of qx.ui.core.Widget, the default is false here.
     */
    display :
    {
      refine: true,
      init : false
    },


    /** The attached tab of this page. */
    button :
    {
      check : "qx.ui.pageview.AbstractButton",
      apply : "_applyButton"
    }
  },




  /*
  *****************************************************************************
     APPLY ROUTINES
  *****************************************************************************
  */

  members :
  {
    _applyButton : function(value, old)
    {
      if (old) {
        old.setPage(null);
      }

      if (value) {
        value.setPage(this);
      }
    }
  }
});
