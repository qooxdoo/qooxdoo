/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

***************************************************************************** */

'use strict';

var compression = require('../../lib/compression.js');

function testFnTiny() {
  return {
    members :
    {
      __nextIndexToStoreTo : 0,
      __isMarkActive: false,
      __maxEntries : null,

      setMaxEntries : function(maxEntries)
      {
        this.__maxEntries = maxEntries;
        this.clear();
      },

      getMaxEntries : function() {
        return this.__maxEntries;
      },

      addEntry : function(entry)
      {
        this.__entries = entry;
      },

      __abc: function(a) {
        return a;
      }
    }
  };
}

function testFnNormal() {
  return {
    extend : Object,

    construct : function(maxEntries)
    {
      this.setMaxEntries(maxEntries || 50);
    },

    members :
    {
      __nextIndexToStoreTo : 0,
      __entriesStored : 0,
      __isMarkActive: false,
      __entriesStoredSinceMark : 0,
      __entries : null,
      __maxEntries : null,

      setMaxEntries : function(maxEntries)
      {
        this.__maxEntries = maxEntries;
        this.clear();
      },

      getMaxEntries : function() {
        return this.__maxEntries;
      },

      addEntry : function(entry)
      {
        this.__entries[this.__nextIndexToStoreTo] = entry;

        this.__nextIndexToStoreTo = this.__addToIndex(this.__nextIndexToStoreTo, 1);

        var max = this.getMaxEntries();
        if (this.__entriesStored < max){
          this.__entriesStored++;
        }

        if (this.__isMarkActive && (this.__entriesStoredSinceMark < max)){
          this.__entriesStoredSinceMark++;
        }
      },

      mark : function(){
        this.__isMarkActive = true;
        this.__entriesStoredSinceMark = 0;
      },

      clearMark : function(){
        this.__isMarkActive = false;
      },

      getAllEntries : function() {
        return this.getEntries(this.getMaxEntries(), false);
      },

      getEntries : function(count, startingFromMark)
      {
        if (count > this.__entriesStored) {
          count = this.__entriesStored;
        }

        if (
          startingFromMark &&
          this.__isMarkActive &&
          (count > this.__entriesStoredSinceMark)
        ) {
          count = this.__entriesStoredSinceMark;
        }

        var result;
        if (count > 0){

          var indexOfYoungestElementInHistory = this.__addToIndex(this.__nextIndexToStoreTo, -1);
          var startIndex = this.__addToIndex(indexOfYoungestElementInHistory, - count + 1);

          if (startIndex <= indexOfYoungestElementInHistory) {
            result = this.__entries.slice(startIndex, indexOfYoungestElementInHistory + 1);
          } else {
            result = this.__entries.slice(startIndex, this.__entriesStored).concat(this.__entries.slice(0, indexOfYoungestElementInHistory + 1));
          }
        } else {
          result = [];
        }

        return result;
      },

      clear : function()
      {
        this.__entries = new Array(this.getMaxEntries());
        this.__entriesStored = 0;
        this.__entriesStoredSinceMark = 0;
        this.__nextIndexToStoreTo = 0;
      },

      __addToIndex : function (idx, addMe){
        var max = this.getMaxEntries();
        var result = (idx + addMe) % max;

        if (result < 0){
          result += max;
        }
        return result;
      }
    }
  };
}

function testDisposeItemProp() {
  qx.Class.define("qx.data.marshal.Json",
  {
    members :
    {
      __cache: {},
      __toClass : function(data, includeBubbleEvents, parentProperty, depth) {
        // break on all primitive json types and qooxdoo objects
        if (
          !qx.lang.Type.isObject(data)
          || !!data.$$isString // check for localized strings
          || data instanceof qx.core.Object
        ) {
          // check for arrays
          if (data instanceof Array || qx.Bootstrap.getClass(data) == "Array") {
            for (var i = 0; i < data.length; i++) {
              this.__toClass(data[i], includeBubbleEvents, parentProperty + "[" + i + "]", depth+1);
            }
          }

          // ignore arrays and primitive types
          return;
        }

        var hash = this.__jsonToHash(data);

        // ignore rules
        if (this.__ignore(hash, parentProperty, depth)) {
          return;
        }

        // check for the possible child classes
        for (var key in data) {
          this.__toClass(data[key], includeBubbleEvents, key, depth+1);
        }

        // class already exists
        if (qx.Class.isDefined("qx.data.model." + hash)) {
          return;
        }

        // class is defined by the delegate
        if (
          this.__delegate
          && this.__delegate.getModelClass
          && this.__delegate.getModelClass(hash, data, parentProperty, depth) != null
        ) {
          return;
        }

        // create the properties map
        var properties = {};
        // include the disposeItem for the dispose process.
        var members = {__disposeItem : this.__disposeItem};
        for (var key in data) {
          // apply the property names mapping
          if (this.__delegate && this.__delegate.getPropertyMapping) {
            key = this.__delegate.getPropertyMapping(key, hash);
          }

          // stip the unwanted characters
          key = key.replace(/-|\.|\s+/g, "");
          // check for valid JavaScript identifier (leading numbers are ok)
          if (qx.core.Environment.get("qx.debug")) {
            this.assertTrue((/^[$0-9A-Za-z_]*$/).test(key),
            "The key '" + key + "' is not a valid JavaScript identifier.");
          }

          properties[key] = {};
          properties[key].nullable = true;
          properties[key].event = "change" + qx.lang.String.firstUp(key);
          // bubble events
          if (includeBubbleEvents) {
            properties[key].apply = "_applyEventPropagation";
          }
          // validation rules
          if (this.__delegate && this.__delegate.getValidationRule) {
            var rule = this.__delegate.getValidationRule(hash, key);
            if (rule) {
              properties[key].validate = "_validate" + key;
              members["_validate" + key] = rule;
            }
          }
        }

        // try to get the superclass, qx.core.Object as default
        if (this.__delegate && this.__delegate.getModelSuperClass) {
          var superClass =
            this.__delegate.getModelSuperClass(hash, parentProperty, depth) || qx.core.Object;
        } else {
          var superClass = qx.core.Object;
        }

        // try to get the mixins
        var mixins = [];
        if (this.__delegate && this.__delegate.getModelMixins) {
          var delegateMixins = this.__delegate.getModelMixins(hash, parentProperty, depth);
          // check if its an array
          if (!qx.lang.Type.isArray(delegateMixins)) {
            if (delegateMixins != null) {
              mixins = [delegateMixins];
            }
          } else {
            mixins = delegateMixins;
          }
        }

        // include the mixin for the event bubbling
        if (includeBubbleEvents) {
          mixins.push(qx.data.marshal.MEventBubbling);
        }

        // create the map for the class
        var newClass = {
          extend : superClass,
          include : mixins,
          properties : properties,
          members : members,
          destruct : this.__disposeProperties
        };

        qx.Class.define("qx.data.model." + hash, newClass);
        this.__disposeItem = "abc";
      },

      __disposeItem : function(item) {
        if (!(item instanceof qx.core.Object)) {
          // ignore all non objects
          return;
        }
        // ignore already disposed items (could happen during shutdown)
        if (item.isDisposed()) {
          return;
        }
        item.dispose();
      }
    }
  });
}

try {
  var compressedCode = compression.compress("my.class.id", testDisposeItemProp.toString(), {privates: true});
  console.log(compressedCode);
} catch (e) {
  console.log(e.message, e.line, e.col, e.pos);
}

