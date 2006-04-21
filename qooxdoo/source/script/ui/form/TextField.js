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

#package(form)

************************************************************************ */

qx.ui.form.TextField = function(vValue)
{
  // ************************************************************************
  //   INIT
  // ************************************************************************
  qx.ui.basic.Terminator.call(this);

  if (typeof vValue === qx.Const.TYPEOF_STRING) {
    this.setValue(vValue);
  };


  // ************************************************************************
  //   BEHAVIOR
  // ************************************************************************
  this.setTagName("INPUT");
  this.setHtmlProperty("type", "text");
  this.setHtmlAttribute("autocomplete", "OFF");
  this.setTabIndex(1);
  this.setSelectable(true);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************
  this.enableInlineEvent(qx.Const.EVENT_TYPE_INPUT);

  this.addEventListener(qx.Const.EVENT_TYPE_BLUR, this._onblur);
  this.addEventListener(qx.Const.EVENT_TYPE_FOCUS, this._onfocus);
};

qx.ui.form.TextField.extend(qx.ui.basic.Terminator, "qx.ui.form.TextField");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/


qx.ui.form.TextField.changeProperty({ name : "appearance", type : qx.Const.TYPEOF_STRING, defaultValue : "text-field" });

qx.ui.form.TextField.addProperty({ name : "value", type : qx.Const.TYPEOF_STRING, defaultValue : qx.Const.CORE_EMPTY });
qx.ui.form.TextField.addProperty({ name : "maxLength", type : qx.Const.TYPEOF_NUMBER });
qx.ui.form.TextField.addProperty({ name : "readOnly", type : qx.Const.TYPEOF_BOOLEAN });

qx.ui.form.TextField.addProperty({ name : "selectionStart", type : qx.Const.TYPEOF_NUMBER });
qx.ui.form.TextField.addProperty({ name : "selectionLength", type : qx.Const.TYPEOF_NUMBER });
qx.ui.form.TextField.addProperty({ name : "selectionText", type : qx.Const.TYPEOF_STRING });

qx.ui.form.TextField.addProperty({ name : "validator", type : qx.Const.TYPEOF_FUNCTION });

/*!
  The font property describes how to paint the font on the widget.
*/
qx.ui.form.TextField.addProperty({ name : "font", type : qx.Const.TYPEOF_OBJECT, instance : "qx.renderer.font.Font", convert : qx.renderer.font.FontCache, allowMultipleArguments : true });



/*
---------------------------------------------------------------------------
  CLONING
---------------------------------------------------------------------------
*/

// Extend ignore list with selection properties
proto._clonePropertyIgnoreList += ",selectionStart,selectionLength,selectionText";



/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  propValue ? this.removeHtmlAttribute(qx.Const.CORE_DISABLED) : this.setHtmlAttribute(qx.Const.CORE_DISABLED, qx.Const.CORE_DISABLED);
  return qx.ui.basic.Terminator.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
};

proto._modifyValue = function(propValue, propOldValue, propData)
{
  this._inValueProperty = true;
  this.setHtmlProperty(propData.name, propValue == null ? qx.Const.CORE_EMPTY : propValue);
  delete this._inValueProperty;

  return true;
};

proto._modifyMaxLength = function(propValue, propOldValue, propData) {
  return propValue ? this.setHtmlProperty(propData.name, propValue) : this.removeHtmlProperty(propData.name);
};

proto._modifyReadOnly = function(propValue, propOldValue, propData) {
  return propValue ? this.setHtmlProperty(propData.name, propData.name) : this.removeHtmlProperty(propData.name);
};

proto._modifyFont = function(propValue, propOldValue, propData)
{
  this._invalidatePreferredInnerDimensions();

  if (propValue) {
    propValue.applyWidget(this);
  } else if (propOldValue) {
    propOldValue.resetWidget(this);
  };

  return true;
};




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getComputedValue = function(e)
{
  this._visualPropertyCheck();
  return this.getElement().value;
};





/*
---------------------------------------------------------------------------
  VALIDATION
---------------------------------------------------------------------------
*/

qx.ui.form.TextField.createRegExpValidator = function(vRegExp)
{
  return function(s) {
    return vRegExp.test(s);
  };
};

proto.isValid = function()
{
  var vValidator = this.getValidator();
  return !vValidator || vValidator(this.getValue());
};

proto.isComputedValid = function()
{
  var vValidator = this.getValidator();
  return !vValidator || vValidator(this.getComputedValue());
};






/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS
---------------------------------------------------------------------------
*/

proto._computePreferredInnerWidth = function() {
  return 120;
};

proto._computePreferredInnerHeight = function() {
  return 15;
};





/*
---------------------------------------------------------------------------
  EVENT-HANDLER
---------------------------------------------------------------------------
*/

proto._textOnFocus = null;

proto._ontabfocus = function(e) {
  this.selectAll();
};

proto._onfocus = function(e) {
  this._textOnFocus = this.getComputedValue();
};

