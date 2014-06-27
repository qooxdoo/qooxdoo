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

console.log(compression.compress("my.class.id", testFnNormal.toString(), {privates: true}));
