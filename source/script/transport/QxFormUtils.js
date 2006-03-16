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

  if(vType == "select-multiple")
  {
    for(var j = 0; j < vNode.options.length; j++)
    {
      if(vNode.options[j].selected) {
        values.push(name + "=" + enc(vNode.options[j].value));
      };
    };
  }
  else if(QxFormUtils.checkElementTypes.contains(vType))
  {
    if(vNode.checked){
      values.push(name + "=" + enc(vNode.value));
    };
  }
  else
  {
    values.push(name + "=" + enc(vNode.value));
  };
};
