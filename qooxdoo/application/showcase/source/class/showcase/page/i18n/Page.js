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

#use(showcase.page.i18n.Content)

************************************************************************ */

qx.Class.define("showcase.page.i18n.Page",
{
  extend : showcase.Page,
  
  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "i18n",
      part: "i18n",
      icon: "showcase/i18n/icon.png",
      contentClass: "showcase.page.i18n.Content",
      description: showcase.page.DescriptionBuilder.build(
        "Internationalization",
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
    __descriptionText : 
      'I18N stands for <em>"Internationalization"</em>, a word that starts with' +
      'an "I" and ends with an "N" and has roughly 18 characters in between. ' +
      "It's all about making a system support different natural languages and " +
      "locales in its user interface. qooxdoo has full translation support and " +
      "knows about locale information of virtually every country in the world.",
      
    __tryThis : {
      "Change the language": 
        "Hit one of the flag buttons on the top to change " +
        "the language. All labels on the page will be translated including " +
        "labels in standard qooxdoo widgets like the calendar.,",
      "Change the country": 
        "The first select box on the left lets you change the country code. " +
        "The country code defines things like date or number formats. Try " +
        "changing the country code from <em>United States</em> to " +
        "<em>Great Britan</em>. You will see that e.g. the start of the week " +
        "will change from monday to sunday.",
      "Open the command menu":
        "The command menu button at the lower left opens a popup menu. Even the " +
        "keyboard shortcuts are localized."
    },
    
    __features : {
      "Standard based translation" : 
        "Translation data is extracted into standard <em>.po</em> " +
      	"files, which are used by the <em>gettext</em> tools. There is a rich " +
      	"set of open source tools to process the translation files.",
      "CLDR" :
        "Localisation data like date and time formats are taken from the " +
        "<a href=''>Unicode Common Locale Data Repository</a> (CLDR). This " +
        "guarantees that qooxdoo uses the official data even for the smallest " +
        "countries.", 
      "Live locale switching" : 
        "All widgets are designed in a way that allows for live locale switching."
    },
    
    __manual : null,    
      
    __demos : {
      "#showcase~Localization.html" : "Localization demo"
    },

    __api : {
      "#qx.locale" : "qx.locale.*"
    }  
  }  
});