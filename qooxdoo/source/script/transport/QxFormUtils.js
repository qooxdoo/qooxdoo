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

#package(form)

************************************************************************ */

QxFormUtils = {};

QxFormUtils.ignoreInputTypes = [ "file", "submit", "image", "reset", "button" ];
QxFormUtils.ignoreElementTypes = [ "fieldset" ];
QxFormUtils.checkElementTypes = [ "radio", "checkbox" ];
QxFormUtils.multiSelectType = "select-multiple";

QxFormUtils.inputFilter = function(vNode)
{
  if (vNode.disabled) {
    return false;
  };

  var vTag = (vNode.tagName || QxConst.CORE_EMPTY).toLowerCase();

  if (QxFormUtils.ignoreElementTypes.contains(vTag)) {
    return false;
  };

  var vType = vNode.type.toLowerCase();

  if (QxFormUtils.ignoreInputTypes.contains(vType)) {
    return false;
  };

  if (!vNode.checked && QxFormUtils.checkElementTypes.contains(vType)) {
    return false;
  };

  return true;
};

QxFormUtils.getFields = function(vForm) {
  return Array.filter(QxFormUtils.inputFilter, vForm.elements);
};

QxFormUtils.encodeField = function(vNode)
{
  var vName = vNode.name || QxConst.CORE_EMPTY;
  var vType = (vNode.type || QxConst.CORE_EMPTY).toLowerCase();

  if(vType === QxFormUtils.multiSelectType)
  {
    for(var i=0; i<vNode.options.length; i++)
    {
      if(vNode.options[i].selected) {
        values.push(name + QxConst.CORE_EQUAL + enc(vNode.options[i].value));
      };
    };
  }
  else
  {
    values.push(name + QxConst.CORE_EQUAL + enc(vNode.value));
  };
};

QxFormUtils.encodeForm = function(vForm)
{
  var vFields = QxFormUtils.getFields(vForm);
  var vAll = [];

  for (var i=0, l=vFields.length; i<l; i++) {
    vAll.push(vFields[i]);
  };

  return vAll.join(QxConst.CORE_AMPERSAND);
};
