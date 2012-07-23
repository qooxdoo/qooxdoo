/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page responsible for showing the "event" showcase.
 */
qx.Class.define("mobileshowcase.page.Event",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments, false);
    this.setTitle("Events");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    __container : null,
    __label : null,
    __inMove : null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var container = this.__container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      }));
      
      container.addCssClass("eventcontainer");
      container.addListener("tap", this._onTap, this);
      container.addListener("swipe", this._onSwipe, this);
      container.addListener("touchstart", this._onTouch, this);
      container.addListener("touchmove", this._onTouch, this);
      container.addListener("touchend", this._onTouch, this);
      qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);

      var label = this.__label = new qx.ui.mobile.basic.Label("Touch / Tap / Swipe this area");
      container.add(label);

      var descriptionText = "<b>Testing Touch Events:</b> Touch / Tap / Swipe the area</br><b>Testing OrientationChange Event</b>: Rotate your device / change browser size";
      var descriptionLabel = new qx.ui.mobile.basic.Label(descriptionText);
     
      var descriptionGroup = new qx.ui.mobile.form.Group([descriptionLabel]);
      var containerGroup = new qx.ui.mobile.form.Group([container]);
      this.getContent().add(descriptionGroup, {flex:1});
      this.getContent().add(containerGroup, {flex:1});
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Tap} The tap event.
     */
    _onTap : function(evt)
    {
      this.__label.setValue(this.__label.getValue() + " tap");
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe : function(evt)
    {
      this.__label.setValue(this.__label.getValue() + " swipe");
    },


    /**
     * Event handler for orientationchange event.
     */
    _onOrientationChange : function(evt) {
      var orientationMode = "Portrait";
      if(evt.isLandscape()){
        orientationMode = "Landscape";
      }
      this.__label.setValue(" " + evt.getType()+": "+orientationMode);
    },
    
    
    /**
     * Reacts on touch events and updates the event container background.
     */
    __updateContainerBackground : function(evt) {
      
      var containerElement = this.__container.getContentElement();
      var viewportLeft = evt.getViewportLeft();
      var viewportTop = evt.getViewportTop();
      var containerLeft = qx.bom.element.Location.getLeft(this.__container.getContentElement(), "scroll");
      var containerTop = qx.bom.element.Location.getTop(this.__container.getContentElement(), "scroll");
      
      var touchLeft = viewportLeft-containerLeft;
      var touchTop = viewportTop-containerTop;
      
      var isFirefox = qx.core.Environment.get("browser.name")=="firefox";
      if(isFirefox) {
        // Firefox
        qx.bom.element.Style.set(containerElement,"background","-moz-radial-gradient("+touchLeft+"px "+touchTop+"px, cover, #1a82f7, #2F2727)");
      } else {
        // Chrome
        qx.bom.element.Style.set(containerElement,"background","-webkit-radial-gradient("+touchLeft+"px "+touchTop+"px, cover, #1a82f7, #2F2727)");
      }
    },


    /**
     * Event handler.
     *
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouch : function(evt)
    {
      this.__updateContainerBackground(evt);
       
      var type = evt.getType();
      if (type == "touchstart") {
        // Disable iScroll before
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().disable();
        }
        this.__label.setValue("");
      } else if (type == "touchend") {
        // Re-enable iScroll after touchend event
        if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
          this._getScrollContainer().enable();
        }
      }
      
      this.__label.setValue(this.__label.getValue() + " " + evt.getType());
    },
    
    
    // overridden
    _back : function()
    {
     qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});