proto._onblur = function(e)
{
  var vValue = this.getComputedValue().toString();

  if (this._textOnFocus != vValue) {
    this.setValue(vValue);
  };

  this.setSelectionLength(0);
};







/*
---------------------------------------------------------------------------
  CROSS-BROWSER SELECTION HANDLING
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml())
{
  /*!
    Microsoft Documentation:
    http://msdn.microsoft.com/workshop/author/dhtml/reference/methods/createrange.asp
    http://msdn.microsoft.com/workshop/author/dhtml/reference/objects/obj_textrange.asp
  */

  proto._getRange = function()
  {
    this._visualPropertyCheck();
    return this.getElement().createTextRange();
  };

  proto._getSelectionRange = function()
  {
    this._visualPropertyCheck();
    return this.getTopLevelWidget().getDocumentElement().selection.createRange();
  };

  proto.setSelectionStart = function(vStart)
  {
    this._visualPropertyCheck();

    var vText = this.getElement().value;

    // a bit hacky, special handling for line-breaks
    var i = 0;
    while (i<vStart)
    {
      // find next line break
      i = vText.indexOf("\r\n", i);

      if (i == -1) {
        break;
      };

      vStart--;
      i++;
    };

    var vRange = this._getRange();

    vRange.collapse();
    vRange.move("character", vStart);
    vRange.select();
  };

  proto.getSelectionStart = function()
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return -1;
    };

    var vRange = this._getRange();

    vRange.setEndPoint("EndToStart", vSelectionRange);
    return vRange.text.length;
  };

  proto.setSelectionLength = function(vLength)
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return;
    };

    vSelectionRange.collapse();
    vSelectionRange.moveEnd("character", vLength);
    vSelectionRange.select();
  };

  proto.getSelectionLength = function()
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return 0;
    };

    return vSelectionRange.text.length;
  };

  proto.setSelectionText = function(vText)
  {
    this._visualPropertyCheck();

    var vStart = this.getSelectionStart();
    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return;
    };

    vSelectionRange.text = vText;

    // apply text to internal storage
    this.setValue(this.getElement().value);

    // recover selection (to behave the same gecko does)
    this.setSelectionStart(vStart);
    this.setSelectionLength(vText.length);

    return true;
  };

  proto.getSelectionText = function()
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return qx.Const.CORE_EMPTY;
    };

    return vSelectionRange.text;
  };

  proto.selectAll = function()
  {
    this._visualPropertyCheck();

    if (this.getValue() != null)
    {
      this.setSelectionStart(0);
      this.setSelectionLength(this.getValue().length);
    };

    // to be sure we get the element selected
    this.getElement().select();
  };

  proto.selectFromTo = function(vStart, vEnd)
  {
    this._visualPropertyCheck();

    this.setSelectionStart(vStart);
    this.setSelectionLength(vEnd-vStart);
  };
}
else
{
  proto.setSelectionStart = function(vStart)
  {
    this._visualPropertyCheck();
    this.getElement().selectionStart = vStart;
  };

  proto.getSelectionStart = function()
  {
    this._visualPropertyCheck();
    return this.getElement().selectionStart;
  };

  proto.setSelectionLength = function(vLength)
  {
    this._visualPropertyCheck();

    var el = this.getElement();
    if (qx.util.Validation.isValidString(el.value)) {
      el.selectionEnd = el.selectionStart + vLength;
    };
  };

  proto.getSelectionLength = function()
  {
    this._visualPropertyCheck();

    var el = this.getElement();
    return el.selectionEnd - el.selectionStart;
  };

  proto.setSelectionText = function(vText)
  {
    this._visualPropertyCheck();

    var el = this.getElement();

    var vOldText = el.value;
    var vStart = el.selectionStart;

    var vOldTextBefore = vOldText.substr(0, vStart);
    var vOldTextAfter = vOldText.substr(el.selectionEnd);

    var vValue = el.value = vOldTextBefore + vText + vOldTextAfter;

    // recover selection
    el.selectionStart = vStart;
    el.selectionEnd = vStart + vText.length;

    // apply new value to internal cache
    this.setValue(vValue);

    return true;
  };

  proto.getSelectionText = function()
  {
    this._visualPropertyCheck();

    return this.getElement().value.substr(this.getSelectionStart(), this.getSelectionLength());
  };

  proto.selectAll = function()
  {
    this._visualPropertyCheck();

    this.getElement().select();
  };

  proto.selectFromTo = function(vStart, vEnd)
  {
    this._visualPropertyCheck();

    var el = this.getElement();
    el.selectionStart = vStart;
    el.selectionEnd = vEnd;
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
    return;
  };

  this.removeEventListener(qx.Const.EVENT_TYPE_BLUR, this._onblur);
  this.removeEventListener(qx.Const.EVENT_TYPE_FOCUS, this._onfocus);

  qx.ui.basic.Terminator.prototype.dispose.call(this);
};
