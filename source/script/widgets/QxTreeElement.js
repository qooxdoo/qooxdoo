function QxTreeElement(vLabel)
{
  QxWidget.call(this);

  // apply given label
  if (isValid(vLabel)) {
    this.setLabel(vLabel);
  };

  // the tree is internally a nested unordered list
  this.setTagName("li");
  
  // build correct uris for images
  var im = new QxImageManager();
  
  this._navigationLineURI = im.buildURI("widgets/tree/line.gif");

  this._navigationCrossURI = im.buildURI("widgets/tree/cross.gif");
  this._navigationCrossPlusURI = im.buildURI("widgets/tree/cross_plus.gif");
  this._navigationCrossMinusURI = im.buildURI("widgets/tree/cross_minus.gif");

  this._navigationEndURI = im.buildURI("widgets/tree/end.gif");
  this._navigationEndPlusURI = im.buildURI("widgets/tree/end_plus.gif");
  this._navigationEndMinusURI = im.buildURI("widgets/tree/end_minus.gif");

  this._navigationSimplePlusURI = im.buildURI("widgets/tree/plus.gif");
  this._navigationSimpleMinusURI = im.buildURI("widgets/tree/minus.gif");

  // event handler
  this.addEventListener("click", this._onclick);
  this.addEventListener("dblclick", this._ondblclick);
  this.addEventListener("mousedown", this._onmousedown);
  this.addEventListener("mouseover", this._onmouseover);
  this.addEventListener("mouseout", this._onmouseout);
  this.addEventListener("mousemove", this._onmouseover);
};

QxTreeElement.extend(QxWidget, "QxTreeElement");


/*
  -------------------------------------------------------------------------------
    GLOBAL
  -------------------------------------------------------------------------------
*/

QxTreeElement._indentCache = [];


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxTreeElement.addProperty({ name : "label", type : String });
QxTreeElement.addProperty({ name : "level", type : Number, defaultValue : 1 });
QxTreeElement.addProperty({ name : "active", type : Boolean, defaultValue : false });
QxTreeElement.addProperty({ name : "parentTree" });



/*
  -------------------------------------------------------------------------------
    PARENT/POSITION HANDLER
  -------------------------------------------------------------------------------
*/

proto._obtainLastChildState = function() {
  this._renderImplNavigation();
};

proto._loseLastChildState = function() {
  this._renderImplNavigation();
};




/*
  -------------------------------------------------------------------------------
    BASIC MODIFIERS
  -------------------------------------------------------------------------------
*/

// Emulation for folder functionality
proto.getOpen = function() {
  return false;
};

proto._shouldBecomeCreated = function() {
  return this.getParent().getOpen();
};

proto._modifyParent = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    this.setParentTree(propValue.getParentTree(), uniqModIds);
    this.setLevel(propValue.getLevel() + 1);
  }
  else
  {
    this.setParentTree(null, uniqModIds);
  };

  QxWidget.prototype._modifyParent.call(this, propValue, propOldValue, propName, uniqModIds);

  if (propValue && this.isCreated())
  {
    this._renderImplIndent();
    this._renderImplNavigation();
  };

  return true;
};

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  this._table = QxTreeElement._element.cloneNode(true);
  this._tableRow = this._table.firstChild.firstChild;

  this._indentCell = this._tableRow.childNodes[0];

  this._navigationCell = this._tableRow.childNodes[1];
  this._navigationImage = this._navigationCell.firstChild;

  this._iconCell = this._tableRow.childNodes[2];
  this._iconImage = this._iconCell.firstChild;

  this._labelCell = this._tableRow.childNodes[3];

  this._renderImplIndent();
  this._renderImplNavigation();
  this._renderImplIcon();
  this._renderImplLabel();

  propValue.appendChild(this._table);

  // create basic widget
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  return true;
};

proto._modifyParentTree = function(propValue, propOldValue, propName, uniqModIds)
{
  // Update Tree Lines if we switch from null to a valid value
  // and are created before
  if (this.isCreated() && !propOldValue && propValue) {
    this._renderImplNavigation();
    this._renderImplIndent();
  };

  return true;
};




/*
  -------------------------------------------------------------------------------
    MODIFIER FOR ACTIVE ELEMENT STATE
  -------------------------------------------------------------------------------
*/

proto._modifyActive = function(propValue, propOldValue, propName, uniqModIds)
{
  var p = this.getParentTree();
  var c = "QxTreeElementLabelCellSelected";

  if (propValue)
  {
    QxDOM.addClass(this._labelCell, c);
    if (p) { p.setActiveElement(this, uniqModIds); };
  }
  else
  {
    QxDOM.removeClass(this._labelCell, c);
    if (p) { p.setActiveElement(null, uniqModIds); };
  };

  return true;
};







