/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */
/**
 * Special feed iter for shoing feeds or articles in a mobile list.
 */
qx.Class.define("feedreader.mobile.FeedItem",
{
  extend : qx.ui.mobile.list.ListItem,

  construct : function()
  {
    this.base(arguments);

    // configure list item
    this.setSelectable(true);
    this.setShowArrow(true);
    
    var container = new qx.ui.mobile.container.Composite(
      new qx.ui.mobile.layout.HBox().set({
        alignY : "middle"
      })
    );

    this.__title = new qx.ui.mobile.basic.Label();
    container.add(this.__title);

    this.add(container);
  },


  members :
  {
    __title : null,


    // property apply
    _applyData : function(value) {
      this.__title.setValue(value.getTitle());
    }
  }
});