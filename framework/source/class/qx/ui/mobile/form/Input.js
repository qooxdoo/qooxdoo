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

    this.addListener("focus", this._onFocus, this);
  },


  statics : {
    SCROLL_FOCUS_TIMEOUT : 0
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
    * Scrolls this widget into view. The scrolled widget is aligned with the top of the scroll area.
    * @param evt {qx.event.type.Focus} the focus event 
    */
    __scrollIntoView : function(evt) {
      var target = evt.getTarget();
      while (!(target instanceof qx.ui.mobile.page.NavigationPage)) {
        var parent = target.getLayoutParent();
        if (parent instanceof qx.ui.mobile.core.Root) {
          return;
        }
        target = parent;
      }
      if (target.scrollToWidget) {
        target.scrollToWidget(evt.getTarget());
      }
    },


    /**
     * Handles the focus event on this input widget.
     * @param evt {qx.event.type.Focus} the focus event 
     */
    _onFocus : function(evt) {
      if (qx.core.Environment.get("os.name") == "android") {
        setTimeout(function() {
          this.__scrollIntoView(evt);
        }.bind(this), qx.ui.mobile.form.Input.SCROLL_FOCUS_TIMEOUT);
      } else {
        this.__scrollIntoView(evt);
      }
    }
  },


  destruct : function() {
    this.removeListener("focus", this._onFocus, this);
  },


  defer : function(statics) {
    if (qx.core.Environment.get("os.name") == "android") {
      statics.SCROLL_FOCUS_TIMEOUT = 100;
    }
  }
});