/*
  -------------------------------------------------------------------------------
    MODIFIER AND RENDERER FOR LABEL
  -------------------------------------------------------------------------------
*/

proto._modifyLabel = function(propValue, propOldValue, propName, uniqModIds) {
  return this._renderImplLabel();
};

proto._renderImplLabel = function()
{
  if (!this.isCreated()) {
    return true;
  };

  var vLabel = this.getLabel();

  if (vLabel)
  {
    this._labelCell.firstChild.nodeValue = vLabel;
    this._table.style.display = "block";
  }
  else
  {
    this._table.style.display = "none";
  };

  return true;
};





/*
  -------------------------------------------------------------------------------
    MODIFIER AND RENDERER FOR ICON
  -------------------------------------------------------------------------------
*/

proto._renderImplIcon = function()
{
  if (!this.isCreated()) {
    return true;
  };

  this._iconImage.src = (new QxImageManager).getBlank();

  return true;
};




/*
  -------------------------------------------------------------------------------
    MODIFIER AND RENDERER FOR NAVIGATION
  -------------------------------------------------------------------------------
*/

proto._renderImplNavigation = function()
{
  if (!this.isCreated()) {
    return true;
  };

  // Omit rendering if no parentTree is defined.
  // If there will be a new parentTree rendering will be started
  // through parentTree modifier.
  var vParentTree = this.getParentTree();
  if (!vParentTree) {
    return true;
  };

  // this.debug("R-Navigation[" + this.getLabel() + "]...");

  var newSrc;

  if (!vParentTree.useTreeLines())
  {
    newSrc = (new QxImageManager).getBlank();
  }
  else if (this.isLastChild())
  {
    newSrc = this._navigationEndURI;
  }
  else
  {
    newSrc = this._navigationCrossURI;
  };

  if (newSrc != this._navigationImage.src)
  {
    this._navigationImage.src = newSrc;
  };

  return true;
};





/*
  -------------------------------------------------------------------------------
    MODIFIER AND RENDERER FOR LEVEL
  -------------------------------------------------------------------------------
*/

proto._modifyLevel = function(propValue, propOldValue, propName, uniqModIds) {
  return this._renderImplIndent();
};

proto._renderImplIndent = function()
{
  if (!this.isCreated()) {
    return true;
  };

  // Omit rendering if no parentTree is defined.
  // If there will be a new parentTree rendering will be started
  // through parentTree modifier.
  var vParentTree = this.getParentTree();
  if (!vParentTree) {
    return true;
  };

  // this.debug("R-Indent[" + this.getLabel() + "]...");

  var vLevel = this.getLevel();

  if (vLevel == 0) {
    return true;
  };

  var vParent = this.getParent();

  if (!vParent) {
    return true;
  };




  var chl = this._indentCell.childNodes.length;
  vLevel--;

  if (vLevel > chl)
  {
    var diff = vLevel-chl;
    var io;

    do{
      if (QxTreeElement._indentCache.length > 0)
      {
        this._indentCell.appendChild(QxTreeElement._indentCache.shift());
      }
      else
      {
        io = new Image();
        io.src = (new QxImageManager).getBlank();
        this._indentCell.appendChild(io);
      };
    }
    while(--diff);
  }
  else if (vLevel < chl)
  {
    var diff = chl-vLevel;

    do{
      QxTreeElement._indentCache.push(this._indentCell.removeChild(this._indentCell.lastChild));
    }
    while(--diff);
  };





  var chl = this._indentCell.childNodes.length;

  if (vLevel < 1) {
    return true;
  };




  var chI, nI;

  var vNoLines = !vParentTree.useTreeLines();

  do{
    chI = this._indentCell.childNodes[vLevel-1];

    if (vNoLines || vParent.isLastChild())
    {
      nI = (new QxImageManager).getBlank();
    }
    else
    {
      nI = this._navigationLineURI;
    };

    if (nI != chI.src)
    {
      chI.src = nI;
    };

    vParent = vParent.getParent();

    if (!vParent) {
      break;
    };
  }
  while(--vLevel);

  return true;
};







/*
  -------------------------------------------------------------------------------
    EVENTS: MOUSEDOWN
  -------------------------------------------------------------------------------
*/

proto._onmousedown = function(e)
{
  switch(e.getDomTargetByTagName("TD", this.getElement()))
  {
    case this._indentCell:
      return this._onmousedownIndent(e);

    case this._navigationCell:
      return this._onmousedownNavigation(e);

    case this._iconCell:
      return this._onmousedownIcon(e);

    case this._labelCell:
      return this._onmousedownLabel(e);
  };
};

proto._onmousedownIndent = function(e) {
  e.preventDefault();
};

proto._onmousedownNavigation = function(e) {
  e.preventDefault();
};

proto._onmousedownIcon = function(e) {
  this.setActive(true);
  e.preventDefault();
};

