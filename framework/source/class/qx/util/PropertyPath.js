/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com)

************************************************************************ */

/**
 * A helper class for accessing properties by paths
 */
qx.Class.define("qx.util.PropertyPath", {
  extend: qx.core.Object,
  
  statics: {
    /**
     * Returns information for the property referenced by path; path can contain
     * dotted-notation to decend into the object's properties.
     * 
     * @param obj {qx.core.Object} Object to access
     * @param path {String} the path to use 
     * @returns {Map} A map, containing: 
     * original: the obj passed to this function 
     * object: the object that contains the property 
     * propName: the name of the property 
     * propDef: the definition of the property
     * get: getMethod 
     * set: setMethod
     */
    getPropertyInfo : function(obj, path) {
      var get = function(obj, index) {
        if (qx.Class.isSubClassOf(obj.constructor, qx.data.Array))
          return obj.getItem(index);
        return obj[index];
      };
      var set = function(obj, index, value) {
        if (qx.Class.isSubClassOf(obj.constructor, qx.data.Array))
          obj.setItem(index, value);
        else
          obj[index] = value;
      };

      if (obj === null)
        return null;
      var result = {
        original : obj
      };
      var segs = path.split('.');
      for ( var i = 0; i < segs.length - 1; i++) {
        var seg = segs[i];
        var index = -1;
        var pos = seg.indexOf('[');
        if (pos > 0) {
          index = seg.substring(pos + 1, seg.length - 1);
          seg = seg.substring(0, pos);
        }
        var upname = qx.lang.String.firstUp(seg);
        obj = obj["get" + upname]();
        if (obj === null)
          return null;
        if (index > -1) {
          obj = get(obj, index);
          if (obj === null)
            return null;
        }
      }
      result.object = obj;
      result.propName = segs[segs.length - 1];
      result.propDef = qx.Class.getPropertyDefinition(obj.constructor, result.propName);

      var seg = segs[i];
      var pos = seg.indexOf('[');
      if (pos > 0) {
        index = seg.substring(pos + 1, seg.length - 1);
        seg = seg.substring(0, pos);
        var upname = qx.lang.String.firstUp(seg);
        result.get = function() {
          return obj = get(obj["get" + upname].call(obj), index);
        };
        result.set = function(value) {
          set(obj["get" + upname].call(obj), index, value);
        };
      } else {
        var upname = qx.lang.String.firstUp(seg);
        if (typeof obj["get" + upname] == "function")
          result.get = qx.lang.Function.bind(obj["get" + upname], obj);
        else if (typeof obj["is" + upname])
          result.get = qx.lang.Function.bind(obj["is" + upname], obj);
        else
          throw new Error("Cannot find a getter for " + upname);
        if (typeof obj["set" + upname] == "function")
          result.set = qx.lang.Function.bind(obj["set" + upname], obj);
      }
      return result;
    },

    /**
     * Inverse of setValue, although does no conversion etc
     * 
     * @param model {qx.core.Object} object to manipulate
     * @param propName {String} path to access
     * @returns {?}
     */
    getValue : function(model, propName) {
      if (!propName)
        return model;
      var len = propName.length;
      if (len > 1 && propName.charAt(0) == '\'' && propName.charAt(len - 1) == '\'')
        return propName.substring(1, len - 1);

      var propInfo = this.getPropertyInfo(model, propName);
      if (propInfo === null)
        return null;
      return propInfo.get();
    },

    /**
     * Sets the property named propName on the object model to value. Returns
     * true if the value was changed
     * 
     * @param model {qx.core.Object} object to manipulate
     * @param propName {String} path to access
     * @param value {?} value to set
     * @returns {Boolean} true if property was changed
     */
    setValue : function(model, propName, value, options) {
      var len = propName.length;
      if (len > 1 && propName.charAt(0) == '\'' && propName.charAt(len - 1) == '\'')
        return;

      var propInfo = this.getPropertyInfo(model, propName);
      if (!propInfo)
        return;
      value = this.convertForModel(propInfo, value, options);
      propInfo.set(value);
      return true;
    },
    
    /**
     * Converts the value into a form suitable to applying to the object
     * property specified in propInfo
     * 
     * @param propInfo {Object} as returned from getPropertyInfo 
     * @param value {?} value to convert
     * @returns {?}
     */
    convertForModel : function(propInfo, value, options) {
      var propDef = propInfo.propDef;
      if (propDef && propDef.check) {
        if (typeof value == "String") {
          if (propDef.check == "Integer" || propDef.check == "PositiveInteger") {
            value = parseInt(value);
            if (isNaN(value))
              value = 0;

          } else if (propDef.check == "Number" || propDef.check == "PositiveNumber") {
            value = parseFloat(value);
            if (isNaN(value))
              value = 0;

          } else if (propDef.check == "Date") {
            var df = null;
            if (options && options.dateFormat)
              df = options.dateFormat;
            else if (qx.Class.isSubClassOf(propInfo.object.constructor, qx.ui.form.IDateForm))
              df = propInfo.object.getDateFormat();
            if (!df)
              df = qx.util.format.DateFormat.getDateInstance();
            value = df.parse(value);
          }
        }
      }
      return value;
    }
  }
});
