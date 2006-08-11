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

#module(toolbar)

************************************************************************ */

qx.OO.defineClass("qx.ui.toolbar.ToolBarPart", qx.ui.layout.HorizontalBoxLayout,
function()
{
  qx.ui.layout.HorizontalBoxLayout.call(this);

  this._handle = new qx.ui.toolbar.ToolBarPartHandle;
  this.add(this._handle);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "toolbar-part" });





/*
---------------------------------------------------------------------------
  CLONE
---------------------------------------------------------------------------
*/

// Omit recursive cloning of qx.ui.toolbar.ToolBarPartHandle
qx.Proto._cloneRecursive = function(cloneInstance)
{
  var vChildren = this.getChildren();
  var vLength = vChildren.length;

  for (var i=0; i<vLength; i++) {
    if (!(vChildren[i] instanceof qx.ui.toolbar.ToolBarPartHandle)) {
      cloneInstance.add(vChildren[i].clone(true));
    }
  }
}





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (this._handle)
  {
    this._handle.dispose();
    this._handle = null;
  }

  return qx.ui.layout.HorizontalBoxLayout.prototype.dispose.call(this);
}
