/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(menu)
#require(qx.renderer.border.BorderObjectPresets)

************************************************************************ */

function QxMenuSeparator()
{
  qx.ui.layout.CanvasLayout.call(this);
  
  // Fix IE Styling Issues
  this.setStyleProperty("fontSize", "0");
  this.setStyleProperty("lineHeight", "0");

  // ************************************************************************
  //   LINE
  // ************************************************************************

  this._line = new qx.ui.basic.Terminator;
  this._line.setAnonymous(true);
  this._line.setAppearance("menu-separator-line");
  this.add(this._line);
  

  // ************************************************************************
  //   EVENTS
  // ************************************************************************
  
  // needed to stop the event, and keep the menu showing
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
};

QxMenuSeparator.extend(qx.ui.layout.CanvasLayout, "QxMenuSeparator");

QxMenuSeparator.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "menu-separator" });

proto.hasIcon = qx.util.returns.returnFalse;
proto.hasLabel = qx.util.returns.returnFalse;
proto.hasShortcut = qx.util.returns.returnFalse;
proto.hasMenu = qx.util.returns.returnFalse;

proto._onmousedown = function(e) {
  e.stopPropagation();
};

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };
  
  if (this._line)
  {
    this._line.dispose();
    this._line = null;
  };
  
  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
};
