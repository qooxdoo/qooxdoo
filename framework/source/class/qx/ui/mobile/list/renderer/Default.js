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

/**
 * The default list item renderer. Used as the default renderer by the
 * {@link qx.ui.mobile.list.provider.Provider}. Configure the renderer
 * by setting the {@link qx.ui.mobile.list.List#delegate} property.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *
 *   // Create the list with a delegate that
 *   // configures the list item.
 *   var list = new qx.ui.mobile.list.List({
 *     configureItem : function(item, data, row)
 *     {
 *       item.setImage("path/to/image.png");
 *       item.setTitle(data.title);
 *       item.setSubTitle(data.subTitle);
 *     }
 *   });
 * </pre>
 *
 * This example creates a list with a delegate that configures the list item with
 * the given data.
 */
qx.Class.define("qx.ui.mobile.list.renderer.Default",
{
  extend : qx.ui.mobile.list.renderer.Abstract,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(layout)
  {
    this.base(arguments, layout || new qx.ui.mobile.layout.HBox().set({
        alignY : "middle"
      }));
    this.add(this._create(), {flex:1});
  },




 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __image : null,
    __title : null,
    __subTitle : null,
    __container : null,
    __rightContainer : null,


    /**
     * Returns the image widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Image} The image widget
     */
    getImageWidget : function() {
      return this.__image;
    },


    /**
     * Returns the title widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Label} The title widget
     */
    getTitleWidget : function() {
      return this.__title;
    },


    /**
     * Returns the subtitle widget which is used for this renderer.
     *
     * @return {qx.ui.mobile.basic.Label} The subtitle widget
     */
    getSubTitleWidget : function()
    {
      return this.__subTitle;
    },


    /**
     * Sets the source of the image widget.
     *
     * @param source {String} The source to set
     */
    setImage : function(source)
    {
      this.__image.setSource(source)
    },


    /**
     * Sets the value of the title widget.
     *
     * @param title {String} The value to set
     */
    setTitle : function(title)
    {
      this.__title.setValue(title);
    },


    /**
     * Sets the value of the subtitle widget.
     *
     * @param subTitle {String} The value to set
     */
    setSubTitle : function(subTitle)
    {
      this.__subTitle.setValue(subTitle);
    },


    /**
     * Creates the widgets for the renderer.
     *
     * @return {qx.ui.mobile.container.Composite} The container which contains the
     *     created widgets.
     */
    _create : function()
    {
      var Composite = qx.ui.mobile.container.Composite;

      this.__container = new Composite(new qx.ui.mobile.layout.HBox().set({
        alignY : "middle"
      }));

      this.__image = new qx.ui.mobile.basic.Image();
      this.__image.setAnonymous(true);
      this.__image.addCssClass("list-itemimage");

      this.__container.add(this.__image);

      this.__rightContainer = new Composite(new qx.ui.mobile.layout.VBox());
      this.__container.add(this.__rightContainer, {flex:1});

      this.__title = new qx.ui.mobile.basic.Label();
      this.__title.setWrap(false);
      this.__title.addCssClass("list-itemlabel");
      this.__rightContainer.add(this.__title);

      this.__subTitle = new qx.ui.mobile.basic.Label();
      this.__subTitle.setWrap(false);
      this.__subTitle.addCssClass("subtitle");

      this.__rightContainer.add(this.__subTitle);

      return this.__container;
    },


    // overridden
    reset : function()
    {
      this.__image.setSource(null);
      this.__title.setValue("");
      this.__subTitle.setValue("");
    }
  },

 /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__image.dispose();
    this.__image = null;
    this.__title.dispose();
    this.__title = null;
    this.__subTitle.dispose();
    this.__subTitle = null;
    this.__container.dispose();
    this.__container = null;
    this.__rightContainer.dispose();
    this.__rightContainer = null;
  }
});
