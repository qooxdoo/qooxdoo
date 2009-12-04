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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(showcase.page.form.Content)

************************************************************************ */

qx.Class.define("showcase.page.form.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Form",
      part: "form",
      icon: "showcase/form/icon.png",
      contentClass: "showcase.page.form.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Form",
        this.__descriptionText,
        this.__features,
        this.__manual,
        this.__demos,
        this.__api
      )
    });
  },
  
  
  members : 
  {
    __demos : {
      "#ui~FormRenderer.html" : "Default form renderer",
      "#ui~FormRendererCustom.html" : "Custom form renderer",
      "#ui~FormRendererDouble.html" : "Double column form renderer",
      "#ui~FormRendererPlaceholder.html" : "Form renderer using placeholders",
      "#ui~FormValidator.html" : "Form validation",
      "#ui~MultiPageForm.html" : "Multi page form",
      "#showcase~Form.html" : "Form showcase",
      "#data~FormController.html" : "Data binding form controller",
      "#data~Form.html": "Data bound form"
    },

    __api : {
      "#qx.ui.form" : "The form namespace",
      "#qx.ui.form.renderer" : "Form renderer",
      "#qx.data.controller.Form" : "Form controller for binding"
    },
    
    __features : {
      "Complete" : "Complete set of form widgets.",
      "Placeholder" : "Text input widgets offer a placeholder.",
      "Keyboard navigation" : "Try to cycle through the widgety by using the tab key."
    },
    
    __manual : {
      "ui_form_handling": "Form handling"
    },
        
    
    __descriptionText : "This form demo shows the complete set of form " + 
      "widgets. The widgets are grouped by ther purpose."
  }  
});