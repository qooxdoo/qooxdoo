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

#package(gallery)
#require(QxDomScrollIntoView)
#require(QxDomSelectionManager)

************************************************************************ */

function QxGallery(vGalleryList)
{
  QxTerminator.call(this);

  this._blank = QxImageManager.buildUri(QxConst.IMAGE_BLANK);
  this._list = vGalleryList;
  this._listSize = vGalleryList.length;
  this._processedImages = 0;

  this.setOverflow("auto");

  this.setHtmlProperty("className", "QxGallery");

  this._manager = new QxDomSelectionManager(this);

  this._manager.setMultiColumnSupport(true);

  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseup", this._onmouseup);
  this.addEventListener("mousemove", this._onmousemove);

  this.addEventListener("click", this._onclick);
  this.addEventListener("dblclick", this._ondblclick);

  this.addEventListener("keydown", this._onkeydown);
};

QxGallery.extend(QxTerminator, "QxGallery");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxGallery.addProperty({ name : "thumbMaxWidth", type : QxConst.TYPEOF_NUMBER, defaultValue : 100 });
QxGallery.addProperty({ name : "thumbMaxHeight", type : QxConst.TYPEOF_NUMBER, defaultValue : 100 });
QxGallery.addProperty({ name : "decorHeight", type : QxConst.TYPEOF_NUMBER, defaultValue : 40 });
QxGallery.addProperty({ name : "showTitle", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });
QxGallery.addProperty({ name : "showComment", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });






/*
---------------------------------------------------------------------------
  ELEMENT HANDLING
---------------------------------------------------------------------------
*/

proto._applyElementData = function() {
  this.getElement().appendChild(this.createView());
};






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};

proto.getList = function() {
  return this._list;
};

proto.update = function(vGalleryList)
{
  this._manager.deselectAll();

  this._list = vGalleryList;

  var el = this.getElement();
  el.replaceChild(this.createView(), el.firstChild);
};

proto.removeAll = function()
{
  this._manager.deselectAll();
  this.getElement().innerHTML = QxConst.CORE_EMPTY;
};

proto.updateImageById = function(vId, vSrc, vWidth, vHeight) {
  this.updateImageSrcById(vId, vSrc);
  this.updateImageDimensionsById(vId, vWidth, vHeight);
};

proto.updateImageDimensionsById = function(vId, vWidth, vHeight) {
  this.updateImageDimensionsByPosition(this.getPositionById(vId), vWidth, vHeight);
};

proto.updateImageDimensionsByPosition = function(vPos, vWidth, vHeight) {
  // TBD: compare dimensions with max. thumb size and scale proportionally if necessary
  if (vPos == -1) {
    throw new Error("No valid Position: " + vPos);
  };

  var cnode = this.getNodeByPosition(vPos).getElementsByTagName("IMG")[0];

  cnode.width = vWidth;
  cnode.height = vHeight;

  cnode.style.marginLeft = cnode.style.marginRight = Math.floor((this.getThumbMaxWidth()-vWidth)/2) + "px";
  cnode.style.marginTop = cnode.style.marginBottom = Math.floor((this.getThumbMaxHeight()-vHeight)/2) + "px";

  this._list[vPos].thumbWidth = vWidth;
  this._list[vPos].thumbHeight = vHeight;
};

proto.updateImageSrcById = function(vId, vSrc) {
  this.updateImageSrcByPosition(this.getPositionById(vId), vSrc);
};

proto.updateImageSrcByPosition = function(vPos, vSrc)
{
  if (vPos == -1) {
    throw new Error("No valid Position: " + vPos);
  };

  var vNode = this.getNodeByPosition(vPos);

  vNode.getElementsByTagName("IMG")[0].src = vSrc;
  this._list[vPos].src = vSrc;
};

proto.deleteById = function(vId) {
  this.deleteByPosition(this.getPositionById(vId));
};

proto.deleteByPosition = function(vPos)
{
  this._manager.deselectAll();

  if (vPos == -1) {
    throw new Error("No valid Position: " + vPos);
  };

  var vNode = this.getNodeByPosition(vPos);

  if (vNode) {
    vNode.parentNode.removeChild(vNode);
  };

  this._list.splice(vPos, 1);
};

