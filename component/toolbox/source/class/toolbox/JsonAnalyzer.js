/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "HelloWorld"
 */
qx.Class.define("toolbox.JsonAnalyzer",
{ 
	extend : qx.core.Object,
  
  members :
  {

  	/** indent string for JSON pretty printing */
    BEAUTIFYING_INDENT : "  ",

    /** new line string for JSON pretty printing */
    BEAUTIFYING_LINE_END : "\n",

    
    
    __map :
    {
      "function"  : "__convertFunction",
      "boolean"   : "__convertBoolean",
      "number"    : "__convertNumber",
      "string"    : "__convertString",
      "object"    : "__convertObject",
      "undefined" : "__convertUndefined"
    },


    __convertFunction : function(incoming) {
    	//alert("Function " + incoming);
      return String(incoming);
    },


    __convertBoolean : function(incoming) {
    	//alert("Boolean " + incoming);
      return String(incoming);
    },


    __convertNumber : function(incoming) {
    	////alert("Number " + incoming);
      return isFinite(incoming) ? String(incoming) : "null";
    },


    __convertString : function(incoming)
    {
    	//alert("String  " + incoming);
      var result;

      if (/["\\\x00-\x1f]/.test(incoming)) {
        result = incoming.replace(/([\x00-\x1f\\"])/g, qx.util.Json.__convertStringHelper);
      } else {
        result = incoming;
      }
      
      return '"' + result + '"';
    },

    __convertStringEscape :
    {
      '\b' : '\\b',
      '\t' : '\\t',
      '\n' : '\\n',
      '\f' : '\\f',
      '\r' : '\\r',
      '"'  : '\\"',
      '\\' : '\\\\'
    },


    __convertStringHelper : function(a, b)
    {
      var result = qx.util.Json.__convertStringEscape[b];

      if (result) {
        return result;
      }

      result = b.charCodeAt();
      return '\\u00' + Math.floor(result / 16).toString(16) + (result % 16).toString(16);
    },


    __convertArray : function(incoming)
    {
    	//alert("Array  " + incoming);
      var stringBuilder = [], first = true, func, obj;

      var beautify = qx.util.Json.__beautify;
      stringBuilder.push("[");

      if (beautify)
      {
        qx.util.Json.__indent += qx.util.Json.BEAUTIFYING_INDENT;
        stringBuilder.push(qx.util.Json.__indent);
      }

      for (var i=0, l=incoming.length; i<l; i++)
      {
        obj = incoming[i];
        func = this.__map[typeof obj];

        if (func)
        {
          obj = this[func](obj);

          if (typeof obj == "string")
          {
            if (!first)
            {
              stringBuilder.push(",");

              if (beautify) {
                stringBuilder.push(qx.util.Json.__indent);
              }
            }

            stringBuilder.push(obj);
            first = false;
          }
        }
      }

      if (beautify)
      {
        qx.util.Json.__indent = qx.util.Json.__indent.substring(0, qx.util.Json.__indent.length - qx.util.Json.BEAUTIFYING_INDENT.length);
        stringBuilder.push(qx.util.Json.__indent);
      }

      stringBuilder.push("]");

      return stringBuilder.join("");
    },


    __convertDate : function(incoming)
    {
    	//alert("Date  " + incoming);
      var dateParams = incoming.getUTCFullYear() + "," + incoming.getUTCMonth() + "," + incoming.getUTCDate() + "," + incoming.getUTCHours() + "," + incoming.getUTCMinutes() + "," + incoming.getUTCSeconds() + "," + incoming.getUTCMilliseconds();
      return "new Date(Date.UTC(" + dateParams + "))";
    },


    /**
     * Converts the incoming value from Map to String.
     *
     * @param incoming {Map} The incoming value
     * @return {String} value converted to a JSON string
     */
    __convertMap : function(incoming)
    {
      var stringBuilder = [], first = true, func, obj;

      var beautify = qx.util.Json.__beautify;
      stringBuilder.push("{");

      if (beautify)
      {
        qx.util.Json.__indent += qx.util.Json.BEAUTIFYING_INDENT;
        stringBuilder.push(qx.util.Json.__indent);
      }

      for (var key in incoming)
      {
        obj = incoming[key];
        func = this.__map[typeof obj];

        if (func)
        {
          obj = this[func](obj);

          if (typeof obj == "string")
          {
            if (!first)
            {
              stringBuilder.push(",");

              if (beautify) {
                stringBuilder.push(qx.util.Json.__indent);
              }
            }

            stringBuilder.push(this.__convertString(key), ":", obj);
            first = false;
          }
        }
      }

      if (beautify)
      {
        qx.util.Json.__indent = qx.util.Json.__indent.substring(0, qx.util.Json.__indent.length - qx.util.Json.BEAUTIFYING_INDENT.length);
        stringBuilder.push(qx.util.Json.__indent);
      }

      stringBuilder.push("}");

      return stringBuilder.join("");
    },


    __convertObject : function(incoming)
    {
    	//alert("Object " + incoming);
      if (incoming)
      {
        // for objects defined in other frames the instanceof check failes.
        var constructorName = incoming.constructor.name;
        if (incoming instanceof Array || constructorName == "Array") {
          return this.__convertArray(incoming);
        } else if (incoming instanceof Date || constructorName == "Date") {
          return this.__convertDate(incoming);
        } else if (incoming instanceof Object || constructorName == "Object") {
          return this.__convertMap(incoming);
        }

        return "";
      }

      return "null";
    },


    __convertUndefined : function(incoming)
    {
    	//alert("Undefined  " + incoming);
      if (qx.core.Setting.get("qx.jsonEncodeUndefined")) {
        return "null";
      }
    },


    createJsonTree : function(obj, beautify)
    {
      // Hints for converter process
      this.__beautify = beautify;
      this.__indent = this.BEAUTIFYING_LINE_END;

      // Start convertion
      var result = this[this.__map[typeof obj]](obj);
      if (typeof result != "string") {
        result = null;
      }

      // Debugging support
      if (qx.core.Setting.get("qx.jsonDebugging")) {
        qx.log.Logger.debug(this, "JSON request: " + result);
      }

      return result;
    },

    getTree : function()
    {
      if (this.tree) {
        return this.tree;
      }
      
      this.tree = new qx.ui.tree.Tree().set({
        width : 200,
        height : 400
      });

      var root = new qx.ui.tree.TreeFolder("root");
      root.setOpen(true);
      this.tree.setRoot(root);

      var te1 = new qx.ui.tree.TreeFolder("Desktop");
      te1.setOpen(true)
      root.add(te1);

      var te1_1 = new qx.ui.tree.TreeFolder("Files");
      var te1_2 = new qx.ui.tree.TreeFolder("Workspace");
      var te1_3 = new qx.ui.tree.TreeFolder("Network");
      var te1_4 = new qx.ui.tree.TreeFolder("Trash");
      te1.add(te1_1, te1_2, te1_3, te1_4);


      var te1_2_1 = new qx.ui.tree.TreeFile("Windows (C:)");
      var te1_2_2 = new qx.ui.tree.TreeFile("Documents (D:)");
      te1_2.add(te1_2_1, te1_2_2);



      var te2 = new qx.ui.tree.TreeFolder("Inbox");

      var te2_1 = new qx.ui.tree.TreeFolder("Presets");
      var te2_2 = new qx.ui.tree.TreeFolder("Sent");
      var te2_3 = new qx.ui.tree.TreeFolder("Trash");

      for (var i=0; i<30; i++) {
        te2_3.add(new qx.ui.tree.TreeFile("Junk #" + i));
      }

      var te2_4 = new qx.ui.tree.TreeFolder("Data");
      var te2_5 = new qx.ui.tree.TreeFolder("Edit");

      te2.add(te2_1, te2_2, te2_3, te2_4, te2_5);

      root.add(te2);

      return this.tree;
    },
    
    getCommandFrame : function(tree)
    {
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      var spacerSize = 4;

      commandFrame.setLayout(new qx.ui.layout.Grid(5, 3));

      var row = 0;
      commandFrame.add(new qx.ui.basic.Label("Selection: ").set({
        paddingTop: 4
      }), {row: row, column: 0});

      var tCurrentInput = new qx.ui.form.TextField();

      commandFrame.add(tCurrentInput, {row: row++, column: 1});

      tree.addListener("changeSelection", function(e)
      {
      	alert("---> " + e);
        if (this.getSelectionMode() === "multi") {
          tCurrentInput.setValue(e.getData().length + " items");
        } else {
          tCurrentInput.setValue(e.getData()[0].getLabel());
        }
      });


      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("View mode:"), {row: row, column: 0});
      
      this.viewModeSelect = new qx.ui.form.CheckBox("Professional view");
      commandFrame.add(this.viewModeSelect, {row: row++, column: 1});



      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      commandFrame.add(new qx.ui.basic.Label("Root node:"), {row: row, column: 0});

      var btnHideRoot = new qx.ui.form.CheckBox("Hide Root Node");
      btnHideRoot.setChecked(tree.getHideRoot());
      commandFrame.add(btnHideRoot, {row: row++, column: 1});

      btnHideRoot.addListener("changeChecked", function(e) {
        tree.setHideRoot(e.getData());
      }, this);
      
      commandFrame.add(new qx.ui.core.Spacer(spacerSize, spacerSize), {row: row++, column: 0});
      var vShowItems = new qx.ui.form.Button("Show Items");
      commandFrame.add(vShowItems, {row: row++, column: 1});

      vShowItems.addListener("execute", function(e) {
        alert(("" + tree.getItems()).replace(",", "\n", "g"));
      });
      

      return commandFrame;
    },
    
    getViewModeSelect : function(){
    	return this.viewModeSelect;
    }



  }

});