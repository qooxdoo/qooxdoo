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

/**
 * A finite state machine.
 *
 * See {@link qx.util.fsm.State} for details on creating States,
 * and {@link qx.util.fsm.Transitions} for details on creating
 * transitions between states.
 */
qx.Class.define("qx.util.fsm.FiniteStateMachine",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param machineName {String} The name of this finite state machine
   */
  construct : function(machineName)
  {
    // Call our superclass' constructor
    this.base(arguments);

    // Save the machine name
    this.setName(machineName);

    // Initialize the states object
    this._states = {};

    // The first state added will become the start state
    this._startState = null;

    // Initialize the saved-states stack
    this._savedStates = [];

    // Initialize the pending event queue
    this._eventQueue = [];

    // Initialize the blocked events queue
    this._blockedEvents = [];

    // Create the friendlyToObject" object.  Each object has as its property
    // name, the friendly name of the object; and as its property value, the
    // object itself.
    this._friendlyToObject = {};

    // Create the "friendlyToHash" object.  Each object has as its property
    // name, the friendly name of the object; and as its property value, the
    // hash code of the object.
    this._friendlyToHash = {};

    // Create the "hashToFriendly" object.  Each object has as its property
    // name, the hash code of the object; and as its property value, the
    // friendly name of the object.
    this._hashToFriendly = {};

    // Friendly names can be added to groups, for easy manipulation of
    // enabling and disabling groups of widgets.  Track which friendly names
    // are in which group.
    this._groupToFriendly = {};

    // We also need to be able to map back from friendly name to the groups it
    // is in.
    this._friendlyToGroups = {};
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Constants which may be values of the nextState member in the
     * transitionInfo parameter of the Transition constructor.
     */
    StateChange :
    {

      /** When used as a nextState value, means remain in current state */
      CURRENT_STATE   : 1,

      /**
       * When used as a nextState value, means go to most-recently pushed state
       */
      POP_STATE_STACK : 2,

      /** When used as a nextState value, means terminate this state machine */
      TERMINATE       : 3
    },


    /**
     * Constants for use in the events member of the transitionInfo parameter
     * of the Transition constructor.
     */
    EventHandling :
    {
      /**
       * This event is handled by this state, but the predicate of a transition
       * will determine whether to use that transition.
       */
      PREDICATE : 1,

      /** Enqueue this event for possible use by the next state */
      BLOCKED   : 2
    },


    /**
     * Debug bitmask values.
     */
    DebugFlags :
    {

      /** Show events */
      EVENTS           : 1,

      /** Show transitions */
      TRANSITIONS      : 2,

      /** Show individual function invocations during transitions */
      FUNCTION_DETAIL  : 4,

      /**
       * When object friendly names are referenced but not found, show message
       */
      OBJECT_NOT_FOUND : 8
    }
  },


  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /**
     * The name of this finite state machine (for debug messages)
     */
    name :
    {
      check : "String",
      nullable : true
    },


    /**
     * The current state of the finite state machine.
     */
    state :
    {
      check : "String",
      nullable : true
    },


    /**
     * The previous state of the finite state machine, i.e. the state from
     * which we most recently transitioned.  Note that this could be the same
     * as the current state if a successful transition brought us back to the
     * same state.
     */
    previousState :
    {
      check : "String",
      nullable : true
    },


    /**
     * The state to which we will be transitioning.  This property is valid
     * only during a Transition's ontransition function and a State's onexit
     * function.  At all other times, it is null.
     */
    nextState :
    {
      check : "String",
      nullable : true
    },


    /**
     * The maximum number of states which may pushed onto the state-stack.  It
     * is generally a poor idea to have very many states saved on a stack.
     * Following program logic becomes very difficult, and the code can be
     * highly unmaintainable.  The default should be more than adequate.
     * You've been warned.
     */
    maxSavedStates :
    {
      check : "Number",
      init : 2
    },


    /**
     * Debug flags, composed of the bitmask values in {@link #DebugFlags}.
     *
     * Set the debug flags from the application by or-ing together bits, akin
     * to this:
     *
     * <pre class='javascript'>
     * var FSM = qx.util.fsm.FiniteStateMachine;
     * fsm.setDebugFlags(FSM.DebugFlags.EVENTS |
     *                   FSM.DebugFlags.TRANSITIONS |
     *                   FSM.DebugFlags.FUNCTION_DETAIL |
     *                   FSM.DebugFlags.OBJECT_NOT_FOUND);
     * </pre>
     */
    debugFlags :
    {
      check : "Number",

      // Default:
      // (qx.util.fsm.FiniteStateMachine.DebugFlags.EVENTS |
      //  qx.util.fsm.FiniteStateMachine.DebugFlags.TRANSITIONS |
      //  qx.util.fsm.FiniteStateMachine.DebugFlags.OBJECT_NOT_FOUND)
      init : 7
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

    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Add a state to the finite state machine.
     *
     *
     * @param state {qx.util.fsm.State}
     *   An object of class qx.util.fsm.State representing a state which is to
     *   be a part of this finite state machine.
     *
     * @return {void}
     *
     * @throws TODOC
     */
    addState : function(state)
    {
      // Ensure that we got valid state info
      if (!state instanceof qx.util.fsm.State)
      {
        throw new Error("Invalid state: not an instance of " +
                        "qx.util.fsm.State");
      }

      // Retrieve the name of this state
      var stateName = state.getName();

      // Ensure that the state name doesn't already exist
      if (stateName in this._states)
      {
        throw new Error("State " + stateName + " already exists");
      }

      // Is this the first state being added?
      if (this._startState == null)
      {
        // Yup.  Save this state as the start state.
        this._startState = stateName;
      }

      // Add the new state object to the finite state machine
      this._states[stateName] = state;
    },


    /**
     * Replace a state in the finite state machine.  This is useful if
     * initially "dummy" states are created which load the real state table
     * for a series of operations (and possibly also load the gui associated
     * with the new states at the same time).  Having portions of the finite
     * state machine and their associated gui pages loaded at run time can
     * help prevent long delays at application start-up time.
     *
     *
     * @param state {qx.util.fsm.State}
     *   An object of class qx.util.fsm.State representing a state which is to
     *   be a part of this finite state machine.
     *
     * @param bDispose {Boolean}
     *   If <i>true</i>, then dispose the old state object.  If <i>false</i>,
     *   the old state object is returned for disposing by the caller.
     *
     * @return {Object}
     *   The old state object if it was not disposed; otherwise null.
     *
     * @throws TODOC
     */
    replaceState : function(state, bDispose)
    {
      // Ensure that we got valid state info
      if (!state instanceof qx.util.fsm.State)
      {
        throw new Error("Invalid state: not an instance of " +
                        "qx.util.fsm.State");
      }

      // Retrieve the name of this state
      var stateName = state.getName();

      // Save the old state object, so we can return it to be disposed
      var oldState = this._states[stateName];

      // Replace the old state with the new state object.
      this._states[stateName] = state;

      // Did they request that the old state be disposed?
      if (bDispose)
      {
        // Yup.  Mark it to be disposed.
        oldState._bNeedDispose = true;
      }

      return oldState;
    },


    /**
     * Add an object (typically a widget) that is to be accessed during state
     * transitions, to the finite state machine.
     *
     *
     * @param friendlyName {String}
     *   The friendly name to used for access to the object being added.
     *
     * @param obj {Object}
     *   The object to associate with the specified friendly name
     *
     * @param groupNames {Array}
     *   An optional list of group names of which this object is a member.
     *
     * @return {void}
     */
    addObject : function(friendlyName, obj, groupNames)
    {
      var hash = obj.toHashCode();
      this._friendlyToHash[friendlyName] = hash;
      this._hashToFriendly[hash] = friendlyName;
      this._friendlyToObject[friendlyName] = obj;

      // If no groupNames are specified, we're done.
      if (!groupNames)
      {
        return;
      }

      // Allow either a single group name or an array of group names.  If the
      // former, we convert it to the latter to make the subsequent code
      // simpler.
      if (typeof (groupNames) == "string")
      {
        groupNames = [ groupNames ];
      }

      // For each group that this friendly name is to be a member of...
      for (var i=0; i<groupNames.length; i++)
      {
        var groupName = groupNames[i];

        // If the group name doesn't yet exist...
        if (!this._groupToFriendly[groupName])
        {
          // ... then create it.
          this._groupToFriendly[groupName] = {};
        }

        // Add the friendly name to the list of names in this group
        this._groupToFriendly[groupName][friendlyName] = true;

        // If the friendly name group mapping doesn't yet exist...
        if (!this._friendlyToGroups[friendlyName])
        {
          // ... then create it.
          this._friendlyToGroups[friendlyName] = [];
        }

        // Append this group name to the list of groups this friendly name is
        // in
        this._friendlyToGroups[friendlyName] =
          this._friendlyToGroups[friendlyName].concat(groupNames);
      }
    },


    /**
     * Remove an object which had previously been added by {@link #addObject}.
     *
     *
     * @param friendlyName {String}
     *   The friendly name associated with an object, specifying which object
     *   is to be removed.
     *
     * @return {void}
     */
    removeObject : function(friendlyName)
    {
      var hash = this._friendlyToHash[friendlyName];

      // Delete references to any groupos this friendly name was in
      if (this._friendlyToGroups[friendlyName])
      {
        for (var groupName in this._friendlyToGroups[friendlyName])
        {
          delete this._groupToFriendly[groupName];
        }

        delete this._friendlyToGroups[friendlyName];
      }

      // Delete the friendly name
      delete this._hashToFriendly[hash];
      delete this._friendlyToHash[friendlyName];
      delete this._friendlyToObject[friendlyName];
    },


    /**
     * Retrieve an object previously saved via {@link #addObject}, using its
     * Friendly Name.
     *
     *
     * @param friendlyName {String}
     *   The friendly name of the object to be retrieved.
     *
     * @return {Object}
     *   The object which has the specified friendly name, or undefined if no
     *   object has been associated with that name.
     */
    getObject : function(friendlyName)
    {
      return this._friendlyToObject[friendlyName];
    },


    /**
     * Get the friendly name of an object.
     *
     *
     * @param obj {Object}
     *   The object for which the friendly name is desired
     *
     * @return {String}
     *   If the object has been previously registered via {@link #addObject},
     *   then the friendly name of the object is returned; otherwise, null.
     */
    getFriendlyName : function(obj)
    {
      var hash = obj.toHashCode();
      return hash ? this._hashToFriendly[hash] : null;
    },


    /**
     * Retrieve the list of objects which have registered, via {@link
     * addObject} as being members of the specified group.
     *
     *
     * @param groupName {String}
     *   The name of the group for which the member list is desired.
     *
     * @return {Array}
     *   An array containing the friendly names of any objects which are
     *   members of the specified group.  The resultant array may be empty.
     */
    getGroupObjects : function(groupName)
    {
      var a = [];

      for (var name in this._groupToFriendly[groupName])
      {
        a.push(name);
      }

      return a;
    },


    /**
     * Display all of the saved objects and their reverse mappings.
     *
     * @return {void}
     */
    displayAllObjects : function()
    {
      for (var friendlyName in this._friendlyToHash)
      {
        var hash = this._friendlyToHash[friendlyName];
        var obj = this.getObject(friendlyName);
        this.debug(friendlyName + " => " + hash);
        this.debug("  " + hash + " => " + this._hashToFriendly[hash]);
        this.debug("  " +
                   friendlyName + " => " + this.getObject(friendlyName));
        this.debug("  " +
                   this.getObject(friendlyName) + " => " +
                   this.getFriendlyName(obj));
      }
    },


    /**
     * Start (or restart, after it has terminated) the finite state machine
     * from the starting state.  The starting state is defined as the first
     * state added to the finite state machine.
     *
     * @return {void}
     * @throws TODOC
     */
    start : function()
    {
      var stateName = this._startState;

      if (stateName == null)
      {
        throw new Error("Machine started with no available states");
      }

      // Set the start state to be the first state which was added to the
      // machine
      this.setState(stateName);
      this.setPreviousState(null);
      this.setNextState(null);

      var debugFunctions =
        (this.getDebugFlags() &
         qx.util.fsm.FiniteStateMachine.DebugFlags.FUNCTION_DETAIL);

      // Run the actionsBeforeOnentry actions for the initial state
      if (debugFunctions)
      {
        this.debug(this.getName() + "#" + stateName + "#actionsBeforeOnentry");
      }

      this._states[stateName].getAutoActionsBeforeOnentry()(this);

      // Run the entry function for the new state, if one is specified
      if (debugFunctions)
      {
        this.debug(this.getName() + "#" + stateName + "#entry");
      }

      this._states[stateName].getOnentry()(this, null);

      // Run the actionsAfterOnentry actions for the initial state
      if (debugFunctions)
      {
        this.debug(this.getName() + "#" + stateName + "#actionsAfterOnentry");
      }

      this._states[stateName].getAutoActionsAfterOnentry()(this);
    },


    /**
     * Save the current or previous state on the saved-state stack.  A future
     * transition can then provide, as its nextState value, the class
     * constant:
     *
     *   <code>
     *   qx.util.fsm.FiniteStateMachine.StateChange.POP_STATE_STACK
     *   </code>
     *
     * which will cause the next state to be whatever is at the top of the
     * saved-state stack, and remove that top element from the saved-state
     * stack.
     *
     *
     * @param bCurrent {Boolean}
     *   When <i>true</i>, then push the current state onto the stack.  This
     *   might be used in a transition, before the state has changed.  When
     *   <i>false</i>, then push the previous state onto the stack.  This
     *   might be used in an on entry function to save the previous state to
     *   return to.
     *
     * @return {void}
     *
     * @throws TODOC
     */
    pushState : function(bCurrent)
    {
      // See if there's room on the state stack for a new state
      if (this._savedStates.length >= this.getMaxSavedStates())
      {
        // Nope.  Programmer error.
        throw new Error("Saved-state stack is full");
      }

      if (bCurrent)
      {
        // Push the current state onto the saved-state stack
        this._savedStates.push(this.getState());
      }
      else
      {
        // Push the previous state onto the saved-state stack
        this._savedStates.push(this.getPreviousState());
      }
    },


    /**
     * Add the specified event to a list of events to be passed to the next
     * state following state transition.
     *
     *
     * @param event {qx.event.type.Event}
     *   The event to add to the event queue for processing after state change.
     *
     * @return {void}
     */
    postponeEvent : function(event)
    {
      // Add this event to the blocked event queue, so it will be passed to the
      // next state upon transition.
      this._blockedEvents.unshift(event);
    },


    /**
     * Copy an event
     *
     * @param event {qx.event.type.Event} The event to be copied
     * @return {qx.event.type.Event} The new copy of the provided event
     */
    copyEvent : function(event)
    {
      var e = {};

      for (var prop in event)
      {
        e[prop] = event[prop];
      }

      return e;
    },


    /**
     * Enqueue an event for processing
     *
     *
     * @param event {qx.event.type.Event}
     *   The event to be enqueued
     *
     * @param bAddAtHead {Boolean}
     *   If <i>true</i>, put the event at the head of the queue for immediate
     *   processing.  If <i>false</i>, place the event at the tail of the
     *   queue so that it receives in-order processing.
     *
     * @return {void}
     */
    enqueueEvent : function(event, bAddAtHead)
    {
      // Add the event to the event queue
      if (bAddAtHead)
      {
        // Put event at the head of the queue
        this._eventQueue.push(event);
      }
      else
      {
        // Put event at the tail of the queue
        this._eventQueue.unshift(event);
      }

      if (this.getDebugFlags() &
          qx.util.fsm.FiniteStateMachine.DebugFlags.EVENTS)
      {
        if (bAddAtHead)
        {
          this.debug(this.getName() + ": Pushed event: " + event.getType());
        }
        else
        {
          this.debug(this.getName() + ": Queued event: " + event.getType());
        }
      }
    },


    /**
     * Event listener for all event types in the finite state machine
     *
     * @param event {qx.event.type.Event} The event that was dispatched.
     * @return {void}
     */
    eventListener : function(event)
    {
      // Events are enqueued upon receipt.  Some events are then processed
      // immediately; other events get processed later.  We need to allow the
      // event dispatcher to free the source event upon our return, so we'll
      // clone it and enqueue our clone.  The source event can then be
      // disposed upon our return.

      var e = this.copyEvent(event);

      // Enqueue the new event on the tail of the queue
      this.enqueueEvent(e, false);

      // Process events
      this.__processEvents();
    },


    /**
     * Process all of the events on the event queue.
     *
     * @return {void}
     */
    __processEvents : function()
    {
      // eventListener() can potentially be called while we're processing
      // events
      if (this._eventProcessingInProgress)
      {
        // We were processing already, so don't process concurrently.
        return ;
      }

      // Track that we're processing events
      this._eventProcessingInProgress = true;

      // Process each of the events on the event queue
      while (this._eventQueue.length > 0)
      {
        // Pull the next event from the pending event queue
        var event = this._eventQueue.pop();

        // Run the finite state machine with this event
        var bDispose = this.__run(event);

        // If we didn't block (and re-queue) the event, dispose it.
        if (bDispose)
        {
          event.dispose();
        }
      }

      // We're no longer processing events
      this._eventProcessingInProgress = false;
    },


    /**
     * Run the finite state machine to process a single event.
     *
     *
     * @param event {qx.event.type.Event}
     *   An event that has been dispatched.  The event may be handled (if the
     *   current state handles this event type), queued (if the current state
     *   blocks this event type), or discarded (if the current state neither
     *   handles nor blocks this event type).
     *
     * @return {Boolean}
     *   Whether the event should be disposed.  If it was blocked, we've
     *   pushed it back onto the event queue, and it should not be disposed.
     *
     * @throws TODOC
     */
    __run : function(event)
    {
      // For use in generated functions...
      // State name variables
      var thisState;
      var nextState;
      var prevState;

      // The current State object
      var currentState;

      // The transitions available in the current State
      var transitions;

      // Events handled by the current State
      var e;

      // The action to take place upon receipt of a particular event
      var action;

      // Get the debug flags
      var debugFlags = this.getDebugFlags();

      // Allow slightly faster access to determine if debug is enableda
      var debugEvents =
        debugFlags & qx.util.fsm.FiniteStateMachine.DebugFlags.EVENTS;
      var debugTransitions =
        debugFlags & qx.util.fsm.FiniteStateMachine.DebugFlags.TRANSITIONS;
      var debugFunctions =
        debugFlags & qx.util.fsm.FiniteStateMachine.DebugFlags.FUNCTION_DETAIL;
      var debugObjectNotFound =
        debugFlags & qx.util.fsm.FiniteStateMachine.DebugFlags.OBJECT_NOT_FOUND;

      if (debugEvents)
      {
        this.debug(this.getName() + ": Process event: " + event.getType());
      }

      // Get the current state name
      thisState = this.getState();

      // Get the current State object
      currentState = this._states[thisState];

      // Get a list of the transitions available from this state
      transitions = currentState.transitions;

      // Determine how to handle this event
      e = currentState.getEvents()[event.getType()];

      // See if we actually found this event type
      if (!e)
      {
        if (debugEvents)
        {
          this.debug(this.getName() + ": Event '" + event.getType() + "'" +
                     " not handled.  Ignoring.");
        }

        return true;
      }

      // We might have found a constant (PREDICATE or BLOCKED) or an object
      // with each property name being the friendly name of a saved object,
      // and the property value being one of the constants (PREDICATE or
      // BLOCKED).
      if (typeof (e) == "object")
      {
        // Individual objects are listed.  Ensure target is a saved object
        var friendly = this.getFriendlyName(event.getTarget());

        if (!friendly)
        {
          // Nope, it doesn't seem so.  Just discard it.
          if (debugObjectNotFound)
          {
            this.debug(this.getName() +
                       ": Could not find friendly name for '" +
                       event.getType() + "' on '" + event.getTarget() + "'");
          }

          return true;
        }

        action = e[friendly];

        // Do we handle this event type for the widget from which it
        // originated?
        if (! action)
        {
          // Nope.
          if (debugEvents)
          {
            this.debug(this.getName() + ": Event '" + event.getType() + "'" +
                       " not handled for target " + friendly + ".  Ignoring.");
          }

          return true;
        }
      }
      else
      {
        action = e;
      }

      switch(action)
      {
        case qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE:
          // Process this event.  One of the transitions should handle it.
          break;

        case qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED:
          // This event is blocked.  Enqueue it for later, and get outta here.
          if (debugEvents)
          {
            this.debug(this.getName() + ": Event '" + event.getType() + "'" +
                       " blocked.  Re-queuing.");
          }

          this._blockedEvents.unshift(event);
          return false;

        default:
          // See if we've been given an explicit transition name
          if (typeof (action) == "string")
          {
            // Yup!  Ensure that it exists
            if (transitions[action])
            {
              // Yup.  Create a transitions object containing only this
              // transition.
              var trans = transitions[action];
              transitions = {};
              transitions[action] = trans;
            }
            else
            {
              throw new Error("Explicit transition " +
                              action + " does not exist");
            }

            break;
          }
      }

      // We handle the event.  Try each transition in turn until we find one
      // that is acceptable.
      for (var t in transitions)
      {
        var trans = transitions[t];

        // Does the predicate allow use of this transition?
        switch(trans.getPredicate()(this, event))
        {
          case true:
            // Transition is allowed.  Proceed.
            break;

          case false:
            // Transition is not allowed.  Try next transition.
            continue;

          case null:
            // Transition indicates not to try further transitions
            return true;

          default:
            throw new Error("Transition " + thisState + ":" + t +
                            " returned a value other than " +
                            "true, false, or null.");
        }

        // We think we can transition to the next state.  Set next state.
        nextState = trans.getNextState();

        if (typeof (nextState) == "string")
        {
          // We found a literal state name.  Ensure it exists.
          if (!nextState in this._states)
          {
            throw new Error("Attempt to transition to nonexistent state " +
                            nextState);
          }

          // It exists.  Track it being the next state.
          this.setNextState(nextState);
        }
        else
        {
          // If it's not a string, nextState must be a StateChange constant
          switch(nextState)
          {
            case qx.util.fsm.FiniteStateMachine.StateChange.CURRENT_STATE:
              // They want to remain in the same state.
              nextState = thisState;
              this.setNextState(nextState);
              break;

            case qx.util.fsm.FiniteStateMachine.StateChange.POP_STATE_STACK:
              // Switch to the state at the top of the state stack.
              if (this._savedStates.length == 0)
              {
                throw new Error("Attempt to transition to POP_STATE_STACK " +
                                "while state stack is empty.");
              }

              // Pop the state stack to retrieve the state to transition to
              nextState = this._savedStates.pop();
              this.setNextState(nextState);
              break;

            default:
              throw new Error("Internal error: invalid nextState");
              break;
          }
        }

        // Run the actionsBeforeOntransition actions for this transition
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState + "#" + t +
                     "#autoActionsBeforeOntransition");
        }

        trans.getAutoActionsBeforeOntransition()(this);

        // Run the 'ontransition' function
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState + "#" + t +
                     "#ontransition");
        }

        trans.getOntransition()(this, event);

        // Run the autoActionsAfterOntransition actions for this transition
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState + "#" + t +
                     "#autoActionsAfterOntransition");
        }

        trans.getAutoActionsAfterOntransition()(this);

        // Run the autoActionsBeforeOnexit actions for the old state
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState +
                     "#autoActionsBeforeOnexit");
        }

        currentState.getAutoActionsBeforeOnexit()(this);

        // Run the exit function for the old state
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState + "#exit");
        }

        currentState.getOnexit()(this, event);

        // Run the autoActionsAfterOnexit actions for the old state
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState +
                     "#autoActionsAfterOnexit");
        }

        currentState.getAutoActionsAfterOnexit()(this);

        // If this state has been replaced and we're supposed to dispose it...
        if (currentState._bNeedDispose)
        {
          // ... then dispose it now that it's no longer in use
          currentState.dispose();
        }

        // Reset currentState to the new state object
        currentState = this._states[this.getNextState()];

        // set previousState and state, and clear nextState, for transition
        this.setPreviousState(thisState);
        this.setState(this.getNextState());
        this.setNextState(null);
        prevState = thisState;
        thisState = nextState;
        nextState = undefined;

        // Run the autoActionsBeforeOnentry actions for the new state
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState +
                     "#autoActionsBeforeOnentry");
        }

        currentState.getAutoActionsBeforeOnentry()(this);

        // Run the entry function for the new state, if one is specified
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState + "#entry");
        }

        currentState.getOnentry()(this, event);

        // Run the autoActionsAfterOnentry actions for the new state
        if (debugFunctions)
        {
          this.debug(this.getName() + "#" + thisState +
                     "#autoActionsAfterOnentry");
        }

        currentState.getAutoActionsAfterOnentry()(this);

        // Add any blocked events back onto the pending event queue
        var e;

        for (var i=0; i<this._blockedEvents.length; i++)
        {
          e = this._blockedEvents.pop();
          this._eventQueue.unshift(e);
        }

        if (debugTransitions)
        {
          this.debug(this.getName() + "#" + prevState + " => " +
                     this.getName() + "#" + thisState);
        }

        // See ya!
        return true;
      }

      if (debugTransitions)
      {
        this.debug(this.getName() +
                   "#" + thisState + ": event '" +
                   event.getType() + "'" +
                   ": no transition found.  No state change.");
      }

      return true;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeArray("_eventQueue");
    this._disposeArray("_blockedEvents");
    this._disposeFields("_savedStates", "_states");
  }
});
