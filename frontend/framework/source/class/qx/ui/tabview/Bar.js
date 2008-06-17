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
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String?"horizontal"} The slide bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments, orientation);

    /*
    this._getChildControl("pane").addListener("addChildWidget", function(e) {
      var child = e.getData();
      console.log("add", child);
      child.addListener("mousedown", function(e) {
        this._scrollPane.scrollItemIntoView(child);
      }, this);
    }, this);
    */
  },



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
            appearance: "tab-view-bar-button-right",
            focusable: false
          });
          control.addListener("execute", this._scrollForward, this);
          this._add(control);
          break;

        case "button-back":
          control = new qx.ui.form.RepeatButton().set({
            appearance: "tab-view-bar-button-left",
            focusable: false
          });
          control.addListener("execute", this._scrollBack, this);
          this._addBefore(control, this._getChildControl("button-forward"));
          break;
      }
      control = control || this.base(arguments, id);
      return control;
    },


    scrollButtonIntoView : function(button)
    {
      var buttons = this._getChildControl("pane").getChildren();

      var index = buttons.indexOf(button);
      if (index == 0) {
        this._scrollPane.scrollToX(0);
      } else if (index == buttons.length-1) {
        this._scrollPane.scrollToX(32000);
      } else {
        this._scrollPane.scrollItemIntoView(button);
      }
    },


    _scrollBack : function()
    {
      var pane = this._getChildControl("pane");
      var insets = pane.getInsets();

      var scrollPos = this._scrollPane.getScrollX();
      var outerSize = this._scrollPane.getBounds().width;

      var buttons = pane.getChildren();

      for (i=buttons.length-1; i>=0; i--)
      {
        var button = buttons[i];

        var bounds = button.getBounds();
        var left = bounds.left + insets.left;
        var right = left + bounds.width;

        if (left < scrollPos)
        {
          this.scrollButtonIntoView(button);
          break;
        }
      }
    },


    _scrollForward : function()
    {
      var pane = this._getChildControl("pane");
      var insets = pane.getInsets();

      var scrollPos = this._scrollPane.getScrollX();
      var outerSize = this._scrollPane.getBounds().width;

      var buttons = pane.getChildren();

      for (var i=0; i<buttons.length; i++)
      {
        var button = buttons[i];

        var bounds = button.getBounds();
        var left = bounds.left + insets.left;
        var right = left + bounds.width;

        if (left > outerSize + scrollPos || right > outerSize + scrollPos)
        {
          this.scrollButtonIntoView(button);
          break;
        }
      }
    }
  }
});
