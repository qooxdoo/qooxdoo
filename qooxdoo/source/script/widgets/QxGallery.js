function QxGallery(vGalleryList)
{
  QxWidget.call(this);
  
  this._blank = (new QxImageManager).getBlank();
  this._list = vGalleryList;
  
  this._addCssClassName("QxWidget");
  this.setOverflow("auto");
  
  this._manager = new QxDomSelectionManager(this);  
  
  this._manager.setMultiColumnSupport(true);

  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseup", this._onmouseup);
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

proto.updateImageSrcById = function(vId, vSrc) {
  return this.updateImageSrcByPosition(this.getPositionById(vId), vSrc);
};

proto.updateImageSrcByPosition = function(vPos, vSrc)
{
  if (vPos == -1) {
    throw new Error("No valid Position: " + vPos);
  };

  var vNode = this.getNodeByPosition(vPos);

  vNode.getElementsByTagName("IMG")[0].src = vSrc;
  this._list.src = vSrc;
};

proto.deleteById = function(vId) {
  this.deleteByPosition(this.getPositionById(vId));
};

proto.deleteByPosition = function(vPos)
{
  if (vPos == -1) {
    throw new Error("No valid Position: " + vPos);
  };

  var vNode = this.getNodeByPosition(vPos);
  
  if (vNode) {
    vNode.parentNode.removeChild(vNode);
  };
  
  this._list.removeAt(vPos);  
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
  
  var tWidth = this.getThumbMaxWidth();
  var tHeight = this.getThumbMaxHeight();
  
  var protoCell = this.createProtoCell(tWidth, tHeight, this.getDecorHeight());  
  var frame = this._frame = document.createElement("div");
  
  this._frame.className = "galleryFrame clearfix";
  
  var cframe, cnode;
  
  for (var i=0, a=this._list, l=a.length, d; i<l; i++)
  {
    d = a[i];
    
    cframe = protoCell.cloneNode(true);    
    
    cframe.id = d.id;
    cframe.pos = i;    
    
    if (this.getShowTitle())
    {
      cnode = cframe.childNodes[0];
      cnode.firstChild.nodeValue = d.title;
    };
    
    cnode = cframe.childNodes[this.getShowTitle() ? 1 : 0];
    
    cnode.width = d.thumbWidth;
    cnode.height = d.thumbHeight;
    
    if (cnode.runtimeStyle && !window.opera) {
      cnode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + d.src + "',sizingMethod='scale')";
    } else {
      cnode.src = d.src;
    };
    
    cnode.style.marginLeft = cnode.style.marginRight = Math.floor((tWidth-d.thumbWidth)/2) + "px";
    cnode.style.marginTop = cnode.style.marginBottom = Math.floor((tHeight-d.thumbHeight)/2) + "px";

    if (this.getShowComment())
    {
      cnode = cframe.childNodes[this.getShowTitle() ? 2 : 1];
      cnode.firstChild.nodeValue = d.comment;
    };
    
    frame.appendChild(cframe);    
  };
  
  return frame;
};

proto.createProtoCell = function(tWidth, tHeight, fHeight)
{
  var frame = document.createElement("div");  
  frame.className = "galleryCell";
  frame.unselectable = "on";
  frame.style.width = tWidth + "px";
  frame.style.height = (tHeight + fHeight) + "px";
  
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
  
  return frame;
};
