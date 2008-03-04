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
      apply : "_applySource",
			themeable : true
    },

    /** The URL of the disabled icon */
    disabledSource :
    {
      check : "String",
      init : null,
      nullable : true,
      event : "changeDisabledSource",
      apply : "_applyDisabledSource",
			themeable : true
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
    _createContentElement : function() {
      return new qx.html.ClippedImage();
    },


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


    __setClippedImage : function(source)
    {
      var el = this._contentElement;
      el.setSource(source, false);
      this.__setIconSize(el.getWidth(), el.getHeight());
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
      if (this.getEnabled() || !this.getDisabledSource()) {
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
        this._contentElement.resetSource();
        return;
      }

      var mgr = qx.io.image.IconManager.getInstance();

      var sprite = mgr.resolve(source);

      if (sprite) {
        this.__setClippedImage(source);
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
      this._contentElement.resetSource();
    }
  }
});