function QxNativeWindow()
{
  QxTarget.call(this);
 
  var o = this;
  this.__onload = function(e) { return o._onload(e); };
};

QxNativeWindow.extend(QxTarget, "QxNativeWindow");

QxNativeWindow.addProperty({ name : "width", type : Number, defaultValue : 400 });
QxNativeWindow.addProperty({ name : "height", type : Number, defaultValue : 250 });

QxNativeWindow.addProperty({ name : "zIndex", type : Number });



/*!
  Should be window be modal
*/
QxNativeWindow.addProperty({ name : "modal", type : Boolean, defaultValue : false });

/*!
  The opener (button) of the window
*/
QxNativeWindow.addProperty({ name : "opener", type : Object });

/*!
  The text of the caption
*/
QxNativeWindow.addProperty({ name : "caption", type : String });

/*!
  The text of the statusbar
*/
QxNativeWindow.addProperty({ name : "status", type : String, defaultValue : "Ready" });

/*!
  Should the close button be shown
*/
QxNativeWindow.addProperty({ name : "showClose", type : Boolean, defaultValue : true });

/*!
  Should the maximize button be shown
*/
QxNativeWindow.addProperty({ name : "showMaximize", type : Boolean, defaultValue : true });

/*!
  Should the minimize button be shown
*/
QxNativeWindow.addProperty({ name : "showMinimize", type : Boolean, defaultValue : true });

/*!
  Should the statusbar be shown
*/
QxNativeWindow.addProperty({ name : "showStatusbar", type : Boolean, defaultValue : false });

/*!
  Should the user have the ability to close the window
*/
QxNativeWindow.addProperty({ name : "allowClose", type : Boolean, defaultValue : true });

/*!
  Should the user have the ability to maximize the window
*/
QxNativeWindow.addProperty({ name : "allowMaximize", type : Boolean, defaultValue : true });

/*!
  Should the user have the ability to minimize the window
*/
QxNativeWindow.addProperty({ name : "allowMinimize", type : Boolean, defaultValue : true });

/*!
  If the text (in the captionbar) should be visible
*/
QxNativeWindow.addProperty({ name : "showCaption", type : Boolean, defaultValue : true });

/*!
  If the icon (in the captionbar) should be visible
*/
QxNativeWindow.addProperty({ name : "showIcon", type : Boolean, defaultValue : true });

/*!
  If the window is resizeable
*/
QxNativeWindow.addProperty({ name : "resizeable", type : Boolean, defaultValue : true });

/*!
  If the window is moveable
*/
QxNativeWindow.addProperty({ name : "moveable", type : Boolean, defaultValue : true });

/*!
  The resize method to use

  Possible values: frame, opaque, lazyopaque, translucent
*/
QxNativeWindow.addProperty({ name : "resizeMethod", type : String, defaultValue : "frame" });

/*!
  The move method to use

  Possible values: frame, opaque, translucent
*/
QxNativeWindow.addProperty({ name : "moveMethod", type : String, defaultValue : "opaque" });

/*!
  If the preferred width should be also the minimum width. (Recommend!)
*/
QxNativeWindow.addProperty({ name : "usePreferredWidthAsMin", type : Boolean, defaultValue : true });

/*!
  If the preferred height should be also the minimum height. (Recommend!)
*/
QxNativeWindow.addProperty({ name : "usePreferredHeightAsMin", type : Boolean, defaultValue : true });


/*
------------------------------------------------------------------------------------
  MANAGER
------------------------------------------------------------------------------------
*/

proto._windowManager = new QxWindowManager();




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
  ALLOW COMMANDS
------------------------------------------------------------------------------------
*/

proto._modifyResizeable = function(propValue, propOldValue, propName, uniqModIds) {

  if( this.isCreated() ) {
    throw new Error("Property resizeable has no effect for already opened window!");
  };

  if (propOldValue)
  {
  };

  if (propValue)
  {
  };
  return;
};

proto._modifyModal = function(propValue, propOldValue, propName, uniqModIds) 
{  
  if (this.getActive())
  {
    // the window manager need to think we are modal
    this.forceModal(true);
    this.setVisible(false);
    
    // recover value
    this.forceModal(propValue);
    this.setVisible(true);
  };
  
  return true;
};


