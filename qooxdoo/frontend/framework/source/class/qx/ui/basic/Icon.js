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
 * The icon class is a special image class used for buttons, toolbars, menus, ...
 *
 * Icons support image clipping, which means that multiple images can be combined
 * into one large image and the icon only displayes the relevant part.
 *
 * Unlike images, icons cannot be stretched and cannot load images from external
 * resources.
 *
 */
qx.Class.define("qx.ui.basic.Icon",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param source {String?} The URL of the icon to display.
   * @param disabledSource {String?} The optional URL of the disabled icon.
   */
  construct : function(source, disabledSource)
  {
    this.base(arguments);

    if (source) {
      this.setSource(source);
    }

    if (disabledSource) {
      this.setDisabledSource(disabledSource);
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The URL of the icon */
    source :
    {
      check : "String",
      init : null,
      nullable : true,
      event : "changeSource",
      apply : "_applySource"
    },

    /** The URL of the disabled icon */
    disabledSource :
    {
      check : "String",
      init : null,
      nullable : true,
      event : "changeDisabledSource",
      apply : "_applyDisabledSource"
    },

    appearance :
    {
      refine : true,
      init : "icon"
    },

    allowGrowX :
    {
      refine : true,
      init : false
    },

    allowShrinkX :
    {
      refine : true,
      init : false
    },

    allowGrowY :
    {
      refine : true,
      init : false
    },

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
    _getContentHint : function()
    {
      // TODO: Needs preloader implementation
      return {
        width : this.__iconWidth || 0,
        minWidth : 0,
        maxWidth : Infinity,
        height : this.__iconHeight || 0,
        minHeight : 0,
        maxHeight : Infinity
      };
    },


    // property apply
    _applyEnabled : function(value, old)
    {
      var disabledIcon = this.getDisabledSource();
      if (!value && disabledIcon)
      {
        // if disabled icon is defined, don't call base functions and don't set
        // state to disabled
        this._applyVisibleSource(disabledIcon);
      }
      else
      {
        // reset to enabled icon
        if (value && disabledIcon) {
          this._applyVisibleSource(this.getSource());
        }
        this.base(arguments, value, old);
      }
    },


    /*
    ---------------------------------------------------------------------------
      ICON API
    ---------------------------------------------------------------------------
    */


    /**
     * Sets the CSS level icon source
     * @param iconUrl {String} The icon source
     */
    __setIconSource : function(iconUrl)
    {
      if (!iconUrl)
      {
        this._contentElement.removeStyle("filter", filter);
        this._contentElement.removeStyle("backgroundImage", filter);
        return;
      }

      var isPng = qx.lang.String.endsWith(iconUrl, ".png");

      // TODO
      // This is by far to simple as the method used here destroys an previously configured opacity
      // in IE6. Also be should use variants here to filter code from gecko.
      // It must also be absolutely safe when switching from GIF to PNG to GIF etc. which is not already done so.

      // use clipped images unless the image is PNG and the browser IE6
      var Engine = qx.bom.client.Engine;
      if (isPng && Engine.MSHTML && Engine.VERSION < 7)
      {
        var filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + iconUrl + "',sizingMethod='crop')";
        this._contentElement.setStyle("filter", filter);
      } else {
        this._contentElement.setStyle("backgroundImage", 'url(' + iconUrl + ')');
      }
    },


    /**
     * Sets the icon size
     *
     * @param width {Integer} the icon's width
     * @param height {Integer} the icon's height
     */
    __setIconSize : function(width, height)
    {
      if (width !== this.__iconWidth || height !== this.__iconHeight) {
        this.scheduleLayoutUpdate();
      }
      this.__iconWidth = width;
      this.__iconHeight = height;
    },


    /**
     * Sets the icon's offset inside of a combined images
     *
     * @param xOffset {Integer} The icon's xOffset
     * @param yOffset {Integer} The icon's yOffset
     */
    __setIconOffset : function(xOffset, yOffset) {
      this._contentElement.setStyle("backgroundPosition", xOffset + "px " + yOffset + "px");
    },


    /**
     * Reset the icon.
     */
    __resetIcon : function()
    {
      this.__setIconSize(0, 0);
      this.__setIconOffset(0, 0);
      this.__setIconSource(null);
    },


    // property apply
    _applySource : function(value, old) {
      qx.io.Alias.getInstance().connect(this._syncSource, this, value);
    },


    /**
     * Connects a callback method to the value manager to ensure
     * that changes to the source are handled by the image instance
     *
     * @type member
     * @param value {String} new icon source
     */
    _syncSource : function(value)
    {
      this.__source = value;
      if (this.getEnabled()) {
        this._applyVisibleSource(value);
      }
    },


    // property apply
    _applyDisabledSource : function(value, old) {
      qx.io.Alias.getInstance().connect(this._syncDisabledSource, this, value);
    },


    /**
     * Connects a callback method to the value manager to ensure
     * that changes to the source are handled by the image instance
     *
     * @type member
     * @param value {String} new disabled icon source
     */
    _syncDisabledSource : function(value)
    {
      if (!this.getEnabled()) {
        this._applyVisibleSource(value);
      }
    },


    /**
     * Sets the visible icon to the given source. Either by using the data from
     * the {@link qx.ui.basic.IconManager} of by using the preloader system.
     *
     * @param source {String} The icon's url as given by the user.
     */
    _applyVisibleSource : function(source)
    {
      if (this.__preloader)
      {
        // get rid of the old preloader
        this.__preloader.removeListener("load", this.__onLoadPreloader, this);
        this.__preloader.removeListener("error", this.__onErrorPreloader, this);
        this.__preloader = null;
      }

      if (!source)
      {
        this.__resetIcon();
        return;
      }

      var mgr = qx.io.image.IconManager.getInstance();

      var sprite = mgr.resolve(source);

      var isPng = qx.lang.String.endsWith(source, ".png");

      if (sprite)
      {
        this.__setIconSource(sprite[0]);
        this.__setIconOffset(sprite[1], sprite[2]);
        this.__setIconSize(sprite[3], sprite[4]);
      }
      else
      {
        // if no icon information is available, use the preloader to determin
        // the icon size
        this.__preloader = qx.io.image.PreloaderManager.getInstance().create(source);
        if (this.__preloader.isLoaded())
        {
          this.__onLoadPreloader();
        }
        else
        {
          this.__preloader.addListener("load", this.__onLoadPreloader, this);
          this.__preloader.addListener("error", this.__onErrorPreloader, this);
        }
      }
    },


    /**
     * Event handler fired after the preloader has finished loading the icon
     *
     * @param e {qx.event.type.Event} the event object
     */
    __onLoadPreloader : function(e)
    {
      var iconUri = this.__preloader.getSource();

      // store image information
      qx.io.image.IconManager.getInstance().register(
        iconUri,
        iconUri,
        0, 0,
        this.__preloader.getWidth(), this.__preloader.getHeight()
      );

      if (iconUri == this.__source) {
        this._syncSource(iconUri)
      } else {
        this._syncDisabledSource(iconUri)
      }
    },


    /**
     * Event handler fired after the preloader has failed loading the icon
     *
     * @param e {qx.event.type.Event} the event object
     */
    __onErrorPreloader : function(e)
    {
      this.warn("Error loading image: " + this.getSource());
      this.__resetIcon();
    }
  }
});