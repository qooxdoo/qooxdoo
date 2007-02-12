package net.jsunit.configuration;

public class DelegatingConfigurationSource implements ConfigurationSource {
    private ConfigurationSource source;

    public DelegatingConfigurationSource(ConfigurationSource source) {
        this.source = source;
    }

    public String browserFileNames() {
        return source.browserFileNames();
    }

    public String closeBrowsersAfterTestRuns() {
        return source.closeBrowsersAfterTestRuns();
    }

    public String description() {
        return source.description();
    }

    public String logsDirectory() {
        return source.logsDirectory();
    }

    public String port() {
        return source.port();
    }

    public String remoteMachineURLs() {
        return source.remoteMachineURLs();
    }

    public String resourceBase() {
        return source.resourceBase();
    }

    public String timeoutSeconds() {
        return source.timeoutSeconds();
    }

    public String url() {
        return source.url();
    }

    public String ignoreUnresponsiveRemoteMachines() {
        return source.ignoreUnresponsiveRemoteMachines();
    }
}
