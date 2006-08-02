/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#use(qx.constant.Type)

************************************************************************ */

qx.OO.defineClass("qx.lang.Object");

/*!
  Function to check if a hash has any keys
*/
qx.lang.Object.isEmpty = function(h)
{
  for (var s in h) {
    return false;
  }

  return true;
}

qx.lang.Object.hasMinLength = function(h, j)
{
  var i=0;

  for (var s in h)
  {
    if ((++i)>=j) {
      return true;
    }
  }

  return false;
}

qx.lang.Object.getLength = function(h)
{
  var i=0;

  for (var s in h) {
    i++;
  }

  return i;
}

qx.lang.Object.getKeys = function(h)
{
  var r = [];
  for (var s in h) {
    r.push(s);
  }

  return r;
}

qx.lang.Object.getKeysAsString = function(h) {
  return qx.lang.Object.getKeys(h).join(", ");
}

qx.lang.Object.getValues = function(h)
{
  var r = [];
  for (var s in h) {
    r.push(h[s]);
  }

  return r;
}

qx.lang.Object.mergeWith = function(vObjectA, vObjectB)
{
  for (var vKey in vObjectB) {
    vObjectA[vKey] = vObjectB[vKey];
  }

  return vObjectA;
}

qx.lang.Object.carefullyMergeWith = function(vObjectA, vObjectB) {
  for (vKey in vObjectB)
  {
    if (typeof vObjectA[vKey] === qx.constant.Type.UNDEFINED) {
      vObjectA[vKey] = vObjectB[vKey];
    }
  }

  return vObjectA;
}

qx.lang.Object.merge = function(vObjectA)
{
  var vLength = arguments.length;

  for (var i=1; i<vLength; i++) {
    qx.lang.Object.mergeWith(vObjectA, arguments[i]);
  }

  return vObjectA;
}

qx.lang.Object.copy = function(vObject) {
  return qx.lang.Object.mergeWith({}, vObject);
}
