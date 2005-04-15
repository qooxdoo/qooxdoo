/*!
  This is the main widget, all visible objects in the application extend this.
*/
function QxWidget()
{
  QxTarget.call(this);

  // Contains all children
  this._children = [];

  // Allows the user to setup styles and attributes without a
  // need to have the target element created already.
  this._htmlProperties = copyCreateHash(this._htmlProperties);
  this._htmlProperties.id = "QxWidget-" + (++QxWidget._count);
  this._htmlProperties.className = this.classname;

  // Only overwrite the following if unset through copyCreateHash
  if (isInvalid(this._htmlProperties.hideFocus)) {
    this._htmlProperties.hideFocus = false;
  };

  if (isInvalid(this._htmlProperties.unselectable)) {
    this._htmlProperties.unselectable = "on";
  };

  this._htmlAttributes = copyCreateHash(this._htmlAttributes);
  this._styleProperties = copyCreateHash(this._styleProperties);

  // This lists manage the usage of dimension
  // properties for each direction
  //this._usedDimensionsHorizontal = copyCreateArray(this._usedDimensionsHorizontal);
  //this._usedDimensionsVertical = copyCreateArray(this._usedDimensionsVertical);
  this._usedDimensionsHorizontal = [];
  this._usedDimensionsVertical = [];
};

QxWidget.extend(QxTarget, "QxWidget");

// Each new widget get a increment number as ID
QxWidget._count = 0;


/*
------------------------------------------------------------------------------------
  BASIC PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The parent widget (the real object, no ID or something)
*/
QxWidget.addProperty({ name : "parent", defaultValue : null });

/*!
  The element node (if the widget is created, otherwise null)
*/
QxWidget.addProperty({ name : "element" });

/*!
  Make element visible (if switched to true the widget
  will be created, if needed, too)
*/
QxWidget.addProperty({ name : "visible", type : Boolean, defaultValue : false, getAlias : "isVisible" });

/*!
  If you switch this to true, the widget doesn't handle
  events directly. It will redirect them to the parent
  widget.
*/
QxWidget.addProperty({ name : "anonymous", type : Boolean, defaultValue : false, getAlias : "isAnonymous" });

/*!
  The tagname of the element which should automatically be created
*/
QxWidget.addProperty({ name : "tagName", type : String, defaultValue : "DIV" });

/*!
	The CSS class name for the element representing the widget.
	This property should be changed with caution since in some cases
	this might give unrespected results.
*/
QxWidget.addProperty({ name : "cssClassName", type : String });

/*!
  Timer based creation wanted?
*/
QxWidget.addProperty({ name : "timerCreate", type : Boolean, defaultValue : true });



/*
------------------------------------------------------------------------------------
  STYLE PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  Mapping to native style property position.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "position", type : String, impl : "styleProperty" });

/*!
  Mapping to native style property float.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "float", type : String, impl : "floatStyleProperty" });

/*!
  Mapping to native style property display.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "display", type : String, impl : "styleProperty", defaultValue : "none" });

/*!
  Mapping to native style property visibility.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "visibility", type : String, impl : "styleProperty", defaultValue : "hidden" });

/*!
  Mapping to native style property text-align.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "textAlign", type : String, impl : "styleProperty", groups : [ "align" ] });

/*!
  Mapping to native style property vertical-align.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "verticalAlign", type : String, impl : "styleProperty", groups : [ "align" ] });

/*!
  Mapping to native style property z-index.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "zIndex", type : Number, impl : "styleProperty" });

/*!
  Mapping to native style property background-color.

  A more complex alias to style properties, allows multiple other values
  since we use QxColor as type here.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "backgroundColor", type : QxColor, impl : "styleProperty" });

/*!
  Mapping to native style property color.

  A more complex alias to style properties, allows multiple other values
  since we use QxColor as type here.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "color", type : QxColor, impl : "styleProperty" });

/*!
  The border property describes how to paint the border on the widget.

  Needs a EndBorder Object as value. There are predefined values in QxBorder.presets.
  Look at the documentation of QxWidget to get a full list.

  This should be used with caution since in some cases (mostly complex widgets)
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "border", type : Object });


/*!
  Mapping to native style property opacity.

  The uniform opacity setting to be applied across an entire object. Behaves like the new CSS-3 Property.
  Any values outside the range 0.0 (fully transparent) to 1.0 (fully opaque) will be clamped to this range.
*/
QxWidget.addProperty({ name : "opacity", type : Number });

/*!
  Mapping to native style property cursor.

  The name of the cursor to show when the mouse pointer is over the widget.
  This is any valid CSS2 cursor name defined by W3C.
*/
QxWidget.addProperty({ name : "cursor", type : String });

/*!
  Mapping to native style property background-image.

  The URI of the image file to use as background image.
*/
QxWidget.addProperty({ name : "backgroundImage", type : String });

/*!
Describes how to handle content that is too large to fit inside the widget.

Overflow modes:
* hidden: The content is clipped
* auto: Scroll bars are shown as needed
* scroll: Scroll bars are always shown. Even if there is enough room for the content inside the widget.
* scrollX: Scroll bars for the X-Axis are always shown.
    Even if there is enough room for the content inside the widget.
* scrollY: Scroll bars for the Y-Axis are always shown.
    Even if there is enough room for the content inside the widget.
*/
QxWidget.addProperty({ name : "overflow", type : String });





/*
------------------------------------------------------------------------------------
  MANAGMENT PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  Set this to a positive value makes the widget able to get the focus.
  It even is reachable through the usage of the tab-key.

  Widgets with the same tabIndex are handled through there position
  in the document.
*/
QxWidget.addProperty({ name : "tabIndex", type : Number, defaultValue : -1 });

/*!
  Handle focus state of this widget.

  someWidget.setFocused(true) set the current focus to this widget.
  someWidget.setFocused(false) remove the current focus and leave it blank.

  Normally you didn't need to set this directly.
*/
QxWidget.addProperty({ name : "focused", type : Boolean, defaultValue : false });

/*!
  Toggle the possibility to select the element of this widget.
*/
QxWidget.addProperty({ name : "canSelect", type : Boolean, defaultValue : true });

/*!
  Contains the tooltip object connected to the widget.
*/
QxWidget.addProperty({ name : "toolTip", type : Object });

/*!
  Contains the context menu object connected to the widget. (Need real implementation)
*/
QxWidget.addProperty({ name : "contextMenu", type : Object });

/*!
  The current state of the widget, could be something
  like pressed, hover, open, active, ...
  Add automatically a css classname based on the state value.
*/
QxWidget.addProperty({ name : "state", type : String });

/*!
  Capture all events and map them to this widget
*/
QxWidget.addProperty({ name : "capture", type : Boolean, defaultValue : false });

/*!
  Contains the support drop types for drag and drop support
*/
QxWidget.addProperty({ name : "dropDataTypes", type : Object });

/*!
  A command called if the widget should be excecuted (a placeholder for buttons, ...)
*/
QxWidget.addProperty({ name : "command", type : Object });

/*!
  Appearance of the widget
*/
QxWidget.addProperty({ name : "appearance", type : String });








/*
+-Outer----------------------------------------+
|  Margin                                      |
|  +-Box------------------------------+        |
|  |  Border (+ Scrollbar)            |        |
|  |  +-Area--------------------+     |        |
|  |  |  Padding                |     |        |
|  |  |  +-Inner----------+     |     |        |
|  |  |  |                |     |     |        |
|  |  |  +----------------+     |     |        |
|  |  +-------------------------+     |        |
|  +----------------------------------+        |
+----------------------------------------------+
*/

/*
------------------------------------------------------------------------------------
  MARGIN/PADDING PROPERTIES
------------------------------------------------------------------------------------
*/

QxWidget.addProperty({ name : "marginTop", type : Number, defaultValue : 0, impl : "marginVertical", groups : [ "margin" ] });
QxWidget.addProperty({ name : "marginRight", type : Number, defaultValue : 0, impl : "marginHorizontal", groups : [ "margin" ] });
QxWidget.addProperty({ name : "marginBottom", type : Number, defaultValue : 0, impl : "marginVertical", groups : [ "margin" ] });
QxWidget.addProperty({ name : "marginLeft", type : Number, defaultValue : 0, impl : "marginHorizontal", groups : [ "margin" ] });

QxWidget.addProperty({ name : "paddingTop", type : Number, defaultValue : 0, impl : "paddingVertical", groups : [ "padding" ] });
QxWidget.addProperty({ name : "paddingRight", type : Number, defaultValue : 0, impl : "paddingHorizontal", groups : [ "padding" ] });
QxWidget.addProperty({ name : "paddingBottom", type : Number, defaultValue : 0, impl : "paddingVertical", groups : [ "padding" ] });
QxWidget.addProperty({ name : "paddingLeft", type : Number, defaultValue : 0, impl : "paddingHorizontal", groups : [ "padding" ] });






/*
------------------------------------------------------------------------------------
  HORIZONAL DIMENSION PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The distance from the outer left border to the parent left area edge.

  You could only set two of the three horizonal dimension properties (boxLeft, boxRight, boxWidth)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "left", impl : "horizontalDimension", groups : [ "location", "space", "edge" ] });

/*!
  The distance from the outer right border to the parent right area edge.

  You could only set two of the three horizonal dimension properties (boxLeft, boxRight, boxWidth)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "right", impl : "horizontalDimension", groups : [ "edge" ] });

/*!
  The width of the box (including padding and border).

  You could only set two of the three horizonal dimension properties (boxLeft, boxRight, boxWidth)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "width", impl : "horizontalDimension", groups : [ "dimension", "space" ] });

/*!
  The minimum width of the box (including padding and border).

  Set this to omit the shrinking of the box width under this value.
*/
QxWidget.addProperty({ name : "minWidth", impl : "horizontalLimitDimension", defaultValue : -Infinity });

/*!
  The maximum width of the box (including padding and border).

  Set this to omit the expanding of the box width above this value.
*/
QxWidget.addProperty({ name : "maxWidth", impl : "horizontalLimitDimension", defaultValue : Infinity });







/*
------------------------------------------------------------------------------------
  VERTICAL DIMENSION PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The distance from the outer top border to the parent top area edge.

  You could only set two of the three vertical dimension properties (boxTop, boxBottom, boxHeight)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "top", impl : "verticalDimension", groups : [ "location", "space", "edge" ] });

/*!
  The distance from the outer bottom border to the parent bottom area edge.

  You could only set two of the three vertical dimension properties (boxTop, boxBottom, boxHeight)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "bottom", impl : "verticalDimension", groups : [ "edge" ] });

/*!
  The height of the box (including padding and border).

  You could only set two of the three vertical dimension properties (boxTop, boxBottom, boxHeight)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "height", impl : "verticalDimension", groups : [ "dimension", "space" ] });

/*!
  The minimum height of the box (including padding and border).

  Set this to omit the shrinking of the box height under this value.
*/
QxWidget.addProperty({ name : "minHeight", impl : "verticalLimitDimension", defaultValue : -Infinity });

/*!
  The maximum height of the box (including padding and border).

  Set this to omit the expanding of the box height above this value.
*/
QxWidget.addProperty({ name : "maxHeight", impl : "verticalLimitDimension", defaultValue : Infinity });








/*
------------------------------------------------------------------------------------
  BASICS
------------------------------------------------------------------------------------
*/

/*!
  Check if the widget is created (or the element is already available).
*/
proto.isCreated = function() {
  return Boolean(this.getElement());
};

/*!
  Used for propertiy handlers which require that the element is created.
*/
proto._visualPropertyCheck = function()
{
  if (!this.isCreated()) {
    throw new Error("Create the element first!");
  };
};

/*!
  Get style element of created widget

  This should be used with caution since in some cases
  this might give unrespected results.
*/
proto.getStyle = function()
{
  var el = this.getElement();
  if (!el) {
    throw new Error("Element is not already created!");
  };

  return el.style;
};

/*!
  Create widget with empty element (of specified tagname).
*/
proto._createElement = function(uniqModIds) {
  return this.setElement(document.createElement(this.getTagName()), uniqModIds);
};

/*!
Returns the node where to append the child

#param otherObject[Instance of QxWidget]: The widget which should be appended
*/
proto._getParentNodeForChild = function(otherObject) {
  return this.getElement();
};


proto._createChildren = function()
{
  var ch = this.getChildren();
  var chl = ch.length;
  var cho;
  var el;

  try
  {
    for (var i=0; i<chl; i++)
    {
      cho = ch[i];

      switch(cho.isCreated())
      {
        case true:
          el = cho.getElement();

          // Only append if not have currently a parentNode
          // AND
          // if it should become created (in an uncreated scenario)
          // (this keeps the order of childrens)
          if (!el.parentNode && cho._shouldBecomeCreated()) {
            this._getParentNodeForChild(cho).appendChild(el);
          };

          break;


        case false:
          if (cho._shouldBecomeCreated()) {
            cho._createElementWrapper();
          };

          break;
      };
    };
  }
  catch(ex)
  {
    throw new Error("Failed to setup children: " + ex);
  };
};

proto._shouldBecomeCreated = function() {
  return true;
};

proto._shouldBecomeChilds = function() {
  return true;
};

proto._shouldBecomeVisible = function() {
  return true;
};



/*!
  Append element of given QxWidget to myself.
*/
proto._appendElement = function(otherObject)
{
  // this.subug("append element");

  var pl = this._getParentNodeForChild(otherObject);

  if (pl)
  {
    var el = otherObject.getElement();

    try
    {
      pl.appendChild(el);
      
      // always scroll to top (fix memory function in gecko, ...)
      el.scrollTop = el.scrollLeft = pl.scrollTop = pl.scrollLeft = 0;
    }
    catch(ex)
    {
      throw new Error("Could not append element: " + el + " to " + pl + ": " + ex);
    };

    this._postAppendChild(otherObject);
  }
  else
  {
    throw new Error("No parent node available for this widget: " + otherObject + ")");
  };
};

/*!
  Remove element of given QxWidget from myself.
*/
proto._removeElement = function(otherObject)
{
  // this.subug("remove element: " + otherObject);

  var el = otherObject.getElement();
  var pl = el.parentNode;

  // this.subug("elements: " + el + ", " + pl);

  if (pl)
  {
    // this.subug("do remove it!");

    try
    {
      pl.removeChild(el);
    }
    catch(ex)
    {
      throw new Error("Could not remove element: " + el + ": " + ex);
    };

    this._postRemoveChild(otherObject);
  };
};

proto._postAppendChild = function(otherObject)
{
  if (!this._wasVisible) {
    return;
  };

  this._invalidatePreferred();
  this._onnewchild(otherObject);
};

