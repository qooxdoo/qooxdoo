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
/**
 * @lint ignoreReferenceField(__descriptionText, __tryThis,
 *   __features, __manual, __demos, __api)
 */
qx.Class.define("showcase.page.i18n.Page",
{
  extend : showcase.Page,

  construct: function()
  {
    this.base(arguments);
    this.set({
      name: "Languages",
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
      'Internationalization (or \"I18N\" for short) is all about making' +
      " a system support different natural languages and" +
      " locales in its user interface. qooxdoo has full translation support " +
      "and comprises locale information of virtually every country in the world.",

    __tryThis : {
      "Change the language":
        "Hit one of the flag buttons on the top to change " +
        "the language. All labels on the page will be translated, including " +
        "labels in standard qooxdoo widgets like the calendar.",
      "Change the country":
        "The first select box on the left lets you change the country code. " +
        "The country code defines things like date or number formats. Try " +
        "changing the country code from <em>United States</em> to " +
        "<em>Great Britain</em>. You will see that e.g. the start of the week " +
        "changes from Sunday to Monday.",
      "Open the command menu":
        "The command menu button in the lower left opens a popup menu. Even the " +
        "keyboard shortcuts are localized."
    },

    __features : {
      "Standards based translation" :
        "Translation data is extracted into standard <em>.po</em> " +
        "files, as defined by GNU <em>gettext</em> tools. Many " +
        "open source tools can process those translation files.",
      "CLDR" :
        "Localisation data like date and time formats are taken from the " +
        "<a href='http://cldr.unicode.org/'>Unicode Common Locale Data Repository</a> (CLDR). This " +
        "guarantees that qooxdoo uses the standardized data for even the smallest " +
        "countries.",
      "Live locale switching" :
        "All widgets are designed in a way that allows for locale switching in the running application."
    },

    __manual : {
      "pages/development/internationalization.html" : "Internationalization"
    },

    __demos : {
      "#showcase~Localization.html" : "Localization demo"
    },

    __api : {
      "#qx.locale" : "Locale Package"
    }
  }
});
