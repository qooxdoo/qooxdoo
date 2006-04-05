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

#package(guicore)
#require(QxApplication)
#require(QxColorObject)
#require(QxColorCache)
#require(QxBorderObject)
#require(QxBorderCache)
#require(QxAppearanceManager)
#post(QxWidgetCore)
#post(QxDomScrollIntoView)
#post(QxDomOffset)

************************************************************************ */

/*!
  This is the main widget, all visible objects in the application extend this.
*/
function QxWidget()
{
  if (this.classname == QxWidget.OMIT_CLASS) {
    throw new Error("Please omit the usage of QxWidget directly. Choose between QxParent and QxTerminator instead!");
  };

  QxTarget.call(this, true);


  // ************************************************************************
  //   HTML MAPPING DATA STRUCTURES
  // ************************************************************************
  // Allows the user to setup styles and attributes without a
  // need to have the target element created already.
  /*
  this._htmlProperties = { className : this.classname };
  this._htmlAttributes = { qxhashcode : this._hashCode };
  */
  this._styleProperties = { position : QxConst.CORE_ABSOLUTE };


  // ************************************************************************
  //   LAYOUT CHANGES
  // ************************************************************************
  this._layoutChanges = {};


  // ************************************************************************
  //   APPEARANCE
  // ************************************************************************
  this._states = {};
  this._applyInitialAppearance();
};

QxWidget.extend(QxTarget, "QxWidget");

QxWidget.CORE_CLASS = "QxWidgetCore";
QxWidget.OMIT_CLASS = "QxWidget";

/*!
  Will be calculated later
*/
QxWidget.SCROLLBAR_SIZE = 16;






/*
---------------------------------------------------------------------------
  BASIC PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The parent widget (the real object, no ID or something)
*/
QxWidget.addProperty({ name : "parent", type : QxConst.TYPEOF_OBJECT, instance : "QxParent", defaultValue : null });

/*!
  The element node (if the widget is created, otherwise null)
*/
QxWidget.addProperty({ name : "element" });