proto._onnewchild = function(otherObject)
{
  if (this.getWidth() == "auto") {
    this._setChildrenDependWidth(otherObject, "append-child");
  };

  if (this.getHeight() == "auto") {
    this._setChildrenDependHeight(otherObject, "append-child");
  };
};

proto._postRemoveChild = function(otherObject)
{
  if (!this._wasVisible) {
    return;
  };

  this._invalidatePreferred();
  this._onremovechild(otherObject);
};

proto._onremovechild = function(otherObject)
{
  if (this.getWidth() == "auto") {
    this._setChildrenDependWidth(otherObject, "remove-child");
  };

  if (this.getHeight() == "auto") {
    this._setChildrenDependHeight(otherObject, "remove-child");
  };
};

/*!
  Append element to parent node.
*/
proto._appendMyself = function()
{
  //this.subug("append myself");

  var pa = this.getParent();
  if (pa) {
    pa._appendElement(this);
  };
};

/*!
  Remove element from parent node.
*/
proto._removeMyself = function(vParent)
{
  if (vParent) {
    vParent._removeElement(this);
  };
};






/*!
  Things that should be executed before the object will be shown.
*/
proto._beforeShow = function(uniqModIds) {};

/*!
  Things that should be executed before the widget will be hidden.
*/
proto._beforeHide = function(uniqModIds) {};




/*
------------------------------------------------------------------------------------
  CREATOR
------------------------------------------------------------------------------------
*/

QxWidget._createList = [];
QxWidget._createListLength = 0;
QxWidget._createListMaxCount = 0;
QxWidget._createMaxTimeout = 500;
QxWidget._createInterval = 10;

QxWidget.addToCreateList = function(vWidget)
{
  QxWidget._createList.push(vWidget);
  QxWidget._createListMaxCount++;
  QxWidget._createListLength++;

  if (QxWidget._createTimer == null) 
  {
    var vWin = window.application.getClientWindow();
    if (vWin && vWin.hasEventListeners("creatorStarted")) {
      vWin.dispatchEvent(new QxEvent("creatorStarted"), true);
    };      
    
    this._createStart = (new Date).valueOf();
    QxWidget._createTimer = window.setInterval("QxWidget._timeCreator()", QxWidget._createInterval);
  };
};

QxWidget._timeCreator = function()
{
  if (this._timeCreatorRun) {
    return;
  };

  this._timeCreatorRun = true;
  
  var vParent, vCurrent;
  var vList = QxWidget._createList;
  var vStart = (new Date).valueOf();
  
  while((vCurrent = vList[0]) && ((new Date).valueOf() - vStart) < QxWidget._createMaxTimeout)
  {
    if (vCurrent.isCreated()) {
      vList.shift();
      continue;
    };
    
    vParent = vCurrent.getParent();
    
    if (vParent && vParent.isCreated()) 
    {      
      vCurrent._createElement();
      vList.shift();
      QxWidget._createListLength--;      
    };
  };
  
  /*
  var vProgress = 100 - Math.round(QxWidget._createListLength / QxWidget._createListMaxCount * 100);
  for (var s="Progress: ", i=0; i<vProgress; i+=5) { s += "*"; };
  window.status = s;
  */
  
  var vWin = window.application.getClientWindow();
  if (vWin && vWin.hasEventListeners("creatorInterval")) {
    vWin.dispatchEvent(new QxDataEvent("creatorInterval", 100 - Math.round(QxWidget._createListLength / QxWidget._createListMaxCount * 100)), true);
  };
  
  if (QxWidget._createListLength == 0) 
  {
    window.clearInterval(QxWidget._createTimer);
    QxWidget._createTimer = null;    
    QxWidget._createListMaxCount = 0;
    
    var vWin = window.application.getClientWindow();
    if (vWin && vWin.hasEventListeners("creatorStopped")) {
      vWin.dispatchEvent(new QxEvent("creatorStopped"), true);
    };    
  };
  
  delete this._timeCreatorRun;
};

proto._createElementWrapper = function(uniqModIds)
{
  var vParent = this.getParent();

  if (this.getTimerCreate() && vParent.getWidth() != "auto" && vParent.getHeight() != "auto")
  {
    QxWidget.addToCreateList(this);
  }
  else
  {
    this._createElement(uniqModIds);
  };
};



/*
------------------------------------------------------------------------------------
  BASIC MODIFIERS
------------------------------------------------------------------------------------
*/

proto._modifyParent = function(propValue, propOldValue, propName, uniqModIds)
{
  // this.debug("New Parent: " + propValue + ": " + this.getElement());

  if (propOldValue)
  {
    propOldValue._removeChild(this);

    if (this.isCreated())
    {
      this._removeMyself(propOldValue);
    };
  };

  if (propValue)
  {
    // pre check if the the widget where to add myself is inside myself.
    // not really speedy, but more secure.
    if (this.contains(propValue)) {
      throw new Error("Could not add me to a child!");
    };

    propValue._pushChild(this);

    if (propValue.isCreated())
    {
      if (!propValue._shouldBecomeChilds())
      {
        // this.debug("should not become childs #2");
        return true;
      }
      else if (!this._shouldBecomeCreated())
      {
        // this.debug("i should not become created");
        return true;
      }
      else if (!this.isCreated())
      {
        this._createElementWrapper(uniqModIds);
      }
      else
      {
        this._appendMyself();
        this._render("force");
      };
    };
  };

  return true;
};

proto._modifyElement = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    // remove node from parent
    this._removeMyself(this.getParent());

    // reset reference to widget instance
    propOldValue._QxWidget = null;

    // reset id and name
    propOldValue.id = "";
    propOldValue.name = "";

    // remove events
    this._removeInlineEvents(propOldValue);
  };

  if (propValue)
  {
    // this.debug("Create element");

    // add reference to widget instance
    propValue._QxWidget = this;
    
    // apply cached properties and attributes
    this._applyStyleProperties(propValue, uniqModIds);
    this._applyHtmlProperties(propValue, uniqModIds);
    this._applyHtmlAttributes(propValue, uniqModIds);

    // inline events
    this._addInlineEvents(propValue);

    // make visibible
    this.setVisible(true, uniqModIds);
  };

  return true;
};



if ((new QxClient).isMshtml())
{
  proto._addInlineEvents = function(el)
  {
    el.onpropertychange = QxWidget.__oninlineevent;

    el.attachEvent("onselect", QxWidget.__oninlineevent);
    el.attachEvent("onscroll", QxWidget.__oninlineevent);
    el.attachEvent("onfocus", QxWidget.__oninlineevent);
    el.attachEvent("onblur", QxWidget.__oninlineevent);
  };

  proto._removeInlineEvents = function(el)
  {
    el.onpropertychange = null;

    el.detachEvent("onselect", QxWidget.__oninlineevent);
    el.detachEvent("onscroll", QxWidget.__oninlineevent);
    el.detachEvent("onfocus", QxWidget.__oninlineevent);
    el.detachEvent("onblur", QxWidget.__oninlineevent);
  };
}
else
{
  proto._addInlineEvents = function(el)
  {
    el.addEventListener("select", QxWidget.__oninlineevent, false);
    el.addEventListener("scroll", QxWidget.__oninlineevent, false);
    el.addEventListener("focus", QxWidget.__oninlineevent, false);
    el.addEventListener("blur", QxWidget.__oninlineevent, false);
  };

  proto._removeInlineEvents = function(el)
  {
    el.removeEventListener("select", QxWidget.__oninlineevent, false);
    el.removeEventListener("scroll", QxWidget.__oninlineevent, false);
    el.removeEventListener("focus", QxWidget.__oninlineevent, false);
    el.removeEventListener("blur", QxWidget.__oninlineevent, false);
  };
};

QxWidget.__oninlineevent = function(e)
{
  if (this._QxWidget) {
    return this._QxWidget._oninlineevent(e);
  };
};

proto._oninlineevent = function(e)
{
  if (!e) {
    e = window.event;
  };
  
  switch(e.type)
  {
    case "focus":
    case "blur":
    case "select":
    case "scroll":
      break;

    case "propertychange":
      break;

    default:
      this.debug("Uncatched inline event: " + e.type);
  };
};




proto._wasVisible = false;

proto._modifyVisible = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue)
  {
    if (!this.isCreated())
    {
      // new logic, force visible to false again and wait for creation
      this.forceVisible(false);
      this._createElementWrapper();
      return true;
    };

    // this.debug("Make visible");

    if (!this._wasVisible)
    {
      this.setDisplay(null);

      // this is needed for all relative or preferred dimensions to do now,
      // otherwise they will fail in QxDOM
      this._appendMyself();

      var vAutoWidth = this._typeof_width == "auto";
      var vAutoHeight = this._typeof_height == "auto";

      if (vAutoWidth || vAutoHeight)
      {
        // this.subug("layout mode: auto");

        this._createChildren();

        if (vAutoWidth) {
          this._setChildrenDependWidth();
        };

        if (vAutoHeight) {
          this._setChildrenDependHeight();
        };

        this._render("initial");
        this._wasVisible = true;

        // Be sure that all children will be rendered correctly
        var ch = this.getChildren();
        var chl = ch.length;

        for (var i=0; i<chl; i++) {
          ch[i]._render("initial");
        };
      }
      else
      {
        // this.subug("layout mode: static");

        this._render("initial");
        this._wasVisible = true;

        this._createChildren();
      };

      this._invalidatePreferred();
    }
    else
    {
      this.setDisplay(null);

      // this.debug("Omit Check: " + this._renderHorizontalOmitted + ", " + this._renderVerticalOmitted);

      if (this._renderHorizontalOmitted)
      {
        this._renderHorizontal("force");
        this._renderHorizontalOmitted = false;
      };

      if (this._renderVerticalOmitted)
      {
        this._renderVertical("force");
        this._renderVerticalOmitted = false;
      };
    };

    this._beforeShow(uniqModIds);
    this.setVisibility("inherit", uniqModIds);
  }
  else
  {
    this._beforeHide(uniqModIds);

    // this.subug("hide element");

    this.setVisibility("hidden", uniqModIds);
    this.setDisplay("none");
  };
  
  return true;
};







/*
------------------------------------------------------------------------------------
  CHILDREN MANAGMENT
------------------------------------------------------------------------------------
*/

/*!
  Return the array of all children
*/
proto.getChildren = function() {
  return this._children;
};

/*!
  Get children count
*/
proto.getChildrenLength = function() {
  return this.getChildren().length;
};

/*!
  Check if the widget has a children
*/
proto.hasChildren = function() {
  return this.getChildrenLength() > 0;
};

/*!
  The the widget which is at the top level,
  which contains all others (normally a
  instance of QxClientDocument).
*/
proto.getTopLevelWidget = function()
{
  var p = this.getParent();

  if(p == null) {
    return null;
  };

  return p.getTopLevelWidget();
};

/*!
  Add/Append another widget. Allows to add multiple at
  one, a parameter could be a widget.
*/
proto.add = function()
{
  var l = arguments.length;
  var o;

  for (var i=0; i<l; i++)
  {
    o = arguments[i];

    if (!(o instanceof QxWidget))
    {
      throw new Error("Invalid Widget: " + o);
    }
    else
    {
      o.setParent(this);
    };
  };

  return this;
};

/*!
Add a single widget before another children, already in

#param otherWidget[QxWidget]: Widget to add to the children
#param beforeWidget[QxWidget]: Widget to place the new widget before
*/
proto.addBefore = function(otherWidget, beforeWidget)
{
  if (!(otherWidget instanceof QxWidget) || !(beforeWidget instanceof QxWidget)) {
    throw new Error("Invalid widgets: " + otherWidget + ", " + beforeWidget);
  };

  if (beforeWidget.getParent() != this) {
    throw new Error("Invalid before widget: " + beforeWidget + ". Should be child of same parent!");
  };

  // not really speedy, but more secure
  if (otherWidget.contains(this)) {
    throw new Error("Could not add me to a child!");
  };

  var ch = this.getChildren();
  var oldLength = ch.length;

  // omit duplicates in children list
  ch.remove(otherWidget);

  // use array prototype extension
  ch.insertBefore(otherWidget, beforeWidget);

  // call sub
  this._complexAdd(otherWidget, oldLength);
};

/*!
Add a single widget after another children, already in

#param otherWidget[QxWidget]: Widget to add to the children
#param beforeWidget[QxWidget]: Widget to place the new widget before
*/
proto.addAfter = function(otherWidget, afterWidget)
{
  if (!(otherWidget instanceof QxWidget) || !(afterWidget instanceof QxWidget)) {
    throw new Error("Invalid widgets: " + otherWidget + ", " + afterWidget);
  };

  if (afterWidget.getParent() != this) {
    throw new Error("Invalid after widget: " + afterWidget + ". Should be child of same parent!");
  };

  // not really speedy, but more secure
  if (otherWidget.contains(this)) {
    throw new Error("Could not add me to a child!");
  };

  var ch = this.getChildren();
  var oldLength = ch.length;

  // omit duplicates in children list
  ch.remove(otherWidget);

  // use array prototype extension
  ch.insertAfter(otherWidget, afterWidget);

  // call sub
  this._complexAdd(otherWidget, oldLength);
};

/*!
  Handles complex additions to the childrens, needed by addBefore and addAfter.
*/
proto._complexAdd = function(otherWidget, oldLength)
{
  var ch = this._children;
  var newLength = ch.length;

  if (otherWidget.getParent() == this)
  {
    this.syncChildrenOrder();

    if (newLength != oldLength && newLength == 1)
    {
      this._firstChildCache = otherWidget;
      this._lastChildCache = otherWidget;

      if (this.isCreated() && oldLength > 1) {
        this._obtainFirstChild();
      };

      if (otherWidget.isCreated()) {
        otherWidget._obtainFirstChildState();
      };
    }
    else
    {
      var newFirst = ch[0];
      if (this._firstChildCache && this._firstChildCache != newFirst)
      {
        var oldFirst = this._firstChildCache;
        this._firstChildCache = newFirst;

        if (oldFirst.isCreated()) {
          oldFirst._loseFirstChildState();
        };

        if (newFirst.isCreated()) {
          newFirst._obtainFirstChildState();
        };
      };

      var newLast = ch[newLength-1];
      if (this._lastChildCache && this._lastChildCache != newLast)
      {
        var oldLast = this._lastChildCache;
        this._lastChildCache = newLast;

        if (oldLast.isCreated()) {
          oldLast._loseLastChildState();
        };

        if (newLast.isCreated()) {
          newLast._obtainLastChildState();
        };
      };
    };
  }
  else
  {
    otherWidget.setParent(this);
    this.syncChildrenOrder();
  };
};

