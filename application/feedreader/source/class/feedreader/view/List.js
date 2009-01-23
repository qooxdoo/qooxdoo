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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * The list displayes the articles of a feed as a list.
 */
qx.Class.define("feedreader.view.List",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of List.
   */

  construct : function()
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.VBox();
    layout.setSeparator("separator-vertical");
    this._setLayout(layout);

    // Create the header of the list
    var listHeader = new qx.ui.basic.Label(this.tr("Posts"));
    listHeader.setBackgroundColor("background-medium");
    listHeader.setPadding(5);
    listHeader.setAllowGrowX(true);
    listHeader.setFont("bold");
    this._add(listHeader);

    // Create the stack for the list
    this._stack = new qx.ui.container.Stack();
    this._add(this._stack, {flex: 1});

    // create list view
    this._list = new qx.ui.form.List();
    this._list.setDecorator(null);
    this._list.setSelectionMode("single");
    this._stack.add(this._list);

    // Create the loading image for the list
    this._listLoadImage = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, "center"));
    loadImage = new qx.ui.basic.Image("feedreader/images/loading66.gif");
    loadImage.setAlignY("middle");
    this._listLoadImage.add(loadImage);
    this._stack.add(this._listLoadImage);
  },

  
  properties : 
  {
    /** Determinates if the loading image should be shown */
    loading : 
    {
      check : "Boolean",
      init: false,
      apply: "_applyLoading"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyLoading: function(value, old) {
      if (value) {
        this._stack.setSelected(this._listLoadImage);        
      } else {
        this._stack.setSelected(this._list);        
      }
    },
    
    
    /**
     * Returns the list widget used in the list view of the feedreader.
     * 
     * @return {qx.ui.form.List} The used List.
     */
    getList: function() {
      return this._list;
    }
  },



  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */

  destruct : function()
  {
    this._disposeObjects("_list", "_stack", "_listLoadImage");
  }
});
