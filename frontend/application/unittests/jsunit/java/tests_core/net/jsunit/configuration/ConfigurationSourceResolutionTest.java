package net.jsunit.configuration;

import junit.framework.TestCase;
import net.jsunit.utility.FileUtility;

import java.io.File;

public class ConfigurationSourceResolutionTest extends TestCase {

    public void testResolveArgumentsConfiguration() {
        ConfigurationSource source = Configuration.resolveSource(new String[]{"-url", "foo"});
        assertEquals("foo", source.url());
    }

    public void testResolveEnvironmentVariablesConfiguration() {
        System.setProperty(ConfigurationProperty.URL.getName(), "http://localhost:8080/");
        ConfigurationSource source = Configuration.resolveSource(new String[]{});
        assertEquals("http://localhost:8080/", source.url());
    }

    public void testResolvePropertiesConfiguration() {
        writePropertiesFile(PropertiesFileConfigurationSource.PROPERTIES_FILE_NAME,
                            ConfigurationProperty.BROWSER_FILE_NAMES.getName() + "=aaa");
        ConfigurationSource source = Configuration.resolveSource(new String[]{});
        assertEquals("aaa", source.browserFileNames());
    }

    private void writePropertiesFile(String fileName, String contents) {
        FileUtility.write(new File(fileName), contents);
    }

    protected void tearDown() throws Exception {
        System.getProperties().remove(ConfigurationProperty.URL.getName());
        FileUtility.delete(new File(PropertiesFileConfigurationSource.PROPERTIES_FILE_NAME));
        super.tearDown();
    }

}
