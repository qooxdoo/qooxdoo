/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("demobrowser.demo.util.FSMMouse",
{
  extend : qx.util.fsm.FiniteStateMachine,

  statics :
  {
    nextMouse   : 1,
    ticksPerSec : 20,
    fadeSeconds : 0.5,
    moveSeconds : 0.2
  },

  construct : function(origin, maze, facing, view)
  {
    // Determine this mouse's name
    var mouseName = demobrowser.demo.util.FSMMouse.nextMouse.toString();

    // Call our superclass constructor and provide FSM (mouse) name
    this.base(arguments, mouseName);

    // Enable all debugging

    // var FSM = qx.util.fsm.FiniteStateMachine;
    // this.setDebugFlags(FSM.DebugFlags.EVENTS |
    //                    FSM.DebugFlags.TRANSITIONS |
    //                    FSM.DebugFlags.FUNCTION_DETAIL |
    //                    FSM.DebugFlags.OBJECT_NOT_FOUND);

    this.setDebugFlags(0);

    // Update next mouse's name
    ++demobrowser.demo.util.FSMMouse.nextMouse;

    // Save this mouse's facing direction
    this.facing = facing;

    // Save the starting cell
    if (origin === null)
    {
      // This is the initial mouse. Get the location of the starting cell
      this.currentCell = maze.getStartCell();

      // Initialize our list of traversed cells
      this.traversed = [];

      // We've traversed our current cell
      this.traversed.push(this.currentCell);

      // The initial mouse will look behind it in its very first cell
      this.bLookBehind = true;

      // The initial mouse will look sideways
      this.bLookSideways = true;
    }
    else
    {
      // We're a clone.  Our starting cell is our origin's current cell
      this.currentCell = origin.currentCell;

      // Copy our origin's list of traversed nodes
      this.traversed = origin.traversed.concat();

      // Clones never look behind themselves
      this.bLookBehind = false;

      // Clones don't look sideways initially
      this.bLookSideways = false;
    }

    // Get the physical location of our current cell
    this.currentLocation = maze.getCellTopLeft(this.currentCell);

    // Get the appropriate mouse image
    switch(facing)
    {
    case demobrowser.demo.util.FSMMaze.Direction.NORTH:
      this.mouseImage =
        new qx.ui.basic.Image("demobrowser/demo/ui/mouse-north.gif");
      break;

    case demobrowser.demo.util.FSMMaze.Direction.EAST:
      this.mouseImage =
        new qx.ui.basic.Image("demobrowser/demo/ui/mouse-east.gif");
      break;

    case demobrowser.demo.util.FSMMaze.Direction.SOUTH:
      this.mouseImage =
        new qx.ui.basic.Image("demobrowser/demo/ui/mouse-south.gif");
      break;

    case demobrowser.demo.util.FSMMaze.Direction.WEST:
      this.mouseImage =
        new qx.ui.basic.Image("demobrowser/demo/ui/mouse-west.gif");
      break;
    }

    // Position the mouse and make it initially transparent
    this.mouseImage.set(
      {
        opacity : 0.0,
        zIndex  : 9999
      });
    view.add(this.mouseImage,
      {top: this.currentLocation.top, left: this.currentLocation.left});

    //============================================================
    // Create the finite state machine's states and transitions
    //============================================================

    //////////////////////////////////////////////////////////////
    // State: FadingIn
    //
    // Transition on:
    //  "oneshot"
    /////////////////////////////////////////////////////////////

    var state = new qx.util.fsm.State("State_FadingIn",
    {
      "onentry" : function(_this, entry)
      {
        // Start a timer to expire shortly
        _this.oneshot(1000 / demobrowser.demo.util.FSMMouse.ticksPerSec);
      },

      "events" :
      {
        "oneshot"  : qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
      }
    });

    this.addState(state);

    // Transition: FadingIn to FadingIn
    //
    // Cause: "oneshot"
    //
    // Predicate : opacity < 1.0
    //
    // Action:
    //  Increase the opacity

    var trans = new qx.util.fsm.Transition(
                  "Transition_FadingIn_to_FadingIn_via_Oneshot",
    {
      "predicate" : function(_this, event)
      {
        return _this.opacity < 1.0;
      },

      "nextState" : "State_FadingIn",

      "ontransition" : function(_this, event)
      {
        // We want fade in to take N seconds
        _this.opacity +=
          1 / (demobrowser.demo.util.FSMMouse.fadeSeconds * demobrowser.demo.util.FSMMouse.ticksPerSec)
        _this.mouseImage.setOpacity(_this.opacity);
      }
    });

    state.addTransition(trans);

    // Transition: FadingIn to CellArrival
    //
    // Cause : "oneshot"
    //
    // Predicate : None.  We arrive here if previous transition fails.
    //
    // Action:
    //  None

    var trans = new qx.util.fsm.Transition(
                  "Transition_FadingIn_to_CellArrival_via_Oneshot",
    {
      "nextState" : "State_CellArrival"
    });

    state.addTransition(trans);


    /////////////////////////////////////////////////////////////
    // State: CellArrival
    //
    // Transition on:
    //  "oneshot"
    /////////////////////////////////////////////////////////////

    var state = new qx.util.fsm.State("State_CellArrival",
    {
      // Actions on entry:

      //  Determine if there are other possible directions of travel by
      //  looking left and right.  If either of those directions has no wall,
      //  then create a new mouse to continue in that direction.
      "onentry" : function(_this, entry)
      {
        // Have we reached our destination?
        var endCell = maze.getEndCell();
        if (_this.currentCell.row == endCell.row &&
            _this.currentCell.col == endCell.col)
        {
          // Yup.  Generate the backtrack.  Skip the node where the mouse is.
          for (var i = _this.traversed.length - 2; i >= 0; i--)
          {
            maze.markCell(_this.traversed[i]);
          }

          // No need to continue.
          return;
        }

        // Determine what directions we need to look.  We want to look in the
        // directions that are to our left and to our right.
        switch(_this.facing)
        {
        case demobrowser.demo.util.FSMMaze.Direction.WEST:
          // If we were just cloned, unless we're the initial mouse, we don't
          // need to look for other directions to travel.
          if (_this.bLookSideways)
          {
            // See if we can go south
            if (maze.getSouthCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.SOUTH, view);
            }

            // See if we can go north
            if (maze.getNorthCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.NORTH, view);
            }
          }

          // Henceforth, we'll always look sideways
          _this.bLookSideways = true;

          // If we're the initial mouse, see if we can go east
          if (_this.bLookBehind &&
              maze.getEastCell(_this.currentCell) !== null)
          {
            // We can.  Create a clone to go that way
            new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.EAST, view);

            // We only look behind us once.
            _this.bLookBehind = false;
          }

          // See if we can continue on our merry way, or if we've hit a wall.
          _this.destinationCell = maze.getWestCell(_this.currentCell);
          if (_this.destinationCell !== null)
          {
            // We can continue.  Determine our new destination location.
            _this.destinationLocation =
              maze.getCellTopLeft(_this.destinationCell);

            // Dispatch an event to cause us to continue.
            var event = new qx.event.type.Event();
            event.setType("KickInTheAss");
            _this.eventListener(event);
          }
          else
          {
            var event = new qx.event.type.Event();
            event.setType("Die");
            _this.eventListener(event);
          }
          break;

        case demobrowser.demo.util.FSMMaze.Direction.EAST:
          // If we were just cloned, unless we're the initial mouse, we don't
          // need to look for other directions to travel.
          if (_this.bLookSideways)
          {
            // See if we can go south
            if (maze.getSouthCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.SOUTH, view);
            }

            // See if we can go north
            if (maze.getNorthCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.NORTH, view);
            }
          }

          // Henceforth, we'll always look sideways
          _this.bLookSideways = true;

          // If we're the initial mouse, see if we can go west
          if (_this.bLookBehind &&
              maze.getWestCell(_this.currentCell) !== null)
          {
            // We can.  Create a clone to go that way
            new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.WEST, view);

            // We only look behind us once.
            _this.bLookBehind = false;
          }

          // See if we can continue on our merry way, or if we've hit a wall.
          _this.destinationCell = maze.getEastCell(_this.currentCell);
          if (_this.destinationCell !== null)
          {
            // We can continue.  Determine our new destination location.
            _this.destinationLocation =
              maze.getCellTopLeft(_this.destinationCell);

            // Dispatch an event to cause us to continue.
            var event = new qx.event.type.Event();
            event.setType("KickInTheAss");
            _this.eventListener(event);
          }
          else
          {
            var event = new qx.event.type.Event();
            event.setType("Die");
            _this.eventListener(event);
          }
          break;

        case demobrowser.demo.util.FSMMaze.Direction.SOUTH:
          // If we were just cloned, unless we're the initial mouse, we don't
          // need to look for other directions to travel.
          if (_this.bLookSideways)
          {
            // See if we can go west
            if (maze.getWestCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.WEST, view);
            }

            // See if we can go east
            if (maze.getEastCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.EAST, view);
            }
          }

          // Henceforth, we'll always look sideways
          _this.bLookSideways = true;

          // If we're the initial mouse, see if we can go north
          if (_this.bLookBehind &&
              maze.getNorthCell(_this.currentCell) !== null)
          {
            // We can.  Create a clone to go that way
            new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.NORTH, view);

            // We only look behind us once.
            _this.bLookBehind = false;
          }

          // See if we can continue on our merry way, or if we've hit a wall.
          _this.destinationCell = maze.getSouthCell(_this.currentCell);
          if (_this.destinationCell !== null)
          {
            // We can continue.  Determine our new destination location.
            _this.destinationLocation =
              maze.getCellTopLeft(_this.destinationCell);

            // Dispatch an event to cause us to continue.
            var event = new qx.event.type.Event();
            event.setType("KickInTheAss")
            _this.eventListener(event);
          }
          else
          {
            var event = new qx.event.type.Event();
            event.setType("Die");
            _this.eventListener(event);
          }
          break;

        case demobrowser.demo.util.FSMMaze.Direction.NORTH:
          // If we were just cloned, unless we're the initial mouse, we don't
          // need to look for other directions to travel.
          if (_this.bLookSideways)
          {
            // See if we can go west
            if (maze.getWestCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.WEST, view);
            }

            // See if we can go east
            if (maze.getEastCell(_this.currentCell) !== null)
            {
              // We can.  Create a clone to go that way
              new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.EAST, view);
            }
          }

          // Henceforth, we'll always look sideways
          _this.bLookSideways = true;

          // If we're the initial mouse, see if we can go south
          if (_this.bLookBehind &&
              maze.getSouthCell(_this.currentCell) !== null)
          {
            // We can.  Create a clone to go that way
            new demobrowser.demo.util.FSMMouse(_this, maze, demobrowser.demo.util.FSMMaze.Direction.SOUTH, view);

            // We only look behind us once.
            _this.bLookBehind = false;
          }

          // See if we can continue on our merry way, or if we've hit a wall.
          _this.destinationCell = maze.getNorthCell(_this.currentCell);
          if (_this.destinationCell !== null)
          {
            // We can continue.  Determine our new destination location.
            _this.destinationLocation =
              maze.getCellTopLeft(_this.destinationCell);

            // Dispatch an event to cause us to continue.
            var event = new qx.event.type.Event();
            event.setType("KickInTheAss");
            _this.eventListener(event);
          }
          else
          {
            var event = new qx.event.type.Event();
            event.setType("Die");
            _this.eventListener(event);
          }
          break;
        }

        _this.bLookBehind = false;
      },

      "events" :
      {
        "Die"          : "Transition_CellArrival_to_FadingOut_via_Die",
        "KickInTheAss" : "Transition_CellArrival_to_Moving_via_KickInTheAss"
      }
    });

    this.addState(state);

    // Transition: CellArrival to FadingOut
    //
    // Cause: "Die"

    var trans = new qx.util.fsm.Transition(
                  "Transition_CellArrival_to_FadingOut_via_Die",
    {
      "nextState" : "State_FadingOut"
    });

    state.addTransition(trans);

    // Transition: CellArrival to Moving
    //
    // Cause: "KickInTheAss"

    var trans = new qx.util.fsm.Transition(
                  "Transition_CellArrival_to_Moving_via_KickInTheAss",
    {
      "nextState" : "State_Moving"
    });

    state.addTransition(trans);


    /////////////////////////////////////////////////////////////
    // State: FadingOut
    //
    // Transition on:
    //  "oneshot"
    /////////////////////////////////////////////////////////////

    var state = new qx.util.fsm.State("State_FadingOut",
    {
      "onentry" : function(_this, entry)
      {
        // Start a timer to expire shortly
        _this.oneshot(1000 / demobrowser.demo.util.FSMMouse.ticksPerSec);
      },

      "events" :
      {
        "oneshot"  : qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
      }
    });

    this.addState(state);

    // Transition: FadingOut to FadingOut
    //
    // Cause: "oneshot"
    //
    // Predicate : opacity > 0.0
    //
    // Action:
    //  Decrease the opacity

    var trans = new qx.util.fsm.Transition(
                  "Transition_FadingOut_to_FadingOut_via_Oneshot",
    {
      "predicate" : function(_this, event)
      {
        return _this.opacity > 0.0;
      },

      "nextState" : "State_FadingOut",

      "ontransition" : function(_this, event)
      {
        // We want fade in to take N seconds
        _this.opacity -=
          1 / (demobrowser.demo.util.FSMMouse.fadeSeconds * demobrowser.demo.util.FSMMouse.ticksPerSec);
        if (_this.opacity < 0.0)
        {
          _this.opacity = 0.0;
        }
        _this.mouseImage.setOpacity(_this.opacity);
      }
    });

    state.addTransition(trans);

    // Transition: FadingOut to Zombie
    //
    // Cause : "oneshot"
    //
    // Predicate : None.  We arrive here if previous transition fails.
    //
    // Action:
    //  None

    var trans = new qx.util.fsm.Transition(
                  "Transition_FadingOut_to_Zombie_via_Oneshot",
    {
      "nextState" : "State_Zombie"
    });

    state.addTransition(trans);


    /////////////////////////////////////////////////////////////
    // State: Moving
    //
    // Transition on:
    //  "oneshot"
    /////////////////////////////////////////////////////////////

    var state = new qx.util.fsm.State("State_Moving",
    {
      "onentry" : function(_this, entry)
      {
        // Start a timer to expire shortly
        _this.oneshot(1000 / demobrowser.demo.util.FSMMouse.ticksPerSec);
      },

      "events" :
      {
        "oneshot"  : qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
      }
    });

    this.addState(state);

    // Transition: Moving to Moving
    //
    // Cause: "oneshot"
    //
    // Predicate : destination cell not yet reached
    //
    // Action:
    //  Move towards the destination cell

    var trans = new qx.util.fsm.Transition(
                  "Transition_Moving_to_Moving_via_Oneshot",
    {
      "predicate" : function(_this, event)
      {
        switch(_this.facing)
        {
        case demobrowser.demo.util.FSMMaze.Direction.WEST:
          return _this.currentLocation.left > _this.destinationLocation.left;

        case demobrowser.demo.util.FSMMaze.Direction.SOUTH:
          return _this.currentLocation.top < _this.destinationLocation.top;

        case demobrowser.demo.util.FSMMaze.Direction.EAST:
          return _this.currentLocation.left < _this.destinationLocation.left;

        case demobrowser.demo.util.FSMMaze.Direction.NORTH:
          return _this.currentLocation.top > _this.destinationLocation.top;

        }
      },

      "nextState" : "State_Moving",

      "ontransition" : function(_this, event)
      {
        // We want move to take N seconds
        var moveAmount =
          Math.ceil(maze.cellSize /
                    (demobrowser.demo.util.FSMMouse.moveSeconds * demobrowser.demo.util.FSMMouse.ticksPerSec));

        // Determine which direction we're moving, and move.
        switch(_this.facing)
        {
        case demobrowser.demo.util.FSMMaze.Direction.WEST:
          _this.currentLocation.left =
            Math.round(_this.currentLocation.left - moveAmount);
          _this.mouseImage.setLayoutProperties({
            left: _this.currentLocation.left,
            top: _this.currentLocation.top
          });
          break;

        case demobrowser.demo.util.FSMMaze.Direction.SOUTH:
          _this.currentLocation.top =
            Math.round(_this.currentLocation.top + moveAmount);
          _this.mouseImage.setLayoutProperties({
            left: _this.currentLocation.left,
            top: _this.currentLocation.top
          });
          break;

        case demobrowser.demo.util.FSMMaze.Direction.EAST:
          _this.currentLocation.left =
            Math.round(_this.currentLocation.left + moveAmount);
          _this.mouseImage.setLayoutProperties({
            left: _this.currentLocation.left,
            top: _this.currentLocation.top
          });
          break;

        case demobrowser.demo.util.FSMMaze.Direction.NORTH:
          _this.currentLocation.top =
            Math.round(_this.currentLocation.top - moveAmount);
          _this.mouseImage.setLayoutProperties({
            left: _this.currentLocation.left,
            top: _this.currentLocation.top
          });
          break;
        }
      }
    });

    state.addTransition(trans);

    // Transition: Moving to CellArrival
    //
    // Cause: "oneshot"
    //
    // Predicate : destination cell has been reached
    //
    // Action:
    //  Move towards the destination cell

    var trans = new qx.util.fsm.Transition(
                  "Transition_Moving_to_CellArrival_via_Oneshot",
    {
      "nextState" : "State_CellArrival",

      "ontransition" : function(_this, event)
      {
        // We're now at the destination cell.
        _this.currentCell = _this.destinationCell;

        // Save the path.  Record that we've visited this destination cell.
        _this.traversed.push(_this.currentCell);
      }
    });

    state.addTransition(trans);


    /////////////////////////////////////////////////////////////
    // State: Zombie
    /////////////////////////////////////////////////////////////

    var state = new qx.util.fsm.State("State_Zombie",
    {
      "onentry" : function(_this, entry)
      {
        qx.event.Timer.once(
          function()
          {
            view.remove(this.mouseImage);
            this.mouseImage.dispose();
            this.mouseImage = null;
            this.dispose();
          },
          _this,
          0);
      },

      "events" :
      {
      }
    });

    this.addState(state);

    // Start the finite state machine running
    this.start();
  },

  members :
  {
    opacity : 0.0,

    oneshot : function(timeout)
    {
      // Create time instance
      var timer = new qx.event.Timer(timeout);

      // Add event listener to interval
      timer.addListener(
        "interval",
        function()
        {
          timer.dispose();
          var event = new qx.event.type.Event();
          event.setType("oneshot");
          this.eventListener(event);
        },
        this);

      // Directly start timer
      timer.start();
    }
  }
});