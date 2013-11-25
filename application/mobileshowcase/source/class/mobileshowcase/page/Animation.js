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
 * Mobile page responsible for showing the "animation" showcase.
 */
qx.Class.define("mobileshowcase.page.Animation",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Page Transitions");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
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
          item.setShowArrow(true);
        }
      });

      var data = [
          {title: "Slide", animation: "slide"},
          {title: "Pop", animation: "pop"},
          {title: "Fade", animation: "fade"},
          {title: "Dissolve", animation: "dissolve"},
          {title: "Slide up", animation: "slideup"},
          {title: "Flip", animation: "flip"},
          {title: "Swap", animation: "swap"},
          {title: "Cube", animation: "cube"}
      ];

      list.setModel(new qx.data.Array(data));
      list.addListener("changeSelection", function(evt) {
        // In Tablet Mode, animation should be shown for this showcase part.
        // On animation landing >> setShowAnimation(false) is called.
        this.getLayoutParent().getLayout().setShowAnimation(true);

        var animation = data[evt.getData()].animation;
        qx.core.Init.getApplication().getRouting().executeGet("/animation/" + animation);
      }, this);
      this.getContent().add(list);
    },


    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});