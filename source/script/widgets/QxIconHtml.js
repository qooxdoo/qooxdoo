/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(simpleterminators)

************************************************************************ */

function QxIconHtml(vHtml, vIcon, vIconWidth, vIconHeight)
{
  QxHtml.call(this, vHtml);

  if (typeof vIcon != QxConst.TYPEOF_UNDEFINED)
  {
    this.setIcon(vIcon);

    if (typeof vIconWidth != QxConst.TYPEOF_UNDEFINED) {
      this.setIconWidth(vIconWidth);
    };

    if (typeof vIconHeight != QxConst.TYPEOF_UNDEFINED) {
      this.setIconHeight(vIconWidth);
    };
  };
};

QxIconHtml.extend(QxHtml, "QxIconHtml");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  Any URI String supported by QxImage to display a icon
*/
QxIconHtml.addProperty({ name : "icon", type : QxConst.TYPEOF_STRING, impl : "html" });

/*!
  The width of the icon.
  If configured, this makes QxIconHtml a little bit faster as it does not need to wait until the image loading is finished.
*/
QxIconHtml.addProperty({ name : "iconWidth", type : QxConst.TYPEOF_NUMBER, impl : "html" });

/*!
  The height of the icon
  If configured, this makes QxIconHtml a little bit faster as it does not need to wait until the image loading is finished.
*/
QxIconHtml.addProperty({ name : "iconHeight", type : QxConst.TYPEOF_NUMBER, impl : "html" });

/*!
  Space in pixels between the icon and the HTML.
*/
QxIconHtml.addProperty({ name : "spacing", type : QxConst.TYPEOF_NUMBER, defaultValue : 4, impl : "html" });





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

QxIconHtml.START_IMAGE = "<img src=\"";
QxIconHtml.START_STYLE = "\" style=\"vertical-align:middle;";
QxIconHtml.STYLE_MARGIN = "margin-right:";
QxIconHtml.STYLE_WIDTH = "width:";
QxIconHtml.STYLE_HEIGHT = "height:";
QxIconHtml.PIXEL_UNIT = "px;";
QxIconHtml.FILTER_START = "filter:";
QxIconHtml.STOP_IMAGE = "\"/>";

proto._mshtml = QxClient.isMshtml();

proto._syncHtml = function()
{
  var vHtml = [];

  if (QxUtil.isValidString(this.getIcon()))
  {
    vHtml.push(QxIconHtml.START_IMAGE);
    vHtml.push(QxImageManager.buildUri(this._mshtml ? QxConst.IMAGE_BLANK : this.getIcon()));
    vHtml.push(QxIconHtml.START_STYLE);

    if (QxUtil.isValidNumber(this.getSpacing()))
    {
      vHtml.push(QxIconHtml.STYLE_MARGIN);
      vHtml.push(this.getSpacing());
      vHtml.push(QxIconHtml.PIXEL_UNIT);
    };

    if (QxUtil.isValidNumber(this.getIconWidth()))
    {
      vHtml.push(QxIconHtml.STYLE_WIDTH);
      vHtml.push(this.getIconWidth());
      vHtml.push(QxIconHtml.PIXEL_UNIT);
    };

    if (QxUtil.isValidNumber(this.getIconHeight()))
    {
      vHtml.push(QxIconHtml.STYLE_HEIGHT);
      vHtml.push(this.getIconHeight());
      vHtml.push(QxIconHtml.PIXEL_UNIT);
    };

    if (this._mshtml)
    {
      vHtml.push(QxIconHtml.FILTER_START);
      vHtml.push(QxImage.IMGLOADER_START);
      vHtml.push(QxImageManager.buildUri(this.getIcon()));
      vHtml.push(QxImage.IMGLOADER_STOP);
      vHtml.push(QxConst.CORE_SEMICOLON);
    };

    vHtml.push(QxIconHtml.STOP_IMAGE);
  };

  if (QxUtil.isValidString(this.getHtml())) {
    vHtml.push(this.getHtml());
  };

  this.getElement().innerHTML = vHtml.join(QxConst.CORE_EMPTY);
};