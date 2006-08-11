/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_form)

************************************************************************ */

qx.OO.defineClass("qx.ui.form.TextField", qx.ui.basic.Terminator,
function(vValue)
{
  // ************************************************************************
  //   INIT
  // ************************************************************************
  qx.ui.basic.Terminator.call(this);

  if (typeof vValue === qx.constant.Type.STRING) {
    this.setValue(vValue);
  }


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
  this.enableInlineEvent(qx.constant.Event.INPUT);

  this.addEventListener(qx.constant.Event.BLUR, this._onblur);
  this.addEventListener(qx.constant.Event.FOCUS, this._onfocus);
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/


qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "text-field" });

qx.OO.addProperty({ name : "value", type : qx.constant.Type.STRING, defaultValue : qx.constant.Core.EMPTY });
qx.OO.addProperty({ name : "maxLength", type : qx.constant.Type.NUMBER });
qx.OO.addProperty({ name : "readOnly", type : qx.constant.Type.BOOLEAN });

qx.OO.addProperty({ name : "selectionStart", type : qx.constant.Type.NUMBER });
qx.OO.addProperty({ name : "selectionLength", type : qx.constant.Type.NUMBER });
qx.OO.addProperty({ name : "selectionText", type : qx.constant.Type.STRING });

qx.OO.addProperty({ name : "validator", type : qx.constant.Type.FUNCTION });

/*!
  The font property describes how to paint the font on the widget.
*/
qx.OO.addProperty({ name : "font", type : qx.constant.Type.OBJECT, instance : "qx.renderer.font.Font", convert : qx.renderer.font.FontCache, allowMultipleArguments : true });




/*
---------------------------------------------------------------------------
  CLONING
---------------------------------------------------------------------------
*/

// Extend ignore list with selection properties
qx.Proto._clonePropertyIgnoreList += ",selectionStart,selectionLength,selectionText";



/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  propValue ? this.removeHtmlAttribute(qx.constant.Core.DISABLED) : this.setHtmlAttribute(qx.constant.Core.DISABLED, qx.constant.Core.DISABLED);
  return qx.ui.basic.Terminator.prototype._modifyEnabled.call(this, propValue, propOldValue, propData);
}

qx.Proto._modifyValue = function(propValue, propOldValue, propData)
{
  this._inValueProperty = true;
  this.setHtmlProperty(propData.name, propValue == null ? qx.constant.Core.EMPTY : propValue);
  delete this._inValueProperty;

  return true;
}

qx.Proto._modifyMaxLength = function(propValue, propOldValue, propData) {
  return propValue ? this.setHtmlProperty(propData.name, propValue) : this.removeHtmlProperty(propData.name);
}

qx.Proto._modifyReadOnly = function(propValue, propOldValue, propData) {
  return propValue ? this.setHtmlProperty(propData.name, propData.name) : this.removeHtmlProperty(propData.name);
}

qx.Proto._modifyFont = function(propValue, propOldValue, propData)
{
  this._invalidatePreferredInnerDimensions();

  if (propValue) {
    propValue._applyWidget(this);
  } else if (propOldValue) {
    propOldValue._resetWidget(this);
  }

  return true;
}




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getComputedValue = function(e)
{
  this._visualPropertyCheck();
  return this.getElement().value;
}





/*
---------------------------------------------------------------------------
  VALIDATION
---------------------------------------------------------------------------
*/

qx.ui.form.TextField.createRegExpValidator = function(vRegExp)
{
  return function(s) {
    return vRegExp.test(s);
  }
}

qx.Proto.isValid = function()
{
  var vValidator = this.getValidator();
  return !vValidator || vValidator(this.getValue());
}

qx.Proto.isComputedValid = function()
{
  var vValidator = this.getValidator();
  return !vValidator || vValidator(this.getComputedValue());
}






/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS
---------------------------------------------------------------------------
*/

qx.Proto._computePreferredInnerWidth = function() {
  return 120;
}

qx.Proto._computePreferredInnerHeight = function() {
  return 15;
}





/*
---------------------------------------------------------------------------
  BROWSER QUIRKS
---------------------------------------------------------------------------
*/

if (qx.sys.Client.isMshtml())
{
  qx.Proto._firstInputFixApplied = false;

  qx.Proto._afterAppear = function()
  {
    qx.ui.basic.Terminator.prototype._afterAppear.call(this);

    if (!this._firstInputFixApplied) {
      qx.client.Timer.once(this._ieFirstInputFix, this, 1);
    }
  }

  /*!
    Fix IE's input event for filled text fields
  */
  qx.Proto._ieFirstInputFix = function()
  {
    this._inValueProperty = true;
    this.getElement().value = this.getValue() === null ? qx.constant.Core.EMPTY : this.getValue();
    this._firstInputFixApplied = true;
    delete this._inValueProperty;
  }
}








