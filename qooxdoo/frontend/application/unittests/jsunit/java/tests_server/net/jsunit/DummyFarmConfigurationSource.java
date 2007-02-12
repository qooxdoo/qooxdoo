package net.jsunit;

import net.jsunit.configuration.ConfigurationSource;

public class DummyFarmConfigurationSource implements ConfigurationSource {

    public String resourceBase() {
        return ".";
    }

    public String port() {
        return "1234";
    }

    public String logsDirectory() {
        return "c:\\logs";
    }

    public String browserFileNames() {
        return null;
    }

    public String url() {
        return null;
    }

    public String ignoreUnresponsiveRemoteMachines() {
        return null;
    }

    public String closeBrowsersAfterTestRuns() {
        return null;
    }

    public String description() {
        return "This is a cool server";
    }

    public String logStatus() {
        return "true";
    }

    public String timeoutSeconds() {
        return "25";
    }

    public String remoteMachineURLs() {
        return "http://www.example.com:8081,http://www.example.com:8082";
    }

}
