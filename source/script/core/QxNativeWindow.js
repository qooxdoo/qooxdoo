function QxNativeWindow(vCaption, vSource)
{
  QxTarget.call(this);

  this._timer = new QxTimer(50);
  this._timer.addEventListener("interval", this._ontimer, this);

  var o = this;
  this.__onreadystatechange = function(e) { return o._onreadystatechange(e); };
  this.__onload = function(e) { return o._onload(e); };

  if (isValidString(vSource)) {
    this.setSource(vSource);
  };
  
  if (isValidString(vCaption)) {
    this.setCaption(vCaption);
  };
};

QxNativeWindow.extend(QxTarget, "QxNativeWindow");

/*!
  The outer width of the window.
*/
QxNativeWindow.addProperty({ name : "width", defaultValue : 400, groups : [ "dimension" ] });

/*!
  The outer height of the window.
*/
QxNativeWindow.addProperty({ name : "height", defaultValue : 250, groups : [ "dimension" ] });

/*!
  The left screen coordinate of the window.
*/
QxNativeWindow.addProperty({ name : "left", type : Number, defaultValue : 100, groups : [ "location" ] });

/*!
  The top screen coordinate of the window.
*/
QxNativeWindow.addProperty({ name : "top", type : Number, defaultValue : 200, groups : [ "location" ] });

/*!
  Should be window be modal
*/
QxNativeWindow.addProperty({ name : "modal", type : Boolean, defaultValue : false });

/*!
  The text of the caption
*/
QxNativeWindow.addProperty({ name : "caption", type : String });

/*!
  The source url
*/
QxNativeWindow.addProperty({ name : "source", type : String });

/*!
  The text of the statusbar
*/
QxNativeWindow.addProperty({ name : "status", type : String, defaultValue : "Ready" });

/*!
  Should the statusbar be shown
*/
QxNativeWindow.addProperty({ name : "showStatusbar", type : Boolean, defaultValue : false });

/*!
  Should the menubar be shown
*/
QxNativeWindow.addProperty({ name : "showMenubar", type : Boolean, defaultValue : false });

/*!
  Should the location(bar) be shown
*/
QxNativeWindow.addProperty({ name : "showLocation", type : Boolean, defaultValue : false });

/*!
  Should the toolbar be shown
*/
QxNativeWindow.addProperty({ name : "showToolbar", type : Boolean, defaultValue : false });

/*!
  Should the caption be shown
*/
QxNativeWindow.addProperty({ name : "showCaption", type : Boolean, defaultValue : true });

/*!
  If the window is resizeable
*/
QxNativeWindow.addProperty({ name : "resizeable", type : Boolean, defaultValue : true });

/*!
  If the window is moveable
*/
QxNativeWindow.addProperty({ name : "moveable", type : Boolean, defaultValue : true });

/*!
  If the window is able to scroll and has visible scrollbars if needed
*/
QxNativeWindow.addProperty({ name : "allowScrollbars", type : Boolean, defaultValue : false });




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
  this._pane.add.apply(this._pane, arguments);
};

// Overwrite default
proto.add = proto.addToPane;




/*
------------------------------------------------------------------------------------
  COORDINATES
------------------------------------------------------------------------------------
*/

proto._modifyLeft = function(propValue, propOldValue, propName, uniqModIds) {
  return this._applyPosition();
};

proto._modifyTop = function(propValue, propOldValue, propName, uniqModIds) {
  return this._applyPosition();
};

proto._applyPosition = function()
{
  if (this._window && !this._window.closed) {
    this._window.moveTo(this.getLeft(), this.getTop());
  };

  return true;  
};



/*
------------------------------------------------------------------------------------
  CAPTION
------------------------------------------------------------------------------------
*/

proto._modifyCaption = function(propValue, propOldValue, propName, uniqModIds) {
  return this._applyCaption();  
};

proto._modifyShowCaption = function(propValue, propOldValue, propName, uniqModIds) {
  return this._applyCaption();    
};

proto._applyCaption = function()
{
  if (this._window && this._instance) 
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
  
  return true;
};






/*
------------------------------------------------------------------------------------
  SOURCE
------------------------------------------------------------------------------------
*/

proto._modifySource = function(propValue, propOldValue, propName, uniqModIds) {

  if(this._window && !this._window.closed) {
    this._window.location.replace(isValidString(propValue) ? propValue : "javascript:/" + "/");
  };

  return true;
};




/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

proto._isOpened = false;

proto._isLoaded = false;

