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

qx.Class.define("demobrowser.demo.mobile.Pong",
{
  extend : qx.application.Native,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __rightPaddel : null,
    __leftPaddel : null,
    __ball : null,
    __gameTimer : null,

    __speed : 5,
    __xDirection : 1,
    __yDirection : 1,
    __score : null,
    __scoreDiv : null,    
    
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
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
        "margin" : "0px"        
      };
      var root = new qx.html.Element("div", backgroundStyles);
      root.useElement(document.body);
      root.setRoot(root);
      
      
      
      // LEFT
      var leftFieldStyles = {
        "width" : "50%",
        "height" : "100%",
        "position" : "absolute",        
        "backgroundColor" : "black",
        "border-right" : "1px solid white"
      };
      var leftField = new qx.html.Element("div", leftFieldStyles);
      root.add(leftField);
      
      var leftPaddelStyles = {
        "width" : "30px",
        "height" : "100px",
        "left" : "20px",
        "top" : "100px",
        "position" : "absolute",        
        "backgroundColor" : "white"     
      }
      this.__leftPaddel = new qx.html.Element("div", leftPaddelStyles);
      leftField.add(this.__leftPaddel);
      
      leftField.addListener("touchmove", function(e) {
        var touches = e.getTargetTouches();
        for (var i = 0; i < touches.length; i++) {
          this.__leftPaddel.setStyles({"top" : (touches[i].pageY - 50) + "px"});
        };
      }, this);
      
      
      
      // RIGHT
      var rightFieldStyles = {
        "left" : "50%",
        "width" : "50%",
        "height" : "100%",
        "position" : "absolute",        
        "backgroundColor" : "black",
        "border-left" : "1px solid white"        
      };
      var rightField = new qx.html.Element("div", rightFieldStyles);
      root.add(rightField);
      
      var rightPaddelStyles = {
        "width" : "30px",
        "height" : "100px",
        "right" : "20px",
        "top" : "100px",
        "position" : "absolute",        
        "backgroundColor" : "white"        
      }
      this.__rightPaddel = new qx.html.Element("div", rightPaddelStyles);
      rightField.add(this.__rightPaddel);
      
      
      rightField.addListener("touchmove", function(e) {
        var touches = e.getTargetTouches();
        for (var i = 0; i < touches.length; i++) {
          this.__rightPaddel.setStyles({"top" : (touches[i].pageY - 50) + "px"});
        };
      }, this);

      // BALL
      var ballStyles = {
        "width" : "20px",
        "height" : "20px",
        "position" : "absolute",        
        "backgroundColor" : "white"        
      };
      this.__ball = new qx.html.Element("div", ballStyles);
      root.add(this.__ball);
      this.__score = [0, 0];
      
      
      
      
      // SCORE
      var scoreStyles = {
        "left" : "50px",
        "top" : "20px",
        "position" : "absolute",
        "color" : "white"
      };      
      this.__scoreDiv = new qx.html.Element("div", scoreStyles);
      root.add(this.__scoreDiv);
      qx.html.Element.flush();
      this.__scoreDiv.getDomElement().innerHTML = "0 : 0";
      
      // START
      this.__startGame();
    },

    
    __startGame : function() {
      // set ball start position
      this.__ball.setStyles({"left" : "200px", "top" : "200px"});
      
      // ball movement
      this.__gameTimer = new qx.event.Timer(40);
      this.__gameTimer.addListener("interval", function() {
        this.__ball.setStyle("left", (parseInt(this.__ball.getStyle("left")) + this.__speed * this.__xDirection) + "px");
        this.__ball.setStyle("top", (parseInt(this.__ball.getStyle("top")) + this.__speed * this.__yDirection) + "px");
        
        this.__detectColision();
      }, this);
      this.__gameTimer.start();
    },


    __restartGame : function(player) {
      this.__gameTimer.stop();
      this.__gameTimer.dispose();
      this.__speed = 5;
      
      this.__score[player] = this.__score[player] + 1;
      this.__scoreDiv.getDomElement().innerHTML = this.__score[0] + " : " + this.__score[1];
      
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
            
      // left paddel collision
      var leftPaddleBounds = this.getBoundsFor(this.__leftPaddel);      
      if (
        ballBounds.left <= leftPaddleBounds.right && 
        ballBounds.bottom >= leftPaddleBounds.top &&
        ballBounds.top <= leftPaddleBounds.bottom
      ) {
        this.__xDirection = 1;
        this.__speed = Math.min(this.__speed + 1, 20);
      }
      
      // right paddel collision
      var rightPaddleBounds = this.getBoundsFor(this.__rightPaddel);      
      if (
        ballBounds.right >= rightPaddleBounds.left && 
        ballBounds.bottom >= rightPaddleBounds.top &&
        ballBounds.top <= rightPaddleBounds.bottom
      ) {
        this.__xDirection = -1;
        this.__speed++;
      }      
    },


    getBoundsFor : function(elem) {
      return qx.bom.element.Location.get(elem.getDomElement());
    }
  }
});