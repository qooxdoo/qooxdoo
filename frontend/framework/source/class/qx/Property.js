/*
#module(core)
#require(qx.type.StringBuilder)
#require(qx.lang.Object)
*/

qx.OO.defineClass("qx.Property",
{

  add : function(vName)
  {
    if (qx.Proto._newproperties[vName]) {
      this.error("Add property: Property: " + vName + " does already exist!");
    }

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Füge neue Hashmap hinzu
    qx.Proto._newproperties[vName] = {};

    // Lokale Properties ergaenzen
    if (qx.Class._localProperties == undefined) {
      qx.Class._localProperties = [];
    }
    qx.Class._localProperties.push(vName);

    // Merke mir dieses Property als aktuelles (zum Tunen)
    this._current = vName;
  },

  remove : function(vName)
  {
    if (!qx.Proto._newproperties[vName]) {
      this.error("Remove property: Property: " + vName + " does not exist!");
    }

    // Vererbe property registry von der Superklasse
    this.inheritCheck();

    // Lösche kompletten Eintrag
    delete qx.Proto._newproperties[vName];

    // Wenn dieses Property aktuell ausgewählt war, müssen wir es zurücksetzen
    if (this._current == vName) {
      this._current = null;
    }
  },

  sel : function(vName)
  {
    if (!qx.Proto._newproperties[vName]) {
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
    if (qx.Proto._newproperties[this._current] === qx.Super.prototype._newproperties[this._current])
    {
      // Ganzen Property-Eintrag kopieren (damit dieser dann modifiziert werden kann ohne den Parent zu aendern)
      qx.Proto._newproperties[this._current] = qx.lang.Object.copy(qx.Proto._newproperties[this._current]);

      // Als lokales Property merken
      if (qx.Class._localProperties == undefined) {
        qx.Class._localProperties = [];
      }
      qx.Class._localProperties.push(this._current);
    }

    // Speichere neuen Wert
    qx.Proto._newproperties[this._current][vKey] = vValue;


  },

  inheritCheck : function()
  {
    if (qx.Proto._newproperties == qx.Super.prototype._newproperties) {
      this.inherit();
    }
  },

  inherit : function()
  {
    // Das passiert beim Vererben. Wir kopieren die Liste einfach
    // Kein deep copy. Es werden nur Daten-Objekte kopiert sobald
    // versucht wird ein property anzupassen.
    qx.Proto._newproperties = qx.lang.Object.copy(qx.Proto._newproperties);
  },

  createMethods : function(vName, vProto)
  {
    var vEntry = vProto._newproperties[vName];
    var vUpName = vName.charAt(0).toUpperCase() + vName.substr(1);

    vEntry._setter = vProto["set" + vUpName] = function() {
      return qx.Property._generalSetter(this, vProto, vName, vUpName, arguments);
    };

    vEntry._getter = vProto["get" + vUpName] = function() {
      return qx.Property._generalGetter(this, vProto, vName, vUpName, arguments);
    };

    vEntry._resetter = vProto["reset" + vUpName] = function() {
      return qx.Property._generalResetter(this, vProto, vName, vUpName, arguments);
    };
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

  _generalSetter : function(vObject, vProto, vName, vUpName, vArgs)
  {
    vProto.debug("Creating setter for " + vProto + "/" + vName);

    // Create new setter
    vProto["set" + vUpName] = qx.Property._createOptimizedSetter(vProto, vName, vUpName);

    // Overwrite the setter which is used internally
    vProto._newproperties[vName]._setter = vProto["set" + vUpName];

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
    var vConf = vProto._newproperties[vName];
    var vCode = new qx.type.StringBuilder;

    // vCode.add("this.debug('Property: " + vName + ": ' + vNew);");
    vCode.add("var vOld = this._newproperties." + vName + ";");

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

    vCode.add("this._newvalues." + vName + " = vNew;");

    if (vConf.fire !== false)
    {
      vCode.add("this.createDispatchDataEvent('change" + vUpName + "');");
    }

    // alert("Code:\n\n" + vCode);

    return new Function("vNew", vCode.toString());
  }





});
