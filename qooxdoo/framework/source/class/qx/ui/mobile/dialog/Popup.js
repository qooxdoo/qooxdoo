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
    qx.core.Init.getApplication().getRoot().add(this);
    if(widget) {
      this.__initializeChild(widget);
    }
    if(anchor) {
      this.__anchor = anchor;
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
        var left = qx.bom.element.Location.getLeft(this.__anchor.getContainerElement());
        var top = qx.bom.element.Location.getTop(this.__anchor.getContainerElement());
        this._positionTo(left, top);
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
        this._updatePosition();
        this.__registerEventListener();
        this.base(arguments);
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
      if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
      {
        qx.event.message.Bus.getInstance().subscribe("iscrollstart", this.hide, this);
      }
      else
      {
        qx.event.Registration.addListener(window, "scroll", this.hide, this);
      }
    },


    /**
     * Unregisters all needed event listeners
     */
    __unregisterEventListener : function()
    {
      qx.event.Registration.removeListener(window, "resize", this._updatePosition, this);
      if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
      {
        qx.event.Registration.removeListener(window, "iscrollstart", this.hide, this);
      }
      else
      {
        qx.event.Registration.removeListener(window, "scroll", this.hide, this);
      }
    },
    
    /**
     * This method creates the container where the popup's widget will be placed
     * and adds it to the popup.
     * @param widget {qx.ui.mobile.core.Widget} - what to show in the popup
     * 
     */
    __initializeChild : function(widget)
    {
      if(this.__childrenContainer == null) {
        this.__childrenContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({alignY: "middle"}));
        this._add(this.__childrenContainer);
      }
      this.__childrenContainer.add(widget);
      this.__widget = widget;
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
      this.__initializeChild(widget);
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
