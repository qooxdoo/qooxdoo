/* ****************************************************************************

   qooxdoo - the new era of web interface development

   Version:
     $Id: QxLocale.js,v 1.1.2.2 2005/11/22 23:50:35 kols Exp $

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#package(core)
#require()

**************************************************************************** */

function QxLocale(vLanguage, vCountry, vVariant) {
  qx.core.Object.call(this);

  if(qx.util.Validation.isValidString(vLanguage)) {
    this.setLanguage(vLanguage);
  };

  if(qx.util.Validation.isValidString(vCountry)) {
    this.setCountry(vCountry);
  };

  if(qx.util.Validation.isValidString(vVariant)) {
    this.setVariant(vVariant);
  };
});


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The language code for this locale, which will either be the empty string or a lowercase ISO 639 code.
*/
QxLocale.addProperty({ name : "language", type : qx.Const.TYPEOF_STRING, defaultValue : "en" });

/*!
  The country/region code for this locale, which will either be the empty string or an uppercase ISO 3166 2-letter code.
*/
QxLocale.addProperty({ name : "country", type : qx.Const.TYPEOF_STRING, defaultValue : "GB" });

/*!
  The variant code for this locale.
*/
QxLocale.addProperty({ name : "variant", type : qx.Const.TYPEOF_STRING, defaultValue : "" });


QxLocale.DEFAULT_LOCALE = new QxLocale("en", "GB", null);

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyLanguage = function(propValue, propOldValue, propData)
{
  this.setCountry(null);
  this.setVariant(null);

  return true;
};

proto._modifyCountry = function(propValue, propOldValue, propData)
{
  if(propValue != propOldValue)
  {
    if(this._checkLanguage(propValue))
    {
      this.setVariant(null);

      return true;
    }
    else
    {
      return false;
    };
  };

  return true;
};

proto._modifyVariant = function(propValue, propOldValue, propData)
{
  if(propValue != propOldValue)
  {
    if(this._checkLanguageCountry(propValue))
    {
      return true;
    }
    else
    {
      return false;
    };
  };

  return true;
};


/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

proto._checkLanguage = function()
{
  return true;
};

proto._checkLanguageCountry = function()
{
  return true;
};

proto.isEqual = function(locale) {
  if(this.getLanguage() == locale.getLanguage() && this.getCountry() == locale.getCountry() && this.getVariatn() == locale.getVariant())
  {
    return true;
  }
  else
  {
    return false;
  };
};

proto.getAvailableLocales = function() {
//  var req = new QxPostRequest( '../locale/locales.xml'); //?param=value
//  req.addEventListener('completed', function(e) {
//    return e.getData();
//  });
//  req.send();
};

// Gets the current value of the default locale.
proto.getDefault = function() {
  return QxLocale.DEFAULT_LOCALE;
};

proto.getDisplayCountry = function(locale) {
//          Returns a name for the locale's country that is appropriate for display to the user.
};

proto.getDisplayLanguage = function(locale) {
//          Returns a name for the locale's language that is appropriate for display to the user.
};

proto.getDisplayName = function(locale) {
//          Returns a name for the locale that is appropriate for display to the user.
};

proto.getDisplayVariant = function(locale) {
//          Returns a name for the locale's variant code that is appropriate for display to the user.
};

proto.getISO3Country = function() {
//          Returns a three-letter abbreviation for this locale's country.
};

proto.getISO3Language = function() {
//          Returns a three-letter abbreviation for this locale's language.
};

proto.getISOCountries = function() {
//          Returns a list of all 2-letter country codes defined in ISO 3166.
};

proto.getISOLanguages = function() {
//          Returns a list of all 2-letter language codes defined in ISO 639.
};

// Sets the default locale.
proto.setDefault = function(locale) {
  if(qx.util.Validation.isValidObject(locale)) {
    QxLocale.DEFAULT_LOCALE = locale;
  };
};

/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  };

  return qx.core.Object.prototype.dispose.call(this);
};
