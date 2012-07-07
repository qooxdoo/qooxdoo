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
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
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
        this.__tryThis,
        this.__features,
        this.__manual,
        this.__demos,
        this.__api
      )
    });
  },


  members :
  {
    __descriptionText : "This form demo shows the complete set of form " +
    "widgets. The widgets are grouped by type.",

    __tryThis : {
      "Selection" : "Open the select box to see the list of selectables.",
      "Text" : "The placeholder disappears once you start to type in a text field.",
      "Buttons" : "Hold the repeat button to see the value increase.",
      "MenuButton" : "Click the \"MenuButton\" to open the menu."
    },

    __features : {
      "Widgets" : "Complete set of form widgets.",
      "Keyboard Navigation" : "Try cycling through the widgets by pressing the tab key."
    },

    __manual : {
      "pages/desktop/ui_form_handling.html": "Form handling"
    },

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
      "#qx.ui.form" : "Form Package",
      "#qx.ui.form.renderer" : "Form Renderer",
      "#qx.data.controller.Form" : "Form Controller for Binding"
    }
  }
});
