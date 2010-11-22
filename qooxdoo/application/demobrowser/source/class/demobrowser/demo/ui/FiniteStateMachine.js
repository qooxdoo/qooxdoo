/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("demobrowser.demo.ui.FiniteStateMachine", 
{
  extend : qx.application.Standalone,


  construct : function()
  {
    this.base(arguments);
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     */
    main : function()
    {
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      var description =
        "This is a simple example of using a finite state machine, in " +
        "which virtual mice solve a maze. " +
        "<p>" +
        "Each mouse is quite dumb, having in " +
        "its arsenal of knowledge only these characteristics: it knows " +
        "only how to travel in a single direction (the direction in " +
        "which it was instantiated); when it " +
        "arrives at a new cell, it looks left and right and creates a " +
        "clone of itself to go each available direction; upon hitting a " +
        "wall, it dies." +
        "<p>" +
        "The initial mouse is a bit special, in that it looks for " +
        "the possibility to clone a mouse to travel in the direction " +
        "behind it, as well as to its left and right." +
        "<p>" +
        "Each mouse is driven by (and in fact, in this example, is a " +
        "subclass of) a finite state machine.  The FSM has five states: " +
        "FadingIn, CellArrival (look for cloning opportunities), Moving, " +
        "FadingOut, and Zombie (about to dispose)." +
        "<p>" +
        "<u>The finite state diagram is below the maze.</u>";

      var o;
      
      // Ensure that the FSM diagram gets copied during build (and cached)
      o = new qx.ui.basic.Image("demobrowser/image/FsmMiceMaze.png");
      o = null;               // image no longer needed

      o = new qx.ui.basic.Label(description);
      o.set(
        {
          width : 600,
          wrap : true,
          rich : true
        });
      this.getRoot().add(o, {left: 50});
      var maze = new demobrowser.demo.util.FSMMaze(10, 10, 50, 240);
      // maze.addToDocument();
      this.getRoot().add(maze, {left: 50, top: 240});

      o = new qx.ui.basic.Image("demobrowser/image/FsmMiceMaze.png", 800);
      this.getRoot().add(o, {left: 50, top: 800});

      // Determine (randomly) the facing direction of the initial mouse
      var facing;
      var random = Math.floor(Math.random() * 4);
      switch(random)
      {
      case 0:
        facing = demobrowser.demo.util.FSMMaze.Direction.NORTH;
        break;

      case 1:
        facing = demobrowser.demo.util.FSMMaze.Direction.EAST;
        break;

      case 2:
        facing = demobrowser.demo.util.FSMMaze.Direction.SOUTH;
        break;

      case 3:
        facing = demobrowser.demo.util.FSMMaze.Direction.WEST;
        break;

      }

      // Create the initial mouse
      var mouse = new demobrowser.demo.util.FSMMouse(null, maze, facing);
    },


    /**
     * TODOC
     *
     * @type member
     */
    close : function()
    {
      this.base(arguments);
    },


    /**
     * TODOC
     *
     * @type member
     */
    terminate : function() {
      this.base(arguments);
    }
  }
});
