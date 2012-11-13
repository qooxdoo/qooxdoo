/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The label widget displays a text or HTML content in form context.
 *
 * It uses the html tag <label>, for making it possible to set the
 * "for" attribute.
 *
 * The "for" attribute specifies which form element a label is bound to.
 * A tap on the label is forwarded to the bound element.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var checkBox = new qx.ui.mobile.form.CheckBox();
 *   var label = new qx.ui.mobile.form.Label("Label for CheckBox");
 *
 *   label.setLabelFor(checkBox.getId());
 *
 *   this.getRoot().add(label);
 *   this.getRoot().add(checkBox);
 * </pre>
 *
 * This example create a widget to display the label.
 *
 */
qx.Class.define("qx.ui.mobile.form.Label",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {String?null} Text or HTML content to display
   */
  construct : function(value)
  {
    this.base(arguments);
    if (value) {
      this.setValue(value);
    }

    this.addCssClass("boxAlignCenter");
    this._setLayout(new qx.ui.mobile.layout.HBox());

    this.initWrap();
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
      init : "label"
    },


    /**
     * Text or HTML content to display
     */
    value :
    {
      nullable : true,
      init : null,
      apply : "_applyValue",
      event : "changeValue"
    },


    // overridden
    anonymous :
    {
      refine : true,
      init : false
    },


    /**
     * Controls whether text wrap is activated or not.
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
    _getTagName : function()
    {
      return "label";
    },


    // property apply
    _applyValue : function(value, old)
    {
      this._setHtml(value);
    },


    // property apply
    _applyWrap : function(value, old)
    {
      if (value) {
        this.removeCssClass("no-wrap")
      } else {
        this.addCssClass("no-wrap");
      }
    },


    /**
     * Setter for the "for" attribute of this label.
     * The for attribute specifies which form element a label is bound to.
     *
     * @param elementId {String} The id of the element the label is bound to.
     *
     */
    setLabelFor : function(elementId) {
      this._setAttribute("for",elementId);
    }
  }
});
