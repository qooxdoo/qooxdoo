/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_basic)
#embed(qx.static/image/blank.gif)

************************************************************************ */

/**
 * This widget represents an image.
 *
 */
qx.Clazz.define("qx.ui.basic.Image",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vSource, vWidth, vHeight)
  {
    qx.ui.basic.Terminator.call(this);

    // Reset Alt and Title
    this.setHtmlProperty("alt", "");
    this.setHtmlProperty("title", "");

    // Apply constructor arguments
    this.setSource(vSource || "static/image/blank.gif");

    // Dimensions
    this.setWidth(vWidth !== undefined ? vWidth : "auto");
    this.setHeight(vHeight !== undefined ? vHeight : "auto");

    // Prohibit selection
    this.setSelectable(false);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    "error" : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** The source uri of the image. */
    source :
    {
      _legacy : true,
      type    : "string"
    },


    /** The assigned preloader instance of the image. */
    preloader :
    {
      _legacy : true,
      type    : "object"
    },


    /**
     * The loading status.
     *
     *  True if the image is loaded correctly. False if no image is loaded
     *  or the one that should be loaded is currently loading or not available.
     */
    loaded :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false
    },


    /** Should the image be maxified in it's own container? */
    resizeToInner :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false
    },


    /** Appearance of the widget */
    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "image"
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
      EVENT MAPPERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onload : function() {
      this.setLoaded(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onerror : function()
    {
      this.debug("Could not load: " + this.getSource());

      this.setLoaded(false);

      if (this.hasEventListeners("error")) {
        this.dispatchEvent(new qx.event.type.Event("error"), true);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPLAYBLE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _beforeAppear : function()
    {
      var vSource = this.getSource();

      if (qx.util.Validation.isValidString(vSource)) {
        qx.manager.object.ImageManager.getInstance()._sources[vSource]++;
      }

      return qx.ui.basic.Terminator.prototype._beforeAppear.call(this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _beforeDisappear : function()
    {
      var vSource = this.getSource();

      if (qx.util.Validation.isValidString(vSource))
      {
        if (qx.manager.object.ImageManager.getInstance()._sources[vSource] <= 1) {
          delete qx.manager.object.ImageManager.getInstance()._sources[vSource];
        } else {
          qx.manager.object.ImageManager.getInstance()._sources[vSource]--;
        }
      }

      return qx.ui.basic.Terminator.prototype._beforeDisappear.call(this);
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifySource : function(propValue, propOldValue, propData)
    {
      if (propValue && typeof qx.manager.object.ImageManager.getInstance()._sources[propValue] === "undefined") {
        qx.manager.object.ImageManager.getInstance()._sources[propValue] = 0;
      }

      if (propOldValue)
      {
        if (qx.manager.object.ImageManager.getInstance()._sources[propOldValue] <= 1) {
          delete qx.manager.object.ImageManager.getInstance()._sources[propOldValue];
        } else {
          qx.manager.object.ImageManager.getInstance()._sources[propOldValue]--;
        }
      }

      if (this.isCreated())
      {
        if (propValue) {
          this.setPreloader(qx.manager.object.ImagePreloaderManager.getInstance().create(qx.manager.object.AliasManager.getInstance().resolvePath(propValue)));
        }
        else if (propOldValue)
        {
          this._resetContent();
          this.setPreloader(null);
        }
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyPreloader : function(propValue, propOldValue, propData)
    {
      if (propOldValue)
      {
        // remove event connection
        propOldValue.removeEventListener("load", this._onload, this);
        propOldValue.removeEventListener("error", this._onerror, this);
      }

      if (propValue)
      {
        // Register to image manager
        qx.manager.object.ImageManager.getInstance().add(this);

        // Omit  here, otherwise the later setLoaded(true)
        // will not be executed (prevent recursion)
        // Changed: Use forceLoaded instead of setLoaded => should be faster
        this.forceLoaded(false);

        if (propValue.isErroneous()) {
          this._onerror();
        } else if (propValue.isLoaded()) {
          this.setLoaded(true);
        }
        else
        {
          propValue.addEventListener("load", this._onload, this);
          propValue.addEventListener("error", this._onerror, this);
        }
      }
      else
      {
        // Remove from image manager
        qx.manager.object.ImageManager.getInstance().remove(this);

        this.setLoaded(false);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyLoaded : function(propValue, propOldValue, propData)
    {
      if (propValue && this.isCreated()) {
        this._applyContent();
      }
      else if (!propValue)
      {
        this._invalidatePreferredInnerWidth();
        this._invalidatePreferredInnerHeight();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyElement : function(propValue, propOldValue, propData)
    {
      if (propValue)
      {
        if (!this._image)
        {
          try
          {
            // Create Image-Node
            // Webkit has problems with "new Image". Maybe related to "new Function" with
            // is also not working correctly.
            if (qx.core.Variant.isSet("qx.client", "webkit")) {
              this._image = document.createElement("img");
            } else {
              this._image = new Image;
            }

            // Possible alternative for MSHTML for PNG images
            // But it seems not to be faster
            // this._image = document.createElement("div");
            // this costs much performance, move setup to blank gif to error handling
            // is this SSL save?
            // this._image.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
            this._image.style.border = "0 none";
            this._image.style.verticalAlign = "top";
          }
          catch(ex)
          {
            this.error("Failed while creating image #1", ex);
          }

          if (qx.core.Variant.isSet("qx.client", "mshtml")) {}

          // empty to help the generator removing this variant
          else {
            this._applyEnabled();
          }
        }

        propValue.appendChild(this._image);
      }

      // call widget implmentation
      qx.ui.basic.Terminator.prototype._modifyElement.call(this, propValue, propOldValue, propData);

      if (propValue)
      {
        try
        {
          // initialisize preloader
          var vSource = this.getSource();

          if (qx.util.Validation.isValidString(vSource))
          {
            // this.debug("Post-Create: " + vSource);
            this.setPreloader(qx.manager.object.ImagePreloaderManager.getInstance().create(qx.manager.object.AliasManager.getInstance().resolvePath(vSource)));
          }
        }
        catch(ex)
        {
          this.error("Failed while creating image #2", ex);
        }
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      CLIENT OPTIMIZED MODIFIERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _postApply : function()
    {
      if (!this.getLoaded())
      {
        this._updateContent(qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif"));
        return;
      }

      this._postApplyDimensions();
      this._updateContent();
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {void}
     */
    _modifyEnabled : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(propValue, propOldValue, propData)
      {
        if (this._image) {
          this._applyEnabled();
        }

        return qx.ui.basic.Terminator.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
      },

      "default" : function(propValue, propOldValue, propData)
      {
        if (this._image) {
          this._applyEnabled();
        }

        return qx.ui.basic.Terminator.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vSource {var} TODOC
     * @return {void}
     */
    _updateContent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vSource)
      {
        var i = this._image;
        var pl = this.getPreloader();

        if (pl.getIsPng() && this.getEnabled())
        {
          i.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
          i.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + (vSource || pl.getSource()) + "',sizingMethod='scale')";
        }
        else
        {
          i.src = vSource || pl.getSource();
          i.style.filter = this.getEnabled() ? "" : "Gray() Alpha(Opacity=30)";
        }
      },

      "default" : function(vSource) {
        this._image.src = vSource || this.getPreloader().getSource();
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _resetContent : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        var i = this._image;

        i.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
        i.style.filter = "";
      },

      "default" : function() {
        this._image.src = qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif");
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _applyEnabled : qx.core.Variant.select("qx.client",
    {
      "mshtml" : null, // alias will be set to "_postApply" in defer

      "default" : function()
      {
        if (this._image)
        {
          var o = this.getEnabled() ? "" : 0.3;
          var s = this._image.style;

          s.opacity = s.KhtmlOpacity = s.MozOpacity = o;
        }
      }
    }),




    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS: INNER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var | int} TODOC
     */
    _computePreferredInnerWidth : function()
    {
      if (this.getLoaded()) {
        return this.getPreloader().getWidth();
      }
      else if (qx.util.Validation.isValidString(this.getSource()))
      {
        var vPreloader = qx.manager.object.ImagePreloaderManager.getInstance().get(qx.manager.object.AliasManager.getInstance().resolvePath(this.getSource()));

        if (vPreloader && vPreloader.isLoaded()) {
          return vPreloader.getWidth();
        }
      }

      return 0;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var | int} TODOC
     */
    _computePreferredInnerHeight : function()
    {
      if (this.getLoaded()) {
        return this.getPreloader().getHeight();
      }
      else if (qx.util.Validation.isValidString(this.getSource()))
      {
        var vPreloader = qx.manager.object.ImagePreloaderManager.getInstance().get(qx.manager.object.AliasManager.getInstance().resolvePath(this.getSource()));

        if (vPreloader && vPreloader.isLoaded()) {
          return vPreloader.getHeight();
        }
      }

      return 0;
    },




    /*
    ---------------------------------------------------------------------------
      APPLY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _applyContent : function()
    {
      qx.ui.basic.Terminator.prototype._applyContent.call(this);

      // Images load asyncron, so we need to force flushing here
      // to get an up-to-date view when an image is loaded.
      qx.ui.core.Widget.flushGlobalQueues();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _postApplyDimensions : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        try
        {
          var vImageStyle = this._image.style;

          if (this.getResizeToInner())
          {
            vImageStyle.pixelWidth = this.getInnerWidth();
            vImageStyle.pixelHeight = this.getInnerHeight();
          }
          else
          {
            vImageStyle.pixelWidth = this.getPreferredInnerWidth();
            vImageStyle.pixelHeight = this.getPreferredInnerHeight();
          }
        }
        catch(ex)
        {
          this.error("postApplyDimensions failed", ex);
        }
      },

      "default" : function()
      {
        try
        {
          var vImageNode = this._image;

          if (this.getResizeToInner())
          {
            vImageNode.width = this.getInnerWidth();
            vImageNode.height = this.getInnerHeight();
          }
          else
          {
            vImageNode.width = this.getPreferredInnerWidth();
            vImageNode.height = this.getPreferredInnerHeight();
          }
        }
        catch(ex)
        {
          this.error("postApplyDimensions failed", ex);
        }
      }
    }),




    /*
    ---------------------------------------------------------------------------
      CHANGES IN DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
     * @return {void}
     */
    _changeInnerWidth : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.style.pixelWidth = vNew;
        }
      },

      "default" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.width = vNew;
        }
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @param vNew {var} TODOC
     * @param vOld {var} TODOC
     * @return {void}
     */
    _changeInnerHeight : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.style.pixelHeight = vNew;
        }
      },

      "default" : function(vNew, vOld)
      {
        if (this.getResizeToInner()) {
          this._image.height = vNew;
        }
      }
    }),




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {boolean | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return true;
      }

      var vPreloader = this.getPreloader();

      if (vPreloader)
      {
        // remove event connection
        vPreloader.removeEventListener("load", this._onload, this);
        vPreloader.removeEventListener("error", this._onerror, this);

        this.forcePreloader(null);
      }

      if (this._image)
      {
        // Remove leaking filter attribute before leaving page
        this._image.style.filter = "";
        this._image = null;
      }

      qx.manager.object.ImageManager.getInstance().remove(this);

      return qx.ui.basic.Terminator.prototype.dispose.call(this);
    }
  },

  defer : function(clazz, proto)
  {
    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      proto._applyEnabled = proto._postApply;
    }
  }

});