proto.getPositionById = function(vId)
{
  for (var i=0, a=this._list, l=a.length; i<l; i++) {
    if (a[i].id == vId) {
      return i;
    };
  };

  return -1;
};

proto.getEntryById = function(vId) {
  return this.getEntryByPosition(this.getPositionById(vId));
};

proto.getNodeById = function(vId) {
  return this.getNodeByPosition(this.getPositionById(vId));
};

proto.getEntryByPosition = function(vPosition) {
  return vPosition == -1 ? null : this._list[vPosition];
};

proto.getNodeByPosition = function(vPosition) {
  return vPosition == -1 ? null : this._frame.childNodes[vPosition];
};

proto.getEntryByNode = function(vNode) {
  return this.getEntryById(vNode.id);
};

proto.addFromPartialList = function(vPartialList)
{
  this.concat(vPartialList);

  for (var i=0, a=vPartialList, l=a.length; i<l; i++) {
    this._frame.appendChild(this.createCell(a[i], i));
  };
};

proto.addFromUpdatedList = function(vNewList)
{
  for (var a=vNewList, l=a.length, i=this._list.length; i<l; i++) {
    this._frame.appendChild(this.createCell(a[i], i));
  };

  this._list = vNewList;
};




/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  var vItem = this.getListItemTarget(e.getDomTarget());

  if (vItem) {
    this._manager.handleMouseDown(vItem, e);
  };
};

proto._onmouseup = function(e)
{
  var vItem = this.getListItemTarget(e.getDomTarget());

  if (vItem) {
    this._manager.handleMouseUp(vItem, e);
  };
};

proto._onmousemove = function(e)
{
  if (typeof QxToolTipManager !== QxConst.TYPEOF_OBJECT) {
    return;
  };

  var vItem = this.getListItemTarget(e.getDomTarget());

  if (vItem == this._lastItem) {
    return;
  };

  if (this._lastItem)
  {
    var vEventObject = new QxMouseEvent("mouseout", e, false, this._lastItem);
    QxToolTipManager.handleMouseOut(vEventObject);
    vEventObject.dispose();
  };

  if (vItem)
  {
    if (this.hasEventListeners("beforeToolTipAppear")) {
      this.dispatchEvent(new QxDataEvent("beforeToolTipAppear", vItem), true);
    };

    if (!this.getToolTip()) {
      return;
    };

    var vEventObject = new QxMouseEvent("mouseout", e, false, vItem);
    QxToolTipManager.handleMouseOver(vEventObject);
    vEventObject.dispose();

    this.setToolTip(null);
  };

  this._lastItem = vItem;
};

proto._onclick = function(e)
{
  var vItem = this.getListItemTarget(e.getDomTarget());

  if (vItem) {
    this._manager.handleClick(vItem, e);
  };
};

proto._ondblclick = function(e)
{
  var vItem = this.getListItemTarget(e.getDomTarget());

  if (vItem) {
    this._manager.handleDblClick(vItem, e);
  };
};

proto._onkeydown = function(e) {
  this._manager.handleKeyDown(e);
};

proto.getListItemTarget = function(dt)
{
  while(dt.className.indexOf("galleryCell") == -1 && dt.tagName != "BODY") {
    dt = dt.parentNode;
  };

  if (dt.tagName == "BODY") {
    return null;
  };

  return dt;
};





/*
---------------------------------------------------------------------------
  SCROLL INTO VIEW
---------------------------------------------------------------------------
*/

proto.scrollItemIntoView = function(vItem)
{
  this.scrollItemIntoViewX(vItem);
  this.scrollItemIntoViewY(vItem);
};

proto.scrollItemIntoViewX = function(vItem) {
  QxDom.scrollIntoViewX(vItem);
};

proto.scrollItemIntoViewY = function(vItem) {
  QxDom.scrollIntoViewY(vItem);
};





/*
---------------------------------------------------------------------------
  MANAGER REQUIREMENTS
---------------------------------------------------------------------------
*/

proto.getItems = function() {
  return this._frame.childNodes;
};

