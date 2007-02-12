package net.jsunit;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ConfigurationSource;
import net.jsunit.configuration.DelegatingConfigurationSource;
import net.jsunit.model.Browser;
import net.jsunit.model.TestRunResult;
import net.jsunit.utility.XmlUtility;

public class StandaloneTest extends TestCase {

    protected JsUnitStandardServer server;
    private TestRunManager testRunManager;
    private ConfigurationSource configurationSource;
    private String overrideURL;

    public StandaloneTest(String name) {
        super(name);
        this.configurationSource = configurationSource();
    }

    public StandaloneTest(ConfigurationSource source) {
        super(source.browserFileNames());
        this.configurationSource = source;
    }

    public static Test suite() {
        TestSuite suite = new TestSuite();
        ConfigurationSource originalSource = Configuration.resolveSource();
        Configuration configuration = new Configuration(originalSource);
        for (final Browser browser : configuration.getBrowsers())
            suite.addTest(new StandaloneTest(new DelegatingConfigurationSource(originalSource) {
                public String browserFileNames() {
                    return browser.getFileName();
                }
            }));
        return suite;
    }

    public void setUp() throws Exception {
        super.setUp();
        server = new JsUnitStandardServer(new Configuration(configurationSource), false);
        server.start();
        testRunManager = createTestRunManager();
    }

    protected ConfigurationSource configurationSource() {
        return Configuration.resolveSource();
    }

    protected TestRunManager createTestRunManager() {
        return new TestRunManager(server, overrideURL);
    }

    public void tearDown() throws Exception {
        if (server != null)
            server.dispose();
        super.tearDown();
    }

    public void runTest() throws Exception {
        testStandaloneRun();
    }

    public void testStandaloneRun() throws Exception {
        testRunManager.runTests();
        TestRunResult testRunResult = testRunManager.getTestRunResult();
        if (!testRunResult.wasSuccessful()) {
            StringBuffer buffer = new StringBuffer();
            buffer.append(testRunResult.displayString());
            buffer.append("\n");
            String xml = XmlUtility.asPrettyString(testRunManager.getTestRunResult().asXml());
            buffer.append(xml);
            fail(buffer.toString());
        }
    }

    public JsUnitStandardServer getServer() {
        return server;
    }

    public void setOverrideURL(String url) {
        this.overrideURL = url;
    }
}