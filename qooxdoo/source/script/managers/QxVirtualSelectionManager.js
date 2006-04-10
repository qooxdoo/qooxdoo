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

/*!
  This class represents a selection and manage incoming events for widgets which need selection support.
*/
function QxVirtualSelectionManager(vBoundedWidget) {
  QxSelectionManager.call(this, vBoundedWidget);
};

QxVirtualSelectionManager.extend(QxSelectionManager, "QxVirtualSelectionManager");





/*
---------------------------------------------------------------------------
  MAPPING TO BOUNDED WIDGET
---------------------------------------------------------------------------
*/

proto.getFirst = function() {
  return this.getItems().getFirst();
};

proto.getLast = function() {
  return this.getItems().getLast();
};

proto.getItems = function() {
  return this.getBoundedWidget().getData();
};

proto.getNextSibling = function(vItem) 
{
  var vData = this.getItems();
  return vData[vData.indexOf(vItem)+1];
};

proto.getPreviousSibling = function(vItem) 
{
  var vData = this.getItems();
  return vData[vData.indexOf(vItem)-1];
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





/*
---------------------------------------------------------------------------
  MAPPING TO ITEM DIMENSIONS
---------------------------------------------------------------------------
*/

proto.scrollItemIntoView = function(vItem, vTopLeft) {
  this.getBoundedWidget().scrollItemIntoView(vItem, vTopLeft);
};

proto.getItemLeft = function(vItem) {
  return this.getBoundedWidget().getItemLeft(vItem);
};

proto.getItemTop = function(vItem) {
  return this.getBoundedWidget().getItemTop(vItem);
};

proto.getItemWidth = function(vItem) {
  return this.getBoundedWidget().getItemWidth(vItem);
};

proto.getItemHeight = function(vItem) {
  return this.getBoundedWidget().getItemHeight(vItem);
};

/*!
  In a QxListView there are no disabled entries support currently.
*/
proto.getItemEnabled = function(vItem) {
  return true;
};






/*
---------------------------------------------------------------------------
  ITEM STATE MANAGMENT
---------------------------------------------------------------------------
*/

proto.renderItemSelectionState = function(vItem, vIsSelected) {
  this.getBoundedWidget()._updateSelectionState(vItem, vIsSelected);
};

proto.renderItemAnchorState = function(vItem, vIsAnchor) {
  this.getBoundedWidget()._updateAnchorState(vItem, vIsAnchor);
};

proto.renderItemLeadState = function(vItem, vIsLead) {
  this.getBoundedWidget()._updateLeadState(vItem, vIsLead);
};
