/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

qx.Class.define("qx.test.util.Fsm",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /**
     * Ensure that objects added with fsm.addObject() get cleaned up properly
     * by fsm.removeObject()
     */
    testAddRemoveObject : function()
    {
      var             before;
      var             intermediate;
      var             after;
      var             fsm;
      var             obj;
      var             obj2;

      //
      // Simple test: object with no groups
      //

      // Instantiate a new machine and an object
      fsm = new qx.util.fsm.FiniteStateMachine("testMachine");
      obj = new qx.core.Object();

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for easy comparison later.
      before = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Add an object
      fsm.addObject("obj", obj);

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for display later, in case of error
      intermediate = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Remove the object
      fsm.removeObject("obj");

      // Retrieve the internal data of the finite state machine
      // Convert it to JSON for easy comparison with the before state
      after = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Ensure that there are no differences in internal state
      this.assertEquals(before,
                        after,
                        "simple add/remove (" + intermediate + ")");

      //
      // Single group
      //

      // Instantiate a new machine and an object
      fsm = new qx.util.fsm.FiniteStateMachine("testMachine");
      obj = new qx.core.Object();

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for easy comparison later.
      before = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Add an object
      fsm.addObject("obj", obj, "group1");

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for display later, in case of error
      intermediate = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Remove the object
      fsm.removeObject("obj");

      // Retrieve the internal data of the finite state machine
      // Convert it to JSON for easy comparison with the before state
      after = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Ensure that there are no differences in internal state
      this.assertEquals(before, after, "single group (" + intermediate + ")");

      //
      // Multiple groups
      //

      // Instantiate a new machine and an object
      fsm = new qx.util.fsm.FiniteStateMachine("testMachine");
      obj = new qx.core.Object();

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for easy comparison later.
      before = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Add an object
      fsm.addObject("obj", obj, [ "group1", "group2" ]);

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for display later, in case of error
      intermediate = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Remove the object
      fsm.removeObject("obj");

      // Retrieve the internal data of the finite state machine
      // Convert it to JSON for easy comparison with the before state
      after = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Ensure that there are no differences in internal state
      this.assertEquals(before, after, "single group (" + intermediate + ")");


      //
      // Multiple objects in a single group
      //

      // Instantiate a new machine and an object
      fsm = new qx.util.fsm.FiniteStateMachine("testMachine");
      obj = new qx.core.Object();
      obj2 = new qx.core.Object();

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for easy comparison later.
      before = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Add an object
      fsm.addObject("obj", obj, "group1");

      // Add another object
      fsm.addObject("obj2", obj2, "group1");

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for display later, in case of error
      intermediate = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Remove the second object
      fsm.removeObject("obj2");

      // Remove the object
      fsm.removeObject("obj");

      // Retrieve the internal data of the finite state machine
      // Convert it to JSON for easy comparison with the before state
      after = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Ensure that there are no differences in internal state
      this.assertEquals(before, after, "single group (" + intermediate + ")");

      //
      // Multiple objects in a single group, ensuring that state is correct
      // after only one object is removed
      //

      // Instantiate a new machine and an object
      fsm = new qx.util.fsm.FiniteStateMachine("testMachine");
      obj = new qx.core.Object();
      obj2 = new qx.core.Object();

      // Add an object
      fsm.addObject("obj", obj, "group1");

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for easy comparison later.
      before = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Add another object
      fsm.addObject("obj2", obj2, "group1");

      // Retrieve the internal data of the finite state machine.
      // Convert it to JSON for display later, in case of error
      intermediate = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Remove the second object
      fsm.removeObject("obj2");

      // Retrieve the internal data of the finite state machine
      // Convert it to JSON for easy comparison with the before state
      after = qx.lang.Json.stringify(fsm._getInternalData(), null, 2);

      // Remove the object
      fsm.removeObject("obj");

      // Ensure that there are no differences in internal state
      this.assertEquals(before, after, "single group (" + intermediate + ")");
    }
  }
});
