package net.jsunit.configuration;

public class ConfigurationException extends RuntimeException {
    private ConfigurationProperty propertyInError;
    private String invalidValue;

    public ConfigurationException(ConfigurationProperty property, String invalidValue) {
        this.propertyInError = property;
        this.invalidValue = invalidValue;
    }

    public ConfigurationException(ConfigurationProperty property, String invalidValue, Exception exception) {
        super(exception);
        this.propertyInError = property;
        this.invalidValue = invalidValue;
    }

    public ConfigurationProperty getPropertyInError() {
        return propertyInError;
    }

    public String getInvalidValue() {
        return invalidValue;
    }

    public String toString() {
        StringBuffer result = new StringBuffer();
        result.append("Invalid property ");
        result.append(propertyInError.getName());
        result.append(" - \"");
        result.append(invalidValue);
        result.append("\"");
        return result.toString();
    }

}
