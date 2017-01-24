/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006, 2007, 2011 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Create a new possible transition from one state to another.
 */
qx.Class.define("qx.util.fsm.Transition",
{
  extend : qx.core.Object,


  /**
   * @param transitionName {String}
   *   The name of this transition, used in debug messages.
   *
   * @param transitionInfo {Object}
   *   <pre>
   *   An object optionally containing any of the following properties:
   *
   *     context -
   *       A context in which all of the following functions should be run.
   *
   *     predicate -
   *       A function which is called to determine whether this transition is
   *       acceptable.  An acceptable transition will cause the transition's
   *       "ontransition" function to be run, the current state's "onexit"
   *       function to be run, and the new state's "onentry" function to be
   *       run.
   *
   *       The predicate function's signature is function(fsm, event) and it
   *       is saved in the predicate property of the transition object.  In
   *       the predicate function:
   *
   *         fsm -
   *           The finite state machine object to which this state is
   *           attached.
   *
   *         event -
   *           The event that caused a run of the finite state machine
   *
   *       The predicate function should return one of the following three
   *       values:
   *
   *         - true means the transition is acceptable
   *
   *         - false means the transition is not acceptable, and the next
   *           transition (if one exists) should be tried to determine if it
   *           is acceptable
   *
   *         - null means that the transition determined that no further
   *           transitions should be tried.  This might be used when the
   *           transition ascertained that the event is for a target that is
   *           not available in the current state, and the event has called
   *           fsm.queueEvent() to have the event delivered upon state
   *           transition.
   *
   *       It is possible to create a default predicate -- one that will cause
   *       a transition to be acceptable always -- by either not providing a
   *       predicate property, or by explicitly either setting the predicate
   *       property to 'true' or setting it to a function that unconditionally
   *       returns 'true'.  This default transition should, of course, always
   *       be the last transition added to a state, since no transition added
   *       after it will ever be tried.
   *
   *     nextState -
   *       The state to which we transition, if the predicate returns true
   *       (meaning the transition is acceptable).  The value of nextState may
   *       be:
   *
   *         - a string, the state name of the state to transition to
   *
   *         - One of the constants:
   *           - qx.util.fsm.FiniteStateMachine.StateChange.CURRENT_STATE:
   *               Remain in whatever is the current state
   *           - qx.util.fsm.FiniteStateMachine.StateChange.POP_STATE_STACK:
   *               Transition to the state at the top of the saved-state
   *               stack, and remove the top element from the saved-state
   *               stack.  Elements are added to the saved-state stack using
   *               fsm.pushState().  It is an error if no state exists on the
   *               saved-state stack.
   *           - qx.util.fsm.FiniteStateMachine.StateChange.TERMINATE:
   *               TBD
   *
   *     autoActionsBeforeOntransition -
   *     autoActionsAfterOntransition -
   *       Automatic actions which take place at the time specified by the
   *       property name.  In all cases, the action takes place immediately
   *       before or after the specified function.
   *
   *       The property value for each of these properties is an object which
   *       describes some number of functions to invoke on a set of specified
   *       objects (typically widgets).
   *
   *       See {@link qx.util.fsm.State} for an example of autoActions.
   *
   *     ontransition -
   *       A function which is called if the predicate function for this
   *       transition returns true.  Its signature is function(fsm, event) and
   *       it is saved in the ontransition property of the transition object.
   *       In the ontransition function:
   *
   *         fsm -
   *           The finite state machine object to which this state is
   *           attached.
   *
   *         event -
   *           The event that caused a run of the finite state machine
   *
   *     Additional properties may be provided in transInfo.  They will not be
   *     used by the finite state machine, but will be available via
   *     this.getUserData("<propertyName>") during the transition's predicate
   *     and ontransition functions.
   *   </pre>
   */
  construct : function(transitionName, transitionInfo)
  {
    var context;

    // Call our superclass' constructor
    this.base(arguments);

    // Save the state name
    this.setName(transitionName);

    // If a context was specified, retrieve it.
    context = transitionInfo.context || window;

    // Save it for future use
    this.setUserData("context", context);

    // Save data from the transitionInfo object
    for (var field in transitionInfo)
    {
      // If we find one of our properties, call its setter.
      switch(field)
      {
      case "predicate":
        this.setPredicate(
          this.__bindIfFunction(transitionInfo[field], context));
        break;

      case "nextState":
        this.setNextState(transitionInfo[field]);
        break;

      case "autoActionsBeforeOntransition":
        this.setAutoActionsBeforeOntransition(
          this.__bindIfFunction(transitionInfo[field], context));
        break;

      case "autoActionsAfterOntransition":
        this.setAutoActionsAfterOntransition(
          this.__bindIfFunction(transitionInfo[field], context));
        break;

      case "ontransition":
        this.setOntransition(
          this.__bindIfFunction(transitionInfo[field], context));
        break;

      case "context":
        // already handled
        break;

      default:
        // Anything else is user-provided data for their own use.  Save it.
        this.setUserData(field, transitionInfo[field]);

        // Log it in case it was a typo and they intended a built-in field
        this.debug("Transition " + transitionName + ": " +
                   "Adding user-provided field to transition: " + field);

        break;
      }
    }
  },


  properties :
  {
    /**
     * The name of this transition
     */
    name :
    {
      check : "String",
      nullable : true
    },


    /**
     * The predicate function for this transition.  This is documented in the
     * constructor, and is typically provided through the constructor's
     * transitionInfo object, but it is also possible (but highly NOT
     * recommended) to change this dynamically.
     */
    predicate :
    {
      init : function(fsm, event)
      {
        return true;
      },

      transform : "__transformPredicate"
    },


    /**
     * The state to transition to, if the predicate determines that this
     * transition is acceptable.  This is documented in the constructor, and
     * is typically provided through the constructor's transitionInfo object,
     * but it is also possible (but highly NOT recommended) to change this
     * dynamically.
     */
    nextState :
    {
      init : qx.util.fsm.FiniteStateMachine.StateChange.CURRENT_STATE,
      transform : "__transformNextState"
    },


    /**
     * Automatic actions to take prior to calling the transition's
     * ontransition function.  This is documented in the constructor, and is
     * typically provided through the constructor's transitionInfo object, but
     * it is also possible (but highly NOT recommended) to change this
     * dynamically.
     */
    autoActionsBeforeOntransition :
    {
      init : function(fsm, event) {},
      transform : "__transformAutoActionsBeforeOntransition"
    },


    /**
     * Automatic actions to take immediately after calling the transition's
     * ontransition function.  This is documented in the constructor, and is
     * typically provided through the constructor's transitionInfo object, but
     * it is also possible (but highly NOT recommended) to change this
     * dynamically.
     */
    autoActionsAfterOntransition :
    {
      init : function(fsm, event) {},
      transform : "__transformAutoActionsAfterOntransition"
    },


    /**
     * The function run when the transition is accepted.  This is documented
     * in the constructor, and is typically provided through the constructor's
     * transitionInfo object, but it is also possible (but highly NOT
     * recommended) to change this dynamically.
     */
    ontransition :
    {
      init : function(fsm, event) {},
      transform : "__transformOntransition"
    }
  },


  members:
  {
    /**
     * Validate the predicate. Converts all incoming values to functions.
     *
     * @param value {var} incoming value
     * @return {Function} predicate function
     */
    __transformPredicate : function(value)
    {
      // Validate the predicate.  Convert all valid types to function.
      switch(typeof (value))
      {
      case "undefined":
        // No predicate means predicate passes
        return function(fsm, event)
        {
          return true;
        };

      case "boolean":
        // Convert boolean predicate to a function which returns that value
        return function(fsm, event)
        {
          return value;
        };

      case "function":
        // Use user-provided function.
        return qx.lang.Function.bind(value, this.getUserData("context"));

      default:
        throw new Error("Invalid transition predicate type: " +
                        typeof (value));
      }
    },


    /**
     * Internal transform method
     *
     * @param value {var} Current value
     * @return {Function} the final value
     */
    __transformNextState : function(value)
    {
      // Validate nextState.  It must be a string or a number.
      switch(typeof (value))
      {
      case "string":
        return value;

      case "number":
        // Ensure that it's one of the possible state-change constants
        switch(value)
        {
        case qx.util.fsm.FiniteStateMachine.StateChange.CURRENT_STATE:
        case qx.util.fsm.FiniteStateMachine.StateChange.POP_STATE_STACK:
        case qx.util.fsm.FiniteStateMachine.StateChange.TERMINATE:
          return value;

        default:
          throw new Error("Invalid transition nextState value: " +
                          value + ": " +
                          "nextState must be an explicit state name, " +
                          "or one of the Fsm.StateChange constants");
        }

        break;

      default:
        throw new Error("Invalid transition nextState type: " +
                        typeof (value));
      }
    },


    /**
     * Internal transform method
     *
     * @param value {var} Current value
     * @return {Function} the final value
     */
    __transformAutoActionsBeforeOntransition : function(value)
    {
      return qx.util.fsm.State._commonTransformAutoActions(
        "autoActionsBeforeOntransition",
        value,
        this.getUserData("context"));

    },

    /**
     * Internal transform method
     *
     * @param value {var} Current value
     * @return {Function} the final value
     */
    __transformAutoActionsAfterOntransition : function(value)
    {
      return qx.util.fsm.State._commonTransformAutoActions(
        "autoActionsAfterOntransition",
        value,
        this.getUserData("context"));

    },

    /**
     * Internal transform method
     *
     * @param value {var} Current value
     * @return {Function} the final value
     */
    __transformOntransition : function(value)
    {
      // Validate the ontransition function.  Convert undefined to function.
      switch(typeof (value))
      {
      case "undefined":
        // No provided function just means do nothing.  Use a null
        // function.
        return function(fsm, event) {};

      case "function":
        // Use user-provided function.
        return qx.lang.Function.bind(value, this.getUserData("context"));

      default:
        throw new Error("Invalid ontransition type: " + typeof (value));
      }
    },

    /**
     * If given a function, bind it to a specified context.
     *
     * @param f {Function|var}
     *   The (possibly) function to be bound to the specified context.
     *
     * @param context {Object}
     *   The context to bind the function to.
     *
     * @return {Function}
     *   If f was a function, the return value is f wrapped such that it will
     *   be called in the specified context. Otherwise, f is returned
     *   unaltered.
     */
    __bindIfFunction : function(f, context)
    {
      // Is the first parameter a function?
      if (typeof(f) == "function")
      {
        // Yup. Bind it to the specified context.
        f = qx.lang.Function.bind(f, context);
      }

      return f;
    }
  }
});