proto.isLoaded = function() {
  return this._isLoaded;
};

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
  
  var conf = "dependent=yes,";
  
  if (isValidNumber(this.getWidth())) {
    conf += "width=" + this.getWidth() + ",";
  };
   
  if (isValidNumber(this.getHeight())) 
  {
    conf += "height=" + this.getHeight() + ",";
  };
  
  if (isValidNumber(this.getLeft())) {
    conf += "left=" + this.getLeft() + ",";
  };
  
  if (isValidNumber(this.getTop())) {
    conf += "top=" + this.getTop() + ",";
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
  conf += "location=" + (this.getShowLocation() ? "yes" : "no") + ",";
  conf += "menubar=" + (this.getShowMenubar() ? "yes" : "no") + ",";
  conf += "toolbar=" + (this.getShowToolbar() ? "yes" : "no") + ",";
  conf += "scrollbars=" + (this.getAllowScrollbars() ? "yes" : "no") + ",";
  conf += "modal=" + (this.getModal() ? "yes" : "no") + ",";


  /* 
  -----------------------------------------------------------------------------
    TIMER
  -----------------------------------------------------------------------------
  */

  this._isOpened = false;
  this._isLoaded = false;
  this._readyState = isValidString(this.getSource()) ? 5 : 0;


  /* 
  -----------------------------------------------------------------------------
    BLOCKER
  -----------------------------------------------------------------------------
  */
  
  if (this.getModal()) {
    window.application.getClientWindow().getClientDocument().block();
  };
  



  /* 
  -----------------------------------------------------------------------------
    OPEN WINDOW
  -----------------------------------------------------------------------------
  */

  this._window = window.open(isValidString(this.getSource()) ? this.getSource() : "about:blank", "w" + this.toHash(), conf);
  this._timer.restart();
  
  try{
    this._window._QxNativeWindow = this;
  } catch(ex) {};  
  
  // should we remove this events?
  // in mshtml and gecko they just does not work (we have coded some workarounds)
  QxDOM.addEventListener(this._window, "load", this.__onload);
  QxDOM.addEventListener(this._window, "readystatechange", this.__onreadystatechange);
  



  /* 
  -----------------------------------------------------------------------------
    POST FIX (ESPECIALLY FOR GECKO)
  -----------------------------------------------------------------------------
  */  
  
  if (isValidNumber(this.getWidth()) && isValidNumber(this.getHeight())) {
    this._window.resizeTo(this.getWidth(), this.getHeight());
  };

  if (isValidNumber(this.getLeft()) && isValidNumber(this.getTop())) {
    this._window.moveTo(this.getLeft(), this.getTop());
  };
};





/*
  -------------------------------------------------------------------------------
    CENTER SUPPORT
  -------------------------------------------------------------------------------
*/

proto.centerToScreen = function() {
  return this._centerHelper((screen.width - this.getWidth() - 4) / 2, (screen.height - this.getHeight() - 24) / 2);
};

proto.centerToScreenArea = function() {
  return this._centerHelper((screen.availWidth - this.getWidth() - 4) / 2, (screen.availHeight - this.getHeight() - 24 - 4) / 2);
};

proto.centerToOpener = function() {
  return this._centerHelper(((QxDOM.getWindowInnerWidth(window) - this.getWidth() - 4) / 2) + QxDOM.getComputedScreenBoxLeft(window.document.body), ((QxDOM.getWindowInnerHeight(window) - this.getHeight() - 24 - 4) / 2) + QxDOM.getComputedScreenBoxTop(window.document.body));
};

