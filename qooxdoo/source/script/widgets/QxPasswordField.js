function QxPasswordField(sText)
{
  QxTextField.call(this, sText);
  
  this.setHtmlProperty("type", "password");
};

QxPasswordField.extend(QxTextField, "QxPasswordField");
