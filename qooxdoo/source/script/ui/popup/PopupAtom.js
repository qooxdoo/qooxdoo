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

#package(popup)

************************************************************************ */

qx.ui.popup.PopupAtom = function(vLabel, vIcon)
{
  qx.ui.popup.Popup.call(this);

  this._atom = new qx.ui.basic.Atom(vLabel, vIcon);
  this._atom.setParent(this);
};

qx.ui.popup.PopupAtom.extend(qx.ui.popup.Popup, "qx.ui.popup.PopupAtom");

proto.getAtom = function() {
  return this._atom;
};

proto.dispose = function()
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
