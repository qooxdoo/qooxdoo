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

#package(listview)

************************************************************************ */

function QxListViewContentCellLink(vHtml) 
{
  QxLink.call(this, vHtml);

  // selectable = false will break links in gecko based browsers  
  this.setSelectable(true);
};

QxListViewContentCellLink.extend(QxLink, "QxListViewContentCellLink");

QxListViewContentCellLink.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list-view-content-cell-link" });

QxListViewContentCellLink.empty = 
{
  html : QxConst.CORE_EMPTY,
  uri : QxConst.CORE_HASH
};
