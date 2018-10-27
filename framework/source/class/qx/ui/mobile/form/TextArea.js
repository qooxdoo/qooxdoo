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
 * The TextArea is a multi-line text input field.
 */
qx.Class.define("qx.ui.mobile.form.TextArea",
{
  extend : qx.ui.mobile.core.Widget,
  include : [
    qx.ui.mobile.form.MValue,
    qx.ui.mobile.form.MText,
    qx.ui.form.MForm,
    qx.ui.form.MModelProperty,
    qx.ui.mobile.form.MState
  ],
  implement : [
    qx.ui.form.IField,
    qx.ui.form.IForm,
    qx.ui.form.IModel
  ],


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param value {var?null} The value of the widget.
   */
  construct : function(value)
  {
    this.base(arguments);

    if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
      this.addListener("appear", this._fixChildElementsHeight, this);
      this.addListener("input", this._fixChildElementsHeight, this);
      this.addListener("changeValue", this._fixChildElementsHeight, this);
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
      init : "text-area"
    }

  },


  members :
  {
    // overridden
    _getTagName : function()
    {
      return "textarea";
    },


    /**
     * Synchronizes the elements.scrollHeight and its height.
     * Needed for making textArea scrollable.
     * @param evt {qx.event.type.Data} a custom event.
     */
    _fixChildElementsHeight : function(evt) {
      this.getContentElement().style.height = 'auto';
      this.getContentElement().style.height = this.getContentElement().scrollHeight+'px';

      var scroll = this.__getScrollContainer();
      if(scroll) {
        scroll.refresh();
      }
    },


    /**
    * Returns the parent scroll container of this widget.
    * @return {qx.ui.mobile.container.Scroll} the parent scroll container or <code>null</code>
    */
    __getScrollContainer : function() {
      var scroll = this;
      while (!(scroll instanceof qx.ui.mobile.container.Scroll)) {
        if (scroll.getLayoutParent) {
          var layoutParent = scroll.getLayoutParent();
          if (layoutParent == null || layoutParent instanceof qx.ui.mobile.core.Root) {
            return null;
          }
          scroll = layoutParent;
        } else {
          return null;
        }
      }
      return scroll;
    }
  },


  destruct : function()
  {
    if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
      this.removeListener("appear", this._fixChildElementsHeight, this);
      this.removeListener("input", this._fixChildElementsHeight, this);
      this.removeListener("changeValue", this._fixChildElementsHeight, this);
    }
  }
});
