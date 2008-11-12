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
  
	construct : function() {
		this.base(arguments);
		
		this.parentMemory = null;
		this.selectedValue = null;
		//this.selectedTreeItem = null;
		
		this.jsonObject = null;
		this.tree = new qx.ui.tree.Tree().set({
	        minWidth : 300,
	        minHeight : 200,
	        allowGrowX : true,
	        allowGrowY : true,
	        rootOpenClose: true,
	        hideRoot: true
    	});
	},
	
	
  members :
  {    
    
    __map :
    {
      "boolean"   : "__convertBoolean",
      "number"    : "__convertNumber",
      "string"    : "__convertString",
      "object"    : "__convertObject"
    },


    __convertBoolean : function(incoming, parent) {
      /*
      var treeFile = new qx.ui.tree.TreeFile(incoming.toString());
      parent.add(treeFile);
      */
      return incoming;
    },


    __convertNumber : function(incoming, parent) {
      var result = isFinite(incoming) ? String(incoming) : "null";
      /*
      var treeFile = new qx.ui.tree.TreeFile(result);
      parent.add(treeFile);
      */
      return result;
    },
    
    
    __convertObject : function(incoming, parent)
    {
      if (incoming)
      {
        // for objects defined in other frames the instanceof check failes.
        var constructorName = incoming.constructor.name;
        if (incoming instanceof Array || constructorName == "Array") {
          return this.__convertArray(incoming, parent);
        } else if (incoming instanceof Date || constructorName == "Date") {
          return this.__convertDate(incoming, parent);
        } else if (incoming instanceof Object || constructorName == "Object") {
          return this.__convertMap(incoming, parent);
        }
      }
    },


    __convertString : function(incoming, parent)
    {
    	
      var result;

      if (/["\\\x00-\x1f]/.test(incoming)) {
        result = incoming.replace(/([\x00-\x1f\\"])/g, qx.util.Json.__convertStringHelper);
      } else {
        result = incoming;
      }
      /*
      var treeFile = new qx.ui.tree.TreeFile(result);
      treeFile.setUserData("json", result.toString());
      parent.add(treeFile);
      */
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


    __convertArray : function(incoming, parent)
    {
      for (var i=0, l=incoming.length; i<l; i++)
      {     	
        obj = incoming[i];       
        func = this.__map[typeof obj];
        var folder = new qx.ui.tree.TreeFolder(i+"");        
        folder.setUserData("json", obj);
        
        parent.add(folder);

        if (func) {
          this[func](obj, folder);
        }
      }
    },


    __convertDate : function(incoming, parent)
    {
    	//alert("Date  " + incoming);
      var dateParams = incoming.getUTCFullYear() + "," + incoming.getUTCMonth() + "," + incoming.getUTCDate() + "," + incoming.getUTCHours() + "," + incoming.getUTCMinutes() + "," + incoming.getUTCSeconds() + "," + incoming.getUTCMilliseconds();
      /*
      var treeFile = new qx.ui.tree.TreeFile("new Date(Date.UTC(" + dateParams + "))");
      parent.add(treeFile);
      */
      return dateParams;
    },


    /**
     * Converts the incoming value from Map to String.
     *
     * @param incoming {Map} The incoming value
     * @return {String} value converted to a JSON string
     */
    __convertMap : function(incoming, parent)
    {
      for (var key in incoming)
      {
        obj = incoming[key]; 
        func = this.__map[typeof obj];

        var folder = new qx.ui.tree.TreeFolder(key);
        folder.setUserData("json", obj);
        parent.add(folder);
        
        
        if (func) {
          this[func](obj, folder);
        }
      }
    },


    createJsonTree : function(obj)
    {
      // Start convertion
    	this.jsonObject = obj;
      var root = new qx.ui.tree.TreeFolder("root");
      root.setOpen(true);
      this[this.__map[typeof obj]](obj, root);
      return root;
    },

    getTree : function() {
      return this.tree;
    },
    
    updateTextField : function(tree) {  
    	tree.addListener("changeSelection", function(e)
        {
        	this.parentMemory = new Array();
        	
	        var treeItem = e.getData()[0];
	        var json = treeItem.getUserData("json");        
	        
	        this.tCurrentInput.setValue(qx.util.Json.stringify(json, true));  	
	        
	        
	        var receivedJsonObject = this.jsonObject;
	        
	     
	        this.parentMemory.push(treeItem.getLabel().toString());
	        
	        for(;;) { 
            treeItem = treeItem.getParent();
            this.parentMemory.push(treeItem.getLabel().toString());
            if(treeItem.getLabel().toString() == "root"){
            	break;
            }
          }
	        
	        this.parentMemory = this.parentMemory.reverse();
	        this.parentMemory.shift();
	        
	        
	        
	        //alert("parentMemory ==: " + this.parentMemory.toString() +"\n laenge " + this.parentMemory.length);
	        
	        for(var i = 0; i < this.parentMemory.length; i++) {
	        	receivedJsonObject = receivedJsonObject[this.parentMemory[i]];
	        }
	        
	        this.selectedValue = receivedJsonObject;
	        //alert("parentMemory ==" + this.parentMemory+"\n--->  " + receivedJsonObject );
	        
      	}, this);
    	
    	
      
      
    },
    
    
    getCommandFrame : function(tree)
    {	
      var commandFrame = new qx.ui.groupbox.GroupBox("Control");
      var spacerSize = 4;
  	  var gridLayout = new qx.ui.layout.Grid(5, 3);
  	  gridLayout.setRowFlex(1, 1);
  	  gridLayout.setColumnFlex(0, 1);
      commandFrame.setLayout(gridLayout);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
            allowGrowX: false
      });

      commandFrame.add(new qx.ui.basic.Label("Selection: ").set({
        paddingTop: 4
      }, this), {row: 0, column: 0});

      this.tCurrentInput = new qx.ui.form.TextArea();

      commandFrame.add(this.tCurrentInput, {row: 1, column: 0, rowSpan : 0, colSpan: 2});

      
      this.updateTextField(tree);
      
      
      /*
      tree.addListener("changeSelection", function(e)
      {
      	  if(e.getData() != "") {
            this.tCurrentInput.setValue(e.getData()[0].getLabel());
      	  }	  
      }, this);
      */
      
      var btnHideRoot = new qx.ui.form.CheckBox("Hide root node");
      btnHideRoot.setChecked(tree.getHideRoot());
      commandFrame.add(btnHideRoot, {row: 2, column: 0});

      btnHideRoot.addListener("changeChecked", function(e) {
        tree.setHideRoot(e.getData());
      }, this);
      
      
      commandFrame.add(container, {row: 3, column: 0});

      var btnAddItem = new qx.ui.form.Button("Add folder");
      btnAddItem.addListener("execute", this.__addFolder, this);
      container.add(btnAddItem);

      var btnRemove = new qx.ui.form.Button("Remove tree item");
      btnRemove.addListener("execute", this.__removeTreeItem, this);
      container.add(btnRemove);

      var btnEdit = new qx.ui.form.Button("Edit item");
      btnEdit.addListener("execute", this.__editTreeItem, this);
      container.add(btnEdit);

      
      return commandFrame;
    },
    
    __addFolder : function()
    {
      var current = this.tree.getSelectedItem();
      var folder = new qx.ui.tree.TreeFolder(this.tCurrentInput.getValue());
      
      folder.addListenerOnce("appear", function(){
        effect = new qx.fx.effect.core.Highlight(folder.getContainerElement().getDomElement());
        effect.start();
      }, this);

      current.setOpen(true);
      current.add(folder);
    },
    
    
    __removeTreeItem : function()
    {
      var current = this.tree.getSelectedItem();
      var parent = current.getParent();
      if(this.tCurrentInput) {
        this.tCurrentInput.setValue("");
      }

      parent.remove(current);
    },
    
    __editTreeItem : function() {
    	var receivedJsonObject = this.jsonObject;
    	for(var i = 0; i < this.parentMemory.length; i++) {
         receivedJsonObject = receivedJsonObject[this.parentMemory[i]];
      }
      
      alert("Vorher  " + receivedJsonObject);
      
      //receivedJsonObject = this.tCurrentInput.getValue().toString();
      
      //alert("Nachher " + receivedJsonObject);
      
      //alert(this.parentMemory.toString());
      //alert(this.jsonObject);
      //this.jsonObject = this.tCurrentInput.getValue().toString();
    }
  }

});
