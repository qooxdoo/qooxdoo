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
    this.base(arguments);
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

      var descriptionText = "<b>Testing Touch Events:</b> Touch / Tap / Swipe the green area</br><b>Testing OrientationChange Event</b>: Rotate your device / change browser size";
      this.getContent().add(new qx.ui.mobile.basic.Label(descriptionText), {flex:1});
      this.getContent().add(container, {flex:1});
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
     * Event handler.
     *
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouch : function(evt)
    {
      var type = evt.getType();
      if (type == "touchstart") {
        this.__label.setValue("");
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