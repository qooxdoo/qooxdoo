/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006, 2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(util_fsm)

************************************************************************ */

/**
 * Create a new state which may be added to a finite state machine.
 */
qx.Class.define("qx.util.fsm.State",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param stateName {String}
   *   The name of this state.  This is the name which may be referenced in
   *   objects of class qx.util.fsm.Transition, when passing of
   *   the the transition's predicate means transition to this state.
   *
   * @param stateInfo {Map}
   *   <pre>
   *   An object containing any of the following properties:
   *
   *     onentry -
   *       A function which is called upon entry to the state.  Its signature
   *       is function(fsm, event) and it is saved in the onentry property of
   *       the state object.  (This function is called after the Transition's
   *       action function and after the previous state's onexit function.)
   *
   *       In the onentry function:
   *
   *         fsm -
   *           The finite state machine object to which this state is attached.
   *
   *         event -
   *           The event that caused the finite state machine to run
   *
   *     onexit -
   *       A function which is called upon exit from the state.  Its signature
   *       is function(fsm, event) and it is saved in the onexit property of
   *       the state object.  (This function is called after the Transition's
   *       action function and before the next state's onentry function.)
   *
   *       In the onexit function:
   *
   *         fsm -
   *           The finite state machine object to which this state is attached.
   *
   *         event -
   *           The event that caused the finite state machine to run
   *
   *     autoActionsBeforeOnentry -
   *     autoActionsAfterOnentry -
   *     autoActionsBeforeOnexit -
   *     autoActionsAfterOnexit -
   *       Automatic actions which take place at the time specified by the
   *       property name.  In all cases, the action takes place immediately
   *       before or after the specified function.
   *
   *       The property value for each of these properties is an object which
   *       describes some number of functions to invoke on a set of specified
   *       objects (typically widgets).
   *
   *       An example, using autoActionsBeforeOnentry, might look like this:
   *
   *       "autoActionsBeforeOnentry" :
   *       {
   *         // The name of a function.
   *         "enabled" :
   *         [
   *           {
   *             // The parameter value, thus "setEnabled(true);"
   *             "parameters" : [ true ],
   *
   *             // The function would be called on each object:
   *             //  this.getObject("obj1").setEnabled(true);
   *             //  this.getObject("obj2").setEnabled(true);
   *             "objects" : [ "obj1", "obj2" ],
   *
   *             // And similarly for each object in each specified group.
   *             "groups"  : [ "group1", "group2" ]
   *           }
   *         ],
   *
   *         // The name of another function.
   *         "visible" :
   *         [
   *           {
   *             // The parameter value, thus "setEnabled(true);"
   *             "parameters" : [ false ],
   *
   *             // The function would be called on each object and group, as
   *             // described above.
   *             "objects" : [ "obj3", "obj4" ],
   *             "groups"  : [ "group3", "group4" ]
   *           }
   *         ]
   *       };
   *
   *     events (required) -
   *       A description to the finite state machine of how to handle a
   *       particular event, optionally associated with a specific target
   *       object on which the event was dispatched.  This should be an object
   *       containing one property for each event which is either handled or
   *       blocked.  The property name should be the event name.  The property
   *       value should be one of:
   *
   *         (a) qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
   *
   *         (b) qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED
   *
   *         (c) a string containing the name of an explicit Transition to use
   *
   *         (d) an object where each property name is the Friendly Name of an
   *             object (meaning that this rule applies if both the event and
   *             the event's target object's Friendly Name match), and its
   *             property value is one of (a), (b) or (c), above.
   *
   *       This object is saved in the events property of the state object.
   *
   *     Additional properties may be provided in stateInfo.  They will not be
   *     used by the finite state machine, but will be available via
   *     this.getUserData("<propertyName>") during the state's onentry and
   *     onexit functions.
   *   </pre>
   */
  construct : function(stateName, stateInfo)
  {
    // Call our superclass' constructor
    this.base(arguments);

    // Save the state name
    this.setName(stateName);

    // Ensure they passed in an object
    if (typeof (stateInfo) != "object") {
      throw new Error("State info must be an object");
    }

    // Save data from the stateInfo object
    for (var field in stateInfo)
    {
      // If we find one of our properties, call its setter.
      switch(field)
      {
        case "onentry":
          this.setOnentry(stateInfo[field]);
          break;

        case "onexit":
          this.setOnexit(stateInfo[field]);
          break;

        case "autoActionsBeforeOnentry":
          this.setAutoActionsBeforeOnentry(stateInfo[field]);
          break;

        case "autoActionsAfterOnentry":
          this.setAutoActionsAfterOnentry(stateInfo[field]);
          break;

        case "autoActionsBeforeOnexit":
          this.setAutoActionsBeforeOnexit(stateInfo[field]);
          break;

        case "autoActionsAfterOnexit":
          this.setAutoActionsAfterOnexit(stateInfo[field]);
          break;

        case "events":
          this.setEvents(stateInfo[field]);
          break;

        default:
          // Anything else is user-provided data for their own use.  Save it.
          this.setUserData(field, stateInfo[field]);

          // Log it in case it was a typo and they intended a built-in field
          this.debug("State " + stateName + ": " +
                     "Adding user-provided field to state: " + field);

          break;
      }
    }

    // Check for required but missing properties
    if (!this.getEvents()) {
      throw new Error("The events object must be provided in new state info");
    }

    // Initialize the transition list
    this.transitions = {};
  },


  statics :
  {
    /*
    ---------------------------------------------------------------------------
      CLASS CONSTANTS
    ---------------------------------------------------------------------------
    */

    /**
     * Common function for checking the value provided for
     * auto actions.
     *
     * Auto-action property values passed to us look akin to:
     *
     *     <pre class='javascript'>
     *     {
     *       // The name of a function.
     *       "setEnabled" :
     *       [
     *         {
     *           // The parameter value(s), thus "setEnabled(true);"
     *           "parameters"   : [ true ],
     *
     *           // The function would be called on each object:
     *           //  this.getObject("obj1").setEnabled(true);
     *           //  this.getObject("obj2").setEnabled(true);
     *           "objects" : [ "obj1", "obj2" ]
     *
     *           // And similarly for each object in each specified group.
     *           "groups"  : [ "group1", "group2" ],
     *         }
     *       ];
     *
     *       "setTextColor" :
     *       [
     *         {
     *           "parameters" : [ "blue" ]
     *           "groups"     : [ "group3", "group4" ],
     *           "objects"    : [ "obj3", "obj4" ]
     *         }
     *       ];
     *     };
     *     </pre>
     *
     * @type static
     *
     * @param actionType {String}
     *   The name of the action being validated (for debug messages)
     *
     * @param value {Object}
     *   The property value which is being validated
     *
     * @return {var} TODOC
     *
     * @throws TODOC
     */
    _commonTransformAutoActions : function(actionType, value)
    {
      // Validate that we received an object property value
      if (typeof (value) != "object") {
        throw new Error("Invalid " + actionType + " value: " +
                        typeof (value));
      }

      // We'll create a function to do the requested actions.  Initialize the
      // string into which we'll generate the common fragment added to the
      // function for each object.
      var funcFragment;

      // Here, we'll keep the function body.  Initialize a try block.
      var func = "try" + "{";

      var param;
      var objectAndGroupList;

      // Retrieve the function request, e.g.
      // "enabled" :
      for (var f in value)
      {
        // Get the function request value object, e.g.
        // "setEnabled" :
        // [
        //   {
        //     "parameters"   : [ true ],
        //     "objects" : [ "obj1", "obj2" ]
        //     "groups"  : [ "group1", "group2" ],
        //   }
        // ];
        var functionRequest = value[f];

        // The function request value should be an object
        if (!functionRequest instanceof Array) {
          throw new Error("Invalid function request type: " +
                          "expected array, found " +
                          typeof (functionRequest));
        }

        // For each function request...
        for (var i=0; i<functionRequest.length; i++)
        {
          // Retreive the object and group list object
          objectAndGroupList = functionRequest[i];

          // The object and group list should be an object, e.g.
          // {
          //   "parameters"   : [ true ],
          //   "objects" : [ "obj1", "obj2" ]
          //   "groups"  : [ "group1", "group2" ],
          // }
          if (typeof (objectAndGroupList) != "object") {
            throw new Error("Invalid function request parameter type: " +
                            "expected object, found " +
                            typeof (functionRequest[param]));
          }

          // Retrieve the parameter list
          params = objectAndGroupList["parameters"];

          // If it didn't exist, ...
          if (!params)
          {
            // ... use an empty array.
            params = [];
          }
          else
          {
            // otherwise, ensure we got an array
            if (!params instanceof Array) {
              throw new Error("Invalid function parameters: " +
                              "expected array, found " +
                              typeof (params));
            }
          }

          // Create the function to call on each object.  The object on which
          // the function is called will be prepended later.
          funcFragment = f + "(";

          // For each parameter...
          for (var j=0; j<params.length; j++)
          {
            // If this isn't the first parameter, add a separator
            if (j != 0) {
              funcFragment += ",";
            }

            if (typeof (params[j]) == "function")
            {
              // If the parameter is a function, arrange for it to be called
              // at run time.
              funcFragment += "(" + params[j] + ")(fsm)";
            }
            else if (typeof (params[j]) == "string")
            {
              // If the parameter is a string, quote it.
              funcFragment += '"' + params[j] + '"';
            }
            else
            {
              // Otherwise, just add the parameter's literal value
              funcFragment += params[j];
            }
          }

          // Complete the function call
          funcFragment += ")";

          // Get the "objects" list, e.g.
          //   "objects" : [ "obj1", "obj2" ]
          var a = objectAndGroupList["objects"];

          // Was there an "objects" list?
          if (!a)
          {
            // Nope.  Simplify code by creating an empty array.
            a = [];
          }
          else if (!a instanceof Array)
          {
            throw new Error("Invalid 'objects' list: expected array, got " +
                            typeof (a));
          }

          for (var j=0; j<a.length; j++)
          {
            // Ensure we got a string
            if (typeof (a[j]) != "string") {
              throw new Error("Invalid friendly name in 'objects' list: " +
                              a[j]);
            }

            func += " fsm.getObject('" + a[j] + "')." + funcFragment + ";";
          }

          // Get the "groups" list, e.g.
          //   "groups" : [ "group1, "group2" ]
          var g = objectAndGroupList["groups"];

          // Was a "groups" list found?
          if (g)
          {
            // Yup.  Ensure it's an array.
            if (!g instanceof Array)
            {
              throw new Error("Invalid 'groups' list: expected array, got " +
                              typeof (g));
            }

            for (j=0; j<g.length; j++)
            {
              // Arrange to call the function on each object in each group
              func +=
                "  var groupObjects = " +
                "    fsm.getGroupObjects('" + g[j] + "');" +
                "  for (var i = 0; i < groupObjects.length; i++)" +
                "  {" +
                "    var objName = groupObjects[i];" +
                "    fsm.getObject(objName)." + funcFragment + ";" +
                "  }";
            }
          }
        }
      }

      // Terminate the try block for function invocations
      func += "}" + "catch(e)" + "{" + "  fsm.debug(e);" + "}";

      // We've now built the entire body of a function that implements calls
      // to each of the requested automatic actions.  Create and return the
      // function, which will become the property value.
      return new Function("fsm", func);
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The name of this state.  This name may be used as a Transition's
     * nextState value, or an explicit next state in the 'events' handling
     * list in a State.
     */
    name :
    {
      transform : "__transformName",
      nullable : true
    },


    /**
     * The onentry function for this state.  This is documented in the
     * constructor, and is typically provided through the constructor's
     * stateInfo object, but it is also possible (but highly NOT recommended)
     * to change this dynamically.
     */
    onentry :
    {
      transform : "__transformOnentry",
      nullable : true,
      init : function(fsm, event) {}
    },


    /**
     * The onexit function for this state.  This is documented in the
     * constructor, and is typically provided through the constructor's
     * stateInfo object, but it is also possible (but highly NOT recommended)
     * to change this dynamically.
     */
    onexit :
    {
      transform : "__transformOnexit",
      nullable : true,
      init : function(fsm, event) {}
    },


    /**
     * Automatic actions to take prior to calling the state's onentry function.
     *
     * The value passed to setAutoActionsBeforeOnentry() should like something
     * akin to:
     *
     *     <pre class='javascript'>
     *     "autoActionsBeforeOnentry" :
     *     {
     *       // The name of a function.  This would become "setEnabled("
     *       "enabled" :
     *       [
     *         {
     *           // The parameter value, thus "setEnabled(true);"
     *           "parameters" : [ true ],
     *
     *           // The function would be called on each object:
     *           //  this.getObject("obj1").setEnabled(true);
     *           //  this.getObject("obj2").setEnabled(true);
     *           "objects" : [ "obj1", "obj2" ]
     *
     *           // And similarly for each object in each specified group.
     *           "groups"  : [ "group1", "group2" ],
     *         }
     *       ];
     *     };
     *     </pre>
     */
    autoActionsBeforeOnentry :
    {
      transform : "__transformAutoActionsBeforeOnentry",
      nullable : true,
      init : function(fsm, event) {}
    },


    /**
     * Automatic actions to take after return from the state's onentry
     * function.
     *
     * The value passed to setAutoActionsAfterOnentry() should like something
     * akin to:
     *
     *     <pre class='javascript'>
     *     "autoActionsAfterOnentry" :
     *     {
     *       // The name of a function.  This would become "setEnabled("
     *       "enabled" :
     *       [
     *         {
     *           // The parameter value, thus "setEnabled(true);"
     *           "parameters" : [ true ],
     *
     *           // The function would be called on each object:
     *           //  this.getObject("obj1").setEnabled(true);
     *           //  this.getObject("obj2").setEnabled(true);
     *           "objects" : [ "obj1", "obj2" ]
     *
     *           // And similarly for each object in each specified group.
     *           "groups"  : [ "group1", "group2" ],
     *         }
     *       ];
     *     };
     *     </pre>
     */
    autoActionsAfterOnentry :
    {
      transform : "__transformAutoActionsAfterOnentry",
      nullable : true,
      init : function(fsm, event) {}
    },


    /**
     * Automatic actions to take prior to calling the state's onexit function.
     *
     * The value passed to setAutoActionsBeforeOnexit() should like something
     * akin to:
     *
     *     <pre class='javascript'>
     *     "autoActionsBeforeOnexit" :
     *     {
     *       // The name of a function.  This would become "setEnabled("
     *       "enabled" :
     *       [
     *         {
     *           // The parameter value, thus "setEnabled(true);"
     *           "parameters" : [ true ],
     *
     *           // The function would be called on each object:
     *           //  this.getObject("obj1").setEnabled(true);
     *           //  this.getObject("obj2").setEnabled(true);
     *           "objects" : [ "obj1", "obj2" ]
     *
     *           // And similarly for each object in each specified group.
     *           "groups"  : [ "group1", "group2" ],
     *         }
     *       ];
     *     };
     *     </pre>
     */
    autoActionsBeforeOnexit :
    {
      transform : "__transformAutoActionsBeforeOnexit",
      nullable : true,
      init : function(fsm, event) {}
    },


    /**
     * Automatic actions to take after returning from the state's onexit
     * function.
     *
     * The value passed to setAutoActionsAfterOnexit() should like something
     * akin to:
     *
     *     <pre class='javascript'>
     *     "autoActionsBeforeOnexit" :
     *     {
     *       // The name of a function.  This would become "setEnabled("
     *       "enabled" :
     *       [
     *         {
     *           // The parameter value, thus "setEnabled(true);"
     *           "parameters" : [ true ],
     *
     *           // The function would be called on each object:
     *           //  this.getObject("obj1").setEnabled(true);
     *           //  this.getObject("obj2").setEnabled(true);
     *           "objects" : [ "obj1", "obj2" ]
     *
     *           // And similarly for each object in each specified group.
     *           "groups"  : [ "group1", "group2" ],
     *         }
     *       ];
     *     };
     *     </pre>
     */
    autoActionsAfterOnexit :
    {
      transform : "__transformAutoActionsAfterOnexit",
      nullable : true,
      init : function(fsm, event) {}
    },


    /**
     * The object representing handled and blocked events for this state.
     * This is documented in the constructor, and is typically provided
     * through the constructor's stateInfo object, but it is also possible
     * (but highly NOT recommended) to change this dynamically.
     */
    events :
    {
      transform : "__transformEvents",
      nullable : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Value passed to setter
     * @return {var} TODOC
     * @throws TODOC
     */
    __transformName : function(value)
    {
      // Ensure that we got a valid state name
      if (typeof (value) != "string" || value.length < 1)
      {
        throw new Error("Invalid state name");
      }

      return value;
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {Function | var | null} TODOC
     * @throws TODOC
     */
    __transformOnentry : function(value)
    {
      // Validate the onentry function
      switch(typeof (value))
      {
        case "undefined":
          // None provided.  Convert it to a null function
          return function(fsm, event) {};

        case "function":
          // We're cool.  No changes required
          return value;

        default:
          throw new Error("Invalid onentry type: " + typeof (value));
          return null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {Function | var | null} TODOC
     * @throws TODOC
     */
    __transformOnexit : function(value)
    {
      // Validate the onexit function
      switch(typeof (value))
      {
        case "undefined":
          // None provided.  Convert it to a null function
          return function(fsm, event) {};

        case "function":
          // We're cool.  No changes required
          return value;

        default:
          throw new Error("Invalid onexit type: " + typeof (value));
          return null;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {var} TODOC
     * @throws TODOC
     */
    __transformEvents : function(value)
    {
      // Validate that events is an object
      if (typeof (value) != "object") {
        throw new Error("events must be an object");
      }

      // Confirm that each property is a valid value
      // The property value should be one of:
      //
      // (a) qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
      //
      // (b) qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED
      //
      // (c) a string containing the name of an explicit Transition to use
      //
      // (d) an object where each property name is the Friendly Name of an
      //     object (meaning that this rule applies if both the event and
      //     the event's target object's Friendly Name match), and its
      //     property value is one of (a), (b) or (c), above.
      for (var e in value)
      {
        var action = value[e];

        if (typeof (action) == "number" &&
            action != qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE &&
            action != qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED)
        {
          throw new Error("Invalid numeric value in events object: " +
                          e + ": " + action);
        }
        else if (typeof (action) == "object")
        {
          for (action_e in action)
          {
            if (typeof (action[action_e]) == "number" &&
                action[action_e] !=
                  qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE &&
                action[action_e] !=
                  qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED)
            {
              throw new Error("Invalid numeric value in events object " +
                              "(" + e + "): " +
                              action_e + ": " +
                              action[action_e]);
            }
            else if (typeof (action[action_e]) != "string" &&
                     typeof (action[action_e]) != "number")
            {
              throw new Error("Invalid value in events object " +
                              "(" + e + "): " +
                              action_e + ": " + action[action_e]);
            }
          }
        }
        else if (typeof (action) != "string" && typeof (action) != "number")
        {
          throw new Error("Invalid value in events object: " +
                          e + ": " + value[e]);
        }
      }

      // We're cool.  No changes required.
      return value;
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {var} TODOC
     */
    __transformAutoActionsBeforeOnentry : function(value)
    {
      return qx.util.fsm.State._commonTransformAutoActions(
        "autoActionsBeforeOnentry",
        value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {var} TODOC
     */
    __transformAutoActionsAfterOnentry : function(value)
    {
      return qx.util.fsm.State._commonTransformAutoActions(
        "autoActionsAfterOnentry",
        value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {var} TODOC
     */
    __transformAutoActionsBeforeOnexit : function(value)
    {
      return qx.util.fsm.State._commonTransformAutoActions(
        "autoActionsBeforeOnexit",
        value);
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @return {var} TODOC
     */
    __transformAutoActionsAfterOnexit : function(value)
    {
      return qx.util.fsm.State._commonTransformAutoActions(
        "autoActionsAfterOnexit",
        value);
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Add a transition to a state
     *
     * @type member
     *
     * @param trans {qx.util.fsm.Transition}
     *   An object of class qx.util.fsm.Transition representing a transition
     *   which is to be a part of this state.
     *
     * @return {void}
     *
     * @throws TODOC
     */
    addTransition : function(trans)
    {
      // Ensure that we got valid transition info
      if (!trans instanceof qx.util.fsm.Transition) {
        throw new Error("Invalid transition: not an instance of " +
                        "qx.util.fsm.Transition");
      }

      // Add the new transition object to the state
      this.transitions[trans.getName()] = trans;
    }
  }
});
