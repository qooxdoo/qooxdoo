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

************************************************************************ */

/**
 * @tag noPlayground
 * @require(qx.bom.Element) // mark as load-time dependency so that the required
 * event dispatcher is loaded before listeners are registered
 */
qx.Class.define("demobrowser.demo.mobile.Fingers",
{
  extend : qx.application.Native,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __startDivX : null,
    __startDivY : null,

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


      // root element
      var backgroundStyles = {
        "width" : "100%",
        "height" : "100%",
        "backgroundColor" : "black",
        "margin" : "0px",
        "touchAction" : "none",
        "msTouchAction" : "none"
      };

      var root = new qx.html.Element("div", backgroundStyles);
      root.useElement(document.body);
      root.setRoot(true);

      var engine = qx.core.Environment.get("engine.name");
      var modernIe = engine == "mshtml" && qx.core.Environment.get("browser.documentmode") > 10;
      if (engine != "webkit" && !modernIe)
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
        root.add(label);
        label.setAttribute("innerHTML", "<b>This demo is intended for WebKit-based browsers and IE11+.</b>");
        return;
      }


      // description label
      var labelStyles = {
        "color" : "white",
        "position" : "absolute",
        "left" : "30px",
        "top" : "20px"
      };
      var label = new qx.html.Element("div", labelStyles);
      root.add(label);
      label.setAttribute("innerHTML", "<b>Use your fingers to move the dots</b>");

      // create some colored balls
      var colors = ["blue", "red", "green", "white", "yellow"];
      for (var i = 0; i < colors.length; i++) {
        var styles = {
          "backgroundColor" : colors[i],
          "width" : "100px",
          "height" : "100px",
          "position" : "absolute",
          "-moz-border-radius" : "50px",
          "-webkit-border-radius": "50px",
          "border-radius" : "50px",
          "top" : ((i + 5) * 30) + "px",
          "left" :  ((i + 1) * 150) + "px"
        };
        var div = new qx.html.Element("div", styles);
        root.add(div);
      }

      this.__startDivX = [];
      this.__startDivY = [];

      // attach the listeners
      root.addListener("pointerdown", this._onPointerDown, this);
      root.addListener("pointermove", this._onPointerMove, this);
    },


    _onPointerDown : function(e) {
      this.__startDivX[e.getPointerId()] = parseInt(e.getTarget().style.left) - e.getDocumentLeft();
      this.__startDivY[e.getPointerId()] = parseInt(e.getTarget().style.top) - e.getDocumentTop();
    },


    _onPointerMove : function(e) {
      if (e.getTarget() == document.body) {
        return;
      }

      qx.bom.element.Style.setStyles(e.getTarget(), {
        "left" : (e.getDocumentLeft() + this.__startDivX[e.getPointerId()]) + "px",
        "top" : (e.getDocumentTop() + this.__startDivY[e.getPointerId()]) + "px"
      });

      e.preventDefault();
    }
  }
});
