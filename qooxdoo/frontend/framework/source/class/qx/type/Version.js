/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * This class contains a version string and can extract
 * major, minor and revision flags from this string. It can also
 * compare a incoming version object with the stored version string
 * and checks if this version is smaller or identical than the stored
 * one.
 *
 * Flash detection and embed (http://blog.deconcept.com/flashobject) (non qooxdoo Version by Geoff Stearns)
 * Copyright 2005 Geoff Stearns. Released under the MIT License (http://www.opensource.org/licenses/mit-license.php).
 *
 * Modified for qooxdoo by Sebastian Werner. Based on version 1.2.3. Relicensed under LGPL in assent of Geoff Stearns.
 *
 * @param arrVersion {Array|String} array with three elements defining major, minor and revision number
 *   or a version string separated by '.' 
 */
qx.OO.defineClass("qx.type.Version", qx.core.Object,
function(arrVersion)
{
  qx.core.Object.call(this);

  if (typeof arrVersion === "string") {
    arrVersion = arrVersion.split(".");
  }

  this._major = parseInt(arrVersion[0]) || 0;
  this._minor = parseInt(arrVersion[1]) || 0;
  this._rev = parseInt(arrVersion[2]) || 0;
});




/*
---------------------------------------------------------------------------
  DATA FIELDS
---------------------------------------------------------------------------
*/

qx.Proto._major = 0;
qx.Proto._minor = 0;
qx.Proto._rev = 0;





/*
---------------------------------------------------------------------------
  USER VERSION ACCESS
---------------------------------------------------------------------------
*/

/**
 * Comapres the Version with another version number.
 * Returns true if this version instance has a bigger version number
 * 
 * @param fv {qx.type.Version} Version number to compare with
 * @return {Boolean} whether the version instance has a bigger version numbers.
 */
qx.Proto.versionIsValid = function(fv)
{
  if (this.getMajor() < fv.getMajor()) return false;
  if (this.getMajor() > fv.getMajor()) return true;

  if (this.getMinor() < fv.getMinor()) return false;
  if (this.getMinor() > fv.getMinor()) return true;

  if (this.getRev() < fv.getRev()) return false;

  return true;
};


/**
 * Return major version number
 * 
 * @return {String|Integer} major version number
 */
qx.Proto.getMajor = function() {
  return this._major;
};


/**
 * Return minor version number
 * 
 * @return {String|Integer} minor version number
 */
qx.Proto.getMinor = function() {
  return this._minor;
};


/**
 * Return revision number
 * 
 * @return {String|Integer} revision number
 */
qx.Proto.getRev = function() {
  return this._rev;
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

/** Destructor */
qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  this._major = this._minor = this._rev = null;

  qx.core.Object.prototype.dispose.call(this);
}
