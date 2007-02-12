package net.jsunit.configuration;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.util.Properties;

public class PropertiesFileConfigurationSource implements ConfigurationSource {

    public static final String PROPERTIES_FILE_NAME = "jsunit.properties";

    private Properties properties;
    private String propertiesFileName;

    public PropertiesFileConfigurationSource(String propertiesFileName) throws FileNotFoundException {
        this.propertiesFileName = propertiesFileName;
        loadProperties();
    }

    public PropertiesFileConfigurationSource() throws FileNotFoundException {
        this(PROPERTIES_FILE_NAME);
    }

    private void loadProperties() throws FileNotFoundException {
        properties = new Properties();
        try {
            FileInputStream fileInputStream = new FileInputStream(propertiesFileName);
            properties.load(fileInputStream);
            fileInputStream.close();
        } catch (FileNotFoundException e) {
            throw e;
        } catch (Throwable t) {
            throw new RuntimeException(t);
        }
    }

    private String propertyValue(ConfigurationProperty property) {
        return properties.getProperty(property.getName());
    }

    public String resourceBase() {
        return propertyValue(ConfigurationProperty.RESOURCE_BASE);
    }

    public String logsDirectory() {
        return propertyValue(ConfigurationProperty.LOGS_DIRECTORY);
    }

    public String port() {
        return propertyValue(ConfigurationProperty.PORT);
    }

    public String remoteMachineURLs() {
        return propertyValue(ConfigurationProperty.REMOTE_MACHINE_URLS);
    }

    public String url() {
        return propertyValue(ConfigurationProperty.URL);
    }

    public String ignoreUnresponsiveRemoteMachines() {
        return propertyValue(ConfigurationProperty.IGNORE_UNRESPONSIVE_REMOTE_MACHINES);
    }

    public String browserFileNames() {
        return propertyValue(ConfigurationProperty.BROWSER_FILE_NAMES);
    }

    public String closeBrowsersAfterTestRuns() {
        return propertyValue(ConfigurationProperty.CLOSE_BROWSERS_AFTER_TEST_RUNS);
    }

    public String description() {
        return propertyValue(ConfigurationProperty.DESCRIPTION);
    }

    public String timeoutSeconds() {
        return propertyValue(ConfigurationProperty.TIMEOUT_SECONDS);
    }

}