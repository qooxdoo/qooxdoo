/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * tbtz (Tino Butz)

************************************************************************ */

/**
 * @tag noPlayground
 * @require(qx.bom.Element) // mark as load-time dependency so that the required
 * event dispatcher is loaded before listeners are registered
 */
qx.Class.define("demobrowser.demo.mobile.PingPong",
{
  extend : qx.application.Native,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __rightPaddle : null,
    __leftPaddle : null,
    __ball : null,
    __gameTimer : null,

    __speed : 5,
    __xDirection : 1,
    __yDirection : 1,
    __score : null,
    __scoreDivLeft : null,
    __scoreDivRight : null,
    __leftField : null,

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


      // ROOT
      var backgroundStyles = {
        "width" : "100%",
        "height" : "100%",
        "backgroundColor" : "black",
        "margin" : "0px",
        "userSelect" : "none",
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

      // Field
      this.__leftField = this.__createField("left");
      root.add(this.__leftField);

      var rightField = this.__createField("right");
      root.add(rightField);


      // Paddles
      this.__leftPaddle = this.__createPaddle("left");
      this.__leftField.add(this.__leftPaddle);
      this.__leftField.addListener("pointermove",
        qx.lang.Function.bind(this.__onPointerMove, this),
        this
      );

      this.__rightPaddle = this.__createPaddle("right");
      rightField.add(this.__rightPaddle);
      rightField.addListener("pointermove",
        qx.lang.Function.bind(this.__onPointerMove, this),
        this
      );


      // Ball
      this.__ball = this.__createBall();
      root.add(this.__ball);


      // Scores
      this.__scoreDivLeft = this.__createScore();
      this.__leftField.add(this.__scoreDivLeft);
      this.__scoreDivRight = this.__createScore();
      rightField.add(this.__scoreDivRight);
      // initialize score
      this.__score = [0, 0];


      // START
      this.__startGame();
    },


    /*
    ---------------------------------------------------------------------------
      GAME CONTROLL
    ---------------------------------------------------------------------------
    */

    __startGame : function() {
      // set ball start position
      this.__ball.setStyles({"left" : "200px", "top" : "200px"});

      // ball movement
      this.__gameTimer = new qx.event.Timer(40);
      this.__gameTimer.addListener("interval", function() {
        var x = (parseInt(this.__ball.getStyle("left")) + this.__speed * this.__xDirection);
        var y = (parseInt(this.__ball.getStyle("top")) + this.__speed * this.__yDirection);
        this.__ball.setStyle("left", x + "px");
        this.__ball.setStyle("top", y + "px");

        this.__detectColision();
      }, this);
      this.__gameTimer.start();
    },


    __restartGame : function(player) {
      this.__gameTimer.stop();
      this.__gameTimer.dispose();
      this.__speed = 5;

      this.__score[player] = this.__score[player] + 1;
      this.__scoreDivLeft.setAttribute("innerHTML", this.__score[0]);
      this.__scoreDivRight.setAttribute("innerHTML", this.__score[1]);

      this.__startGame();
    },


    __detectColision : function() {
      var ballBounds = this.getBoundsFor(this.__ball);

      // top wall
      if (ballBounds.top <= 0) {
        this.__yDirection = 1;
      }

      // bottom wall
      if (ballBounds.bottom >= window.innerHeight - 5) {
        this.__yDirection = -1;
      }

      // left / right wall
      if (ballBounds.left <= 0 || ballBounds.right >= window.innerWidth) {
        this.__restartGame(ballBounds.left <= 0 ? 1 : 0);
      }

      // left Paddle collision
      var leftPaddleBounds = this.getBoundsFor(this.__leftPaddle);
      if (
        ballBounds.left <= leftPaddleBounds.right &&
        ballBounds.bottom >= leftPaddleBounds.top &&
        ballBounds.top <= leftPaddleBounds.bottom
      ) {
        this.__xDirection = 1;
        this.__speed = Math.min(this.__speed + 1, 20);
      }

      // right Paddle collision
      var rightPaddleBounds = this.getBoundsFor(this.__rightPaddle);
      if (
        ballBounds.right >= rightPaddleBounds.left &&
        ballBounds.bottom >= rightPaddleBounds.top &&
        ballBounds.top <= rightPaddleBounds.bottom
      ) {
        this.__xDirection = -1;
        this.__speed = Math.min(this.__speed + 1, 20);
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    __onPointerMove : function(e) {
      var paddle;
      if (qx.dom.Hierarchy.contains(this.__leftField.getDomElement(), e.getTarget())) {
        paddle = this.__leftPaddle;
      } else {
        paddle = this.__rightPaddle;
      }

      paddle.setStyles({"top" : (e.getDocumentTop() - 50) + "px"});

      e.preventDefault();
    },


    getBoundsFor : function(elem) {
      return qx.bom.element.Location.get(elem.getDomElement());
    },


    /*
    ---------------------------------------------------------------------------
      BUILDING BLOCKS
    ---------------------------------------------------------------------------
    */

    __createField : function(side) {
      var styles = {
        "width" : "50%",
        "height" : "100%",
        "position" : "absolute",
        "backgroundColor" : "black"
      };

      if (side == "left") {
        styles["border-right"] = "1px solid white";
      } else {
        styles["left"] = "50%";
        styles["border-left"] = "1px solid white";
      }

      return new qx.html.Element("div", styles);
    },


    __createPaddle : function(side) {
      var styles = {
        "width" : "30px",
        "height" : "100px",
        "top" : "100px",
        "position" : "absolute",
        "backgroundColor" : "white"
      };

      styles[side] = "20px";

      return new qx.html.Element("div", styles);
    },


    __createBall : function() {
      var styles = {
        "width" : "20px",
        "height" : "20px",
        "position" : "absolute",
        "backgroundColor" : "white",
        "userSelect" : "none"
      };
      return new qx.html.Element("div", styles);
    },


    __createScore : function() {
      var styles = {
        "width" : "100%",
        "height" : "100%",
        "textAlign" : "center",
        "fontSize" : "15em",
        "color" : "#333",
        "fontFamily" : "Arial"
      };
      var elem = new qx.html.Element("div", styles);
      elem.setAttribute("innerHTML", "0");
      return elem;
    }
  }
});
