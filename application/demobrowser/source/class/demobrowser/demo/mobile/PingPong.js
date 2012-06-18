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

/**
 * @tag noPlayground
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
        "userSelect" : "none"
      };
      var root = new qx.html.Element("div", backgroundStyles);
      root.useElement(document.body);
      root.setRoot(true);

      if (qx.core.Environment.get("engine.name") != "webkit")
      {
        var warningLabelStyle = {
          "color" : "green",
          "font-family": 'Lucida Grande',
          "font-size" : "12px",
          "position" : "absolute",
          "left" : "30px",
          "top" : "20px"
        };
        var label = new qx.html.Element("div", warningLabelStyle);
        root.add(label);
        label.setAttribute("innerHTML", "<b>This demo is supposed to be run in a WebKit-based browser.</b>");
        return;
      }

      // Field
      var leftField = this.__createField("left");
      root.add(leftField);

      var rightField = this.__createField("right");
      root.add(rightField);


      // Paddles
      this.__leftPaddle = this.__createPaddle("left");
      leftField.add(this.__leftPaddle);
      leftField.addListener("touchmove",
        qx.lang.Function.bind(this.__onTouchMove, this, this.__leftPaddle),
        this
      );

      this.__rightPaddle = this.__createPaddle("right");
      rightField.add(this.__rightPaddle);
      rightField.addListener("touchmove",
        qx.lang.Function.bind(this.__onTouchMove, this, this.__rightPaddle),
        this
      );


      // Ball
      this.__ball = this.__createBall();
      root.add(this.__ball);


      // Scores
      this.__scoreDivLeft = this.__createScore();
      leftField.add(this.__scoreDivLeft);
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

    __onTouchMove : function(paddle, e) {
      paddle.setStyles({"top" : (e.getDocumentTop() - 50) + "px"});
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
