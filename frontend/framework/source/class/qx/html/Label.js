qx.Class.define("qx.html.Label",
{
  extend : qx.html.Element,

  members :
  {
    _useHtml : false,

    setUseHtml : function()
    {
      this._useHtml = true;
      return this;
    },

    getUseHtml : function()
    {
      delete this._useHtml;
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
      this._element = qx.bom.Label.create(this._content, this._useHtml);
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
