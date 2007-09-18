/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Stefan Kloiber (skloiber)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * Creates the API index.
 */
qx.Class.define("apiviewer.ui.CreateIndex",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.apiindex = {};
    this.apiindex["__types__"] = [];
    this.apiindex["__fullNames__"] = [];
    this.apiindex["__index__"] = {};
    this._createIndex();
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    _createIndex : function()
    {
        var _a = apiviewer.dao.Class._class_registry;
        var index = this.apiindex["__index__"];
        var types = this.apiindex["__types__"];
        var fullNames = this.apiindex["__fullNames__"];

        for (var key in _a)
        {
          var fullname = key;
          index[fullname] = [];

          //Packages and Classes
          if (_a[key].getNodeType() == "package") {
            index[fullname].push( { type:_a[key].getNodeType(), fullName:fullname } );
          }
          else if (_a[key].getNodeType() == "class") {
            index[fullname].push( { type:_a[key].get("type"), fullName:fullname } );
          }

        }

/*
        // sort packages and classes
        var newapiindex = {};
        var sortedkeys = qx.lang.Object.getKeys(index).sort();

        for (var i=0, l=sortedkeys.length; i<l; i++)
        {
          newapiindex[sortedkeys[i]] = index[sortedkeys[i]];
        }
        index = newapiindex;
*/



        var subindex = {};
        var _loader = qx.core.Init.getInstance().getApplication().controller._classLoader;
        for (var key in _a)
        {

          if (_a[key].getNodeType) {
            var keyNodeType = _a[key].getNodeType();
            if (keyNodeType != "package") {
              _loader.load(key, false);
            }
          }

          //methods public
          if (_a[key].getMembers) {
            for (var elem in _a[key].getMembers()) {
              var subkey = "#" + _a[key].getMembers()[elem].getName();
              if (!subindex[subkey]) {
                subindex[subkey] = [];
              }
              subindex[subkey].push( { type : _a[key].getMembers()[elem].getNodeType() + this._getModifier(_a[key].getMembers()[elem]), fullName : key } );
            }
          }
          //methods static
          if (_a[key].getStatics) {
            for (var elem in _a[key].getStatics()) {
              var subkey = "#" + _a[key].getStatics()[elem].getName();
              if (!subindex[subkey]) {
                subindex[subkey] = [];
              }
              subindex[subkey].push( { type : _a[key].getStatics()[elem].getNodeType() + this._getModifier(_a[key].getStatics()[elem]), fullName : key } );
            }
          }
          //properties
          if (_a[key].getProperties) {
            for (var elem in _a[key].getProperties()) {
              var subkey = "#" + _a[key].getProperties()[elem].getName();
              if (!subindex[subkey]) {
                subindex[subkey] = [];
              }
              subindex[subkey].push( { type : _a[key].getProperties()[elem].getNodeType() + this._getModifier(_a[key].getProperties()[elem]), fullName : key } );
            }
          }
          //events
          if (_a[key].getEvents) {
            for (var elem in _a[key].getEvents()) {
              var subkey = "#" + _a[key].getEvents()[elem].getName();
              if (!subindex[subkey]) {
                subindex[subkey] = [];
              }
              subindex[subkey].push( { type : _a[key].getEvents()[elem].getNodeType(), fullName : key } );
            }
          }
        }



        //merge apiindex and subindex
        for (var key in subindex) {
          if (index[key]) {
            for (var i=0; i<subindex[key].length; i++) {
              index[key].push(subindex[key][i]);
            }
          } else {
            index[key] = subindex[key];
          }
        }


        //shorten index by references
        //walk through the whole index
        for (var ikey in index) {
          //console.log(ikey);
            //walk through the key content array
            for (var i=0; i<index[ikey].length; i++)
            {
              //types
              var keytype = 0;
              var lj = types.length;
              if (lj>0)
              {
                // check if type is already listed
                for (var j=0; j<lj; j++)
                {
                  if (types[j] == index[ikey][i].type) {
                    keytype = j;
                    break;
                  }
                  else if (j == lj-1) {
                    types[lj] = index[ikey][i].type;
                    keytype = lj;
                  }
                }
              }
              else {
                types[lj] = index[ikey][i].type;
                keytype = lj;
              }
    
              //fullNames
              var keyfn = 0;
              var lk = fullNames.length;
              if (lk>0)
              {
                // check if fullname is already listed
                for (var k=0; k<lk; k++)
                {
                  if (fullNames[k] == index[ikey][i].fullName) {
                    keyfn = k;
                    break;
                  }
                  else if (k == lk-1) {
                    fullNames[lk] = index[ikey][i].fullName;
                    keyfn = lk;
                  }
                }
              }
              else {
                fullNames[lk] = index[ikey][i].fullName;
                keyfn = lk;
              }
    
              //replace texts and set references
              index[ikey][i] = [keytype, keyfn];
    
            }
        }


        //Output the index to a textarea
        this._setOutput();

    },


    _getModifier : function(elem)
    {
      var appendix = "";
      if (elem.isPrivate() || elem.isInternal()) {
        appendix = "_priv";
      } else if (elem.isProtected()) {
        appendix = "_prot";
      } else if (elem.isPublic()) {
        appendix = "_pub";
      }
      return appendix;
    },


    _setOutput : function()
    {
      var area = new qx.ui.form.TextArea(qx.io.Json.stringify( this.apiindex, false ));
      area.set({
        width     : "100%",
        height    : "100%"
      });
      //this.add(area);
      var content = apiviewer.MWidgetRegistry.getWidgetById("content");
      content.add(area);
    }


  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("apiindex");
  }
});