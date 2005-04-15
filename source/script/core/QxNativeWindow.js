function QxNativeWindow(vCaption)
{
  QxTarget.call(this);

  this._timer = new QxTimer(50);
  this._timer.addEventListener("interval", this._ontimer, this);
  
  if (isValidString(vCaption)) {
    this.setCaption(vCaption);
  };
  
};

QxNativeWindow.extend(QxTarget, "QxNativeWindow");

QxNativeWindow.addProperty({ name : "width", type : Number, defaultValue : 400 });
QxNativeWindow.addProperty({ name : "height", type : Number, defaultValue : 250 });

QxNativeWindow.addProperty({ name : "left", type : Number });
QxNativeWindow.addProperty({ name : "top", type : Number });



/*!
  Should be window be modal
*/
QxNativeWindow.addProperty({ name : "modal", type : Boolean, defaultValue : false });

/*!
  The text of the caption
*/
QxNativeWindow.addProperty({ name : "caption", type : String });

/*!
  The text of the statusbar
*/
QxNativeWindow.addProperty({ name : "status", type : String, defaultValue : "Ready" });

/*!
  Should the statusbar be shown
*/
QxNativeWindow.addProperty({ name : "showStatusbar", type : Boolean, defaultValue : false });

/*!
  If the window is resizeable
*/
QxNativeWindow.addProperty({ name : "resizeable", type : Boolean, defaultValue : true });






/*
------------------------------------------------------------------------------------
  SUB WIDGET GETTER
------------------------------------------------------------------------------------
*/

proto.getPane = function() {
  return this._pane;
};




/*
------------------------------------------------------------------------------------
  MODIFIY ADDER LOGIC
------------------------------------------------------------------------------------
*/

proto.addToWindow = proto.add;

proto.addToPane = function() {
  this._pane.add.apply( this._pane, arguments);
};

// Overwrite default
proto.add = proto.addToPane;









/*
------------------------------------------------------------------------------------
  CAPTION
------------------------------------------------------------------------------------
*/

proto._modifyCaption = function(propValue, propOldValue, propName, uniqModIds)
{
  this._applyCaption();  
  return true;
};

proto._applyCaption = function()
{
  if (this._window) 
  {
    var v = "";
    
    if (this.getShowCaption())
    {
      var vc = this.getCaption();
      if (isValidString(vc)) {
        v = vc;
      };
    };
    
    this._instance.getClientDocument().getDocumentElement().title = v;
  };
};






/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

proto.close = function() 
{
  if (this._window) {
    this._window.close();
  };
};

proto.open = function()
{
  /* 
  -----------------------------------------------------------------------------
    PRE CONFIGURE WINDOW
  -----------------------------------------------------------------------------
  */ 
  
  var conf = "";
  
  if (isValidNumber(this.getWidth())) {
    conf += "width=" + this.getWidth() + ",";
  };
  
  if (isValidNumber(this.getHeight())) {
    conf += "height=" + this.getHeight() + ",";
  };
  
  /*
    http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
    Changes to Functionality in Microsoft Windows XP Service Pack 2
    Part 5: Enhanced Browsing Security
    URLACTION_FEATURE_WINDOW_RESTRICTIONS
    Allow script-initiated windows without size or position constraints
    Code: 2102      
  */

  conf += "resizable=" + (this.getResizeable() ? "yes" : "no") + ",";
  conf += "status=" + (this.getShowStatusbar() ? "yes" : "no") + ",";
  


  /* 
  -----------------------------------------------------------------------------
    TIMER
  -----------------------------------------------------------------------------
  */

  this._readyState = 0;  
  this._timer.restart();



  /* 
  -----------------------------------------------------------------------------
    OPEN WINDOW
  -----------------------------------------------------------------------------
  */
  
  this._window = window.open("about:blank", "w" + this.toHash(), conf);
};




/*
  -------------------------------------------------------------------------------
    FOCUS HANDLING
  -------------------------------------------------------------------------------
*/

proto.focus = function() 
{
  if (this._window) {
    this._window.focus();
  };
};

proto.blur = function() 
{
  if (this._window) {
    this._window.blur();
  };
};




/*
  -------------------------------------------------------------------------------
    TIMER
  -------------------------------------------------------------------------------
*/

proto._ontimer = function(e)
{
  if (!this._window || this._timerRun) {
    return;
  };
  
  this._timerRun = true;
  
  
  
  switch(this._readyState)
  {
    case 0:
      var d = this._window.document;
      if (d && d.body) {
        this._readyState++;
      };
      
      break;

    case 1:
      var d = this._window.document;

      d.open("text/html", true);
      
      d.write('<?xml version="1.0" encoding="iso-8859-1"?>');
      d.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">');
      d.write('<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">');
      d.write('<head>');
      d.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-15" />');
      d.write('<meta http-equiv="MsThemeCompatible" content="yes" />');
      d.write('<meta http-equiv="ImageToolBar" content="no" />');
      d.write('<meta http-equiv="Pragma" content="no-cache" />');
      d.write('<meta http-equiv="Expires" content="-1" />');
      d.write('<meta http-equiv="Cache-Control" content="no-cache" />');
      d.write('<meta name="MSSmartTagsPreventParsing" content="yes" />');
      d.write('<title>' + this.getCaption() + '</title>');
      d.write('<link type="text/css" rel="StyleSheet" href="../../style/layouts/application.css"/>');
      d.write('</head>');
      d.write('<body>');
      d.write('</body>');
      d.write('</html>');
      
      d.close();
      
      this._readyState++;
      break;      
      
    case 2:
      var d = this._window.document;
      if (d && d.body) 
      {
        this._instance = new QxClientWindow(this._window);
        this._pane = this._instance.getClientDocument();
      
        this._readyState++;
      };
      
      break;
      
    case 3:
      try{
        if (this.hasEventListeners("ready")) {
          this.dispatchEvent(new QxEvent("ready"));
        };    
      }
      catch(ex)
      {
        this.debug("Error in ready implementation: " + ex);
        this._timer.stop();
      };
      
      this._readyState++;
      
      break;
      
    case 4:
      this._window.focus();
      this._readyState++;
      
      break;
      
    case 5:
      this._timer.restartWith(10);
    
      if (this.getModal()) {
        this._window.focus();
      };
      
      
      

  };  
  
  delete this._timerRun;
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
  
  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  };
  
  if (this._timer)
  {
    this._timer.removeEventListener("interval", this._ontimer);
    this._timer.dispose();
    
    this._timer = null;
  };
  
  QxTarget.prototype.dispose.call(this);
  
  if (this._window)
  {
    this.close();
    this._window = null;
  };
};