/*!
  Sync children nodes with the internal array order.
*/
proto.syncChildrenOrder = function()
{
  if (!this.isCreated()) {
    return;
  };

  var ch = this.getChildren().copy();
  var chl = ch.length;
  var chc;
  var che;

  // optimize idea: only move the things that need to be moved
  // but this way it's not sooo slow, so I am invested time to
  // other parts first
  for (var i=0; i<chl; i++)
  {
    chc = ch[i];
    che = chc.getElement();

    if (chc.isCreated() && che.parentNode) {
      this._getParentNodeForChild(chc).appendChild(che);
    };
  };
};

/*!
  Remove one or multiple childrens.
*/
proto.remove = function()
{
  var l = arguments.length;
  var o;

  for (var i=0; i<l; i++)
  {
    o = arguments[i];

    if (!(o instanceof QxWidget))
    {
      throw new Error("Invalid Widget: " + o);
    }
    else
    {
      o.setParent(null);
    };
  };
};

/*!
  Remove all childrens.
*/
proto.removeAll = function()
{
  var cs = this.getChildren();
  var co;
  var l = cs.length;

  for (var i = 0; i < l; i++)
  {
    co = cs[i];

    this.remove(co);
    co.dispose();
  };
};

/*!
Check if the given QxWidget is a children.

#param des[QxWidget]: The widget which should be checked.
*/
proto.contains = function(des)
{
  if(des == null) {
    return false;
  };

  if(des == this) {
    return true;
  };

  return this.contains(des.getParent());
};

/*!
  Returns the previous sibling.
*/
proto.getPreviousSibling = function()
{
  var p = this.getParent();

  if(p == null) {
    return null;
  };

  var cs = p.getChildren();
  return cs[cs.indexOf(this) - 1];
};

/*!
  Returns the next sibling.
*/
proto.getNextSibling = function()
{
  var p = this.getParent();

  if(p == null) {
    return null;
  };

  var cs = p.getChildren();
  return cs[cs.indexOf(this) + 1];
};

QxWidget.getActiveSiblingHelperIgnore = function(vIgnoreClasses, vInstance)
{
  for (var j=0; j<vIgnoreClasses.length; j++) {
    if (vInstance instanceof vIgnoreClasses[j]) {
      return true;
    };
  };
  
  return false;
};

QxWidget.getActiveSiblingHelper = function(vObject, vParent, vCalc, vIgnoreClasses, vMode)
{
  if (!vIgnoreClasses) {
    vIgnoreClasses = [];
  };

  var vChilds = vParent.getChildren();
  var vPosition;
  
  if (isInvalid(vMode))
  {
    vPosition = vChilds.indexOf(vObject) + vCalc;
  }
  else
  {
    vPosition = vMode == "first" ? 0 : vChilds.length-1;  
  };
  
  var vInstance = vChilds[vPosition];
  
  while(!vInstance.isEnabled() || QxWidget.getActiveSiblingHelperIgnore(vIgnoreClasses, vInstance))
  {
    vPosition += vCalc;
    vInstance = vChilds[vPosition];
    
    if (!vInstance) {
      return null;
    };
  };
  
  return vInstance;
};

proto.getPreviousActiveSibling = function(vIgnoreClasses) 
{
  var vPrev = QxWidget.getActiveSiblingHelper(this, this.getParent(), -1, vIgnoreClasses, null);
  return vPrev ? vPrev : this.getParent().getLastActiveChild();
};

proto.getNextActiveSibling = function(vIgnoreClasses) 
{
  var vMext = QxWidget.getActiveSiblingHelper(this, this.getParent(), 1, vIgnoreClasses, null);
  return vMext ? vMext : this.getParent().getFirstActiveChild();
};

/*!
  Check if the widget is the first child.
*/
proto.isFirstChild = function()
{
  var pa = this.getParent();

  if (!pa) {
    return false;
  };

  return pa.getFirstChild() == this;
};

/*!
  Check if the widget is the last child.
*/
proto.isLastChild = function()
{
  var pa = this.getParent();

  if (!pa) {
    return false;
  };

  return pa.getLastChild() == this;
};

proto.getFirstActiveChild = function(vIgnoreClasses) {
  return QxWidget.getActiveSiblingHelper(null, this, 1, vIgnoreClasses, "first");
};

proto.getLastActiveChild = function(vIgnoreClasses) {
  return QxWidget.getActiveSiblingHelper(null, this, -1, vIgnoreClasses, "last");
};


proto._firstChildCache = null;
proto._lastChildCache = null;

/*!
  Returns the first child.
*/
proto.getFirstChild = function()
{
  if (this._firstChildCache == null)
  {
    var ch = this.getChildren();

    if (ch.length > 0)
    {
      this._firstChildCache = ch[0];
      ch[0]._getFirstChildState();
    };
  };

  return this._firstChildCache;
};

/*!
  Returns the last child.
*/
proto.getLastChild = function()
{
  if (this._lastChildCache == null)
  {
    var ch = this.getChildren();

    if (ch.length > 0)
    {
      this._lastChildCache = ch[ch.length-1];
      ch[ch.length-1]._getLastChildState();
    };
  };

  return this._lastChildCache;
};

/*!
  Add a new widget to the children.
*/
proto._pushChild = function(o)
{
  var ch = this.getChildren();
  var chi = ch.indexOf(o);

  if (chi == -1)
  {
    ch.push(o);

    // is first element ever
    if (ch.length == 1)
    {
      this._firstChildCache = o;
      this._lastChildCache = o;

      // only send first child if is created
      // or make this sense otherwise?
      if (this.isCreated()) {
        this._obtainFirstChild();
      };
    }
    else
    {
      if (this._lastChildCache)
      {
        var oc = this._lastChildCache;

        this._lastChildCache = o;

        oc._loseLastChildState();
      };
    };
  }
  else
  {
    // this.debug("Has currently position in: " + o + "!");

    // is first element ever
    if (ch.length == 1)
    {
      this._firstChildCache = o;
      this._lastChildCache = o;

      // only send first child if is created
      // or make this sense otherwise?
      if (this.isCreated()) {
        this._obtainFirstChild();
      };
    }
    else
    {
      if (this._lastChildCache && chi == (ch.length-1))
      {
        var oc = this._lastChildCache;
        this._lastChildCache = o;

        if (oc.isCreated()) {
          oc._loseLastChildState();
        };
      };
    };
  };
};


/*!
  Remove a widget from the children.
*/
proto._removeChild = function(o)
{
  var ch = this.getChildren();

  ch.remove(o);

  if (ch.length == 0)
  {
    this._loseAllChilds();
  };

  if (this._firstChildCache == o)
  {
    if (ch.length > 0)
    {
      this._firstChildCache = ch[0];
      ch[0]._obtainFirstChildState();
    }
    else
    {
      this._firstChildCache = null;
    };

    o._loseFirstChildState();
  };

  if (this._lastChildCache == o)
  {
    if (ch.length > 0)
    {
      this._lastChildCache = ch[ch.length-1];
      ch[ch.length-1]._obtainLastChildState();
    }
    else
    {
      this._lastChildCache = null;
    };

    o._loseLastChildState();
  };
};


/*!
  Always fired when the widget obtain the status first child.
*/
proto._obtainFirstChildState = function() {
  // this.debug("Obtain FirstChildState");
};

/*!
  Always fired when the widget obtain the status last child.
*/
proto._obtainLastChildState = function() {
  // this.debug("Obtain LastChildState");
};

/*!
  Always fired when the widget lose the status first child.
*/
proto._loseFirstChildState = function() {
  // this.debug("Lose FirstChildState");
};

/*!
  Always fired when the widget lose the status last child.
*/
proto._loseLastChildState = function() {
  // this.debug("Lose LastChildState");
};

/*!
  Always fired when the widget gets it's first child.
*/
proto._obtainFirstChild = function() {
  // this.debug("Obtain FirstChild");
};

/*!
  Always fired when the widget lose the last child.
*/
proto._loseAllChilds = function() {
  // this.debug("Lose AllChilds");
};








/*
  -------------------------------------------------------------------------------
    ENABLED MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propName, uniqModIds)
{
  QxTarget.prototype._modifyEnabled.call(this, propValue, propOldValue, propName, uniqModIds);

  var vClasses = this.getCssClassName();

  var vDisClassA = "QxDisabled";
  var vDisClassB = this.classname + "Disabled";

  if(propValue)
  {
    this.removeHtmlProperty("disabled");
    this.setCssClassName(vClasses.remove(vDisClassA, " ").remove(vDisClassB, " "));
  }
  else
  {
    this.setHtmlProperty("disabled", true);
    this.setCssClassName(vClasses.add(vDisClassA, " ").add(vDisClassB, " "));
  };

  return true;
};





/*
------------------------------------------------------------------------------------
  STATE MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyState = function(propValue, propOldValue, propName, uniqModIds)
{
  var vClasses = this.getCssClassName();

  if (isValidString(propOldValue)) {
    vClasses = vClasses.remove(this.classname + "-" + propOldValue.toFirstUp(), " ");
  };

  if (isValidString(propValue)) {
    vClasses = vClasses.add(this.classname + "-" + propValue.toFirstUp(), " ");
  };

  this.setCssClassName(vClasses, uniqModIds);

  this._recalculateFrame();

  return true;
};





/*
------------------------------------------------------------------------------------
  APPEARANCE MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyAppearance = function(propValue, propOldValue, propName, uniqModIds)
{
  //var tm = window.application.getThemeManager();
  
  //tm.setAppearance(this, propValue);
  //tm.addAppearance(this);
  
  return true;
};



/*
------------------------------------------------------------------------------------
  HTML PROPERTIES
------------------------------------------------------------------------------------
*/

proto.setHtmlProperty = function(n, v)
{
  this._htmlProperties[n] = v;

  var el = this.getElement();

  if (el) {
    el[n] = v;
  };

  return true;
};

proto.removeHtmlProperty = function(n)
{
  delete this._htmlProperties[n];

  var el = this.getElement();

  if (el)
  {
    el.removeAttribute(n);

    // MSHTML doesn't allow to 'delete' html properties
    if ((new QxClient).isNotMshtml())
    {
      try {
        delete el[n];
      }
      catch(ex) {};
    };
  };

  return true;
};

proto.getHtmlProperty = function(n)
{
  var el = this.getElement();
  return el ? el[n] : this._htmlProperties[n];
};

proto._applyHtmlProperties = function(el)
{
  for (var i in this._htmlProperties) {
    el[i] = this._htmlProperties[i];
  };
};






/*
------------------------------------------------------------------------------------
  HTML ATTRIBUTES
------------------------------------------------------------------------------------
*/

proto.setHtmlAttribute = function(n, v)
{
  this._htmlAttributes[n] = v;

  var el = this.getElement();

  if (el) {
    el.setAttribute(n, v);
  };

  return true;
};

proto.removeHtmlAttribute = function(n)
{
  delete this._htmlAttributes[n];

  var el = this.getElement();

  if (el) {
    el.removeAttribute(n);
  };

  return true;
};

proto.getHtmlAttribute = function(n)
{
  var el = this.getElement();
  return el ? el.getAttribute(n) : this._attributes[n];
};

proto._applyHtmlAttributes = function(el)
{
  for (var i in this._htmlAttributes) {
    el.setAttribute(i, this._htmlAttributes[i]);
  };
};






/*
------------------------------------------------------------------------------------
  STYLE PROPERTIES
------------------------------------------------------------------------------------
*/

proto._evalCurrentStyleProperty = function(propName) {
  return this.isCreated() ? QxDOM.getComputedStyleProperty(this.getElement(), propName) : null;
};

proto.getStyleProperty = function(propName)
{
  var propValue = this._styleProperties[propName] || this._evalCurrentStyleProperty(propName);
  return isValid(propValue) ? propValue : null;
};

proto.setStyleProperty = function(propName, propValue, uniqModIds) {
  return this._modifyStyleProperty(propValue, null, propName, uniqModIds);
};

proto.removeStyleProperty = function(propName)
{
  delete this._styleProperties[propName];

  var el = this.getElement();

  if (el) {
    el.style[propName] = "";
  };

  return true;
};

proto._modifyStyleProperty = function(propValue, propOldValue, propName, uniqModIds)
{
  this._styleProperties[propName] = propValue;

  try {
    this.getElement().style[propName] = isValid(propValue) ? propValue : "";
  } catch(ex) {};

  return true;
};

proto._modifyFloatStyleProperty = function(propValue, propOldValue, propName, uniqModIds) {
  return this._modifyStyleProperty(propValue, propOldValue, "cssFloat", uniqModIds);
};

proto._applyStyleProperties = function(el)
{
  for (var i in this._styleProperties) {
    el.style[i] = this._styleProperties[i];
  };
};










/*
------------------------------------------------------------------------------------
  RENDERER: ANY DIMENSION VALUE GETTER
------------------------------------------------------------------------------------
*/

proto.getAnyWidth = function() 
{
  var w = this.getWidth();
  var wu = w == "auto" ? null : w;
  
  return wu || this.getPreferredWidth() || this.getComputedBoxWidth() || 0;
};

proto.getAnyHeight = function() 
{
  var h = this.getHeight();
  var hu = h == "auto" ? null : h;

  return hu || this.getPreferredHeight() || this.getComputedBoxHeight() || 0;
};






/*
------------------------------------------------------------------------------------
  RENDERER: OVERWRITE RANGE SETTERS
------------------------------------------------------------------------------------
*/

proto._widthAuto = false;
proto._widthMode = null;
proto._widthModeValue = null;

proto.setWidth = function(propValue, uniqModIds, vMode, vKeepAuto)
{
  // store old value first
  var propOldValue = this.getWidth();

  // detect and cache new mode values
  this._widthMode = isValid(vMode) ? vMode : "box";
  this._widthModeValue = propValue;

  if (propValue == "auto")
  {
    this._widthAuto = true;

    if (this._wasVisible) {
      return this._setChildrenDependWidth();
    };
  }

  else if(isInvalid(vKeepAuto))
  {
    this._widthAuto = false;
  }

  else if (vKeepAuto == true)
  {
    if (!this._widthAuto)
    {
      throw new Error("Width was not auto previously!: " + propValue);
    };
  };

  // this.debug("New Width: " + propValue + ", auto=" + this._widthAuto + ", mode=" + this._widthMode);

  // Apply new values, so that the getters submit the new value.
  this._valueWidth = propValue;
  this._nullWidth = propValue == null;

  // Call modifier
  try{
    var r = this._modifyHorizontalDimension(propValue, propOldValue, "width", uniqModIds);
    if (!r) {
      throw new Error("Failed without exception: width [horizontalDimension|" + r + "]");
    };
  }
  catch(ex)
  {
    this.debug("Failed to modify property width: " + ex);
    return false;
  };

  // Restore auto value
  if (vKeepAuto)
  {
    this._valueWidth = "auto";
    this._nullWidth = false;
  };

  return propValue;
};




