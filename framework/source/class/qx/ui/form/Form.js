/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * <h3>EXPERIMENTAL!</h3>
 *
 * The form object is responsible for managing form items. For that, it takes
 * advantage of two existing qooxdoo classes.
 * The {@link qx.ui.form.Resetter} is used for resetting and the
 * {@link qx.ui.form.validation.Manager} is used for all validation purposes.
 *
 * The view code can be found in the used renderer ({@link qx.ui.form.renderer}).
 */
qx.Class.define("qx.ui.form.Form",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);

    this.__groups = [];
    this.__buttons = [];
    this.__validationManager = new qx.ui.form.validation.Manager();
    this.__resetter = new qx.ui.form.Resetter();
  },


  members :
  {
    __groups : null,
    __validationManager : null,
    __groupCounter : 0,
    __buttons : null,
    __resetter : null,

    /*
    ---------------------------------------------------------------------------
       ADD
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a form item to the form including its internal
     * {@link qx.ui.form.validation.Manager} and {@link qx.ui.form.Resetter}.
     *
     * *Hint:* The order of all add calls represent the order in the layout.
     *
     * @param item {qx.ui.form.IForm} A supported form item.
     * @param label {String} The string, which should be used as label.
     * @param validator {Function | qx.ui.form.validation.AsyncValidator | null}
     *   The validator which is used by the validation
     *   {@link qx.ui.form.validation.Manager}.
     * @param name {String|null} The name which is used by the data binding
     *   controller {@link qx.data.controller.Form}.
     */
    add : function(item, label, validator, name) {
      if (this.__isFirstAdd()) {
        this.__groups.push({title: null, items: [], labels: [], names: []});
      }
      // save the given arguments
      this.__groups[this.__groupCounter].items.push(item);
      this.__groups[this.__groupCounter].labels.push(label);
      // if no name is given, use the label without whitespaces
      if (name == null) {
        name = label.replace(/\s+/g, "");
      }
      this.__groups[this.__groupCounter].names.push(name);

      // add the item to the validation manager
      this.__validationManager.add(item, validator);
      // add the item to the reset manager
      this.__resetter.add(item);
    },


    /**
     * Adds a group header to the form.
     *
     * *Hint:* The order of all add calls represent the order in the layout.
     *
     * @param title {String} The title of the group header.
     */
    addGroupHeader : function(title) {
      if (!this.__isFirstAdd()) {
        this.__groupCounter++;
      }
      this.__groups.push({title: title, items: [], labels: [], names: []});
    },


    /**
     * Adds a button to the form.
     *
     * *Hint:* The order of all add calls represent the order in the layout.
     *
     * @param button {qx.ui.form.Button} The button to add.
     */
    addButton : function(button) {
      this.__buttons.push(button);
    },


    /**
     * Returns whether something has already been added.
     *
     * @return {Boolean} true, if nothing has been added jet.
     */
    __isFirstAdd : function() {
      return this.__groups.length === 0;
    },


    /*
    ---------------------------------------------------------------------------
       RESET SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Resets the form. This means reseting all form items and the validation.
     */
    reset : function() {
      this.__resetter.reset();
      this.__validationManager.reset();
    },
    
    
    /**
     * Redefines the values used for resetting. It calls 
     * {@link qx.ui.form.Resetter#redefine} to get that.
     */
    redefineResetter : function() 
    {
      this.__resetter.redefine();
    },


    /*
    ---------------------------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------------------------
    */

    /**
     * Validates the form using the
     * {@link qx.ui.form.validation.Manager#validate} method.
     *
     * @return {Boolean | null} The validation result.
     */
    validate : function() {
      return this.__validationManager.validate();
    },


    /**
     * Returns the internally used validation manager. If you want to do some
     * enhanced validation tasks, you need to use the validation manager.
     *
     * @return {qx.ui.form.validation.Manager} The used manager.
     */
    getValidationManager : function() {
      return this.__validationManager;
    },


    /*
    ---------------------------------------------------------------------------
       RENDERER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Accessor mehtod for the renderer which returns all added items in a
     * array containing a map of all items:
     * {title: title, items: [], labels: [], names: []}
     * 
     * @return {Array} An array contining all necessary data for the renderer.
     * @internal
     */
    getGroups : function() 
    {
      return this.__groups;
    },
    
    
    /**
     * Accessor mehtod for the renderer which returns all added buttons in an
     * array.
     * @return {Array} An array containing all added buttons.
     * @internal
     */
    getButtons : function() 
    {
      return this.__buttons;
    },


    /**
     * Takes all the added form items, group headers and buttons and gives them
     * to the renderer. The renderer is responsible for all the UI related
     * tasks.
     *
     * @param rendererClass {Class?} The class of the renderer which should be
     *   used. If no rendere is given, the default renderer
     *   ({@link qx.ui.form.renderer.Single}) will be used.
     * @return {qx.ui.form.renderer.IFormRenderer} Instance of the renderer.
     * 
     * @deprecated Create the renderer and add the form as constructor 
     *   parameter instead.
     */
    createView : function(rendererClass) {
      qx.log.Logger.deprecatedMethodWarning(
        arguments.callee,
        "This message will removed. Use new rendererClass(form) instead."
      );
      if (rendererClass == null) {
        rendererClass = qx.ui.form.renderer.Single;
      }
      // create the renderer
      return new rendererClass(this);
    },


    /*
    ---------------------------------------------------------------------------
       INTERNAL
    ---------------------------------------------------------------------------
    */

    /**
     * Returns all added items as a map.
     *
     * @return {Map} A map containing for every item a entry with its name.
     *
     * @internal
     */
    getItems : function() {
      var items = {};
      // go threw all groups
      for (var i = 0; i < this.__groups.length; i++) {
        var group = this.__groups[i];
        // get all items
        for (var j = 0; j < group.names.length; j++) {
          var name = group.names[j];
          items[name] = group.items[j];
        }
      }
      return items;
    }

  }
});
