function QxTree(vLabel, vIconOpenURI, vIconCloseURI)
{
  if (isValid(vLabel)) {
    QxTreeFolder.call(this, vLabel, vIconOpenURI, vIconCloseURI);
  } else {
    QxTreeElement.call(this);
  };

  this.setTagName("div");
  this.setLevel(0);
  this.setParentTree(this);
  this.setTabIndex(1);
  this.setOpen(true);

  this.addEventListener("keydown", this._onkeydown);
};

QxTree.extend(QxTreeFolder, "QxTree");


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxTree.addProperty({ name : "activeElement" });
QxTree.addProperty({ name : "useDoubleClick", type : Boolean, defaultValue : false, getAlias : "useDoubleClick" });
QxTree.addProperty({ name : "useHoverEffects", type : Boolean, defaultValue : true, getAlias : "useHoverEffects" });
QxTree.addProperty({ name : "useTreeLines", type : Boolean, defaultValue : true, getAlias : "useTreeLines" });


/*
  -------------------------------------------------------------------------------
    COMMON CHECKERS
  -------------------------------------------------------------------------------
*/

QxTree.isTreeFolder = function(vObject) {
  return vObject && vObject instanceof QxTreeFolder && !(vObject instanceof QxTree);
};

QxTree.isOpenTreeFolder = function(vObject) {
  return vObject instanceof QxTreeFolder && vObject.getOpen() && vObject.getChildrenLength() > 0;
};



/*
  -------------------------------------------------------------------------------
    BASIC MODIFIERS
  -------------------------------------------------------------------------------
*/

proto._modifyParent = function(propValue, propOldValue, propName, uniqModIds)
{
  return QxWidget.prototype._modifyParent.call(this, propValue, propOldValue, propName, uniqModIds);
};

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  QxTreeFolder.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  // Hide
  this._indentCell.style.display = this._navigationCell.style.display = "none";

  // Apply
  this._renderImplLabel(this.getLabel());
  this._renderImplIcon();

  return true;
};

proto._modifyActiveElement = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setActive(false, uniqModIds);
  };

  if (propValue) {
    propValue.setActive(true, uniqModIds);
  };

  return true;
};

proto._modifyUseTreeLines = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.isCreated()) {
    this._updateTreeLines();
  };

  return true;
};

proto._shouldBecomeCreated = function() {
  return true;
};

proto._onkeydown = function(e)
{
  e.preventDefault();  

  var aE = this.getActiveElement();

  switch(e.getKeyCode())
  {
    case QxKeyEvent.keys.left:
      if (QxTree.isTreeFolder(aE))
      {
        if (!aE.getOpen())
        {
          var vParent = aE.getParent();
          if (vParent instanceof QxTreeFolder) {
            if (!(vParent instanceof QxTree)) {
              vParent.setOpen(false);
            };

            this.setActiveElement(vParent);
          };
        }
        else
        {
          return aE.setOpen(false);
        };
      }
      else if (aE instanceof QxTreeFile)
      {
        var vParent = aE.getParent();
        if (vParent instanceof QxTreeFolder) {
          if (!(vParent instanceof QxTree)) {
            vParent.setOpen(false);
          };

          this.setActiveElement(vParent);
        };
      };

      break;

    case QxKeyEvent.keys.right:
      if (QxTree.isTreeFolder(aE)) {
        return aE.setOpen(true);
      };

      break;

    case QxKeyEvent.keys.enter:
      if (QxTree.isTreeFolder(aE)) {
        return aE.setOpen(!aE.getOpen());
      };

      break;

    case QxKeyEvent.keys.up:
      if (aE)
      {
        if (aE.isFirstChild())
        {
          if (aE.getParent() instanceof QxTreeFolder)
          {
            this.setActiveElement(aE.getParent());
          }
          else
          {
            this.setActiveElement(this.getLastTreeChild());
          };
        }
        else
        {
          var vPrev = aE.getPreviousSibling();

          while (vPrev instanceof QxTreeElement)
          {
            if (QxTree.isOpenTreeFolder(vPrev))
            {
              vPrev = vPrev.getLastChild();
            }
            else
            {
              break;
            };
          };

          this.setActiveElement(vPrev);
        };
      }
      else
      {
        var vLast = this.getLastTreeChild();
        if (vLast) {
          this.setActiveElement(vLast);
        };
      };

      break;


    case QxKeyEvent.keys.down:
      if (aE)
      {
        if (QxTree.isOpenTreeFolder(aE))
        {
          this.setActiveElement(aE.getFirstChild());
        }
        else if (aE.isLastChild())
        {
          var vCurrent = aE;

          while(vCurrent.isLastChild())
          {
            vCurrent = vCurrent.getParent();
            if (!vCurrent instanceof QxTreeElement) {
              return this.setActiveElement(this.getFirstTreeChild());
            };
          };

          if (vCurrent instanceof QxTreeElement && vCurrent.getNextSibling() && vCurrent.getNextSibling() instanceof QxTreeElement) {
            return this.setActiveElement(vCurrent.getNextSibling());
          };

          this.setActiveElement(this.getFirstTreeChild());
        }
        else
        {
          this.setActiveElement(aE.getNextSibling());
        };
      }
      else
      {
        var vFirst = this.getFirstTreeChild();
        if (vFirst) {
          this.setActiveElement(vFirst);
        };
      };

      break;
  };
  
  // be sure to be again active (fix especially for gecko based browsers)
  (new QxApplication).setActiveWidget(this);
};

proto.getLastTreeChild = function()
{
  var vLast = this;

  while (vLast instanceof QxTreeElement)
  {
    if (!(vLast instanceof QxTreeFolder) || !vLast.getOpen()) {
      return vLast;
    };

    vLast = vLast.getLastChild();
  };
};

proto.getFirstTreeChild = function() {
  return this;
};

proto._renderImplNavigation = function() {
  return true;
};

proto._renderImplIndent = function() {
  return true;
};

proto._visualizeFocus = function() {
  return true;
};

proto._visualizeBlur = function() {
  return true;
};