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

#use(showcase.page.theme.Content)

************************************************************************ */

qx.Class.define("showcase.page.theme.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Theming",
      part: "theme",
      icon: "showcase/theme/icon.png",
      contentClass: "showcase.page.theme.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Theming",
        this.__descriptionText,
        null,
        this.__features,
        this.__manual,
        this.__demos,
        this.__api
      )
    });
  },
  
  members :
  {
    __descriptionText : 
      "qooxdoo provides a powerful theming system, which is build on a custom " +
      "JSON like declarative syntax. Unlike CSS this syntax doesn't have any " +
      "cross browser issues and allows to style any widget property. It is " +
      "possible to create completely different themes without touching the " +
      "application code</p>" +
      "<p> The two calculators on this page share exactly the same application " +
      "and UI code and differ only in their theme.",
    
    __features : {
      "States" : "Widgets can have states like <code>selected</code> or " + 
        "<code>hovered</code>, which can be used by the theme to style the widgets.",
      "Decorators" : "Any HTML code can be used to style the background of a " + 
        "widget independent from its content. Qooxdoo comes with a rich set of " +
        "pre-defined decorators."
    },
    
    __manual : {
      "ui_theming": "Theming",
      "ui_appearance": "Appearance",
      "ui_custom_themes": "Custom themes",
      "ui_decorators": "Decorators"
    },
    
    __demos : {
      "#ui~Decoration.html" : "This demo shows all available decorators."
    },
    
    __api : {
      "#qx.theme": "This namespace contains the theme managers and the two standard themes.."
    }
  }
});