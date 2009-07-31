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
 * The form object is responsible for managing form items. The view code can be 
 * found in the used renderer.
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
    
    add : function(item, label, validator) {
      if (this.__isFirstAdd()) {
        this.__groups.push({title: null, items: [], labels: []});
      }
      // save the given arguments
      this.__groups[this.__groupCounter].items.push(item);
      this.__groups[this.__groupCounter].labels.push(label);
      
      // add the item to the validation manager
      this.__validationManager.add(item, validator);
      // add the item to the reset manager
      this.__resetter.add(item);
    },
    
    addGroupHeader : function(title) {
      if (!this.__isFirstAdd()) {
        this.__groupCounter++;
      }      
      this.__groups.push({title: title, items: [], labels: []});
    },
    
    addButton : function(button) {
      this.__buttons.push(button);
    },
    
    __isFirstAdd : function() {
      return this.__groups.length === 0;
    },
    
    
    /*
    ---------------------------------------------------------------------------
       RESET
    ---------------------------------------------------------------------------
    */
    reset : function() {
      this.__resetter.reset();
      this.__validationManager.reset();
    },
        
    
    /*
    ---------------------------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------------------------
    */    
    validate : function() {
      return this.__validationManager.validate();
    },
    
    getValidationManager : function() {
      return this.__validationManager;
    },
    
    
    
    /*
    ---------------------------------------------------------------------------
       RENDERER 
    ---------------------------------------------------------------------------
    */    
    createView : function(rendererClass) {
      if (rendererClass == null) {
        rendererClass = qx.ui.form.renderer.Single;
      } else {
        // check if the renderer class is valid
        this.__checkRenderer(rendererClass);        
      }

      
      // create the renderer
      var renderer = new rendererClass();
      // add the groups
      for (var i = 0; i < this.__groups.length; i++) {
        var group = this.__groups[i];
        renderer.addItems(group.items, group.labels, group.title);
      }
      // add the buttons
      for (var i = 0; i < this.__buttons.length; i++) {
        renderer.addButton(this.__buttons[i]);
      }

      return renderer;
    },    
    
    
    __checkRenderer : function(rendererClass) {
      // check for the right interface
      if (qx.core.Variant.compilerIsSet("qx.debug", "on")) {
        var rendererInterface = qx.ui.form.renderer.IFormRenderer;
        if (!qx.Class.hasInterface(rendererClass, rendererInterface)) {
          throw new Error(
            rendererClass + " need to implement " + rendererInterface
          );
        }
      }      
    }
  }
});
