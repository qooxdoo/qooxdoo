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

#package(flash)

************************************************************************ */

/*!
  QxFlashPlayerVersion contains a version string and can extract
  major, minor and revision flags from this string. It can also
  compare a incoming version object with the stored version string
  and checks if this version is smaller or identical than the stored
  one.

  Original non qooxdoo Version by Geoff Stearns
    Flash detection and embed - http://blog.deconcept.com/flashobject/
    FlashObject is (c) 2005 Geoff Stearns and is released under the MIT License
    http://www.opensource.org/licenses/mit-license.php

  Modified for qooxdoo by Sebastian Werner
    Based on version 1.2.3
    Relicensed under LGPL in assent of Geoff Stearns
*/

function QxFlashPlayerVersion(arrVersion)
{
  QxObject.call(this);

  if (typeof arrVersion === QxConst.TYPEOF_STRING) {
    arrVersion = arrVersion.split(QxConst.CORE_DOT);
  };

  this._major = parseInt(arrVersion[0]) || 0;
  this._minor = parseInt(arrVersion[1]) || 0;
  this._rev = parseInt(arrVersion[2]) || 0;
};

QxFlashPlayerVersion.extend(QxObject, "QxFlashPlayerVersion");




/*
---------------------------------------------------------------------------
  DATA FIELDS
---------------------------------------------------------------------------
*/

proto._major = 0;
proto._minor = 0;
proto._rev = 0;





/*
---------------------------------------------------------------------------
  USER VERSION ACCESS
---------------------------------------------------------------------------
*/

proto.versionIsValid = function(fv)
{
  if (this.getMajor() < fv.getMajor()) return false;
  if (this.getMajor() > fv.getMajor()) return true;

  if (this.getMinor() < fv.getMinor()) return false;
  if (this.getMinor() > fv.getMinor()) return true;

  if (this.getRev() < fv.getRev()) return false;

  return true;
};

proto.getMajor = function() {
  return this._major;
};

proto.getMinor = function() {
  return this._minor;
};

proto.getRev = function() {
  return this._rev;
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._major = this._minor = this._rev = null;

  QxObject.prototype.dispose.call(this);
};
