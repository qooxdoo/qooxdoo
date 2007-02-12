package net.jsunit.configuration;

import junit.framework.TestCase;

public class EnvironmentVariablesConfigurationSourceTest extends TestCase {
    private EnvironmentVariablesConfigurationSource source;

    protected void setUp() throws Exception {
        super.setUp();
        source = new EnvironmentVariablesConfigurationSource();
    }

    public void testSimple() {
        System.setProperty(ConfigurationProperty.BROWSER_FILE_NAMES.getName(), "aaa");
        System.setProperty(ConfigurationProperty.CLOSE_BROWSERS_AFTER_TEST_RUNS.getName(), "bbb");
        System.setProperty(ConfigurationProperty.LOGS_DIRECTORY.getName(), "ddd");
        System.setProperty(ConfigurationProperty.PORT.getName(), "eee");
        System.setProperty(ConfigurationProperty.REMOTE_MACHINE_URLS.getName(), "fff");
        System.setProperty(ConfigurationProperty.RESOURCE_BASE.getName(), "ggg");
        System.setProperty(ConfigurationProperty.TIMEOUT_SECONDS.getName(), "hhh");
        System.setProperty(ConfigurationProperty.URL.getName(), "iii");
        assertEquals("aaa", source.browserFileNames());
        assertEquals("bbb", source.closeBrowsersAfterTestRuns());
        assertEquals("ddd", source.logsDirectory());
        assertEquals("eee", source.port());
        assertEquals("fff", source.remoteMachineURLs());
        assertEquals("ggg", source.resourceBase());
        assertEquals("hhh", source.timeoutSeconds());
        assertEquals("iii", source.url());
    }

    public void tearDown() throws Exception {
        for (ConfigurationProperty property : ConfigurationProperty.values())
            System.getProperties().remove(property.getName());
        super.tearDown();
    }

}