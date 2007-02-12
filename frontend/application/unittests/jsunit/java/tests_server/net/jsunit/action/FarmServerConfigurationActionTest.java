package net.jsunit.action;

import junit.framework.TestCase;
import net.jsunit.BlowingUpRemoteServerHitter;
import net.jsunit.DummyConfigurationSource;
import net.jsunit.JsUnitFarmServer;
import net.jsunit.MockRemoteServerHitter;
import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;
import net.jsunit.utility.XmlUtility;
import org.jdom.CDATA;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.filter.Filter;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class FarmServerConfigurationActionTest extends TestCase {

    private FarmServerConfigurationAction action;

    public void setUp() throws Exception {
        super.setUp();
        action = new FarmServerConfigurationAction();
        Configuration configuration = new Configuration(new DummyConfigurationSource());
        JsUnitFarmServer server = new JsUnitFarmServer(configuration);
        action.setFarmServer(server);
    }

    public void testSimple() throws Exception {
        MockRemoteServerHitter mockHitter = new MockRemoteServerHitter();
        Configuration configuration1 = configuration1();
        Configuration configuration2 = configuration2();
        mockHitter.urlToDocument.put(DummyConfigurationSource.REMOTE_URL_1 + "/config", new Document(configuration1.asXml(ServerType.FARM)));
        mockHitter.urlToDocument.put(DummyConfigurationSource.REMOTE_URL_2 + "/config", new Document(configuration2.asXml(ServerType.FARM)));
        action.setRemoteRunnerHitter(mockHitter);
        action.execute();
        assertEquals(2, mockHitter.urlsPassed.size());
        String xml = XmlUtility.asString(action.getXmlRenderable().asXml());
        assertEquals(
                "<remoteConfigurations>" +
                        "<remoteConfiguration remoteMachineURL=\"" + DummyConfigurationSource.REMOTE_URL_1 + "\">" +
                        XmlUtility.asString(configuration1.asXml(ServerType.FARM)) +
                        "</remoteConfiguration>" +
                        "<remoteConfiguration remoteMachineURL=\"" + DummyConfigurationSource.REMOTE_URL_2 + "\">" +
                        XmlUtility.asString(configuration2.asXml(ServerType.FARM)) +
                        "</remoteConfiguration>" +
                        "</remoteConfigurations>",
                xml
        );
    }

    public void testCrashingRemoteURLs() throws Exception {
        action.setRemoteRunnerHitter(new BlowingUpRemoteServerHitter());
        action.execute();
        Element rootElement = action.getXmlRenderable().asXml();
        List<CDATA> stackTraceElements = getCDATAExceptionStackTracesUnder(rootElement);
        assertEquals(2, stackTraceElements.size());
        for (CDATA stackTraceElement : stackTraceElements)
            stackTraceElement.detach();

        String xml = XmlUtility.asString(rootElement);
        assertEquals(
                "<remoteConfigurations>" +
                        "<remoteConfiguration remoteMachineURL=\"" + DummyConfigurationSource.REMOTE_URL_1 + "\">" +
                        "<configuration failedToConnect=\"true\" />" +
                        "</remoteConfiguration>" +
                        "<remoteConfiguration remoteMachineURL=\"" + DummyConfigurationSource.REMOTE_URL_2 + "\">" +
                        "<configuration failedToConnect=\"true\" />" +
                        "</remoteConfiguration>" +
                        "</remoteConfigurations>",
                xml
        );
    }

    private List<CDATA> getCDATAExceptionStackTracesUnder(Element rootElement) {
        Iterator it = rootElement.getDescendants(new Filter() {
            public boolean matches(Object arg0) {
                return arg0 instanceof CDATA;
            }
        });
        List<CDATA> stackTraceElements = new ArrayList<CDATA>();
        while (it.hasNext()) {
            CDATA next = (CDATA) it.next();
            stackTraceElements.add(next);
        }
        return stackTraceElements;
    }

    private Configuration configuration2() {
        return new Configuration(new DummyConfigurationSource() {
            public String url() {
                return "http://www.2.example.com";
            }
        });
    }

    private Configuration configuration1() {
        return new Configuration(new DummyConfigurationSource() {
            public String url() {
                return "http://www.1.example.com";
            }
        });
    }

}