proto._heightAuto = false;
proto._heightMode = null;
proto._heightModeValue = null;

proto.setHeight = function(propValue, uniqModIds, vMode, vKeepAuto)
{
  // store old value first
  var propOldValue = this.getHeight();

  // detect and cache new mode values
  this._heightMode = isValid(vMode) ? vMode : "box";
  this._heightModeValue = propValue;

  if (propValue == "auto")
  {
    this._heightAuto = true;

    if (this._wasVisible) {
      return this._setChildrenDependHeight();
    };
  }

  else if(isInvalid(vKeepAuto))
  {
    this._heightAuto = false;
  }

  else if (vKeepAuto == true)
  {
    if (!this._heightAuto)
    {
      throw new Error("Height was not auto previously: " + propValue);
    };
  };

  // this.debug("New Height: " + propValue + ", auto=" + this._heightAuto + ", mode=" + this._heightMode);

  // Apply new values, so that the getters submit the new value.
  this._valueHeight = propValue;
  this._nullHeight = propValue == null;

  // Call modifier
  try{
    var r = this._modifyVerticalDimension(propValue, propOldValue, "height", uniqModIds);
    if (!r) {
      throw new Error("Failed without exception: height [verticalDimension|" + r + "]");
    };
  }
  catch(ex)
  {
    this.debug("Failed to modify property height: " + ex);
    return false;
  };

  // Restore auto value
  if (vKeepAuto)
  {
    this._valueHeight = "auto";
    this._nullHeight = false;
  };

  return propValue;
};






/*
------------------------------------------------------------------------------------
  RENDERER: USER ALIASES
------------------------------------------------------------------------------------
*/

proto.setBoxWidth = function(propValue, uniqModIds, vKeepAuto) {
  return this.setWidth(propValue, uniqModIds, "box", vKeepAuto);
};

proto.setAreaWidth = function(propValue, uniqModIds, vKeepAuto) {
  return this.setWidth(propValue, uniqModIds, "area", vKeepAuto);
};

proto.setInnerWidth = function(propValue, uniqModIds, vKeepAuto) {
  return this.setWidth(propValue, uniqModIds, "inner", vKeepAuto);
};

proto.setBoxHeight = function(propValue, uniqModIds, vKeepAuto) {
  return this.setHeight(propValue, uniqModIds, "box", vKeepAuto);
};

proto.setAreaHeight = function(propValue, uniqModIds, vKeepAuto) {
  return this.setHeight(propValue, uniqModIds, "area", vKeepAuto);
};

proto.setInnerHeight = function(propValue, uniqModIds, vKeepAuto) {
  return this.setHeight(propValue, uniqModIds, "inner", vKeepAuto);
};







/*
------------------------------------------------------------------------------------
  RENDERER: OVERWRITE RANGE LIMIT SETTERS
------------------------------------------------------------------------------------
*/

proto._minWidthMode = null;
proto._maxWidthMode = null;
proto._minHeightMode = null;
proto._maxHeightMode = null;

proto._minWidthModeValue = null;
proto._maxWidthModeValue = null;
proto._minHeightModeValue = null;
proto._maxHeightModeValue = null;

proto.setMinWidth = function(propValue, uniqModIds, vMode)
{
  // store old value first
  var propOldValue = this.getMinWidth();

  // detect and cache new mode values
  this._minWidthMode = isValid(vMode) ? vMode : "box";
  this._minWidthModeValue = propValue;

  // this.debug("New MinWidth: " + propValue + ", mode=" + this._minWidthMode);

  // Apply new values, so that the getters submit the new value.
  this._valueMinWidth = propValue;
  this._nullMinWidth = propValue == null;

  // Call modifier
  try{
    var r = this._modifyHorizontalLimitDimension(propValue, propOldValue, "minWidth", uniqModIds);
    if (!r) {
      throw new Error("Failed without exception: minWidth [horizontalLimitDimension|" + r + "]");
    };
  }
  catch(ex)
  {
    // this.debug("Failed to modify property minWidth: " + ex);
    return false;
  };

  return propValue;
};

proto.setMaxWidth = function(propValue, uniqModIds, vMode)
{
  // store old value first
  var propOldValue = this.getMinWidth();

  // detect and cache new mode values
  this._maxWidthMode = isValid(vMode) ? vMode : "box";
  this._maxWidthModeValue = propValue;

  // this.debug("New MaxWidth: " + propValue + ", mode=" + this._maxWidthMode);

  // Apply new values, so that the getters submit the new value.
  this._valueMaxWidth = propValue;
  this._nullMaxWidth = propValue == null;

  // Call modifier
  try{
    var r = this._modifyHorizontalLimitDimension(propValue, propOldValue, "maxWidth", uniqModIds);
    if (!r) {
      throw new Error("Failed without exception: maxWidth [horizontalLimitDimension|" + r + "]");
    };
  }
  catch(ex)
  {
    // this.debug("Failed to modify property maxWidth: " + ex);
    return false;
  };

  return propValue;
};

proto.setMinHeight = function(propValue, uniqModIds, vMode)
{
  // store old value first
  var propOldValue = this.getMinHeight();

  // detect and cache new mode values
  this._minHeightMode = isValid(vMode) ? vMode : "box";
  this._minHeightModeValue = propValue;

  // this.debug("New MinHeight: " + propValue + ", mode=" + this._minHeightMode);

  // Apply new values, so that the getters submit the new value.
  this._valueMinHeight = propValue;
  this._nullMinHeight = propValue == null;

  // Call modifier
  try{
    var r = this._modifyVerticalLimitDimension(propValue, propOldValue, "minHeight", uniqModIds);
    if (!r) {
      throw new Error("Failed without exception: minHeight [verticalLimitDimension|" + r + "]");
    };
  }
  catch(ex)
  {
    // this.debug("Failed to modify property minHeight: " + ex);
    return false;
  };

  return propValue;
};

proto.setMaxHeight = function(propValue, uniqModIds, vMode)
{
  // store old value first
  var propOldValue = this.getMaxHeight();

  // detect and cache new mode values
  this._maxHeightMode = isValid(vMode) ? vMode : "box";
  this._maxHeightModeValue = propValue;

  // this.debug("New MaxHeight: " + propValue + ", mode=" + this._maxHeightMode);

  // Apply new values, so that the getters submit the new value.
  this._valueMaxHeight = propValue;
  this._nullMaxHeight = propValue == null;

  // Call modifier
  try{
    var r = this._modifyVerticalLimitDimension(propValue, propOldValue, "maxHeight", uniqModIds);
    if (!r) {
      throw new Error("Failed without exception: maxHeight [verticalLimitDimension|" + r + "]");
    };
  }
  catch(ex)
  {
    // this.debug("Failed to modify property maxHeight: " + ex);
    return false;
  };

  return propValue;
};







/*
------------------------------------------------------------------------------------
  RENDERER: DIMENSION MANAGER
------------------------------------------------------------------------------------
*/

/*!
  This manage the horizontal dimensions.

  Its main task is to omit that the user configure all the 3 properties together.
  So it is not allowed to use all of these together: left, width and right.
*/
proto._manageHorizontalDimensions = function(propName, propValue)
{
  if (propValue == null)
  {
    this._usedDimensionsHorizontal.remove(propName);
  }
  else if (this._usedDimensionsHorizontal.contains(propName))
  {
    return;
  }
  else if (this._usedDimensionsHorizontal.length == 2)
  {
    throw new Error("List max reached. Unable to add: " + propName + "(" + propValue + ")!, List: " + this._usedDimensionsHorizontal);
  }
  else
  {
    this._usedDimensionsHorizontal.push(propName);
  };
};

/*!
  This manage the vertical dimensions.

  Its main task is to omit that the user configure all the 3 properties together.
  So it is not allowed to use all of these together: top, height and bottom.
*/
proto._manageVerticalDimensions = function(propName, propValue)
{
  if (propValue == null)
  {
    this._usedDimensionsVertical.remove(propName);
  }
  else if (this._usedDimensionsVertical.contains(propName))
  {
    return;
  }
  else if (this._usedDimensionsVertical.length == 2)
  {
    throw new Error("List max reached. Unable to add: " + propName + "(" + propValue + ")!, List: " + this._usedDimensionsVertical);
  }
  else
  {
    this._usedDimensionsVertical.push(propName);
  };
};











/*
------------------------------------------------------------------------------------
  RENDERER: MAIN
------------------------------------------------------------------------------------
*/

proto._render = function(vHint)
{
  this._renderHorizontal(vHint);
  this._renderVertical(vHint);
};

proto._renderHorizontalRunning = false;
proto._renderVerticalRunning = false;

proto._renderHorizontalOmit = false;
proto._renderVerticalOmit = false;

proto._renderHorizontal = function(vHint) {
  return this._renderHelper("horizontal", "Horizontal", vHint, "left", "width", "right", "Left", "Width", "Right", "minWidth", "maxWidth", "MinWidth", "MaxWidth");
};

proto._renderVertical = function(vHint) {
  return this._renderHelper("vertical", "Vertical", vHint, "top", "height", "bottom", "Top", "Height", "Bottom", "minHeight", "maxHeight", "MinHeight", "MaxHeight");
};

proto._omitHorizontalRendering = function() {
  this._renderHorizontalOmit = true;
};

proto._activateHorizontalRendering = function() {
  this._renderHorizontalOmit = false;
  this._renderHorizontal("activate");
};

proto._omitVerticalRendering = function() {
  this._renderVerticalOmit = true;
};

proto._activateVerticalRendering = function() {
  this._renderVerticalOmit = false;
  this._renderVertical("activate");
};

proto._omitRendering = function()
{
  this._omitHorizontalRendering();
  this._omitVerticalRendering();
};

proto._activateRendering = function()
{
  this._activateHorizontalRendering();
  this._activateVerticalRendering();
};

proto._renderInitialDone_horizontal = false;
proto._renderInitialDone_vertical = false;

proto._renderHelper = function(vId, vIdUp, vHint, vNameStart, vNameRange, vNameStop, vNameStartUp, vNameRangeUp, vNameStopUp, vNameRangeMin, vNameRangeMax, vNameRangeMinUp, vNameRangeMaxUp)
{
  var vParent = this.getParent();

  if (vParent == null || !this.isCreated())
  {
    // this.subug("no element or parent!");
    return true;
  };

  if (!this["_renderInitialDone_" + vId])
  {
    // this.subug("force hint to initial!!!!");
    vHint = "initial";
  }
  else if (this["_renderInitialDone_" + vId] && vHint == "initial")
  {
    return true;
  };

  //this.debug("render: " + vId);

  // if parent is not ready and my own dimension is not auto and the parent dimension is not null
  // we will wait for the parent to render
  if (!vParent["_renderInitialDone_" + vId] && this["get" + vNameRangeUp]() != "auto")
  {
    if (vParent["get" + vNameRangeUp]() != null || (vParent["get" + vNameStartUp]() != null && vParent["get" + vNameStopUp]() != null))
    {
      //this.subug("parent not done: " + vId);
      return true;
    };
  };

  // this.debug("Render-" + vId + ": " + vHint);

  this["_renderInitialDone_" + vId] = true;

  // Omit rendering on non visible widgets
  if (vHint != "initial" && this._wasVisible && !this.getVisible())
  {
    // this.debug("Omit rendering");
    this["_render" + vIdUp + "Omitted"] = true;
    return true;
  };

  try
  {
    switch(vHint)
    {
      case "initial":
      case "force":
      case "parent":
      case "activate":
        this._computeDimensionPixelValue(vNameStart, vNameStartUp, vNameRangeUp, vNameStopUp);
        this._computeDimensionPixelValue(vNameStop, vNameStartUp, vNameRangeUp, vNameStopUp);

      case "padding":
      case "border":
        this._computeDimensionPixelValue(vNameRange, vNameStartUp, vNameRangeUp, vNameStopUp);
        this._computeDimensionPixelValue(vNameRangeMin, vNameStartUp, vNameRangeUp, vNameStopUp);
        this._computeDimensionPixelValue(vNameRangeMax, vNameStartUp, vNameRangeUp, vNameStopUp);
        break;

      case vNameRangeMin:
      case vNameRangeMax:
        // Inform and recalculate parent information
        if (vParent["get" + vNameRangeUp]() == "auto") {
          return vParent["_setChildrenDepend" + vNameRangeUp](this);
        };

      case vNameStart:
      case vNameRange:
      case vNameStop:
        this._computeDimensionPixelValue(vHint, vNameStartUp, vNameRangeUp, vNameStopUp);
        break;
    };

    var vValueStart = this["_pixelof_" + vNameStart];
    var vValueRange = this["_pixelof_" + vNameRange];
    var vValueStop = this["_pixelof_" + vNameStop];

    var vValueRangeMin = this["_pixelof_" + vNameRangeMin] || -Infinity;
    var vValueRangeMax = this["_pixelof_" + vNameRangeMax] || Infinity;

    var vUseStart = vValueStart != null;
    var vUseRange = vValueRange != null;
    var vUseStop = vValueStop != null;

    // Omit initial null rendering
    if ((vHint == "initial" || vHint == "parent") && !vUseStart && !vUseRange && !vUseStop && vValueRangeMin == -Infinity && vValueRangeMax == Infinity) {
      // this.debug("OMIT RENDERING");
      return true;
    };


    // this.subug("data: start=" + vValueStart + ", range=" + vValueRange + ", stop=" + vValueStop + ", hint=" + vHint);
    // this.subug("info: " + this["_pixelof_" + vNameRange] + ", " + this["_valueof_" + vNameRange]);
    // this.subug("limit: min=" + vValueRangeMin + ", max=" + vValueRangeMax);


    var vComputedPosition;
    var vComputedSize;


    function limitSize(vValue) {
      return isValidNumber(vValue) ? vValue.limit(vValueRangeMin, vValueRangeMax) : 0;
    };


    if (vUseRange)
    {
      vComputedSize = limitSize(vValueRange);
    };

    if (vUseStart)
    {
      vComputedPosition = vValueStart;

      if (!vUseRange)
      {
        if (vUseStop)
        {
          vComputedSize = limitSize(vParent["getInner" + vNameRangeUp]() - this["getComputedMargin" + vNameStartUp]() - this["getComputedMargin" + vNameStopUp]() - vComputedPosition - vValueStop);
        }
        else if (vValueRangeMin > 0)
        {
          vComputedSize = vValueRangeMin;
        };
      };
    }

    else if (vUseStop)
    {
      if (!vUseRange)
      {
        if (!this.getElement().parentNode) {
          return;
        };

        vComputedSize = limitSize(this["getPreferred" + vNameRangeUp]());
      };

      vComputedPosition = vParent["getInner" + vNameRangeUp]() - this["getComputedMargin" + vNameStartUp]() - this["getComputedMargin" + vNameStopUp]() - vComputedSize - vValueStop;
    };







    if (typeof vComputedSize == "undefined") {
      vComputedSize = null;
    };

    if (typeof vComputedPosition == "undefined")
    {
      vComputedPosition = null;
    }
    // add padding of parent widget
    else if (isValidNumber(vComputedPosition) && this._evalCurrentStyleProperty("position") == "absolute")
    {
      vComputedPosition += vParent["getComputedPadding" + vNameStartUp]();
    };


    // this.subug("computed: position=" + vComputedPosition + ", size=" + vComputedSize + " ... " + vHint);

    var vPositionChanged = vComputedPosition != this["_computedLast" + vNameStartUp];
    var vSizeChanged = vComputedSize != this["_computedLast" + vNameRangeUp];

    // this.subug("do apply: " + vPositionChanged + ", " + vSizeChanged);

    if (vPositionChanged || vSizeChanged)
    {
      if (vSizeChanged)
      {
        try
        {
          // Apply new value to node
          this["_applySize" + vIdUp](vComputedSize);
        }
        catch(ex)
        {
          this.debug("Failed to apply size: " + vComputedSize);
        };

        // Store new value
        this["_computedLast" + vNameRangeUp] = vComputedSize;

        // Emit Signals
        if (this.hasEventListeners("resize")) {
          this.dispatchEvent(new QxEvent("resize"));
        };

        if (this.hasEventListeners("resize" + vIdUp)) {
          this.dispatchEvent(new QxEvent("resize" + vIdUp));
        };

        // Inform children
        this["_inner" + vNameRangeUp + "Changed"]();
      };

      if (vPositionChanged)
      {
        try
        {
          // Apply new value to node
          this["_applyPosition" + vIdUp](vComputedPosition);
        }
        catch(ex)
        {
          this.debug("Failed to apply position: " + vComputedPosition);
        };

        // Store new value
        this["_computedLast" + vNameStartUp] = vComputedPosition;

        // Emit Signals
        if (this.hasEventListeners("move")) {
          this.dispatchEvent(new QxEvent("move"));
        };

        if (this.hasEventListeners("move" + vIdUp)) {
          this.dispatchEvent(new QxEvent("move" + vIdUp));
        };
      };

      if (vHint != "initial") {
        this["_outer" + vNameRangeUp + "Changed"](vPositionChanged && vSizeChanged ? "position-and-size" : vPositionChanged ? "position" : vSizeChanged ? "size" : "");
      };
    };
  }
  catch(ex)
  {
    throw new Error("Could not render " + this + " : " + vId + ": " + ex);
  };
};




