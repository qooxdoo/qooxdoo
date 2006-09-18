/*
#module(core)
#require(qx.type.StringBuilder)
#require(qx.lang.Object)
*/

qx.OO.defineClass("qx.Property",
{

  add : function(vName)
  {
    if (qx.Proto._properties[vName]) {
      this.error("Add property: Property: " + vName + " does already exist!");
    }

    // Erstelle Methoden (auf Prototype-Level)
    this._createMethods(vName);

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Füge neue Hashmap hinzu
    qx.Proto._properties[vName] = {};

    // Merke mir dieses Property als aktuelles (zum Tunen)
    this._current = vName;
  },

  remove : function(vName)
  {
    if (!qx.Proto._properties[vName]) {
      this.error("Remove property: Property: " + vName + " does not exist!");
    }

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Lösche kompletten Eintrag
    delete qx.Proto._properties[vName];

    // Wenn dieses Property aktuell ausgewählt war, müssen wir es zurücksetzen
    if (this._current == vName) {
      this._current = null;
    }
  },

  sel : function(vName)
  {
    if (!qx.Proto._properties[vName]) {
      this.error("Select property: Property: " + vName + " does not exist!");
    }

    this._current = vName;
  },

  // alternativen: setAttribute?
  tune : function(vKey, vValue)
  {
    if (this._current == null) {
      this.error("Tune property: Please select a property first!");
    }

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Wenn das Property von der Superklasse definiert wurde, müssen wir
    // hier auf einer Kopie der HashMap operieren.
    if (qx.Proto._properties[this._current] === qx.Super.prototype._properties[this._current]) {
      qx.Proto._properties[this._current] = qx.lang.Object.copy(qx.Proto._properties[this._current]);
    }

    // Speichere neuen Wert
    qx.Proto._properties[this._current][vKey] = vValue;
  },

  inheritCheck : function()
  {
    if (qx.Proto._properties == qx.Super.prototype._properties) {
      this.inherit();
    }
  },

  inherit : function()
  {
    // Das passiert beim Vererben. Wir kopieren die Liste einfach
    // Kein deep copy. Es werden nur Daten-Objekte kopiert sobald
    // versucht wird ein property anzupassen.
    qx.Proto._properties = qx.lang.Object.copy(qx.Proto._properties);
  },

  validate : function(vMethod, vValue)
  {
    if (vMethod)
    {
      try
      {
        qx.Validation[vMethod](vValue);
      }
      catch(ex)
      {
        this.error("Failed validation process", ex);
        return false;
      }
    }

    return true;
  },

  _createMethods : function(vName)
  {
    var vProto = qx.Proto;
    var vUpName = vName.charAt(0).toUpperCase() + vName.substr(1);

    qx.Proto["set" + vUpName] = function() { return qx.Property._generalSetter(this, vProto, vName, vUpName, arguments); };
    qx.Proto["get" + vUpName] = function() { return qx.Property._generalGetter(this, vProto, vName, vUpName, arguments); };
    qx.Proto["reset" + vUpName] = function() { return qx.Property._generalResetter(this, vProto, vName, vUpName, arguments); };
  },

  _generalSetter : function(vObject, vProto, vName, vUpName, vArgs)
  {
    alert("Creating setter for " + vProto + "/" + vName);

    // Create new setter
    vProto["set" + vUpName] = qx.Property._createOptimizedSetter(vProto, vName, vUpName);

    // Execute new setter
    return vProto["set" + vUpName].apply(vObject, vArgs);
  },

  _generalGetter : function(vProto, vName, vArgs)
  {
    alert("Creating getter for " + vProto + "/" + vName);

  },

  _generalResetter : function(vProto, vName, vArgs)
  {
    alert("Creating resetter for " + vProto + "/" + vName);

  },





  _createOptimizedSetter : function(vProto, vName, vUpName)
  {
    var vConf = vProto._properties[vName];
    var vCode = new qx.type.StringBuilder;

    vCode.add("this.debug('Property: " + vName + ": ' + vNew);");
    vCode.add("var vOld = this._properties." + vName + ";");

    if (vConf.validation != undefined)
    {
      vCode.add("try{");

      if (qx.Validation[vConf.validation])
      {
        vCode.add("if(!qx.Validation." + vConf.validation + "(vNew)){");
        vCode.add("this.error('Invalid value for property " + vName + ": ' + vNew);");
        vCode.add("};");
      }
      else
      {
        this.error("Could not add validation to property " + vName + ". Invalid method.");
      }

      vCode.add("}catch(ex){");
      vCode.add("this.error('Invalid value: ' + vNew, ex);");
      vCode.add("};");
    }

    vCode.add("this._properties." + vName + " = vNew;");

    if (vConf.fire !== false)
    {
      vCode.add("this.createDispatchDataEvent('change" + vUpName + "');");
    }

    alert("Code:\n\n" + vCode);

    return new Function("vNew", vCode.toString());
  }





});