/*!
  Simple and fast switch of the visibility of a widget.
*/
QxWidget.addProperty({ name : "visibility", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  If the widget should be displayed. Use this property instead of visibility if the change
  in visibility should have effects on the parent widget.
*/
QxWidget.addProperty({ name : "display", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  If you switch this to true, the widget doesn't handle
  events directly. It will redirect them to the parent
  widget.
*/
QxWidget.addProperty({ name : "anonymous", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false, getAlias : "isAnonymous" });

/*!
  The tagname of the element which should automatically be created
*/
QxWidget.addProperty({ name : "tagName", type : QxConst.TYPEOF_STRING, defaultValue : QxConst.CORE_DIV });

/*!
  This is used by many layout managers to control the individual horizontal alignment of this widget inside this parent.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "horizontalAlign", type : QxConst.TYPEOF_STRING });

/*!
  This is used by many layout managers to control the individual vertical alignment of this widget inside this parent.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "verticalAlign", type : QxConst.TYPEOF_STRING });

/*!
  Should this widget be stretched on the x-axis if the layout handler will do this?
  Used by some layout handlers (QxBoxLayout, ...).
*/
QxWidget.addProperty({ name : "allowStretchX", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Should this widget be stretched on the y-axis if the layout handler will do this?
  Used by some layout handlers (QxBoxLayout, ...).
*/
QxWidget.addProperty({ name : "allowStretchY", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });






/*
---------------------------------------------------------------------------
  STYLE PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Mapping to native style property z-index.

  This should be used with caution since in some cases
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "zIndex", type : QxConst.TYPEOF_NUMBER });

/*!
  The color style property of the rendered widget.
  As input are allowed any instance of QxColor or a string which defines the color itself.
*/
QxWidget.addProperty({ name : "backgroundColor", type : QxConst.TYPEOF_OBJECT, instance : "QxColor", convert : QxColorCache, allowMultipleArguments : true });

/*!
  The backgroundColor style property of the rendered widget.
  As input are allowed any instance of QxColor or a string which defines the color itself.
*/
QxWidget.addProperty({ name : "color", type : QxConst.TYPEOF_OBJECT, instance : "QxColor", convert : QxColorCache, allowMultipleArguments : true });

/*!
  The border property describes how to paint the border on the widget.

  This should be used with caution since in some cases (mostly complex widgets)
  this might give unrespected results.
*/
QxWidget.addProperty({ name : "border", type : QxConst.TYPEOF_OBJECT, instance : "QxBorder", convert : QxBorderCache, allowMultipleArguments : true });

/*!
  Mapping to native style property opacity.

  The uniform opacity setting to be applied across an entire object. Behaves like the new CSS-3 Property.
  Any values outside the range 0.0 (fully transparent) to 1.0 (fully opaque) will be clamped to this range.
*/
QxWidget.addProperty({ name : "opacity", type : QxConst.TYPEOF_NUMBER });

/*!
  Mapping to native style property cursor.

  The name of the cursor to show when the mouse pointer is over the widget.
  This is any valid CSS2 cursor name defined by W3C.
*/
QxWidget.addProperty({ name : "cursor", type : QxConst.TYPEOF_STRING });

/*!
  Mapping to native style property background-image.

  The URI of the image file to use as background image.
*/
QxWidget.addProperty({ name : "backgroundImage", type : QxConst.TYPEOF_STRING });

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
QxWidget.addProperty({ name : "overflow", type : QxConst.TYPEOF_STRING, addToQueue : true });

/*!
  Clipping of the widget
*/
QxWidget.addProperty({ name : "clipLeft", type : QxConst.TYPEOF_NUMBER, impl : "clip" });
QxWidget.addProperty({ name : "clipTop", type : QxConst.TYPEOF_NUMBER, impl : "clip" });
QxWidget.addProperty({ name : "clipWidth", type : QxConst.TYPEOF_NUMBER, impl : "clip" });
QxWidget.addProperty({ name : "clipHeight", type : QxConst.TYPEOF_NUMBER, impl : "clip" });







/*
---------------------------------------------------------------------------
  MANAGMENT PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Set this to a positive value makes the widget able to get the focus.
  It even is reachable through the usage of the tab-key.

  Widgets with the same tabIndex are handled through there position
  in the document.
*/
QxWidget.addProperty({ name : "tabIndex", type : QxConst.TYPEOF_NUMBER, defaultValue : -1 });

/*!
  If the focus outline should be hidden.
*/
QxWidget.addProperty({ name : "hideFocus", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Use DOM focussing (focus() and blur() methods of DOM nodes)
*/
QxWidget.addProperty({ name : "enableElementFocus", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Handle focus state of this widget.

  someWidget.setFocused(true) set the current focus to this widget.
  someWidget.setFocused(false) remove the current focus and leave it blank.

  Normally you didn't need to set this directly.
*/
QxWidget.addProperty({ name : "focused", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Toggle the possibility to select the element of this widget.
*/
QxWidget.addProperty({ name : "selectable", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true, getAlias : "isSelectable" });

/*!
  Contains the tooltip object connected to the widget.
*/
QxWidget.addProperty({ name : "toolTip", type : QxConst.TYPEOF_OBJECT, instance : "QxToolTip" });

/*!
  Contains the context menu object connected to the widget. (Need real implementation)
*/
QxWidget.addProperty({ name : "contextMenu", type : QxConst.TYPEOF_OBJECT, instance : "QxMenu" });

/*!
  Capture all events and map them to this widget
*/
QxWidget.addProperty({ name : "capture", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Contains the support drop types for drag and drop support
*/
QxWidget.addProperty({ name : "dropDataTypes" });

/*!
  A command called if the widget should be excecuted (a placeholder for buttons, ...)
*/
QxWidget.addProperty({ name : "command", type : QxConst.TYPEOF_OBJECT, instance : "QxCommand" });

/*!
  Appearance of the widget
*/
QxWidget.addProperty({ name : "appearance", type : QxConst.TYPEOF_STRING });






/*
---------------------------------------------------------------------------
  MARGIN/PADDING PROPERTIES
---------------------------------------------------------------------------
*/

QxWidget.addProperty({ name : "marginTop", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "marginY" });
QxWidget.addProperty({ name : "marginRight", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "marginX" });
QxWidget.addProperty({ name : "marginBottom", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "marginY" });
QxWidget.addProperty({ name : "marginLeft", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "marginX" });

QxWidget.addProperty({ name : "paddingTop", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "paddingY" });
QxWidget.addProperty({ name : "paddingRight", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "paddingX" });
QxWidget.addProperty({ name : "paddingBottom", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "paddingY" });
QxWidget.addProperty({ name : "paddingLeft", type : QxConst.TYPEOF_NUMBER, addToQueue : true, impl : "paddingX" });







/*
---------------------------------------------------------------------------
  HORIZONAL DIMENSION PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The distance from the outer left border to the parent left area edge.

  You could only set two of the three horizonal dimension properties (boxLeft, boxRight, boxWidth)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "left", addToQueue : true, unitDetection : "pixelPercent" });

/*!
  The distance from the outer right border to the parent right area edge.

  You could only set two of the three horizonal dimension properties (boxLeft, boxRight, boxWidth)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "right", addToQueue : true, unitDetection : "pixelPercent" });

/*!
  The width of the box (including padding and border).

  You could only set two of the three horizonal dimension properties (boxLeft, boxRight, boxWidth)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "width", addToQueue : true, unitDetection : "pixelPercentAutoFlex" });

/*!
  The minimum width of the box (including padding and border).

  Set this to omit the shrinking of the box width under this value.
*/
QxWidget.addProperty({ name : "minWidth", addToQueue : true, unitDetection : "pixelPercentAuto" });

/*!
  The maximum width of the box (including padding and border).

  Set this to omit the expanding of the box width above this value.
*/
QxWidget.addProperty({ name : "maxWidth", addToQueue : true, unitDetection : "pixelPercentAuto" });







/*
---------------------------------------------------------------------------
  VERTICAL DIMENSION PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The distance from the outer top border to the parent top area edge.

  You could only set two of the three vertical dimension properties (boxTop, boxBottom, boxHeight)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "top", addToQueue : true, unitDetection : "pixelPercent" });

/*!
  The distance from the outer bottom border to the parent bottom area edge.

  You could only set two of the three vertical dimension properties (boxTop, boxBottom, boxHeight)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "bottom", addToQueue : true, unitDetection : "pixelPercent" });

/*!
  The height of the box (including padding and border).

  You could only set two of the three vertical dimension properties (boxTop, boxBottom, boxHeight)
  at the same time. This will be omitted during the setup of the new third value. To reset a value
  you didn't want anymore, set it to null.
*/
QxWidget.addProperty({ name : "height", addToQueue : true, unitDetection : "pixelPercentAutoFlex" });

/*!
  The minimum height of the box (including padding and border).

  Set this to omit the shrinking of the box height under this value.
*/
QxWidget.addProperty({ name : "minHeight", addToQueue : true, unitDetection : "pixelPercentAuto" });

/*!
  The maximum height of the box (including padding and border).

  Set this to omit the expanding of the box height above this value.
*/
QxWidget.addProperty({ name : "maxHeight", addToQueue : true, unitDetection : "pixelPercentAuto" });







/*
---------------------------------------------------------------------------
  PROPERTY GROUPS
---------------------------------------------------------------------------
*/

QxWidget.addPropertyGroup({ name : "location", members : [ "left", "top" ]});
QxWidget.addPropertyGroup({ name : "dimension", members : [ "width", "height" ]});

QxWidget.addPropertyGroup({ name : "space", members : [ "left", "width", "top", "height" ]});
QxWidget.addPropertyGroup({ name : "edge", members : [ "top", "right", "bottom", "left" ], mode : "shorthand" });

QxWidget.addPropertyGroup({ name : "padding", members : [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ], mode: "shorthand" });
QxWidget.addPropertyGroup({ name : "margin", members : [ "marginTop", "marginRight", "marginBottom", "marginLeft" ], mode: "shorthand" });

QxWidget.addPropertyGroup({ name : "heights", members : [ "minHeight", "height", "maxHeight" ]});
QxWidget.addPropertyGroup({ name : "widths", members : [ "minWidth", "width", "maxWidth" ]});

QxWidget.addPropertyGroup({ name : "align", members : [ "horizontalAlign", "verticalAlign" ]});
QxWidget.addPropertyGroup({ name : "stretch", members : [ "stretchX", "stretchY" ]});

QxWidget.addPropertyGroup({ name : "clipLocation", members : [ "clipLeft", "clipTop" ]});
QxWidget.addPropertyGroup({ name : "clipDimension", members : [ "clipWidth", "clipHeight" ]});
QxWidget.addPropertyGroup({ name : "clip", members : [ "clipLeft", "clipTop", "clipWidth", "clipHeight" ]});







/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

/*!
  If the widget is visible and rendered on the screen.
*/
proto.isMaterialized = function() {
  var el=this._element; return this._initialLayoutDone && this._isDisplayable && QxDom.getComputedStyleProperty(el, QxConst.PROPERTY_DISPLAY) != QxConst.CORE_NONE && QxDom.getComputedStyleProperty(el, QxConst.PROPERTY_VISIBILITY) != QxConst.CORE_HIDDEN && el.offsetWidth > 0 && el.offsetHeight > 0;
};

/*!
  A single setup to the current preferrd pixel values of the widget
*/
proto.pack = function()
{
  this.setWidth(this.getPreferredBoxWidth());
  this.setHeight(this.getPreferredBoxHeight());
};

/*!
  A bounded setup to the preferred width/height of the widget. Keeps in
  sync if the content or requirements of the widget changes
*/
proto.auto = function()
{
  this.setWidth(QxConst.CORE_AUTO);
  this.setHeight(QxConst.CORE_AUTO);
};





/*
---------------------------------------------------------------------------
  CHILDREN HANDLING: ALL
---------------------------------------------------------------------------
*/

/*!
  Get an array of the current children
*/
proto.getChildren = QxUtil.returnNull;

/*!
  Get the number of childrens
*/
proto.getChildrenLength = QxUtil.returnZero;

/*!
  Get if the widget has any children
*/
proto.hasChildren = QxUtil.returnFalse;

/*!
  Get if the widget has no children
*/
proto.isEmpty = QxUtil.returnTrue;

/*!
  Return the position of the child inside
*/
proto.indexOf = QxUtil.returnNegativeIndex;

/*!
  Test if this widget contains the given widget
*/
proto.contains = QxUtil.returnFalse;






/*
---------------------------------------------------------------------------
  CHILDREN HANDLING: VISIBLE ONES
---------------------------------------------------------------------------
*/

/*!
  Get an array of the current visible children
*/
proto.getVisibleChildren = QxUtil.returnNull;

/*!
  Get the number of childrens
*/
proto.getVisibleChildrenLength = QxUtil.returnZero;

/*!
  If this widget has visible children
*/
proto.hasVisibleChildren = QxUtil.returnFalse;

/*!
  Check if there are any visible childrens inside
*/
proto.isVisibleEmpty = QxUtil.returnTrue;





/*
---------------------------------------------------------------------------
  CORE MODIFIER
---------------------------------------------------------------------------
*/

proto._hasParent = false;
proto._isDisplayable = false;

proto.isDisplayable = function() {
  return this._isDisplayable;
};

proto._checkParent = function(propValue, propOldValue, propData)
{
  if (this.contains(propValue)) {
    throw new Error("Could not insert myself into a child " + propValue + "!");
  };

  return propValue;
};

proto._modifyParent = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    var vOldIndex = propOldValue.getChildren().indexOf(this);

    // Reset cached dimension and location values
    this._computedWidthValue = this._computedMinWidthValue = this._computedMaxWidthValue = this._computedLeftValue = this._computedRightValue = null;
    this._computedHeightValue = this._computedMinHeightValue = this._computedMaxHeightValue = this._computedTopValue = this._computedBottomValue = null;

    this._cachedBoxWidth = this._cachedInnerWidth = this._cachedOuterWidth = null;
    this._cachedBoxHeight = this._cachedInnerHeight = this._cachedOuterHeight = null;

    // Finally remove from children array
    propOldValue.getChildren().removeAt(vOldIndex);

    // Invalidate visible children cache
    propOldValue._invalidateVisibleChildren();

    // Remove child from old parents children queue
    propOldValue._removeChildFromChildrenQueue(this);

    // The the layouter add some layout jobs
    propOldValue.getLayoutImpl().updateChildrenOnRemoveChild(this, vOldIndex);

    // Inform job queue
    propOldValue.addToJobQueue(QxConst.JOB_REMOVECHILD);

    // Invalidate inner preferred dimensions
    propOldValue._invalidatePreferredInnerDimensions();

    // Store old parent (needed later by _handleDisplayable)
    this._oldParent = propOldValue;
  };

  if (propValue)
  {
    this._hasParent = true;

    if (QxUtil.isValidNumber(this._insertIndex))
    {
      propValue.getChildren().insertAt(this, this._insertIndex);
      delete this._insertIndex;
    }
    else
    {
      propValue.getChildren().push(this);
    };
  }
  else
  {
    this._hasParent = false;
  };

  return this._handleDisplayable(QxConst.PROPERTY_PARENT);
};

proto._modifyDisplay = function(propValue, propOldValue, propData) {
  return this._handleDisplayable(QxConst.PROPERTY_DISPLAY);
};







/*
---------------------------------------------------------------------------
  DISPLAYBLE HANDLING
---------------------------------------------------------------------------
*/

proto._handleDisplayable = function(vHint)
{
  // Detect for changes. Return if there is not change.
  // Also handle the case if the displayable keeps true and the parent
  // was changed then we must not return here.
  var vDisplayable = this._computeDisplayable();
  if (this._isDisplayable == vDisplayable && !(vDisplayable && vHint == QxConst.PROPERTY_PARENT)) {
    return true;
  };

  this._isDisplayable = vDisplayable;

  var vParent = this.getParent();

  // Invalidate visible children
  if (vParent)
  {
    vParent._invalidateVisibleChildren();
    vParent._invalidatePreferredInnerDimensions();
  };

  if (vHint && this._oldParent && this._oldParent._initialLayoutDone)
  {
    if (this.getVisibility()) {
      this._beforeDisappear();
    };

    this._beforeRemoveDom();

    this._oldParent._getTargetNode().removeChild(this.getElement());

    this._afterRemoveDom();

    if (this.getVisibility()) {
      this._afterDisappear();
    };

    delete this._oldParent;
  };

  // Handle 'show'
  if (vDisplayable)
  {
    /* --------------------------------
       Update current parent
    -------------------------------- */

    // The the layouter add some layout jobs
    if (vParent._initialLayoutDone)
    {
      vParent.getLayoutImpl().updateChildrenOnAddChild(this, vParent.getChildren().indexOf(this));

      // Inform parents job queue
      vParent.addToJobQueue(QxConst.JOB_ADDCHILD);
    };

    // Add to parents children queue
    // (indirectly with a new layout request)
    this.addToLayoutChanges(QxConst.JOB_INITIAL);

    // Add to custom queues
    this.addToCustomQueues(vHint);



    // Handle beforeAppear signals
    if (this.getVisibility()) {
      this._beforeAppear();
    };



    /* --------------------------------
       Add to global Queues
    -------------------------------- */

    // Add element (and create if not ready)
    if (!this._isCreated) {
      QxWidget.addToGlobalElementQueue(this);
    };

    // Add to global queues
    QxWidget.addToGlobalStateQueue(this);

    if (!QxUtil.isObjectEmpty(this._jobQueue)) {
      QxWidget.addToGlobalJobQueue(this);
    };

    if (!QxUtil.isObjectEmpty(this._childrenQueue)) {
      QxWidget.addToGlobalLayoutQueue(this);
    };
  }

  // Handle 'hide'
  else
  {
    // Removing from global queues
    QxWidget.removeFromGlobalElementQueue(this);
    QxWidget.removeFromGlobalStateQueue(this);
    QxWidget.removeFromGlobalJobQueue(this);
    QxWidget.removeFromGlobalLayoutQueue(this);

    // Add to top-level tree queue
    this.removeFromCustomQueues(vHint);

    // only remove when itself want to be removed
    // through a property change - not a parent signal
    if (vParent && vHint)
    {
      if (this.getVisibility()) {
        this._beforeDisappear();
      };

      // The the layouter add some layout jobs
      if (vParent._initialLayoutDone && this._initialLayoutDone)
      {
        vParent.getLayoutImpl().updateChildrenOnRemoveChild(this, vParent.getChildren().indexOf(this));

        // Inform parents job queue
        vParent.addToJobQueue(QxConst.JOB_REMOVECHILD);

        // Before Remove DOM Event
        this._beforeRemoveDom();

        // DOM action
        vParent._getTargetNode().removeChild(this.getElement());

        // After Remove DOM Event
        this._afterRemoveDom();
      };

      // Remove from parents children queue
      vParent._removeChildFromChildrenQueue(this);

      if (this.getVisibility()) {
        this._afterDisappear();
      };
    };
  };

  this._handleDisplayableCustom(vDisplayable, vParent, vHint);

  return true;
};

proto.addToCustomQueues = QxUtil.returnTrue;
proto.removeFromCustomQueues = QxUtil.returnTrue;

proto._handleDisplayableCustom = QxUtil.returnTrue;

proto._computeDisplayable = function() {
  return this.getDisplay() && this._hasParent && this.getParent()._isDisplayable ? true : false;
};

proto._beforeAppear = function()
{
  // this.debug("_beforeAppear");
  this.createDispatchEvent(QxConst.EVENT_TYPE_BEFORERAPPEAR);
};

proto._afterAppear = function()
{
  // this.debug("_afterAppear");
  this._isSeeable = true;
  this.createDispatchEvent(QxConst.EVENT_TYPE_APPEAR);
};

proto._beforeDisappear = function()
{
  // this.debug("_beforeDisappear");

  // Remove any hover/pressed styles
  this.removeState(QxConst.STATE_OVER);
  this.removeState(QxConst.STATE_PRESSED);
  this.removeState(QxConst.STATE_ABANDONED);

  // this.debug("_beforeDisappear");
  this.createDispatchEvent(QxConst.EVENT_TYPE_BEFORERDISAPPEAR);
};

proto._afterDisappear = function()
{
  // this.debug("_afterDisappear");
  this._isSeeable = false;
  this.createDispatchEvent(QxConst.EVENT_TYPE_DISAPPEAR);
};

proto._isSeeable = false;

/*!
  If the widget is currently seeable
  which means that it:
   - has a also seeable parent
   - visibility is true
   - display is true
*/
proto.isSeeable = function() {
  return this._isSeeable;
};

proto.isAppearRelevant = function() {
  return this.getVisibility() && this._isDisplayable;
};





/*
---------------------------------------------------------------------------
  DOM SIGNAL HANDLING
---------------------------------------------------------------------------
*/

proto._beforeInsertDom = function()
{
  // this.debug("_beforeInsertDom");
  this.createDispatchEvent(QxConst.EVENT_TYPE_BEFOREINSERTDOM);
};

proto._afterInsertDom = function()
{
  // this.debug("_afterInsertDom");
  this.createDispatchEvent(QxConst.EVENT_TYPE_INSERTDOM);
};

proto._beforeRemoveDom = function()
{
  // this.debug("_beforeRemoveDom");
  this.createDispatchEvent(QxConst.EVENT_TYPE_BEFOREREMOVEDOM);
};

proto._afterRemoveDom = function()
{
  // this.debug("_afterRemoveDom");
  this.createDispatchEvent(QxConst.EVENT_TYPE_REMOVEDOM);
};






/*
---------------------------------------------------------------------------
  VISIBILITY HANDLING
---------------------------------------------------------------------------
*/

proto._modifyVisibility = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    if (this._isDisplayable) {
      this._beforeAppear();
    };

    this.removeStyleProperty(QxConst.PROPERTY_DISPLAY);

    if (this._isDisplayable) {
      this._afterAppear();
    };
  }
  else
  {
    if (this._isDisplayable) {
      this._beforeDisappear();
    };

    this.setStyleProperty(QxConst.PROPERTY_DISPLAY, QxConst.CORE_NONE);

    if (this._isDisplayable) {
      this._afterDisappear();
    };
  };

  return true;
};

proto.show = function()
{
  this.setVisibility(true);
  this.setDisplay(true);
};

proto.hide = function() {
  this.setVisibility(false);
};

proto.connect = function() {
  this.setDisplay(true);
};

proto.disconnect = function() {
  this.setDisplay(false);
};





/*
---------------------------------------------------------------------------
  ENHANCED BORDER SUPPORT
---------------------------------------------------------------------------
*/

if (QxClient.isGecko())
{
  proto._createElementForEnhancedBorder = QxUtil.returnTrue;
}
else
{
  proto._createElementForEnhancedBorder = function()
  {
    // Enhanced Border Test (for IE and Opera)
    if (QxBorder.enhancedCrossBrowserMode && this.getTagName() == QxConst.CORE_DIV && !this._borderElement)
    {
      var el = this.getElement();
      var cl = this._borderElement = document.createElement(QxConst.CORE_DIV);

      var es = el.style;
      var cs = this._borderStyle = cl.style;

      cs.width = cs.height = QxConst.CORE_HUNDREDPERCENT;
      cs.position = QxConst.CORE_ABSOLUTE;

      for (var i in this._styleProperties)
      {
        switch(i)
        {
          case QxConst.PROPERTY_POSITION:
          case QxConst.PROPERTY_ZINDEX:
          case QxConst.PROPERTY_FILTER:
          case QxConst.PROPERTY_DISPLAY:
            break;

          default:
            cs[i] = this._styleProperties[i];
            es[i] = QxConst.CORE_EMPTY;
        };
      };

      // Move existing childs
      while(el.firstChild) {
        cl.appendChild(el.firstChild);
      };

      el.appendChild(cl);
    };
  };
};







/*
---------------------------------------------------------------------------
  DOM ELEMENT HANDLING
---------------------------------------------------------------------------
*/

proto._isCreated = false;

if (QxClient.isGecko())
{
  proto._getTargetNode = function() {
    return this._element;
  };
}
else
{
  proto._getTargetNode = function() {
    return this._borderElement || this._element;
  };
};

/*!
  Check if the widget is created (or the element is already available).
*/
proto.isCreated = function() {
  return this._isCreated;
};

/*!
  Create widget with empty element (of specified tagname).
*/
proto._createElementImpl = function() {
  this.setElement(this.getTopLevelWidget().getDocumentElement().createElement(this.getTagName()));
};

proto._modifyElement = function(propValue, propOldValue, propData)
{
  this._isCreated = QxUtil.isValidElement(propValue);

  if (propOldValue)
  {
    // reset reference to widget instance
    propOldValue._QxWidget = null;

    // remove events
    this._removeInlineEvents(propOldValue);
  };

  if (propValue)
  {
    // add reference to widget instance
    propValue._QxWidget = this;

    // link element and style reference
    this._element = propValue;
    this._style = propValue.style;

    this._applyStyleProperties(propValue);
    this._applyHtmlProperties(propValue);
    this._applyHtmlAttributes(propValue);
    this._applyElementData(propValue);

    // attach inline events
    this._addInlineEvents(propValue);

    // send out create event
    this.createDispatchEvent(QxConst.EVENT_TYPE_CREATE);
  }
  else
  {
    this._element = this._style = null;
  };

  return true;
};







/*
---------------------------------------------------------------------------
  JOBS QUEUE
---------------------------------------------------------------------------
*/

proto.addToJobQueue = function(p)
{
  if (this._hasParent) {
    QxWidget.addToGlobalJobQueue(this);
  };

  if (!this._jobQueue) {
    this._jobQueue = {};
  };

  this._jobQueue[p] = true;
  return true;
};

proto._flushJobQueue = function(q)
{
  /* --------------------------------------------------------------------------------
       1. Pre checks
  -------------------------------------------------------------------------------- */

  try
  {
    var vQueue = this._jobQueue;
    var vParent = this.getParent();

    if (!vParent || QxUtil.isObjectEmpty(vQueue)) {
      return;
    };

    var vLayoutImpl = this instanceof QxParent ? this.getLayoutImpl() : null;

    if (vLayoutImpl) {
      vLayoutImpl.updateSelfOnJobQueueFlush(vQueue);
    };
  }
  catch(ex)
  {
    this.error("Flushing job queue (prechecks#1) failed: "  + ex, "_flushJobQueue");
  };





  /* --------------------------------------------------------------------------------
       2. Recompute dimensions
  -------------------------------------------------------------------------------- */

  try
  {
    var vFlushParentJobQueue = false;
    var vRecomputeOuterWidth = vQueue.marginLeft || vQueue.marginRight;
    var vRecomputeOuterHeight = vQueue.marginTop || vQueue.marginBottom;
    var vRecomputeInnerWidth = vQueue.frameWidth;
    var vRecomputeInnerHeight = vQueue.frameHeight;
    var vRecomputeParentPreferredInnerWidth = (vQueue.frameWidth || vQueue.preferredInnerWidth) && this._recomputePreferredBoxWidth();
    var vRecomputeParentPreferredInnerHeight = (vQueue.frameHeight || vQueue.preferredInnerHeight) && this._recomputePreferredBoxHeight();

    if (vRecomputeParentPreferredInnerWidth)
    {
      var vPref = this.getPreferredBoxWidth();

      if (this._computedWidthTypeAuto)
      {
        this._computedWidthValue = vPref;
        vQueue.width = true;
      };

      if (this._computedMinWidthTypeAuto)
      {
        this._computedMinWidthValue = vPref;
        vQueue.minWidth = true;
      };

      if (this._computedMaxWidthTypeAuto)
      {
        this._computedMaxWidthValue = vPref;
        vQueue.maxWidth = true;
      };
    };

    if (vRecomputeParentPreferredInnerHeight)
    {
      var vPref = this.getPreferredBoxHeight();

      if (this._computedHeightTypeAuto)
      {
        this._computedHeightValue = vPref;
        vQueue.height = true;
      };

      if (this._computedMinHeightTypeAuto)
      {
        this._computedMinHeightValue = vPref;
        vQueue.minHeight = true;
      };

      if (this._computedMaxHeightTypeAuto)
      {
        this._computedMaxHeightValue = vPref;
        vQueue.maxHeight = true;
      };
    };

    if ((vQueue.width || vQueue.minWidth || vQueue.maxWidth || vQueue.left || vQueue.right) && this._recomputeBoxWidth()) {
      vRecomputeOuterWidth = vRecomputeInnerWidth = true;
    };

    if ((vQueue.height || vQueue.minHeight || vQueue.maxHeight || vQueue.top || vQueue.bottom) && this._recomputeBoxHeight()) {
      vRecomputeOuterHeight = vRecomputeInnerHeight = true;
    };
  }
  catch(ex)
  {
    this.error("Flushing job queue (recompute#2) failed: "  + ex, "_flushJobQueue");
  };





  /* --------------------------------------------------------------------------------
       3. Signals to parent widgets
  -------------------------------------------------------------------------------- */

  try
  {
    if ((vRecomputeOuterWidth && this._recomputeOuterWidth()) || vRecomputeParentPreferredInnerWidth)
    {
      vParent._invalidatePreferredInnerWidth();
      vParent.getLayoutImpl().updateSelfOnChildOuterWidthChange(this);

      vFlushParentJobQueue = true;
    };

    if ((vRecomputeOuterHeight && this._recomputeOuterHeight()) || vRecomputeParentPreferredInnerHeight)
    {
      vParent._invalidatePreferredInnerHeight();
      vParent.getLayoutImpl().updateSelfOnChildOuterHeightChange(this);

      vFlushParentJobQueue = true;
    };

    if (vFlushParentJobQueue) {
      vParent._flushJobQueue();
    };
  }
  catch(ex)
  {
    this.error("Flushing job queue (parentsignals#3) failed: "  + ex, "_flushJobQueue");
  };





  /* --------------------------------------------------------------------------------
       4. Add layout jobs
  -------------------------------------------------------------------------------- */

  try
  {
    // add to layout queue
    vParent._addChildToChildrenQueue(this);

    // convert jobs to layout jobs
    for (var i in vQueue) {
      this._layoutChanges[i] = true;
    };
  }
  catch(ex)
  {
    this.error("Flushing job queue (addjobs#4) failed: "  + ex, "_flushJobQueue");
  };





  /* --------------------------------------------------------------------------------
       5. Signals to children
  -------------------------------------------------------------------------------- */

  try
  {
    // inform children about padding change
    if (this instanceof QxParent && (vQueue.paddingLeft || vQueue.paddingRight || vQueue.paddingTop || vQueue.paddingBottom))
    {
      var ch=this.getChildren(), chl=ch.length;

      if (vQueue.paddingLeft) {
        for (var i=0; i<chl; i++) {
          ch[i].addToLayoutChanges(QxConst.PROPERTY_PARENT_PADDINGLEFT);
        };
      };

      if (vQueue.paddingRight) {
        for (var i=0; i<chl; i++) {
          ch[i].addToLayoutChanges(QxConst.PROPERTY_PARENT_PADDINGRIGHT);
        };
      };

      if (vQueue.paddingTop) {
        for (var i=0; i<chl; i++) {
          ch[i].addToLayoutChanges(QxConst.PROPERTY_PARENT_PADDINGTOP);
        };
      };

      if (vQueue.paddingBottom) {
        for (var i=0; i<chl; i++) {
          ch[i].addToLayoutChanges(QxConst.PROPERTY_PARENT_PADDINGBOTTOM);
        };
      };
    };

    if (vRecomputeInnerWidth) {
      this._recomputeInnerWidth();
    };

    if (vRecomputeInnerHeight) {
      this._recomputeInnerHeight();
    };

    if (this._initialLayoutDone)
    {
      if (vLayoutImpl) {
        vLayoutImpl.updateChildrenOnJobQueueFlush(vQueue);
      };
    };
  }
  catch(ex)
  {
    this.error("Flushing job queue (childrensignals#5) failed: "  + ex, "_flushJobQueue");
  };



  /* --------------------------------------------------------------------------------
       5. Cleanup
  -------------------------------------------------------------------------------- */

  delete this._jobQueue;
};





/*
---------------------------------------------------------------------------
  METHODS TO GIVE THE LAYOUTERS INFORMATIONS
---------------------------------------------------------------------------
*/

proto._isWidthEssential = QxUtil.returnTrue;
proto._isHeightEssential = QxUtil.returnTrue;







/*
---------------------------------------------------------------------------
  APPLY LAYOUT STYLES
---------------------------------------------------------------------------
*/

QxWidget.initApplyMethods = function()
{
  var f="_applyRuntime", r="_resetRuntime", s="this._style.", e="=QxConst.CORE_EMPTY", v="=v+QxConst.CORE_PIXEL", vpar="v";

  var props = ["left", "right", "top", "bottom", "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight"];
  var propsup = ["Left", "Right", "Top", "Bottom", "Width", "Height", "MinWidth", "MaxWidth", "MinHeight", "MaxHeight"];

  for (var i=0, fn=f+"Margin", rn=r+"Margin", sp=s+"margin"; i<4; i++)
  {
    proto[fn+propsup[i]] = new Function(vpar, sp + propsup[i] + v);
    proto[rn+propsup[i]] = new Function(sp + propsup[i] + e);
  };

  var pad = "padding", upad = "Padding";

  if (QxClient.isGecko())
  {
    for (var i=0, fn=f+upad, rn=r+upad, sp=s+pad; i<4; i++)
    {
      proto[fn+propsup[i]] = new Function(vpar, sp + propsup[i] + v);
      proto[rn+propsup[i]] = new Function(sp + propsup[i] + e);
    };
  }
  else
  {
    // need to use setStyleProperty to keep compatibility with enhanced cross browser borders
    var s1="this.setStyleProperty('padding";
    var s2="', v+'px')";
    var s3="this.removeStyleProperty('padding";
    var s4="')";

    for (var i=0, fn=f+upad, rn=r+upad, sp=s+pad; i<4; i++)
    {
      proto[fn+propsup[i]] = new Function(vpar, s1 + propsup[i] + s2);
      proto[rn+propsup[i]] = new Function(s3 + propsup[i] + s4);
    };
  };

  /*
    Use optimized method for internet explorer
    to omit string concat and directly setup
    the new layout property.

    We could not use this to reset the value however.
    It seems that is just not work this way. And the
    left/top get always priority. Tried: "", null, QxConst.CORE_AUTO
    Nothing helps.

    Now I'am switched back to conventional method
    to reset the value. This seems to work again.
  */
  if (QxClient.isMshtml())
  {
    for (var i=0, tpos="pos", vset="=v"; i<6; i++)
    {
      // to debug the values which will be applied use this instead the first line
      // proto[f+propsup[i]] = new Function(vpar, "this.debug('v: ' + v); " + s + tpos + propsup[i] + vset);

      proto[f+propsup[i]] = new Function(vpar, s + tpos + propsup[i] + vset);
      proto[r+propsup[i]] = new Function(s + props[i] + e);
    };
  }
  else
  {
    for (var i=0; i<10; i++)
    {
      // to debug the values which will be applied use this instead the first line
      // proto[f+propsup[i]] = new Function(vpar, "this.debug('v: ' + v); " + s + props[i] + v);

      proto[f+propsup[i]] = new Function(vpar, s + props[i] + v);
      proto[r+propsup[i]] = new Function(s + props[i] + e);
    };
  };
};

QxWidget.initApplyMethods();






/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

/*
  Add basic setter/getters
*/

QxWidget.addCachedProperty({ name : "innerWidth", defaultValue : null });
QxWidget.addCachedProperty({ name : "innerHeight", defaultValue : null });
QxWidget.addCachedProperty({ name : "boxWidth", defaultValue : null });
QxWidget.addCachedProperty({ name : "boxHeight", defaultValue : null });
QxWidget.addCachedProperty({ name : "outerWidth", defaultValue : null });
QxWidget.addCachedProperty({ name : "outerHeight", defaultValue : null });

proto._computeBoxWidthFallback = function() {
  return 0;
};

proto._computeBoxHeightFallback = function() {
  return 0;
};

proto._computeBoxWidth = function() {
  return Math.max(0, this.getParent().getLayoutImpl().computeChildBoxWidth(this).limit(this.getMinWidthValue(), this.getMaxWidthValue()));
};

proto._computeBoxHeight = function() {
  return Math.max(0, this.getParent().getLayoutImpl().computeChildBoxHeight(this).limit(this.getMinHeightValue(), this.getMaxHeightValue()));
};

proto._computeOuterWidth = function() {
  return Math.max(0, this.getMarginLeft() + this.getBoxWidth() + this.getMarginRight());
};

proto._computeOuterHeight = function() {
  return Math.max(0, this.getMarginTop() + this.getBoxHeight() + this.getMarginBottom());
};

proto._computeInnerWidth = function() {
  return Math.max(0, this.getBoxWidth() - this.getFrameWidth());
};

proto._computeInnerHeight = function() {
  return Math.max(0, this.getBoxHeight() - this.getFrameHeight());
};

proto.getNeededWidth = function() {
  return Math.max(0, this.getParent().getLayoutImpl().computeChildNeededWidth(this));
};

proto.getNeededHeight = function() {
  return Math.max(0, this.getParent().getLayoutImpl().computeChildNeededHeight(this));
};







/*
---------------------------------------------------------------------------
  RECOMPUTE FLEX VALUES
---------------------------------------------------------------------------
*/

proto._recomputeFlexX = function()
{
  if (!this.getHasFlexX()) {
    return false;
  };

  if (this._computedWidthTypeFlex)
  {
    this._computedWidthValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_WIDTH);
  };

  return true;
};

proto._recomputeFlexY = function()
{
  if (!this.getHasFlexY()) {
    return false;
  };

  if (this._computedHeightTypeFlex)
  {
    this._computedHeightValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_HEIGHT);
  };

  return true;
};







/*
---------------------------------------------------------------------------
  RECOMPUTE PERCENTS
---------------------------------------------------------------------------
*/

proto._recomputePercentX = function()
{
  if (!this.getHasPercentX()) {
    return false;
  };

  if (this._computedWidthTypePercent)
  {
    this._computedWidthValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_WIDTH);
  };

  if (this._computedMinWidthTypePercent)
  {
    this._computedMinWidthValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_MINWIDTH);
  };

  if (this._computedMaxWidthTypePercent)
  {
    this._computedMaxWidthValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_MAXWIDTH);
  };

  if (this._computedLeftTypePercent)
  {
    this._computedLeftValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_LEFT);
  };

  if (this._computedRightTypePercent)
  {
    this._computedRightValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_RIGHT);
  };

  return true;
};

proto._recomputePercentY = function()
{
  if (!this.getHasPercentY()) {
    return false;
  };

  if (this._computedHeightTypePercent)
  {
    this._computedHeightValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_HEIGHT);
  };

  if (this._computedMinHeightTypePercent)
  {
    this._computedMinHeightValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_MINHEIGHT);
  };

  if (this._computedMaxHeightTypePercent)
  {
    this._computedMaxHeightValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_MAXHEIGHT);
  };

  if (this._computedTopTypePercent)
  {
    this._computedTopValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_TOP);
  };

  if (this._computedBottomTypePercent)
  {
    this._computedBottomValue = null;
    this.addToLayoutChanges(QxConst.PROPERTY_BOTTOM);
  };

  return true;
};







