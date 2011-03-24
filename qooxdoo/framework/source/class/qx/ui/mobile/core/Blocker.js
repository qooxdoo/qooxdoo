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
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Class.define("qx.ui.mobile.core.Blocker",
{
  extend : qx.ui.mobile.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    defaultCssClass :
    {
      refine : true,
      init : "blocker"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __count : 0,


    show : function()
    {
      this.__count++;
      if (this.__count == 0)
      {
        this._updateSize();
        this.__registerEventListener();
        this.setDisplay(true);
      }
    },


    hide : function()
    {
      this.__count--;
      if (this.__count <= 0)
      {
        this.__count = 0;
        this.setDisplay(false);
      }
    },


    forceHide : function()
    {
      this.__count = 0;
      this.hide();
    },


    isShown : function()
    {
      return this.__count > 0;
    },


    _updateSize : function()
    {
      this._getElement().style.top = qx.bom.Viewport.getScrollTop() + "px";
      this._getElement().style.left = qx.bom.Viewport.getScrollLeft() + "px";
      this._getElement().style.width = qx.bom.Viewport.getWidth() + "px";
      this._getElement().style.height = qx.bom.Viewport.getHeight()  + "px";
    },


    _onTouch : function(evt)
    {
      evt.preventDefault();
    },


    _onScroll : function(evt)
    {
      this._updateSize();
    },


    __registerEventListener : function()
    {
      qx.event.Registration.addListener(window, "resize", this._updateSize, this);
      qx.event.Registration.addListener(window, "scroll", this._onScroll, this);
      qx.event.Registration.addListener(document, "touchstart", this._onTouch, this);
      qx.event.Registration.addListener(document, "touchmove", this._onTouch, this);
    },


    __unregisterEventListener : function()
    {
      qx.event.Registration.removeListener(window, "resize", this._updateSize, this);
      qx.event.Registration.removeListener(window, "scroll", this._onScroll, this);
      qx.event.Registration.removeListener(document, "touchstart", this._onTouch, this);
      qx.event.Registration.removeListener(document, "touchmove", this._onTouch, this);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__unregisterEventListener();
  }
});
