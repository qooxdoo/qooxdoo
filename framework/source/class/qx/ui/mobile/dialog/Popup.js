/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The popup represents a widget that gets shown above other widgets,
 * usually to present more info/details regarding an item in the application.
 *
 * There are 3 usages for now:
 *
 * <pre class='javascript'>
 * var widget = new qx.ui.mobile.form.Button("Error!");
 * var popup = new qx.ui.mobile.dialog.Popup(widget);
 * popup.show();
 * </pre>
 * Here we show a popup consisting of a single buttons alerting the user
 * that an error has occurred.
 * It will be centered to the screen.
 * <pre class='javascript'>
 * var label = new qx.ui.mobile.basic.Label("Item1");
 * var widget = new qx.ui.mobile.form.Button("Error!");
 * var popup = new qx.ui.mobile.dialog.Popup(widget, label);
 * popup.show();
 * widget.addListener("tap", function(){
 *   popup.hide();
 * });
 *
 * </pre>
 *
 * In this case everything is as above, except that the popup will get shown next to "label"
 * so that the user can understand that the info presented is about the "Item1"
 * we also add a tap listener to the button that will hide out popup.
 *
 * Once created, the instance is reused between show/hide calls.
 *
 * <pre class='javascript'>
 * var widget = new qx.ui.mobile.form.Button("Error!");
 * var popup = new qx.ui.mobile.dialog.Popup(widget);
 * popup.placeTo(25,100);
 * popup.show();
 * </pre>
 *
 * Same as the first example, but this time the popup will be shown at the 25,100 coordinates.
 *
 *
 */
