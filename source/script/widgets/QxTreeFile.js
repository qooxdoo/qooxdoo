function QxTreeFile(vLabel, vIconURI)
{
  if (isValid(vIconURI)) {
    this.setIconURI(vIconURI);
  };
  
  QxTreeElement.call(this, vLabel);
};

/*
  -------------------------------------------------------------------------------
    EXTEND
  -------------------------------------------------------------------------------
*/

QxTreeFile.extend(QxTreeElement, "QxTreeFile");



/*
  -------------------------------------------------------------------------------
    PROPERTIES
  -------------------------------------------------------------------------------
*/

QxTreeFile.addProperty({ name : "iconURI", type : String, defaultValue : "icons/16/file.png" });



/*
  -------------------------------------------------------------------------------
    RENDERER
  -------------------------------------------------------------------------------
*/

proto._renderImplIcon = function() {
  if (!this.isCreated()) {
    return true;
  };

  this._iconImage.src = (new QxImageManager).buildURI(this.getIconURI());
  return true;
};