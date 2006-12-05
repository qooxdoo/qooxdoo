/**
 * Create a new instance of qx.nls.Manager
 */
qx.OO.defineClass("qx.nls.Manager", qx.manager.object.ObjectManager,
function() {
  qx.manager.object.ObjectManager.call(this);
	
	this._translationCatalog = { C: true };
	this.setLocale(qx.sys.Client.getInstance().getLocale() || this._defaultLanguage);
});

qx.OO.addProperty({ name: "locale"})


qx.Proto._modifyLocale = function(propValue, propOldValue, propData) {
  this._language = propValue;
  
  var pos = propValue.indexOf("_");
  if (pos == -1) {
    this._majorLanguage = propValue;
  } else {
    this._majorLanguage = propValue.substring(0, pos);
  }
  
  // this.debug("LANG: " + this._language + " :: " + this._majorLanguage);
  
  return true;
}


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






qx.Proto.tr = function(messageId, varargs) 
{
  var args = qx.lang.Array.fromArguments(arguments);
  args.splice(0, 1);

  return new qx.nls.LocalizedString(messageId, args);
}

qx.Proto.trn = function(singularMessageId, pluralMessageId, count, varargs)
{
  var args = qx.lang.Array.fromArguments(arguments);
  args.splice(0, 3);
    
  if (count > 1)
  {
    return new qx.nls.LocalizedString(pluralMessageId, args); 
  }
  else
  {
    return new qx.nls.LocalizedString(singularMessageId, args);
  }
}

qx.Proto.trc = function(hint, messageId, varargs)
{
  var args = qx.lang.Array.fromArguments(arguments);
  args.splice(0, 2);
  
  return new qx.nls.LocalizedString(messageId, args);
}








qx.Proto._defaultLanguage = "C";

qx.Proto.translate = function(messageId, args) 
{
  var txt;
  
  if (!txt && this._translationCatalog[this._language]) {
    txt = this._translationCatalog[this._language][messageId];
  }  
   
  if (!txt && this._translationCatalog[this._majorLanguage]) {
    txt = this._translationCatalog[this._majorLanguage][messageId];
  }

  if (!txt && this._translationCatalog[this._defaultLanguage]) {
    txt = this._translationCatalog[this._defaultLanguage][messageId];
  }
    
  if (!txt) {
    txt = messageId;
  }

  // perform substitution

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