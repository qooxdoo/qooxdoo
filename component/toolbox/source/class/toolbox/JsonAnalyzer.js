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

  construct : function()
  {
    this.base(arguments);

    this.keyContainer = new Array();
    this.valueContainer = new Array();
    this.parentMemory = null;
    this.treeGroup = new qx.ui.groupbox.GroupBox("JSON-Tree");
    this.treeGroup.setLayout(new qx.ui.layout.VBox());
    this.jsonObject = null;

    this.__tree = new qx.ui.tree.Tree().set(
    {
      minWidth      : 300,
      minHeight     : 200,
      allowGrowX    : true,
      allowGrowY    : true,
      rootOpenClose : true,
      hideRoot      : true
    });

    this.createChildWindow();
  },

  members :
  {
    __map :
    {
      "boolean" : "__convertBoolean",
      "number"  : "__convertNumber",
      "string"  : "__convertString",
      "object"  : "__convertObject"
    },


    /**
     * TODOC
     *
     * @type member
     * @param incoming {var} TODOC
     * @param parent {var} TODOC
     * @return {var} TODOC
     */
    __convertBoolean : function(incoming, parent)
    {
      parent.setIcon("toolbox/image/document-properties.png");
      return incoming;
    },


    /**
     * TODOC
     *
     * @type member
     * @param incoming {var} TODOC
     * @param parent {var} TODOC
     * @return {var} TODOC
     */
    __convertNumber : function(incoming, parent)
    {
      parent.setIcon("toolbox/image/document-properties.png");
      var result = isFinite(incoming) ? String(incoming) : "null";
      return result;
    },


    /**
     * TODOC
     *
     * @type member
     * @param incoming {var} TODOC
     * @param parent {var} TODOC
     * @return {var} TODOC
     */
    __convertObject : function(incoming, parent)
    {
      if (incoming)
      {
        var constructorName = incoming.constructor.name;

        if (incoming instanceof Array || constructorName == "Array")
        {
          parent.setIcon("toolbox/image/array-properties.png");
          return this.__convertArray(incoming, parent);
        }
        else if (incoming instanceof Date || constructorName == "Date")
        {
          return this.__convertDate(incoming, parent);
        }
        else if (incoming instanceof Object || constructorName == "Object")
        {
          parent.setIcon("toolbox/image/object-properties.png");
          return this.__convertMap(incoming, parent);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param incoming {var} TODOC
     * @param parent {var} TODOC
     * @return {void} 
     */
    __convertString : function(incoming, parent)
    {
      parent.setIcon("toolbox/image/document-properties.png");
      var result;

      if (/["\\\x00-\x1f]/.test(incoming)) {
        result = incoming.replace(/([\x00-\x1f\\"])/g, qx.util.Json.__convertStringHelper);
      } else {
        result = incoming;
      }

      this.valueContainer.push(result);
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


    /**
     * TODOC
     *
     * @type member
     * @param a {Array} TODOC
     * @param b {var} TODOC
     * @return {var} TODOC
     */
    __convertStringHelper : function(a, b)
    {
      var result = qx.util.Json.__convertStringEscape[b];

      if (result) {
        return result;
      }

      result = b.charCodeAt();
      return '\\u00' + Math.floor(result / 16).toString(16) + (result % 16).toString(16);
    },


    /**
     * TODOC
     *
     * @type member
     * @param incoming {var} TODOC
     * @param parent {var} TODOC
     * @return {void} 
     */
    __convertArray : function(incoming, parent)
    {
      // alert("----> " + incoming.length);
      for (var i=0, l=incoming.length; i<l; i++)
      {
        obj = incoming[i];
        func = this.__map[typeof obj];
        var folder = new qx.ui.tree.TreeFolder(i + "");
        folder.setIcon("toolbox/image/array-properties.png");

        folder.setUserData("json",
        {
          obj : incoming,
          key : i
        });

        parent.add(folder);

        if (func) {
          this[func](obj, folder);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param incoming {var} TODOC
     * @param parent {var} TODOC
     * @return {var} TODOC
     */
    __convertDate : function(incoming, parent)
    {
      // alert("Date  " + incoming);
      var dateParams = incoming.getUTCFullYear() + "," + incoming.getUTCMonth() + "," + incoming.getUTCDate() + "," + incoming.getUTCHours() + "," + incoming.getUTCMinutes() + "," + incoming.getUTCSeconds() + "," + incoming.getUTCMilliseconds();
      return dateParams;
    },


    /**
     * Converts the incoming value from Map to String.
     *
     * @type member
     * @param incoming {Map} The incoming value
     * @param parent {var} TODOC
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
        folder.setIcon("toolbox/image/document-open.png");

        folder.setUserData("json",
        {
          obj : incoming,
          key : key
        });

        parent.add(folder);

        if (func) {
          this[func](obj, folder);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    removeAllTreeItems : function()
    {
      if (this.__tree.getRoot() != null) {
        this.__tree.getRoot().removeAll();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param obj {Object} TODOC
     * @return {var} TODOC
     */
    createJsonTree : function(obj)
    {
      this.jsonObject = obj;
      var root = new qx.ui.tree.TreeFolder("root");
      root.setIcon("toolbox/image/document-open.png");

      root.setUserData("json",
      {
        obj : obj,
        key : null
      });

      root.setOpen(true);
      this.__tree.setRoot(root);  // set root
      this[this.__map[typeof obj]](obj, root);
      return root;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTreeGroup : function()
    {
      this.treeGroup.add(this.__tree, { flex : 1 });
      return this.treeGroup;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTree : function()
    {
      this.__tree.setContextMenu(this.__getContextMenu());
      return this.__tree;
    },


    /**
     * TODOC
     *
     * @type member
     * @param tree {var} TODOC
     * @return {void} 
     */
    updateTypeLabel : function(tree)
    {
      tree.addListener("changeSelection", function(e)
      {
        //
        // alert("--> " + this.tCurrentInput.getValue());
        if (this.tCurrentInput.getValue() != "")
        {
          try
          {
            if (this.tCurrentInput.getValue() == "null")
            {
              this.currentTypeAtom.setLabel("null");
              this.__tree.getContextMenu().getChildren()[0].setEnabled(false);
              this.btnAddItem.setEnabled(false);
            }
            else
            {
              var constructorName = qx.util.Json.parse(this.tCurrentInput.getValue()).constructor.name;

              if (qx.util.Json.parse(this.tCurrentInput.getValue()) instanceof Array || constructorName == "Array")
              {
                this.currentTypeAtom.setLabel("array");
                this.__tree.getContextMenu().getChildren()[0].setEnabled(true);
                this.btnAddItem.setEnabled(true);
              }
              else if (qx.util.Json.parse(this.tCurrentInput.getValue()) instanceof Date || constructorName == "Date")
              {
                this.currentTypeAtom.setLabel("date");
                this.__tree.getContextMenu().getChildren()[0].setEnabled(true);
                this.btnAddItem.setEnabled(true);
              }
              else if (qx.util.Json.parse(this.tCurrentInput.getValue()) instanceof Object || constructorName == "Object")
              {
                this.currentTypeAtom.setLabel("object");
                this.__tree.getContextMenu().getChildren()[0].setEnabled(true);
                this.btnAddItem.setEnabled(true);
              }
              else if (typeof qx.util.Json.parse(this.tCurrentInput.getValue()) == "string")
              {
                this.currentTypeAtom.setLabel("string");
                this.__tree.getContextMenu().getChildren()[0].setEnabled(false);
                this.btnAddItem.setEnabled(false);
              }
              else if (typeof qx.util.Json.parse(this.tCurrentInput.getValue()) == "number")
              {
                this.currentTypeAtom.setLabel("number");
                this.__tree.getContextMenu().getChildren()[0].setEnabled(false);
                this.btnAddItem.setEnabled(false);
              }
              else if (typeof qx.util.Json.parse(this.tCurrentInput.getValue()) == "boolean")
              {
                this.currentTypeAtom.setLabel("boolean");
                this.__tree.getContextMenu().getChildren()[0].setEnabled(false);
                this.btnAddItem.setEnabled(false);
              }
            }
          }
          catch(err)
          {
            alert(err);
          }
        }
      },
      this);
    },


    /**
     * TODOC
     *
     * @type member
     * @param tree {var} TODOC
     * @return {void} 
     */
    updateTextArea : function(tree)
    {
      this.currentItem = null;

      tree.addListener("changeSelection", function(e)
      {
        var data = e.getData();

        if (data.length === 0) {
          return;
        }

        this.setEnableAllButtons(true);
        this.parentMemory = new Array();
        var treeItem = data[0];

        this.currentItem = treeItem;
        var json = treeItem.getUserData("json");

        if (treeItem.getLabel().toString() == "root") {
          this.tCurrentInput.setValue(qx.util.Json.stringify(json.obj, true).replace(/\\"/g, '"'));  // .replace(/\"\"/g, '\"'));
        } else {
          this.tCurrentInput.setValue(qx.util.Json.stringify(json.obj[json.key], true).replace(/\\"/g, '"'));  // .replace(/\"\"/g, '\"'));
        }

        this.parentMemory.push(treeItem.getLabel().toString());

        if (treeItem.getLabel().toString() != "root")
        {
          for (;;)
          {
            treeItem = treeItem.getParent();
            this.parentMemory.push(treeItem.getLabel().toString());

            if (treeItem.getLabel().toString() == "root") {
              break;
            }
          }
        }

        this.parentMemory = this.parentMemory.reverse();
        this.parentMemory.shift();
      },
      this);
    },


    /**
     * TODOC
     *
     * @type member
     * @param tree {var} TODOC
     * @return {var} TODOC
     */
    getCommandFrame : function(tree)
    {
      this.commandFrame = new qx.ui.groupbox.GroupBox("Control");

      var spacerSize = 4;
      var gridLayout = new qx.ui.layout.Grid(5, 3);
      gridLayout.setColumnFlex(0, 1);

      this.commandFrame.setLayout(gridLayout);

      this.currentTypeAtom = new qx.ui.basic.Atom("No selection").set(
      {
        paddingTop      : 4,
        backgroundColor : "#E6EDFA",
        decorator       : "main",
        center          : true,
        minWidth        : 80,
        allowGrowY      : false,
        allowGrowX      : false
      },
      this);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({ allowGrowX : false });

      this.commandFrame.add(new qx.ui.basic.Label("Selection ").set({ paddingTop : 4 }, this),
      {
        row    : 0,
        column : 0
      });

      this.commandFrame.add(new qx.ui.basic.Label("Current type: ").set({ paddingTop : 4 }, this),
      {
        row    : 0,
        column : 1
      });

      this.commandFrame.add(this.currentTypeAtom,
      {
        row    : 0,
        column : 2
      });

      this.tCurrentInput = new qx.ui.form.TextArea().set({ minHeight : 120 });

      this.commandFrame.add(this.tCurrentInput,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 3
      });

      this.updateTextArea(tree);
      this.updateTypeLabel(tree);

      var btnHideRoot = new qx.ui.form.CheckBox("Hide root node");
      btnHideRoot.setChecked(this.__tree.getHideRoot());

      this.commandFrame.add(btnHideRoot,
      {
        row    : 2,
        column : 0
      });

      btnHideRoot.addListener("changeChecked", function(e) {
        tree.setHideRoot(e.getData());
      }, this);

      this.commandFrame.add(container,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 3
      });

      this.btnAddItem = new qx.ui.form.Button("Add child", "toolbox/image/list-add.png");
      this.btnAddItem.addListener("execute", this.__addChildWindow, this);
      container.add(this.btnAddItem);

      this.btnRemove = new qx.ui.form.Button("Remove child", "toolbox/image/list-remove.png");
      this.btnRemove.addListener("execute", this.__removeChild, this);
      container.add(this.btnRemove);

      this.btnEdit = new qx.ui.form.Button("Edit child", "toolbox/image/edit.png");
      this.btnEdit.addListener("execute", this.__editChild, this);
      container.add(this.btnEdit);

      this.setEnableAllButtons(false);
      return this.commandFrame;
    },


    /**
     * TODOC
     *
     * @type member
     * @param state {var} TODOC
     * @return {void} 
     */
    setEnableAllButtons : function(state)
    {
      this.btnAddItem.setEnabled(state);
      this.btnRemove.setEnabled(state);
      this.btnEdit.setEnabled(state);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    __getContextMenu : function()
    {
      var menu = new qx.ui.menu.Menu;
      var addChildButton = new qx.ui.menu.Button("add child", "toolbox/image/list-add.png");  // , this.__addChild);
      var removeChildButton = new qx.ui.menu.Button("remove child", "toolbox/image/list-remove.png");  // , this.__addChild);

      addChildButton.addListener("execute", this.__addChildWindow, this);
      removeChildButton.addListener("execute", this.__removeChild, this);

      menu.add(addChildButton);
      menu.add(removeChildButton);

      return menu;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    createChildWindow : function()
    {
      this.win = new qx.ui.window.Window("Add child");
      this.win.setModal(true);
      var gridbagLayout = new qx.ui.layout.Grid(5, 5);
      gridbagLayout.setColumnFlex(1, 1);

      this.win.setLayout(gridbagLayout);
      this.win.setAllowGrowX(false);
      this.win.setAllowGrowY(false);
      this.win.setAllowMaximize(false);
      this.win.setAllowMinimize(false);

      this.win.addListener("close", this.resetAddChildDialog, this);

      this.buttonContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5, "right"));
      this.childKeyTextfield = new qx.ui.form.TextField();
      this.childValueTextfield = new qx.ui.form.TextField();

      // ------------------------------------------------------------
      this.booleanTypeSelection = [ "true", "false" ];
      this.booleanValues = [ "true", "false" ];
      this.booleanTypeBox = new qx.ui.form.SelectBox();

      for (var i=0; i<this.booleanTypeSelection.length; i++)
      {
        var tempItem3 = new qx.ui.form.ListItem(this.booleanTypeSelection[i]);
        tempItem3.setValue(this.booleanValues[i]);
        this.booleanTypeBox.add(tempItem3);

        if (i == 0) {
          this.booleanTypeBox.setSelected(tempItem3);
        }
      }

      // -------------------------------------------------------------
      this.typeSelection = [ "Primitive type", "Array", "Object" ];
      this.values = [ "primitive", "array", "object" ];
      this.typeBox = new qx.ui.form.SelectBox();

      for (var i=0; i<this.typeSelection.length; i++)
      {
        var tempItem = new qx.ui.form.ListItem(this.typeSelection[i]);
        tempItem.setValue(this.values[i]);
        this.typeBox.add(tempItem);

        if (i == 0)
        {
          this.typeBox.setSelected(tempItem);
          this.__currentType = this.typeBox.getValue();
        }
      }

      this.primitiveTypeLabel = new qx.ui.basic.Label("Primitive type: ");
      this.primitiveTypeSelection = [ "String", "Number", "Boolean", "Null" ];
      this.primitiveValues = [ "string", "number", "boolean", "null" ];
      this.primitiveTypeBox = new qx.ui.form.SelectBox();

      for (var i=0; i<this.primitiveTypeSelection.length; i++)
      {
        var tempItem2 = new qx.ui.form.ListItem(this.primitiveTypeSelection[i]);
        tempItem2.setValue(this.primitiveValues[i]);
        this.primitiveTypeBox.add(tempItem2);

        if (i == 0)
        {
          this.primitiveTypeBox.setSelected(tempItem2);
          this.childKeyTextfield.show();
          this.childValueTextfield.show();
        }
      }

      this.primitiveTypeBox.addListener("changeValue", function()
      {
        if (this.primitiveTypeBox.getValue() == "string")
        {
          this.win.remove(this.booleanTypeBox);

          this.win.add(this.childValueTextfield,
          {
            row     : 5,
            column  : 1,
            rowSpan : 0,
            colSpan : 3
          });

          this.childKeyTextfield.show();
          this.childValueTextfield.show();
          this.childValueTextfield.setValue("");
          this.childValueTextfield.setEnabled(true);
        }
        else if (this.primitiveTypeBox.getValue() == "number")
        {
          this.win.remove(this.booleanTypeBox);

          this.win.add(this.childValueTextfield,
          {
            row     : 5,
            column  : 1,
            rowSpan : 0,
            colSpan : 3
          });

          this.valueLabel.show();
          this.childValueTextfield.show();
          this.childValueTextfield.setEnabled(true);
          this.childValueTextfield.setValue("");
        }
        else if (this.primitiveTypeBox.getValue() == "boolean")
        {
          this.childValueTextfield.setValue("");
          this.win.remove(this.childValueTextfield);

          this.win.add(this.booleanTypeBox,
          {
            row     : 5,
            column  : 1,
            rowSpan : 0,
            colSpan : 3
          });

          this.booleanTypeBox.show();
        }
        else if (this.primitiveTypeBox.getValue() == "null")
        {
          this.win.remove(this.booleanTypeBox);

          this.win.add(this.childValueTextfield,
          {
            row     : 5,
            column  : 1,
            rowSpan : 0,
            colSpan : 3
          });

          this.valueLabel.show();
          this.childValueTextfield.show();
          this.childValueTextfield.setEnabled(false);
          this.childValueTextfield.setValue("null");
        }

        if (this.currentTypeAtom.getLabel().toString() == "array")
        {
          this.keyLabel.exclude();
          this.childKeyTextfield.exclude();
        }
        else
        {
          this.keyLabel.show();
          this.childKeyTextfield.show();
        }
      },
      this);

      this.typeBox.addListener("changeValue", function(e)
      {
        if (this.typeBox.getValue() == "primitive")
        {
          this.primitiveTypeLabel.show();
          this.primitiveTypeBox.show();

          if (this.currentTypeAtom.getLabel().toString() == "array")
          {
            this.keyLabel.exclude();
            this.childKeyTextfield.exclude();
          }
          else
          {
            this.keyLabel.show();
            this.childKeyTextfield.show();
          }

          this.valueLabel.show();
          this.childValueTextfield.show();
        }
        else
        {
          if (this.currentTypeAtom.getLabel().toString() == "array")
          {
            this.childKeyTextfield.exclude();
            this.childValueTextfield.exclude();
            this.keyLabel.exclude();
            this.valueLabel.exclude();
          }
          else if (this.currentTypeAtom.getLabel().toString() == "object")
          {
            this.keyLabel.show();
            this.childKeyTextfield.show();
            this.childValueTextfield.exclude();
            this.valueLabel.exclude();
          }

          this.primitiveTypeLabel.exclude();
          this.primitiveTypeBox.exclude();
          this.booleanTypeBox.exclude();
        }

        this.__currentType = this.typeBox.getValue();
      },
      this);

      this.childLabel = new qx.ui.basic.Label('<b "font-size: 12pt;">Please give a child name (without path)</b>');
      this.childLabel.setRich(true);

      this.inputTypeLabel = new qx.ui.basic.Label("Input type: ");

      this.spacer = new qx.ui.core.Spacer(0, 10);

      this.folderOkButton = new qx.ui.form.Button("OK", "toolbox/image/dialog-ok.png");
      this.folderOkButton.addListener("execute", this.__addChild, this);

      this.folderAbortButton = new qx.ui.form.Button("Abort", "toolbox/image/dialog-cancel.png");
      this.folderAbortButton.addListener("execute", this.__addChildWindowClose, this);

      this.buttonContainer.add(this.folderAbortButton);
      this.buttonContainer.add(this.folderOkButton);

      this.keyLabel = new qx.ui.basic.Label("Key:");
      this.valueLabel = new qx.ui.basic.Label("Value:");

      this.win.add(this.childLabel,
      {
        row     : 0,
        column  : 0,
        rowSpan : 0,
        colSpan : 4
      });

      this.win.add(this.spacer,
      {
        row     : 1,
        column  : 0,
        rowSpan : 0,
        colSpan : 4
      });

      this.win.add(this.inputTypeLabel,
      {
        row     : 2,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      this.win.add(this.typeBox,
      {
        row     : 2,
        column  : 1,
        rowSpan : 0,
        colSpan : 3
      });

      this.win.add(this.primitiveTypeLabel,
      {
        row     : 3,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      this.win.add(this.primitiveTypeBox,
      {
        row     : 3,
        column  : 1,
        rowSpan : 0,
        colSpan : 3
      });

      this.win.add(this.keyLabel,
      {
        row     : 4,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      this.win.add(this.childKeyTextfield,
      {
        row     : 4,
        column  : 1,
        rowSpan : 0,
        colSpan : 3
      });

      this.win.add(this.valueLabel,
      {
        row     : 5,
        column  : 0,
        rowSpan : 0,
        colSpan : 1
      });

      this.win.add(this.childValueTextfield,
      {
        row     : 5,
        column  : 1,
        rowSpan : 0,
        colSpan : 3
      });

      this.win.add(this.spacer,
      {
        row     : 6,
        column  : 0,
        rowSpan : 0,
        colSpan : 4
      });

      this.win.add(this.buttonContainer,
      {
        row     : 7,
        column  : 0,
        rowSpan : 0,
        colSpan : 4
      });

      this.keyLabel.exclude();
      this.childKeyTextfield.exclude();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __addChild : function()
    {
      var json = this.__tree.getSelectedItem().getUserData("json");
      var subTree = json.obj[json.key];

      if (this.currentTypeAtom.getLabel().toString() == "array")
      {
        if (this.__currentType == "object") {
          subTree[subTree.length] = {};
        }
        else if (this.__currentType == "primitive")
        {
          if (this.primitiveTypeBox.getValue() == "boolean") {
            subTree[subTree.length] = eval(this.booleanTypeBox.getValue());
          }
          else if (this.primitiveTypeBox.getValue() == "number")
          {
            try {
              subTree[subTree.length] = eval(this.childValueTextfield.getValue());
            } catch(err) {
              alert("An error has occured: Invalid input");
            }
          }
          else if (this.primitiveTypeBox.getValue() == "string")
          {
            subTree[subTree.length] = this.childValueTextfield.getValue();
          }
          else if (this.primitiveTypeBox.getValue() == "null")
          {
            subTree[subTree.length] = eval(this.childValueTextfield.getValue());
          }
        }
        else if (this.__currentType == "array")
        {
          subTree[subTree.length] = [];
        }
      }
      else if (this.currentTypeAtom.getLabel().toString() == "object")
      {
        if (this.__currentType == "object") {
          subTree[this.childKeyTextfield.getValue()] = {};
        }
        else if (this.__currentType == "primitive")
        {
          if (this.primitiveTypeBox.getValue() == "boolean") {
            subTree[this.childKeyTextfield.getValue()] = eval(this.booleanTypeBox.getValue());
          }
          else if (this.primitiveTypeBox.getValue() == "number")
          {
            try {
              subTree[this.childKeyTextfield.getValue()] = eval(this.childValueTextfield.getValue());
            } catch(err) {
              alert("An error has occured: Invalid input");
            }
          }
          else if (this.primitiveTypeBox.getValue() == "string")
          {
            subTree[this.childKeyTextfield.getValue()] = this.childValueTextfield.getValue();
          }
          else if (this.primitiveTypeBox.getValue() == "null")
          {
            subTree[this.childKeyTextfield.getValue()] = eval(this.childValueTextfield.getValue());
          }
        }
        else if (this.__currentType == "array")
        {
          subTree[this.childKeyTextfield.getValue()] = [];
        }
      }

      var json2 = this.currentItem.getUserData("json");
      var current = this.__tree.getSelectedItem();
      current.removeAll();

      this[this.__map[typeof json2.obj[json2.key]]](json2.obj[json2.key], this.__tree.getSelectedItem());
      this.resetAddChildDialog();
      this.childKeyTextfield.setValue("");
      this.childValueTextfield.setValue("");
      this.win.close();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    resetAddChildDialog : function()
    {
      var resetTypeBoxSelection = new qx.ui.form.ListItem("Primitive type");
      resetTypeBoxSelection.setValue("primitive");
      this.typeBox.setSelected(resetTypeBoxSelection);

      var resetPrimitiveSelection = new qx.ui.form.ListItem("String");
      resetPrimitiveSelection.setValue("string");
      this.primitiveTypeBox.setSelected(resetPrimitiveSelection);

      this.primitiveTypeLabel.show();
      this.primitiveTypeBox.show();
      this.childKeyTextfield.show();
      this.childValueTextfield.show();
      this.keyLabel.show();
      this.valueLabel.show();
      this.childKeyTextfield.setValue("");
      this.childValueTextfield.setValue("");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __addChildWindowClose : function()
    {
      this.resetAddChildDialog();
      this.win.close();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __addChildWindow : function()
    {
      this.win.open();

      if (this.currentTypeAtom.getLabel().toString() == "array")
      {
        this.keyLabel.exclude();
        this.childKeyTextfield.exclude();
      }
      else if (this.currentTypeAtom.getLabel().toString() == "object")
      {
        this.keyLabel.show();
        this.childKeyTextfield.show();
        this.childKeyTextfield.setValue("");
        this.childValueTextfield.setValue("");
      }

      this.win.moveTo(qx.core.Init.getApplication().toolbox.__configuration.win.getBounds()["left"] + 100, qx.core.Init.getApplication().toolbox.__configuration.win.getBounds()["top"] + 50);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __removeChild : function()
    {
      if (this.tCurrentInput) {
        this.tCurrentInput.setValue("");
      }

      var json = this.currentItem.getUserData("json");
      var par = this.currentItem.getParent().getUserData("json");
      var parMem = this.currentItem.getParent();

      // -----------------------------------OBJECT-------------------------------------
      if (this.currentTypeAtom.getLabel().toString() == "object" || this.currentTypeAtom.getLabel().toString() == "array" || this.currentTypeAtom.getLabel().toString() == "null" || typeof json.obj[json.key] == "string" || typeof json.obj[json.key] == "number" || typeof json.obj[json.key] == "boolean")
      {  // Objekt in einem Array
        if (par.obj[par.key] instanceof Array)
        {
          for (var i=0; i<json.obj.length; i++)
          {
            if (i == this.__tree.getSelectedItem().getLabel().toString())
            {
              json.obj.splice(i, 1);
              this[this.__map[typeof json.obj]](json.obj, this.__tree.getSelectedItem().getParent());

              for (var j=0; j<json.obj.length+1; j++) {
                parMem.removeAt(0);
              }

              break;
            }
          }
        }
        else if (par.obj[par.key] instanceof Object)
        {  // Object in einem Object
          delete json.obj[json.key];
          delete json.key;
          this[this.__map[typeof json.obj]](json.obj, this.__tree.getSelectedItem().getParent());

          for (var j=0; j<parMem.getItems(true, false).length+1; j++) {
            parMem.removeAt(0);
          }
        }
      }
    },

    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __editChild : function()
    {
      var obj = this.jsonObject;

      for (var i=0; i<this.parentMemory.length-1; i++) {
        obj = obj[this.parentMemory[i]];
      }

      var value = this.tCurrentInput.getValue().toString().replace(/\n/g, '').replace(/\\"/g, '"');
      var json = this.__tree.getSelectedItem().getUserData("json");

      try
      {
        var parent = qx.util.Json.parse(value);
        json.obj[json.key] = parent;

        this.__tree.getSelectedItem().removeAll();

        this[this.__map[typeof parent]](parent, this.__tree.getSelectedItem());
      }
      catch(err)
      {
        alert(err);
      }
    }
  }
});