proto._onmousedownLabel = function(e) {
  this.setActive(true);
};



/*
  -------------------------------------------------------------------------------
    EVENTS: CLICK
  -------------------------------------------------------------------------------
*/

proto._onclick = function(e)
{
  switch(e.getDomTargetByTagName("TD", this.getElement()))
  {
    case this._indentCell:
      return this._onclickIndent(e);

    case this._navigationCell:
      return this._onclickNavigation(e);

    case this._iconCell:
      return this._onclickIcon(e);

    case this._labelCell:
      return this._onclickLabel(e);
  };
};

proto._onclickIndent = proto._onclickNavigation = function(e) {};
proto._onclickIcon = proto._onclickLabel = function(e)
{
  if (this.getParentTree().useDoubleClick()) {
    return;
  };

  this.setActive(true);
};




/*
  -------------------------------------------------------------------------------
    EVENTS: DOUBLE CLICK
  -------------------------------------------------------------------------------
*/

proto._ondblclick = function(e)
{
  var pt = this.getParentTree();
  if (pt && !pt.useDoubleClick()) {
    return;
  };

  switch(e.getDomTargetByTagName("TD", this.getElement()))
  {
    case this._indentCell:
      return this._ondblclickIndent(e);

    case this._navigationCell:
      return this._ondblclickNavigation(e);

    case this._iconCell:
      return this._ondblclickIcon(e);

    case this._labelCell:
      return this._ondblclickLabel(e);
  };
};

proto._ondblclickIndent = proto._ondblclickNavigation = proto._ondblclickIcon = proto._ondblclickLabel = function(e) {};




/*
  -------------------------------------------------------------------------------
    EVENTS: MOUSEOVER / MOUSEOUT
  -------------------------------------------------------------------------------
*/

proto._hoverClass = "QxTreeElementLabelCellHover";

proto._onmouseover = function(e)
{
  var pt = this.getParentTree();
  if (pt && pt.useHoverEffects())
  {
    switch(e.getDomTargetByTagName("TD"))
    {
      case this._labelCell:
      case this._iconCell:
        QxDOM.addClass(this._labelCell, this._hoverClass);
        break;

      default:
        QxDOM.removeClass(this._labelCell, this._hoverClass);
    };

    e.setPropagationStopped(true);
  };
};

proto._onmouseout = function(e)
{
  var pt = this.getParentTree();
  if (pt && pt.useHoverEffects())
  {
    QxDOM.removeClass(this._labelCell, this._hoverClass);
    e.setPropagationStopped(true);
  };
};

proto._removeHover = function() {
  if (this.isCreated()) {  
    QxDOM.removeClass(this._labelCell, this._hoverClass);
  };
};




/*
  -------------------------------------------------------------------------------
    DISPOSE
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this._disposed) {
    return;
  };

  QxWidget.prototype.dispose.call(this);

  this.removeEventListener("click", this._onclick);
  this.removeEventListener("dblclick", this._ondblclick);
};





/*
  ################################################################################
    Create Clone-able node structure
  ################################################################################
*/

QxTreeElement.init = function()
{
  var lt, lb, lr;
  var lt1, lt2, lt3, lt4;
  var li2;

  // table
  lt = QxTreeElement._element = document.createElement("table");
  lt.border = 0;
  lt.cellSpacing = 0;
  lt.cellPadding = 0;

  // body
  lb = document.createElement("tbody");
  lt.appendChild(lb);

  // row
  lr = document.createElement("tr");
  lb.appendChild(lr);

  // indent
  lt1 = document.createElement("td");
  lr.appendChild(lt1);
  lt1.className = "QxTreeElementIndentCell";

  // navigation
  lt2 = document.createElement("td");
  lr.appendChild(lt2);
  lt2.className = "QxTreeElementNavigationCell";

  li2 = new Image();
  li2.src = (new QxImageManager).getBlank();
  li2.height = 16;
  li2.width = 19;
  lt2.appendChild(li2);

  // icon
  lt3 = document.createElement("td");
  lr.appendChild(lt3);
  lt3.className = "QxTreeElementIconCell";

  li3 = new Image();
  li3.src = (new QxImageManager).getBlank();
  li3.height = 16;
  li3.width = 16;
  lt3.appendChild(li3);

  // label
  lt4 = document.createElement("td");
  lr.appendChild(lt4);
  lt4.className = "QxTreeElementLabelCell";
  lt4.appendChild(document.createTextNode("-"));

  // mshtml unselectable
  if ((new QxClient).isMshtml()) {
    lt.unselectable = lb.unselectable = lr.unselectable = lt1.unselectable = lt2.unselectable = lt3.unselectable = lt4.unselectable = li2.unselectable = "on";
  };
};

QxTreeElement.init();