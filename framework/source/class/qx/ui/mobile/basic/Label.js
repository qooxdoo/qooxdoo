/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * The label widget displays a text or HTML content.
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var label = new qx.ui.mobile.basic.Label("Hello World");
 *
 *   this.getRoot().add(label);
 * </pre>
 *
 * This example create a widget to display the label.
 *
 */
qx.Class.define("qx.ui.mobile.basic.Label",
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
    this.initWrap();

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
    }
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
      check : "String",
      apply : "_applyValue",
      event : "changeValue"
    },


    // overridden
    anonymous :
    {
      refine : true,
      init : true
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
    // property apply
    _applyValue : function(value, old)
    {
      this._setHtml(value);
    },


    // property apply
    _applyWrap : function(value, old)
    {
      if (value) {
        this.removeCssClass("no-wrap");
      } else {
        this.addCssClass("no-wrap");
      }
    },

    /**
     * Locale change event handler
     *
     * @signature function(e)
     * @param e {Event} the change event
     */
    _onChangeLocale : qx.core.Environment.select("qx.dynlocale",
    {
      "true" : function(e)
      {
        var content = this.getValue();
        if (content && content.translate) {
          this.setValue(content.translate());
        }
      },

      "false" : null
    })
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }
  }
});
