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

/**
 * @appearance text-area
 */
qx.Class.define("qx.ui.form.TextArea",
{
  extend : qx.ui.form.TextField,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(value)
  {
    this.base(arguments, value);
    this.initWrap();
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Controls whether text wrap is activated or not. */
    wrap :
    {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
    },

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
    _createInputElement : function()
    {
      var input = new qx.html.Input("textarea");
      input.setStyle("overflow", "hidden");
      return input;
    },



    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyWrap : function(value, old) {
      this._contentElement.setWrap(value);
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getContentHint : function()
    {
      var hint = this.base(arguments);
      // four lines by default
      hint.height = hint.height * 4;

      return hint;
    }
  }
});