/*
---------------------------------------------------------------------------
  RECOMPUTE RANGES
---------------------------------------------------------------------------
*/

if (QxClient.isMshtml() || QxClient.isOpera())
{
  proto._recomputeRangeX = function()
  {
    if (this._computedLeftTypeNull || this._computedRightTypeNull) {
      return false;
    };

    this.addToLayoutChanges(QxConst.PROPERTY_WIDTH);
    return true;
  };

  proto._recomputeRangeY = function()
  {
    if (this._computedTopTypeNull || this._computedBottomTypeNull) {
      return false;
    };

    this.addToLayoutChanges(QxConst.PROPERTY_HEIGHT);
    return true;
  };
}
else
{
  proto._recomputeRangeX = function() {
    return !(this._computedLeftTypeNull || this._computedRightTypeNull);
  };

  proto._recomputeRangeY = function() {
    return !(this._computedTopTypeNull || this._computedBottomTypeNull);
  };
};






/*
---------------------------------------------------------------------------
  RECOMPUTE STRETCHING
---------------------------------------------------------------------------
*/

if (QxClient.isMshtml() || QxClient.isOpera())
{
  proto._recomputeStretchingX = function()
  {
    if (this.getAllowStretchX() && this._computedWidthTypeNull)
    {
      this._computedWidthValue = null;
      this.addToLayoutChanges(QxConst.PROPERTY_WIDTH);

      return true;
    };

    return false;
  };

  proto._recomputeStretchingY = function()
  {
    if (this.getAllowStretchY() && this._computedHeightTypeNull)
    {
      this._computedHeightValue = null;
      this.addToLayoutChanges(QxConst.PROPERTY_HEIGHT);

      return true;
    };

    return false;
  };
}
else
{
  proto._recomputeStretchingX = function()
  {
    if (this.getAllowStretchX() && this._computedWidthTypeNull) {
      return true;
    };

    return false;
  };

  proto._recomputeStretchingY = function()
  {
    if (this.getAllowStretchY() && this._computedHeightTypeNull) {
      return true;
    };

    return false;
  };
};






/*
---------------------------------------------------------------------------
  INTELLIGENT GETTERS FOR STANDALONE DIMENSIONS: HELPERS
---------------------------------------------------------------------------
*/

proto._computeValuePixel = function(v) {
  return Math.round(v);
};

proto._computeValuePixelLimit = function(v) {
  return Math.max(0, this._computeValuePixel(v));
};

proto._computeValuePercentX = function(v) {
  return Math.round(this.getParent().getInnerWidthForChild(this) * v * 0.01);
};

proto._computeValuePercentXLimit = function(v) {
  return Math.max(0, this._computeValuePercentX(v));
};

proto._computeValuePercentY = function(v) {
  return Math.round(this.getParent().getInnerHeightForChild(this) * v * 0.01);
};

proto._computeValuePercentYLimit = function(v) {
  return Math.max(0, this._computeValuePercentY(v));
};





/*
---------------------------------------------------------------------------
  INTELLIGENT GETTERS FOR STANDALONE DIMENSIONS: X-AXIS
---------------------------------------------------------------------------
*/

