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
    layout.setSeparator("separator-vertical");
    this.setLayout(layout);

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
    __button : null,
    __initresult : null,
    __table : null,

    /**
     * Generate the search form.
     */
    _showSearchForm : function()
    {

      //--------------------------------------------------------
      // Outputs the generated index file content to a textarea
      //--------------------------------------------------------

      // Search form
      var layout = new qx.ui.layout.HBox(4);
      var sform = new qx.ui.container.Composite(layout);
      sform.setPadding(10);

      // Search form - input field
      this.sinput = new qx.ui.form.TextField().set({
        allowGrowY: true,
        placeholder : "Search..."
      });

      // Search form - submit button
      this.__button = new qx.ui.form.Button("Find");
      this.__button.setEnabled(false);

      sform.add(this.sinput, {
        flex : 1
      });
      sform.add(this.__button);

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
      table.addListener("cellClick", this._onCellClick, this);

      this._table = table;
      // resize behavior
      var tcm = table.getTableColumnModel();
      var resizeBehavior = tcm.getBehavior();
      resizeBehavior.set(0, {width:"0*", minWidth : 42, maxWidth : 100});
      resizeBehavior.set(1, {width:"1*"});


      var tcm = table.getTableColumnModel();
      tcm.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Image());


      this.__initresult = true;
      this.__table = table;

      table.addListener("appear", this.__handleNote, this);

      table.addListener("disappear", function(e) {
        this.__note.hide();
      }, this);


      this.add(table, {flex : 1})


      // Load index file
      qx.event.Timer.once(this._load, this, 0);

      // Give keyboard focus to the search field
      this.sinput.focus();

      // Submit events
      this.sinput.addListener("keyup", function(e) {
        this._searchResult(this.sinput.getValue() || "");
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
      if (svalue.length > 0) {
        this.__note.hide();
      } else {
        this.__note.show();
      }

      // If empty or too short search string stop here
      if (svalue.length < 3)
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
          this.__button.setEnabled(true);
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

      for (var key in index) {
        if (mo.test(key))
        {
          if (spath) {
            for (var i=0, l=index[key].length; i<l; i++) {
              var fullname = fullNames[index[key][i][1]];
              if (new RegExp(spath, "i").test(fullname)) {
                var elemtype = types[index[key][i][0]].toUpperCase();
                var icon = apiviewer.TreeUtil["ICON_" + elemtype];
                sresult.push([icon, fullname + key]);
              }
            }
          } else {

            for (var i=0, l=index[key].length; i<l; i++) {
              elemtype = types[index[key][i][0]].toUpperCase();
              fullname = fullNames[index[key][i][1]];

              if (elemtype == "CLASS") {
                icon = apiviewer.TreeUtil.getIconUrl(apiviewer.dao.Class.getClassByName(fullname));
              } else {
                if (elemtype != "PACKAGE" && elemtype != "INTERFACE") {  // just consider attribute types
                  fullname += key;
                }
                icon = apiviewer.TreeUtil["ICON_" + elemtype];
              }

              sresult.push([icon, fullname]);
            }
          }
        }
      }
      return sresult;
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
        "package":0,
        "class":1,
        "interface":2,
        "mixin":3,
        "method_public":4,
        "method_protected":5,
        "method_private":6,
        "property":7,
        "property_protected":8,
        "property_private":9,
        "event":10,
        "constructor":11,
        "constant":12
      };
      // Get the filename
      var iconfile = a.substr(a.lastIndexOf("/")+1);
      var iconfileNext = b.substr(b.lastIndexOf("/")+1);
      // Map the type to a number
      a = icons[iconfile.substr(0, iconfile.length-6)];
      b = icons[iconfileNext.substr(0, iconfileNext.length-6)];

      return a - b;
    },




    /**
     * Load the api index
     */
    _load : function()
    {
      var url = "./script/apiindex.js";
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
      var classViewer = controller._classViewer;

      if (selected != undefined)
      {
        var fullItemName = selected[1];
        var itemType = selected[0];

        var className = fullItemName;
        var itemName = null;
        var hashPos = fullItemName.indexOf("#");

        if (hashPos != -1)
        {
          className = fullItemName.substring(0, hashPos);
          itemName = fullItemName.substring(hashPos + 1);
        }

        // Display protected stated items
        if (/protected/.test(itemType)) {
          uiModel.setShowProtected(true);
        }
        // Display private stated items
        else if (/private/.test(itemType)) {
          uiModel.setShowPrivate(true);
        }

        // Highlight item

        /**
         * TODOC
         * @lint ignoreDeprecated(alert)
         */
        controller._selectClass(apiviewer.dao.Class.getClassByName(className), function()
        {
          if (itemName) {
            if (!classViewer.showItem(itemName))
            {
              controller.error("Unknown item of class '"+ className +"': " + itemName);
              alert("Unknown item of class '"+ className +"': " + itemName);
              return;
            }
          } else {
            classViewer.getContainerElement().scrollToY(0);
          }
          controller._updateHistory(fullItemName);

        }, controller);
      }
    },

    /**
     * Event listener for mouse clicks on search result table cells.
     * @param e {qx.event.type.Mouse} Click event
     */
    _onCellClick : function(e) {
      this._callDetailFrame();
    },

    _resetElements : function()
    {
      this._tableModel.setData([]);
      this._tableModel.setColumns([ "", ""]);
      this.__button.setEnabled(false);
    },


    __initNote : function(table)
    {
      this.__note = new qx.ui.popup.Popup(new qx.ui.layout.Canvas).set({
        autoHide : false,
        width : 170,
        offsetTop : 10
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
        if (qx.lang.String.trim(this.sinput.getValue() || "").length == 0) {
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
    this.apiindex = this._table = this.__table = this._tableModel =
      this._selectionModel = null;
    this._disposeObjects("sinput", "__button", "__note");
    this._disposeArray("listdata");
  }
});
