/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Version:
     $Id: QxChildrenIterator.js

   Authors:
     * Dietrich Sreifert (ds)
       <dietrich dot streifert at visionet dot de>

**************************************************************************** */

/* ************************************************************************

#package(guicore)
#require(QxObject)
#require(QxParent)

************************************************************************ */

function QxChildrenIterator(vParent)
{
  QxObject.call(this);

  this._parent    = vParent;
  this._curParent = vParent;
  this._curChild  = null;
  this._curLvl = 0;
  this._curPos = [];
  this._curPos[this._curLvl] = 0;
};


QxChildrenIterator.extend(QxObject, "QxChildrenIterator");


/*
------------------------------------------------------------------------------------
  Instance variables
------------------------------------------------------------------------------------
*/

proto._parent = null;
proto._curParent = null;
proto._curChild = null;
proto._curLvl = 0;
proto._curPos = null ;


proto.getParent = function() {
  return this._parent;
};


proto.getCurParent = function() {
  return this._curParent;
};


proto.getCurPos = function() {
  return this._curLvl[this._curPos];
};


proto.getCurLvl = function() {
  return this._curLvl;
};



/*
------------------------------------------------------------------------------------
  getNext: Iterate through the children tree.
------------------------------------------------------------------------------------
*/

proto.getNext = function() {
 
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
};



/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/
proto.dispose = function() {
  this._parent = null;
  this._curParent = null;
  this._curChild = null;
  this._curPos = null;
};

