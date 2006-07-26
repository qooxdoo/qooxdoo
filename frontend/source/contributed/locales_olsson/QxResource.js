/* ****************************************************************************

   qooxdoo - the new era of web development

   Version:
     $Id: QxResource.js,v 1.1.2.2 2005/11/22 23:50:35 kols Exp $

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

function QxResource(vResource, vLocale) {
  qx.core.Object.call(this);

  if(qx.util.Validation.isValidString(vResource)) {
    this.setResource(vResource);
  }

  if(qx.util.Validation.isValidObject(vLocale)) {
    this.setLocale(vLocale);
  }

  this.loadResource(vResource, vLocale);
});


/*
------------------------------------------------------------------------------------
  PROPERTIES
------------------------------------------------------------------------------------
*/

/*!
  The ressource file with language text.
*/
qx.OO.addProperty({ name : "resource", type : qx.constant.Type.STRING });

/*!
  The locale if not use the defined application or system locale.
*/
qx.OO.addProperty({ name : "locale", type : qx.constant.Type.OBJECT });


/*
------------------------------------------------------------------------------------
  MODIFIERS
------------------------------------------------------------------------------------
*/

qx.Proto._modifyResource = function(propValue, propOldValue, propData)
{
  if(propOldValue)
  {
    if (this._request)
    {
      this._request.dispose();
      this._request = null;
    }
  }

  if(propValue)
  {
    this.loadResource(propValue);
  }

  return true;
}

qx.Proto._modifyLocale = function(propValue, propOldValue, propData)
{
  if(propOldValue)
  {
    propOldValue.dispose();
    propOldValue = null;

    if (this._request)
    {
      this._request.dispose();
      this._request = null;
    }
  }

  if(propValue)
  {
    this.loadResource(this.getResource(), propValue);
  }

  return true;
}

/*
------------------------------------------------------------------------------------
  UTILITIES
------------------------------------------------------------------------------------
*/

qx.Proto.loadResource = function(vResource, vLocale)
{
  if(!vResource)
  {
    vResource = this.getResource();
  }

  if(!vLocale)
  {
    if(this.getLocale())
    {
      vLocale = this.getLocale();
    }
    else
    {
      vLocale = QxLocaleManager.getCurrentLocale();
    }
  }

  if(vLocale.getLanguage())
  {
    vResource += "_" + vLocale.getLanguage();
  }

  if(vLocale.getCountry())
  {
    vResource += "_" + vLocale.getCountry();
  }

  if(vLocale.getVariant())
  {
    vResource +=  "_" + vLocale.getCountry();
  }

  vResource += ".js";

  var self = this;

  var req = this._request = new QxGetRequest(vResource);
  req.setAsynchronous(false);
  req.setMimeType("text/json");
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  req.addEventListener("sending", function(e) {
//    qx.dev.Debug.setValue("Sending");
  });
  req.addEventListener("receiving", function(e) {
//    qx.dev.Debug.setValue("Receiving");
  });
  req.addEventListener("completed", function(e)
  {
//    qx.dev.Debug.setValue("Failed");
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Type"));
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Length"));
//    qx.dev.Debug.setValue(e.getData().getStatusCode().toString());
     self._content = e.getData().getContent();
  });
  req.addEventListener("failed", function(e)
  {
//    qx.dev.Debug.setValue("Failed");
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Type"));
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Length"));
//    qx.dev.Debug.setValue(e.getData().getStatusCode().toString());
//    qx.dev.Debug.setValue(e.getData().getContent());
  });
  req.addEventListener("timeout", function(e)
  {
//    qx.dev.Debug.setValue("Timeout");
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Type"));
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Length"));
//    qx.dev.Debug.setValue(e.getData().getStatusCode().toString());
//    qx.dev.Debug.setValue(e.getData().getContent());
  });
  req.addEventListener("aborted", function(e)
  {
//    qx.dev.Debug.setValue("Aborted");
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Type"));
//    qx.dev.Debug.setValue(e.getData().getResponseHeader("Content-Length"));
//    qx.dev.Debug.setValue(e.getData().getStatusCode().toString());
//    qx.dev.Debug.setValue(e.getData().getContent());
  });

  req.send();
}

qx.Proto.getKey = function(value)
{
  for(i=0; i < this._content.length; i++)
  {
    if(this._content[i].value = value)
    {
      return this._content[i].key;
    }
  }
}

qx.Proto.getValue = function(key)
{
  return this._content[key];
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

  if (this._request)
  {
    this._request.dispose();
    this._request = null;
  }

  delete this._content;

  return qx.core.Object.prototype.dispose.call(this);
}
