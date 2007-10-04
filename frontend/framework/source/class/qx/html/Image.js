qx.Class.define("qx.html.Image",
{
  extend : qx.html.Element,

  members :
  {
    setSource : function(value)
    {
      this._source = value;
      this._sourceChanged = true;
      return this;
    },

    getSource : function()
    {
      return this._source;
      return this;
    },


    /**
     * Internal helper to generate the DOM element
     *
     * @type member
     */
    _createDomElement : function()
    {
      this._element = qx.bom.Image.create(this._source);
      this._element.QxElement = this;
    },


    _copyData : function()
    {
      this.base(arguments);

      if (this._sourceChanged)
      {
        qx.bom.Image.setSource(this._element, this._source);
        delete this._sourceChanged;
      }
    },

    _syncData : function()
    {
      this.base(arguments);

      if (this._sourceChanged)
      {
        qx.bom.Image.setSource(this._element, this._source);
        delete this._sourceChanged;
      }
    }
  }
});
