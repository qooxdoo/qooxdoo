package net.jsunit.configuration;

public interface ConfigurationSource {

    String browserFileNames();

    String closeBrowsersAfterTestRuns();

    String description();

    String logsDirectory();

    String port();

    String remoteMachineURLs();

    String resourceBase();

    String timeoutSeconds();

    String url();

    String ignoreUnresponsiveRemoteMachines();
}