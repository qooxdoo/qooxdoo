function QxTreeFolder(vLabel, vIconOpenURI, vIconCloseURI)
{
  if (isValid(vIconOpenURI)) {
    this.setIconOpenURI(vIconOpenURI);
  };

  if (isValid(vIconCloseURI)) {
    this.setIconCloseURI(vIconCloseURI);
  };

  QxTreeElement.call(this, vLabel, this._closeIcon);
};

QxTreeFolder.extend(QxTreeElement, "QxTreeFolder");


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxTreeFolder.addProperty({ name : "open", type : Boolean, defaultValue : false });
QxTreeFolder.addProperty({ name : "iconOpenURI", type : String, defaultValue : "icons/16/folder_open.png" });
QxTreeFolder.addProperty({ name : "iconCloseURI", type : String, defaultValue : "icons/16/folder.png" });




/*
  -------------------------------------------------------------------------------
    PARENT/POSITION HANDLER
  -------------------------------------------------------------------------------
*/

proto._obtainLastChildState = function()
{
  this._renderImplNavigation();
  this._renderImplIndent();
};

proto._loseLastChildState = function()
{
  if (this.getParent()) {
    this._renderImplNavigation();
    this._renderImplIndent();
  };
};

proto._obtainFirstChild = function() {
  this._renderImplNavigation();
};

proto._loseAllChilds = function()
{
  switch(this.getOpen())
  {
    case true:
      this.setOpen(false);
      break;

    case false:
      this._renderImplNavigation();
      break;
  };
};



/*
  -------------------------------------------------------------------------------
    PARENTTREE/LEVEL MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyParentTree = function(propValue, propOldValue, propName, uniqModIds)
{
  QxTreeElement.prototype._modifyParentTree.call(this, propValue, propOldValue, propName, uniqModIds);

  var ch = this.getChildren();
  var chl = ch.length;

  // Update Parent Tree for all childs
  for (var i=0; i<chl; i++) {
    ch[i].setParentTree(propValue, uniqModIds);
  };

  return true;
};

proto._modifyLevel = function(propValue, propOldValue, propName, uniqModIds)
{
  var ch = this.getChildren();
  var chl = ch.length;

  for (var i=0; i<chl; i++) {
    ch[i].setLevel(propValue + 1, uniqModIds);
  };

  return true;
};


/*
  -------------------------------------------------------------------------------
    BASIC MODIFIERS
  -------------------------------------------------------------------------------
*/
proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  // Create SubList
  this._subList = document.createElement("ul");

  // Create basic widget
  QxTreeElement.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  // Add sublist
  propValue.appendChild(this._subList);

  return true;
};


proto._getParentNodeForChild = function(oo)
{
  if (oo != null && oo instanceof QxTreeElement) {
    return this._subList;
  };

  return QxTreeElement.prototype._getParentNodeForChild.call(this, oo);
};




/*
  -------------------------------------------------------------------------------
    MODIFIERS FOR OPEN/CLOSE
  -------------------------------------------------------------------------------
*/

proto._wasOpen = false;
proto._invalidIndent = false;

proto._modifyOpen = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this.isCreated()) {
    return true;
  };

  if (propValue)
  {
    this._subList.style.display = "block";

    if (this._invalidChildrenIndent)
    {
      this._renderImplIndent();
      this._invalidChildrenIndent = false;
    };

    if (this._invalidChildrenLines)
    {
      this._updateTreeLines();
    };

    this._createChildren();

    this._renderImplNavigation();
    this._renderImplIcon();

    this._wasOpen = true;
  }
  else
  {
    this._subList.style.display = "none";

    this._renderImplNavigation();
    this._renderImplIcon();
    
    this._removeHover();
  };

  return true;
};

proto._removeHover = function()
{
  var ch = this.getChildren();
  var chl = ch.length;
  
  for (var i=0; i<chl; i++) {
    ch[i]._removeHover();    
  };  
  
  QxTreeElement.prototype._removeHover.call(this);
};




proto._invalidChildrenLines = false;

