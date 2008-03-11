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
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * The image class is used for buttons, toolbars, menus, ...
 *
 * This class supports image clipping, which means that multiple images can be combined
 * into one large image and only the relevant part is shown.
 *
 * Please note that this widget can not be stretched.
 */
qx.Class.define("qx.ui.basic.Image",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param source {String?} The URL of the image to display.
   */
  construct : function(source)
  {
    this.base(arguments);

    if (source) {
      this.setSource(source);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The URL of the image */
    source :
    {
      check : "String",
      init : null,
      nullable : true,
      event : "changeSource",
      apply : "_applySource",
      themeable : true
    },


    // overridden
    appearance :
    {
      refine : true,
      init : "image"
    },


    // overridden
    allowGrowX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowShrinkX :
    {
      refine : true,
      init : false
    },


    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    },


    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createContentElement : function() {
      return new qx.html.ClippedImage();
    },


    // overridden
    _getContentHint : function()
    {
      return {
        width : this.__width || 0,
        height : this.__height || 0
      };
    },





    /*
    ---------------------------------------------------------------------------
      IMAGE API
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySource : function(value) {
      qx.io.Alias.getInstance().connect(this._syncSource, this, value);
    },


    /**
     * Connects a callback method to the value manager to ensure
     * that changes to the source are handled by the image instance
     *
     * @type member
     * @param source {String} new icon source
     * @return {void}
     */
    _syncSource : function(source)
    {
      var el = this._contentElement;

      if (!source)
      {
        el.resetSource();
        return;
      }

      var sprite = qx.util.ImageRegistry.getInstance().resolve(source);
      if (sprite)
      {
        el.setSource(source, false);

        var width = el.getWidth();
        var height = el.getHeight();

        if (width !== this.__width || height !== this.__height)
        {
          this.__width = width;
          this.__height = height;

          qx.ui.core.queue.Layout.add(this);
        }
      }
      else
      {
        qx.io2.ImageLoader.load(source, this.__loaderCallback, this);
      }
    },


    /**
     * Event handler fired after the preloader has finished loading the icon
     *
     * @type member
     * @param source {String} Image source which was loaded
     * @param size {Map} Dimensions of the loaded image
     * @return {void}
     */
    __loaderCallback : function(source, size)
    {
      // Dynamically register image
      qx.util.ImageRegistry.getInstance().register(source, source, 0, 0, size.width, size.height);

      // Update image
      this._syncSource(source);
    }
  }
});