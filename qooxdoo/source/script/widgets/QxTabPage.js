function QxTabPage(vTab)
{
  QxWidget.call(this);

  this.setLeft(10);
  this.setRight(10);
  this.setBottom(10);
  this.setTop(10);

  if (isValid(vTab)) {
    this.setTab(vTab);
  };
};

QxTabPage.extend(QxWidget, "QxTabPage");


/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxTabPage.addProperty({ name : "tab", type : Object });




/*
  -------------------------------------------------------------------------------
    MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyTab = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setPage(null, uniqModIds);
  };

  if (propValue) {
    propValue.setPage(this, uniqModIds);
  };

  return true;
};



/*
  -------------------------------------------------------------------------------
    OVERWRITE WIDGET LOGIC
  -------------------------------------------------------------------------------
*/

proto._shouldBecomeCreated = function() 
{
  var vTab = this.getTab();
  return vTab ? vTab.getChecked() : false;  
};