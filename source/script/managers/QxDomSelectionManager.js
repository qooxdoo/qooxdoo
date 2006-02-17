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

#package(selection)

************************************************************************ */

function QxDomSelectionManager(vBoundedWidget)
{
  QxSelectionManager.call(this, vBoundedWidget);

  // the children does not fire onmouseover events so we could
  // not enable this and make it functional
  this.setDragSelection(false);

  this._selectedItems.getItemHashCode = this.getItemHashCode;
};

QxDomSelectionManager.extend(QxSelectionManager, "QxDomSelectionManager");



/*
---------------------------------------------------------------------------
  MAPPING TO BOUNDED WIDGET (DOM NODES)
---------------------------------------------------------------------------
*/

proto.getItemEnabled = function(oItem) {
  return true;
};

proto.getItemClassName = function(vItem) {
  return vItem.className || QxConst.CORE_EMPTY;
};

proto.setItemClassName = function(vItem, vClassName) {
  return vItem.className = vClassName;
};

proto.getItemBaseClassName = function(vItem)
{
  var p = vItem.className.split(QxConst.CORE_SPACE)[0];
  return p ? p : "Status";
};

proto.getNextSibling = function(vItem) {
  return vItem.nextSibling;
};

proto.getPreviousSibling = function(vItem) {
  return vItem.previousSibling;
};

proto.getFirst = function() {
  return this.getItems()[0];
};

proto.getLast = function()
{
  var vItems = this.getItems();
  return vItems[vItems.length-1];
};





/*
---------------------------------------------------------------------------
  MAPPING TO ITEM DIMENSIONS
---------------------------------------------------------------------------
*/

proto.getItemLeft = function(vItem) {
  return vItem.offsetLeft;
};

proto.getItemTop = function(vItem) {
  return vItem.offsetTop;
};

proto.getItemWidth = function(vItem) {
  return vItem.offsetWidth;
};

proto.getItemHeight = function(vItem) {
  return vItem.offsetHeight;
};






/*
---------------------------------------------------------------------------
  MAPPING TO ITEM PROPERTIES
---------------------------------------------------------------------------
*/

proto.getItemHashCode = function(oItem)
{
  if (oItem._hash) {
    return oItem._hash;
  };

  return oItem._hash = QxObject.toHashCode(oItem);
};

proto.isBefore = function(vItem1, vItem2)
{
  var pa = vItem1.parentNode;

  for (var i=0, l=pa.childNodes.length; i<l; i++)
  {
    switch(pa.childNodes[i])
    {
      case vItem2:
        return false;

      case vItem1:
        return true;
    };
  };
};

proto.scrollItemIntoView = function(vItem) {
  this.getBoundedWidget().scrollItemIntoView(vItem);
};

proto.getItems = function() {
  return this.getBoundedWidget().getItems();
};

proto.getAbove = function(vItem)
{
  var vParent = vItem.parentNode;
  var vFound = false;
  var vLeft = vItem.offsetLeft;
  var vChild;

  for (var i=vParent.childNodes.length-1; i>0; i--)
  {
    vChild = vParent.childNodes[i];

    if (vFound == false)
    {
      if (vChild == vItem) {
        vFound = true;
      };
    }
    else
    {
      if (vChild.offsetLeft == vLeft)
      {
        return vChild;
      };
    };
  };
};

proto.getUnder = function(vItem)
{
  var vParent = vItem.parentNode;
  var vFound = false;
  var vLeft = vItem.offsetLeft;
  var vChild;

  for (var i=0, l=vParent.childNodes.length; i<l; i++)
  {
    vChild = vParent.childNodes[i];

    if (vFound == false)
    {
      if (vChild == vItem) {
        vFound = true;
      };
    }
    else
    {
      if (vChild.offsetLeft == vLeft)
      {
        return vChild;
      };
    };
  };
};














/*
---------------------------------------------------------------------------
  ITEM CSS STATE MANAGMENT
---------------------------------------------------------------------------
*/

proto._updateState = function(vItem, vState, vIsState)
{
  var c = this.getItemClassName(vItem);
  var n = this.getItemBaseClassName(vItem) + "-" + vState;

  this.setItemClassName(vItem, vIsState ? c.add(n, " ") : c.remove(n, " "));
};

proto.renderItemSelectionState = function(vItem, vIsSelected) {
  this._updateState(vItem, "Selected", vIsSelected);
};

proto.renderItemAnchorState = function(vItem, vIsAnchor) {
  this._updateState(vItem, "Anchor", vIsAnchor);
};

proto.renderItemLeadState = function(vItem, vIsLead) {
  this._updateState(vItem, "Lead", vIsLead);
};
