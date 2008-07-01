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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.ui.tabview.Bar",
{
  extend : qx.ui.container.SlideBar,



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
          control = new qx.ui.form.RepeatButton()
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteForward, this);
          this._add(control);
          break;

        case "button-back":
          control = new qx.ui.form.RepeatButton();
          control.setFocusable(false);
          control.addListener("execute", this._onExecuteBackward, this);
          this._addBefore(control, this._getChildControl("button-forward"));
          break;
      }
      
      control = control || this.base(arguments, id);
      return control;
    },
    
    
    _onExecuteForward : function(e)
    {
      this.debug("forward");
    },
    
    _onExecuteBackward : function(e)
    {
      this.debug("backward");
    }
  }
});
