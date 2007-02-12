package net.jsunit.configuration;

import junit.framework.TestCase;
import net.jsunit.StubConfigurationSource;
import net.jsunit.model.Browser;
import net.jsunit.utility.SystemUtility;
import net.jsunit.utility.XmlUtility;

import java.io.File;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class ConfigurationTest extends TestCase {

    public void testFull() throws Exception {
        Configuration configuration = new Configuration(new FullValidForBothConfigurationSource());
        List<Browser> expectedBrowsers = new ArrayList<Browser>();
        expectedBrowsers.add(new Browser("browser1.exe", 0));
        expectedBrowsers.add(new Browser("browser2.exe", 1));
        assertEquals(expectedBrowsers, configuration.getBrowsers());
        assertEquals(new File("logs" + File.separator + "directory"), configuration.getLogsDirectory());
        assertEquals(1234, configuration.getPort());
        assertEquals(new File("resource" + File.separator + "base"), configuration.getResourceBase());
        assertEquals("http://www.example.com:1234/", configuration.getTestURL().toString());
        assertTrue(configuration.shouldCloseBrowsersAfterTestRuns());
        assertEquals(76, configuration.getTimeoutSeconds());
        List<URL> expectedRemoteMachineURLs = new ArrayList<URL>();
        expectedRemoteMachineURLs.add(new URL("http://localhost:8081/jsunit"));
        expectedRemoteMachineURLs.add(new URL("http://127.0.0.1:8082/jsunit"));
        assertEquals(expectedRemoteMachineURLs, configuration.getRemoteMachineURLs());
        assertTrue(configuration.shouldIgnoreUnresponsiveRemoteMachines());

        assertTrue(configuration.isValidFor(ServerType.STANDARD));
        assertTrue(configuration.isValidFor(ServerType.FARM));
    }

    public void testMinimal() throws Exception {
        Configuration configuration = new Configuration(new MinimalValidForBothConfigurationSource());
        assertEquals(new File("."), configuration.getResourceBase());
        assertEquals(new File("logs"), configuration.getLogsDirectory());
        assertTrue(configuration.shouldCloseBrowsersAfterTestRuns());
        assertEquals(60, configuration.getTimeoutSeconds());
        assertFalse(configuration.shouldIgnoreUnresponsiveRemoteMachines());

        assertTrue(configuration.isValidFor(ServerType.STANDARD));
        assertTrue(configuration.isValidFor(ServerType.FARM));
    }

    public void testBadRemoteMachineURLs() throws Exception {
        try {
            new Configuration(new StubConfigurationSource() {
                public String remoteMachineURLs() {
                    return "invalid url";
                }
            });
            fail();
        } catch (ConfigurationException e) {
        }
    }

    public void testBadURL() throws Exception {
        try {
            new Configuration(new StubConfigurationSource() {
                public String url() {
                    return "invalid url";
                }
            });
            fail();
        } catch (ConfigurationException e) {
        }
    }

    public void testBadPort() throws Exception {
        try {
            new Configuration(new StubConfigurationSource() {
                public String port() {
                    return "invalid number";
                }
            });
            fail();
        } catch (ConfigurationException e) {
        }
    }

    public void testBadTimeoutSeconds() throws Exception {
        try {
            new Configuration(new StubConfigurationSource() {
                public String timeoutSeconds() {
                    return "invalid number";
                }
            });
            fail();
        } catch (ConfigurationException e) {
        }
    }

    public void testValidForStandardInvalidForFarm() throws Exception {
        Configuration configuration = new Configuration(new ValidForStandardInvalidForFarmConfigurationSource());
        assertTrue(configuration.isValidFor(ServerType.STANDARD));
        assertFalse(configuration.isValidFor(ServerType.FARM));
        List<ConfigurationProperty> invalidProperties = ServerType.FARM.getPropertiesInvalidFor(configuration);
        assertEquals(1, invalidProperties.size());
        assertEquals(ConfigurationProperty.REMOTE_MACHINE_URLS, invalidProperties.get(0));
    }

    public void testAsXmlForStandardConfiguration() throws Exception {
        FullValidForBothConfigurationSource source = new FullValidForBothConfigurationSource();
        Configuration configuration = new Configuration(source);
        File logsDirectory = new File(source.logsDirectory());
        File resourceBase = new File(source.resourceBase());
        String expectedXML = "<configuration type=\"" + ServerType.STANDARD.name() + "\">" +
                "<os>" + SystemUtility.osString() + "</os>" +
                "<ipAddress>" + SystemUtility.ipAddress() + "</ipAddress>" +
                "<hostname>" + SystemUtility.hostname() + "</hostname>" +
                "<browserFileNames>" +
                "<browserFileName id=\"0\">browser1.exe</browserFileName>" +
                "<browserFileName id=\"1\">browser2.exe</browserFileName>" +
                "</browserFileNames>" +
                "<closeBrowsersAfterTestRuns>true</closeBrowsersAfterTestRuns>" +
                "<description>This is the best server ever</description>" +
                "<logsDirectory>" + logsDirectory.getAbsolutePath() + "</logsDirectory>" +
                "<port>1234</port>" +
                "<resourceBase>" + resourceBase.getAbsolutePath() + "</resourceBase>" +
                "<timeoutSeconds>76</timeoutSeconds>" +
                "<url>http://www.example.com:1234/</url>" +
                "</configuration>";
        assertEquals(expectedXML, XmlUtility.asString(configuration.asXml(ServerType.STANDARD)));
    }

    public void testAsXmlForStandardTemporaryConfiguration() throws Exception {
        FullValidForBothConfigurationSource source = new FullValidForBothConfigurationSource();
        Configuration configuration = new Configuration(source);
        File logsDirectory = new File(source.logsDirectory());
        File resourceBase = new File(source.resourceBase());
        String expectedXML = "<configuration type=\"" + ServerType.STANDARD_TEMPORARY.name() + "\">" +
                "<os>" + SystemUtility.osString() + "</os>" +
                "<ipAddress>" + SystemUtility.ipAddress() + "</ipAddress>" +
                "<hostname>" + SystemUtility.hostname() + "</hostname>" +
                "<browserFileNames>" +
                "<browserFileName id=\"0\">browser1.exe</browserFileName>" +
                "<browserFileName id=\"1\">browser2.exe</browserFileName>" +
                "</browserFileNames>" +
                "<closeBrowsersAfterTestRuns>true</closeBrowsersAfterTestRuns>" +
                "<description>This is the best server ever</description>" +
                "<logsDirectory>" + logsDirectory.getAbsolutePath() + "</logsDirectory>" +
                "<port>1234</port>" +
                "<resourceBase>" + resourceBase.getAbsolutePath() + "</resourceBase>" +
                "<timeoutSeconds>76</timeoutSeconds>" +
                "<url>http://www.example.com:1234/</url>" +
                "</configuration>";
        assertEquals(expectedXML, XmlUtility.asString(configuration.asXml(ServerType.STANDARD_TEMPORARY)));
    }

    public void testAsXmlForFarmConfiguration() throws Exception {
        FullValidForBothConfigurationSource source = new FullValidForBothConfigurationSource();
        Configuration configuration = new Configuration(source);
        File logsDirectory = new File(source.logsDirectory());
        File resourceBase = new File(source.resourceBase());
        assertEquals(
                "<configuration type=\"" + ServerType.FARM.name() + "\">" +
                        "<os>" + SystemUtility.osString() + "</os>" +
                        "<ipAddress>" + SystemUtility.ipAddress() + "</ipAddress>" +
                        "<hostname>" + SystemUtility.hostname() + "</hostname>" +
                        "<description>This is the best server ever</description>" +
                        "<ignoreUnresponsiveRemoteMachines>true</ignoreUnresponsiveRemoteMachines>" +
                        "<logsDirectory>" + logsDirectory.getAbsolutePath() + "</logsDirectory>" +
                        "<port>1234</port>" +
                        "<remoteMachineURLs>" +
                        "<remoteMachineURL id=\"0\">http://localhost:8081/jsunit</remoteMachineURL>" +
                        "<remoteMachineURL id=\"1\">http://127.0.0.1:8082/jsunit</remoteMachineURL>" +
                        "</remoteMachineURLs>" +
                        "<resourceBase>" + resourceBase.getAbsolutePath() + "</resourceBase>" +
                        "<url>http://www.example.com:1234/</url>" +
                        "</configuration>",
                XmlUtility.asString(configuration.asXml(ServerType.FARM))
        );
    }

    public void testGetBrowserById() throws Exception {
        Configuration configuration = new Configuration(new FullValidForBothConfigurationSource());
        assertEquals(new Browser("browser1.exe", 0), configuration.getBrowserById(0));
        assertEquals(new Browser("browser2.exe", 1), configuration.getBrowserById(1));
        assertNull(configuration.getBrowserById(900));
    }

    public void testGetRemoteMachineURLById() throws Exception {
        Configuration configuration = new Configuration(new FullValidForBothConfigurationSource());
        assertEquals(
                "http://localhost:8081/jsunit",
                configuration.getRemoteMachineURLById(0).toString()
        );
        assertEquals(
                "http://127.0.0.1:8082/jsunit",
                configuration.getRemoteMachineURLById(1).toString()
        );
    }

    public void testAsArgumentsArray() throws Exception {
        Configuration configuration = new Configuration(new FullValidForBothConfigurationSource());
        String[] arguments = configuration.asArgumentsArray();

        assertEquals(20, arguments.length);
        int index = 0;

        assertEquals("-browserFileNames", arguments[index++]);
        assertEquals("browser1.exe,browser2.exe", arguments[index++]);

        assertEquals("-closeBrowsersAfterTestRuns", arguments[index++]);
        assertEquals("true", arguments[index++]);

        assertEquals("-description", arguments[index++]);
        assertEquals("This is the best server ever", arguments[index++]);

        assertEquals("-ignoreUnresponsiveRemoteMachines", arguments[index++]);
        assertEquals("true", arguments[index++]);

        assertEquals("-logsDirectory", arguments[index++]);
        assertEquals(new File("logs" + File.separator + "directory").getAbsolutePath(), arguments[index++]);

        assertEquals("-port", arguments[index++]);
        assertEquals("1234", arguments[index++]);

        assertEquals("-remoteMachineURLs", arguments[index++]);
        assertEquals("http://localhost:8081/jsunit,http://127.0.0.1:8082/jsunit", arguments[index++]);

        assertEquals("-resourceBase", arguments[index++]);
        assertEquals(new File("resource/base").getAbsolutePath(), arguments[index++]);

        assertEquals("-timeoutSeconds", arguments[index++]);
        assertEquals("76", arguments[index++]);

        assertEquals("-url", arguments[index++]);
        assertEquals("http://www.example.com:1234/", arguments[index]);
    }

    public void testDuplicateBrowserFileNamesAndRemoteMachineURLs() throws Exception {
        Configuration configuration = new Configuration(new DuplicatesConfigurationSource());
        List<Browser> browsers = configuration.getBrowsers();
        assertEquals(3, browsers.size());
        assertEquals(new Browser("browser1.exe", 0), browsers.get(0));
        assertEquals(new Browser("browser2.exe", 1), browsers.get(1));
        assertEquals(new Browser("browser3.exe", 2), browsers.get(2));

        List<URL> remoteMachineURLs = configuration.getRemoteMachineURLs();
        assertEquals(4, remoteMachineURLs.size());
        assertEquals("http://machine1:8080/jsunit", remoteMachineURLs.get(0).toString());
        assertEquals("http://machine2:9090/jsunit", remoteMachineURLs.get(1).toString());
        assertEquals("http://machine1:8081/jsunit", remoteMachineURLs.get(2).toString());
        assertEquals("http://machine3:9090/jsunit", remoteMachineURLs.get(3).toString());
    }

    static class FullValidForBothConfigurationSource implements ConfigurationSource {

        public String resourceBase() {
            return "resource" + File.separator + "base";
        }

        public String port() {
            return "1234";
        }

        public String logsDirectory() {
            return "logs" + File.separator + "directory";
        }

        public String browserFileNames() {
            return "browser1.exe,browser2.exe";
        }

        public String url() {
            return "http://www.example.com:1234/";
        }

        public String ignoreUnresponsiveRemoteMachines() {
            return "true";
        }

        public String closeBrowsersAfterTestRuns() {
            return "true";
        }

        public String description() {
            return "This is the best server ever";
        }

        public String timeoutSeconds() {
            return "76";
        }

        public String remoteMachineURLs() {
            return "http://localhost:8081,http://127.0.0.1:8082";
        }
    }

    static class MinimalValidForBothConfigurationSource extends StubConfigurationSource {
        public String remoteMachineURLs() {
            return "http://localhost:8081,http://127.0.0.1:8082";
        }

    }

    static class ValidForStandardInvalidForFarmConfigurationSource extends StubConfigurationSource {
    }

    static class DuplicatesConfigurationSource extends StubConfigurationSource {
        public String browserFileNames() {
            return "browser1.exe,browser2.exe,browser1.exe,browser1.exe,browser3.exe";
        }

        public String remoteMachineURLs() {
            return "http://machine1:8080,http://machine2:9090/jsunit,http://machine1:8081,http://machine1:8080,http://machine1:8080/jsunit,http://machine3:9090";
        }
    }
}
