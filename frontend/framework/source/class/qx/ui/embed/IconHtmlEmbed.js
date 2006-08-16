/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

qx.OO.defineClass("qx.ui.embed.IconHtmlEmbed", qx.ui.embed.HtmlEmbed,
function(vHtml, vIcon, vIconWidth, vIconHeight)
{
  qx.ui.embed.HtmlEmbed.call(this, vHtml);

  if (typeof vIcon != qx.constant.Type.UNDEFINED)
  {
    this.setIcon(vIcon);

    if (typeof vIconWidth != qx.constant.Type.UNDEFINED) {
      this.setIconWidth(vIconWidth);
    }

    if (typeof vIconHeight != qx.constant.Type.UNDEFINED) {
      this.setIconHeight(vIconWidth);
    }
  }
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any URI String supported by qx.ui.basic.Image to display a icon
*/
qx.OO.addProperty({ name : "icon", type : qx.constant.Type.STRING, impl : "html" });

/*!
  The width of the icon.
  If configured, this makes qx.ui.embed.IconHtmlEmbed a little bit faster as it does not need to wait until the image loading is finished.
*/
qx.OO.addProperty({ name : "iconWidth", type : qx.constant.Type.NUMBER, impl : "html" });

/*!
  The height of the icon
  If configured, this makes qx.ui.embed.IconHtmlEmbed a little bit faster as it does not need to wait until the image loading is finished.
*/
qx.OO.addProperty({ name : "iconHeight", type : qx.constant.Type.NUMBER, impl : "html" });

/*!
  Space in pixels between the icon and the HTML.
*/
qx.OO.addProperty({ name : "spacing", type : qx.constant.Type.NUMBER, defaultValue : 4, impl : "html" });





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.ui.embed.IconHtmlEmbed.START_IMAGE = "<img src=\"";
qx.ui.embed.IconHtmlEmbed.START_STYLE = "\" style=\"vertical-align:middle;";
qx.ui.embed.IconHtmlEmbed.STYLE_MARGIN = "margin-right:";
qx.ui.embed.IconHtmlEmbed.STYLE_WIDTH = "width:";
qx.ui.embed.IconHtmlEmbed.STYLE_HEIGHT = "height:";
qx.ui.embed.IconHtmlEmbed.PIXEL_UNIT = "px;";
qx.ui.embed.IconHtmlEmbed.FILTER_START = "filter:";
qx.ui.embed.IconHtmlEmbed.STOP_IMAGE = "\"/>";

qx.Proto._mshtml = qx.sys.Client.getInstance().isMshtml();

qx.Proto._syncHtml = function()
{
  var vHtml = [];

  if (qx.util.Validation.isValidString(this.getIcon()))
  {
    vHtml.push(qx.ui.embed.IconHtmlEmbed.START_IMAGE);
    vHtml.push(qx.manager.object.AliasManager.getInstance().resolvePath(this._mshtml ? "static/image/blank.gif" : this.getIcon()));
    vHtml.push(qx.ui.embed.IconHtmlEmbed.START_STYLE);

    if (qx.util.Validation.isValidNumber(this.getSpacing()))
    {
      vHtml.push(qx.ui.embed.IconHtmlEmbed.STYLE_MARGIN);
      vHtml.push(this.getSpacing());
      vHtml.push(qx.ui.embed.IconHtmlEmbed.PIXEL_UNIT);
    }

    if (qx.util.Validation.isValidNumber(this.getIconWidth()))
    {
      vHtml.push(qx.ui.embed.IconHtmlEmbed.STYLE_WIDTH);
      vHtml.push(this.getIconWidth());
      vHtml.push(qx.ui.embed.IconHtmlEmbed.PIXEL_UNIT);
    }

    if (qx.util.Validation.isValidNumber(this.getIconHeight()))
    {
      vHtml.push(qx.ui.embed.IconHtmlEmbed.STYLE_HEIGHT);
      vHtml.push(this.getIconHeight());
      vHtml.push(qx.ui.embed.IconHtmlEmbed.PIXEL_UNIT);
    }

    if (this._mshtml)
    {
      vHtml.push(qx.ui.embed.IconHtmlEmbed.FILTER_START);
      vHtml.push(qx.ui.basic.Image.IMGLOADER_START);
      vHtml.push(qx.manager.object.AliasManager.getInstance().resolvePath(this.getIcon()));
      vHtml.push(qx.ui.basic.Image.IMGLOADER_STOP);
      vHtml.push(qx.constant.Core.SEMICOLON);
    }

    vHtml.push(qx.ui.embed.IconHtmlEmbed.STOP_IMAGE);
  }

  if (qx.util.Validation.isValidString(this.getHtml())) {
    vHtml.push(this.getHtml());
  }

  this.getElement().innerHTML = vHtml.join(qx.constant.Core.EMPTY);
}
