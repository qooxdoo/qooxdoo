/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * tbtz (Tino Butz)

************************************************************************ */

/* ************************************************************************
 #asset(demobrowser/demo/mobile/qooxdoo-logo.png)
************************************************************************ */

/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.mobile.ScaleImage",
{
  extend : qx.application.Native,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __image : null,
    __initialScale : 1,
    __initialRotation : 0,
    __currentRotation : 0,
    __currentScale : 0,

    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      var container = new qx.html.Element("div");
      container.useElement(document.body);
      container.setRoot(true);


      if (qx.core.Environment.get("engine.name") != "webkit" ||
        !qx.core.Environment.get("event.touch"))
      {
        var warningLabelStyle = {
          "color" : "green",
          "position" : "absolute",
          "font-family": 'Lucida Grande',
          "font-size" : "12px",
          "left" : "30px",
          "top" : "20px"
        };
        var label = new qx.html.Element("div", warningLabelStyle);
        container.add(label);
        label.setAttribute("innerHTML", "<b>This demo is supposed to be run in a WebKit-based browser on a touch-enabled device.</b>");
        return;
      }


      var imgUrl = qx.util.ResourceManager.getInstance().toUri("demobrowser/demo/mobile/qooxdoo-logo.png");
      var imageStyle = {
          "width" : "200px",
          "height" : "59px",
          "position" : "absolute",
          "left" : "50px",
          "top" : "50px",
          "background" : "url("+ imgUrl +")"
      };

      this.__image = new qx.html.Element("div", imageStyle);
      this.__image.addListener("touchmove", this.__onTouchMove, this);
      this.__image.addListener("touchend", this.__onTouchEnd, this);
      container.add(this.__image);
    },


    __onTouchMove : function(e) {
      if (e.isMultiTouch())
      {
        this.__currentRotation = e.getRotation() + this.__initialRotation;
        this.__currentScale = e.getScale() * this.__initialScale;
        this.__image.setStyle("-webkit-transform", "rotate(" + this.__currentRotation + "deg) scale(" + this.__currentScale + ")");
      }
      else
      {
        var left =  parseInt(e.getDocumentLeft()) - (parseInt(this.__image.getStyle("width")) / 2);
        var top =  parseInt(e.getDocumentTop()) - (parseInt(this.__image.getStyle("height")) / 2);
        this.__image.setStyles({
          "left" : left + "px",
          "top" : top + "px"
        });
      }
    },


    __onTouchEnd : function(e)
    {
      if (e.isMultiTouch())
      {
        this.__initialRotation = this.__currentRotation;
        this.__initialScale = this.__currentScale;
      }
    }
  }
});
