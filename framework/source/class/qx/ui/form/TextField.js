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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The TextField is a single-line text input field.
 */
qx.Class.define("qx.ui.form.TextField",
{
  extend : qx.ui.form.AbstractField,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Maximum number of characters in the text field. */
    maxLength :
    {
      check : "Integer",
      apply : "_applyMaxLength",
      nullable : true
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "textfield"
    },

    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    },

    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** The input event is fired on every keystroke modifying the value of the field */
    "input" : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the input element. Derived classes may override this
     * method, to create different input elements.
     *
     * @return {qx.html.Input} a new input element.
     */
    _createInputElement : function()
    {
      var input = new qx.html.Input("text");
      input.addListener("input", this._onHtmlInput, this);
      return input;
    },


    /**
     * Event listener for native input events. Redirects the event
     * to the widget.
     *
     * @param e {qx.event.type.Data} Input event
     */
    _onHtmlInput : function(e) {
      this.fireDataEvent("input", e.getData());
    },





    /*
    ---------------------------------------------------------------------------
      TEXTFIELD API
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaxLength : function(value, old) {
      this.getContentElement().setAttribute("maxLength", value == null ? "" : value);
    }
  }
});
