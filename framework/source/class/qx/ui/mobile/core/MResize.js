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
    this._setHeight(window.innerHeight);
    qx.event.Registration.addListener(window, "orientationchange", this._resize, this);
    qx.event.Registration.addListener(window, "resize", this._resize, this);
    this.addListener("domupdated", this._resize, this);
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


    /**
     * Resizes the container element to the height of the parent element.
     */
    _resize : function()
    { 
      var parent = this.getLayoutParent();
      if (parent) {
        var height = parent.getContainerElement().offsetHeight;
        if (!this.getFireDomUpdatedOnResize()) {
          this._setHeight(height);
        } else if (this.__lastHeight != height) {
          this._setHeight(height);
          this.__lastHeight = height;
          this._domUpdated();
        }
      }
    },


    /**
     * Sets the height of the container element.
     * 
     * @param height {Integer} The height to set
     */
    _setHeight : function(height) {
      var element = this.getContainerElement();
      if (qx.core.Environment.get("qx.mobile.nativescroll"))
      {
        qx.bom.element.Style.set(element, "minHeight", height + "px");
      } else {
        qx.bom.element.Style.set(element, "height", height + "px");
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */


  destruct : function() {
    this.removeListener("domupdated", this._resize, this);
    qx.event.Registration.removeListener(window, "orientationchange", this._resize, this);
    qx.event.Registration.removeListener(window, "resize", this._resize, this);
  }
})