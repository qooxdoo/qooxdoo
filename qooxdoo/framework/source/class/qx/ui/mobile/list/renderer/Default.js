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
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.ui.mobile.list.renderer.Default",
{
  extend : qx.ui.mobile.list.renderer.Abstract,

  construct : function()
  {
    this.base(arguments);
    this.add(this._create());
  },


  members :
  {
    __image : null,
    __title : null,
    __subTitle : null,

    setImage : function(source)
    {
      this.__image.setSource(source)
    },


    setTitle : function(title)
    {
      this.__title.setValue(title);
    },


    setSubTitle : function(subTitle)
    {
      this.__subTitle.setValue(subTitle);
    },


    _create : function()
    {
      var Composite = qx.ui.mobile.container.Composite;

      var container = new Composite(new qx.ui.mobile.layout.HBox().set({
        alignY : "middle"
      }));

      this.__image = new qx.ui.mobile.basic.Image();
      this.__image.addCssClass("list-itemimage");

      container.add(this.__image);

      var right = new Composite(new qx.ui.mobile.layout.VBox());
      container.add(right, {flex:1});

      this.__title = new qx.ui.mobile.basic.Label();
      this.__title.addCssClass("list-itemlabel");
      right.add(this.__title);

      this.__subTitle = new qx.ui.mobile.basic.Label();
      this.__subTitle.addCssClass("subtitle");

      right.add(this.__subTitle);

      return container;
    },


    // overridden
    reset : function()
    {
      this.__image.setSource(null);
      this.__title.setValue("");
      this.__subTitle.setValue("");
    }
  }
});
