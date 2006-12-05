/**
 * Create a new instance of qx.nls.Manager
 */
qx.OO.defineClass("qx.nls.Manager", qx.manager.object.ObjectManager,
function() {
  qx.manager.object.ObjectManager.call(this);
	
	this._translationCatalog = { C: true };
	this.setLocale("C");
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
  var txt = messageId;
  
  if (this._translationCatalog[this._language]) {
    txt = this._translationCatalog[this._language][messageId];
  } else if (this._translationCatalog[this._majorLanguage]) {
    txt = this._translationCatalog[this._majorLanguage][messageId];
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