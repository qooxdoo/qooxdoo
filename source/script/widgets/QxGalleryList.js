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

function QxGalleryList(galleryList)
{
  QxTerminator.call(this);

  this._blank = QxImageManager.buildUri(QxConst.IMAGE_BLANK);
  this._list = galleryList;
  this._listSize = galleryList.length;
  this._processedImages = 0;

  this.setOverflow("auto");

  this.setHtmlProperty("className", "QxGalleryList");

  this._manager = new QxDomSelectionManager(this);

  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseup", this._onmouseup);
  this.addEventListener("click", this._onclick);
  this.addEventListener("dblclick", this._ondblclick);
  this.addEventListener("keydown", this._onkeydown);
};

QxGalleryList.extend(QxTerminator, "QxGalleryList");

QxGalleryList.addProperty({ name : "thumbMaxWidth", type : QxConst.TYPEOF_NUMBER, defaultValue : 60 });
QxGalleryList.addProperty({ name : "thumbMaxHeight", type : QxConst.TYPEOF_NUMBER, defaultValue : 60 });
QxGalleryList.addProperty({ name : "decorHeight", type : QxConst.TYPEOF_NUMBER, defaultValue : 40 });





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
  SELECTION MANAGER API
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
  CREATE VIEW
---------------------------------------------------------------------------
*/

proto.createView = function()
{
  var s = (new Date).valueOf();

  var protoCell = this.createProtoCell(this.getThumbMaxHeight());
  var frame = this._frame = document.createElement("div");

  this._frame.className = "galleryFrame clearfix";

  var cframe, cnode;

  for (var i=0, a=this._list, l=a.length, d; i<l; i++)
  {
    d = a[i];

    cframe = protoCell.cloneNode(true);

    cframe.id = d.id;
    cframe.pos = i;

    cnode = cframe.childNodes[0];
    cnode.firstChild.nodeValue = d.number;

    cnode = cframe.childNodes[1].firstChild;
    this.createImageCell(cnode, d);

    cnode = cframe.childNodes[2].firstChild;
    cnode.firstChild.nodeValue = d.title;

    cnode = cframe.childNodes[2].lastChild;
    cnode.firstChild.nodeValue = d.comment;

    frame.appendChild(cframe);
  };

  return frame;
};

proto._mshtml = QxClient.isMshtml();

proto.createImageCell = function(inode, d)
{
  if (this.hasEventListeners("loadComplete")) {
    inode.onload = QxGalleryList.imageOnLoad;
    inode.onerror = QxGalleryList.imageOnError;
    inode.gallery = this;
  };

  inode.width = d.thumbWidth;
  inode.height = d.thumbHeight;

  if (this._mshtml) {
    inode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + d.src + "',sizingMethod='scale')";
  } else {
    inode.src = d.src;
  };

  inode.style.marginLeft = inode.style.marginRight = Math.floor((this.getThumbMaxWidth()-d.thumbWidth)/2) + "px";
  inode.style.marginTop = inode.style.marginBottom = Math.floor((this.getThumbMaxHeight()-d.thumbHeight)/2) + "px";
};

proto.createProtoCell = function(tHeight)
{
  var frame = document.createElement("div");
  frame.className = "galleryCell";
  frame.unselectable = "on";
  frame.style.height = (tHeight + 2) + "px";

  var number = document.createElement("div");
  number.className = "galleryNumber";
  number.unselectable = "on";
  var ntext = document.createTextNode("-");
  number.appendChild(ntext);

  var imageContainer = document.createElement("div");
  imageContainer.className = "galleryImageContainer";
  imageContainer.unselectable = "on";

  var image = new Image();
  image.src = this._blank;

  imageContainer.appendChild(image);

  var text = document.createElement("div");
  text.className = "galleryText";
  text.unselectable = "on";
  text.style.width = (this.getWidth()-100-this.getThumbMaxWidth()) + "px";

  var title = document.createElement("h3");
  var ttext = document.createTextNode("-");
  title.appendChild(ttext);
  title.unselectable = "on";
  text.appendChild(title);

  var comment = document.createElement("p");
  var ctext = document.createTextNode("-");
  comment.appendChild(ctext);
  comment.unselectable = "on";
  text.appendChild(comment);


  frame.appendChild(number);
  frame.appendChild(imageContainer);
  frame.appendChild(text);

  return frame;
};







/*
---------------------------------------------------------------------------
  PRELOADING
---------------------------------------------------------------------------
*/

proto.imageOnComplete = function()
{
  this._processedImages++;

  if(this._processedImages == this._listSize) {
    this.dispatchEvent(new QxEvent("loadComplete"), true);
  };
};

QxGalleryList.imageOnLoad = function()
{
  this.gallery.imageOnComplete();
  this.gallery = null;
  this.onload = null;
  this.onerror = null;
};

QxGalleryList.imageOnError = function()
{
  this.gallery.imageOnComplete();
  this.gallery = null;
  this.onload = null;
  this.onerror = null;
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
  this._frame = null;

  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };

  this.removeEventListener("mousedown", this._onmousedown);
  this.removeEventListener("mouseup", this._onmouseup);
  this.removeEventListener("click", this._onclick);
  this.removeEventListener("dblclick", this._ondblclick);
  this.removeEventListener("keydown", this._onkeydown);

  return QxTerminator.prototype.dispose.call(this);
};