/*
---------------------------------------------------------------------------
  EVENT-HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._textOnFocus = null;

qx.Proto._ontabfocus = function(e) {
  this.selectAll();
}

qx.Proto._onfocus = function(e) {
  this._textOnFocus = this.getComputedValue();
}

qx.Proto._onblur = function(e)
{
  var vValue = this.getComputedValue().toString();

  if (this._textOnFocus != vValue) {
    this.setValue(vValue);
  }

  this.setSelectionLength(0);
}







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

  qx.Proto._getRange = function()
  {
    this._visualPropertyCheck();
    return this.getElement().createTextRange();
  }

  qx.Proto._getSelectionRange = function()
  {
    this._visualPropertyCheck();
    return this.getTopLevelWidget().getDocumentElement().selection.createRange();
  }

  qx.Proto.setSelectionStart = function(vStart)
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
      }

      vStart--;
      i++;
    }

    var vRange = this._getRange();

    vRange.collapse();
    vRange.move("character", vStart);
    vRange.select();
  }

  qx.Proto.getSelectionStart = function()
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return -1;
    }

    var vRange = this._getRange();

    vRange.setEndPoint("EndToStart", vSelectionRange);
    return vRange.text.length;
  }

  qx.Proto.setSelectionLength = function(vLength)
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return;
    }

    vSelectionRange.collapse();
    vSelectionRange.moveEnd("character", vLength);
    vSelectionRange.select();
  }

  qx.Proto.getSelectionLength = function()
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return 0;
    }

    return vSelectionRange.text.length;
  }

  qx.Proto.setSelectionText = function(vText)
  {
    this._visualPropertyCheck();

    var vStart = this.getSelectionStart();
    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return;
    }

    vSelectionRange.text = vText;

    // apply text to internal storage
    this.setValue(this.getElement().value);

    // recover selection (to behave the same gecko does)
    this.setSelectionStart(vStart);
    this.setSelectionLength(vText.length);

    return true;
  }

  qx.Proto.getSelectionText = function()
  {
    this._visualPropertyCheck();

    var vSelectionRange = this._getSelectionRange();

    if (!this.getElement().contains(vSelectionRange.parentElement())) {
      return qx.constant.Core.EMPTY;
    }

    return vSelectionRange.text;
  }

  qx.Proto.selectAll = function()
  {
    this._visualPropertyCheck();

    if (this.getValue() != null)
    {
      this.setSelectionStart(0);
      this.setSelectionLength(this.getValue().length);
    }

    // to be sure we get the element selected
    this.getElement().select();
  }

  qx.Proto.selectFromTo = function(vStart, vEnd)
  {
    this._visualPropertyCheck();

    this.setSelectionStart(vStart);
    this.setSelectionLength(vEnd-vStart);
  }
}
else
{
  qx.Proto.setSelectionStart = function(vStart)
  {
    this._visualPropertyCheck();
    this.getElement().selectionStart = vStart;
  }

  qx.Proto.getSelectionStart = function()
  {
    this._visualPropertyCheck();
    return this.getElement().selectionStart;
  }

  qx.Proto.setSelectionLength = function(vLength)
  {
    this._visualPropertyCheck();

    var el = this.getElement();
    if (qx.util.Validation.isValidString(el.value)) {
      el.selectionEnd = el.selectionStart + vLength;
    }
  }

  qx.Proto.getSelectionLength = function()
  {
    this._visualPropertyCheck();

    var el = this.getElement();
    return el.selectionEnd - el.selectionStart;
  }

  qx.Proto.setSelectionText = function(vText)
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
  }

  qx.Proto.getSelectionText = function()
  {
    this._visualPropertyCheck();

    return this.getElement().value.substr(this.getSelectionStart(), this.getSelectionLength());
  }

  qx.Proto.selectAll = function()
  {
    this._visualPropertyCheck();

    this.getElement().select();
  }

  qx.Proto.selectFromTo = function(vStart, vEnd)
  {
    this._visualPropertyCheck();

    var el = this.getElement();
    el.selectionStart = vStart;
    el.selectionEnd = vEnd;
  }
}







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  this.removeEventListener(qx.constant.Event.BLUR, this._onblur);
  this.removeEventListener(qx.constant.Event.FOCUS, this._onfocus);

  qx.ui.basic.Terminator.prototype.dispose.call(this);
}
