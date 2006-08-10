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

#require(qx.sys.Client)

************************************************************************ */

/*!
  A string buffer class

  += operator is faster in Firefox and Opera
  Array push/join is faster in Internet Explorer
*/
qx.OO.defineClass("qx.type.Buffer", qx.core.Object,
function(vStr)
{
  qx.core.Object.call(this);

  this.init(vStr);
});


if (qx.sys.Client.isMshtml())
{
  qx.Proto.clear = function() {
    this._array = [];
  }

  qx.Proto.get = function() {
    return this._array.join(qx.constant.Core.EMPTY);
  }

  qx.Proto.add = function(vStr) {
    this._array.push(vStr);
  }

  qx.Proto.init = function(vStr) {
    vStr !== qx.constant.Core.EMPTY ? this._array = [vStr] : this._array = [];
  }

  qx.Proto.dispose = function()
  {
    if (this.getDisposed()) {
      return;
    }

    this._array = null;

    qx.core.Object.prototype.dispose.call(this);
  }
}
else
{
  qx.Proto.clear = function() {
    this._string = qx.constant.Core.EMPTY;
  }

  qx.Proto.get = function() {
    return this._string;
  }

  qx.Proto.add = function(vStr) {
    this._string += vStr;
  }

  qx.Proto.init = function(vStr) {
    this._string = vStr || qx.constant.Core.EMPTY;
  }

  qx.Proto.dispose = function()
  {
    if (this.getDisposed()) {
      return;
    }

    this._string = null;

    qx.core.Object.prototype.dispose.call(this);
  }
}

qx.Proto.toString = qx.Proto.get;
