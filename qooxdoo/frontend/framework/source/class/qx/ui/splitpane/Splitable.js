/* ************************************************************************
 
   qooxdoo - the new era of web development
 
   http://qooxdoo.org
 
   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org
 
   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
 
   Authors:
 * Volker Pauli
 
 ************************************************************************ */

/* ************************************************************************
#module(ui_splitpane)
 ************************************************************************ */


qx.OO.defineClass("qx.ui.splitpane.Splitable", qx.ui.layout.BoxLayout,
function() {
  
  qx.ui.layout.BoxLayout.call(this);
  
});







/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
 */











/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
 */

/**
 * adds a new widget
 *
 * @param widget {qx.ui.core.Widget) The widget to add.
 */
qx.Proto.add = function(widget) {
  if(this.getChildrenLength() >= 1) {
    qx.ui.layout.BoxLayout.prototype.add.call(this, this._getDefaultSeparator());
  }
  qx.ui.layout.BoxLayout.prototype.add.call(this, widget);
}

/**
 * adds a new widget at the begin
 *
 * @param widget {qx.ui.core.Widget) The widget to add.
 */
qx.Proto.addAtBegin = function(widget) {
  if(this.getChildrenLength() >= 1) {
    qx.ui.layout.BoxLayout.prototype.addAtBegin.call(this, this._getDefaultSeparator());
  }
  qx.ui.layout.BoxLayout.prototype.addAtBegin.call(this, widget);
}

/**
 * adds a new widget at the end
 *
 * @param widget {qx.ui.core.Widget) The widget to add.
 */
qx.Proto.addAtBegin = function(widget) {
  if(this.getChildrenLength() >= 1) {
    qx.ui.layout.BoxLayout.prototype.addAtEnd.call(this, this._getDefaultSeparator());
  }
  qx.ui.layout.BoxLayout.prototype.addAtEnd.call(this, widget);
}

/**
 * adds a new widget at the end
 *
 * @param widget {qx.ui.core.Widget) The widget to add.
 */
qx.Proto.addAtEnd = function(widget) {
  if(this.getChildrenLength() >= 1) {
    qx.ui.layout.BoxLayout.prototype.addAtEnd.call(this, this._getDefaultSeparator());
  }
  qx.ui.layout.BoxLayout.prototype.addAtEnd.call(this, widget);
}


/**
 * adds a widget at a defined position
 *
 * @param widget {qx.ui.core.Widget} The widget to add.
 * @param index {int} The position.
 */
qx.Proto.addAt = function(widget, index) {
  var realPosition = this._getIndexOfWidget(index);
  if(this.getChildrenLength() >= 1) {
    qx.ui.layout.BoxLayout.prototype.addAt.call(this, this._getDefaultSeparator(), realPosition);
  }
  qx.ui.layout.BoxLayout.prototype.addAt.call(this, widget, realPosition);
}


/**
 * adds a widget before another one
 *
 * @param widget {qx.ui.core.Widget} The widget to add.
 * @param before {qx.ui.core.Widget} The widget will be added before this one.
 */
qx.Proto.addBefore = function(widget, before) {
  qx.ui.layout.BoxLayout.prototype.addBefore.call(this, widget, before);
  qx.ui.layout.BoxLayout.prototype.addBefore.call(this, this._getDefaultSeparator(), before);
}


/**
 * adds a widget after another one
 *
 * @param widget {qx.ui.core.Widget} The widget to add.
 * @param after {qx.ui.core.Widget} The widget will be added after this one.
 */
qx.Proto.addAfter = function(widget, after) {
  qx.ui.layout.BoxLayout.prototype.addBefore.call(this, widget, after);
  qx.ui.layout.BoxLayout.prototype.addBefore.call(this, this._getDefaultSeparator(), after);
}


/**
 * removes a widget at a defined position
 *
 * @param index {int} The index of the widget to be removed.
 */
qx.Proto.removeAt = function(index) {
  var realPosition = this._getIndexOfWidget(index);
  qx.ui.layout.BoxLayout.prototype.removeAt(index);
  (index > 0) ? qx.ui.layout.BoxLayout.prototype.removeAt.call(index - 1) : qx.ui.layout.BoxLayout.prototype.removeAt.call(index + 1);
}


/**
 * removes one or multiple widgets
 */
qx.Proto.remove = function() {
  if(arguments.length == 0) {
    return;
  }
  qx.ui.layout.BoxLayout.prototype.remove.call(this, arguments);
  
  var children = qx.ui.layout.BoxLayout.prototype.getChildren.call(this);
  var cLength = children.length;
  
  var isSep = false;
  
  for(var i = cLength; i > 0; i--) {
    if(children[i] instanceof qx.ui.splitpane.Separator) {
      if(isSep) qx.ui.layout.BoxLayout.prototype.remove.call(this, children[i]);
      isSep = true;
    } else {
      isSep = false;
    }
  }
}


/**
 * Returns an array of the children (widgets without the separators).
 *
 * @return {qx.ui.core.Widget[]} The array of children.
 */
qx.Proto.getChildren = function() {
  
  var widgets = [];
  
  var children = qx.ui.layout.BoxLayout.prototype.getChildren.call(this);
  
  for(var i = 0, l = children.length; i < l; i++) {
    if(!(children[i] instanceof qx.ui.splitpane.Separator)) {
      widgets.push(children[i]);
    }
  }
  return widgets;
}


/**
 * Returns length of children array.
 *
 * @return {int} Length of array.
 */
qx.Proto.getChildrenLength = function() {
  return this.getChildren().length;
}

/*
---------------------------------------------------------------------------
  HELPER
---------------------------------------------------------------------------
 */

qx.Proto._getIndexOfWidget = function(position) {
  return ((2 * position) - 1);
}





/*
---------------------------------------------------------------------------
  PRIVAT METHODS
---------------------------------------------------------------------------
 */

/**
 * returns the default seperator
 * it is supposed to be overwritten by subclasses
 *
 * @return {qx.ui.splitpane.Separator} The seperator object.
 */

qx.Proto._getDefaultSeparator = function() {
  return new qx.ui.splitpane.Separator();
}






/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
 */












/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
 */

