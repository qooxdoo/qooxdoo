/* ****************************************************************************

   qooxdoo - the new era of web development

   Version:
     $Id: QxLocale.js,v 1.1.2.2 2005/11/22 23:50:35 kols Exp $

   Copyright:
     (C) 2004-2005 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Kent Olsson (kols)
       <kent dot olsson at chello dot se>

**************************************************************************** */

/* ****************************************************************************

#module(core)
#require()

**************************************************************************** */

function QxLocale(vLanguage, vCountry, vVariant) {
  qx.core.Object.call(this);

  if(qx.util.Validation.isValidString(vLanguage)) {
    this.setLanguage(vLanguage);
  }

  if(qx.util.Validation.isValidString(vCountry)) {
    this.setCountry(vCountry);
  }

  if(qx.util.Validation.isValidString(vVariant)) {
    this.setVariant(vVariant);
  }
});


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The language code for this locale, which will either be the empty string or a lowercase ISO 639 code.
*/
qx.OO.addProperty({ name : "language", type : qx.constant.Type.STRING, defaultValue : "en" });

/*!
  The country/region code for this locale, which will either be the empty string or an uppercase ISO 3166 2-letter code.
*/
qx.OO.addProperty({ name : "country", type : qx.constant.Type.STRING, defaultValue : "GB" });

/*!
  The variant code for this locale.
*/
qx.OO.addProperty({ name : "variant", type : qx.constant.Type.STRING, defaultValue : "" });


QxLocale.DEFAULT_LOCALE = new QxLocale("en", "GB", null);

/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyLanguage = function(propValue, propOldValue, propData)
{
  this.setCountry(null);
  this.setVariant(null);

  return true;
}

qx.Proto._modifyCountry = function(propValue, propOldValue, propData)
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
    }
  }

  return true;
}

qx.Proto._modifyVariant = function(propValue, propOldValue, propData)
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
    }
  }

  return true;
}


/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

qx.Proto._checkLanguage = function()
{
  return true;
}

qx.Proto._checkLanguageCountry = function()
{
  return true;
}

qx.Proto.isEqual = function(locale) {
  if(this.getLanguage() == locale.getLanguage() && this.getCountry() == locale.getCountry() && this.getVariatn() == locale.getVariant())
  {
    return true;
  }
  else
  {
    return false;
  }
}

qx.Proto.getAvailableLocales = function() {
//  var req = new QxPostRequest( '../locale/locales.xml'); //?param=value
//  req.addEventListener('completed', function(e) {
//    return e.getData();
//  });
//  req.send();
}

// Gets the current value of the default locale.
qx.Proto.getDefault = function() {
  return QxLocale.DEFAULT_LOCALE;
}

qx.Proto.getDisplayCountry = function(locale) {
//          Returns a name for the locale's country that is appropriate for display to the user.
}

qx.Proto.getDisplayLanguage = function(locale) {
//          Returns a name for the locale's language that is appropriate for display to the user.
}

qx.Proto.getDisplayName = function(locale) {
//          Returns a name for the locale that is appropriate for display to the user.
}

qx.Proto.getDisplayVariant = function(locale) {
//          Returns a name for the locale's variant code that is appropriate for display to the user.
}

qx.Proto.getISO3Country = function() {
//          Returns a three-letter abbreviation for this locale's country.
}

qx.Proto.getISO3Language = function() {
//          Returns a three-letter abbreviation for this locale's language.
}

qx.Proto.getISOCountries = function() {
//          Returns a list of all 2-letter country codes defined in ISO 3166.
}

qx.Proto.getISOLanguages = function() {
//          Returns a list of all 2-letter language codes defined in ISO 639.
}

// Sets the default locale.
qx.Proto.setDefault = function(locale) {
  if(qx.util.Validation.isValidObject(locale)) {
    QxLocale.DEFAULT_LOCALE = locale;
  }
}

/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return true;
  }

  return qx.core.Object.prototype.dispose.call(this);
}