/*
------------------------------------------------------------------------------------
  RENDERER: APPLIER
------------------------------------------------------------------------------------
*/

if ((new QxClient).isMshtml())
{
  proto._applyPositionHorizontal = function(vPosition) {
    return isInvalidNumber(vPosition) ? this.removeStyleProperty("pixelLeft") : this.setStyleProperty("pixelLeft", Math.round(vPosition));
  };

  proto._applySizeHorizontal = function(vSize) {
    return isInvalidNumber(vSize) ? this.removeStyleProperty("pixelWidth") : this.setStyleProperty("pixelWidth", Math.round(vSize));
  };

  proto._applyPositionVertical = function(vPosition) {
    return isInvalidNumber(vPosition) ? this.removeStyleProperty("pixelTop") : this.setStyleProperty("pixelTop", Math.round(vPosition));
  };

  proto._applySizeVertical = function(vSize) {
    return isInvalidNumber(vSize) ? this.removeStyleProperty("pixelHeight") : this.setStyleProperty("pixelHeight", Math.round(vSize));
  };
}
else
{
  proto._applyPositionHorizontal = function(vPosition) {
    return isInvalidNumber(vPosition) ? this.removeStyleProperty("left") : this.setStyleProperty("left", Math.round(vPosition) + "px");
  };

  proto._applySizeHorizontal = function(vSize) {
    return isInvalidNumber(vSize) ? this.removeStyleProperty("width") : this.setStyleProperty("width", Math.round(vSize) + "px");
  };

  proto._applyPositionVertical = function(vPosition) {
    return isInvalidNumber(vPosition) ? this.removeStyleProperty("top") : this.setStyleProperty("top", Math.round(vPosition) + "px");
  };

  proto._applySizeVertical = function(vSize) {
    return isInvalidNumber(vSize) ? this.removeStyleProperty("height") : this.setStyleProperty("height", Math.round(vSize) + "px");
  };
};






/*
------------------------------------------------------------------------------------
  RENDERER: FRAME RECALCULATION

  should be called always when the padding or border have been modified
------------------------------------------------------------------------------------
*/

proto._recalculateFrame = function(vHint)
{
  this._recalculateFrameWidth(vHint);
  this._recalculateFrameHeight(vHint);
};

proto._recalculateFrameWidth = function(vHint)
{
  if (!this._wasVisible) {
    return;
  };

  switch(vHint)
  {
    case "padding":
      if (this._widthMode == "inner") {
        return this._renderHorizontal(vHint);
      };

      break;

    case "border":
      if (this._widthMode == "inner" || this._widthMode == "area") {
        return this._renderHorizontal(vHint);
      };
  };

  this._innerWidthChanged();
};

proto._recalculateFrameHeight = function(vHint)
{
  if (!this._wasVisible) {
    return;
  };

  switch(vHint)
  {
    case "padding":
      if (this._heightMode == "inner") {
        return this._renderVertical(vHint);
      };

      break;

    case "border":
      if (this._heightMode == "inner" || this._heightMode == "area") {
        return this._renderVertical(vHint);
      };
  };

  this._innerHeightChanged();
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

  // Update children
  var ch = this._children;
  var chl = ch.length;

  for (var i=0; i<chl; i++) {
    ch[i]._renderHorizontal("parent");
  };
};


proto._innerHeightChanged = function()
{
  // Invalidate internal cache
  this._invalidateInnerHeight();

  // Update children
  var ch = this._children;
  var chl = ch.length;

  for (var i=0; i<chl; i++) {
    ch[i]._renderVertical("parent");
  };
};






/*
------------------------------------------------------------------------------------
  RENDERER: OUTER DIMENSION SIGNAL

  should be called always when the outer dimensions have been modified
------------------------------------------------------------------------------------
*/

proto._outerChanged = function(vHint)
{
  this._outerWidthChanged(vHint);
  this._outerHeightChanged(vHint);
};

proto._outerWidthChanged = function(vHint)
{
  var pa = this.getParent();
  return pa ? pa._childOuterWidthChanged(this, vHint) : true;
};

proto._outerHeightChanged = function(vHint)
{
  var pa = this.getParent();
  return pa ? pa._childOuterHeightChanged(this, vHint) : true;
};

proto._childOuterWidthChanged = function(vModifiedChild, vHint)
{
  if (!this._wasVisible) {
    return;
  };

  var w = this.getWidth();
  
  if (w == "auto")
  {
    return this._setChildrenDependWidth(vModifiedChild, vHint);
  }
  else if (w == null || typeof w == "string")
  {
    this._lastChildWithInvalidatedPreferredWidth = vModifiedChild;
    this._invalidatePreferredWidth();
  };
};

proto._childOuterHeightChanged = function(vModifiedChild, vHint)
{
  if (!this._wasVisible) {
    return;
  };

  var h = this.getHeight();
  
  if (h == "auto")
  {
    return this._setChildrenDependHeight(vModifiedChild, vHint);
  }
  else if (h == null || typeof h == "string")
  {
    this._lastChildWithInvalidatedPreferredHeight = vModifiedChild;
    this._invalidatePreferredHeight();
  };
};







/*
------------------------------------------------------------------------------------
  RENDERER: STATUS VARIABLES
------------------------------------------------------------------------------------
*/

proto._computedlast_position = null;
proto._computedlast_size = null;

proto._typeof_left = null;
proto._typeof_width = null;
proto._typeof_right = null;
proto._typeof_top = null;
proto._typeof_height = null;
proto._typeof_bottom = null;

proto._typeof_minWidth = null;
proto._typeof_maxWidth = null;
proto._typeof_minHeight = null;
proto._typeof_maxHeight = null;

proto._pixelof_left = null;
proto._pixelof_width = null;
proto._pixelof_right = null;
proto._pixelof_top = null;
proto._pixelof_height = null;
proto._pixelof_bottom = null;

proto._pixelof_minWidth = null;
proto._pixelof_maxWidth = null;
proto._pixelof_minHeight = null;
proto._pixelof_maxHeight = null;

proto._valueof_left = null;
proto._valueof_width = null;
proto._valueof_right = null;
proto._valueof_top = null;
proto._valueof_height = null;
proto._valueof_bottom = null;

proto._valueof_minWidth = null;
proto._valueof_maxWidth = null;
proto._valueof_minHeight = null;
proto._valueof_maxHeight = null;




/*
------------------------------------------------------------------------------------
  RENDERER: GETTER FOR SOME STATUS VARIABLES
------------------------------------------------------------------------------------
*/

proto.getPixelOfLeft = function() {
  return this._pixelof_left;
};

proto.getPixelOfWidth = function() {
  return this._pixelof_width;
};

proto.getPixelOfRight = function() {
  return this._pixelof_right;
};

proto.getPixelOfTop = function() {
  return this._pixelof_top;
};

proto.getPixelOfHeight = function() {
  return this._pixelof_height;
};

proto.getPixelOfBottom = function() {
  return this._pixelof_bottom;
};




/*
------------------------------------------------------------------------------------
  RENDERER: PROPERTY CALCULATORS & PREPARATION
------------------------------------------------------------------------------------
*/

proto._computeDimensionPixelValue = function(vId, vNameStartUp, vNameRangeUp, vNameStopUp)
{
  // this.subug("compute pixel value for: " + vId);

  var pixelKey = "_pixelof_" + vId;
  var valueKey = "_valueof_" + vId;

  //if (this instanceof QxToolBarButton)
  //this.debug("TYPE: " + vId + ": " + this["_typeof_" + vId]);

  // calculate on type basis
  switch(this["_typeof_" + vId])
  {
    case "pixel":
      this[pixelKey] = this[valueKey];
      break;

    case "percent":
      this[pixelKey] = this._toPercent(this[valueKey], this.getParent()["getInner" + vNameRangeUp]());
      break;

    default:
      this[pixelKey] = null;
      return;
  };

  // add insets and padding, if the value is for the inner or area
  switch(vId)
  {
    case "width":
    case "height":
    case "minWidth":
    case "maxWidth":
    case "minHeight":
    case "maxHeight":
      switch(this["_" + vId + "Mode"])
      {
        case "inner":
          this[pixelKey] += this["getComputedPadding" + vNameStartUp]() + this["getComputedPadding" + vNameStopUp]();

        case "area":
          // border is faster and more trusty then inset, but does not respect scrollbars (do we need this?)
          // this[pixelKey] += this["getComputedInset" + vNameStartUp]() + this["getComputedInset" + vNameStopUp]();
          
          this[pixelKey] += this["getComputedBorder" + vNameStartUp]() + this["getComputedBorder" + vNameStopUp]();
      };
  };
};

proto._computeDimensionType = function(propValue)
{
  switch(typeof propValue)
  {
    case "number":
      return "pixel";

    case "string":
      if (propValue == "auto")
      {
        return "auto";
      }
      else if (/^([0-9\.]+)%$/.test(propValue))
      {
        return "percent";
      };

      break;

    case "object":
      if (propValue == null) {
        return null;
      };
  };

  throw new Error("Invalid value: " + propValue);
};

proto._toPercent = function(propValue, vFullWidth) {
  return Math.round(vFullWidth * parseFloat(propValue) / 100);
};






/*
------------------------------------------------------------------------------------
  RENDERER: MODIFIER
------------------------------------------------------------------------------------
*/

proto._modifyHorizontalDimension = function(propValue, propOldValue, propName, uniqModIds)
{
  // Check usage list
  this._manageHorizontalDimensions(propName, propValue);

  // Call helper
  return this._modifyHorizontalHelper(propValue, propName);
};

proto._modifyHorizontalLimitDimension = function(propValue, propOldValue, propName, uniqModIds) {
  return this._modifyHorizontalHelper(propValue, propName);
};

proto._modifyHorizontalHelper = function(propValue, propName)
{
  // Type detection
  this["_typeof_" + propName] = this._computeDimensionType(propValue);

  // Value cache
  this["_valueof_" + propName] = propValue;

  // Render
  this._renderHorizontal(propName);

  return true;
};



proto._modifyVerticalDimension = function(propValue, propOldValue, propName, uniqModIds)
{
  // Check usage list
  this._manageVerticalDimensions(propName, propValue);

  // Call helper
  return this._modifyVerticalHelper(propValue, propName);
};

proto._modifyVerticalLimitDimension = function(propValue, propOldValue, propName, uniqModIds) {
  return this._modifyVerticalHelper(propValue, propName);
};

proto._modifyVerticalHelper = function(propValue, propName)
{
  // Type detection
  this["_typeof_" + propName] = this._computeDimensionType(propValue);

  // Value cache
  this["_valueof_" + propName] = propValue;

  // Render
  this._renderVertical(propName);

  return true;
};






/*
------------------------------------------------------------------------------------
  RENDERER: CHILDREN DEPEND DIMENSIONS: MAIN
------------------------------------------------------------------------------------
*/

proto._setChildrenDependWidth = function(vModifiedWidget, vHint)
{
  var newWidth = this._calculateChildrenDependWidth(vModifiedWidget, vHint);
  
  if (newWidth != null)
  {
    this.setWidth(newWidth, null, "inner", true);
  }
  else
  {
    this.setWidth(null, null, "box", true);
  };

  return true;
};

proto._calculateChildrenDependWidth = function(vModifiedWidget, vHint) {
  return this._calculateChildrenDependHelper(vModifiedWidget, vHint, "_dependWidthCache", "left", "width", "right");
};

proto._setChildrenDependHeight = function(vModifiedWidget, vHint)
{
  var newHeight = this._calculateChildrenDependHeight(vModifiedWidget, vHint);
  
  if (newHeight != null)
  {
    this.setHeight(newHeight, null, "inner", true);
  }
  else
  {
    this.setHeight(null, null, "box", true);
  };

  return true;
};

proto._calculateChildrenDependHeight = function(vModifiedWidget, vHint) {
  return this._calculateChildrenDependHelper(vModifiedWidget, vHint, "_dependHeightCache", "top", "height", "bottom");
};









