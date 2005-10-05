function QxGallery(vGalleryList)
{
  QxWidget.call(this);

  this._blank = (new QxImageManager).getBlank();
  this._list = vGalleryList;
  this._listSize = vGalleryList.length; 
  this._processedImages = 0;

  this._addCssClassName("QxWidget");
  this.setOverflow("auto");

  this._manager = new QxDomSelectionManager(this);

  this._manager.setMultiColumnSupport(true);

  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseup", this._onmouseup);
  this.addEventListener("mousemove", this._onmousemove);

  this.addEventListener("click", this._onclick);
  this.addEventListener("dblclick", this._ondblclick);

  this.addEventListener("keydown", this._onkeydown);
};

QxGallery.extend(QxWidget, "QxGallery");





/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxGallery.addProperty({ name : "thumbMaxWidth", type : Number, defaultValue : 100 });
QxGallery.addProperty({ name : "thumbMaxHeight", type : Number, defaultValue : 100 });
QxGallery.addProperty({ name : "decorHeight", type : Number, defaultValue : 40 });
QxGallery.addProperty({ name : "showTitle", type : Boolean, defaultValue : true });
QxGallery.addProperty({ name : "showComment", type : Boolean, defaultValue : true });






/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyVisible = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    var o = this;
    window.setTimeout(function()
    {
      o.getElement().appendChild(o.createView());
    }, 100);
  };

  return QxWidget.prototype._modifyVisible.call(this, propValue, propOldValue, propName, uniqModIds);
};






/*
  -------------------------------------------------------------------------------
    UTILITIES
  -------------------------------------------------------------------------------
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
  this.getElement().innerHTML = "";
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
  -------------------------------------------------------------------------------
    EVENT HANDLER
  -------------------------------------------------------------------------------
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
  if (typeof QxToolTipManager != "function") {
    return;
  };

  var vItem = this.getListItemTarget(e.getDomTarget());

  if (vItem == this._lastItem) {
    return;
  };

  if (this._lastItem)
  {
    var vEventObject = new QxMouseEvent("mouseout", e, false, this._lastItem);
    (new QxToolTipManager).handleMouseOut(vEventObject);
    vEventObject.dispose();
  };

  if (vItem)
  {
    if (this.hasEventListeners("beforeToolTipAppear")) {
      this.dispatchEvent(new QxDataEvent("beforeToolTipAppear", vItem));
    };

    if (!this.getToolTip()) {
      return;
    };

    var vEventObject = new QxMouseEvent("mouseout", e, false, vItem);
    (new QxToolTipManager).handleMouseOver(vEventObject);
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
  -------------------------------------------------------------------------------
    SCROLL-IMPL
  -------------------------------------------------------------------------------
*/

proto.scrollItemIntoView = function(vItem)
{
  this.scrollItemIntoViewX(vItem);
  this.scrollItemIntoViewY(vItem);
};

proto.scrollItemIntoViewX = function(vItem) {
  QxDOM.scrollIntoViewX(vItem, vItem.parentNode.parentNode);
};

proto.scrollItemIntoViewY = function(vItem) {
  QxDOM.scrollIntoViewY(vItem, vItem.parentNode.parentNode);
};





/*
  -------------------------------------------------------------------------------
    MANAGER REQUIREMENTS
  -------------------------------------------------------------------------------
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
  -------------------------------------------------------------------------------
    INTERNALS
  -------------------------------------------------------------------------------
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

proto.createImageCell = function(inode, d) 
{
  if (this.hasEventListeners("loadComplete")) {
    inode.onload = this.imageOnLoad;
    inode.onerror = this.imageOnError;
    inode.gallery = this;
  }
  
  if (inode.runtimeStyle && !window.opera) {
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
  }
};

proto.imageOnLoad = function()
{  
  this.gallery.imageOnComplete();  
  this.onload = null;
  this.onerror = null;
};

proto.imageOnError = function()
{
  this.gallery.imageOnComplete();
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