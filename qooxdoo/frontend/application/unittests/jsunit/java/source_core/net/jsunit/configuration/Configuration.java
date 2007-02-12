package net.jsunit.configuration;

import net.jsunit.model.Browser;
import net.jsunit.model.BrowserSource;
import net.jsunit.utility.SystemUtility;
import org.jdom.Element;

import java.io.File;
import java.net.URL;
import java.util.List;

public final class Configuration implements BrowserSource {

    private List<Browser> browsers;
    private boolean closeBrowsersAfterTestRuns;
    private String description;
    private boolean ignoreUnresponsiveRemoteMachines;
    private File logsDirectory;
    private int port;
    private List<URL> remoteMachineURLs;
    private File resourceBase;
    private int timeoutSeconds;
    private URL testURL;

    public static Configuration resolve(String[] arguments) {
        return new Configuration(resolveSource(arguments));
    }

    public static ConfigurationSource resolveSource(String[] arguments) {
        return CompositeConfigurationSource.productionConfiguration(arguments);
    }

    public static ConfigurationSource resolveSource() {
        return resolveSource(new String[]{});
    }

    public Configuration(ConfigurationSource source) {
        for (ConfigurationProperty property : ConfigurationProperty.values())
            property.configure(this, source);
    }

    public Element asXml(ServerType serverType) {
        Element configurationElement = new Element("configuration");
        configurationElement.setAttribute("type", serverType.name());
        addSystemElementsTo(configurationElement);
        for (ConfigurationProperty property : getRequiredAndOptionalConfigurationProperties(serverType))
            property.addXmlTo(configurationElement, this);
        return configurationElement;
    }

    private void addSystemElementsTo(Element element) {
        Element osElement = new Element("os");
        osElement.setText(SystemUtility.osString());
        element.addContent(osElement);
        Element ipAddressElement = new Element("ipAddress");
        ipAddressElement.setText(SystemUtility.ipAddress());
        element.addContent(ipAddressElement);
        Element hostnameElement = new Element("hostname");
        hostnameElement.setText(SystemUtility.hostname());
        element.addContent(hostnameElement);
    }

    public List<ConfigurationProperty> getRequiredAndOptionalConfigurationProperties(ServerType serverType) {
        return serverType.getRequiredAndOptionalConfigurationProperties();
    }

    public String[] asArgumentsArray() {
        List<ConfigurationProperty> properties = ConfigurationProperty.all();
        String[] arguments = new String[properties.size() * 2];
        int i = 0;
        for (ConfigurationProperty property : properties) {
            arguments[i++] = "-" + property.getName();
            arguments[i++] = property.getValueString(this);
        }
        return arguments;
    }

    public boolean isValidFor(ServerType type) {
        return type.getPropertiesInvalidFor(this).isEmpty();
    }

    public String toString() {
        return getDescription() == null ? super.toString() : getDescription();
    }

    public List<Browser> getBrowsers() {
        return browsers;
    }

    public void setBrowsers(List<Browser> browsers) {
        this.browsers = browsers;
    }

    public boolean shouldCloseBrowsersAfterTestRuns() {
        return closeBrowsersAfterTestRuns;
    }

    public void setCloseBrowsersAfterTestRuns(boolean closeBrowsersAfterTestRuns) {
        this.closeBrowsersAfterTestRuns = closeBrowsersAfterTestRuns;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean shouldIgnoreUnresponsiveRemoteMachines() {
        return ignoreUnresponsiveRemoteMachines;
    }

    public void setIgnoreUnresponsiveRemoteMachines(boolean ignoreUnresponsiveRemoteMachines) {
        this.ignoreUnresponsiveRemoteMachines = ignoreUnresponsiveRemoteMachines;
    }

    public File getLogsDirectory() {
        return logsDirectory;
    }

    public void setLogsDirectory(File logsDirectory) {
        this.logsDirectory = logsDirectory;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public List<URL> getRemoteMachineURLs() {
        return remoteMachineURLs;
    }

    public void setRemoteMachineURLs(List<URL> remoteMachineURLs) {
        this.remoteMachineURLs = remoteMachineURLs;
    }

    public File getResourceBase() {
        return resourceBase;
    }

    public void setResourceBase(File resourceBase) {
        this.resourceBase = resourceBase;
    }

    public int getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public void setTimeoutSeconds(int timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }

    public URL getTestURL() {
        return testURL;
    }

    public void setTestURL(URL url) {
        this.testURL = url;
    }

    public Browser getBrowserById(int id) {
        for (Browser browser : browsers)
            if (browser.hasId(id))
                return browser;
        return null;
    }

    public URL getRemoteMachineURLById(int id) {
        return getRemoteMachineURLs().get(id);
    }

}
