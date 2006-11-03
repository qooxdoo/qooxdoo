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

#module(ui_window)
#require(qx.ui.window.BaseResizer)
*
************************************************************************ */

/**
 * This class acts as a wrapper for other child, and allows it to be resized (not moved), normally in
 * the right and/or bottom directions.  Child can be e.g. a qx.ui.form.TextArea,
 * qx.ui.table.Table or qx.ui.form.List.  It is an alternative to splitters.
 */
qx.OO.defineClass('qx.ui.window.Resizer', qx.ui.layout.CanvasLayout, function(child) {
  qx.ui.layout.CanvasLayout.call(this);
  // This simulates multiple inheritance
  qx.ui.window.BaseResizer._inheritFrom(this);

  this._registerResizeEvents();

  this.setAppearance('resizer');
  this.setResizeableWest(false);
  this.setResizeableNorth(false);

  this.setMinWidth(qx.constant.Core.AUTO);
  this.setMinHeight(qx.constant.Core.AUTO);
  this.auto();

  if (child) {
  	// Remove child border, as the resizer has already its own border.
    child.setBorder(new qx.renderer.border.Border(0));
  	this.add(this._child = child);
  }
});

/**
 * Overriden from qx.ui.window.BaseResizer
 */
qx.Proto._changeWidth = function(value) {
  var child = this.getChildren()[0];
  if (child) {
    child.setWidth(value);
  }
}

/**
 * Overriden from qx.ui.window.BaseResizer
 */
qx.Proto._changeHeight = function(value) {
  var child = this.getChildren()[0];
  if (child) {
    child.setHeight(value);
  }
}

/**
 * Overriden from qx.ui.window.BaseResizer
 */
qx.Proto._getResizeParent = function() {
  return this.getTopLevelWidget();
}

/**
 * Overriden from qx.ui.window.BaseResizer
 */
qx.Proto._getMinSizeReference = function() {
  return this._child;
}

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }
  this._disposeResizer.call(this, arguments);
  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}
