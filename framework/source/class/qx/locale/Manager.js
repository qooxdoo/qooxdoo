/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/*
#require(qx.event.dispatch.Direct)
#require(qx.locale.LocalizedString)
#cldr
*/

/**
 * The qx.locale.Manager provides static translation methods (like tr()) and
 * general locale information.
 */

qx.Class.define("qx.locale.Manager",
{
  type : "singleton",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__translations = qx.$$translations || {};
    this.__locales      = qx.$$locales || {};

    var locale = qx.core.Environment.get("locale");
    var variant = qx.core.Environment.get("locale.variant");
    if (variant !== "") {
      locale += "_" + variant;
    }

    this.__clientLocale = locale;

    this.setLocale(locale || this.__defaultLocale);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Translate a message
     *
     * @param messageId {String} message id (may contain format strings)
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     * @see qx.lang.String.format
     */
    tr : function(messageId, varargs)
    {
      var args = qx.lang.Array.fromArguments(arguments);
      args.splice(0, 1);

      return qx.locale.Manager.getInstance().translate(messageId, args);
    },


    /**
     * Translate a plural message
     *
     * Depending on the third argument the plural or the singular form is chosen.
     *
     * @param singularMessageId {String} message id of the singular form (may contain format strings)
     * @param pluralMessageId {String} message id of the plural form (may contain format strings)
     * @param count {Integer} singular form if equals 1, otherwise plural
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     * @see qx.lang.String.format
     */
    trn : function(singularMessageId, pluralMessageId, count, varargs)
    {
      var args = qx.lang.Array.fromArguments(arguments);
      args.splice(0, 3);

      // assumes "Two forms, singular used for one only" (seems to be the most common form)
      // (http://www.gnu.org/software/gettext/manual/html_node/gettext_150.html#Plural-forms)
      // closely related with bug #745
      if (count != 1) {
        return qx.locale.Manager.getInstance().translate(pluralMessageId, args);
      } else {
        return qx.locale.Manager.getInstance().translate(singularMessageId, args);
      }
    },


    /**
     * Translate a message with translation hint
     *
     * @param hint {String} hint for the translator of the message. Will be included in the .po file.
     * @param messageId {String} message id (may contain format strings)
     * @param varargs {Object} variable number of arguments applied to the format string
     * @return {String | LocalizedString} The translated message or localized string
     * @see qx.lang.String.format
     */
    trc : function(hint, messageId, varargs)
    {
      var args = qx.lang.Array.fromArguments(arguments);
      args.splice(0, 2);

      return qx.locale.Manager.getInstance().translate(messageId, args);
    },


    /**
     * Mark the message for translation but return the original message.
     *
     * @param messageId {String} the message ID
     * @return {String} messageId
     */
    marktr : function(messageId) {
      return messageId;
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** current locale. locale is an language code like de, de_AT, en, en_GB, fr, ... */
    locale :
    {
      check : "String",
      nullable : true,
      apply : "_applyLocale",
      event : "changeLocale"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __defaultLocale : "C",
    __locale : null,
    __language : null,
    __translations : null,
    __locales : null,
    __clientLocale : null,

    /**
     * Get the language code of the current locale
     *
     * This is the first part of a locale definition. The language for "de_DE" would be "de"
     *
     * @return {String} language code
     */
    getLanguage : function() {
      return this.__language;
    },


    /**
     * Get the territory code of the current locale
     *
     * This is the second part of a locale definition. The territory for "de_DE" would be "DE"
     *
     * @return {String} territory code
     */
    getTerritory : function() {
      return this.getLocale().split("_")[1] || "";
    },


    /**
     * Return the available application locales
     *
     * This corresponds to the LOCALES setting in config.json. Without argument,
     * it only returns the currently loaded locales, with an argument of true
     * all locales that went into the build. This is particularly interesting if
     * locales were generated as dedicated I18N parts, and have to be loaded
     * explicitly before being available.
     *
     * @param includeNonloaded {Boolean?null} include locales not yet loaded
     * @return {String[]} array of available locales
     */
    getAvailableLocales : function(includeNonloaded)
    {
      var locales = [];

      for (var locale in this.__locales)
      {
        if (locale != this.__defaultLocale) {
          if (this.__locales[locale] === null && !includeNonloaded) {
            continue;  // skip not yet loaded locales
          }
          locales.push(locale);
        }
      }

      return locales;
    },


    /**
     * Extract the language part from a locale.
     *
     * @param locale {String} locale to be used
     * @return {String} language
     */
    __extractLanguage : function(locale)
    {
      var language;
      if (locale == null) {
        return null;
      }
      var pos = locale.indexOf("_");

      if (pos == -1) {
        language = locale;
      } else {
        language = locale.substring(0, pos);
      }

      return language;
    },


    // property apply
    _applyLocale : function(value, old)
    {
      if (qx.core.Environment.get("qx.debug")) {
        if (!(value in this.__locales || value == this.__clientLocale)) {
          qx.log.Logger.warn("Locale: " + value+" not available.");
        }
      }

      this.__locale = value;
      this.__language = this.__extractLanguage(value);
    },


    /**
     * Add a translation to the translation manager.
     *
     * If <code>languageCode</code> already exists, its map will be updated with
     * <code>translationMap</code> (new keys will be added, existing keys will be
     * overwritten).
     *
     * @param languageCode {String} language code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
     * @param translationMap {Map} mapping of message identifiers to message strings in the target
     *                             language, e.g. <i>{"greeting_short" : "Hello"}</i>. Plural forms
     *                             are separate keys.
     * @return {void}
     */
    addTranslation : function(languageCode, translationMap)
    {
      var catalog = this.__translations;
      if (catalog[languageCode])
      {
        for (var key in translationMap) {
          catalog[languageCode][key] = translationMap[key];
        }
      }
      else
      {
        catalog[languageCode] = translationMap;
      }
    },


    /**
     * Add a localization to the localization manager.
     *
     * If <code>localeCode</code> already exists, its map will be updated with
     * <code>localeMap</code> (new keys will be added, existing keys will be overwritten).
     *
     * @param localeCode {String} locale code of the translation like <i>de, de_AT, en, en_GB, fr, ...</i>
     * @param localeMap {Map} mapping of locale keys to the target locale values, e.g.
     *                        <i>{"cldr_date_format_short" : "M/d/yy"}</i>.
     * @return {void}
     */
    addLocale : function(localeCode, localeMap)
    {
      var catalog = this.__locales;
      if (catalog[localeCode])
      {
        for (var key in localeMap) {
          catalog[localeCode][key] = localeMap[key];
        }
      }
      else
      {
        catalog[localeCode] = localeMap;
      }
    },


    /**
     * Translate a message using the current locale and apply format string to the arguments.
     *
     * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
     * default locale (e.g. C). Localizes the arguments if possible and splices
     * them into the message. If qx.dynlocale is on, returns a {@link
     * LocalizedString}.
     *
     * @param messageId {String} message id (may contain format strings)
     * @param args {Object[]} array of objects, which are inserted into the format string
     * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
     * @return {String | LocalizedString} translated message or localized string
     */
    translate : function(messageId, args, locale)
    {
      var catalog = this.__translations;
      return this.__lookupAndExpand(catalog, messageId, args, locale);
    },

    /**
     * Provide localisation (CLDR) data.
     *
     * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
     * default locale (e.g. C). Localizes the arguments if possible and splices
     * them into the message. If qx.dynlocale is on, returns a {@link
     * LocalizedString}.
     *
     * @param messageId {String} message id (may contain format strings)
     * @param args {Object[]} array of objects, which are inserted into the format string
     * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
     * @return {String | LocalizedString} translated message or localized string
     */
    localize : function(messageId, args, locale)
    {
      var catalog = this.__locales;
      return this.__lookupAndExpand(catalog, messageId, args, locale);
    },


    /**
     * Look up an I18N key in a catalog and expand format strings.
     *
     * Implements the lookup chain locale (e.g. en_US) -> language (e.g. en) ->
     * default locale (e.g. C). Localizes the arguments if possible and splices
     * them into the message. If qx.dynlocale is on, returns a {@link
     * LocalizedString}.
     *
     * @param catalog {Map} map of I18N keys and their values
     * @param messageId {String} message id (may contain format strings)
     * @param args {Object[]} array of objects, which are inserted into the format string
     * @param locale {String ? #locale} locale to be used; if not given, defaults to the value of {@link #locale}
     * @return {String | LocalizedString} translated message or localized string
     */
    __lookupAndExpand : function(catalog, messageId, args, locale)
    {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertObject(catalog);
        this.assertString(messageId);
        this.assertArray(args);
      }
      var txt;

      if (!catalog) {
        return messageId;
      }

      if (locale) {
        var language = this.__extractLanguage(locale);
      }
      else
      {
        locale = this.__locale;
        language = this.__language;
      }

      // e.g. DE_at
      if (!txt && catalog[locale]) {
        txt = catalog[locale][messageId];
      }

      // e.g. DE
      if (!txt && catalog[language]) {
        txt = catalog[language][messageId];
      }

      // C
      if (!txt && catalog[this.__defaultLocale]) {
        txt = catalog[this.__defaultLocale][messageId];
      }

      if (!txt) {
        txt = messageId;
      }

      if (args.length > 0)
      {
        var translatedArgs = [];
        for ( var i = 0; i < args.length; i++)
        {
          var arg = args[i];
          if (arg && arg.translate) {
            translatedArgs[i] = arg.translate();
          } else {
            translatedArgs[i] = arg;
          }
        }
        txt = qx.lang.String.format(txt, translatedArgs);
      }

      if (qx.core.Environment.get("qx.dynlocale")) {
        txt = new qx.locale.LocalizedString(txt, messageId, args);
      }

      return txt;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__translations = this.__locales = null;
  }
});