/*
------------------------------------------------------------------------------------
  RENDERER: CHILDREN DEPEND DIMENSIONS: CACHING
------------------------------------------------------------------------------------
*/

proto._compareDependSize = function(d1, d2) {
  return d2.size - d1.size;
};

proto._dependWidthCache = null;
proto._dependHeightCache = null;

proto._calculateChildrenDependHelper = function(vModifiedWidget, vHint, vCache, vStart, vRange, vStop)
{
  if (this[vCache] == null || this[vCache].length == 0)
  {
    var vChildren = this.getChildren();
    var vChildrenLength = vChildren.length;

    if (vChildrenLength == 0) {
      return null;
    };

    var vDependCache = this[vCache] = [];
    var vCurrentChild;
    var vCurrentNeeded;

    for (var i=0; i<vChildrenLength; i++)
    {
      vCurrentChild = vChildren[i];

      //if(vCurrentChild.isCreated())
      if (vCurrentChild._wasVisible)
      {
        vCurrentNeeded = vCurrentChild._computeNeededSize(vStart, vRange, vStop);

        // this.debug("Child: " + vCurrentChild._computeNeededSize(vStart, vRange, vStop));
        vDependCache.push({ widget : vCurrentChild, size : vCurrentNeeded ? vCurrentNeeded : 0 });
      };
    };

    vDependCache.sort(this._compareDependSize);
  }
  else
  {
    if (!vModifiedWidget && this._wasVisible)
    {
      if (vRange == "height" && this._lastChildWithInvalidatedPreferredHeight)
      {
        vModifiedWidget = this._lastChildWithInvalidatedPreferredHeight;
        this._lastChildWithInvalidatedPreferredHeight = null;
      }
      else if (vRange == "width" && this._lastChildWithInvalidatedPreferredWidth)
      {
        vModifiedWidget = this._lastChildWithInvalidatedPreferredWidth;
        this._lastChildWithInvalidatedPreferredWidth = null;
      };
    };

    if (vModifiedWidget && vModifiedWidget != this)
    {
      var vDependCache = this[vCache];
      var vDependCacheLength = vDependCache.length;

      var vChildFound = false;
      var vCurrentNeeded;

      if (vHint != "add")
      {
        for (var i=0; i<vDependCacheLength; i++)
        {
          if (vDependCache[i].widget == vModifiedWidget)
          {
            // Update child in array
            if (vModifiedWidget.getParent() == this)
            {
              vCurrentNeeded = vModifiedWidget._computeNeededSize(vStart, vRange, vStop);
              vDependCache[i].size = vCurrentNeeded ? vCurrentNeeded : 0;
            }

            // Remove child from array
            else
            {
              vDependCache.splice(i, 1);
            };

            vChildFound = true;
            break;
          };
        };
      };

      // Add child to array
      if (vHint == "add" || !vChildFound)
      {
        if(vModifiedWidget.getParent() == this)
        {
          vCurrentNeeded = vModifiedWidget._computeNeededSize(vStart, vRange, vStop);
          vDependCache.push({ widget : vModifiedWidget, size : vCurrentNeeded ? vCurrentNeeded : 0 });
        }
        else
        {
          throw new Error("No change while recalculating the dependCache!");
        };
      };

      vDependCache.sort(this._compareDependSize);
    }

    else
    {
      var vDependCache = this[vCache];
    };
  };

  return vDependCache.length > 0 ? vDependCache[0].size : null;
};








/*
------------------------------------------------------------------------------------
  RENDERER: CHILDREN DEPEND DIMENSIONS: CALCULATORS
------------------------------------------------------------------------------------
*/

proto._computeNeededSize = function(vNameStart, vNameRange, vNameStop)
{
  // this.debug("compute-needed-size: " + vNameRange);

  var vNameStartUp = vNameStart.toFirstUp();
  var vNameRangeUp = vNameRange.toFirstUp();
  var vNameStopUp = vNameStop.toFirstUp();

  var vTypeStart = this["_typeof_" + vNameStart];
  var vTypeRange = this["_typeof_" + vNameRange];
  var vTypeStop = this["_typeof_" + vNameStop];

  var vMinRangeValue = this["getMin" + vNameRangeUp]();
  var vMaxRangeValue = this["getMax" + vNameRangeUp]();

  var vMarginStart = this["getComputedMargin" + vNameStartUp]();
  var vMarginStop = this["getComputedMargin" + vNameStopUp]();




  var neededForMargin = vMarginStart + vMarginStop;

  // this.subug("min/max: " + vMinRangeValue + " < rangeValue < " + vMaxRangeValue);
  // this.subug("margin: " + neededForMargin);


  if (vTypeRange == "percent")
  {
    /*
      Example:

      Preferred Size = Defined Percents
      66px = 30%
      100% = 66px / 30 * 100 = 220px
    */

    // this.subug("mode: percent range value [1]");

    var sizePreferred = this["getPreferred" + vNameRangeUp]();
    var sizeLimit = sizePreferred.limit(vMinRangeValue, vMaxRangeValue);
    var sizeProcent = parseFloat(this["get" + vNameRangeUp]());
    var neededInner = Math.ceil(sizeLimit / sizeProcent * 100);

    // this.subug("result: preferred=" + sizePreferred + ", limited=" + sizeLimit + ", full=" + neededInner);

    return neededInner + neededForMargin;
  }


  else if (vTypeStart == "percent" && vTypeStop == "percent")
  {
    /*
      Example:

      20% + Preferred Size + 30%
      20% + 66px + 30%
      66px = (100% - 20% - 30%) = 50%
      100% = 132px
    */

    // this.subug("mode: percent start and stop [2]");

    var sizePreferred = this["getPreferred" + vNameRangeUp]();
    var sizeLimit = sizePreferred.limit(vMinRangeValue, vMaxRangeValue);
    var percentRemain = 100 - parseFloat(this["get" + vNameStartUp]()) - parseFloat(this["get" + vNameStopUp]());
    var neededInner = Math.ceil(sizeLimit / percentRemain * 100);

    // this.subug("result: preferred=" + sizePreferred + ", limited=" + sizeLimit + ", full=" + neededInner);

    return neededInner + neededForMargin;
  }


  else
  {
    var neededForSize = null;

    // this.subug("mode: default [3]");

    if (vTypeRange == "pixel")
    {
      // this.debug("USE: pixel: " + this._widthMode);
      this._computeDimensionPixelValue(vNameRange, vNameStartUp, vNameRangeUp, vNameStopUp);
      neededForSize = this["_pixelof_" + vNameRange];
    };

    if (neededForSize == null)
    {
      // this.debug("USE: preferred: " + vNameRangeUp);
      var neededForSize = this["getPreferred" + vNameRangeUp]();
      // this.subug("range mode: preferred, size=" + neededForSize);
    };

    // this.debug("NEEDED-FOR-SIZE: " + neededForSize);

    if (neededForSize == null) {
      // this.subug("range mode: null: no valid value found!");
      return;
    };

    // Apply limit
    neededForSize = neededForSize.limit(vMinRangeValue, vMaxRangeValue);
    // this.subug("range limit: " + neededForSize);

    if (vTypeStart == "percent")
    {
      /*
        Example:

        100% = 20% + neededForSize + stopNeededSize
        100% = 20% + otherNeededSize

        neededArea = otherNeededSize / (100 - startPercent) * 100
      */

      var stopNeededSize = vTypeStop == "pixel" ? this["get" + vNameStopUp]() : 0;
      var otherNeededSize = neededForSize + stopNeededSize;
      var percentRemain = 100 - parseFloat(this["get" + vNameStartUp]());
      var neededInner = Math.ceil(otherNeededSize / percentRemain * 100);

      // this.subug("start mode: percent [1], remain: " + percentRemain + "=" + otherNeededSize + " results in full=" + neededInner);

      return neededInner + neededForMargin;
    }
    else if (vTypeStop == "percent")
    {
      /*
        Example:

        100% = 20% + neededForSize + startNeededSize
        100% = 20% + otherNeededSize

        neededArea = otherNeededSize / (100 - stopPercent) * 100
      */

      var startNeededSize = vTypeStart == "pixel" ? this["get" + vNameStartUp]() : 0;
      var otherNeededSize = neededForSize + startNeededSize;
      var percentRemain = 100 - parseFloat(this["get" + vNameStopUp]());
      var neededInner = Math.ceil(otherNeededSize / percentRemain * 100);

      // this.subug("stop mode: percent [2], remain: " + percentRemain + "=" + otherNeededSize + " results in full=" + neededInner);
      return neededInner + neededForMargin;
    }
    else
    {
      //this.subug("start static, stop static: default [3]");

      var neededForPosition = 0;

      if (vTypeStart == "pixel") {
        neededForPosition += this["get" + vNameStartUp]();
      };

      if (vTypeStop == "pixel") {
        neededForPosition += this["get" + vNameStopUp]();
      };

      var neededInner = neededForSize + neededForPosition;

      // this.subug("needed inner: " + neededInner);

      // this.debug("DEFAULT-HANDLING: " + neededForPosition + "+" + neededForSize + "=" + neededArea);
      return neededInner + neededForMargin;
    };
  };
};






/*
------------------------------------------------------------------------------------
  DOM-CONNECTOR
------------------------------------------------------------------------------------
*/


QxWidget._domConnector = function()
{
  // Properties
  var tpropsmargin = "marginLeft,marginTop,marginRight,marginBottom";
  var tpropspadding = "paddingLeft,paddingTop,paddingRight,paddingBottom";
  var tpropsborder = "borderLeft,borderTop,borderRight,borderBottom";

  var tprops = tpropsmargin + "," + tpropspadding + "," + tpropsborder;


  // Dimensions
  var tdimsouter = "outerWidth,outerHeight";
  var tdimsbox = "boxWidth,boxHeight";
  var tdimsarea = "areaWidth,areaHeight";
  var tdimsinner = "innerWidth,innerHeight";

  var tdims = tdimsouter + "," + tdimsbox + "," + tdimsarea + "," + tdimsinner;


  // Insets
  var tinsets = "insetLeft,insetTop,insetRight,insetBottom";


  // Scroll
  var tscrolls = "scrollBarSizeLeft,scrollBarSizeTop,scrollBarSizeRight,scrollBarSizeBottom,scrollBarVisibleX,scrollBarVisibleY";


  // Positions (Client)
  var tcposouter = "clientOuterLeft,clientOuterTop,clientOuterRight,clientOuterBottom";
  var tcposbox = "clientBoxLeft,clientBoxTop,clientBoxRight,clientBoxBottom";
  var tcposarea = "clientAreaLeft,clientAreaTop,clientAreaRight,clientAreaBottom";
  var tcposinner = "clientInnerLeft,clientInnerTop,clientInnerRight,clientInnerBottom";

  var tcpos = tcposouter + "," + tcposbox + "," + tcposarea + "," + tcposinner;


  // Positions (Page)
  var tpposouter = "pageOuterLeft,pageOuterTop,pageOuterRight,pageOuterBottom";
  var tpposbox = "pageBoxLeft,pageBoxTop,pageBoxRight,pageBoxBottom";
  var tpposarea = "pageAreaLeft,pageAreaTop,pageAreaRight,pageAreaBottom";
  var tpposinner = "pageInnerLeft,pageInnerTop,pageInnerRight,pageInnerBottom";

  var tppos = tpposouter + "," + tpposbox + "," + tpposarea + "," + tpposinner;


  // Screen
  var tscreenouter = "screenOuterLeft,screenOuterTop,screenOuterRight,screenOuterBottom";
  var tscreenbox = "screenBoxLeft,screenBoxTop,screenBoxRight,screenBoxBottom";
  var tscreenarea = "screenAreaLeft,screenAreaTop,screenAreaRight,screenAreaBottom";
  var tscreeninner = "screenInnerLeft,screenInnerTop,screenInnerRight,screenInnerBottom";

  var tscreen = tscreenouter + "," + tscreenbox + "," + tscreenarea + "," + tscreeninner;


  // Runtime
  var tall = tprops + "," + tdims + "," + tinsets + "," + tscrolls + "," + tcpos + "," + tppos + "," + tscreen;
  var tarr = tall.split(",");

  for (var i=0; i<tarr.length; i++) {
    var tname = "getComputed" + tarr[i].toFirstUp();
    proto[tname] = new Function("var el = this.getElement(); return QxDOM." + tname + "(el);");
  };
};

QxWidget._domConnector();









/*
------------------------------------------------------------------------------------
  NODE ALIASES
------------------------------------------------------------------------------------
*/

proto.setScrollLeft = function(nScrollLeft)
{
  if(!this.isCreated()) {
    return;
  };

  this.getElement().scrollLeft = nScrollLeft;
};

proto.setScrollTop = function(nScrollTop)
{
  if(!this.isCreated()) {
    return;
  };

  this.getElement().scrollTop = nScrollTop;
};

proto.getOffsetLeft = function()
{
  if(!this.isCreated()) {
    return;
  };

  return QxDOM.getOffsetLeft(this.getElement());
};

proto.getOffsetTop = function()
{
  if(!this.isCreated()) {
    return;
  };

  return QxDOM.getOffsetTop(this.getElement());
};

proto.getScrollLeft = function()
{
  if(!this.isCreated()) {
    return;
  };

  return this.getElement().scrollLeft;
};

proto.getScrollTop = function()
{
  if(!this.isCreated()) {
    return;
  };

  return this.getElement().scrollTop;
};

proto.getClientWidth = function()
{
  if(!this.isCreated()) {
    return;
  };

  return this.getElement().clientWidth;
};

proto.getClientHeight = function()
{
  if(!this.isCreated()) {
    return;
  };

  return this.getElement().clientHeight;
};

proto.getOffsetWidth = function()
{
  if(!this.isCreated()) {
    return;
  };

  return this.getElement().offsetWidth;
};

proto.getOffsetHeight = function()
{
  if(!this.isCreated()) {
    return;
  };

  return this.getElement().offsetHeight;
};








/*
------------------------------------------------------------------------------------
  PREFERRED DIMENSIONS
------------------------------------------------------------------------------------
*/

proto._preferred_width = null;
proto._preferred_height = null;

proto._invalidatePreferred = function()
{
  this._preferred_width = this._preferred_height = null;

  var pa = this.getParent();
  if (pa) {
    pa._childrenPreferredInvalidated(this);
  };
};

proto._invalidatePreferredWidth = function()
{
  this._preferred_width = null;

  var pa = this.getParent();
  if (pa) {
    pa._childrenPreferredWidthInvalidated(this);
  };
};

proto._invalidatePreferredHeight = function()
{
  this._preferred_height = null;

  var pa = this.getParent();
  if (pa) {
    pa._childrenPreferredHeightInvalidated(this);
  };
};

