/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Stefan Kloiber (skloiber)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Shows the search pane.
 */
qx.Class.define("apiviewer.ui.SearchView",
{
  extend : qx.ui.container.Composite,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var layout = new qx.ui.layout.VBox();
    this.setLayout(layout);
    this.setBackgroundColor("white");

    this.__initresult = false;
    this.listdata = [];

    this.apiindex = {};

    this._showSearchForm();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __note : null,
    __initresult : null,
    __table : null,
    __typeFilter: null,
    __typesIndex: null,

    /**
     * Generate the search form.
     */
    _showSearchForm : function()
    {

      //--------------------------------------------------------
      // Outputs the generated index file content to a textarea
      //--------------------------------------------------------

      // Search form
      var layout = new qx.ui.layout.Grid(4, 4);
      layout.setColumnFlex(1, 1);
      layout.setRowAlign(2, "left", "middle");

      var sform = new qx.ui.container.Composite(layout);
      sform.setPadding(10);

      // Search form - input field
      this.sinput = new qx.ui.form.TextField().set({
        placeholder : "Enter search term ..."
      });

      sform.add(this.sinput, {
        row: 0, column: 0, colSpan: 2
      });

      this.__typesIndex =
      {
        "PACKAGE":0,
        "ENTRY":4,
        "CLASS":1,
        "INTERFACE":1,
        "METHOD_PUB":2,
        "METHOD_PROT":2,
        "METHOD_PRIV":2,
        "PROPERTY_PUB":4,
        "EVENT":5,
        "CONSTANT":3,
        "CHILDCONTROL":6
      };
      this.__typeFilter = new qx.data.Array([true, true, true, true, true, true, true]);
      var types = ["Packages", "Classes, Mixins, Interfaces", "Methods", "Constants", "Properties", "Events", "Child Controls"];
      var iconNameParts = ["package", "class", "method_public", "constant", "property", "event", "childcontrol"];

      var typeContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());

      for(var i=0; i<types.length; i++)
      {
        var type=types[i];
        var iconNamePart = iconNameParts[i];
        var typeToggleButton = new qx.ui.form.ToggleButton("", "apiviewer/image/"+iconNamePart+"18.gif");
        typeToggleButton.setToolTipText(type);
        // we need variable paddingLeft in order to accommodate the icons in the center of the toggleButton
        var paddingLeft = 0;
        var paddingBottom = 0;
        var paddingTop = 0;
        if(["class", "interface"].indexOf(iconNamePart)!=-1)
        {
          paddingLeft = 2;
        }
        else if(["package", "childcontrol"].indexOf(iconNamePart)!=-1)
        {
           paddingLeft = 1;
           if(iconNamePart === "childcontrol") {
             paddingBottom = 2;
           }
        }
        else if (iconNamePart === "constant")
        {
          paddingTop = 1;
        }
        typeToggleButton.setFocusable(false);
        typeToggleButton.setPadding(paddingTop, 0, paddingBottom, paddingLeft);
        typeToggleButton.setMarginRight(2);
        typeToggleButton.setGap(0);
        typeToggleButton.setIconPosition("top");
        typeToggleButton.setShow("icon");
        typeToggleButton.bind("value", this.__typeFilter, "array["+i+"]");
        typeToggleButton.setKeepFocus(true);
        typeToggleButton.setValue(true);
        typeContainer.add(typeToggleButton);
        typeToggleButton.addListener("click", function(e) {
          this._searchResult(this.sinput.getValue() || "");
        }, this);
        this.__typeFilter.bind("["+i+"]", typeToggleButton, "value");
      }

        var typeToggleButtonAll = new qx.ui.form.ToggleButton("Toggle Filters");
        typeToggleButtonAll.setFocusable(false);
        typeToggleButtonAll.setPadding(1, 3, 1, 3);
        typeToggleButtonAll.setShow("label");
        typeToggleButtonAll.setValue(true);
        typeToggleButtonAll.setGap(0);
        typeToggleButtonAll.setToolTipText("Deactivate all filters");
        typeToggleButtonAll.setKeepFocus(true);
        typeToggleButtonAll.setMarginLeft(10);
        typeContainer.add(typeToggleButtonAll);
        typeToggleButtonAll.addListener("changeValue", function(e) {
          for(var i=0; i<this.__typeFilter.length; i++){
            this.__typeFilter.setItem(i, e.getData());
          }
          this._searchResult(this.sinput.getValue() || "");
          typeToggleButtonAll.setToolTipText(e.getData() ? "Deactivate all filters" : "Activate all filters");
        }, this);

      sform.add(typeContainer, {row: 1, column: 0, colSpan: 2});

      this.namespaceTextField = new qx.ui.form.TextField().set({
        placeholder : ""
      });

      sform.add(new qx.ui.basic.Label("Namespace filter: "), {row: 2, column: 0});
      sform.add(this.namespaceTextField, {row: 2, column: 1});

      this.namespaceTextField.addListener("keyup", function(e) {
        this._searchResult(this.sinput.getValue() || "");
      }, this);

      this.add(sform);

      // Create the initial data
      var rowData = [];

      // table model
      var tableModel = this._tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "", "Results" ]);
      tableModel.setData(rowData);

      var customModel =
      {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };


      // table
      var table = new qx.ui.table.Table(tableModel, customModel);
      table.setDecorator(null);
      table.setShowCellFocusIndicator(false);
      table.setStatusBarVisible(false);
      table.setColumnVisibilityButtonVisible(false);

      this._selectionModel = table.getSelectionManager().getSelectionModel();

      this._selectionModel.addListener("changeSelection", this._callDetailFrame, this);

      this._table = table;
      // resize behavior
      var tcm = table.getTableColumnModel();
      var resizeBehavior = tcm.getBehavior();
      resizeBehavior.set(0, {width:"0*", minWidth : 42, maxWidth : 100});
      resizeBehavior.set(1, {width:"1*"});


      tcm.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Image(20, 20));


      this.__initresult = true;
      this.__table = table;

      //table.addListener("appear", this.__handleNote, this);

      //table.addListener("disappear", function(e) {
      //  this.__note.hide();
      //}, this);


      this.add(table, {flex : 1})


      // Load index file
      qx.event.Timer.once(this._load, this, 0);

      // Give keyboard focus to the search field
      this.sinput.focus();

      // Submit events
      this.sinput.addListener("keyup", function(e) {
        this._searchResult(this.sinput.getValue() || "");
      }, this);

    },


    /**
     * Execute the search query.
     *
     * @param svalue {String} input value
     */
    _searchResult : function(svalue)
    {
      // Trim search string
      var svalue = qx.lang.String.trim(svalue);

      // Hide the note if text is typed into to search field.
      //      if (svalue.length > 0) {
      //        this.__note.hide();
      //      } else {
      //        this.__note.show();
      //      }

      // If all toggle butons are disabled stop here
      var allFiltersDisabled = true;
      for( var i=0; i<this.__typeFilter.length; i++ )
      {
        if(this.__typeFilter.getItem(i) === true)
        {
          allFiltersDisabled = false;
          break;
        }
      }

      // If empty or too short search string stop here
      if (svalue.length < 3 || allFiltersDisabled)
      {
        // Reset the result list
        if (this.__initresult) {
          this.listdata.splice(0, this.listdata.length);
        }

        this._resetElements();
        return;
      }
      else
      {
        var sresult = [];

        try
        {
          var search = this._validateInput(svalue);
          new RegExp(search[0]);
        }
        catch(ex)
        {
          // Reset the result list
          if (this.__initresult) {
            this.listdata.splice(0, this.listdata.length);
          }

          this._resetElements();
          return;
        }


        sresult = this._searchIndex(search[0], search[1]);
        sresult.sort(this._sortByIcons);

        this._tableModel.setColumns([ "", (sresult.length + " Result" + ((sresult.length != 1) ? "s" : "")) ]);
        this._tableModel.setData(sresult);

        // Clear old selection
        this._table.resetSelection();

      }
    },


    /**
     * Validation
     *
     * @param svalue {String} input value
     */
    _validateInput : function(svalue)
    {
      var validated = [];

      // RegExp matches full pathname (RegExp.$1) and
      // method (RegExp.$2) stated with path#method or path.method()
      // ([\w\.]*\w+) -> RegExp.$1: Matches any alphanumeric character including the dot (.) e.g. "qx.application.basic"
      // (#\w+|\.\w+\(\)|#\.[\*|\+|\?]?)? -> RegExp.$2: Matches a method statement noted with a hash (#meth) or parentheses (.meth())
      if (/^([\w\.]*\w+)(#\w+|\.\w+\(\)|#\.[\*|\+|\?]?)?$/.test(svalue))
      {
        if (RegExp.$2 && RegExp.$2.length > 1) {
          validated = [RegExp.$2, RegExp.$1];
        } else if( RegExp.$1.length > 1) {
          validated = [RegExp.$1, null];
        } else {
          return null;
        }
      }
      else
      {
        validated = [svalue, null];
      }

      return validated;
    },



    /**
     * Sets the output
     *
     * @param svalue {String} input value or 1st RegExp subexpression from _validateInput
     * @param spath {String} matched 2nd subexpression from _validateInput
     */
    _searchIndex : function(svalue, spath) {
      var sresult = [];
      //Match object

      var mo = new RegExp(svalue, (/^.*[A-Z].*$/).test(svalue) ? "" : "i");

      var index = this.apiindex.__index__;
      var fullNames = this.apiindex.__fullNames__;
      var types = this.apiindex.__types__;

      var namespaceFilter = this.namespaceTextField.getValue() != null ? qx.lang.String.trim(this.namespaceTextField.getValue()) : "";
      var namespaceRegexp = new RegExp(".*");
      if(namespaceFilter.length > 0)
      {
        try
        {
          var search = this._validateInput(namespaceFilter);
          namespaceRegexp = new RegExp(search[0], (/^.*[A-Z].*$/).test(search[0]) ? "" : "i");
        }
        catch(ex)
        {
          namespaceRegexp = new RegExp(".*");
        }
      }

      for (var key in index) {
        if (mo.test(key))
        {
          if (spath) {
            for (var i=0, l=index[key].length; i<l; i++) {
              var fullname = fullNames[index[key][i][1]];
              if(namespaceRegexp && namespaceRegexp.test(fullname)) {
                if (new RegExp(spath, "i").test(fullname)) {
                  var elemtype = types[index[key][i][0]].toUpperCase();
                  if(this._isTypeFilteredIn(elemtype)){
                    var icon = apiviewer.TreeUtil["ICON_" + elemtype];
                    sresult.push([icon, fullname + key]);
                  }
                }
              }
            }
          } else {

            for (var i=0, l=index[key].length; i<l; i++) {
              elemtype = types[index[key][i][0]].toUpperCase();
              fullname = fullNames[index[key][i][1]];

              if(this._isTypeFilteredIn(elemtype)){
                if(namespaceRegexp && namespaceRegexp.test(fullname)) {

                  if (elemtype == "CLASS") {
                    icon = apiviewer.TreeUtil.getIconUrl(apiviewer.dao.Class.getClassByName(fullname));
                  } else {
                    if (elemtype != "PACKAGE" && elemtype != "INTERFACE") {  // just consider attribute types
                      fullname += key;
                    }
                    if (elemtype === "ENTRY") {
                      fullname = key.substring(1);
                    }
                    icon = apiviewer.TreeUtil["ICON_" + elemtype];
                  }

                  sresult.push([icon, fullname]);
                }
              }
            }
          }
        }
      }
      return sresult;
    },

    /**
     * Checks whether the type passed as argument is in the filter list or not
     *
     * @param type {String} the type in uppercase
     */
    _isTypeFilteredIn: function(type){
      return this.__typeFilter.getItem(this.__typesIndex[type]);
    },

    /**
     * Set data for the listview
     *
     * @param sresult {Array} search value
     */
    _setListdata : function(sresult)
    {
      sresult.sort(function(a, b)
      {
        if (a[1] < b[1])
        {
          return -1;
        }
        if (a[1] > b[1])
        {
          return 1;
        }
        return 0;
      });
      for (var i=0, l=sresult.length; i<l; i++) {
        var iconDisplay = sresult[i][0];
        var ldicon = {icon:iconDisplay, html:"", iconWidth:18, iconHeight:18};
        this.listdata.push({icon:ldicon, result:{text:sresult[i][1]}});
      }
    },


    /**
     * Sort elements in order of type
     *
     * @param a {String} icon url first argument
     * @param b {String} icon url second argument
     */
    _sortByIcons : function(a, b)
    {
      var icons =
      {
        "package": 0,
        "class_abstract": 1,
        "class": 2,
        "class_singleton": 3,
        "class_static": 4,
        "class_warning": 5,
        "class_static_warning": 6,
        "class_abstract_warning" : 7,
        "class_singleton_warning" : 8,
        "interface":  9,
        "mixin": 10,
        "mixin_warning": 11,
        "method_public": 12,
        "method_protected": 13,
        "method_private": 14,
        "property": 15,
        "property_protected": 16,
        "property_private": 17,
        "event": 18,
        "constructor": 19,
        "constant": 20,
        "childcontrol": 21
      };
      // Get the filename
      var aType = a[0];
      var bType = b[0];
      var iconfile = aType.substr(aType.lastIndexOf("/")+1);
      var iconfileNext = bType.substr(bType.lastIndexOf("/")+1);
      // Map the type to a number
      aType = icons[iconfile.substr(0, iconfile.length-6)];
      bType = icons[iconfileNext.substr(0, iconfileNext.length-6)];

      var diff = aType - bType;
      if(diff==0)
      {
        if (a[1] < b[1])
        {
          return -1;
        }
        if (a[1] > b[1])
        {
          return 1;
        }
        return 0;
      }
      else
      {
        return aType - bType;
      }
    },




    /**
     * Load the api index
     * @lint ignoreDeprecated(eval)
     */
    _load : function()
    {
      var url = "./script/apiindex.json";
      var req = new qx.io.remote.Request(url);

      req.setAsynchronous(true);
      req.setTimeout(30000); // 30 sec
      req.setProhibitCaching(false);
      req.addListener("completed", function(evt) {
        this.apiindex = eval("(" + evt.getContent() + ")");
      }, this);

      req.addListener("failed", function(evt) {
        this.warn("Couldn't load file: " + url);
      }, this);

      req.send();
    },


    /**
     * Display information in the detail frame
     */
    _callDetailFrame : function()
    {
      var sel = this._selectionModel.getAnchorSelectionIndex();
      var selected = this._tableModel.getData()[sel];
      var controller = qx.core.Init.getApplication().controller;
      var uiModel = apiviewer.UiModel.getInstance();

      if (selected != undefined)
      {
        var fullItemName = selected[1];
        var itemType = selected[0];

        var elemType = itemType.substr(itemType.lastIndexOf("/")+1);
        elemType = elemType.substr(0, elemType.length-6);

        // Display protected stated items
        if (/protected/.test(itemType)) {
          uiModel.setShowProtected(true);
        }
        // Display private stated items
        else if (/private/.test(itemType)) {
          uiModel.setShowPrivate(true);
        }
        // Display internal stated items
        else if (/internal/.test(itemType)) {
          uiModel.setShowInternal(true);
        }
        // Highlight item
        if(elemType.indexOf("method")!=-1 || elemType.indexOf("property")!=-1 || elemType.indexOf("event")!=-1 || elemType.indexOf("constant")!=-1 || elemType.indexOf("childcontrol")!=-1)
        {
          controller._updateHistory(fullItemName+'!'+elemType);
        }
        else
        {
          controller._updateHistory(fullItemName);
        }
      }
    },

    _resetElements : function()
    {
      this._tableModel.setData([]);
      this._tableModel.setColumns([ "", ""]);
    },


    __initNote : function(table)
    {
      this.__note = new qx.ui.popup.Popup(new qx.ui.layout.Canvas).set({
        autoHide : false,
        width : 170
      });
      var hintText = this.tr("Hint: You can use regular expressions in the search field.");
      var hint = new qx.ui.basic.Label(hintText);
      hint.setRich(true);
      this.__note.add(hint, {edge : 3});

      this.__note.setPosition("bottom-left");
      this.__note.placeToWidget(this.sinput, false);

      this.__note.show();
    },

    __handleNote : function(e)
    {
      if (this.__note) {
        if (qx.lang.String.trim(this.sinput.getValue() || "").length == 0) {
          this.__note.show();
        }
      } else {
        this.__initNote();
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.apiindex = this._table = this.__table = this._tableModel = this.__typeFilter = this.__typesIndex =
      this._selectionModel = null;
    this._disposeObjects("sinput", "__note");
    this._disposeArray("listdata");
  }
});
