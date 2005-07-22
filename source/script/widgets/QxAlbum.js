function QxAlbum(albumList)
{
  QxWidget.call(this);
  
  this._blank = (new QxImageManager).getBlank();
  this._list = albumList;
  
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

QxAlbum.extend(QxWidget, "QxAlbum");

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
  while(dt.className.indexOf("albumCell") == -1 && dt.tagName != "BODY") {
    dt = dt.parentNode;
  };
  
  if (dt.tagName == "BODY") {
    return null;
  };
  
  return dt;
};

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

proto.getItems = function() {
  return this._frame.childNodes;
};

proto.getFirstChild = function() {
  return this._frame.childNodes[0];
};

proto.getLastChild = function() {
  return this._frame.childNodes[this._frame.childNodes.length-1];
};

proto.createView = function()
{  
  var s = (new Date).valueOf();
  
  var protoCell = this.createProtoCell();  
  var frame = this._frame = document.createElement("div");
  
  this._frame.className = "clearfix";
  
  var cframe, cnode;
  
  for (var i=0, a=this._list, l=a.length, d; i<l; i++)
  {
    d = a[i];
    
    cframe = protoCell.cloneNode(true);    
    
    cnode = cframe.childNodes[0];
    cnode.firstChild.nodeValue = d.title;
    
    cnode = cframe.childNodes[1];
    
    cnode.width = d.thumbWidth;
    cnode.height = d.thumbHeight;
    
    if (cnode.runtimeStyle && !window.opera) {
      cnode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + d.src + "',sizingMethod='scale')";
    } else {
      cnode.src = d.src;
    };
    
    cnode.style.marginLeft = cnode.style.marginRight = Math.floor((75-d.thumbWidth)/2) + "px";
    cnode.style.marginTop = cnode.style.marginBottom = Math.floor((75-d.thumbHeight)/2) + "px";

    cnode = cframe.childNodes[2];
    cnode.firstChild.nodeValue = d.comment;
    
    frame.appendChild(cframe);    
  };
  
  return frame;
};

proto.createProtoCell = function()
{
  var frame = document.createElement("div");  
  frame.className = "albumCell";
  frame.unselectable = "on";
  
  var title = document.createElement("div");
  title.className = "albumTitle";
  title.unselectable = "on";
  var ttext = document.createTextNode("-");
  title.appendChild(ttext);
  
  var image = new Image();
  image.src = this._blank;
  
  var footer = document.createElement("div");
  footer.className = "albumFooter";
  footer.unselectable = "on";
  var ftext = document.createTextNode("-");
  footer.appendChild(ftext);
  
  frame.appendChild(title);
  frame.appendChild(image);
  frame.appendChild(footer);
  
  return frame;
};
