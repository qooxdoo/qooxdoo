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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @appearance tab-view-bar
 * @appearance tab-view-bar-button-left {qx.ui.form.RepeatButton}
 * @appearance tab-view-bar-button-right {qx.ui.form.RepeatButton}
 */
qx.Class.define("qx.ui.tabview.Bar",
{
  extend : qx.ui.container.SlideBar,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "tab-view-bar"
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
    _createChildControlImpl : function(id)
    {
      var control;
      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.RepeatButton().set({
            appearance: "tab-view-bar-button-right"
          });
          control.addListener("execute", this._scrollForward, this);
          this._add(control);
          break;

        case "button-back":
          control = new qx.ui.form.RepeatButton().set({
            appearance: "tab-view-bar-button-left"
          });
          control.addListener("execute", this._scrollBack, this);
          this._addBefore(control, this._getChildControl("button-forward"));
          break;
      }
      var control = control || this.base(arguments, id);
      return control;
    }
  }
});
