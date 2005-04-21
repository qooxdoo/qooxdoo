function QxTextField(vText)
{
  QxWidget.call(this);

  if(isValid(vText)) {
    this.setText(vText);
  };

  this.setHtmlProperty("type", "text");
  
  this.setTabIndex(1);
  this.setCanSelect(true);
  
  this.setTagName("INPUT");
  this.setTextAlign("left");
  
  this.addEventListener("blur", this._onblur);
  this.addEventListener("focus", this._onfocus);
};

QxTextField.extend(QxWidget, "QxTextField");




/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/
  
QxTextField.addProperty({ name : "text", type : String, defaultValue : "" });
QxTextField.addProperty({ name : "maxLength", type : Number });
QxTextField.addProperty({ name : "readOnly", type : Boolean });

QxTextField.addProperty({ name : "selectionStart", type : Number });
QxTextField.addProperty({ name : "selectionLength", type : Number });
QxTextField.addProperty({ name : "selectionText", type : String });



/*
  -------------------------------------------------------------------------------
    CLONING
  -------------------------------------------------------------------------------
*/

// Extend ignore list with selection properties
proto._clonePropertyIgnoreList += ",selectionStart,selectionLength,selectionText";



/*
  -------------------------------------------------------------------------------
    MODIFIERS
  -------------------------------------------------------------------------------
*/
  
proto._modifyText = function(propValue, propOldValue, propName, uniqModIds) {
  return this.setHtmlProperty("value", propValue);
};

proto._modifyMaxLength = function(propValue, propOldValue, propName, uniqModIds) {
  return this.setHtmlProperty("maxLength", propValue);
};

proto._modifyReadOnly = function(propValue, propOldValue, propName, uniqModIds) {
  return this.setHtmlProperty("readOnly", propValue);
};  






/*
  -------------------------------------------------------------------------------
    GECKO-ADDITIONS
  -------------------------------------------------------------------------------
*/

if ((new QxClient).isGecko())
{  
  // Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.5) Gecko/20041108 Firefox/1.0
  // Date: 2005-02-18
  
	// The focus() call is problematic in mozilla. There occurs a 
	// non-catchable security exception. This is only valid on 
	// editable textfields.
	
	// There is no solution in any of these forums:
  // http://www.forum4designers.com/archive22-2004-2-46193.html
  // http://www.webxpertz.net/forums/archive/index.php/t-30734.html
  // http://www.forum4designers.com/message75791.html
  // https://lists.latech.edu/pipermail/javascript/2004-June/007883.html
  
  // The following solves this. Read the lines above. This bug doesn't occurs 
  // on readonly fields. So set it readonly first fix the bug. ;)

  proto._visualizeFocus = function()
  {
    this.setCssClassName(this.getCssClassName().add("QxFocused", " ").add(this.classname + "-Focused", " "));    
    
    try {
      this.getElement().readOnly = true;
      this.getElement().focus();      
      this.getElement().readOnly = this.getReadOnly();      
    } catch(ex) {};
  
    return true;
  };  
  
  proto._visualizeBlur = function()
  {
    this.setCssClassName(this.getCssClassName().add("QxFocused", " ").add(this.classname + "-Focused", " "));    
    
    // blur throws the same exception as above but is not stopable in any way
    
    return true;
  };
  
  
  proto._addInlineEvents = function(el) 
  {
    el.addEventListener("input", QxWidget.__oninlineevent, false);
    
    return QxWidget.prototype._addInlineEvents.call(this, el);
  };
  
  proto._removeInlineEvents = function(el)
  {
    el.removeEventListener("input", QxWidget.__oninlineevent, false);
    
    return QxWidget.prototype._removeInlineEvents.call(this, el);
  };   
};

proto.getPreferredWidth = function()
{
  var el = this.getElement();
  
  if (el)
  {
    var w = el.style.width;
    el.style.width = "";

    var o = el.offsetWidth;    
    
    el.style.width = isValid(w) ? w : "";
    
    return o;
  };
  
  return 0;
};

proto.getPreferredHeight = function()
{
  var el = this.getElement();
  
  if (el)
  {
    var h = el.style.height;
    el.style.height = "";

    var o = el.offsetHeight;    
    
    el.style.height = isValid(h) ? h : "";
    
    return o;
  };
  
  return 0;
};



/*
  -------------------------------------------------------------------------------
    EVENT-HANDLER
  -------------------------------------------------------------------------------
*/

proto._textOnFocus = null;

proto._ontabfocus = function(e) {
  this.selectAll();  
};

proto._onfocus = function(e) {
  this._textOnFocus = this.getElement().value;
};

proto._onblur = function(e)
{
  if (this._textOnFocus != this.getElement().value) {
    this.setText(this.getElement().value);
  };
  
  this.setSelectionLength(0);
};

proto._oninlineevent = function(e)
{
  if (!e) {
    e = this.getTopLevelWidget().getDocumentElement().parentWindow.event;
  };

  switch(e.type)
  {
    case "input":      
      if (this.hasEventListeners("input")) {
        this.dispatchEvent(new QxDataEvent("input", this.getElement().value));
      };
      
      return true; 
    
    case "propertychange":
      if (e.propertyName == "value") 
      {
        if (this.hasEventListeners("input")) {
          this.dispatchEvent(new QxDataEvent("input", this.getElement().value));
        };
        
        return true;
      };
      
      break;
    
  };

  return QxWidget.prototype._oninlineevent.call(this, e);  
};



/*
  -------------------------------------------------------------------------------
    CROSS-BROWSER SELECTION HANDLING
  -------------------------------------------------------------------------------
*/

if ((new QxClient).isMshtml())
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
    this.setText(this.getElement().value);
    
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
      return "";
    };

    return vSelectionRange.text;    
  };
  
  proto.selectAll = function()
  {
    this._visualPropertyCheck();

    this.setSelectionStart(0);
    this.setSelectionLength(this.getText().length);
    
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
    el.selectionEnd = el.selectionStart + vLength;    
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
    this.setText(vValue);
    
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
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this.removeEventListener("blur", this._onblur);
  this.removeEventListener("focus", this._onfocus);
  
  QxWidget.prototype.dispose.call(this);
};