qx.Class.define("qx.ui.mobile.dialog.Popup",
{
  extend : qx.ui.mobile.core.Widget,


  statics:
  {
    ROOT : null
  },


  /**
   * @param widget {qx.ui.mobile.core.Widget} the widget that will be shown in the popup
   * @param anchor {qx.ui.mobile.core.Widget?} optional parameter, a widget to attach this popup to
   */
  construct : function(widget, anchor)
  {
    this.base(arguments);
    this.exclude();

    if(qx.ui.mobile.dialog.Popup.ROOT == null) {
      qx.ui.mobile.dialog.Popup.ROOT = qx.core.Init.getApplication().getRoot();
    }
    qx.ui.mobile.dialog.Popup.ROOT.add(this);

    this.__anchor = anchor;

    if(widget) {
      this._initializeChild(widget);
    }
  },


  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "popup"
    },


    /**
     * The label/caption/text of the qx.ui.mobile.basic.Atom instance
     */
    title :
    {
      apply : "_applyTitle",
      nullable : true,
      check : "String",
      event : "changeTitle"
    },


    /**
     * Any URI String supported by qx.ui.mobile.basic.Image to display an icon
     */
    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true,
      event : "changeIcon"
    },


    /**
     * Whether the popup should be displayed modal.
     */
    modal :
    {
      init : false,
      check : "Boolean",
      nullable: false
    },


    /**
     * Indicates whether the a modal popup should disappear when user taps/clicks on Blocker.
     */
    hideOnBlockerTap :
    {
      check : "Boolean",
      init : false
    }
  },


  members :
  {
    __isShown : false,
    __childrenContainer : null,
    __percentageTop : null,
    __anchor: null,
    __widget: null,
    __titleWidget: null,
    __lastPopupDimension : null,


    /**
     * Event handler. Called whenever the position of the popup should be updated.
     */
    _updatePosition : function()
    {
      // Traverse single anchor classes for removal, for preventing 'domupdated' event if no CSS classes changed.
      var anchorClasses = ['top', 'bottom', 'left', 'right', 'anchor'];
      for (var i = 0; i < anchorClasses.length; i++) {
        this.removeCssClass(anchorClasses[i]);
      }

      if (this.__anchor)
      {
        this.addCssClass('anchor');

        var rootHeight = qx.ui.mobile.dialog.Popup.ROOT.getHeight();
        var rootWidth = qx.ui.mobile.dialog.Popup.ROOT.getWidth();

        var rootPosition = qx.bom.element.Location.get(qx.ui.mobile.dialog.Popup.ROOT.getContainerElement());
        var anchorPosition = qx.bom.element.Location.get(this.__anchor.getContainerElement());
        var popupDimension = qx.bom.element.Dimension.getSize(this.getContainerElement());

        this.__lastPopupDimension = popupDimension;

        var computedPopupPosition = qx.util.placement.Placement.compute(popupDimension, {
          width: rootPosition.left + rootWidth,
          height: rootPosition.top + rootHeight
        }, anchorPosition, {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        }, "bottom-left", "keep-align", "keep-align");

        // Reset Anchor.
        this._resetPosition();

        var isTop = anchorPosition.top > computedPopupPosition.top;
        var isLeft = anchorPosition.left > computedPopupPosition.left;

        computedPopupPosition.top = computedPopupPosition.top - rootPosition.top;
        computedPopupPosition.left = computedPopupPosition.left - rootPosition.left;

        var isOutsideViewPort = computedPopupPosition.top < 0
          || computedPopupPosition.left < 0
          || computedPopupPosition.left + popupDimension.width > rootWidth
          || computedPopupPosition.top + popupDimension.height > rootHeight;

        if(isOutsideViewPort) {
          this._positionToCenter();
        } else {
          if (isTop) {
            this.addCssClass('bottom');
          } else {
            this.addCssClass('top');
          }
          if (isLeft) {
            this.addCssClass('right');
          } else {
            this.addCssClass('left');
          }

          this.placeTo(computedPopupPosition.left, computedPopupPosition.top);
        }
      } else if (this.__childrenContainer) {
        // No Anchor
        this._positionToCenter();
      }
    },


    /**
     * This method shows the popup.
     * First it updates the position, then registers the event handlers, and shows it.
     */
    show : function()
    {
      if (!this.__isShown)
      {
        qx.core.Init.getApplication().fireEvent("popup");

        this.__registerEventListener();

        // Move outside of viewport
        this.placeTo(-1000,-1000);

        // Needs to be added to screen, before rendering position, for calculating
        // objects height.
        this.base(arguments);

        // Now render position.
        this._updatePosition();
      }
      this.__isShown = true;

      if(this.getModal() === true)
      {
        qx.ui.mobile.core.Blocker.getInstance().show();

        if(this.getHideOnBlockerTap()) {
          qx.ui.mobile.core.Blocker.getInstance().addListener("tap", this.hide, this);
        }
      }
    },


    /**
     * Hides the popup.
     */
    hide : function()
    {
      if (this.__isShown)
      {
        this.__unregisterEventListener();

        this.exclude();
      }
      this.__isShown = false;

      if(this.getModal())
      {
        qx.ui.mobile.core.Blocker.getInstance().hide();
      }

      qx.ui.mobile.core.Blocker.getInstance().removeListener("tap", this.hide, this);
    },


    /**
     * Hides the popup after a given time delay.
     * @param delay {Integer} time delay in ms.
     */
    hideWithDelay : function(delay) {
      if (delay) {
        qx.lang.Function.delay(this.hide, delay, this);
      } else {
        this.hide();
      }
    },


    /**
     * Returns the shown state of this popup.
     * @return {Boolean} whether the popup is shown or not.
     */
    isShown : function() {
      return this.__isShown;
    },


    /**
     * Toggles the visibility of this popup.
     */
    toggleVisibility : function() {
      if(this.__isShown == true) {
        this.hide();
      } else {
        this.show();
      }
    },


    /**
     * This method positions the popup widget at the coordinates specified.
     * @param left {Integer} - the value the will be set to container's left style property
     * @param top {Integer} - the value the will be set to container's top style property
     */
    placeTo : function(left, top)
    {
      this._setStyle("left", left + "px");
      this._setStyle("top", top + "px");
    },


    /**
     * Tracks the user tap on root and hides the widget if <code>pointerdown</code> event
     * occurs outside of the widgets bounds.
     * @param evt {qx.event.type.Pointer} the pointer event.
     */
    _trackUserTap : function(evt) {
      var clientX = evt.getViewportLeft();
      var clientY = evt.getViewportTop();

      var popupLocation = qx.bom.element.Location.get(this.getContainerElement());

      var isOutsideWidget =  clientX < popupLocation.left
        || clientX > popupLocation.left + this.__lastPopupDimension.width
        || clientY > popupLocation.top + this.__lastPopupDimension.height
        || clientY < popupLocation.top;

      if(isOutsideWidget) {
        this.hide();
      }
    },


    /**
     * Centers this widget to window's center position.
     */
    _positionToCenter : function()
    {
      var container = this.getContainerElement();
      container.style.position = "absolute";
      container.style.marginLeft = -parseInt(container.offsetWidth/2) + "px";
      container.style.marginTop = -parseInt(container.offsetHeight/2) + "px";
      container.style.left = "50%";
      container.style.top = "50%";
    },


    /**
     * Resets the position of this element (left, top, margins...)
     */
    _resetPosition : function()
    {
      var container = this.getContainerElement();
      container.style.left = "0px";
      container.style.top = "0px";
      container.style.marginLeft = null;
      container.style.marginTop = null;
    },


    /**
     * Registers all needed event listeners
     */
    __registerEventListener : function()
    {
      qx.core.Init.getApplication().addListener("stop", this.hide, this);
      qx.core.Init.getApplication().addListener("popup", this.hide, this);

      qx.event.Registration.addListener(window, "resize", this._updatePosition, this);

      if(this.__anchor) {
        this.__anchor.addCssClass("anchor-target");
        qx.ui.mobile.dialog.Popup.ROOT.addListener("pointerdown",this._trackUserTap,this);
      }
    },


    /**
     * Unregisters all needed event listeners
     */
    __unregisterEventListener : function()
    {
      qx.core.Init.getApplication().removeListener("stop", this.hide, this);
      qx.core.Init.getApplication().removeListener("popup", this.hide, this);

      qx.event.Registration.removeListener(window, "resize", this._updatePosition, this);

      if(this.__anchor) {
        this.__anchor.removeCssClass("anchor-target");
        qx.ui.mobile.dialog.Popup.ROOT.removeListener("pointerdown", this._trackUserTap, this);
      }
    },


    /**
     * This method creates the container where the popup's widget will be placed
     * and adds it to the popup.
     * @param widget {qx.ui.mobile.core.Widget} - what to show in the popup
     *
     */
    _initializeChild : function(widget)
    {
      if(this.__childrenContainer == null) {
        this.__childrenContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
        this.__childrenContainer.setDefaultCssClass("popup-content");
        this._add(this.__childrenContainer);
      }

      if(this._createTitleWidget()) {
        this.__childrenContainer.remove(this._createTitleWidget());
        this.__childrenContainer.add(this._createTitleWidget());
      }

      this.__childrenContainer.add(widget, {
        flex: 1
      });

      widget.addListener("domupdated", this._updatePosition, this);

      this.__widget = widget;
    },


    /**
     * Creates the title atom widget.
     *
     * @return {qx.ui.mobile.basic.Atom} The title atom widget.
     */
    _createTitleWidget : function()
    {
      if(this.__titleWidget) {
        return this.__titleWidget;
      }
      if(this.getTitle() || this.getIcon())
      {
        this.__titleWidget = new qx.ui.mobile.basic.Atom(this.getTitle(), this.getIcon());
        this.__titleWidget.addCssClass('popup-title');
        return this.__titleWidget;
      }
      else
      {
        return null;
      }
    },


    // property apply
    _applyTitle : function(value, old)
    {
      if(value) {
        if(this.__titleWidget)
        {
          this.__titleWidget.setLabel(value);
        }
        else
        {
          this.__titleWidget = new qx.ui.mobile.basic.Atom(value, this.getIcon());
          this.__titleWidget.addCssClass('popup-title');

          if(this.__widget) {
            this.__childrenContainer.addBefore(this._createTitleWidget(), this.__widget);
          } else {
            if(this.__childrenContainer) {
              this.__childrenContainer.add(this._createTitleWidget());
            }
          }
        }
      }
    },


    // property apply
    _applyIcon : function(value, old)
    {
      if (value) {
        if (this.__titleWidget) {
          this.__titleWidget.setIcon(value);
        } else {
          this.__titleWidget = new qx.ui.mobile.basic.Atom(this.getTitle(), value);
          this.__titleWidget.addCssClass('popup-title');

          if (this.__widget) {
            this.__childrenContainer.addBefore(this._createTitleWidget(), this.__widget);
          } else {
            if (this.__childrenContainer) {
              this.__childrenContainer.add(this._createTitleWidget());
            }
          }
        }
      }
    },


    /**
     * Adds the widget that will be shown in this popup. This method can be used in the case when you have removed the widget from the popup
     * or you haven't passed it in the constructor.
     * @param widget {qx.ui.mobile.core.Widget} - what to show in the popup
     */
    add : function(widget)
    {
      this.removeWidget();
      this._initializeChild(widget);
    },


    /**
     * A widget to attach this popup to.
     *
     * @param widget {qx.ui.mobile.core.Widget} The anchor widget.
     */
    setAnchor : function(widget) {
      this.__anchor = widget;
      this._updatePosition();
    },


    /**
     * Returns the title widget.
     *
     * @return {qx.ui.mobile.basic.Atom} The title widget.
     */
    getTitleWidget : function() {
      return this.__titleWidget;
    },


    /**
     * This method removes the widget shown in the popup.
     * @return {qx.ui.mobile.core.Widget|null} The removed widget or <code>null</code>
     * if the popup doesn't have an attached widget
     */
    removeWidget : function()
    {
      if(this.__widget)
      {
        this.__widget.removeListener("domupdated", this._updatePosition, this);
        this.__childrenContainer.remove(this.__widget);
        return this.__widget;
      }
      else
      {
        if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.debug(this, "this popup has no widget attached yet");
        }
        return null;
      }
    }
  },


  destruct : function()
  {
    this.__unregisterEventListener();
    this._disposeObjects("__childrenContainer");

    this.__isShown = this.__percentageTop = this._anchor = this.__widget = this.__lastPopupDimension = null;
  }
});
