function QxHorizontalBoxLayout(vBlockAlign, vChildrenAlign) {
  QxBoxLayout.call( this, "horizontal", vBlockAlign, vChildrenAlign);
};

QxHorizontalBoxLayout.extend(QxBoxLayout, "QxHorizontalBoxLayout");

proto._checkOrientation = function(propValue, propOldValue, propName, uniqModIds) 
{
  if (propValue != "horizontal") {
    throw new Error("Orientation is not configurable in QxHorizontalBoxLayout!");
  };
  
  return propValue;
};
