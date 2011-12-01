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
#ignore(importClass)
#ignore(QxSelenium)
#ignore(ThreadSafeSeleniumSessionStorage)
************************************************************************ */


/**
 * Imports the com.thoughtworks.selenium.QxSelenium Java class and creates
 * an instance. If the "simulator.threadSafe" setting is active, a session
 * created by Selenium Grid's ThreadSafeSeleniumSessionStorage is returned
 * instead.
 *
 * QxSelenium extends DefaultSelenium (see {@link http://jarvana.com/jarvana/view/org/seleniumhq/selenium/selenium-rc-documentation/1.0/selenium-rc-documentation-1.0-doc.zip!/java/com/thoughtworks/selenium/DefaultSelenium.html}),
 * adding the qooxdoo-specific commands documented below.
 *
 * Commands that simulate mouse clicks such as {@link #qxClick} take a
 * parameter that allows configuring the generated events. The value  must be a
 * string of comma-separated __key=value pairs__. The following settings are
 * supported:
 *
 *  <pre>double: fire a "dblclick" event
 *   - possible values: true, false
 *   - default value  : false
 *  button: the mouse button to be pressed
 *   - possible values: left, right, middle
 *   - default value  : left
 *  clientX and clientY: mouse coordinates
 *   - possible values: any positive integer
 *   - default value  : 0
 *  shiftKey, altKey, metaKey: additional modifier keys being pressed while
 *  clicking
 *   - possible values: true, false
 *   - default value  : false</pre>
 *
 * Getter commands will always return a Java string object. This should always
 * be converted to a JavaScript string for comparisons or string operations,
 * e.g. by calling String(qxSeleniumReturnValue)
 *
 * @lint ignoreUndefined(importClass,QxSelenium,ThreadSafeSeleniumSessionStorage)
 */
