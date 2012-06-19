/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zündorf (czuendorf)

************************************************************************ */

/**
 * Mobile page responsible for showing the "DataBinding" showcase.
 */
qx.Class.define("mobileshowcase.page.DataBinding",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Data Binding");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");

    this.__timer = new qx.event.Timer(50);
    this.__timer.addListener("interval", this.__onInterval, this);
  },


  /*
  *****************************************************************************
    PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // overridden
    listData :
    {
      init : new qx.data.Array(),
      nullable : true,
      event : "updateListData"
    }
  },


  /*
  *****************************************************************************
    EVENTS
  *****************************************************************************
  */
  events :
  {
    /** The page to show */
    "updateListData" : "qx.event.type.Data"
  },


  members :
  {
    __increaseMode: true,
    __decreaseButton: null,
    __increaseButton: null,
    __stopTimeButton: null,
    __timer: null,
    __form: null,
    __list: null,
    __dataLabel: null,
    __slider: null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.__form = this.__createSliderDataBindings();
      this.__list = this.__createListDataBindings();
      this.__list.setVisibility("hidden");

      this.__increaseButton = new qx.ui.mobile.form.Button("+");
      this.__increaseButton.addListener("touchstart", this.__onIncrease, this);
      this.__increaseButton.addListener("touchend", this.__onTouchEnd, this);

      this.__decreaseButton = new qx.ui.mobile.form.Button("-");
      this.__decreaseButton.addListener("touchstart", this.__onDecrease, this);
      this.__decreaseButton.addListener("touchend", this.__onTouchEnd, this);

      this.__stopTimeButton = new qx.ui.mobile.form.Button("Stop Current Time");
      this.__stopTimeButton.addListener("tap", this.__onStopTimeButtonTap, this);

      // Slider Data Binding
      this.getContent().add(new qx.ui.mobile.form.Title("Slider Data Binding"));
      this.getContent().add(new qx.ui.mobile.form.renderer.Single(this.__form));
      this.getContent().add(this.__increaseButton);
      this.getContent().add(this.__decreaseButton);

      // List Data Binding
      this.getContent().add(new qx.ui.mobile.form.Title("List Data Binding"));
      this.getContent().add(this.__stopTimeButton);
      this.getContent().add(new qx.ui.mobile.form.Title(" "));
      this.getContent().add(this.__list);

    },


    /**
     * Reacts on tap of Stop time button.
     */
    __onStopTimeButtonTap : function ()
    {
      var now = new Date();
      var date = now.toLocaleTimeString();

      this.getListData().push(date);

      this.__list.setVisibility("visible");
    },


    /**
      * Called on interval event of timer.
      */
    __onInterval : function()
    {
        var old = parseInt(this.__dataLabel.getValue(),10);
        if(this.__increaseMode) {
          if (old<100) {
            this.__dataLabel.setValue(old+1);
          } else {
            this.__timer.stop();
          }
        } else{
          if (old>0) {
            this.__dataLabel.setValue(old-1);
          } else {
            this.__timer.stop();
          }
        }
    },


    /**
     * Called on interval event of timer.
     */
    __onTouchEnd : function () {
      this.__timer.stop();
    },


    /**
     * Called on button increase touchstart.
     */
    __onIncrease : function()
    {
      this.__increaseMode = true;
      this.__timer.start();
    },


    /**
     *  Called on button decrease touchstart.
     */
    __onDecrease : function()
    {
      this.__increaseMode = false;
      this.__timer.start();
    },


    /**
     * Creates the slider and slider value label and binds vice-versa.
     */
    __createSliderDataBindings : function()
    {
      var form = new qx.ui.mobile.form.Form();
      this.__slider = new qx.ui.mobile.form.Slider();
      form.add(this.__slider,"Move slider:");

      this.__dataLabel = new qx.ui.mobile.form.TextField();
      this.__dataLabel.setValue("0");
      this.__dataLabel.setReadOnly(true);
      form.add(this.__dataLabel, " Slider value: ");

      this.__dataLabel.bind("value", this.__slider, "value");
      this.__slider.bind("value", this.__dataLabel, "value");

      return form;
    },



    /**
     * Creates a list and returns it.
     */
    __createListDataBindings : function() {
      var list = new qx.ui.mobile.list.List({
      configureItem : function(item, data, row)
        {
          if(!row){
            row = 1;
          }else {
            row++;
          }
          item.setTitle("Stop #"+row);
          item.setSubtitle(data);
        }
      });
      this.bind("listData", list, "model");

      return list;
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    },


    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function() {
      this._disposeObjects("__increaseMode", "__decreaseButton",
        "__increaseButton", "__stopTimeButton", "__timer", "__dataLabel",
        "__slider", "__form", "__list");
    }
  }
});