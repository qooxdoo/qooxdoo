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
};

QxTextField.extend(QxWidget, "QxTextField");

QxTextField.addProperty({ name : "text", type : String, defaultValue : "" });
QxTextField.addProperty({ name : "maxLength", type : QxInteger });
QxTextField.addProperty({ name : "readOnly", type : Boolean });

proto._modifyText = function(propValue, propOldValue, propName, uniqModIds) {
  return this.setHtmlProperty("value", propValue);
};

proto._modifyMaxLength = function(propValue, propOldValue, propName, uniqModIds) {
  return this.setHtmlProperty("maxLength", propValue);
};

proto._modifyReadOnly = function(propValue, propOldValue, propName, uniqModIds) {
  return this.setHtmlProperty("readOnly", propValue);
};  
  
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
};