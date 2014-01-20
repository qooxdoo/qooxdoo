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

    this.addListener("click", this._onClick, this);
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
     * Handles the click event on this input widget.
     * @param evt {qx.event.type.Event} the click event 
     */
    _onClick : function(evt) {
      if (!(evt.getTarget() instanceof qx.ui.mobile.form.TextField) && !(evt.getTarget() instanceof qx.ui.mobile.form.NumberField)) {
        return;
      }
      if (qx.ui.mobile.form.Input.SCROLL_FOCUS_TIMEOUT > 0) {
        this.__scrollIntoView(evt);
        setTimeout(function() {
          this.blur();
          this.focus();
        }.bind(this), qx.ui.mobile.form.Input.SCROLL_FOCUS_TIMEOUT);
      } else {
        this.__scrollIntoView(evt);
      }
    }
  },


  destruct : function() {
    this.removeListener("click", this._onClick, this);
  },


  defer : function(statics) {
    if (qx.core.Environment.get("os.name") == "android") {
      statics.SCROLL_FOCUS_TIMEOUT = 100;
    }
  }
});
