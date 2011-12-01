qx.Class.define("twitter.TweetView",
{
  extend : qx.ui.core.Widget,
  include : [qx.ui.form.MModelProperty],

  construct : function()
  {
    this.base(arguments);

    // create a date format like "June 18, 2010 9:31 AM"
    this._dateFormat = new qx.util.format.DateFormat(
      qx.locale.Date.getDateFormat("long") + " " +
      qx.locale.Date.getTimeFormat("short")
    );

    // initialize the layout and allow wrap for "post"
    var layout = new qx.ui.layout.Grid(4, 2);
    layout.setColumnFlex(1, 1);
    this._setLayout(layout);

    // create the widgets
    this._createChildControl("icon");
    this._createChildControl("time");
    this._createChildControl("post");
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "tweet-view"
    },

    icon :
    {
      check : "String",
      apply : "_applyIcon",
      nullable : true
    },

    time :
    {
      check : "Date",
      apply : "_applyTime",
      nullable : true
    },

    post :
    {
      check : "String",
      apply : "_applyPost",
      nullable : true
    }
  },

  members :
  {
    _dateFormat : null,

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "icon":
          control = new qx.ui.basic.Image(this.getIcon());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 0, rowSpan: 2});
          break;

        case "time":
          control = new qx.ui.basic.Label(this.getTime());
          control.setAnonymous(true);
          this._add(control, {row: 0, column: 1});
          break;

        case "post":
          control = new qx.ui.basic.Label(this.getPost());
          control.setAnonymous(true);
          control.setRich(true);
          this._add(control, {row: 1, column: 1});
          break;
      }

      return control || this.base(arguments, id);
    },

    // property apply
    _applyIcon : function(value, old) {
      var icon = this.getChildControl("icon");
      icon.setSource(value);
    },

    _applyPost : function(value, old)
    {
      var post = this.getChildControl("post");
      post.setValue(value);
    },

    // property apply
    _applyTime : function(value, old)
    {
      var time = this.getChildControl("time");
      time.setValue(this._dateFormat.format(value));
    }
  },

  destruct : function()
  {
    this._dateFormat.dispose();
    this._dateFormat = null;
  }
});