proto.getFirstChild = function() {
  return this._frame.childNodes[0];
};

proto.getLastChild = function() {
  return this._frame.childNodes[this._frame.childNodes.length-1];
};







/*
---------------------------------------------------------------------------
  INTERNALS
---------------------------------------------------------------------------
*/

proto.createView = function()
{
  var s = (new Date).valueOf();

  if (!this._protoCell) {
    this.createProtoCell();
  };

  this._frame = document.createElement("div");
  this._frame.className = "galleryFrame clearfix";

  for (var i=0, a=this._list, l=a.length; i<l; i++) {
    this._frame.appendChild(this.createCell(a[i], i));
  };

  return this._frame;
};

proto.createCell = function(d, i)
{
  var cframe = this._protoCell.cloneNode(true);

  cframe.id = d.id;
  cframe.pos = i;

  if (this.getShowTitle())
  {
    cnode = cframe.childNodes[0];
    cnode.firstChild.nodeValue = d.title;
  };

  var cnode = cframe.childNodes[this.getShowTitle() ? 1 : 0];
  this.createImageCell(cnode, d);

  if (this.getShowComment())
  {
    cnode = cframe.childNodes[this.getShowTitle() ? 2 : 1];
    cnode.firstChild.nodeValue = d.comment;
  };

  return cframe;
};

proto._mshtml = QxClient.isMshtml();

proto.createImageCell = function(inode, d)
{
  if (this.hasEventListeners("loadComplete"))
  {
    inode.onload = QxGallery.imageOnLoad;
    inode.onerror = QxGallery.imageOnError;
    inode.gallery = this;
  };

  if (this._mshtml) {
    inode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + d.src + "',sizingMethod='scale')";
  } else {
    inode.src = d.src;
  };

  inode.width = d.thumbWidth + 2;
  inode.height = d.thumbHeight + 2;
  inode.style.marginLeft = inode.style.marginRight = Math.floor((this.getThumbMaxWidth()-d.thumbWidth)/2) + "px";
  inode.style.marginTop = inode.style.marginBottom = Math.floor((this.getThumbMaxHeight()-d.thumbHeight)/2) + "px";
};

proto.imageOnComplete = function()
{
  this._processedImages++;

  if(this._processedImages == this._listSize) {
    this.dispatchEvent(new QxEvent("loadComplete"), true);
  };
};

QxGallery.imageOnLoad = function()
{
  this.gallery.imageOnComplete();
  this.gallery = null;
  this.onload = null;
  this.onerror = null;
};

QxGallery.imageOnError = function()
{
  this.gallery.imageOnComplete();
  this.gallery = null;
  this.onload = null;
  this.onerror = null;
};

proto.createProtoCell = function()
{
  var frame = this._protoCell = document.createElement("div");
  frame.className = "galleryCell";
  frame.unselectable = "on";
  frame.style.width = (this.getThumbMaxWidth() + 2) + "px";
  frame.style.height = (this.getThumbMaxHeight() + this.getDecorHeight() + 2) + "px";

  if (this.getShowTitle())
  {
    var title = document.createElement("div");
    title.className = "galleryTitle";
    title.unselectable = "on";
    var ttext = document.createTextNode("-");
    title.appendChild(ttext);

    frame.appendChild(title);
  };

  var image = new Image();
  image.src = this._blank;
  frame.appendChild(image);

  if (this.getShowComment())
  {
    var comment = document.createElement("div");
    comment.className = "galleryComment";
    comment.unselectable = "on";
    var ctext = document.createTextNode("-");
    comment.appendChild(ctext);

    frame.appendChild(comment);
  };
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  this._list = null;
  this._protoCell = null;
  this._frame = null;

  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };

  this.removeEventListener("mousedown", this._onmousedown);
  this.removeEventListener("mouseup", this._onmouseup);
  this.removeEventListener("mousemove", this._onmousemove);

  this.removeEventListener("click", this._onclick);
  this.removeEventListener("dblclick", this._ondblclick);

  this.removeEventListener("keydown", this._onkeydown);

  return QxTerminator.prototype.dispose.call(this);
};
