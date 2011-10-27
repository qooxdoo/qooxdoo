/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Mobile page responsible for showing the different showcases.
 */
qx.Class.define("mobileshowcase.page.Overview",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Overview");
  },


  events :
  {
    /** The page to show */
    "show" : "qx.event.type.Data"
  },


  members :
  {
    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var list = new qx.ui.mobile.list.List({
        configureItem : function(item, data, row)
        {
          item.setTitle(data.title);
          item.setSubTitle(data.subTitle);
          item.setShowArrow(true);
        }
      });

      var data = [
          {title : "Form Elements", subTitle : "TextField, TextArea, ToggleButton, Button...", path:"form"},
          {title : "List", subTitle : "A large list", path:"list"},
          {title : "Tab Bar", subTitle : "Usings tabs to switch views", path:"tab"},
          {title : "Toolbar", subTitle : "toolbar, buttons, separators", path:"toolbar"},
          {title : "Events", subTitle : "Touch, Tap, Swipe...", path:"event"},
          {title : "Page Transitions", subTitle : "Slide, Fade, Cube...", path:"animation"}
      ];

      list.setModel(new qx.data.Array(data));
      list.addListener("changeSelection", function(evt) {
        var path = data[evt.getData()].path;
        qx.ui.mobile.navigation.Manager.getInstance().executeGet("/"+path);
      }, this);
      this.getContent().add(list);

    }
  }
});