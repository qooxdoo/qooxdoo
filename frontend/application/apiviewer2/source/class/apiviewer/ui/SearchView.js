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
     * Jonathan Rass (jonathan_rass)

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
    this.setLayout(new qx.ui.layout.VBox)

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

    /**
     * Generate the search form.
     */
    _showSearchForm : function()
    {

      //--------------------------------------------------------
      // Outputs the generated index file content to a textarea
      //--------------------------------------------------------

      // Search form
      //var sform = new qx.legacy.ui.layout.HorizontalBoxLayout;
      var layout = new qx.ui.layout.HBox(4);
      var sform = new qx.ui.container.Composite(layout);

      // Search form - input field
      this.sinput = new qx.ui.form.TextField();
      ///this.sinput.setValue("Search is disabled.");

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

      table.setShowCellFocusIndicator(false);
      table.setStatusBarVisible(false);
      table.setColumnVisibilityButtonVisible(false);

      table.addListener("cellClick", this._onCellClick, this);
      table.addListener("cellDblClick", this._onCellClick, this);
      
      this._table = table;
      // resize behavior
      var tcm = table.getTableColumnModel();
      var resizeBehavior = tcm.getBehavior();
      resizeBehavior.set(0, {width:"0*", minWidth : 30, maxWidth : 30});
      resizeBehavior.set(1, {width:"1*"});

      
      table.exclude();

      var tcm = table.getTableColumnModel();

      tcm.setDataCellRenderer(0, new qx.ui.table.cellrenderer.Image());

      this.__initresult = true;

      this.add(table, {flex : 1})
      
      
      // Load index file
      qx.event.Timer.once(this._load, this, 0);

      // Give keyboard focus to the search field
      this.sinput.focus();

      // Submit events
      this.sinput.addListener("keypress", function(e) {
        this._searchResult(this.sinput.getValue());
      }, this);

      this.__button.addListener("execute", function(e) {
        this._searchResult(this.sinput.getValue());
      }, this);

    },


    /**
     * Execute the search query.
     *
     * @type member
     * @param svalue {String} input value
     */
    _searchResult : function(svalue)
    {
      var searchStart = new Date();

      // Trim search string
      var svalue = qx.lang.String.trim(svalue);

      // If empty or too short search string stop here
      if (svalue.length < 2)
      {
        // Reset the result list
        if (this.__initresult) {
          this.listdata.splice(0, this.listdata.length);
        }
        this.sinput.resetBackgroundColor();
        this.__button.setEnabled(false);
        return;
      }
      else
      {
        var sresult = [];

        try
        {
            var search = this._validateInput(svalue);
            new RegExp(search[0]);
            this.sinput.resetBackgroundColor();
            this.__button.setEnabled(true);
        }
        catch(ex)
        {
          // Reset the result list
          if (this.__initresult) {
            this.listdata.splice(0, this.listdata.length);
            this._table.updateContent();
          }

          this.sinput.setBackgroundColor("#ffbfbc");
          this.__button.setEnabled(false);
          return;
        }


       sresult = this._searchIndex(search[0], search[1]);

       // TODO: this should be working soon
       //this._tableModel.setColumnName(1, (results + " Results (" + duration + " s)"));
       this._tableModel.setData(sresult);

       this._table.show();

        var searchEnd = new Date();
        var results = sresult.length;
        var duration = (searchEnd.getTime() - searchStart.getTime())/1000; //seconds
      }
    },


    /**
     * Validation
     *
     * @type member
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
     * @type member
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
          for (var i=0, l=index[key].length; i<l; i++) {
            var elemtype = types[index[key][i][0]].toUpperCase();
            if (spath) {
              var fullname = fullNames[index[key][i][1]];
              if (new RegExp(spath, "i").test(fullname)) {
                var icon = apiviewer.TreeUtil["ICON_" + elemtype];
                sresult.push([icon, fullname + key]);
              }
            } else {
              var icon = apiviewer.TreeUtil["ICON_" + elemtype];
              var addKey = "";
              if (elemtype != "PACKAGE" && elemtype != "CLASS" && elemtype != "INTERFACE" && elemtype != "MIXIN") {
                addKey = key;
              }
              var fullname = fullNames[index[key][i][1]] + addKey;
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
     * @type member
     * @param sresult {Array} search value
     */
    _setListdata : function(sresult)
    {
      sresult.sort(function(a, b)
      {
          if (a[1] < b[1])
             return -1;
          if (a[1] > b[1])
             return 1;
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
     * @type member
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
      var loadStart = new Date();

      var url = "./script/apiindex.js";
      var req = new qx.io.remote.Request(url);

      req.setAsynchronous(true);
      req.setTimeout(30000); // 30 sec
      req.setProhibitCaching(false);
      req.addListener("completed", function(evt) {
        this.apiindex = eval("(" + evt.getContent() + ")");
        var loadEnd = new Date();
        this.debug("Time to load api indexfile from server: " + (loadEnd.getTime() - loadStart.getTime()) + "ms");
      }, this);

      req.addListener("failed", function(evt) {
        alert("Couldn't load file: " + url);
      }, this);

      req.send();
    },


    /**
     * Display information in the detail frame
     *
     * @type member
     * @param sel {SelectionManager} selected item
     */
    _callDetailFrame : function(sel)
    {
        var fullItemName = sel.getSelectedItems()[0].result.text;
        var itemType = sel.getSelectedItems()[0].icon.icon;

        var className = fullItemName;
        var itemName = null;
        var hashPos = fullItemName.indexOf("#");

        if (hashPos != -1)
        {
          className = fullItemName.substring(0, hashPos);
          itemName = fullItemName.substring(hashPos + 1);
        }

        var controller = qx.core.Init.getApplication().controller;
        var classViewer = controller._classViewer;

        // Display protected stated items
        if (/protected/.test(itemType))
        {
          var btn_protected = controller._widgetRegistry.getWidgetById("btn_protected");
          if (btn_protected.getChecked() === false) {
            btn_protected.setChecked(true);
            classViewer.setShowProtected(true);
          }
        }
        // Display private stated items
        else if (/private/.test(itemType))
        {
          var btn_private = controller._widgetRegistry.getWidgetById("btn_private");
          if (btn_private.getChecked() === false) {
            btn_private.setChecked(true);
            classViewer.setShowPrivate(true);
          }
        }

        // Highlight item
        controller.__selectClass(apiviewer.dao.Class.getClassByName(className), function()
        {
          if (itemName) {
            if (!classViewer.showItem(itemName))
            {
              controller.error("Unknown item of class '"+ className +"': " + itemName);
              alert("Unknown item of class '"+ className +"': " + itemName);
              return;
            }
          } else {
            classViewer.setScrollTop(0);
          }
          controller.__updateHistory(fullItemName);

        }, controller);
    },
    
    _onCellClick : function(e)
    {
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
    this._disposeObjects("sinput", "__button");
  }
});
