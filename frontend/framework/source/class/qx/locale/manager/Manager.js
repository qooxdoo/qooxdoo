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


qx.Proto._getMajorLanguage = function(locale) {
  var majorLanguage;
  var pos = locale.indexOf("_");
  if (pos == -1) {
    majorLanguage = locale;
  } else {
    majorLanguage = locale.substring(0, pos);
  }
  return majorLanguage;
};


qx.Proto._modifyLocale = function(propValue, propOldValue, propData) {
  this._language = propValue;

  var pos = propValue.indexOf("_");
  this._majorLanguage = this._getMajorLanguage(propValue);
  
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
    var language = locale;
    var majorLanguage = this._getMajorLanguage(locale);
  } else {
    language = this._language;
    majorLanguage = this._majorLanguage;
  }

  if (!txt && this._translationCatalog[language]) {
    txt = this._translationCatalog[language][messageId];
  }

  if (!txt && this._translationCatalog[majorLanguage]) {
    txt = this._translationCatalog[majorLanguage][messageId];
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