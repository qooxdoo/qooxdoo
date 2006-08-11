/* ****************************************************************************

   qooxdoo - the new era of web development

   Authors:
     * Dietrich Sreifert (ds)
       <dietrich dot streifert at visionet dot de>

**************************************************************************** */

/* ************************************************************************

#module(guicore)
#require(qx.core.Object)
#require(qx.ui.core.Parent)

************************************************************************ */

function QxChildrenIterator(vParent)
{
  qx.core.Object.call(this);

  this._parent    = vParent;
  this._curParent = vParent;
  this._curChild  = null;
  this._curLvl = 0;
  this._curPos = [];
  this._curPos[this._curLvl] = 0;
});


/*
------------------------------------------------------------------------------------
  Instance variables
------------------------------------------------------------------------------------
*/

qx.Proto._parent = null;
qx.Proto._curParent = null;
qx.Proto._curChild = null;
qx.Proto._curLvl = 0;
qx.Proto._curPos = null ;


qx.Proto.getParent = function() {
  return this._parent;
}


qx.Proto.getCurParent = function() {
  return this._curParent;
}


qx.Proto.getCurPos = function() {
  return this._curLvl[this._curPos];
}


qx.Proto.getCurLvl = function() {
  return this._curLvl;
}



/*
------------------------------------------------------------------------------------
  getNext: Iterate through the children tree.
------------------------------------------------------------------------------------
*/

qx.Proto.getNext = function() {
 
  /* if curChild is equal to the starting parent we have finished
   */
  if ( this._curChild == this._parent ) {
    return null;
  }

  var qxChildren = this._curParent.getChildren();
  var childrenLength = qxChildren == null ? 0 : qxChildren.length;

  /* the last child was already returned.
   * now we have to go one level up and return the parent
   */
  if ( this._curPos[this._curLvl] >= childrenLength ) {
    this._curPos[this._curLvl] = 0;
    this._curLvl -= 1;
    this._curChild  = this._curParent;
    this._curParent = this._curParent.getParent();
    this._curPos[this._curLvl] += 1;
    return this._curChild;
  }
  
  /* we have not finished the current child
   */
  this._curChild = qxChildren[this._curPos[this._curLvl]];

  /* now test if the current child has children itself
  */ 
  var qxChildren = this._curChild.getChildren();
  if ( qxChildren != null ) {
    this._curLvl += 1;
    this._curPos[this._curLvl] = 0;
    this._curParent = this._curChild;
    this._curChild = null;
    return this.getNext()
  }
  /* if there are no children return the current child and increment
   * the position on this level
   */
  else {
    this._curPos[this._curLvl] += 1;
    return this._curChild;
  }
}



/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/
qx.Proto.dispose = function() {
  this._parent = null;
  this._curParent = null;
  this._curChild = null;
  this._curPos = null;
}