/*
------------------------------------------------------------------------------------
  STATUSBAR
------------------------------------------------------------------------------------
*/

proto._modifyStatus = function(propValue, propOldValue, propName, uniqModIds)
{
  if (this.getShowStatusbar()) {
    this._window.status = isValidString(propValue) ? propValue : "";
  };
  
  return true;
};

proto._modifyShowStatusbar = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
  }
  else
  {
  };
  
  return true;
};




/*
------------------------------------------------------------------------------------
  CAPTION
------------------------------------------------------------------------------------
*/

proto._modifyCaption = function(propValue, propOldValue, propName, uniqModIds)
{
  
  if (propValue)
  {
    if (this._window && this.getShowCaption()) {
 
      this._instance.getClientDocument().getDocumentElement().title = isValidString(propValue) ? propValue : "";
    };
  };
  
  return true;
};

/*
------------------------------------------------------------------------------------
  UTILITY
------------------------------------------------------------------------------------
*/

proto.close = function() {

  //  this.setVisible(false);

  this._windowManager.remove(this);
  this._window.close();
};

proto.open = function()
{
  var conf = "";
  
  if (isValidNumber(this.getWidth())) {
    conf += "WIDTH=" + this.getWidth() + ",";
  };
  
  if (isValidNumber(this.getHeight())) {
    conf += "HEIGHT=" + this.getHeight() + ",";
  };
  
  // http://www.microsoft.com/technet/prodtechnol/winxppro/maintain/sp2brows.mspx
  // Changes to Functionality in Microsoft Windows XP Service Pack 2
  // Part 5: Enhanced Browsing Security
  // URLACTION_FEATURE_WINDOW_RESTRICTIONS
  // Allow script-initiated windows without size or position constraints
  // 2102      
	
  conf += "status=no,resizable=yes";

  this._source = (new QxImageManager).getPath() + "html/basic.html";
  
  this._windowManager.add(this);

  var w = this._window = window.open( "about:blank", this.toHash(), conf);

  var caption = "CAPTION";

  // prevent timing problems in referencing a newly created window
  // (Danny Goodman, Dynamic HTML 2nd ed., p. 1004)
  var o = this;
  window.setTimeout( function() {

    var doc = w.document;
    
    doc.open("text/html", true);

    doc.write('<?xml version="1.0" encoding="iso-8859-1"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de">\n<head>\n  <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-15" />\n  <meta http-equiv="MsThemeCompatible" content="yes" />\n  <meta http-equiv="ImageToolBar" content="no" />\n  <meta http-equiv="Pragma" content="no-cache" />\n  <meta http-equiv="Expires" content="-1" />\n  <meta http-equiv="Cache-Control" content="no-cache" />\n  <meta name="MSSmartTagsPreventParsing" content="yes" />\n\n  <title>' + caption + '</title>\n  <link type="text/css" rel="StyleSheet" href="../../style/layouts/application.css"/>\n</head>\n<body><p>&#160;</p></body>\n</html>');

    doc.close();

    window.setTimeout(function()
    {
      o._onload();
    }, 1000 );

  }, 1000 );
};

proto.focus = function() {
  this.setActive(true);
  this._window.focus();
};

proto.blur = function() {
  this.setActive(false);
  this._window.focus();
};

proto._onload = function(e)
{
  this._instance = new QxClientWindow(this._window);
  this._pane = this._instance.getClientDocument();
  
  this.main();
};

proto.setActive = function( propValue, uniqModIds)
{
  return true;
};



/*
------------------------------------------------------------------------------------
  BUTTON EVENTS
------------------------------------------------------------------------------------
*/

proto._onminimizebuttonclick = function(e)
{
  this.debug("_onminimizebuttonclick()");
};

proto._onrestorebuttonclick = function(e)
{
  this.debug("_onrestorebuttonclick()");
};

proto._onmaximizebuttonclick = function(e)
{
  this.debug("_onmaximizebuttonclick()");
};

proto._onclosebuttonclick = function(e)
{
  this.debug("_onclosebuttonclick()");
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
  
  w = this._pane;
  if (w)
  {
    w.dispose();
    this._pane = null;
  };

  if( this._window ) {
    // TODO: only for dependent
    this.close();
  };

};
