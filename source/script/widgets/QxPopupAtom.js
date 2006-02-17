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

function QxPopupAtom(vLabel, vIcon)
{
  QxPopup.call(this);

  this._atom = new QxAtom(vLabel, vIcon);
  this._atom.setParent(this);
};

QxPopupAtom.extend(QxPopup, "QxPopupAtom");

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

  return QxPopup.prototype.dispose.call(this);
};
