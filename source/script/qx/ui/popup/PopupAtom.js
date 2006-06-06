/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#package(popup)

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
};

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._atom)
  {
    this._atom.dispose();
    this._atom = null;
  };

  return qx.ui.popup.Popup.prototype.dispose.call(this);
};
