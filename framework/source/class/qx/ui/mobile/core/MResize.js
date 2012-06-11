/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 * 
 * This mixin resizes the container element to the height of the parent element.
 * Use this when the height can not be set by CSS.
 *
 */
qx.Mixin.define("qx.ui.mobile.core.MResize",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    // Initial size hint
    qx.event.Registration.addListener(window, "orientationchange", this.fixSize, this);
    qx.event.Registration.addListener(this, "appear", this._onAppear, this);
    
    this.addListener("domupdated", this.fixSize, this);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Whether the resize should fire the "domupdated" event. Set this to "true"
     *  whenever other elements should react on this size change (e.g. when the size
     *  change does not infect the size of the application, but other widgets should
     *  react).
     */
    fireDomUpdatedOnResize : {
      check : "Boolean",
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
    __lastHeight : null,
    __lastWidth : null,


    /**
     * Resizes the container element to the height of the parent element.
     */
    fixSize : function()
    { 
      var parent = this.getLayoutParent();
      
      if (parent && parent.getContainerElement()) {
        var height = parent.getContainerElement().offsetHeight;
        var width = parent.getContainerElement().offsetWidth;
        
        if (!this.getFireDomUpdatedOnResize()) {
          this._setHeight(height);
          this._setWidth(width);
        } else if (this.__lastHeight != height && this.__lastWidth != width) {
          this._setHeight(height);
          this._setWidth(width);
          this.__lastWidth = width;
          this.__lastHeight = height;
          this._domUpdated();
        }
      }
    },
    
    
    /**
     * Installs a resize listener on layout parent when widget appears.
     */
    _onAppear : function() 
    {
      var layoutParent = this.getLayoutParent();
      qx.event.Registration.addListener(layoutParent, "resize", this.fixSize, this);
      
      // Remove appear listener, because resize listener should only installed once.
      qx.event.Registration.removeListener(this, "appear", this._onAppear, this);
    },


    /**
     * Sets the height of the container element.
     * 
     * @param height {Integer} The height to set
     */
    _setHeight : function(height) 
    {
      var element = this.getContainerElement();
      if (qx.core.Environment.get("qx.mobile.nativescroll"))
      {
        qx.bom.element.Style.set(element, "minHeight", height + "px");
      } else {
        qx.bom.element.Style.set(element, "height", height + "px");
      }
    },
    
    
    
    /**
     * Sets the width of the container element.
     * 
     * @param width {Integer} The width to set
     */
    _setWidth : function(width) 
    {
      var element = this.getContainerElement();
      if (qx.core.Environment.get("qx.mobile.nativescroll"))
      {
        qx.bom.element.Style.set(element, "minWidth", width + "px");
      } else {
        qx.bom.element.Style.set(element, "width", width + "px");
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    qx.event.Registration.removeListener(window, "orientationchange", this.fixSize, this);
    qx.event.Registration.removeListener(window, "resize", this.fixSize, this);
    qx.event.Registration.removeListener(this, "appear", this._onAppear, this);
    qx.event.Registration.removeListener(this, "appear", this._onAppear, this);

    if(this.getLayoutParent()) 
    {
      qx.event.Registration.removeListener(this.getLayoutParent(), "resize", this.fixSize, this);
    }
  }
})