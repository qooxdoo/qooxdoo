/*!
  This widget is the last widget of the current child chain.
*/
function QxTerminator()
{
  QxWidget.call(this);
};

QxTerminator.extend(QxWidget, "QxTerminator");

/*
  -------------------------------------------------------------------------------
    SPEED-UP - Overwrite some core QxWidget functions with placeholders.
  -------------------------------------------------------------------------------
*/

proto.getChildren = function() {
  return [];
};

proto.getChildrenLength = function() {
  return 0;
};

proto.hasChildren = proto.contains = function() {
  return false;
};

proto.getPreviousSibling = proto.getNextSibling = proto.getFirstChild = proto.getLastChild = function() {
  return null;
};

proto.add = proto.addBefore = proto.addAfter = proto.remove = proto.removeAll = proto._getParentNodeForChild = proto._appendElement = function() {
  throw new Error("Not implemented for " + this.classname);
};
