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
  return Array.filter(vForm.elements, QxFormUtils.inputFilter);
};

QxFormUtils.encodeField = function(vNode)
{
  var vName = vNode.name || QxConst.CORE_EMPTY;
  var vType = (vNode.type || QxConst.CORE_EMPTY).toLowerCase();

  if(vType === QxFormUtils.multiSelectType)
  {
    var vValues = [];

    for(var i=0; i<vNode.options.length; i++)
    {
      if(vNode.options[i].selected) {
        vValues.push(vName + QxConst.CORE_EQUAL + vNode.options[i].value);
      };
    };

    return vValues.join(QxConst.CORE_AMPERSAND);
  }
  else
  {
    return vName + QxConst.CORE_EQUAL + vNode.value;
  };
};

QxFormUtils.encodeForm = function(vForm)
{
  var vFields = QxFormUtils.getFields(vForm);
  var vAll = [];

  for (var i=0, l=vFields.length; i<l; i++) {
    vAll.push(QxFormUtils.encodeField(vFields[i]));
  };

  return vAll.join(QxConst.CORE_AMPERSAND);
};

QxFormUtils.bind = function(vForm, vMethod)
{
  QxDom.addEventListener(vForm, QxConst.EVENT_TYPE_SUBMIT, function(e)
  {
    e.returnValue = false;

    if (typeof e.preventDefault === QxConst.TYPEOF_FUNCTION) {
      e.preventDefault();
    };

    return vMethod(e);
  });
};
