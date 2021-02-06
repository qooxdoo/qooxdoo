/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

    this.addCssClass("gap");
    this._setLayout(new qx.ui.mobile.layout.HBox().set({
      "alignY": "middle",
      "alignX": "left"
    }));
    this.initWrap();

    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().addListener("changeLocale", this._onChangeLocale, this);
    }

    this.addListener("tap", this._onTap, this);
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
    __forWidget : null,


     // overridden
    _getTagName : function()
    {
      return "label";
    },


    // property apply
    _applyValue : function(value, old)
    {
      var html = value;

      // [BUG #7871] Bugfix for IE 10 for enabling word-wrap within a flexbox layout.
      if (qx.core.Environment.get("css.flexboxSyntax") === "flexbox") {
        html = "<p>" + value + "</p>";
      }
      this._setHtml(html);
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
    * Event handler for the <code>changeEnabled</code> event on the target.
    * @param evt {qx.event.type.Data} the changeEnabled event.
    */
    _changeEnabled: function(evt) {
      if (evt) {
        this.setEnabled(evt.getData());
      }
    },


    /**
     * Setter for the "for" attribute of this label.
     * The "for" attribute specifies which form element a label is bound to.
     *
     * @param elementId {String} The id of the element the label is bound to.
     *
     */
    setLabelFor: function(elementId) {
      if (this.__forWidget) {
        this.__forWidget.removeListener("changeEnabled", this._changeEnabled, this);
      }

      this.__forWidget = qx.ui.mobile.core.Widget.getWidgetById(elementId);

      if (this.__forWidget) {
        this.__forWidget.addListener("changeEnabled", this._changeEnabled, this);
        this.setEnabled(this.__forWidget.getEnabled());
      }

      this._setAttribute("for", elementId);
    },


    /**
     * Handler for <code>tap</code> event on the Label. This event will be delegated to target widget.
     * @param evt {qx.event.type.Pointer} The tap event.
     */
    _onTap: function(evt) {
      if (this.__forWidget && qx.core.Environment.get("event.dispatchevent")) {
        var target = this.__forWidget.getContentElement();
        qx.event.Registration.fireEvent(
          target,
          "tap",
          qx.event.type.Tap, [evt.getNativeEvent(), target, null, true, true]
        );
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


  destruct : function() {
    this.removeListener("tap", this._onTap, this);

    if (this.__forWidget) {
      this.__forWidget.removeListener("changeEnabled", this._changeEnabled, this);
      this.__forWidget = null;
    }
    if (qx.core.Environment.get("qx.dynlocale")) {
      qx.locale.Manager.getInstance().removeListener("changeLocale", this._onChangeLocale, this);
    }
  }
});