proto._centerHelper = function(l, t)
{
  // to force the move of the window
  this.forceLeft(0);
  this.forceTop(0);
  
  // set new values
  this.setLeft(l);
  this.setTop(t);

  // focus window if opened
  if (this._window && !this._window.closed) {
    this._window.focus();
  };
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

  if (isValidNumber(this._readyState) && this._isOpened && (!this._window || (this._window && this._window.closed))) 
  {
    if (this.getModal()) {
      window.application.getClientWindow().getClientDocument().release();
    };    
    
    this._timer.stop();
    
    if (this._instance) 
    {
      this._instance.dispose();
      this._instance = null;
    };
    
    this._isOpened = false;
    this._isLoaded = false;
    this._readyState = null;    
    return;
  };
  
  if (!this._window || this._timerRun) {
    return;
  };

  if (this._window) {
    this._isOpened = true;
  };

  this._timerRun = true;
  
  switch(this._readyState)
  {
    case 0:
      this._isLoaded = false;
    
      var d = this._window.document;
      if (d && d.body) {
        this._readyState++;
      };
      
      break;

    case 1:
      // Find stylesheet
      var ls = document.getElementsByTagName("head")[0].getElementsByTagName("link");

      for (var i=0, l=ls.length; i<l; i++)
        {
          if (ls[i].getAttribute("href").indexOf("layouts/") != -1) 
            {
              var s = ls[i].getAttribute("href");
              break;
            };
        };
      
      // Building new document
      var d = this._window.document;

      d.open("text/html", true);
      
      d.write('<?xml version="1.0" encoding="iso-8859-1"?>');
      
      // Some magick for our optimizer
      d.write('<!DOCTYPE html PUBLIC "-/' + '/W3C/' + '/DTD XHTML 1.1/' + '/EN" "http:/' + '/www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">');
      d.write('<html xmlns="http:/' + '/www.w3.org/1999/xhtml" xml:lang="en">');
      
      d.write('<head>');
      d.write('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-15" />');
      d.write('<meta http-equiv="MsThemeCompatible" content="yes" />');
      d.write('<meta http-equiv="ImageToolBar" content="no" />');
      d.write('<meta http-equiv="Pragma" content="no-cache" />');
      d.write('<meta http-equiv="Expires" content="-1" />');
      d.write('<meta http-equiv="Cache-Control" content="no-cache" />');
      d.write('<meta name="MSSmartTagsPreventParsing" content="yes" />');
      
      if (this.getShowCaption()) {
        d.write('<title>' + this.getCaption() + '</title>');
      };
      
      if (isValidString(s)) {
        d.write('<link type="text/css" rel="StyleSheet" href="' + s + '"/>');
      };
       
      d.write('</head><body></body></html>');
      
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
      
      this._onload();
      
      this._timer.restart();      
      break;
      
    case 5:
      try
      {
        if (this._window.document.readyState == "complete") {
          this._onload();
        };
      }
      catch(ex)
      {
        // browsers prohibit the cross-domain-scripting here
        
        // Windows XP SP1:
        // IE 6.0.2800.1106.xpsp2 throws an exception if the document is loaded and prohibit the access to it
        
        // Mozilla/5.0 (Windows; U; Windows NT 5.1; de-DE; rv:1.7.7) Gecko/20050414 Firefox/1.0.3
        // behaves the same way
        this._onload();
      };
      
      if (!this.getMoveable()) {
        this._window.moveTo(this.getLeft(), this.getTop());
      };
      
      if (!this.getResizeable()) 
      {
        if (this.getWidth() == "auto" || this.getHeight() == "auto")
        {
          var w, h;
          
          if (this.getWidth() == "auto") {
            w = this._instance.getClientDocument().getPreferredWidth();
          };
        
          if (this.getHeight() == "auto") {
            h = this._instance.getClientDocument().getPreferredHeight();
          };          

          if (isValidNumber(w) || isValidNumber(h)) 
          {
            if ((new QxClient).isMshtml())
            {
              this._window.resizeTo(isValidNumber(w) ? w + 4 : this.getWidth(), isValidNumber(h) ? h + 4 + 24 : this.getHeight());  
            }
            else
            {
              if (isValidNumber(w)) {
                this._window.innerWidth = w;
              };
              
              if (isValidNumber(h)) {
                // https://bugzilla.mozilla.org/show_bug.cgi?id=176320
                // Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.5) Gecko/20041107 Firefox/1.0
                if( this._window.innerHeight != 150 && h != 150) {
                  this._window.innerHeight = h;
                };
              };
            };
          };
        }
        else
        {
          this._window.resizeTo(this.getWidth(), this.getHeight()); 
        };
      };
      
      if (this.getModal()) {
        this._window.focus();
      };
      
      break;
  };  
  
  delete this._timerRun;
};

proto._onreadystatechange = function()
{
  if (!this._isLoaded && this._window.document && this._window.document.readyState == "complete") 
  {
    this._isLoaded = true;
    this.dispatchEvent(new QxEvent("load"));
  };
};

proto._onload = function()
{
  if (!this._isLoaded) 
  {
    this._isLoaded = true;
    this.dispatchEvent(new QxEvent("load"));
  };
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
  
  if (this._timer)
  {
    this._timer.removeEventListener("interval", this._ontimer);
    this._timer.dispose();
    
    this._timer = null;
  };

  if (this._instance) 
  {
    this._instance.dispose();
    this._instance = null;
  };
  
  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  };  

  if (this._window)
  {
    if (!this._window.closed)
    {
      QxDOM.removeEventListener(this._window, "load", this.__onload);
      QxDOM.removeEventListener(this._window, "readystatechange", this.__onreadystatechange);
    };

    this.close();

    try
    {
      if (this._window._QxNativeWindow)
      {
        this._window._QxNativeWindow.dispose();
        this._window._QxNativeWindow = null;
      };
    }
    catch(ex) {};

    this._window = null;
  };
  
  this._readyState = null;
  
  return QxTarget.prototype.dispose.call(this);
};
