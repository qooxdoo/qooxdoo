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

#use(showcase.page.htmleditor.Content)

************************************************************************ */

qx.Class.define("showcase.page.htmleditor.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "HTML Editor",
      part: "htmleditor",
      icon: "showcase/htmleditor/icon.png",
      contentClass: "showcase.page.htmleditor.Content",
      description: showcase.page.DescriptionBuilder.build(
        "HTML Editor",
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
    __descriptionText : "TODO",
      
    __tryThis : {
      "Lists" : "Open the select box to see the list list of selectables."
    },
    
    __features : {
      "Complete" : "Complete set of form widgets."
    },
    
    __manual : {
      "ui_form_handling": "Form handling"
    },    
      
    __demos : {
      "#ui~FormRenderer.html" : "Default form renderer"
    },

    __api : {
      "#qx.ui.form" : "The form namespace"
    }  
  }  
});