proto.getWidthValue = function()
{
  if (this._computedWidthValue != null) {
    return this._computedWidthValue;
  };

  switch(this._computedWidthType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedWidthValue = this._computeValuePixelLimit(this._computedWidthParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedWidthValue = this._computeValuePercentXLimit(this._computedWidthParsed);

    case QxWidget.TYPE_AUTO:
      return this._computedWidthValue = this.getPreferredBoxWidth();

    case QxWidget.TYPE_FLEX:
      this.getParent().getLayoutImpl().computeChildrenFlexWidth();
      return this._computedWidthValue = this._computedWidthFlexValue;
  };

  return null;
};

proto.getMinWidthValue = function()
{
  if (this._computedMinWidthValue != null) {
    return this._computedMinWidthValue;
  };

  switch(this._computedMinWidthType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedWidthValue = this._computeValuePixelLimit(this._computedMinWidthParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedWidthValue = this._computeValuePercentXLimit(this._computedMinWidthParsed);

    case QxWidget.TYPE_AUTO:
      return this._computedMinWidthValue = this.getPreferredBoxWidth();
  };

  return null;
};

proto.getMaxWidthValue = function()
{
  if (this._computedMaxWidthValue != null) {
    return this._computedMaxWidthValue;
  };

  switch(this._computedMaxWidthType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedWidthValue = this._computeValuePixelLimit(this._computedMaxWidthParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedWidthValue = this._computeValuePercentXLimit(this._computedMaxWidthParsed);

    case QxWidget.TYPE_AUTO:
      return this._computedMaxWidthValue = this.getPreferredBoxWidth();
  };

  return null;
};

proto.getLeftValue = function()
{
  if (this._computedLeftValue != null) {
    return this._computedLeftValue;
  };

  switch(this._computedLeftType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedLeftValue = this._computeValuePixel(this._computedLeftParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedLeftValue = this._computeValuePercentX(this._computedLeftParsed);
  };

  return null;
};

proto.getRightValue = function()
{
  if (this._computedRightValue != null) {
    return this._computedRightValue;
  };

  switch(this._computedRightType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedRightValue = this._computeValuePixel(this._computedRightParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedRightValue = this._computeValuePercentX(this._computedRightParsed);
  };

  return null;
};







/*
---------------------------------------------------------------------------
  INTELLIGENT GETTERS FOR STANDALONE DIMENSIONS: Y-AXIS
---------------------------------------------------------------------------
*/

proto.getHeightValue = function()
{
  if (this._computedHeightValue != null) {
    return this._computedHeightValue;
  };

  switch(this._computedHeightType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedHeightValue = this._computeValuePixelLimit(this._computedHeightParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedHeightValue = this._computeValuePercentYLimit(this._computedHeightParsed);

    case QxWidget.TYPE_AUTO:
      return this._computedHeightValue = this.getPreferredBoxHeight();

    case QxWidget.TYPE_FLEX:
      this.getParent().getLayoutImpl().computeChildrenFlexHeight();
      return this._computedHeightValue = this._computedHeightFlexValue;
  };

  return null;
};

proto.getMinHeightValue = function()
{
  if (this._computedMinHeightValue != null) {
    return this._computedMinHeightValue;
  };

  switch(this._computedMinHeightType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedMinHeightValue = this._computeValuePixelLimit(this._computedMinHeightParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedMinHeightValue = this._computeValuePercentYLimit(this._computedMinHeightParsed);

    case QxWidget.TYPE_AUTO:
      return this._computedMinHeightValue = this.getPreferredBoxHeight();
  };

  return null;
};

proto.getMaxHeightValue = function()
{
  if (this._computedMaxHeightValue != null) {
    return this._computedMaxHeightValue;
  };

  switch(this._computedMaxHeightType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedMaxHeightValue = this._computeValuePixelLimit(this._computedMaxHeightParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedMaxHeightValue = this._computeValuePercentYLimit(this._computedMaxHeightParsed);

    case QxWidget.TYPE_AUTO:
      return this._computedMaxHeightValue = this.getPreferredBoxHeight();
  };

  return null;
};

proto.getTopValue = function()
{
  if (this._computedTopValue != null) {
    return this._computedTopValue;
  };

  switch(this._computedTopType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedTopValue = this._computeValuePixel(this._computedTopParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedTopValue = this._computeValuePercentY(this._computedTopParsed);
  };

  return null;
};

proto.getBottomValue = function()
{
  if (this._computedBottomValue != null) {
    return this._computedBottomValue;
  };

  switch(this._computedBottomType)
  {
    case QxWidget.TYPE_PIXEL:
      return this._computedBottomValue = this._computeValuePixel(this._computedBottomParsed);

    case QxWidget.TYPE_PERCENT:
      return this._computedBottomValue = this._computeValuePercentY(this._computedBottomParsed);
  };

  return null;
};









/*
---------------------------------------------------------------------------
  FRAME DIMENSIONS
---------------------------------------------------------------------------
*/

QxWidget.addCachedProperty({ name : QxConst.JOB_FRAMEWIDTH, defaultValue : null, addToQueueRuntime : true });
QxWidget.addCachedProperty({ name : QxConst.JOB_FRAMEHEIGHT, defaultValue : null, addToQueueRuntime : true });

proto._computeFrameWidth = function()
{
  var fw = this._cachedBorderLeft + this.getPaddingLeft() + this.getPaddingRight() + this._cachedBorderRight;

  switch(this.getOverflow())
  {
    case QxWidget.SCROLL_VALUE_SCROLL:
    case QxWidget.SCROLL_VALUE_SCROLLY:
      fw += QxWidget.SCROLLBAR_SIZE;
      break;

    case QxWidget.SCROLL_VALUE_AUTO:
      // This seems to be really hard to implement
      // this.debug("Check Auto Scroll-X: " + this.getPreferredBoxHeight() + " :: " + this.getBoxHeight());
      break;
  };

  return fw;
};

proto._computeFrameHeight = function()
{
  var fh = this._cachedBorderTop + this.getPaddingTop() + this.getPaddingBottom() + this._cachedBorderBottom;

  switch(this.getOverflow())
  {
    case QxWidget.SCROLL_VALUE_SCROLL:
    case QxWidget.SCROLL_VALUE_SCROLLX:
      fh += QxWidget.SCROLLBAR_SIZE;
      break;

    case QxWidget.SCROLL_VALUE_AUTO:
      // This seems to be really hard to implement
      // this.debug("Check Auto Scroll-Y: " + this.getPreferredBoxWidth() + " :: " + this.getBoxWidth());
      break;
  };

  return fh;
};

proto._invalidateFrameDimensions = function()
{
  this._invalidateFrameWidth();
  this._invalidateFrameHeight();
};







/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS: INNER
---------------------------------------------------------------------------
*/

QxWidget.addCachedProperty({ name : QxConst.JOB_PREFERREDINNERWIDTH, defaultValue : null, addToQueueRuntime : true });
QxWidget.addCachedProperty({ name : QxConst.JOB_PREFERREDINNERHEIGHT, defaultValue : null, addToQueueRuntime : true });

proto._invalidatePreferredInnerDimensions = function()
{
  this._invalidatePreferredInnerWidth();
  this._invalidatePreferredInnerHeight();
};







/*
---------------------------------------------------------------------------
  PREFERRED DIMENSIONS: BOX
---------------------------------------------------------------------------
*/

QxWidget.addCachedProperty({ name : "preferredBoxWidth", defaultValue : null });
QxWidget.addCachedProperty({ name : "preferredBoxHeight", defaultValue : null });

proto._computePreferredBoxWidth = function()
{
  try {
    return Math.max(0, this.getPreferredInnerWidth() + this.getFrameWidth());
  } catch(ex) {
    this.error(ex, "_computePreferredBoxWidth");
  };
};

proto._computePreferredBoxHeight = function()
{
  try {
    return Math.max(0, this.getPreferredInnerHeight() + this.getFrameHeight());
  } catch(ex) {
    this.error(ex, "_computePreferredBoxHeight");
  };
};







/*
---------------------------------------------------------------------------
  LAYOUT QUEUE
---------------------------------------------------------------------------
*/

proto._initialLayoutDone = false;

proto.addToLayoutChanges = function(p)
{
  if (this._isDisplayable) {
    this.getParent()._addChildToChildrenQueue(this);
  };

  return this._layoutChanges[p] = true;
};

proto.addToQueue = function(p) {
  this._initialLayoutDone ? this.addToJobQueue(p) : this.addToLayoutChanges(p);
};

proto.addToQueueRuntime = function(p) {
  return !this._initialLayoutDone || this.addToJobQueue(p);
};







/*
---------------------------------------------------------------------------
  BORDER/MARGIN/PADDING
---------------------------------------------------------------------------
*/

proto._applyBorderX = function(vChild, vChanges, vStyle)
{
  var vBorder = vChild.getBorder();
  vBorder ? vBorder._applyWidgetX(vChild) : QxBorder._resetBorderX(vChild);
};

proto._applyBorderY = function(vChild, vChanges, vStyle)
{
  var vBorder = vChild.getBorder();
  vBorder ? vBorder._applyWidgetY(vChild) : QxBorder._resetBorderY(vChild);
};

proto._applyPaddingX = QxUtil.returnTrue;
proto._applyPaddingY = QxUtil.returnTrue;










/*
---------------------------------------------------------------------------
  LAYOUT AUTO/PERCENT CACHE
---------------------------------------------------------------------------
*/

QxWidget.addCachedProperty({ name : "hasPercentX", defaultValue : false });
QxWidget.addCachedProperty({ name : "hasPercentY", defaultValue : false });
QxWidget.addCachedProperty({ name : "hasAutoX", defaultValue : false });
QxWidget.addCachedProperty({ name : "hasAutoY", defaultValue : false });
QxWidget.addCachedProperty({ name : "hasFlexX", defaultValue : false });
QxWidget.addCachedProperty({ name : "hasFlexY", defaultValue : false });

proto._computeHasPercentX = function() {
  return this._computedLeftTypePercent || this._computedWidthTypePercent || this._computedMinWidthTypePercent || this._computedMaxWidthTypePercent || this._computedRightTypePercent;
};

proto._computeHasPercentY = function() {
  return this._computedTopTypePercent || this._computedHeightTypePercent || this._computedMinHeightTypePercent || this._computedMaxHeightTypePercent || this._computedBottomTypePercent;
};

proto._computeHasAutoX = function() {
  return this._computedWidthTypeAuto || this._computedMinWidthTypeAuto || this._computedMaxWidthTypeAuto;
};

proto._computeHasAutoY = function() {
  return this._computedHeightTypeAuto || this._computedMinHeightTypeAuto || this._computedMaxHeightTypeAuto;
};

proto._computeHasFlexX = function() {
  return this._computedWidthTypeFlex;
};

proto._computeHasFlexY = function() {
  return this._computedHeightTypeFlex;
};







/*
---------------------------------------------------------------------------
  LAYOUT TYPE INDENTIFY HELPER METHODS
---------------------------------------------------------------------------
*/

QxWidget.TYPE_NULL = 0;
QxWidget.TYPE_PIXEL = 1;
QxWidget.TYPE_PERCENT = 2;
QxWidget.TYPE_AUTO = 3;
QxWidget.TYPE_FLEX = 4;

proto._evalUnitsPixelPercentAutoFlex = function(propValue)
{
  switch(propValue)
  {
    case QxConst.CORE_AUTO:
      return QxWidget.TYPE_AUTO;

    case Infinity:
    case -Infinity:
      return QxWidget.TYPE_NULL;
  };

  switch(typeof propValue)
  {
    case QxConst.TYPEOF_NUMBER:
      return isNaN(propValue) ? QxWidget.TYPE_NULL : QxWidget.TYPE_PIXEL;

    case QxConst.TYPEOF_STRING:
      return propValue.indexOf(QxConst.CORE_PERCENT) != -1 ? QxWidget.TYPE_PERCENT : propValue.indexOf(QxConst.CORE_STAR) != -1 ? QxWidget.TYPE_FLEX : QxWidget.TYPE_NULL;
  };

  return QxWidget.TYPE_NULL;
};

proto._evalUnitsPixelPercentAuto = function(propValue)
{
  switch(propValue)
  {
    case QxConst.CORE_AUTO:
      return QxWidget.TYPE_AUTO;

    case Infinity:
    case -Infinity:
      return QxWidget.TYPE_NULL;
  };

  switch(typeof propValue)
  {
    case QxConst.TYPEOF_NUMBER:
      return isNaN(propValue) ? QxWidget.TYPE_NULL : QxWidget.TYPE_PIXEL;

    case QxConst.TYPEOF_STRING:
      return propValue.indexOf(QxConst.CORE_PERCENT) != -1 ? QxWidget.TYPE_PERCENT : QxWidget.TYPE_NULL;
  };

  return QxWidget.TYPE_NULL;
};

proto._evalUnitsPixelPercent = function(propValue)
{
  switch(propValue)
  {
    case Infinity:
    case -Infinity:
      return QxWidget.TYPE_NULL;
  };

  switch(typeof propValue)
  {
    case QxConst.TYPEOF_NUMBER:
      return isNaN(propValue) ? QxWidget.TYPE_NULL : QxWidget.TYPE_PIXEL;

    case QxConst.TYPEOF_STRING:
      return propValue.indexOf(QxConst.CORE_PERCENT) != -1 ? QxWidget.TYPE_PERCENT : QxWidget.TYPE_NULL;
  };

  return QxWidget.TYPE_NULL;
};






/*
---------------------------------------------------------------------------
  LAYOUT TYPE AND VALUE KEY PRE-CACHE
---------------------------------------------------------------------------
*/

QxWidget.layoutPropertyTypes = {};

QxWidget.initLayoutProperties = function()
{
  var a = [ "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "left", "right", "top", "bottom" ];

  for (var i=0, l=a.length, p, b, t; i<l; i++)
  {
    p = a[i];
    b = QxConst.INTERNAL_COMPUTED + p.toFirstUp();
    t = b + QxConst.INTERNAL_UNIT_TYPE;

    QxWidget.layoutPropertyTypes[p] =
    {
      dataType : t,
      dataParsed : b + QxConst.INTERNAL_UNIT_PARSED,
      dataValue : b + QxConst.INTERNAL_UNIT_VALUE,

      typePixel : t + "Pixel",
      typePercent : t + "Percent",
      typeAuto : t + "Auto",
      typeFlex : t + "Flex",
      typeNull : t + "Null"
    };
  };
};

QxWidget.initLayoutProperties();





/*
---------------------------------------------------------------------------
  LAYOUT TYPE AND VALUE STORAGE
---------------------------------------------------------------------------
*/

proto._unitDetectionPixelPercentAutoFlex = function(propData, propValue)
{
  var r = QxWidget.layoutPropertyTypes[propData.name];

  var s = r.dataType;
  var p = r.dataParsed;
  var v = r.dataValue;

  var s1 = r.typePixel;
  var s2 = r.typePercent;
  var s3 = r.typeAuto;
  var s4 = r.typeFlex;
  var s5 = r.typeNull;

  var wasPercent = this[s2];
  var wasAuto = this[s3];
  var wasFlex = this[s4];

  switch(this[s] = this._evalUnitsPixelPercentAutoFlex(propValue))
  {
    case QxWidget.TYPE_PIXEL:
      this[s1] = true;
      this[s2] = this[s3] = this[s4] = this[s5] = false;
      this[p] = this[v] = Math.round(propValue);
      break;

    case QxWidget.TYPE_PERCENT:
      this[s2] = true;
      this[s1] = this[s3] = this[s4] = this[s5] = false;
      this[p] = parseFloat(propValue);
      this[v] = null;
      break;

    case QxWidget.TYPE_AUTO:
      this[s3] = true;
      this[s1] = this[s2] = this[s4] = this[s5] = false;
      this[p] = this[v] = null;
      break;

    case QxWidget.TYPE_FLEX:
      this[s4] = true;
      this[s1] = this[s2] = this[s3] = this[s5] = false;
      this[p] = parseFloat(propValue);
      this[v] = null;
      break;

    default:
      this[s5] = true;
      this[s1] = this[s2] = this[s3] = this[s4] = false;
      this[p] = this[v] = null;
      break;
  };

  if (wasPercent != this[s2])
  {
    switch(propData.name)
    {
      case QxConst.PROPERTY_MINWIDTH:
      case QxConst.PROPERTY_MAXWIDTH:
      case QxConst.PROPERTY_WIDTH:
      case QxConst.PROPERTY_LEFT:
      case QxConst.PROPERTY_RIGHT:
        this._invalidateHasPercentX();
        break;

      case QxConst.PROPERTY_MAXHEIGHT:
      case QxConst.PROPERTY_MINHEIGHT:
      case QxConst.PROPERTY_HEIGHT:
      case QxConst.PROPERTY_TOP:
      case QxConst.PROPERTY_BOTTOM:
        this._invalidateHasPercentY();
        break;
    };
  };

  // No ELSE because you can also switch from percent to auto
  if (wasAuto != this[s3])
  {
    switch(propData.name)
    {
      case QxConst.PROPERTY_MINWIDTH:
      case QxConst.PROPERTY_MAXWIDTH:
      case QxConst.PROPERTY_WIDTH:
        this._invalidateHasAutoX();
        break;

      case QxConst.PROPERTY_MINHEIGHT:
      case QxConst.PROPERTY_MAXHEIGHT:
      case QxConst.PROPERTY_HEIGHT:
        this._invalidateHasAutoY();
        break;
    };
  };

  // No ELSE because you can also switch from percent to auto
  if (wasFlex != this[s4])
  {
    switch(propData.name)
    {
      case QxConst.PROPERTY_WIDTH:
        this._invalidateHasFlexX();
        break;

      case QxConst.PROPERTY_HEIGHT:
        this._invalidateHasFlexY();
        break;
    };
  };
};

proto._unitDetectionPixelPercentAuto = function(propData, propValue)
{
  var r = QxWidget.layoutPropertyTypes[propData.name];

  var s = r.dataType;
  var p = r.dataParsed;
  var v = r.dataValue;

  var s1 = r.typePixel;
  var s2 = r.typePercent;
  var s3 = r.typeAuto;
  var s4 = r.typeNull;

  var wasPercent = this[s2];
  var wasAuto = this[s3];

  switch(this[s] = this._evalUnitsPixelPercentAuto(propValue))
  {
    case QxWidget.TYPE_PIXEL:
      this[s1] = true;
      this[s2] = this[s3] = this[s4] = false;
      this[p] = this[v] = Math.round(propValue);
      break;

    case QxWidget.TYPE_PERCENT:
      this[s2] = true;
      this[s1] = this[s3] = this[s4] = false;
      this[p] = parseFloat(propValue);
      this[v] = null;
      break;

    case QxWidget.TYPE_AUTO:
      this[s3] = true;
      this[s1] = this[s2] = this[s4] = false;
      this[p] = this[v] = null;
      break;

    default:
      this[s4] = true;
      this[s1] = this[s2] = this[s3] = false;
      this[p] = this[v] = null;
      break;
  };

  if (wasPercent != this[s2])
  {
    switch(propData.name)
    {
      case QxConst.PROPERTY_MINWIDTH:
      case QxConst.PROPERTY_MAXWIDTH:
      case QxConst.PROPERTY_WIDTH:
      case QxConst.PROPERTY_LEFT:
      case QxConst.PROPERTY_RIGHT:
        this._invalidateHasPercentX();
        break;

      case QxConst.PROPERTY_MINHEIGHT:
      case QxConst.PROPERTY_MAXHEIGHT:
      case QxConst.PROPERTY_HEIGHT:
      case QxConst.PROPERTY_TOP:
      case QxConst.PROPERTY_BOTTOM:
        this._invalidateHasPercentY();
        break;
    };
  };

  // No ELSE because you can also switch from percent to auto
  if (wasAuto != this[s3])
  {
    switch(propData.name)
    {
      case QxConst.PROPERTY_MINWIDTH:
      case QxConst.PROPERTY_MAXWIDTH:
      case QxConst.PROPERTY_WIDTH:
        this._invalidateHasAutoX();
        break;

      case QxConst.PROPERTY_MINHEIGHT:
      case QxConst.PROPERTY_MAXHEIGHT:
      case QxConst.PROPERTY_HEIGHT:
        this._invalidateHasAutoY();
        break;
    };
  };
};

proto._unitDetectionPixelPercent = function(propData, propValue)
{
  var r = QxWidget.layoutPropertyTypes[propData.name];

  var s = r.dataType;
  var p = r.dataParsed;
  var v = r.dataValue;

  var s1 = r.typePixel;
  var s2 = r.typePercent;
  var s3 = r.typeNull;

  var wasPercent = this[s2];

  switch(this[s] = this._evalUnitsPixelPercent(propValue))
  {
    case QxWidget.TYPE_PIXEL:
      this[s1] = true;
      this[s2] = this[s3] = false;
      this[p] = this[v] = Math.round(propValue);
      break;

    case QxWidget.TYPE_PERCENT:
      this[s2] = true;
      this[s1] = this[s3] = false;
      this[p] = parseFloat(propValue);
      this[v] = null;
      break;

    default:
      this[s3] = true;
      this[s1] = this[s2] = false;
      this[p] = this[v] = null;
      break;
  };

  if (wasPercent != this[s2])
  {
    switch(propData.name)
    {
      case QxConst.PROPERTY_MINWIDTH:
      case QxConst.PROPERTY_MAXWIDTH:
      case QxConst.PROPERTY_WIDTH:
      case QxConst.PROPERTY_LEFT:
      case QxConst.PROPERTY_RIGHT:
        this._invalidateHasPercentX();
        break;

      case QxConst.PROPERTY_MINHEIGHT:
      case QxConst.PROPERTY_MAXHEIGHT:
      case QxConst.PROPERTY_HEIGHT:
      case QxConst.PROPERTY_TOP:
      case QxConst.PROPERTY_BOTTOM:
        this._invalidateHasPercentY();
        break;
    };
  };
};







/*
---------------------------------------------------------------------------
  INLINE EVENTS
---------------------------------------------------------------------------
*/

if (QxClient.isMshtml())
{
  QxWidget.inlineEventMap =
  {
    input : "onpropertychange",
    select : "onselect",
    scroll : "onscroll",
    focus : "onfocus",
    blur : "onblur"
  };

  proto.enableInlineEvent = function(vEventName)
  {
    var vEventType = QxWidget.inlineEventMap[vEventName];

    if (!this._inlineEvents)
    {
      this._inlineEvents = [vEventType];
    }
    else
    {
      this._inlineEvents.push(vEventType);
    };

    if (this._isCreated) {
      this.getElement()[vEventType] = QxWidget.__oninlineevent;
    };
  };

  proto.disableInlineEvent = function(vEventName)
  {
    var vEventType = QxWidget.inlineEventMap[vEventName];

    if (this._inlineEvents) {
      this._inlineEvents.remove(vEventType);
    };

    if (this._isCreated) {
      this.getElement()[vEventType] = null;
    };
  };

  proto._addInlineEvents = function(vElement)
  {
    if (this._inlineEvents)
    {
      for (var i=0, a=this._inlineEvents, l=a.length; i<l; i++) {
        vElement[a[i]] = QxWidget.__oninlineevent;
      };
    };
  };

  proto._removeInlineEvents = function(vElement)
  {
    if (this._inlineEvents)
    {
      for (var i=0, a=this._inlineEvents, l=a.length; i<l; i++) {
        vElement[a[i]] = null;
      };
    };
  };
}
else
{
  proto.enableInlineEvent = function(vEventName)
  {
    if (!this._inlineEvents)
    {
      this._inlineEvents = [vEventName];
    }
    else
    {
      this._inlineEvents.push(vEventName);
    };

    if (this._isCreated) {
      this.getElement().addEventListener(vEventName, QxWidget.__oninlineevent, false);
    };
  };

  proto.disableInlineEvent = function(vEventName)
  {
    if (this._inlineEvents) {
      this._inlineEvents.remove(vEventName);
    };

    if (this._isCreated) {
      this.getElement().removeEventListener(vEventName, QxWidget.__oninlineevent, false);
    };
  };

  proto._addInlineEvents = function(vElement)
  {
    if (this._inlineEvents)
    {
      for (var i=0, a=this._inlineEvents, l=a.length; i<l; i++) {
        vElement.addEventListener(a[i], QxWidget.__oninlineevent, false);
      };
    };
  };

  proto._removeInlineEvents = function(vElement)
  {
    if (this._inlineEvents)
    {
      for (var i=0, a=this._inlineEvents, l=a.length; i<l; i++) {
        vElement.removeEventListener(a[i], QxWidget.__oninlineevent, false);
      };
    };
  };
};

QxWidget.__oninlineevent = function(e)
{
  if (!e) {
    e = window.event;
  };

  if (this._QxWidget) {
    return this._QxWidget._oninlineevent(e);
  };
};

proto._oninlineevent = function(e)
{
  if (QxWidget._inFlushGlobalQueues) {
    return;
  };

  switch(e.type)
  {
    case QxConst.EVENT_TYPE_PROPERTYCHANGE:
      this._oninlineproperty(e);
      break;

    case QxConst.EVENT_TYPE_INPUT:
      this._oninlineinput(e);
      break;

    default:
      this.createDispatchEvent(e.type);
  };
};

proto._oninlineinput = function(e)
{
  this.createDispatchDataEvent(QxConst.EVENT_TYPE_INPUT, this.getComputedValue());

  // Block parents from this event
  if (e.stopPropagation) {
    e.stopPropagation();
  };

  e.returnValue = -1;
};

QxWidget.INLINE_EVENTTYPE_PROPERTY = "value";

proto._oninlineproperty = function(e)
{
  switch(e.propertyName)
  {
    case QxWidget.INLINE_EVENTTYPE_PROPERTY:
      if (!this._inValueProperty) {
        this._oninlineinput(e);
      };

      break;
  };
};







/*
---------------------------------------------------------------------------
  CHILDREN MANAGMENT
---------------------------------------------------------------------------
*/

/*!
  The the widget which is at the top level,
  which contains all others (normally a
  instance of QxClientDocument).
*/
proto.getTopLevelWidget = function() {
  return this._hasParent ? this.getParent().getTopLevelWidget() : null;
};

/*!
  Move myself before another child of the same parent.
*/
proto.moveSelfBefore = function(vBefore) {
  this.getParent().addBefore(this, vBefore);
};

/*!
  Move myself after another child of the same parent.
*/
proto.moveSelfAfter = function(vAfter) {
  this.getParent().addAfter(this, vAfter);
};

/*!
  Move myself to the begin and this way make me the first child.
*/
proto.moveSelfToBegin = function() {
  this.getParent().addAtBegin(this);
};

/*!
  Move myself to the end and this way make me the last child.
*/
proto.moveSelfToEnd = function() {
  this.getParent().addAtEnd(this);
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

/*!
  Returns the previous sibling.
*/
proto.getPreviousVisibleSibling = function()
{
  if(!this._hasParent) {
    return null;
  };

  var vChildren = this.getParent().getVisibleChildren();
  return vChildren[vChildren.indexOf(this) - 1];
};

/*!
  Returns the next sibling.
*/
proto.getNextVisibleSibling = function()
{
  if(!this._hasParent) {
    return null;
  };

  var vChildren = this.getParent().getVisibleChildren();
  return vChildren[vChildren.indexOf(this) + 1];
};

proto.getPreviousActiveSibling = function(vIgnoreClasses)
{
  var vPrev = QxWidget.getActiveSiblingHelper(this, this.getParent(), -1, vIgnoreClasses, null);
  return vPrev ? vPrev : this.getParent().getLastActiveChild();
};

proto.getNextActiveSibling = function(vIgnoreClasses)
{
  var vNext = QxWidget.getActiveSiblingHelper(this, this.getParent(), 1, vIgnoreClasses, null);
  return vNext ? vNext : this.getParent().getFirstActiveChild();
};

proto.isFirstChild = function() {
  return this._hasParent && this.getParent().getFirstChild() == this;
};

proto.isLastChild = function() {
  return this._hasParent && this.getParent().getLastChild() == this;
};

proto.isFirstVisibleChild = function() {
  return this._hasParent && this.getParent().getFirstVisibleChild() == this;
};

proto.isLastVisibleChild = function() {
  return this._hasParent && this.getParent().getLastVisibleChild() == this;
};







/*
---------------------------------------------------------------------------
  ENABLED MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this.removeState(QxConst.STATE_DISABLED);
  }
  else
  {
    this.addState(QxConst.STATE_DISABLED);

    // Also reset some states to be sure a pressed/hovered button gets resetted
    this.removeState(QxConst.STATE_OVER);
    this.removeState(QxConst.STATE_ABANDONED);
    this.removeState(QxConst.STATE_PRESSED);
  };

  return true;
};





/*
---------------------------------------------------------------------------
  STATE HANDLING
---------------------------------------------------------------------------
*/

proto.hasState = function(vState) {
  return this._states[vState] ? true : false;
};

proto.addState = function(vState)
{
  this._states[vState] = true;

  if (this._hasParent) {
    QxWidget.addToGlobalStateQueue(this);
  };
};

proto.removeState = function(vState)
{
  delete this._states[vState];

  if (this._hasParent) {
    QxWidget.addToGlobalStateQueue(this);
  };
};







/*
---------------------------------------------------------------------------
  APPEARANCE
---------------------------------------------------------------------------
*/

proto._applyInitialAppearance = function()
{
  var vAppearance = this.getAppearance();

  if (vAppearance)
  {
    try
    {
      var r = QxAppearanceManager.getAppearanceThemeObject().initialFrom(this, vAppearance);
      if (r) {
        this.set(r);
      };
    }
    catch(ex)
    {
      this.error("Could not apply initial appearance: " + ex, "_applyInitialAppearance");
    };
  };
};

proto._applyStateAppearance = function()
{
  this._applyStateStyleFocus(this._states);

  var vAppearance = this.getAppearance();

  if (vAppearance)
  {
    try
    {
      var r = QxAppearanceManager.getAppearanceThemeObject().stateFrom(this, vAppearance);
      if (r) {
        this.set(r);
      };
    }
    catch(ex)
    {
      this.error("Could not apply state appearance: " + ex, "_applyStateAppearance");
    };
  };
};

proto._resetAppearanceThemeWrapper = function(vNewAppearanceTheme, vOldAppearanceTheme)
{
  var vAppearance = this.getAppearance();

  if (vAppearance)
  {
    var vOldAppearanceThemeObject = QxAppearanceManager.getAppearanceThemeObjectById(vOldAppearanceTheme);
    var vNewAppearanceThemeObject = QxAppearanceManager.getAppearanceThemeObjectById(vNewAppearanceTheme);

    var vOldAppearanceProperties = QxUtil.mergeObjectWith(vOldAppearanceThemeObject.initialFrom(this, vAppearance), vOldAppearanceThemeObject.stateFrom(this, vAppearance));
    var vNewAppearanceProperties = QxUtil.mergeObjectWith(vNewAppearanceThemeObject.initialFrom(this, vAppearance), vNewAppearanceThemeObject.stateFrom(this, vAppearance));

    for (vProp in vOldAppearanceProperties)
    {
      if (!(vProp in vNewAppearanceProperties)) {
        this[QxMain.resetter[vProp]]();
      };
    };

    this.set(vNewAppearanceProperties);
  };
};

if (QxClient.isMshtml())
{
  /*
    Mshtml does not support outlines by css
  */
  proto._applyStateStyleFocus = function(vStates) {};
}
else if (QxClient.isGecko())
{
  proto._applyStateStyleFocus = function(vStates)
  {
    if (vStates.focused)
    {
      if (!QxFocusManager.mouseFocus && !this.getHideFocus())
      {
        this.setStyleProperty("MozOutline", QxConst.FOCUS_OUTLINE);
      };
    }
    else
    {
      this.removeStyleProperty("MozOutline");
    };
  };
}
else
{
  proto._applyStateStyleFocus = function(vStates)
  {
    if (vStates.focused)
    {
      if (!QxFocusManager.mouseFocus && !this.getHideFocus())
      {
        this.setStyleProperty("outline", QxConst.FOCUS_OUTLINE);
      };
    }
    else
    {
      this.removeStyleProperty("outline");
    };
  };
};

proto.addToStateQueue = function() {
  QxWidget.addToGlobalStateQueue(this);
};

proto.recursiveAddToStateQueue = function() {
  this.addToStateQueue();
};







/*
---------------------------------------------------------------------------
  APPEARANCE MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyAppearance = function(propValue, propOldValue, propData)
{
  var vAppearanceThemeObject = QxAppearanceManager.getAppearanceThemeObject();

  var vNewAppearanceProperties = vAppearanceThemeObject.initialFrom(this, propValue);

  if (this.isCreated()) {
    QxUtil.mergeObjectWith(vNewAppearanceProperties, vAppearanceThemeObject.stateFrom(this, propValue));
  };

  if (propOldValue)
  {
    var vOldAppearanceProperties = vAppearanceThemeObject.initialFrom(this, propOldValue);

    if (this.isCreated()) {
      QxUtil.mergeObjectWith(vOldAppearanceProperties, vAppearanceThemeObject.stateFrom(this, propOldValue));
    };

    for (vProp in vOldAppearanceProperties)
    {
      if (!(vProp in vNewAppearanceProperties)) {
        this[QxMain.resetter[vProp]]();
      };
    };
  };

  this.set(vNewAppearanceProperties);

  return true;
};

proto._recursiveAppearanceThemeUpdate = function(vNewAppearanceTheme, vOldAppearanceTheme)
{
  try
  {
    this._resetAppearanceThemeWrapper(vNewAppearanceTheme, vOldAppearanceTheme);
  }
  catch(ex)
  {
    this.error("Failed to update appearance theme: " + ex, "_recursiveAppearanceThemeUpdate");
  };
};






/*
---------------------------------------------------------------------------
  ELEMENT DATA
---------------------------------------------------------------------------
*/

/*!
  Placeholder method to add attributes and other content to element node
*/
proto._applyElementData = function(el) {};






/*
---------------------------------------------------------------------------
  HTML PROPERTIES
---------------------------------------------------------------------------
*/

proto.setHtmlProperty = function(propName, propValue)
{
  if (!this._htmlProperties) {
    this._htmlProperties = {};
  };

  this._htmlProperties[propName] = propValue;

  if (this._isCreated) {
    this.getElement()[propName] = propValue;
  };

  return true;
};

if (QxClient.isMshtml())
{
  proto.removeHtmlProperty = function(propName)
  {
    if (!this._htmlProperties) {
      return;
    };

    delete this._htmlProperties[propName];

    if (this._isCreated) {
      this.getElement().removeAttribute(propName);
    };

    return true;
  };
}
else
{
  proto.removeHtmlProperty = function(propName)
  {
    if (!this._htmlProperties) {
      return;
    };

    delete this._htmlProperties[propName];

    if (this._isCreated)
    {
      this.getElement().removeAttribute(propName);
      delete this.getElement()[propName];
    };

    return true;
  };
};

proto.getHtmlProperty = function(propName)
{
  if (!this._htmlProperties) {
    return QxConst.CORE_EMPTY;
  };

  return this._htmlProperties[propName] || QxConst.CORE_EMPTY;
};

proto._applyHtmlProperties = function(vElement)
{
  var vProperties = this._htmlProperties;

  if (vProperties)
  {
    // this.debug("HTML-Properties: " + QxUtil.getObjectLength(vProperties));

    var propName;

    for (propName in vProperties) {
      vElement[propName] = vProperties[propName];
    };
  };
};






/*
---------------------------------------------------------------------------
  HTML ATTRIBUTES
---------------------------------------------------------------------------
*/

proto.setHtmlAttribute = function(propName, propValue)
{
  if (!this._htmlAttributes) {
    this._htmlAttributes = {};
  };

  this._htmlAttributes[propName] = propValue;

  if (this._isCreated) {
    this.getElement().setAttribute(propName, propValue);
  };

  return true;
};

proto.removeHtmlAttribute = function(propName)
{
  if (!this._htmlAttributes) {
    return;
  };

  delete this._htmlAttributes[propName];

  if (this._isCreated) {
    this.getElement().removeAttribute(propName);
  };

  return true;
};

proto.getHtmlAttribute = function(propName)
{
  if (!this._htmlAttributes) {
    return QxConst.CORE_EMPTY;
  };

  return this._htmlAttributes[propName] || QxConst.CORE_EMPTY;
};

proto._applyHtmlAttributes = function(vElement)
{
  var vAttributes = this._htmlAttributes;

  if (vAttributes)
  {
    // this.debug("HTML-Attributes: " + QxUtil.getObjectLength(vAttributes));

    var propName;

    for (propName in vAttributes) {
      vElement.setAttribute(propName, vAttributes[i]);
    };
  };
};






/*
---------------------------------------------------------------------------
  STYLE PROPERTIES
---------------------------------------------------------------------------
*/

proto.getStyleProperty = function(propName) {
  return this._styleProperties[propName] || QxConst.CORE_EMPTY;
};

proto.setStyleProperty = function(propName, propValue)
{
  this._styleProperties[propName] = propValue;

  if (this._isCreated)
  {
    /*
      The zIndex and filter properties should always be
      applied on the "real" element node.
    */
    switch(propName)
    {
      case QxConst.PROPERTY_ZINDEX:
      case QxConst.PROPERTY_FILTER:
      case QxConst.PROPERTY_DISPLAY:
      case QxConst.PROPERTY_VISIBILITY:
        var vElement = this.getElement();
        break;

      default:
        var vElement = this._getTargetNode();
    };

    if (vElement) {
      vElement.style[propName] = propValue;
    };
  };

  return true;
};

proto.removeStyleProperty = function(propName)
{
  delete this._styleProperties[propName];

  if (this._isCreated)
  {
    /*
      The zIndex and filter properties should always be
      applied on the "real" element node.
    */
    switch(propName)
    {
      case QxConst.PROPERTY_ZINDEX:
      case QxConst.PROPERTY_FILTER:
      case QxConst.PROPERTY_DISPLAY:
      case QxConst.PROPERTY_VISIBILITY:
        var vElement = this.getElement();
        break;

      default:
        var vElement = this._getTargetNode();
    };

    if (vElement) {
      vElement.style[propName] = QxConst.CORE_EMPTY;
    };
  };

  return true;
};

proto._applyStyleProperties = function(vElement)
{
  var vProperties = this._styleProperties;
  var propName;

  var vBaseElement = vElement;
  var vTargetElement = this._getTargetNode();

  for (propName in vProperties)
  {
    /*
      The zIndex and filter properties should always be
      applied on the "real" element node.
    */
    switch(propName)
    {
      case QxConst.PROPERTY_ZINDEX:
      case QxConst.PROPERTY_FILTER:
        vElement = vBaseElement;
        break;

      default:
        vElement = vTargetElement;
    };

    vElement.style[propName] = vProperties[propName];
  };
};








/*
---------------------------------------------------------------------------
  FOCUS HANDLING
---------------------------------------------------------------------------
*/

proto.isFocusable = function() {
  return this.isEnabled() && this.isSeeable() && this.getTabIndex() >= 0;
};

proto.isFocusRoot = function() {
  return false;
};

proto.getFocusRoot = function()
{
  if(this._hasParent) {
    return this.getParent().getFocusRoot();
  };

  return null;
};

proto.getActiveChild = function()
{
  var vRoot = this.getFocusRoot();
  if (vRoot) {
    return vRoot.getActiveChild();
  };

  return null;
};

proto._ontabfocus = QxUtil.returnTrue;

proto._modifyFocused = function(propValue, propOldValue, propData)
{
  if (!this.isCreated()) {
    return true;
  };

  var vFocusRoot = this.getFocusRoot();

  // this.debug("Focused: " + propValue);

  if (propValue)
  {
    vFocusRoot.setFocusedChild(this);
    this._visualizeFocus();
  }
  else
  {
    if (vFocusRoot.getFocusedChild() == this) {
      vFocusRoot.setFocusedChild(null);
    };

    this._visualizeBlur();
  };

  return true;
};

proto._visualizeBlur = function()
{
  // force blur, even if mouseFocus is not active because we
  // need to be sure that the previous focus rect gets removed.
  if (this.getEnableElementFocus())
  {
    try {
      this.getElement().blur();
    } catch(ex) {};
  };

  this.removeState(QxConst.STATE_FOCUSED);
  return true;
};

proto._visualizeFocus = function()
{
  if (!QxFocusManager.mouseFocus && this.getEnableElementFocus())
  {
    try {
      this.getElement().focus();
    } catch(ex) {};
  };

  this.addState(QxConst.STATE_FOCUSED);
  return true;
};

proto.focus = function()
{
  delete QxFocusManager.mouseFocus;
  this.setFocused(true);
};

proto.blur = function()
{
  delete QxFocusManager.mouseFocus;
  this.setFocused(false);
};




/*
---------------------------------------------------------------------------
  CAPTURE
---------------------------------------------------------------------------
*/

proto._modifyCapture = function(propValue, propOldValue, propData)
{
  try
  {
    var ev = this.getTopLevelWidget().getEventManager();
  }
  catch(ex)
  {
    throw new Error("Could not apply new capture value: event manager of top level widget is not available!");
  };

  if (propOldValue)
  {
    ev.setCaptureWidget(null);
  }
  else if (propValue)
  {
    ev.setCaptureWidget(this);
  };

  return true;
};





/*
---------------------------------------------------------------------------
  ZINDEX
---------------------------------------------------------------------------
*/

proto._modifyZIndex = function(propValue, propOldValue, propData) {
  return this.setStyleProperty(propData.name, propValue);
};







/*
---------------------------------------------------------------------------
  TAB INDEX
---------------------------------------------------------------------------
*/

QxWidget.TAB_PROPERTY_UNSELECTABLE = "unselectable";
QxWidget.TAB_PROPERTY_TABINDEX = "tabIndex";
QxWidget.TAB_PROPERTY_USERFOCUS = "userFocus";
QxWidget.TAB_PROPERTY_MOZUSERFOCUS = "MozUserFocus";

QxWidget.TAB_VALUE_IGNORE = "ignore";
QxWidget.TAB_VALUE_NORMAL = "normal";
QxWidget.TAB_VALUE_ON = "on";

if (QxClient.isMshtml())
{
  proto._modifyTabIndex = function(propValue, propOldValue, propData)
  {
    propValue < 0 || !this.getEnabled() ? this.setHtmlProperty(QxWidget.TAB_PROPERTY_UNSELECTABLE, QxWidget.TAB_VALUE_ON) : this.removeHtmlProperty(QxWidget.TAB_PROPERTY_UNSELECTABLE);
    this.setHtmlProperty(QxWidget.TAB_PROPERTY_TABINDEX, propValue < 0 ? -1 : 1);

    return true;
  };
}
else if (QxClient.isGecko())
{
  proto._modifyTabIndex = function(propValue, propOldValue, propData)
  {
    this.setStyleProperty(QxWidget.TAB_PROPERTY_MOZUSERFOCUS, propValue < 0 ? QxWidget.TAB_VALUE_IGNORE : QxWidget.TAB_VALUE_NORMAL);

    // be forward compatible (CSS 3 Draft)
    this.setStyleProperty(QxWidget.TAB_PROPERTY_USERFOCUS, propValue < 0 ? QxWidget.TAB_VALUE_IGNORE : QxWidget.TAB_VALUE_NORMAL);

    return true;
  };
}
else
{
  proto._modifyTabIndex = function(propValue, propOldValue, propData)
  {
    // CSS 3 Draft
    this.setStyleProperty(QxWidget.TAB_PROPERTY_USERFOCUS, propValue < 0 ? QxWidget.TAB_VALUE_IGNORE : QxWidget.TAB_VALUE_NORMAL);

    // IE Backward Compatible
    propValue < 0 || !this.getEnabled() ? this.setHtmlProperty(QxWidget.TAB_PROPERTY_UNSELECTABLE, QxWidget.TAB_VALUE_ON) : this.removeHtmlProperty(QxWidget.TAB_PROPERTY_UNSELECTABLE);
    this.setHtmlProperty(QxWidget.TAB_PROPERTY_TABINDEX, propValue < 0 ? -1 : 1);

    return true;
  };
};






/*
---------------------------------------------------------------------------
  CSS CLASS NAME
---------------------------------------------------------------------------
*/

proto.setCssClassName = function(propValue) {
  this.setHtmlProperty(QxConst.PROPERTY_CLASSNAME, propValue);
};

proto.getCssClassName = function() {
  return this.getHtmlProperty(QxConst.PROPERTY_CLASSNAME);
};








/*
---------------------------------------------------------------------------
  WIDGET FROM POINT
---------------------------------------------------------------------------
*/

proto.getWidgetFromPoint = function(x, y)
{
  var ret = this.getWidgetFromPointHelper(x, y);
  return ret && ret != this ? ret : null;
};

proto.getWidgetFromPointHelper = function(x, y) {
  return this;
};






/*
---------------------------------------------------------------------------
  CAN SELECT
---------------------------------------------------------------------------
*/

QxWidget.SEL_PROPERTY_UNSELECTABLE = "unselectable";
QxWidget.SEL_PROPERTY_USERSELECT = "userSelect";
QxWidget.SEL_PROPERTY_MOZUSERSELECT = "MozUserSelect";

QxWidget.SEL_VALUE_ON = "on";

if(QxClient.isMshtml())
{
  proto._modifySelectable = function(propValue, propOldValue, propData) {
    return propValue ? this.removeHtmlProperty(QxWidget.SEL_PROPERTY_UNSELECTABLE) : this.setHtmlProperty(QxWidget.SEL_PROPERTY_UNSELECTABLE, QxWidget.SEL_VALUE_ON);
  };
}
else if(QxClient.isGecko())
{
  proto._modifySelectable = function(propValue, propOldValue, propData)
  {
    // Be forward compatible and use both userSelect and MozUserSelect
    if (propValue)
    {
      this.removeStyleProperty(QxWidget.SEL_PROPERTY_MOZUSERSELECT);
      this.removeStyleProperty(QxWidget.SEL_PROPERTY_USERSELECT);
    }
    else
    {
      this.setStyleProperty(QxWidget.SEL_PROPERTY_MOZUSERSELECT, QxConst.CORE_NONE);
      this.setStyleProperty(QxWidget.SEL_PROPERTY_USERSELECT, QxConst.CORE_NONE);
    };

    return true;
  };
}
else if (QxClient.isOpera())
{
  // No known method available for this client
  proto._modifySelectable = function(propValue, propOldValue, propData) {
    return true;
  };
}
else
{
  proto._modifySelectable = function(propValue, propOldValue, propData) {
    return propValue ? this.removeStyleProperty(QxWidget.SEL_PROPERTY_USERSELECT) : this.setStyleProperty(QxWidget.SEL_PROPERTY_USERSELECT, QxConst.CORE_NONE);
  };
};






/*
---------------------------------------------------------------------------
  OPACITY
---------------------------------------------------------------------------
*/

QxWidget.OPACITY_FILTER_START = "Alpha(Opacity=";
QxWidget.OPACITY_FILTER_STOP = ")";
QxWidget.OPACITY_FILTER_REGEXP = /Alpha\(Opacity=([0-9]{1,3})\)/;

QxWidget.OPACITY_PROPERTY_CSS3 = "opacity";
QxWidget.OPACITY_PROPERTY_MOZ = "MozOpacity";
QxWidget.OPACITY_PROPERTY_KHTML = "KhtmlOpacity";

/*!
Sets the opacit for the widget. Any child widget inside the widget will
also become transparent. The value should be a number between 0 and 1 where 1
means totally opaque and 0 invisible.
*/
if(QxClient.isMshtml())
{
  proto._modifyOpacity = function(propValue, propOldValue, propData)
  {
    if(propValue == null || propValue >= 1 || propValue < 0)
    {
      this.removeStyleProperty(QxConst.PROPERTY_FILTER);
    }
    else if (QxUtil.isValidNumber(propValue))
    {
      this.setStyleProperty(QxConst.PROPERTY_FILTER, QxWidget.OPACITY_FILTER_START + Math.round(propValue * 100) + QxWidget.OPACITY_FILTER_STOP);
    }
    else
    {
      throw new Error("Unsupported opacity value: " + propValue);
    };

    return true;
  };
}
else
{
  proto._modifyOpacity = function(propValue, propOldValue, propData)
  {
    if(propValue == null || propValue > 1)
    {
      if (QxClient.isGecko())
      {
        this.removeStyleProperty(QxWidget.OPACITY_PROPERTY_MOZ);
      }
      else if (QxClient.isKhtml())
      {
        this.removeStyleProperty(QxWidget.OPACITY_PROPERTY_KHTML);
      };

      this.removeStyleProperty(QxWidget.OPACITY_PROPERTY_CSS3);
    }
    else if (QxUtil.isValidNumber(propValue))
    {
      propValue = propValue.limit(0, 1);

      // should we omit geckos flickering here
      // and limit the max value to 0.99?

      if (QxClient.isGecko())
      {
        this.setStyleProperty(QxWidget.OPACTIY_PROPERTY_MOZ, propValue);
      }
      else if (QxClient.isKhtml())
      {
        this.setStyleProperty(QxWidget.OPACITY_PROPERTY_KHTML, propValue);
      };

      this.setStyleProperty(QxWidget.OPACITY_PROPERTY_CSS3, propValue);
    };

    return true;
  };
};






/*
---------------------------------------------------------------------------
  CURSOR
---------------------------------------------------------------------------
*/

QxWidget.CURSOR_PROPERTY = "cursor";
QxWidget.CURSOR_VALUE_POINTER = "pointer";
QxWidget.CURSOR_VALUE_HAND = "hand";

proto._modifyCursor = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this.setStyleProperty(QxWidget.CURSOR_PROPERTY, propValue == QxWidget.CURSOR_VALUE_POINTER && QxClient.isMshtml() ? QxWidget.CURSOR_VALUE_HAND : propValue);
  }
  else
  {
    this.removeStyleProperty(QxWidget.CURSOR_PROPERTY);
  };

  return true;
};





/*
---------------------------------------------------------------------------
  BACKGROUND IMAGE
---------------------------------------------------------------------------
*/

QxWidget.BACKGROUNDIMG_PROPERTY = "backgroundImage";
QxWidget.BACKGROUNDIMG_VALUE_START = "url(";
QxWidget.BACKGROUNDIMG_VALUE_STOP = ")";
QxWidget.BACKGROUNDIMG_REGEXP1 = /^url\(/i;
QxWidget.BACKGROUNDIMG_REGEXP2 = /\)$/;

proto._modifyBackgroundImage = function(propValue, propOldValue, propData) {
  return QxUtil.isValidString(propValue) ? this.setStyleProperty(QxWidget.BACKGROUNDIMG_PROPERTY, QxWidget.BACKGROUNDIMG_VALUE_START + QxImageManager.buildUri(propValue) + QxWidget.BACKGROUNDIMG_VALUE_STOP) : this.removeStyleProperty(QxWidget.BACKGROUNDIMG_PROPERTY);
};






/*
---------------------------------------------------------------------------
  CLIPPING
---------------------------------------------------------------------------
*/

QxWidget.CLIP_PROPERTY = "clip";
QxWidget.CLIP_VALUE_START = "rect(";
QxWidget.CLIP_VALUE_STOP = ")";

proto._modifyClip = function(propValue, propOldValue, propData) {
  return this._compileClipString();
};

proto._compileClipString = function()
{
  var vLeft = this.getClipLeft();
  var vTop = this.getClipTop();
  var vWidth = this.getClipWidth();
  var vHeight = this.getClipHeight();

  var vRight, vBottom;

  if(vLeft == null)
  {
    vRight = vWidth == null ? QxConst.CORE_AUTO : vWidth + QxConst.CORE_PIXEL;
    vLeft = QxConst.CORE_AUTO;
  }
  else
  {
    vRight = vWidth == null ? QxConst.CORE_AUTO : vLeft + vWidth + QxConst.CORE_PIXEL;
    vLeft = vLeft + QxConst.CORE_PIXEL;
  };

  if(vTop == null)
  {
    vBottom = vHeight == null ? QxConst.CORE_AUTO : vHeight + QxConst.CORE_PIXEL;
    vTop = QxConst.CORE_AUTO;
  }
  else
  {
    vBottom = vHeight == null ? QxConst.CORE_AUTO : vTop + vHeight + QxConst.CORE_PIXEL;
    vTop = vTop + QxConst.CORE_PIXEL;
  };

  return this.setStyleProperty(QxWidget.CLIP_PROPERTY, QxWidget.CLIP_VALUE_START + vTop + QxConst.CORE_COMMA + vRight + QxConst.CORE_COMMA + vBottom + QxConst.CORE_COMMA + vLeft + QxWidget.CLIP_VALUE_STOP);
};






/*
---------------------------------------------------------------------------
  OVERFLOW
---------------------------------------------------------------------------
*/

/*
  This will measure the typical native scrollbar size in the environment
*/
QxWidget.initOverflow = function()
{
  var t = document.createElement(QxConst.CORE_DIV);
  var s = t.style;

  s.height = s.width = "100px";
  s.overflow = "scroll";

  document.body.appendChild(t);

  var c = QxDom.getComputedScrollBarSizeRight(t);
  if (c) {
    QxWidget.SCROLLBAR_SIZE = c;
  };

  document.body.removeChild(t);
};

if (typeof window.application != QxConst.TYPEOF_UNDEFINED) {
  window.application.addEventListener(QxConst.EVENT_TYPE_PRE, QxWidget.initOverflow);
};

QxWidget.SCROLL_PROPERTY = "overflow";
QxWidget.SCROLL_PROPERTYX = "overflowX";
QxWidget.SCROLL_PROPERTYY = "overflowY";

QxWidget.SCROLL_VALUE_AUTO = "auto";
QxWidget.SCROLL_VALUE_HIDDEN = "hidden";
QxWidget.SCROLL_VALUE_SCROLL = "scroll";
QxWidget.SCROLL_VALUE_SCROLLX = "scrollX";
QxWidget.SCROLL_VALUE_SCROLLY = "scrollY";

QxWidget.SCROLL_VALUE_MOZNONE = "-moz-scrollbars-none";
QxWidget.SCROLL_VALUE_MOZSCROLLX = "-moz-scrollbars-horizontal";
QxWidget.SCROLL_VALUE_MOZSCROLLY = "-moz-scrollbars-vertical";

if (QxClient.isGecko())
{
  proto._modifyOverflow = function(propValue, propOldValue, propData)
  {
    var pv = propValue;
    var pn = propData.name;

    switch(pv)
    {
      case QxWidget.SCROLL_VALUE_HIDDEN:
        pv = QxWidget.SCROLL_VALUE_MOZNONE;
        break;

      case QxWidget.SCROLL_VALUE_SCROLLX:
        pv = QxWidget.SCROLL_VALUE_MOZSCROLLX;
        break;

      case QxWidget.SCROLL_VALUE_SCROLLY:
        pv = QxWidget.SCROLL_VALUE_MOZSCROLLY;
        break;
    };

    return this._applyOverflow(pn, pv, propValue, propOldValue);
  };
}

// Mshtml conforms here to CSS3 Spec. Sometime here are multiple browsers
// which support these new overflowX overflowY properties.
else if (QxClient.isMshtml())
{
  proto._modifyOverflow = function(propValue, propOldValue, propData)
  {
    var pv = propValue;
    var pn = propData.name;

    switch(pv)
    {
      case QxWidget.SCROLL_VALUE_SCROLLX:
        pn = QxWidget.SCROLL_PROPERTYX;
        pv = QxWidget.SCROLL_VALUE_SCROLL;
        break;

      case QxWidget.SCROLL_VALUE_SCROLLY:
        pn = QxWidget.SCROLL_PROPERTYY;
        pv = QxWidget.SCROLL_VALUE_SCROLL;
        break;
    };

    // Clear up concurrenting rules
    var a = [ QxWidget.SCROLL_PROPERTY, QxWidget.SCROLL_PROPERTYX, QxWidget.SCROLL_PROPERTYY ];
    for (var i=0; i<a.length; i++)
    {
      if (a[i]!=pn) {
        this.removeStyleProperty(a[i]);
      };
    };

    return this._applyOverflow(pn, pv, propValue, propOldValue);
  };
}

// Opera/Khtml Mode...
// hopefully somewhat of this is supported in the near future.

// overflow-x and overflow-y are also not supported by Opera 9.0 Beta1
// and also not if we switch to IE emulation mode
else
{
  proto._modifyOverflow = function(propValue, propOldValue, propData)
  {
    var pv = propValue;
    var pn = propData.name;

    switch(pv)
    {
      case QxWidget.SCROLL_VALUE_SCROLLX:
      case QxWidget.SCROLL_VALUE_SCROLLY:
        pv = QxWidget.SCROLL_VALUE_SCROLL;
        break;
    };

    return this._applyOverflow(pn, pv, propValue, propOldValue);
  };
};

proto._applyOverflow = function(pn, pv, propValue, propOldValue)
{
  // Apply Style
  this.setStyleProperty(pn, pv);

  // Invalidate Frame
  this._invalidateFrameWidth();
  this._invalidateFrameHeight();

  return true;
};

proto.getOverflowX = function()
{
  var vOverflow = this.getOverflow();
  return vOverflow == QxWidget.SCROLL_VALUE_SCROLLY ? QxWidget.SCROLL_VALUE_HIDDEN : vOverflow;
};

proto.getOverflowY = function()
{
  var vOverflow = this.getOverflow();
  return vOverflow == QxWidget.SCROLL_VALUE_SCROLLX ? QxWidget.SCROLL_VALUE_HIDDEN : vOverflow;
};






/*
---------------------------------------------------------------------------
  HIDE FOCUS
---------------------------------------------------------------------------
*/

if (QxClient.isMshtml())
{
  proto._modifyHideFocus = function(propValue, propOldValue, propData)
  {
    this.setHtmlProperty(propData.name, propValue);
    return true;
  };
};

// Need no implementation for others then mshtml, because
// all these browsers support css outlines and does not
// have an attribute "hideFocus" as IE.






/*
---------------------------------------------------------------------------
  COLORS
---------------------------------------------------------------------------
*/

proto._modifyBackgroundColor = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue)
  {
    this._applyBackgroundColor(propValue.getStyle());
    propValue.add(this);
  }
  else
  {
    this._resetBackgroundColor();
  };

  return true;
};

proto._modifyColor = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue)
  {
    this._applyColor(propValue.getStyle());
    propValue.add(this);
  }
  else
  {
    this._resetColor();
  };

  return true;
};

proto._updateColors = function(vColor, vNewValue)
{
  if (this.getColor() == vColor) {
    this._applyColor(vNewValue);
  };

  if (this.getBackgroundColor() == vColor) {
    this._applyBackgroundColor(vNewValue);
  };
};

proto._applyColor = function(vNewValue) {
  this.setStyleProperty(QxConst.PROPERTY_COLOR, vNewValue);
};

proto._applyBackgroundColor = function(vNewValue) {
  this.setStyleProperty(QxConst.PROPERTY_BACKGROUNDCOLOR, vNewValue);
};

proto._resetColor = function(vNewValue) {
  this.removeStyleProperty(QxConst.PROPERTY_COLOR);
};

proto._resetBackgroundColor = function() {
  this.removeStyleProperty(QxConst.PROPERTY_BACKGROUNDCOLOR);
};






/*
---------------------------------------------------------------------------
  BORDER
---------------------------------------------------------------------------
*/

proto._cachedBorderTop = 0;
proto._cachedBorderRight = 0;
proto._cachedBorderBottom = 0;
proto._cachedBorderLeft = 0;

proto._modifyBorder = function(propValue, propOldValue, propData)
{
  var vOldTop = this._cachedBorderTop;
  var vOldRight = this._cachedBorderRight;
  var vOldBottom = this._cachedBorderBottom;
  var vOldLeft = this._cachedBorderLeft;

  if (propOldValue) {
    propOldValue.removeListenerWidget(this);
  };

  if (propValue)
  {
    propValue.addListenerWidget(this);

    this._cachedBorderTop = propValue.getTopWidth();
    this._cachedBorderRight = propValue.getRightWidth();
    this._cachedBorderBottom = propValue.getBottomWidth();
    this._cachedBorderLeft = propValue.getLeftWidth();
  }
  else
  {
    this._cachedBorderTop = this._cachedBorderRight = this._cachedBorderBottom = this._cachedBorderLeft = 0;
  };



  // ----------------
  // X-AXIS
  // ----------------
  if ((vOldLeft + vOldRight) != (this._cachedBorderLeft + this._cachedBorderRight)) {
    this._invalidateFrameWidth();
  };

  this.addToQueue(QxConst.PROPERTY_BORDERX);



  // ----------------
  // Y-AXIS
  // ----------------
  if ((vOldTop + vOldBottom) != (this._cachedBorderTop + this._cachedBorderBottom)) {
    this._invalidateFrameHeight();
  };

  this.addToQueue(QxConst.PROPERTY_BORDERY);





  return true;
};

proto.getCachedBorderTop = function() {
  return this._cachedBorderTop;
};

proto.getCachedBorderRight = function() {
  return this._cachedBorderRight;
};

proto.getCachedBorderBottom = function() {
  return this._cachedBorderBottom;
};

proto.getCachedBorderLeft = function() {
  return this._cachedBorderLeft;
};

proto._updateBorder = function(vEdge)
{
  // Small hack, remove later: TODO
  // ?? Anybody have an idea about this TODO?
  var vBorder = this.getBorder();
  var vEdgeUp = vEdge.toFirstUp();

  var vNewValue = vBorder[QxConst.INTERNAL_GET + vEdgeUp + "Width"]();
  var vCacheName = "_cachedBorder" + vEdgeUp;
  var vWidthChanged = this[vCacheName] != vNewValue;

  this[vCacheName] = vNewValue;

  switch(vEdge)
  {
    case QxConst.PROPERTY_LEFT:
    case QxConst.PROPERTY_RIGHT:
      if (vWidthChanged) {
        this.addToJobQueue(QxConst.PROPERTY_BORDERWIDTHX);
      };

      this.addToJobQueue(QxConst.PROPERTY_BORDERX);
      break;

    case QxConst.PROPERTY_TOP:
    case QxConst.PROPERTY_BOTTOM:
      if (vWidthChanged) {
        this.addToJobQueue(QxConst.PROPERTY_BORDERWIDTHY);
      };

      this.addToJobQueue(QxConst.PROPERTY_BORDERY);
      break;
  };
};







/*
---------------------------------------------------------------------------
  PADDING
---------------------------------------------------------------------------
*/

proto._modifyPaddingX = function(propValue, propOldValue, propData)
{
  this._invalidateFrameWidth();
  return true;
};

proto._modifyPaddingY = function(propValue, propOldValue, propData)
{
  this._invalidateFrameHeight();
  return true;
};






/*
---------------------------------------------------------------------------
  CLONE
---------------------------------------------------------------------------
*/

proto._clonePropertyIgnoreList = "parent,element,visible";


/*!
Returns a cloned copy of the current instance of QxWidget.

#param cloneRecursive[Boolean]: Should the widget cloned recursive (including all childs)?
#param customPropertyList[Array]: Optional (reduced) list of properties to copy through
*/

// TODO: Needs modification to work with new codebase
proto.clone = function(cloneRecursive, customPropertyList)
{
  var cloneInstance = new this.constructor;

  var propertyName;
  var propertyList = [];
  var propertyIngoreList = this._clonePropertyIgnoreList.split(QxConst.CORE_COMMA);

  // Build new filtered property list
  var sourcePropertyList = QxUtil.isValid(customPropertyList) ? customPropertyList : this._properties.split(QxConst.CORE_COMMA);
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
    cloneInstance[QxConst.INTERNAL_SET + propertyName](this[QxConst.INTERNAL_GET + propertyName]());
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

  // clone recursion
  if (cloneRecursive) {
    this._cloneRecursive(cloneInstance);
  };

  return cloneInstance;
};

proto._cloneRecursive = function(cloneInstance) {};






/*
---------------------------------------------------------------------------
  COMMAND INTERFACE
---------------------------------------------------------------------------
*/

proto.execute = function()
{
  var vCommand = this.getCommand();
  if (vCommand) {
    vCommand.execute(this);
  };

  this.createDispatchEvent(QxConst.EVENT_TYPE_EXECUTE);
};






/*
---------------------------------------------------------------------------
  NODE ALIASES
---------------------------------------------------------------------------
*/

proto._visualPropertyCheck = function()
{
  if (!this.isCreated()) {
    throw new Error("Element must be created previously!");
  };
};

proto.setScrollLeft = function(nScrollLeft)
{
  this._visualPropertyCheck();
  this._getTargetNode().scrollLeft = nScrollLeft;
};

proto.setScrollTop = function(nScrollTop)
{
  this._visualPropertyCheck();
  this._getTargetNode().scrollTop = nScrollTop;
};

proto.getOffsetLeft = function()
{
  this._visualPropertyCheck();
  return QxDom.getOffsetLeft(this.getElement());
};

proto.getOffsetTop = function()
{
  this._visualPropertyCheck();
  return QxDom.getOffsetTop(this.getElement());
};

proto.getScrollLeft = function()
{
  this._visualPropertyCheck();
  return this._getTargetNode().scrollLeft;
};

proto.getScrollTop = function()
{
  this._visualPropertyCheck();
  return this._getTargetNode().scrollTop;
};

proto.getClientWidth = function()
{
  this._visualPropertyCheck();
  return this._getTargetNode().clientWidth;
};

proto.getClientHeight = function()
{
  this._visualPropertyCheck();
  return this._getTargetNode().clientHeight;
};

proto.getOffsetWidth = function()
{
  this._visualPropertyCheck();
  return this.getElement().offsetWidth;
};

proto.getOffsetHeight = function()
{
  this._visualPropertyCheck();
  return this.getElement().offsetHeight;
};

proto.getScrollWidth = function()
{
  this._visualPropertyCheck();
  return this.getElement().scrollWidth;
};

proto.getScrollHeight = function()
{
  this._visualPropertyCheck();
  return this.getElement().scrollHeight;
};





/*
---------------------------------------------------------------------------
  SCROLL INTO VIEW
---------------------------------------------------------------------------
*/

proto.scrollIntoView = function(vAlignTopLeft)
{
  this.scrollIntoViewX(vAlignTopLeft);
  this.scrollIntoViewY(vAlignTopLeft);
};

proto.scrollIntoViewX = function(vAlignLeft)
{
  if (!this._isCreated || !this._isDisplayable) {
    return false;
  };

  return QxDom.scrollIntoViewX(this.getElement(), vAlignLeft);
};

proto.scrollIntoViewY = function(vAlignTop)
{
  if (!this._isCreated || !this._isDisplayable) {
    return false;
  };

  return QxDom.scrollIntoViewY(this.getElement(), vAlignTop);
};






/*
---------------------------------------------------------------------------
  ROUNDED BORDER
---------------------------------------------------------------------------
*/

/*
proto.applyRoundedBorder = function()
{
  this.addEventListener(QxConst.EVENT_TYPE_BEFOREAPPEAR, this._applyRoundedBorder);
};

proto._applyRoundedBorder = function()
{
  this._applyRoundedTopLeftBorder();
  this._applyRoundedTopRightBorder();
  this._applyRoundedBottomLeftBorder();
  this._applyRoundedBottomRightBorder();


  this._applyRoundedFadedTopLeftBorder();
};

proto._applyRoundedTopLeftBorder = function()
{
  var el = this.getElement();

  var corner = document.createElement(QxConst.CORE_DIV);
  var cornerStyle = corner.style;

  cornerStyle.backgroundColor = "threedface";
  cornerStyle.width = "2px";
  cornerStyle.height = "2px";
  cornerStyle.position = QxConst.CORE_ABSOLUTE;
  cornerStyle.top = "0px";
  cornerStyle.left = "0px";

  el.appendChild(corner);


  var cornerLeft = document.createElement(QxConst.CORE_DIV);
  var cornerLeftStyle = cornerLeft.style;

  cornerLeftStyle.backgroundColor = "threedface";
  cornerLeftStyle.width = "1px";
  cornerLeftStyle.height = "1px";
  cornerLeftStyle.position = QxConst.CORE_ABSOLUTE;
  cornerLeftStyle.top = "2px";
  cornerLeftStyle.left = "0px";

  el.appendChild(cornerLeft);


  var cornerTop = document.createElement(QxConst.CORE_DIV);
  var cornerTopStyle = cornerTop.style;

  cornerTopStyle.backgroundColor = "threedface";
  cornerTopStyle.width = "1px";
  cornerTopStyle.height = "1px";
  cornerTopStyle.position = QxConst.CORE_ABSOLUTE;
  cornerTopStyle.top = "0px";
  cornerTopStyle.left = "2px";

  el.appendChild(cornerTop);


};

proto._applyRoundedFadedTopLeftBorder = function()
{
  var el = this.getElement();

  var cornerTop = document.createElement(QxConst.CORE_DIV);
  var cornerTopStyle = cornerTop.style;

  cornerTopStyle.backgroundColor = "threedface";
  cornerTopStyle.MozOpacity = "0.5";
  cornerTopStyle.width = "2px";
  cornerTopStyle.height = "1px";
  cornerTopStyle.position = QxConst.CORE_ABSOLUTE;
  cornerTopStyle.top = "0px";
  cornerTopStyle.left = "3px";

  el.appendChild(cornerTop);



  var cornerLeft = document.createElement(QxConst.CORE_DIV);
  var cornerLeftStyle = cornerLeft.style;

  cornerLeftStyle.backgroundColor = "threedface";
  cornerLeftStyle.MozOpacity = "0.5";
  cornerLeftStyle.width = "1px";
  cornerLeftStyle.height = "2px";
  cornerLeftStyle.position = QxConst.CORE_ABSOLUTE;
  cornerLeftStyle.top = "3px";
  cornerLeftStyle.left = "0px";

  el.appendChild(cornerLeft);




  var cornerInnerTop = document.createElement(QxConst.CORE_DIV);
  var cornerInnerTopStyle = cornerInnerTop.style;

  cornerInnerTopStyle.backgroundColor = "threedface";
  cornerInnerTopStyle.MozOpacity = "0.5";
  cornerInnerTopStyle.width = "1px";
  cornerInnerTopStyle.height = "1px";
  cornerInnerTopStyle.position = QxConst.CORE_ABSOLUTE;
  cornerInnerTopStyle.top = "1px";
  cornerInnerTopStyle.left = "2px";

  el.appendChild(cornerInnerTop);



  var cornerInnerLeft = document.createElement(QxConst.CORE_DIV);
  var cornerInnerLeftStyle = cornerInnerLeft.style;

  cornerInnerLeftStyle.backgroundColor = "threedface";
  cornerInnerLeftStyle.MozOpacity = "0.5";
  cornerInnerLeftStyle.width = "1px";
  cornerInnerLeftStyle.height = "1px";
  cornerInnerLeftStyle.position = QxConst.CORE_ABSOLUTE;
  cornerInnerLeftStyle.top = "2px";
  cornerInnerLeftStyle.left = "1px";

  el.appendChild(cornerInnerLeft);


};

proto._applyRoundedTopRightBorder = function()
{
  var el = this.getElement();

  var corner = document.createElement(QxConst.CORE_DIV);
  var cornerStyle = corner.style;

  cornerStyle.backgroundColor = "threedface";
  cornerStyle.width = "2px";
  cornerStyle.height = "2px";
  cornerStyle.position = QxConst.CORE_ABSOLUTE;
  cornerStyle.top = "0px";
  cornerStyle.right = "0px";

  el.appendChild(corner);




};

proto._applyRoundedBottomLeftBorder = function()
{
  var el = this.getElement();

  var corner = document.createElement(QxConst.CORE_DIV);
  var cornerStyle = corner.style;

  cornerStyle.backgroundColor = "threedface";
  cornerStyle.width = "2px";
  cornerStyle.height = "2px";
  cornerStyle.position = QxConst.CORE_ABSOLUTE;
  cornerStyle.bottom = "0px";
  cornerStyle.left = "0px";

  el.appendChild(corner);





};

proto._applyRoundedBottomRightBorder = function()
{
  var el = this.getElement();

  var corner = document.createElement(QxConst.CORE_DIV);
  var cornerStyle = corner.style;

  cornerStyle.backgroundColor = "threedface";
  cornerStyle.width = "2px";
  cornerStyle.height = "2px";
  cornerStyle.position = QxConst.CORE_ABSOLUTE;
  cornerStyle.bottom = "0px";
  cornerStyle.right = "0px";

  el.appendChild(corner);




};
*/







/*
---------------------------------------------------------------------------
  DRAG AND DROP SUPPORT
---------------------------------------------------------------------------
*/

proto.supportsDrop = function(vDragCache) {
  return true;
};








/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/
proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  var vElement = this.getElement();

  if (vElement)
  {
    this._removeInlineEvents(vElement);

    delete this._isCreated;

    vElement._QxWidget = null;

    this._element = null;
    this._style = null;
  };

  this._inlineEvents = null;
  this._element = null;
  this._style = null;
  this._borderElement = null;
  this._borderStyle = null;
  this._oldParent = null;

  // should be enough to remove the hashTables
  delete this._styleProperties;
  delete this._htmlProperties;
  delete this._htmlAttributes;
  delete this._states;

  // remove queue content
  for (var i in this._jobQueue) {
    delete this._jobQueue[i];
  };
  delete this._jobQueue;

  for (var i in this._layoutChanges) {
    delete this._layoutChanges[i];
  };
  delete this._layoutChanges;

  return QxTarget.prototype.dispose.call(this);
};
