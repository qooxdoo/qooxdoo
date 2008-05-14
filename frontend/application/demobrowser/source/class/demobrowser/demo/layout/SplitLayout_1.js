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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.layout.SplitLayout_1",
{
  extend : demobrowser.demo.util.LayoutApplication,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size
      var container = new qx.ui.container.Composite(new qx.ui.layout.Split("vertical")).set({
        decorator: "black",
        backgroundColor: "yellow",
        padding : 5,
        height: 500
      });

      container.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green",
        height : 200,
        minHeight : 20
      }), {mode: "first", size: 1});
      container.add(new qx.ui.core.Widget().set({
        decorator: "black", 
        backgroundColor: "blue",
        height: 5
      }), {mode: "splitter"});
      container.add(new qx.ui.core.Widget().set({
        decorator: "black",
        backgroundColor: "green"
      }), {mode: "second", size: 2});
      

      this.getRoot().add(container, {left:10, top:10});
    }
  }
});
