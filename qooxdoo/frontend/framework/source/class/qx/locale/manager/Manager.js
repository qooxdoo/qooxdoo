/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */


/**
 * Create a new instance of qx.locale.manager.Manager
 */
qx.OO.defineClass("qx.locale.manager.Manager", qx.manager.object.ObjectManager,
function() {
  qx.manager.object.ObjectManager.call(this);

  this._translationCatalog = {};
  this.setLocale(qx.sys.Client.getInstance().getLocale() || this._defaultLanguage);
});


/** current locale. locale is an language code like de, de_AT, en, en_GB, fr, ... */
qx.OO.addProperty({ name: "locale"});


/**
 * Get the language code of the currnt locale
 * 
 * This is the first part of a locale definition. The language for "de_DE" would be "de"
 * 
 * @return {string} language code
 */
qx.Proto.getLanguage = function() {
  return this._language;
};


/**
 * Get the territory code of the currnt locale
 * 
 * This is the second part of a locale definition. The territory for "de_DE" would be "DE"
 * 
 * @return {string} territory code
 */
qx.Proto.getTerritory = function() {
  return this.getLocale().split("_")[1] || "";
}


/**
 * Extract the language part from a locale.
 * 
 * @param locale {string} locale to be used
 * @return {string} language
 */
qx.Proto._extractLanguage = function(locale) {
  var language;
  var pos = locale.indexOf("_");
  if (pos == -1) {
    language = locale;
  } else {
    language = locale.substring(0, pos);
  }
  return language;
};


qx.Proto._modifyLocale = function(propValue, propOldValue, propData) {
  this._locale = propValue;

  var pos = propValue.indexOf("_");
  this._language = this._extractLanguage(propValue);
  
  return true;
};


/**
 * Add a translation to the translation manager
 * 
 * @param languageCode (string) language code of the translation like de, de_AT, en, en_GB, fr, ...
 * @param translationMap (Map) mapping of message identifiers (english text) to the target language
 */
qx.Proto.addTranslation = function(languageCode, translationMap) {

  if (this._translationCatalog[languageCode])
  {
    for (var key in translationMap) {
      this._translationCatalog[languageCode][key] = translationMap[key];
    }
  }
  else
  {
    this._translationCatalog[languageCode] = translationMap;
  }
};


/**
 * Translate a message
 * @see(qx.lang.String.format)
 * 
 * @param messageId (string) message id (may contain format strings)
 * @param varargs (object) variable number of argumes applied to the format string
 * @return (qx.locale.manager.LocalizedString)
 */
qx.Proto.tr = function(messageId, varargs)
{
  var args = qx.lang.Array.fromArguments(arguments);
  args.splice(0, 1);

  return new qx.locale.manager.LocalizedString(messageId, args);
};


/**
 * Translate a plural message
 * 
 * Depending on the third argument the plursl or the singular form is chosen.
 * 
 * @see(qx.lang.String.format)
 * 
 * @param singularMessageId (string) message id of the singular form (may contain format strings)
 * @param pluralMessageId (string) message id of the plural form (may contain format strings)
 * @param count (integer) if greater than 1 the plural form otherwhise the singular form is returned.
 * @param varargs (object) variable number of argumes applied to the format string
 * @return (qx.locale.manager.LocalizedString)
 */
qx.Proto.trn = function(singularMessageId, pluralMessageId, count, varargs)
{
  var args = qx.lang.Array.fromArguments(arguments);
  args.splice(0, 3);

  if (count > 1)
  {
    return new qx.locale.manager.LocalizedString(pluralMessageId, args);
  }
  else
  {
    return new qx.locale.manager.LocalizedString(singularMessageId, args);
  }
};


/**
 * Translate a message with translation hint
 * 
 * Depending on the third argument the plursl or the singular form is chosen.
 * 
 * @see(qx.lang.String.format)
 *
 * @param hint (string) hint for the translator of the message. Will be included in the .pot file. 
 * @param messageId (string) message id (may contain format strings)
 * @param varargs (object) variable number of argumes applied to the format string
 * @return (qx.locale.manager.LocalizedString)
 */
qx.Proto.trc = function(hint, messageId, varargs)
{
  var args = qx.lang.Array.fromArguments(arguments);
  args.splice(0, 2);

  return new qx.locale.manager.LocalizedString(messageId, args);
}








qx.Proto._defaultLanguage = "C";


/**
 * Translate a message using the current locale and apply format string to the arguments.
 * 
 * @param messageId (string) message id (may contain format strings)
 * @param args (object[]) array of objects, which are inserted into the format string.
 * @param locale (string) optional locale to be used for translation
 * @return (string) translated message. 
 */
qx.Proto.translate = function(messageId, args, locale)
{
  var txt;

  if (locale) {
    var language = this._extractLanguage(locale);
  } else {
    locale = this._locale;
    language = this._language;
  }

  if (!txt && this._translationCatalog[locale]) {
    txt = this._translationCatalog[locale][messageId];
  }

  if (!txt && this._translationCatalog[language]) {
    txt = this._translationCatalog[language][messageId];
  }

  if (!txt && this._translationCatalog[this._defaultLanguage]) {
    txt = this._translationCatalog[this._defaultLanguage][messageId];
  }

  if (!txt) {
    txt = messageId;
  }

  if (args.length > 0) {
    txt = qx.lang.String.format(txt, args)
  }
  return txt;
};


/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

/**
 * Singleton Instance Getter
 */
qx.Class.getInstance = qx.util.Return.returnInstance;