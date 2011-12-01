/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("inspector.console.DomView",
{
  extend : qx.ui.core.Widget,

  statics :
  {
    /**
     * The default search term used in the search field.
     */
    SEARCH_TERM: "Search..."
  },

  construct : function(console)
  {
    this.base(arguments);

    // store the reference to the window
    this._console = console;
    this._filter = "";

    // set the layout
    this._setLayout(new qx.ui.layout.VBox());

    // initialize the HTML embed
    this._htmlEmbed = new qx.ui.embed.Html(
      "<div class='ins_dom_no_prop'>No object selected.</div>"
    );
    this._htmlEmbed.setOverflowY("scroll");
    this._add(this._htmlEmbed, {flex: 1});

    // wait until the dom element is created
    this.addListenerOnce("appear", function() {
      // set the id for the dom element
      this._htmlEmbed.getContentElement().getDomElement().id = "qx_srcview";
    }, this);

    // create the array used to store the navigation path
    this._breadCrumb = [];
  },

  members :
  {

    clear: function() {
      this._htmlEmbed.setHtml("<div class='ins_dom_no_prop'>No object selected.</div>");
    },


    /**
     * TODOC
     *
     * @lint ignoreDeprecated(eval)
     * @param object {}
     * @param name {}
     */
    setObject: function(object, name) {
      this._iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      // empty the breadcrumbs
      this._breadCrumb = [];
      // split the name into pieces separated by a dot
      var elements = name.split(".");

      // go threw all pieces except the last one
      for (var i = 0; i < elements.length - 1; i++) {
        // create an empty string which holds the objects reference at the end
        var objectReference = "";
        // go threw all further elements of the split
        for (var j = 0; j <= i; j++) {
          // add the elements to the objects reference
          objectReference += elements[j];
          // if it is not the last round
          if (j != i) {
            // add a dot between the elements
            objectReference += ".";
          }
        }
        // create a reference out of the reference string
        var breadCrumbObject = eval(objectReference);
        // add the object and the name to the breadcrumbs
        this._breadCrumb[i] = {object: breadCrumbObject, name: elements[i]};
      }
      // get the last name of the given elements
      name = elements[elements.length - 1];
      // set the object to display in the dom view
      this._htmlEmbed.setHtml(this._getHtmlToObject(object, i, name));
    },



    /**
     * TODOC
     *
     * @lint ignoreDeprecated(alert)
     *
     * @param index {}
     * @param key {}
     */
    setObjectByIndex: function(index, key) {
      // reset the filter
      this._filter = "";
      try {
          // if a key is given (selection of a object as a value)
          if (key) {
              // select the given value object
              var newQxObject = this._breadCrumb[index].object[key];

              // check if the new Object is already in the history of the selected objects
              for (var i = 0; i < this._breadCrumb.length; i++) {
                // if it is in the history
                if (this._breadCrumb[i].object == newQxObject) {
                  // set the index to the history element
                  this._htmlEmbed.setHtml(this._getHtmlToObject(newQxObject, i, key));
                  // scroll to the top of the view
                  this._htmlEmbed.getContentElement().scrollToY(0);
                  // stop further processing
                  return;
                }
              }

              // set the new object with a higher index
              this._htmlEmbed.setHtml(this._getHtmlToObject(newQxObject, (index) + 1, key));
              // scroll to the top of the view
              this._htmlEmbed.getContentElement().scrollToY(0);

          // if only a index is given (selection via the back button)
          } else {
              // select the stored object in the array
              var newQxObject = this._breadCrumb[index].object;
              // select the stored name
              var newName = this._breadCrumb[index].name;
              // show the selected array with the current index
              this._htmlEmbed.setHtml(this._getHtmlToObject(newQxObject, index, newName));
              // scroll to the top of the view
              this._htmlEmbed.getContentElement().scrollToY(0);
              // delete the old elements of the breadcrumb
               this._breadCrumb.splice(index + 1, this._breadCrumb.length - index + 1);
          }
      } catch (e) {
          alert("Can not select this Object: " + e);
      }
    },



    filter: function(filter) {
      // save the current filter string
      this._filter = filter;
      // if there is a object shown
      if (this._breadCrumb.length > 0) {
        // get the current objects data
        var index = this._breadCrumb.length - 1;
        var object = this._breadCrumb[index].object;
        var name = this._breadCrumb[index].name;
        // make a new html by using the filter
        this._htmlEmbed.setHtml(this._getHtmlToObject(object, index, name));
      }
    },



    getFilter: function() {
      // if there is no filter set
      if (this._filter == "") {
        // return the default search string
        return inspector.console.DomView.SEARCH_TERM;
      } else {
        // otherwise, return the filter string
        return this._filter;
      }
    },



    getCurrentSelectedClassname: function() {
      // if a object is selected
      if (this._breadCrumb.length > 0) {
        // get the object shown in the dom view
        var object = this._breadCrumb[this._breadCrumb.length - 1].object;

        // if the object has a classname attribute
        if (object.classname != undefined) {
          // it is a class, interface, mixin or theme
          if (qx.Class.isDefined(object.classname) ||
              qx.Interface.isDefined(object.classname) ||
              qx.Mixin.isDefined(object.classname) ||
              qx.Theme.isDefined(object.classname)) {
            // return that classname
            return object.classname;
          }
        }
      }
      return null;
    },



    _getHtmlToObject: function(o, index, name) {
      // create an empty string
      var returnString = new qx.util.StringBuilder();
      // set a default name if none is set
      if (name == undefined) {
        var name = "Object";
      }

      // save the object in the path array
      this._breadCrumb[index] = {object: o, name: name};
      // add the breadcrums to the output
      returnString.add(this._getReturnPath(index));

      // flag used to signal if properties were print out
      var nothingToShow = true;

      // get the sorted and filtered properties
      var sortedValues = this._sortAndFilterProperties(o);
      // start the table which holds all attributes
      returnString.add("<table class='ins_dom_table'>");
      // go threw all properties of the object
      for (var i = 0; i < sortedValues.length; i++) {
        // mark that there has been a property printed out
        nothingToShow = false;
        // start the return divs
        returnString.add("");

        // if the key is a number
        if (!isNaN(sortedValues[i].key)) {
          // set the style for key as numbers
          var keyStyle = "ins_dom_key_number";
        } else {
          // set the style for string keys
          var keyStyle = "ins_dom_key";
        }

        // IE fix
        try {
          sortedValues[i].value instanceof this._iFrameWindow.Object
        }catch(ex) {
          var imageURI = qx.util.ResourceManager.getInstance().toUri("inspector/images/spacer.gif");
          returnString.add("<tr><td class='" + keyStyle + "'><img class='ins_dom_front_image' src='" +
                          imageURI +
                          "'>" + this._console.escapeHtml(sortedValues[i].key) + "</td>");
          returnString.add("<td><span class='ins_dom_null'>" + sortedValues[i].value + "</span></td></tr>");
          continue;
        }

        // if it is not an object
        if (!(sortedValues[i].value instanceof this._iFrameWindow.Object) &&
            sortedValues[i].value != this._iFrameWindow.window &&
            sortedValues[i].value != this._iFrameWindow.document) {
          var imageURI = qx.util.ResourceManager.getInstance().toUri("inspector/images/spacer.gif");
          returnString.add("<tr><td class='" + keyStyle + "'><img class='ins_dom_front_image' src='" +
                          imageURI +
                          "'>" + this._console.escapeHtml(sortedValues[i].key) + "</td>");

          // if the value is null
          if (sortedValues[i].value == null) {
              returnString.add("<td><span class='ins_dom_null'>" + sortedValues[i].value + "</span></td></tr>");
          } else if (typeof sortedValues[i].value == "string"){
              returnString.add("<td class='ins_dom_string'>&quot;" + this._console.escapeHtml(sortedValues[i].value) + "&quot;</td></tr>");
          } else {
              returnString.add("<td class='ins_dom_basic'>"  + sortedValues[i].value + "</td></tr>");
          }

        // if it is an object
        } else {
          // check if it is a function
          if (sortedValues[i].value instanceof this._iFrameWindow.Function) {
            // get the code of the function via the toString function
            var code = sortedValues[i].value.toString();
            // if the code contains the string "[native code]"
            if (code.search(/native code/) != -1) {
              // ignore the function and go to the next
              continue;
            }
          }

          var postString = null;
          if (postString == null) {
            postString = new qx.util.StringBuilder();
          } else {
            postString.clear();
          }

          // if it is not the selected object (self reference)
          if (sortedValues[i].value != o) {
            // print out the objects key incl. the link to select it
            var imageURI = qx.util.ResourceManager.getInstance().toUri("inspector/images/open.png");
            postString.add("<tr><td class='" + keyStyle + "'><a onclick='" +
                            "qx.core.Init.getApplication().inspectObjectByDomSelecet(" + index + ", \"" + sortedValues[i].key + "\")" +
                            "'><img class='ins_dom_front_image' src='" +
                            imageURI +
                            "'>" + this._console.escapeHtml(sortedValues[i].key) + "</a></td>");
          }

          // if the object holds a reference to itself
          if (sortedValues[i].value == o) {
            // print out the objects key without the link to select it
            var imageURI = qx.util.ResourceManager.getInstance().toUri("inspector/images/spacer.gif");
            returnString.add("<tr><td class='ins_dom_key'><img class='ins_dom_front_image' src='" +
                            imageURI +
                            "'>" + sortedValues[i].key + "</td>");
            // print out a message for a self index
            returnString.add("<td class='ins_dom_self_ref'>self reference</td></tr>");

          // if it is a function
          } else if (sortedValues[i].value instanceof this._iFrameWindow.Function) {

            returnString.add(postString.get());
            // if it is a qooxdoo class
            if (sortedValues[i].value.toString().substr(0, 7) == "[Class ") {
              // print out the objects value as a object
              returnString.add("<td class='ins_dom_object'>" + this._getObject(sortedValues[i].value, index, sortedValues[i].key) + "</td></tr>");
            } else {
              // print out the objects value as a function
              returnString.add("<td class='ins_dom_func_object'>" + this._getObject(sortedValues[i].value, index, sortedValues[i].key) + "</td></tr>");
            }
          } else {
            try {
              // print out the objects value
              var stringValue = this._getObject(sortedValues[i].value, index, sortedValues[i].key);
              returnString.add(postString.get());
              returnString.add("<td class='ins_dom_object'>" + stringValue + "</td></tr>");
            } catch (ex) {
              var imageURI = qx.util.ResourceManager.getInstance().toUri("inspector/images/spacer.gif");
              returnString.add("<tr><td class='ins_dom_key'><img class='ins_dom_front_image' src='" +
                            imageURI +
                            "'>" + sortedValues[i].key + "</td>");
              returnString.add("<td class='ins_dom_string'>&quot;Error occurs by reading value!&quot;</td></tr>");
            }
          }
        }
      }
      // end the table
      returnString.add("</table>");

      // if there is no property
      if (nothingToShow) {
          returnString.add("<div class='ins_dom_no_prop'>There are no properties to show for this object.</div>");
      }

      // print out the code, if it is a function
      returnString.add(this._getFunctionCode(o));
      return returnString.get();
    },



    _getFunctionCode: function(o) {
      // if the current object is a function
      if (o instanceof this._iFrameWindow.Function && !o.hasOwnProperty("toString")) {
        // get the code of the function as a string
        var functionCode = o.toString();
        // let qooxdoo highlight the javascript code
        functionCode = "<pre>" + qx.dev.Tokenizer.javaScriptToHtml(functionCode) + "</pre>";
        // return the function code
        return "<div class='ins_dom_func'>" + functionCode + "</div>";
      } else {
        return "";
      }
    },



    /**
     * TODOC
     *
     * @lint ignoreDeprecated(alert)
     * @param o {}
     * @return {}
     */
    _sortAndFilterProperties: function(o) {
      // if a filter is given
      if (this._filter != "") {
        // try to create a filter regexp
        try {
          // create the needed regexp object
          var regExp = new RegExp(this._filter);
        } catch (e) {
          // if that doesnt work, tell the user why
          alert("Unable to filter: " + e);
        }
      }
      // create a temp array for the sorted and filtered values
      var sortedValues = [];
      // write the objects values to the new array
      for (var key in o) {
        try
        {
          // if a filter is given
          if (regExp != null) {
            // test if the key matches the filter
            if (regExp.test(key)) {
              // add the key value pair to the sorted set
              sortedValues.push({key: key, value: o[key]});
            }
          } else {
            // add all key value pairs to the sorted set
            sortedValues.push({key: key, value: o[key]});
          }
        } catch (ex) {
          sortedValues.push({key: key, value: "Error occurs by reading value!"});
        }
      }

      // sort the array
      sortedValues.sort(function(a, b) {
        // both parameters a no numbers
        if( isNaN(a.key) || isNaN(b.key) ) {
          return ((a.key < b.key) ? -1 : ((a.key > b.key) ? 1 : 0));
        } else {
          return a.key - b.key;
        }
      });
      return sortedValues;
    },



    _getReturnPath: function(index) {
      // print the path to go back
      var returnString = new qx.util.StringBuilder();
      returnString.add("<div class='ins_dom_return_path_main'>");

      // go threw the existing path
      for (var i = 0; i <= index; i++) {
        // if it is the current item
          if (i == index) {
            returnString.add(" &raquo; <span class='ins_dom_return_path_selected'>");
        } else {
              // print out every item of the path
            returnString.add(" &raquo; <span class='ins_dom_return_path_link' onclick='" +
                            "qx.core.Init.getApplication().inspectObjectByDomSelecet(" + i + ")'>");
        }

        // print out the name
        returnString.add(this._breadCrumb[i].name);

        returnString.add("</span>");
      }
      // end the leading div
      returnString.add("</div>");

      return returnString.get();
    },


    _getObject: function(object, index, key) {
      var returnString = new qx.util.StringBuilder();
      returnString.add("<a onclick='" +
                         "qx.core.Init.getApplication().inspectObjectByDomSelecet(" + index + ", \"" + key + "\")" +
                       "'>");

      // if it is a function
      if (object instanceof this._iFrameWindow.Function) {
        // if the toString contains a )
        if (object.toString().indexOf(")") != -1 ) {
          // take the first characters to the )
          returnString.add(object.toString().substring(0, object.toString().indexOf(")") + 1));
        } else {
          // take the whole toString
          returnString.add(object.toString());
        }

      // if it is an array
      } else if (object instanceof this._iFrameWindow.Array) {
        returnString.add("[ ");
        // print out the first elements if existent
        for (var j = 0; j < 2 && j < object.length; j++) {
          // if the element is a function
          if (object[j] instanceof this._iFrameWindow.Function) {
            // print out that it is a function int the function style
            returnString.add("<span class='ins_dom_func_object'>function()</span>");
          // if it is a string
          } else if (typeof object[j] == "string") {
            // print out the string in the string style
            returnString.add("<span class='ins_dom_string'>&quot;" + object[j] + "&quot;</span>");
          // if it is a Array
          } else if (object[j] instanceof this._iFrameWindow.Array) {
            // print out the objects toSring in the object style
            returnString.add("<span class='ins_dom_object'>[" + object[j] + "]</span>");
          // if it is a object
          } else if (object[j] instanceof this._iFrameWindow.Object) {
            // print out the objects toSring in the object style
            returnString.add("<span class='ins_dom_object'>" + object[j] + "</span>");
          // in all other cases it is a primitive type
          } else {
            // print out the value in basic style
            returnString.add("<span class='ins_dom_basic'>" + object[j] + "</span>");
          }

          // print out the comma only if it is not the last element
          if (j != 1 && j != object.length - 1) {
              returnString.add(", ");
          }
        }
        // if there are more elements
        if (object.length > 2) {
          // print out a message that there are more
          returnString.add(", ... <span class='ins_dom_array_more'>" + (object.length - 2) + " more</span> ]");
        } else {
          // close the array
          returnString.add(" ]");
        }

      // if it is a qooxdoo object
      } else if (object instanceof this._iFrameWindow.qx.core.Object) {
          returnString.add(object + "</a> <a style='color: #000000;' onclick=\"qx.core.Init.getApplication().setWidgetByHash('" +
                                    object.toHashCode() + "', 'console');\">select Object</u>");

      // if it is a regular object
      } else {
          returnString.add(object);
      }
      returnString.add("</a>");

      return returnString.get();
    }

  },

  destruct : function()
  {
    this._console = this._breadCrumb = null;
    this._disposeObjects("_htmlEmbed");
  }
});
