qx.Class.define("qx.html.Label",
{
  extend : qx.html.Element,

  members :
  {
    setHtmlMode : function(value)
    {
      if (!!this._htmlMode == value) {
        return;
      }

      if (this._element) {
        throw new Error("The label HTML mode cannot be modified after initial creation");
      }

      this._htmlMode = value;
      return this;
    },

    setContent : function(value)
    {
      this._content = value;
      this._contentChanged = true;
      return this;
    },

    getContent : function()
    {
      return this._content;
      return this;
    },

    /**
     * Internal helper to generate the DOM element
     *
     * @type member
     */
    _createDomElement : function()
    {
      this._element = qx.bom.Label.create(this._content, this._htmlMode);
      this._element.QxElement = this;
    },


    _copyData : function()
    {
      this.base(arguments);

      if (this._contentChanged)
      {
        qx.bom.Label.setContent(this._element, this._content);
        delete this._contentChanged;
      }
    },

    _syncData : function()
    {
      this.base(arguments);

      if (this._contentChanged)
      {
        qx.bom.Label.setContent(this._element, this._content);
        delete this._contentChanged;
      }
    }
  }
});
