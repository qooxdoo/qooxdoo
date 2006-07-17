/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(popup)

************************************************************************ */

qx.OO.defineClass("qx.ui.popup.PopupAtom", qx.ui.popup.Popup, 
function(vLabel, vIcon)
{
  qx.ui.popup.Popup.call(this);

  this._atom = new qx.ui.basic.Atom(vLabel, vIcon);
  this._atom.setParent(this);
});

qx.Proto.getAtom = function() {
  return this._atom;
}

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (this._atom)
  {
    this._atom.dispose();
    this._atom = null;
  }

  return qx.ui.popup.Popup.prototype.dispose.call(this);
}