proto._updateTreeLines = function()
{
  var ch = this.getChildren();
  var chl = ch.length;
  var chc;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    chc._renderImplNavigation();
    chc._renderImplIndent();

    if (chc instanceof QxTreeFolder && chc.isCreated())
    {
      if (chc.getOpen())
      {
        chc._updateTreeLines();
      }
      else
      {
        chc._invalidChildrenLines = true;
      };
    }
    else
    {
      chc._invalidChildrenLines = false;
    };
  };

  this._invalidChildrenLines = false;
};

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
    if (!this.hasChildren())
    {
      newSrc = (new QxImageManager).getBlank();
    }
    else if (this.getOpen())
    {
      newSrc = this._navigationSimpleMinusURI;
    }
    else
    {
      newSrc = this._navigationSimplePlusURI;
    };
  }
  else  if (this.isLastChild())
  {
    if (!this.hasChildren())
    {
      newSrc = this._navigationEndURI;
    }
    else if (this.getOpen())
    {
      newSrc = this._navigationEndMinusURI;
    }
    else
    {
      newSrc = this._navigationEndPlusURI;
    };
  }
  else
  {
    if (!this.hasChildren())
    {
      newSrc = this._navigationCrossURI;
    }
    else if (this.getOpen())
    {
      newSrc = this._navigationCrossMinusURI;
    }
    else
    {
      newSrc = this._navigationCrossPlusURI;
    };
  };

  // apply
  if (newSrc != this._navigationImage.src)
  {
    this._navigationImage.src = newSrc;
  };

  return true;
};

proto._renderImplIcon = function()
{
  if (!this.isCreated()) {
    return true;
  };

  var newSrc = (new QxImageManager).buildURI(this.getActive() ? this.getIconOpenURI() : this.getIconCloseURI());

  if (newSrc != this._iconImage.src) {
    this._iconImage.src = newSrc;
  };

  return true;
};

proto._modifyActive = function(propValue, propOldValue, propName, uniqModIds)
{
  QxTreeElement.prototype._modifyActive.call(this, propValue, propOldValue, propName, uniqModIds);
  return this._renderImplIcon();
};

proto._renderImplIndent = function()
{
  if (!this.isCreated()) {
    return true;
  };

  QxTreeElement.prototype._renderImplIndent.call(this);

  if (!this.hasChildren())
  {
    // pass
  }
  else if (this.getOpen())
  {
    this._renderImplChildrenIndent();
  }
  else if (this._wasOpen)
  {
    this._invalidChildrenIndent = true;
  };

  return true;
};

proto._renderImplChildrenIndent = function()
{
  var ch = this.getChildren();
  var chl = ch.length-1;

  // this.debug("R-Indent-Childs[" + this.getLabel() + "]...");

  if (chl>-1) {
    do{ ch[chl]._renderImplIndent(); } while(chl--);
  };

  this._invalidChildrenIndent = false;
};


proto._shouldBecomeChilds = function()
{
  return this.getOpen();
};





/*
  -------------------------------------------------------------------------------
    EVENTS: CLICK
  -------------------------------------------------------------------------------
*/

proto._onclickNavigation = function(e)
{
  if (this.hasChildren()) {
    this.setOpen(!this.getOpen());
  };
};

proto._onclickLabel = function(e)
{
  QxTreeElement.prototype._onclickLabel.call(this, e);

  if (this.getParentTree().useDoubleClick() || this.getChildrenLength() == 0)
  {
    this.setActive(true);
  }
  else
  {
    this.setOpen(true);
  };
};

proto._onclickIcon = function(e)
{
  QxTreeElement.prototype._onclickIcon.call(this, e);

  if (this.getParentTree().useDoubleClick() || this.getChildrenLength() == 0)
  {
    this.setActive(true);
  }
  else
  {
    this.setOpen(true);
  };
};



/*
  -------------------------------------------------------------------------------
    EVENTS: DOUBLE CLICK
  -------------------------------------------------------------------------------
*/

proto._ondblclickLabel = function(e)
{
  QxTreeElement.prototype._ondblclickLabel.call(this, e);
  this.setOpen(!this.getOpen());
};

proto._ondblclickIcon = function(e)
{
  QxTreeElement.prototype._ondblclickIcon.call(this, e);
  this.setOpen(!this.getOpen());
};
