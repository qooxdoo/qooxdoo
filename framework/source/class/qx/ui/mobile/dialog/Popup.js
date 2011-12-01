/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
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
 * that an error has occured.
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

 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widget {qx.ui.mobile.core.Widget} the widget the will be shown in the popup
   * @param anchor {qx.ui.mobile.core.Widget?} optional parameter, a widget to attach this popup to
   *
   */
  construct : function(widget, anchor)
  {
    this.base(arguments);
    this.exclude();
    qx.core.Init.getApplication().getRoot().add(this);
    if(anchor) {
      this.__anchor = anchor;
    }
    if(widget) {
      this._initializeChild(widget);
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

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
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __isShown : false,
    __childrenContainer : null,
    __left : null,
    __top : null,
    __percentageTop : null,
    __anchor: null,
    __widget: null,
    __titleWidget: null,
    __anchorPointer: null,

    /**
     * Event handler. Called whenever the position of the popup should be updated.
     */
    _updatePosition : function()
    {
      if(this.__left != null || this.__top != null) {
        return;
      }
      if(this.__anchor)
      {
        // TODO: remove this hack, find another way to compute the anchorPointer location
        var pos = qx.bom.element.Location.getPosition(this.__anchor.getContainerElement());
        var anchorDimension = qx.bom.element.Dimension.getSize(this.__anchor.getContainerElement());
        var dimension = qx.bom.element.Dimension.getSize(this.getContainerElement());
        if(pos.top + dimension.height > qx.bom.Viewport.getHeight()) {
          pos.top = pos.top - dimension.height - parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'padding-bottom')) - parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'border-bottom-width'));
          this.__anchorPointer.removeCssClass('popupAnchorPointerTop');
          this.__anchorPointer.removeCssClass('popupAnchorPointerLeft');
          this.__anchorPointer.removeCssClass('popupAnchorPointerRight');
          this.__anchorPointer.addCssClass('popupAnchorPointerBottom');
          this.__anchorPointer._setStyle('margin-left',(anchorDimension.width/2)+'px');
          this.__anchorPointer._setStyle('margin-bottom','-'+(parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'padding-bottom')) + parseInt(qx.bom.element.Style.get(this.__anchorPointer.getContainerElement(), 'border-top-width')))+'px');
          this.__anchorPointer._setStyle('margin-top',(parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'padding-bottom')))+'px');
          var newDimension = qx.bom.element.Dimension.getSize(this.getContainerElement());
          this._positionTo(pos.left, pos.top - (newDimension.height - dimension.height));
        }
        else if(pos.left + dimension.width > qx.bom.Viewport.getWidth()) {
          pos.left = pos.left - dimension.width - parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'padding-right')) - parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'border-right-width'));
          this.__anchorPointer.removeCssClass('popupAnchorPointerTop');
          this.__anchorPointer.removeCssClass('popupAnchorPointerLeft');
          this.__anchorPointer.removeCssClass('popupAnchorPointerBottom');
          this.__anchorPointer.addCssClass('popupAnchorPointerRight');
          this._positionTo(pos.left, pos.top);
        }
        else {
          this.__anchorPointer._setStyle('margin-left',(anchorDimension.width/2)+'px');
          var newDimension = qx.bom.element.Dimension.getSize(this.getContainerElement());
          var x = parseInt(this.__anchorPointer._getStyle('margin-top')) == 0 ? 2 : 0;
          this.__anchorPointer._setStyle('margin-top','-'+(newDimension.height - x*parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'padding-bottom')) + parseInt(qx.bom.element.Style.get(this.getContainerElement(), 'border-top-width')))+'px');
          this._positionTo(pos.left, pos.top + anchorDimension.height + parseInt(qx.bom.element.Dimension.getHeight(this.__anchorPointer.getContainerElement())));
        }
        return;
      }
      var top = qx.bom.Viewport.getScrollTop(), height = 1;
      var left = qx.bom.Viewport.getScrollLeft(), width = 1;
      var viewportWidth = qx.bom.Viewport.getWidth(), viewportHeight = qx.bom.Viewport.getHeight();
      if(this.__childrenContainer)
      {
        var dimension = qx.bom.element.Dimension.getSize(this.__childrenContainer.getContainerElement());
        width = dimension.width;
        height = dimension.height;
      }

      this._positionTo(left + (viewportWidth - width)/2, top + (viewportHeight-height)/2) ;
    },


    /**
     * This method shows the popup.
     * First it updates the position, then registers the event handlers, and the shows it.
     */
    show : function()
    {
      if (!this.__isShown)
      {
        this.__registerEventListener();
        this.base(arguments);
        this._updatePosition();
      }
      this.__isShown = true;
    },

    /**
     * This method positions the popup widget at the coordinates specified.
     * @param left {Integer} - the value the will be set to container's left style property
     * @param top {Integer} - the value the will be set to container's top style property
     */
    placeTo : function(left, top)
    {
      this.__left = left;
      this.__top = top;
      this._positionTo(left, top);
    },

    /**
     * This protected method positions the popup widget at the coordinates specified.
     * It is used internally by the placeTo and _updatePosition methods
     * @param left {Integer}  the value the will be set to container's left style property
     * @param top {Integer} the value the will be set to container's top style property
     */
    _positionTo : function(left, top) {
      this.getContainerElement().style.left = left + "px";
      this.getContainerElement().style.top = top + "px";
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
    },


    /**
     * Registers all needed event listeners
     */
    __registerEventListener : function()
    {
      qx.event.Registration.addListener(window, "resize", this._updatePosition, this);
      /*if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
      {
        qx.event.message.Bus.getInstance().subscribe("iscrollstart", this.hide, this);
      }
      else
      {
        qx.event.Registration.addListener(window, "scroll", this.hide, this);
      }*/
    },


    /**
     * Unregisters all needed event listeners
     */
    __unregisterEventListener : function()
    {
      qx.event.Registration.removeListener(window, "resize", this._updatePosition, this);
      /*if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
      {
        qx.event.Registration.removeListener(window, "iscrollstart", this.hide, this);
      }
      else
      {
        qx.event.Registration.removeListener(window, "scroll", this.hide, this);
      }*/
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
        this.__childrenContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({alignY: "middle"}));
        this._add(this.__childrenContainer);
      }
      if(this._createTitleWidget()) {
        this.__childrenContainer.add(this._createTitleWidget());
      }
      this.__childrenContainer.add(widget);
      if(this.__anchor)
      {
        this.__anchorPointer = new qx.ui.mobile.core.Widget();
        this.__anchorPointer.addCssClass('popupAnchorPointer');
        this.__anchorPointer.addCssClass('popupAnchorPointerTop');
        this._add(this.__anchorPointer);
      }
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
        this.__titleWidget.addCssClass('dialogTitleUnderline');
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
          this.__titleWidget.addCssClass('dialogTitleUnderline');
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
      if(value) {
        if(this.__titleWidget)
        {
          this.__titleWidget.setIcon(value);
        }
        else
        {
          this.__titleWidget = new qx.ui.mobile.basic.Atom(this.getTitle(), value);
          this.__titleWidget.addCssClass('dialogTitleUnderline');
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

    /**
     * Adds the widget that will be shown in this popup. This method can be used in the case when you have removed the widget from the popup
     * or you haven't passed it in the constructor. Useful when playing with complex view and the popup
     * is part of that. See the SplitPane, where the widget is removed from the left container
     * and shown in a popup.
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
     */
    removeWidget : function()
    {
      if(this.__widget)
      {
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

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__unregisterEventListener();
    this.__childrenContainer.dispose();
  }
});
