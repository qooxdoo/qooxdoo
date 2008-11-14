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
		
		
		this.keyContainer = new Array();
		this.valueContainer = new Array();
		this.parentMemory = null;
		this.treeGroup = new qx.ui.groupbox.GroupBox("JSON-Tree");
		this.treeGroup.setLayout(new qx.ui.layout.VBox());
		this.jsonObject = null;
		
		
		this.__tree = new qx.ui.tree.Tree().set({
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
      this.valueContainer.push(result); 
      
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
        folder.setUserData("json", {obj: incoming, key: i});
        
        //alert("PARENTTTT " + qx.util.Json.stringify(parent, true));
        
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
      	this.keyContainer.push(key);
        obj = incoming[key]; 
        func = this.__map[typeof obj];

        var folder = new qx.ui.tree.TreeFolder(key);
        folder.setUserData("json", {obj: incoming, key: key});
        parent.add(folder);
        
        
        if (func) {
          this[func](obj, folder);
        }
      }
    },

	removeAllTreeItems : function() {
	  if(this.__tree.getRoot() != null) {	
      	this.__tree.getRoot().removeAll();
      }
	},
    
    createJsonTree : function(obj)
    {
      // Start convertion
      this.jsonObject = obj;
      var root = new qx.ui.tree.TreeFolder("root");
      root.setUserData("json", {obj: obj, key: null});
      root.setOpen(true);
      this.__tree.setRoot(root); //set root
      this[this.__map[typeof obj]](obj, root);
      return root;
    },

	getTreeGroup : function() {
      this.treeGroup.add(this.__tree, {flex: 1});
      return this.treeGroup;
    },
    
    
    getTree : function() {
      return this.__tree;
    },

    

    updateTextField : function(tree) {  
    	this.currentItem = null;
    	tree.addListener("changeSelection", function(e)
        {
      	this.parentMemory = new Array();
        var treeItem = e.getData()[0];
        this.currentItem = treeItem;
        var json = treeItem.getUserData("json");        

        this.tCurrentInput.setValue(qx.util.Json.stringify(json.obj[json.key], true).replace(/\\"/g, '"'));  	
        this.parentMemory.push(treeItem.getLabel().toString());
        
        if(treeItem.getLabel().toString() != "root") {
	        for(;;) { 
            treeItem = treeItem.getParent();
            this.parentMemory.push(treeItem.getLabel().toString());
            if(treeItem.getLabel().toString() == "root"){
            	break;
            }
          }
        }
        this.parentMemory = this.parentMemory.reverse();
        this.parentMemory.shift(); 

        
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

      this.tCurrentInput = new qx.ui.form.TextArea().set({
        minHeight : 120
      });

      commandFrame.add(this.tCurrentInput, {row: 1, column: 0, rowSpan : 0, colSpan: 2});

      this.updateTextField(tree);

      
      
      var btnHideRoot = new qx.ui.form.CheckBox("Hide root node");
      btnHideRoot.setChecked(this.__tree.getHideRoot());
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
      var current = this.__tree.getSelectedItem();
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
      var current = this.__tree.getSelectedItem();
      var parent = current.getParent();
      if(this.tCurrentInput) {
        this.tCurrentInput.setValue("");
      }

      parent.remove(current);
    },
    
    __editTreeItem : function() {
      	var obj = this.jsonObject;
        
      	for(var i = 0; i < this.parentMemory.length-1; i++) {
           obj = obj[this.parentMemory[i]];
        }

        var value = this.tCurrentInput.getValue().toString().replace(/\n/g, '').replace(/\\"/g, '"');
		
        var json = this.currentItem.getUserData("json");
        var parent = qx.util.Json.parse(value);
        alert("parent " + parent);
        json.obj[json.key] = parent;

        
        this.__tree.getSelectedItem().removeAll();
		
        this[this.__map[typeof parent]](parent, this.__tree.getSelectedItem()); //this.currentItem
		
		
		//alert(this.__tree.getSelectedItem().getChildren().toString());
		
		/*
		for(var i = 0; i < this.__tree.getSelectedItem().getChildren().length; i++) { // this.__tree.getSelectedItem().getChildren().length; 
			this.__tree.getSelectedItem().removeAt(i);
		}
		alert(qx.util.Json.stringify(toolbox.Configuration.JSON, true));
  		*/
    }
    
  }

});
