/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2010 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#ignore(selenium)
#ignore(qx.Simulation.eventStore)
************************************************************************ */

/**
 * Provides event testing support.
 */

qx.Mixin.define("simulator.MEventSupport",
{
  members:
  {
    /**
     * Adds utility functions to the AUT that allow attaching and removing event
     * listeners to qooxdoo objects identified by their object registry hash.
     *
     * @lint ignoreUndefined(selenium)
     */
    _addListenerSupport : function()
    {
      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore = [];');

      var addListener = function(objectHash, event, callback, context) {
        var context = context || selenium.qxStoredVars['autWindow'].qx.core.Init.getApplication();
        var qxObj = selenium.qxStoredVars['autWindow'].qx.core.ObjectRegistry.fromHashCode(objectHash);
        return qxObj.addListener(event, callback, context);
      };
      this._addOwnFunction("addListener", addListener);

      var removeListenerById = function(objectHash, listenerId) {
        var qxObj = selenium.qxStoredVars['autWindow'].qx.core.ObjectRegistry.fromHashCode(objectHash);
        return qxObj.removeListenerById(listenerId);
      };
      this._addOwnFunction("removeListenerById", removeListenerById);
    },

    /**
     * Adds an event listener to a qooxdoo object in the AUT.
     *
     * @param locator {String} A (Qx)Selenium locator string that finds a
     * qooxdoo widget
     * @param event {String} Name of the event to listen for
     * @param callback {Function} Function to be executed if the event is
     * fired. The local variable "ev" will reference the event object
     * @param script {String?} JavaScript snippet to be executed in the context
     * of the widget determined by the locator. The listener will be attached
     * to the object returned by this snippet
     * @return {String} the generated listener's ID
     */
    addListener : function(locator, event, callback, script)
    {
      if (script) {
        var objectHash = simulator.QxSelenium.getInstance().getQxObjectHash(locator, script);
      } else {
        var objectHash = simulator.QxSelenium.getInstance().getQxObjectHash(locator);
      }
      var callbackName = event + "_" + new Date().getTime();
      this.addFunctionToAut(callbackName, callback, ["ev"]);
      var callbackInContext = 'selenium.qxStoredVars["autWindow"].qx.Simulation["' + callbackName + '"]';
      var cmd = 'selenium.qxStoredVars["autWindow"].qx.Simulation.addListener("' + objectHash + '", "' + event + '", ' + callbackInContext + ')';
      return simulator.QxSelenium.getInstance().getEval(cmd);
    },

    /**
     * Removes an event listener from a qooxdoo widget in the AUT.
     *
     * @param locator {String} A (Qx)Selenium locator string that finds a
     * qooxdoo widget
     * @param listenerId {String}  The listener's ID as returned by
     * {@see #addListener}
     * @return {Boolean} Whether the listener was
     * removed successfully
     */
    removeListenerById : function(locator, listenerId)
    {
      listenerId = String(listenerId).replace(/"/, '\\"');
      var objectHash = simulator.QxSelenium.getInstance().getQxObjectHash(locator);
      var cmd = 'selenium.qxStoredVars["autWindow"].qx.Simulation.removeListenerById("' + objectHash + '", "' + listenerId + '")';
      var result = simulator.QxSelenium.getInstance().getEval(cmd);
      return String(result) == "true";
    },

    /**
     * Attaches a listener to a qooxdoo object that clones the incoming event
     * object and adds it to the event store.
     *
     * @param locator {String} A (Qx)Selenium locator string that finds a
     * qooxdoo widget
     * @param event {String} The name of the event to listen for
     * @param script {String?} Javascript snippet to be executed in the widget's
     * context.
     * @return {String} The listener's ID as returned by addListener
     *
     * @lint ignoreUndefined(selenium)
     */
    storeEvent : function(locator, event, script)
    {
      var callback = function(ev) {
        qx.Simulation.eventStore.push(ev.clone());
      };
      return this.addListener(locator, event, callback, script);
    },

    /**
     * Executes a JavaScript snippet on a stored event and returns the result.
     *
     * @param index {Integer} Index of the event in the store
     * @param detailString {String} Code snippet to execute, e.g.
     * "getTarget().classname"
     * @return {String} The result of the executed code
     */
    getStoredEventDetail : function(index, detailString)
    {
      var cmd = 'selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore[' + index + ']';
      if (detailString[0] != "[" && detailString[0] != ".") {
        cmd += ".";
      }
      cmd += detailString;
      return String(simulator.QxSelenium.getInstance().getEval(cmd));
    },

    /**
     * Empties the event store.
     */
    clearEventStore : function()
    {
      simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore = []');
    },

    /**
     * Returns the number of entries in the event store.
     *
     * @return {Integer} The event count
     */
    getStoredEventCount : function()
    {
      var storedEvents = simulator.QxSelenium.getInstance().getEval('selenium.qxStoredVars["autWindow"].qx.Simulation.eventStore.length');
      return parseInt(storedEvents, 10);
    }
  }
});