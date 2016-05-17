/*
 * The qx.util.fsm package.
 *
 * Example:
 *
 * <pre class="javascript">
 * var fsm;
 * var state;
 * var trans;
 *
 * // Create a new finite state machine called "Test Machine"
 * fsm = new qx.util.fsm.FiniteStateMachine("Test machine");
 *
 * // State S1
 * state = new qx.util.fsm.State(
 *   // State name
 *   "S1",
 *
 *   // Object with state information
 *   {
 *     // Function called on entry to this state
 *     "onentry" :
 *       function(fsm, event)
 *       {
 *         alert("Previous state: " + fsm.getPreviousState());
 *       };
 *
 *     // Function called on exit from this state
 *     "onexit" :
 *       function(fsm, event)
 *       {
 *         alert("Next state: " + fsm.getNextState());
 *       };
 *
 *     // Automatic actions to take place before a (possibly) new state's
 *     // onentry function is called.
 *     "autoActionsBeforeOnentry" :
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
 *       "setColor" :
 *       [
 *         {
 *           "parameters" : [ "blue" ]
 *           "groups"     : [ "group3", "group4" ],
 *           "objects"    : [ "obj3", "obj4" ]
 *         }
 *       ];
 *     };
 *
 *     // also available, in same format as actionsBeforeOnentry:
 *     //   "autoActionsAfterOnentry",
 *     //   "autoActionsBeforeOnexit"
 *     //   "autoActionsAfterOnexit"
 *
 *     // Events handled by this state, or queued for processing by a future
 *     // state
 *     "events" :
 *     {
 *       // The event type "compete" is handled by one of the transitions in
 *       // this state.  The transitions will be searched in order of their
 *       // addition to the state, until the predicate for a transition
 *       // returns true (or no predicate is specified for the transition,
 *       // which is an implicit "true") That transition will be used.
 *       "complete"  : qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE,
 *
 *       // The event type "interval" has two objects specified by their
 *       // "friendly name".  The action when an event of type "interval"
 *       // occurs depends on which object was the target of the event.
 *       "interval"  :
 *       {
 *         // If the target of the event was the object to which we have given
 *         // the friendly name "flash" then use a transition specified by
 *         // name
 *         "flash"   : "S1_S3_interval_flash",
 *
 *         // If the target of the event was the object to which we have given
 *         // the friendly name "timeout", then enqueue this event for
 *         // possible processing by a future state.
 *         "timeout" : qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED
 *       },
 *
 *         // The event type "execute", too, has two objects specified by
 *         // their "friendly name".
 *       "execute"   :
 *       {
 *         // If the target of the event was the object to which we have given
 *         // the friend name "ok", search the transitions in order looking
 *         // for one where the predicate is true
 *         "ok"      : qx.util.fsm.FiniteStateMachine.EventHandling.PREDICATE
 *
 *         // If the target of the event was the object to which we have given
 *         // the friendly name "restart", then enqueue this event for
 *         // possible processing by a future state.
 *         "restart" : qx.util.fsm.FiniteStateMachine.EventHandling.BLOCKED
 *       }
 *
 *       // all events other than those which are handled or blocked are
 *       // ignored.
 *     };
 *   });
 *
 * // Add State S1 to the finite state machine.
 * fsm.addState(state);
 *
 * // Transition from S1 to S2 due to event 1
 * trans = new qx.util.fsm.Transition(
 *   // Transition name
 *   "S1_S2_ev1",
 *
 *   // Object with transition information
 *   {
 *     // return TRUE to pass
 *     "predicate" :
 *       function(fsm, event)
 *       {
 *         var type = event.getType();
 *         if (type == "somethingWeCareAbout")
 *         {
 *           return true;
 *         }
 *         else if (type == "somethingToHandleInAnotherState")
 *         {
 *           // reattempt event delivery following state transition
 *           fsm.postponeEvent(event);
 *
 *           // do no further transition attempts for this event for now
 *           return null;
 *         }
 *         else
 *         {
 *           return false;
 *         }
 *       },
 *
 *     // if event matches and predicate passes, pop the state stack and go to
 *     // the state which was found at the top of the stack.  States are added
 *     // to the state stack by calling fsm.pushState() during a state's
 *     // onexit function or by a transition's action function.
 *     "nextState" : qx.util.fsm.FiniteStateMachine.StateChange.POP_STATE_STACK,
 *
 *     // action taken during transition
 *     "ontransition"    :
 *       function(fsm, event)
 *       {
 *         // save current state so a future transition can get back to
 *         // this saved state
 *         fsm.pushState();
 *       }
 *   });
 * state.addTransition(trans);
 *
 * // Default transition (any event): remain in current state
 * trans = new qx.util.fsm.Transition(
 *   "S1_S1_default",
 *   {
 *     // true or undefined : always pass
 *     "predicate" :
 *       function(fsm, event)
 *       {
 *         // This predicate does not pass, and we return null to tell the
 *         // finite state machine that no additional transitions in the
 *         // transition list should be tested.  (Note that the next
 *         // transition is the one explicitly called for by the "interval"
 *         // event on the object with friendly name "flash".  We do not want
 *         // a predicate search to find it.
 *         return null;
 *       },
 *
 *     // return to current state
 *     "nextState" : qx.util.fsm.FiniteStateMachine.StateChange.CURRENT_STATE,
 *   });
 * state.addTransition(trans);
 *
 * // Transition from S1 to S2 due to event 2.  Since the previous transition
 * // returned null in its predicate function, the only way to get to this
 * // transition is when it is called out explicitly in the state's event
 * // list.  This one was specified for the "interval" event on the object
 * // with friendly name "flash".
 * trans = new qx.util.finitestatememachine.Transition(
 *   "S1_S3_interval_flash",
 *   {
 *     // No predicate or a value of 'true' means that the predicate passes as
 *     // if a predicate function returned true.
 *     "predicate" : true,
 *
 *     // if event matches, go to this state
 *     "nextState" : "S2",
 *
 *     // action taken during transition
 *     "ontransition"    :
 *       function(fsm, event)
 *       {
 *         alert(this.getName() + "ontransition function");
 *       }
 *   });
 * state.addTransition(trans);
 *
 * // We would, of course, need to add state S2 since it is specified in a
 * // nextState property.  That is left as an exercise for the reader.
 *
 *
 * // Initialize and start the machine running
 * fsm.start();
 * </pre>
 */