qx.Class.define("simulator.QxSelenium", {

  extend : qx.core.Object,

  type : "singleton",

  construct : function()
  {
    this.base(arguments);
    var server = qx.core.Environment.get("simulator.selServer");
    var port = qx.core.Environment.get("simulator.selPort");
    var browser = qx.core.Environment.get("simulator.testBrowser");
    var host = qx.core.Environment.get("simulator.autHost");

    var threadSafe = qx.core.Environment.get("simulator.threadSafe");
    if (threadSafe) {
      try {
        importClass(Packages.com.thoughtworks.selenium.grid.tools.ThreadSafeSeleniumSessionStorage);
      }
      catch(ex) {
        throw new Error("Couldn't import ThreadSafeSeleniumSessionStorage class!\n\
         Make sure the Selenium Grid Tools are available.\n" + ex);
      }

      // Create and configure QxSelenium instance
      ThreadSafeSeleniumSessionStorage.startSeleniumSession(server, port, browser, host);
      return ThreadSafeSeleniumSessionStorage.session();
    }
    else {
      // Basic sanity check: No sense in continuing without QxSelenium.
      try {
        importClass(Packages.com.thoughtworks.selenium.QxSelenium);
      }
      catch(ex) {
        throw new Error("Couldn't import QxSelenium class! Make sure the qooxdoo "
        + "Selenium user extensions are installed in your Selenium client.\n" + ex);
      }

      // Create and configure QxSelenium instance
      return new QxSelenium(server, port, browser, host);
    }
  },


  /*
  *****************************************************************************
     These stubs are for documentation purposes only, the actual implementation
     is in the user extensions for Selenium
     (component/simulator/tool/user-extension/user-extensions.js)
  *****************************************************************************
  */

  members :
  {

    /**
     * Clicks on a qooxdoo widget.
     * Always synthesizes the following events: __mouseover__, __mousedown__,
     * __mouseup__.
     * Additionally, __click__, __dblclick__ or __contextmenu__ will be fired
     * depending on the specified params
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxClick : function(locator, params) {},


    /**
     * Clicks on a qooxdoo widget, adding the widget's coordinates to the
     * generated events.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxClickAt : function(locator, params) {},


    /**
     * Uses the given locator to find a {@link qx.ui.table.Table}, then
     * simulates a click on the table at the given row/column position.
     * Note, your locator should only find the table itself. Sub-widgets, e.g.
     * Composite/Scroller/Clipper will be automatically added to the locator as
     * required.
     *
     * <p>
     * The column to click can be located using the index, ID or name as defined
     * in the table model by adding one of the __col__, __colId__ or __colName__
     * parameters to the "params" string.
     * Alternatively, a specific cell can be located by RegExp matching its
     * content using the __cellValue__ parameter.
     * *NOTE*: This currently only works with tables using a Simple table model
     * ({@link qx.ui.table.model.Simple})!
     *
     * <p>
     * Supported params keys:
     * <pre>- All mouse event parameters
     * - row: Index of the table row to click
     * - col: Index of the table column to click
     * - colId: ID of the column to click
     * - colName: Name of the column to click
     * - cellValue: Content of a (text) cell to click</pre>
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxTableClick : function(locator, params) {},


    /**
     * Simulates clicking a header cell of a {@link qx.ui.table.Table}.
     *
     * The column to click can be located using the index, ID or name as defined
     * in the table model by adding one of the __col__, __colId__ or __colName__
     * parameters to the "params" string.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxTableHeaderClick : function(locator, params) {},


    /**
     * Simulates user interaction with editable table cells. *NOTE*: The
     * target cell's editing mode must be activated immediately before this
     * command is used, e.g. by executing a double click on it using the
     * {@link #qxTableClick} command with "double=true" added to the params.
     * <p>
     * The following cell editor types are supported:

     * *Text fields* ({@link qx.ui.table.celleditor.PasswordField},
     * {@link qx.ui.table.celleditor.TextField},
     * {@link qx.ui.table.celleditor.ComboBox}): Use either the __type__ or
     * __typeKeys__ parameters (see {@link #qxType} and {@link #qxTypeKeys}).
     * Examples:
     * <pre>qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "type=Some text");
     * qxSelenium.qxEditTableCell("myTable", "typeKeys=Lots of events");</pre>
     * <p>
     * *Select boxes* ({@link qx.ui.table.celleditor.SelectBox},
     * {@link qx.ui.table.celleditor.ComboBox}): Use the __selectFromBox__
     * parameter. The value must be a qxh locator step that identifies the list
     * item to be clicked.
     * Examples:
     * <pre>qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "selectFromBox=[@label=Germany]");
     * qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "selectFromBox=child[2]");</pre>
     * <p>
     * *Checkboxes* ({@link qx.ui.table.celleditor.CheckBox}): Use the
     * __toggleCheckBox__ parameter.
     * Example:
     * <pre>qxSelenium.qxEditTableCell("qxh=qx.ui.table.Table", "toggleCheckBox=foo");</pre>
     * (toggleCheckBox needs a value to be recognized as a valid parameter even
     * though it is ignored.)
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} comma-separated list of additional parameters
     */
    qxEditTableCell : function(locator, params) {},


    /**
     * Uses the standard qx locators to find a table, then returns the number of
     * rows defined in the table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} The number of rows defined in the table model
     */
    getQxTableRowCount : function(locator) {},


    /**
     * Uses the standard qx locators to find a table, then returns the number of
     * columns from the table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} The number of columns defined in the table model
     */
    getQxTableModelColCount : function(locator) {},


    /**
     * Uses the standard qx locators to find a table, then returns the number of
     * currently visible columns.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} The number of visible columns
     */
    getQxTableVisibleColCount : function(locator) {},


    /**
     * Uses the standard qx locators to find a table, then returns the value
     * of the specified cell from the table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param params {String} A string that should contain row and column
     * identifers (see {@link #qxTableClick}
     * @return {Object} The value of the cell. Primitive types will be returned
     * as strings, Objects will be serialized using JSON.
     */
    getQxTableValue : function(locator, params) {},


    /**
     * Uses the standard qx locators to find a table then returns a semicolon-
     * separated list of column IDs from the table model. Note that this can
     * differ from the columns that are actually visible in the table.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} A list of column IDs
     */
    getQxTableModelColumnIds : function(locator) {},


    /**
     * Uses the standard qx locators to find a table then returns a semicolon-
     * separated list of column IDs. Only visible columns are included.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @return {Object} A list of column IDs
     */
    getQxTableVisibleColumnIds : function(locator) {},


    /**
     * Searches the given table for a column with the given name and returns the
     * visible column index. Note that this can differ from the column's index
     * in the table model if there are invisible columns and/or the column order
     * has been changed.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     * @param name {String} name The column name to be searched for
     * @return {Object} The found column index
     */
    getQxTableColumnIndexByName : function(locator, name) {},


    /**
     * Returns a qooxdoo table's selected row data (an array of rows which are
     * arrays of cell values). Data will be returned as a JSON string if a JSON
     * implementation is available (either the browser's or qooxdoo's).
     * Otherwise, the return value is a comma-separated string that must be
     * parsed by the caller.
     *
     * @param locator {String} an element locator that finds a qooxdoo table's
     * DOM element
     */
    getQxTableSelectedRowData : function(locator) {},


    /**
     * Executes the given function of a qooxdoo widget identified by a locator.
     * If the widget does not contain the referenced function, an exception will
     * be thrown.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param functionName {String} The name of the function to be called
     * @return {Object} The function's return value
     */
    getQxObjectFunction : function(locator, functionName) {},


    /**
     * Creates a new function with the value of the __script__ parameter as body.
     * This function is bound to the context of the qooxdoo widget returned by
     * the given locator, i.e. __this__ within the script will refer to the
     * widget. The function is then called and the return value is serialized in
     * JSON format (unless it is a string or number) and returned.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param script {String} JavaScript snippet
     * @return {Object} Return value of the generated function
     */
    getRunInContext : function(locator, script) {},


    /**
     * Returns a qooxdoo object's ID as generated by qx.core.ObjectRegistry.
     * If only the __locator__ parameter is given, the hash code of the widget
     * it identifies will be returned. If the optional __script__ parameter is
     * given, its value will be executed as a function in the widget's context
     * and the hash of the object it returns will be returned instead. Example:
     *
     * <pre>getQxObjectHash("myTable", "return this.getTableModel();");</pre>
     *
     * will find a qooxdoo table with the HTML ID "myTable" and return the hash
     * of its table model.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param script {String?} Optional JavaScript snippet to be executed in the
     * widget's context
     * @return {Object} the object's hash code
     */
    getQxObjectHash : function(locator, script) {},


    /**
     * Simulates dragging an element a certain distance and then dropping it.
     * Optionally executes __mouseover__, __mousemove__ and __mouseup __on a
     * second element specified by __targetLocator__
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param offset {String} offset in pixels from the current location to
     * which the element should be moved, e.g., "+70,-300"
     * @param targetLocator {String?} (optional) locator for the drop target.
     */
    qxDragAndDrop : function(locator, offset, targetLocator) {},


    /**
     * Simulates dragging an element and dropping it on another element. The
     * second parameter is the locator of the drop target element, e.g.:
     *
     * <pre>qxDragAndDropToObject("qxhv=/qx.ui.form.List/child[0]",
     * "qxhv=qx.ui.form.TextArea");</pre>
     *
     * For qx.ui.table.Table and widgets that inherit from it, drag operations
     * starting from a specific table cell are supported. In this case, the
     * parameters string must contain the information needed to target a cell,
     * as expected by {@link qxTableClick}. Also, the drop target locator must
     * be prefaced with "target=", e.g.:
     *
     * <pre>qxDragAndDropToObject("qxhv=/qx.ui.table.Table",
     * "target=qxhv=qx.ui.form.TextArea,row=5,cell=3");</pre>
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param options an element whose location (i.e., whose
     * center-most pixel) will be the point where the dragged element is dropped
     */
    qxDragAndDropToObject : function(locator, options) {},


    /**
     * Sets the value of a qooxdoo text field widget which can either be the
     * widget returned by the given locator, or one of its child widgets (i.e.
     * for {@link qx.ui.form.ComboBox}).
     * Does *not* simulate key events - only the HTML text field's __value__
     * attribute is set.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param value {String} the value to set
     */
    qxType : function(locator, value) {},


    /**
     * Simulates a user entering text into any qooxdoo widget that either
     * inherits from {@link qx.ui.form.AbstractField}  or has a child control
     * that does. __keydown__, __keypress__ and __keyup__ events are fired for
     * each character in the given value.
     *
     * @param locator {String} an element locator that finds a qooxdoo widget's
     * DOM element
     * @param value {String} the value to type
     */
    qxTypeKeys : function(locator, value) {}
  }

});