proto._calculatePreferredDimensions = function()
{
  try
  {
    return QxDOM.getComputedPreferredSize(this.getElement());
  }
  catch(ex)
  {
    throw new Error("Calculation of preferred width/height (of " + this + ") failed: " + ex);
  };
};

/*!
  Get the preferred width of the widget.
*/
proto.getPreferredWidth = function()
{
  if (this.getWidth() == "auto")
  {
    if (!this._wasVisible) {
      this._renderHorizontal("initial");
    };

    return this._pixelof_width;
  };

  if (this._preferred_width == null)
  {
    if (this.getChildrenLength() > 0)
    {
      this._preferred_width = this._calculateChildrenDependWidth() + this.getComputedPaddingLeft() + this.getComputedPaddingRight() + this.getComputedInsetLeft() + this.getComputedInsetRight();
    }
    else
    {
      var r = this._calculatePreferredDimensions();

      this._preferred_width = r.width;
      this._preferred_height = r.height;
    };
  };

  return this._preferred_width;
};

/*!
  Get the preferred height of the widget.
*/
proto.getPreferredHeight = function()
{
  if (this.getHeight() == "auto")
  {
    if (!this._wasVisible) {
      this._renderVertical("initial");
    };

    return this._pixelof_height;
  };

  if (this._preferred_height == null)
  {
    if (this.getChildrenLength() > 0)
    {
      this._preferred_height = this._calculateChildrenDependHeight() + this.getComputedPaddingTop() + this.getComputedPaddingBottom() + this.getComputedInsetTop() + this.getComputedInsetBottom();
    }
    else
    {
      var r = this._calculatePreferredDimensions();

      this._preferred_width = r.width;
      this._preferred_height = r.height;
    };
  };

  return this._preferred_height;
};

/*!
  Set dimensions to preferred values.
*/
proto.pack = function()
{
  this.setWidth(this.getPreferredWidth());
  this.setHeight(this.getPreferredHeight());
};

proto._childrenPreferredInvalidated = function(vModifiedWidget)
{
  this._childrenPreferredWidthInvalidated(vModifiedWidget);
  this._childrenPreferredHeightInvalidated(vModifiedWidget);
};

proto._lastChildWithInvalidatedPreferredHeight = null;
proto._lastChildWithInvalidatedPreferredWidth = null;

proto._childrenPreferredWidthInvalidated = function(vModifiedWidget)
{
  if (!this._wasVisible) {
    return;
  };
  
  this._lastChildWithInvalidatedPreferredWidth = vModifiedWidget;

  if (this.getWidth() == "auto")
  {
    // this.debug("Children preferred width invalidated! [1]: " + vModifiedWidget.getCssClassName());
    this._setChildrenDependWidth(vModifiedWidget, "preferred");
  }
  else
  {
    //this.debug("Children preferred width invalidated! [2]: " + vModifiedWidget);
    this._invalidatePreferredWidth(vModifiedWidget);
  };
};

proto._childrenPreferredHeightInvalidated = function(vModifiedWidget)
{
  if (!this._wasVisible) {
    return;
  };
  
  this._lastChildWithInvalidatedPreferredHeight = vModifiedWidget;

  if (this.getHeight() == "auto")
  {
    //this.debug("Children preferred height invalidated! [1]");
    this._setChildrenDependHeight(vModifiedWidget, "preferred");
  }
  else
  {
    //this.debug("Children preferred height invalidated! [2]");
    this._invalidatePreferredHeight(vModifiedWidget);
  };
};




/*
------------------------------------------------------------------------------------
  INNER DIMENSIONS
------------------------------------------------------------------------------------
*/

proto._inner_width = null;
proto._inner_height = null;

proto._invalidateInner = function() {
  this._inner_width = this._inner_height = null;
};

proto._invalidateInnerWidth = function() {
  this._inner_width = null;
};

proto._invalidateInnerHeight = function() {
  this._inner_height = null;
};

proto.getInnerWidth = function()
{
  if (this._inner_width == null) {
    this._inner_width = this.getComputedInnerWidth();
  };

  return this._inner_width;
};

proto.getInnerHeight = function()
{
  if (this._inner_height == null) {
    this._inner_height = this.getComputedInnerHeight();
  };

  return this._inner_height;
};











/*
------------------------------------------------------------------------------------
  MARGIN/PADDING PROPERTIES
------------------------------------------------------------------------------------
*/

proto._modifyPaddingHorizontal = function(propValue, propOldValue, propName, uniqModIds)
{
  if (isValid(propValue))
  {
    this.setStyleProperty(propName, Math.round(propValue) + "px");
  }
  else
  {
    this.removeStyleProperty(propName);
  };

  // the border eventually change the dimensions
  // if we want a inner or area (min-/max-) width/height
  // we must recalculate our dimensions now.
  this._recalculateFrameWidth("padding");

  // this also changes the preferred width
  this._invalidatePreferredWidth();

  return true;
};

proto._modifyPaddingVertical = function(propValue, propOldValue, propName, uniqModIds)
{
  if (isValid(propValue))
  {
    this.setStyleProperty(propName, Math.round(propValue) + "px");
  }
  else
  {
    this.removeStyleProperty(propName);
  };

  // the border eventually change the dimensions
  // if we want a inner or area (min-/max-) width/height
  // we must recalculate our dimensions now.
  this._recalculateFrameHeight("padding");

  // this also changes the preferred height
  this._invalidatePreferredHeight();

  return true;
};

proto._modifyMarginHorizontal = function(propValue, propOldValue, propName, uniqModIds)
{
  if (isValid(propValue))
  {
    this.setStyleProperty(propName, Math.round(propValue) + "px");
  }
  else
  {
    this.removeStyleProperty(propName);
  };

  // Inform parent
  this._outerWidthChanged("margin");

  return true;
};

proto._modifyMarginVertical = function(propValue, propOldValue, propName, uniqModIds)
{
  if (isValid(propValue))
  {
    this.setStyleProperty(propName, Math.round(propValue) + "px");
  }
  else
  {
    this.removeStyleProperty(propName);
  };

  // Inform parent
  this._outerHeightChanged("margin");

  return true;
};






/*
------------------------------------------------------------------------------------
  MARGIN/PADDING GROUP HANDLER
------------------------------------------------------------------------------------
*/

/*!
  Utility function for padding/margin handling.
*/
QxWidget.cssLikeShortHandService = function(params)
{

  var l = params.length;

  if (l > 4) {
    throw new Error("Invalid number of arguments!");
  };

  var v;
  var forceList = new Array();
  var styleList = new Array();

  for (var i=0; i<l; i++)
  {
    v = params[i];

    if (isValidNumber(v))
    {
      forceList.push(v);
      styleList.push(Math.round(v) + "px");
    }
    else if (v == "" || v == null)
    {
      forceList.push(null);
      styleList.push("");
    }
    else
    {
      throw new Error("Invalid shorthand value: " + v);
    };
  };

  // Fix Values (Shorthand)
  switch(l)
  {
    case 1:
      forceList[1] = forceList[2] = forceList[3] = forceList[0];
      styleList[1] = styleList[2] = styleList[3] = styleList[0];
      break;

    case 2:
      forceList[2] = forceList[0];
      styleList[2] = styleList[0];

    case 3:
      forceList[3] = forceList[1];
      styleList[3] = styleList[1];
  };

  return [ forceList, styleList ];
};

/*!
  Ultra fast handler for mass setup of paddings in css shorthand like style.

  Omits usage of property modifiers; invalidates layout only once.

  One argument means all padding will get this value.

  Two arguments means that the first argument will be used for the top and
  bottom padding and the second argument will be used for the right and left padding.

  Three arguments means that the first argument will be used for the top
  padding, the second for the right and left padding and the third for the
  bottom padding.

  If you define four properties the first argument is the top
  and the others will be distributed clockwise.
*/
proto.setPadding = function()
{
  try{
    var r = QxWidget.cssLikeShortHandService(arguments);
  }
  catch(ex) {
    throw new Error("Invalid value for padding: " + ex);
  };

  var forceList = r[0];
  var styleList = r[1];

  this.forcePaddingTop(forceList[0]);
  this.forcePaddingRight(forceList[1]);
  this.forcePaddingBottom(forceList[2]);
  this.forcePaddingLeft(forceList[3]);

  this.setStyleProperty("paddingTop", styleList[0]);
  this.setStyleProperty("paddingRight", styleList[1]);
  this.setStyleProperty("paddingBottom", styleList[2]);
  this.setStyleProperty("paddingLeft", styleList[3]);

  // Inform Childs
  this._recalculateFrame("padding");

  // This also changes the preferred dimensions
  this._invalidatePreferred();

  return true;
};

/*!
  Ultra fast handler for mass setup of margins in css shorthand like style.

  Omits usage of property modifiers; invalidates layout only once.

  One argument means all margin will get this value. Two arguments means
  that the first argument will be used for the top and bottom margin and
  the second argument will be used for the right and left margin.
  Three arguments means that the first argument will be used for the top
  margin, the second for the right and left margin and the third for the
  bottom margin. If you define four properties the first argument is the top
  and the others will be distributed clockwise.
*/
proto.setMargin = function()
{
  try{
    var r = QxWidget.cssLikeShortHandService(arguments);
  }
  catch(ex) {
    throw new Error("Invalid value for margin: " + ex);
  };

  var forceList = r[0];
  var styleList = r[1];

  this.forceMarginTop(forceList[0]);
  this.forceMarginRight(forceList[1]);
  this.forceMarginBottom(forceList[2]);
  this.forceMarginLeft(forceList[3]);

  this.setStyleProperty("marginTop", styleList[0]);
  this.setStyleProperty("marginRight", styleList[1]);
  this.setStyleProperty("marginBottom", styleList[2]);
  this.setStyleProperty("marginLeft", styleList[3]);

  // Inform parent
  this._outerChanged("margin");

  return true;
};

/*!

*/
proto.setEdge = function()
{
  try{
    var r = QxWidget.cssLikeShortHandService(arguments);
  }
  catch(ex) {
    throw new Error("Invalid value for edge: " + ex);
  };

  var forceList = r[0];
  
  this._omitRendering();

  this.setWidth(null);
  this.setHeight(null);

  this.setTop(forceList[0]);
  this.setRight(forceList[1]);
  this.setBottom(forceList[2]);
  this.setLeft(forceList[3]);

  this._activateRendering();

  return true;
};



/*
------------------------------------------------------------------------------------
  FOCUS HANDLING
------------------------------------------------------------------------------------
*/

proto.canGetFocus = function() { return this.isCreated() && this.getTabIndex() >= 0 && this.isEnabled(); };
proto.isFocusRoot = function() { return false; };
proto._ontabfocus = function() {};

proto._modifyFocused = function(propValue, propOldValue, propName, uniqModIds)
{
  if (!this.isCreated()) {
    return true;
  };

  if (propValue)
  {
    this.getTopLevelWidget().getFocusManager().setFocusedWidget(this, uniqModIds);
    this._visualizeFocus();
  }
  else
  {
    this.getTopLevelWidget().getFocusManager().setFocusedWidget(null, uniqModIds);
    this._visualizeBlur();
  };

  return true;
};

// Create a new elements and place it over the source element
// then remove it, this lets opera refresh the display on this section
if ((new QxClient).isOpera())
{
  proto.repaint = function()
  {

    // Create Layer above all content
    // resize it to body dimensions, and push it to the body
    var z = document.createElement("div");
    z.style.height = (document.body.offsetHeight) + "px";
    z.style.width = (document.body.offsetWidth) + "px";
    z.style.top = "0px";
    z.style.left = "0px";
    z.style.position = "absolute";
    z.style.backgroundColor = "blue";
    z.style.zIndex = "100000000000000";

    document.body.appendChild(z);

    var el = this.getElement();

    // Store old property values
    var t = el.style.top;
    var l = el.style.left;

    el.style.top = (this.getComputedPageBoxTop() - 5) + "px";
    el.style.left = (this.getComputedPageBoxLeft() - 5) + "px";

    // Restore old property values
    el.style.top = t;
    el.style.left = l;

    // Remove overlay layer
    document.body.removeChild(z);
  };
}
else
{
  proto.repaint = function() {};
};

if ((new QxClient).isOpera())
{
  proto._visualizeBlur = function()
  {
    this.setCssClassName(this.getCssClassName().remove("QxFocused", " ").remove(this.classname + "-Focused", " "));

    try {
      this.getElement().blur();
    } catch(ex) {};

    this.repaint();

    return true;
  };

  proto._visualizeFocus = function()
  {
    this.setCssClassName(this.getCssClassName().add("QxFocused", " ").add(this.classname + "-Focused", " "));

    try {
      this.getElement().focus();
    } catch(ex) {};

    this.repaint();

    return true;
  };
}
else
{
  proto._visualizeBlur = function()
  {
    this.setCssClassName(this.getCssClassName().remove("QxFocused", " ").remove(this.classname + "-Focused", " "));

    try {
      this.getElement().blur();
    } catch(ex) {};

    return true;
  };

  proto._visualizeFocus = function()
  {
    this.setCssClassName(this.getCssClassName().add("QxFocused", " ").add(this.classname + "-Focused", " "));

    try {
      this.getElement().focus();
    } catch(ex) {};

    return true;
  };
};



proto._modifyCapture = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue)
  {
    this.getTopLevelWidget().getEventManager().setCaptureWidget(null, uniqModIds);
  }
  else if (propValue)
  {
    this.getTopLevelWidget().getEventManager().setCaptureWidget(this, uniqModIds);
  };

  return true;
};








/*
------------------------------------------------------------------------------------
  TAB INDEX
------------------------------------------------------------------------------------
*/

if ((new QxClient).isMshtml())
{
  proto._modifyTabIndex = function(propValue, propOldValue, propName, uniqModIds)
  {
    this.setHtmlProperty("unselectable", propValue < 0 || !this.getEnabled());
    this.setHtmlProperty("tabIndex", propValue < 0 ? -1 : 1);

    return true;
  };
}
else if ((new QxClient).isGecko())
{
  proto._modifyTabIndex = function(propValue, propOldValue, propName, uniqModIds)
  {
    this.setStyleProperty("MozUserFocus", propValue < 0 ? "ignore" : "normal");

    // be forward compatible (CSS 3 draft)
    this.setStyleProperty("userFocus", propValue < 0 ? "ignore" : "normal");

    return true;
  };
}
else
{
  proto._modifyTabIndex = function(propValue, propOldValue, propName, uniqModIds)
  {
    this.setStyleProperty("userFocus", propValue < 0 ? "ignore" : "normal");
    this.setHtmlProperty("tabIndex", propValue < 0 ? -1 : 1);

    return true;
  };
};









