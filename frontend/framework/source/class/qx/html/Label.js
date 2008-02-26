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
     * Sebastian Werner (wpbasti)

************************************************************************ */

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

    // overridden
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
