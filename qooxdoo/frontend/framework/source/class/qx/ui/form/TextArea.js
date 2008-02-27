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

#module(ui_form)

************************************************************************ */

/**
 * @appearance text-area
 */
qx.Class.define("qx.ui.form.TextArea",
{
  extend : qx.ui.form.TextField,





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
      init : "text-area"
    },

    allowGrowY :
    {
      refine : true,
      init : true
    },

    allowShrinkY :
    {
      refine : true,
      init : true
    },

    spellCheck :
    {
      refine : true,
      init : true
    },


    /**
     * Controls whether text wrap is activated or not.
     * This property uses the style property "wrap" (IE) respectively "whiteSpace"
     */
    wrap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _createInputElement : function() {
      return new qx.html.Input("textarea");
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    _applyWrap : function(value, old) {
      //this._contentElement.setWrap(value);
    },



    /*
    ---------------------------------------------------------------------------
      LAYOUT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      // TODO: Needs preloader implementation
      return {
        width : 120,
        minWidth : 0,
        maxWidth : Infinity,
        height : 60,
        minHeight : 0,
        maxHeight : Infinity
      };
    }

  }
});
