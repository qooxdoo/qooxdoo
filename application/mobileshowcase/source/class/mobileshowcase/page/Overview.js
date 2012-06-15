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
          item.setSubtitle(data.subtitle);
          item.setShowArrow(true);
        }
      });

      var data = [
          {title : "Basic Widgets", subtitle : "Atoms, Buttons, Labels, Images...", path:"basic"},
          {title : "Dialog Widgets", subtitle : "Dialogs, Popups, Confirm Dialogs...", path:"dialog"},
          {title : "Form Elements", subtitle : "TextField, TextArea, Checkboxes...", path:"form"},
          {title : "List", subtitle : "A large list", path:"list"},
          {title : "Tab Bar", subtitle : "Usings tabs to switch views", path:"tab"},
          {title : "Toolbar", subtitle : "toolbar, buttons, separators", path:"toolbar"},
          {title : "Events", subtitle : "Touch, Tap, Swipe...", path:"event"},
          {title : "Data Binding", subtitle : "See how data binding works", path:"databinding"},
          {title : "Page Transitions", subtitle : "Slide, Fade, Cube...", path:"animation"},
          {title : "Theme Switcher", subtitle : "Switch between our themes...", path:"themeswitcher"}
      ];

      list.setModel(new qx.data.Array(data));
      list.addListener("changeSelection", function(evt) {
        var path = data[evt.getData()].path;
        qx.core.Init.getApplication().getRouting().executeGet("/"+path);

        // On click on list item, portraitContainer should hide.
        this.fireEvent("hidePortraitContainer");
      }, this);
      this.getContent().add(list);

    }
  }
});