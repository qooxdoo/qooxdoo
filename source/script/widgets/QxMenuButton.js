function QxMenuButton(vText, vIcon, vHint, vMenu)
{
  QxWidget.call(this);

  this.setHeight("auto");
  this.setLeft(0);
  this.setRight(0);

  // 20 is the default height of QxMenuButtons with 16px icons
  // so sync all buttons to minimum reach this height
  this.setMinHeight(20);

  if (isValidString(vText)) {
    this.setText(vText);
  };

  if (isValid(vIcon)) {
    this.setIcon(vIcon);
  };

  if (isValidString(vHint)) {
    this.setHint(vHint);
  };

  if (isValid(vMenu)) {
    this.setMenu(vMenu);
  };
};

QxMenuButton.extend(QxWidget, "QxMenuButton");



/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

QxMenuButton.addProperty({ name : "text", type : String });
QxMenuButton.addProperty({ name : "icon", type : String });
QxMenuButton.addProperty({ name : "hint", type : String });
QxMenuButton.addProperty({ name : "menu", type : Object });

QxMenuButton.addProperty({ name : "arrow", type : String, defaultValue : "../../images/core/arrows/next.gif" });







/*
------------------------------------------------------------------------------------
  STATUS FLAGS
------------------------------------------------------------------------------------
*/

proto._iconObject = null;
proto._textObject = null;
proto._hintObject = null;
proto._arrowObject = null;

proto._showIcon = true;
proto._showText = true;
proto._showHint = true;
proto._showArrow = true;

proto._displayIcon = false;
proto._displayText = false;
proto._displayHint = false;
proto._displayArrow = false;







/*
------------------------------------------------------------------------------------
  MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    if (this._displayIcon && !this._iconObject) {
      this._pureCreateFillIcon();
    };

    if (this._displayText && !this._textObject) {
      this._pureCreateFillText();
    };

    if (this._displayHint && !this._hintObject) {
      this._pureCreateFillHint();
    };

    if (this._displayArrow && !this._arrowObject) {
      this._pureCreateFillArrow();
    };
  };

  // create basic widget
  QxWidget.prototype._modifyElement.call(this, propValue, propOldValue, propName, uniqModIds);

  this._measure();

  return true;
};

proto._modifyIcon = function(propValue, propOldValue, propName, uniqModIds)
{
  this._displayIcon = isValid(propValue);
  return true;
};

proto._modifyText = function(propValue, propOldValue, propName, uniqModIds)
{
  this._displayText = isValid(propValue);
  return true;
};

proto._modifyHint = function(propValue, propOldValue, propName, uniqModIds)
{
  this._displayHint = isValid(propValue);
  return true;
};

proto._modifyMenu = function(propValue, propOldValue, propName, uniqModIds)
{
  this._displayArrow = isValid(propValue);
  return true;
};





proto.hasMenu = function() {
  return Boolean(this.getMenu());
};





/*
------------------------------------------------------------------------------------
  ELEMENT CREATORS
------------------------------------------------------------------------------------
*/

proto._pureCreateFillIcon = function()
{
  this._iconObject = new QxImage();
  this._iconObject.setSource(this.getIcon());

  this._iconObject.setAnonymous(true);
  this._iconObject.setEnabled(this.isEnabled());
  this._iconObject.setParent(this);
  this._iconObject._addCssClassName("QxMenuButtonIcon");
};

proto._pureCreateFillText = function()
{
  this._textObject = new QxContainer();
  this._textObject.setHtml(this.getText());

  this._textObject.setAnonymous(true);
  this._textObject.setEnabled(this.isEnabled());
  this._textObject.setParent(this);
  this._textObject._addCssClassName("QxMenuButtonText");
};

proto._pureCreateFillHint = function()
{
  this._hintObject = new QxContainer();
  this._hintObject.setHtml(this.getHint());

  this._hintObject.setAnonymous(true);
  this._hintObject.setEnabled(this.isEnabled());
  this._hintObject.setParent(this);
  this._hintObject._addCssClassName("QxMenuButtonHint");
};

proto._pureCreateFillArrow = function()
{
  this._arrowObject = new QxImage();
  this._arrowObject.setSource(this.getArrow());

  this._arrowObject.setAnonymous(true);
  this._arrowObject.setEnabled(this.isEnabled());
  this._arrowObject.setParent(this);
  this._arrowObject._addCssClassName("QxMenuButtonArrow");
};






/*
------------------------------------------------------------------------------------
  RENDERER: INNER DIMENSION SIGNAL

  should be called always when the inner dimension have been modified
------------------------------------------------------------------------------------
*/

proto._innerWidthChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerWidth();

  // Update placement of icon and text
  this._layoutInternalWidgetsHorizontal("inner-width");
};

proto._innerHeightChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerHeight();

  // Update placement of icon and text
  this._layoutInternalWidgetsVertical("inner-height");
};





proto._layoutInternalWidgetsHorizontal = function(vHint)
{
  var vParent = this.getParent();
  
  if (this._iconObject) {
    this._iconObject._applyPositionHorizontal(vParent._childIconPosition);
  };
  
  if (this._textObject) {
    this._textObject._applyPositionHorizontal(vParent._childTextPosition);
  };

  if (this._hintObject) {
    this._hintObject._applyPositionHorizontal(vParent._childHintPosition);
  };

  if (this._arrowObject) {
    this._arrowObject._applyPositionHorizontal(vParent._childArrowPosition);
  };
};

proto._layoutInternalWidgetsVertical = function(vHint)
{
  
  var vInner = this.getInnerHeight();
  
  
  if (this._iconObject) {
    this._iconObject._applyPositionVertical((vInner - this._iconObject.getPreferredHeight()) / 2);
  };
  
  if (this._textObject) {
    this._textObject._applyPositionVertical((vInner - this._textObject.getPreferredHeight()) / 2);
  };

  if (this._hintObject) {
    this._hintObject._applyPositionVertical((vInner - this._hintObject.getPreferredHeight()) / 2);
  };
  
  if (this._arrowObject) {
    this._arrowObject._applyPositionVertical((vInner - this._arrowObject.getPreferredHeight()) / 2);
  };  
};





proto._calculatedIconWidth = 0;
proto._calculatedTextWidth = 0;
proto._calculatedHintWidth = 0;
proto._calculatedArrowWidth = 0;

proto._measure = function()
{
  this._calculatedIconWidth = this._displayIcon ? this._iconObject.getAnyWidth() : 0;
  this._calculatedTextWidth = this._displayText ? this._textObject.getAnyWidth() : 0;
  this._calculatedHintWidth = this._displayHint ? this._hintObject.getAnyWidth() : 0;
  this._calculatedArrowWidth = this._displayArrow ? this._arrowObject.getAnyWidth() : 0;
};





/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  return QxWidget.prototype.dispose.call(this);
};