/*
------------------------------------------------------------------------------------
  CSS CLASS NAME
------------------------------------------------------------------------------------
*/

proto._modifyCssClassName = function(propValue, propOldValue, propName, uniqModIds)
{
  this.setHtmlProperty("className", propValue);
  return true;
};

proto._evalCssClassName = function()
{
  var v1 = this.getHtmlProperty("className");

  if (typeof v1 == "string" && v1 != "")
    return v1;
  else
    return this.classname;
};

proto._addCssClassName = function(propValue) {
  this.setCssClassName(this.getCssClassName().add(propValue, " "));
};

proto._removeCssClassName = function(propValue) {
  this.setCssClassName(this.getCssClassName().remove(propValue, " "));
};

proto.addCssClassNameDetail = function(propValue) {
  this._addCssClassName(this.classname + "-" + propValue.toFirstUp());
};

proto.removeCssClassNameDetail = function(propValue) {
  this._removeCssClassName(this.classname + "-" + propValue.toFirstUp());
};



/*
------------------------------------------------------------------------------------
  WIDGET FROM POINT
------------------------------------------------------------------------------------
*/

proto.getWidgetFromPoint = function(x, y)
{
  var ret = this.getWidgetFromPointHelper(x, y);
  return ret && ret != this ? ret : null;
};

proto.getWidgetFromPointHelper = function(x, y)
{
  var ch = this.getChildren();
  
  for (var chl=ch.length, i=0; i<chl; i++) {
    if (QxDOM.getElementAbsolutePointChecker(ch[i].getElement(), x, y)) {
      return ch[i].getWidgetFromPointHelper(x, y);
    };    
  };
  
  return this;
};






/*
------------------------------------------------------------------------------------
  SCROLL INTO VIEW
------------------------------------------------------------------------------------
*/

proto.scrollIntoView = function()
{
  if(!this.isCreated()) {
    return;
  };

  this.scrollIntoViewX();
  this.scrollIntoViewY();
};

proto.scrollIntoViewX = function()
{
  if (!this.isCreated()) {
    return;
  };

  var p = this.getParent();
  if (!p) {
    return;
  };

  var l = this.getOffsetLeft();
  var w = this.getOffsetWidth();

  var sl = p.getScrollLeft();
  var cw = p.getComputedAreaWidth();

  // Go left
  if (w > cw || l < sl)
  {
    p.setScrollLeft(l);
  }

  // Go right
  else if (l + w > sl + cw)
  {
    p.setScrollLeft(l + w - cw);
  };
};

proto.scrollIntoViewY = function()
{
  if (!this.isCreated()) {
    return;
  };

  var p = this.getParent();
  if (!p) {
    return;
  };

  var t = this.getOffsetTop();
  var h = this.getOffsetHeight();

  var st = p.getScrollTop();
  var ch = p.getClientHeight();

  // Go up
  if(h > ch || t < st)
  {
    p.setScrollTop(t);
  }

  // Go down
  else if(t + h > st + ch)
  {
    p.setScrollTop(t + h - ch);
  };
};










/*
------------------------------------------------------------------------------------
  CAN SELECT
------------------------------------------------------------------------------------
*/

if((new QxClient).isMshtml())
{
  proto._modifyCanSelect = function(propValue, propOldValue, propName, uniqModIds) {
    return propValue ? this.removeHtmlProperty("unselectable") : this.setHtmlProperty("unselectable", "on");
  };

  proto._evalCanSelect = function(propName)
  {
    var v = this.getHtmlProperty("unselectable");
    return v != "on" || v == null;
  };
}
else if((new QxClient).isGecko())
{
  proto._modifyCanSelect = function(propValue, propOldValue, propName, uniqModIds)
  {
    // Be forward compatible and use both userSelect and MozUserSelect
    if (propValue)
    {
      this.removeStyleProperty("MozUserSelect");
      this.removeStyleProperty("userSelect");
    }
    else
    {
      this.setStyleProperty("MozUserSelect", "none");
      this.setStyleProperty("userSelect", "none");
    };

    return true;
  };

  proto._evalCanSelect = function(propName)
  {
    // be forward/crossbrowser compatible
    var v = (new QxClient).isGecko() ? this.getStyleProperty("MozUserSelect") : null;
    var v = v == null ? this.getStyleProperty("userSelect") : v;
    return v != "none" || v == null;
  };
}
else
{
  proto._modifyCanSelect = function(propValue, propOldValue, propName, uniqModIds) {
    return propValue ? this.removeStyleProperty("userSelect") : this.setStyleProperty("userSelect", "none");
  };

  proto._evalCanSelect = function(propName)
  {
    throw new Error("_evalCanSelect is not implemented for this client!");
  };
};








/*
------------------------------------------------------------------------------------
  OPACITY
------------------------------------------------------------------------------------
*/

/*!
Sets the opacit for the widget. Any child widget inside the widget will
also become transparent. The value should be a number between 0 and 1 where 1
means totally opaque and 0 invisible.
*/
if((new QxClient).isMshtml())
{
  proto._modifyOpacity = function(propValue, propOldValue, propName, uniqModIds)
  {
    if(propValue == null || propValue > 1)
    {
      this.removeStyleProperty("filter");
    }
    else if (isValidNumber(propValue))
    {
      this.setStyleProperty("filter", "Alpha(Opacity=" + Math.round(propValue.limit(0, 1) * 100) + ")");
    }
    else
    {
      throw new Error("Unsupported opacity value: " + propValue);
    };

    return true;
  };

  proto._evalOpacity = function()
  {
    var o = this.getStyleProperty("filter");

    // No definition means no transparency
    if (o == null || o == "") {
      return 1;
    };

    var re = /Alpha\(Opacity=([0-9]{1,3})\)/;

    if (!re.test(o)) {
      return 1;
    };

    return parseInt(RegExp.$1)/100;
  };
}
else
{
  proto._modifyOpacity = function(propValue, propOldValue, propName, uniqModIds)
  {
    if(propValue == null || propValue > 1)
    {
      if ((new QxClient).isGecko())
      {
        this.removeStyleProperty("MozOpacity");
      }
      else if ((new QxClient).isKhtml())
      {
        this.removeStyleProperty("KhtmlOpacity");
      };

      this.removeStyleProperty("opacity");
    }
    else if (isValidNumber(propValue))
    {
      propValue = propValue.limit(0, 1);

      // should we omit geckos flickering here
      // and limit the max value to 0.99?

      if ((new QxClient).isGecko())
      {
        this.setStyleProperty("MozOpacity", propValue);
      }
      else if ((new QxClient).isKhtml())
      {
        this.setStyleProperty("KhtmlOpacity", propValue);
      };

      this.setStyleProperty("opacity", propValue);
    };

    return true;
  };

  proto._evalOpacity = function()
  {
    // if we have a gecko based browser, first check the moz version of opacity
    var o = (new QxClient).isGecko() ? this.getStyleProperty("MozOpacity") : (new QxClient).isKhtml() ? this.getStyleProperty("KhtmlOpacity") : null;
    var o = o == null || o == "" ? this.getStyleProperty("opacity") : o;

    // No definition means no transparency
    if (o == null || o == "") {
      return 1;
    };

    return parseFloat(o);
  };
};








/*
  -------------------------------------------------------------------------------
    CURSOR
  -------------------------------------------------------------------------------
*/

proto._modifyCursor = function(propValue, propOldValue, propName, uniqModIds)
{
  return this.setStyleProperty("cursor", propValue == "pointer" && (new QxClient).isMshtml() ? "hand" : propValue);
};

proto._evalCursor = function()
{
  var c = this.getStyleProperty("cursor");
  return c == "hand" ? "pointer" : c;
};







/*
  -------------------------------------------------------------------------------
    BACKGROUND IMAGE
  -------------------------------------------------------------------------------
*/

proto._modifyBackgroundImage = function(propValue, propOldValue, propName, uniqModIds)
{
  if(propValue == "" || propValue == "null")
  {
    this.removeStyleProperty("backgroundImage");
  }
  else
  {
    this.setStyleProperty("backgroundImage", "url(" + propValue + ")");
  };

  return true;
};

proto._evalBackgroundImage = function()
{
  var s = this.getStyleProperty("backgroundImage");
  return isInvalid(s) ? "" : s.replace(/^url\(/i, "").replace(/\)$/, "");
};








/*
  -------------------------------------------------------------------------------
    OVERFLOW
  -------------------------------------------------------------------------------
*/

proto._modifyOverflow = function(propValue, propOldValue, propName, uniqModIds)
{
  var pv = propValue;
  var pn = propName;

  if ((new QxClient).isGecko())
  {
    switch(pv)
    {
      case "hidden":
        pv = "-moz-scrollbars-none";
        break;

      case "scrollX":
        pv = "-moz-scrollbars-horizontal";
        break;

      case "scrollY":
        pv = "-moz-scrollbars-vertical";
        break;
    };
  }

  else if ((new QxClient).isMshtml())
  {
    switch(pv)
    {
      case "scrollX":
        pn = "overflowX";
        pv = "scroll";
        break;

      case "scrollY":
        pn = "overflowY";
        pv = "scroll";
        break;
    };

    // Clear up concurrenting rules
    var a = [ "overflow", "overflowX", "overflowY" ];
    for (var i=0; i<a.length; i++)
    {
      if (a[i]!=pn) {
        this.removeStyleProperty(a[i]);
      };
    };
  }

  // Opera/Khtml Mode...
  // hopefully somewhat of this is supported in the near future.
  else
  {
    switch(pv)
    {
      case "scrollX":
      case "scrollY":
        pv = "scroll";
        break;
    };
  };

  return this.setStyleProperty(pn, pv);
};

proto._evalOverflow = function()
{
  var pv = this.getStyleProperty("overflow");

  if ((new QxClient).isGecko())
  {
    switch(pv)
    {
      case "-moz-scrollbars-none":
        pv = "hidden";
        break;

      case "-moz-scrollbars-horizontal":
        pv = "scrollX";
        break;

      case "-moz-scrollbars-vertical":
        pv = "scrollY";
        break;
    };
  }
  else if ((new QxClient).isMshtml())
  {
    var pvx = this.getStyleProperty("overflowX");
    var pvy = this.getStyleProperty("overflowY");

    if (pvx == pvy == "scroll")
    {
      pv = "scroll";
    }
    else if (pvx == "scroll")
    {
      pv = "scrollX";
    }
    else if (pvy == "scroll")
    {
      pv = "scrollY";
    };
  };

  return pv;
};







/*
  -------------------------------------------------------------------------------
    BORDER
  -------------------------------------------------------------------------------
*/

/*!
  Apply QxBorder to QxWidget
*/
proto._modifyBorder = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.removeWidget(this);
  };

  if (propValue) {
    propValue.addWidget(this);
  };

  // the border eventually change the dimensions
  // if we want a inner or area (min-/max-) width/height
  // we must recalculate our dimensions now.
  this._recalculateFrame("border");

  // this also changes the preferred dimensions
  this._invalidatePreferred();

  return true;
};





/*
  -------------------------------------------------------------------------------
    DISPOSER
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  var ch = this._children;

  if (isValid(this._children))
  {
    var chl = ch.length;

    for (var i=chl-1; i>=0; i--)
    {
      this._children[i].dispose();
      delete this._children[i];
    };

    delete this._children;
  };

  var el = this.getElement();
  if(el) {
    el._QxWidget = null;
  };

  delete this._usedDimensionsHorizontal;
  delete this._usedDimensionsVertical;

  QxTarget.prototype.dispose.call(this);

  for (var i in this._styleProperties) {
    delete this._styleProperties[i];
  };

  delete this._styleProperties;


  for (var i in this._htmlProperties) {
    delete this._htmlProperties[i];
  };

  delete this._htmlProperties;


  for (var i in this._htmlAttributes) {
    delete this._htmlAttributes[i];
  };

  delete this._htmlAttributes;

  return true;
};






/*
  -------------------------------------------------------------------------------
    CLONE
  -------------------------------------------------------------------------------
*/

proto._clonePropertyIgnoreList = "parent,element,visible,display,visibility,boxPrefHeight,boxPrefWidth";


/*!
Returns a cloned copy of the current instance of QxWidget.

#param cloneRecursive[Boolean]: Should the widget cloned recursive (including all childs)?
#param customPropertyList[Array]: Optional (reduced) list of properties to copy through
*/
proto.clone = function(cloneRecursive, customPropertyList)
{
  var cloneInstance = new this.constructor;

  var propertyName;
  var propertyList = [];
  var propertyIngoreList = this._clonePropertyIgnoreList.split(",");

  // Build new filtered property list
  var sourcePropertyList = isValid(customPropertyList) ? customPropertyList : this._properties.split(",");
  var sourcePropertyListLength = sourcePropertyList.length-1;
  do {
    propertyName = sourcePropertyList[sourcePropertyListLength];
    if (!propertyIngoreList.contains(propertyName)) {
      propertyList.push(propertyName);
    };
  }
  while(sourcePropertyListLength--);
  
  // Apply properties to new clone instance
  propertyListLength = propertyList.length-1;
  do {
    propertyName = propertyList[propertyListLength].toFirstUp();
    cloneInstance["set" + propertyName](this["get" + propertyName]());
  }
  while(propertyListLength--);

  // post apply parent info
  if (sourcePropertyList.contains("parent"))
  {
    var myParent = this.getParent();
    if (myParent) {
      cloneInstance.setParent(myParent);
    };
  };

  // post apply (ignored) visibility and display
  // (to not modify default creation handling)
  if (sourcePropertyList.contains("visibility")) {
    cloneInstance.setVisibility(this.getVisibility());
  };

  if (sourcePropertyList.contains("display")) {
    cloneInstance.setDisplay(this.getDisplay());
  };

  // clone recursion
  if (cloneRecursive) {
    this._cloneRecursive(cloneInstance);
  };

  return cloneInstance;
};

proto._cloneRecursive = function(cloneInstance)
{
  var ch = this.getChildren();
  var chl = ch.length;
  var cloneChild;

  for (var i=0; i<chl; i++) {
    cloneChild = ch[i].clone(true);
    cloneInstance.add(cloneChild);
  };
};





/*
  -------------------------------------------------------------------------------
    COMMAND INTERFACE
  -------------------------------------------------------------------------------
*/

proto.execute = function()
{
  var vCommand = this.getCommand();
  if (vCommand) {
    vCommand.execute(this);
  };

  if (this.hasEventListeners("execute")) {
    this.dispatchEvent(new QxEvent("execute"));
  };

  if (this.hasEventListeners("action")) {
    this.dispatchEvent(new QxEvent("action"));
  };
};