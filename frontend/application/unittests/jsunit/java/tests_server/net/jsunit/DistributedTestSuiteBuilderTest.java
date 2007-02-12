package net.jsunit;

import junit.framework.TestCase;
import junit.framework.TestSuite;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;
import org.jdom.Document;

public class DistributedTestSuiteBuilderTest extends TestCase {
    private DummyConfigurationSource originalSource;
    private MockRemoteServerHitter mockHitter;
    private DistributedTestSuiteBuilder builder;

    protected void setUp() throws Exception {
        super.setUp();
        originalSource = new DummyConfigurationSource();
        mockHitter = new MockRemoteServerHitter();
        originalSource.setNeeds3rdRemoteMachineURL();
        mockHitter.urlToDocument.put(DummyConfigurationSource.REMOTE_URL_1 + "/config", remoteConfiguration1XmlDocument());
        mockHitter.urlToDocument.put(DummyConfigurationSource.REMOTE_URL_2 + "/config", remoteConfiguration2XmlDocument());
        mockHitter.urlToDocument.put(DummyConfigurationSource.REMOTE_URL_3 + "/config", remoteConfiguration3XmlDocument());
        builder = new DistributedTestSuiteBuilder(originalSource, mockHitter);
    }

    public void testSimple() throws Exception {
        TestSuite aSuite = new TestSuite();
        builder.addTestsTo(aSuite);

        assertEquals(3, builder.getRemoteMachineURLCount());
        assertEquals(5, builder.getBrowserCount());
        assertEquals("JsUnit Tests (3 machines, 5 direct browsers)", aSuite.getName());
    }

    private Document remoteConfiguration1XmlDocument() {
        Configuration configuration = new Configuration(new StubConfigurationSource() {
            public String browserFileNames() {
                return "browser1.exe,browser2.exe";
            }
        });
        return new Document(configuration.asXml(ServerType.STANDARD));
    }

    private Document remoteConfiguration2XmlDocument() {
        Configuration configuration = new Configuration(new StubConfigurationSource() {
            public String browserFileNames() {
                return "browser3.exe,browser4.exe,browser5";
            }
        });
        return new Document(configuration.asXml(ServerType.STANDARD));
    }

    private Document remoteConfiguration3XmlDocument() {
        Configuration configuration = new Configuration(new StubConfigurationSource() {
            public String remoteMachineURLs() {
                return "http://machine4:6060/jsunit";
            }
        });
        return new Document(configuration.asXml(ServerType.FARM));
    }

}
