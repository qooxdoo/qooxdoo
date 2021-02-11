/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The Radio button for mobile.
 *
 * *Example*
 *
 * <pre class='javascript'>
 *    var form = new qx.ui.mobile.form.Form();
 *
 *    var radio1 = new qx.ui.mobile.form.RadioButton();
 *    var radio2 = new qx.ui.mobile.form.RadioButton();
 *    var radio3 = new qx.ui.mobile.form.RadioButton();
 *
 *    var group = new qx.ui.mobile.form.RadioGroup(radio1, radio2, radio3);

 *    form.add(radio1, "Germany");
 *    form.add(radio2, "UK");
 *    form.add(radio3, "USA");
 *
 *    this.getRoot.add(new qx.ui.mobile.form.renderer.Single(form));
 * </pre>
 *
 *
 */
qx.Class.define("qx.ui.mobile.form.RadioButton",
{
  extend : qx.ui.mobile.form.Input,
  include : [qx.ui.mobile.form.MValue],
  implement: [qx.ui.form.IField],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {Boolean?null} The value of the checkbox.
   */
  construct : function(value)
  {
    this.base(arguments);
    this.addListener("tap", this._onTap, this);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events :
  {
    /**
     * Fired when the selection value is changed.
     */
    changeValue : "qx.event.type.Data"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "radio"
    },


    /** The assigned qx.ui.form.RadioGroup which handles the switching between registered buttons */
    group :
    {
      check  : "qx.ui.mobile.form.RadioGroup",
      nullable : true,
      apply : "_applyGroup"
    }
  },


  members :
  {
    _state : null,

    // overridden
    _getTagName : function()
    {
      return "span";
    },


    // overridden
    _getType : function()
    {
      return null;
    },


    /**
     * Reacts on tap on radio button.
     */
    _onTap : function() {
      this.fireDataEvent("changeValue", {});

      // Toggle State.
      this.setValue(true);
    },


    /**
     * The assigned {@link qx.ui.form.RadioGroup} which handles the switching between registered buttons
     * @param value {qx.ui.form.RadioGroup} the new radio group to which this radio button belongs.
     * @param old {qx.ui.form.RadioGroup} the old radio group of this radio button.
     */
    _applyGroup : function(value, old)
    {
      if (old) {
        old.remove(this);
      }

      if (value) {
        value.add(this);
      }
    },


    /**
     * Sets the value [true/false] of this radio button.
     * It is called by setValue method of qx.ui.mobile.form.MValue mixin
     * @param value {Boolean} the new value of the radio button
     */
    _setValue : function(value) {
      if(value == true) {
        this.addCssClass("checked");
      } else {
        this.removeCssClass("checked");
      }

      this._state = value;
    },


    /**
     * Gets the value [true/false] of this radio button.
     * It is called by getValue method of qx.ui.mobile.form.MValue mixin
     * @return {Boolean} the value of the radio button
     */
    _getValue : function() {
      return this._state;
    }
  },


  /*
  *****************************************************************************
      DESTRUCTOR
  *****************************************************************************
  */
  destruct : function()
  {
    qx.event.Registration.removeListener(this, "tap", this._onTap, this);
  }
});
