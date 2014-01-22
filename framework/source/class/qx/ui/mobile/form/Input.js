/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Abstract class for all input fields.
 */
qx.Class.define("qx.ui.mobile.form.Input",
{
  extend : qx.ui.mobile.core.Widget,
  include : [
    qx.ui.form.MForm,
    qx.ui.form.MModelProperty,
    qx.ui.mobile.form.MState
  ],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IModel
  ],
  type : "abstract",


  construct : function()
  {
    this.base(arguments);
    this._setAttribute("type", this._getType());
    this.addCssClass("gap");

    this.addListener("focus", this._onSelected, this);
  },


  statics : {
    SCROLL_DURATION : null
  },


  members :
  {
    // overridden
    _getTagName : function()
    {
      return "input";
    },


    /**
     * Returns the type of the input field. Override this method in the
     * specialized input class.
     */
    _getType : function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        throw new Error("Abstract method call");
      }
    },


    /**
    * Returns the parent scroll container of this widget.
    * @return {qx.ui.mobile.container.Scroll} the parent scroll container or <code>null</code>
    */
    __getScrollTarget : function() {
      var scrollTarget = this;
      while (!(scrollTarget.scrollToWidget)) {
        var layoutParent = scrollTarget.getLayoutParent();
        if (layoutParent instanceof qx.ui.mobile.core.Root) {
          return null;
        }
        scrollTarget = layoutParent;
      }
      return scrollTarget;
    },


    /**
     * Handles the <code>click</code> and <code>focus</code> event on this input widget.
     * @param evt {qx.event.type.Event} <code>click</code> or <code>focus</code> event
     */
    _onSelected : function(evt) {
      if (!(evt.getTarget() instanceof qx.ui.mobile.form.TextField) && !(evt.getTarget() instanceof qx.ui.mobile.form.NumberField)) {
        return;
      }

      var scrollTarget = this.__getScrollTarget();
      if(scrollTarget && scrollTarget.scrollToWidget) {
        scrollTarget.scrollToWidget(this, qx.ui.mobile.form.Input.SCROLL_DURATION);
      }

      // Re-render input field caret after scrolling.
      if (qx.core.Environment.get("os.name") == "android") {
        setTimeout(function() {
          this._setStyle("width","0px");
          setTimeout(function() {
            this._setStyle("width", null);
          }.bind(this), 0);
        }.bind(this), qx.ui.mobile.form.Input.SCROLL_DURATION);
      }
    }
  },


  destruct : function() {
    this.removeListener("focus", this._onSelected, this);
  },


  defer : function(statics) {
    statics.SCROLL_DURATION = 0;
  }
});
