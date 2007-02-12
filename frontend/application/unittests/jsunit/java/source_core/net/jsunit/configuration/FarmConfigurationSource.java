package net.jsunit.configuration;

public interface FarmConfigurationSource {

    String port();

    String logsDirectory();

    String logStatus();

    String timeoutSeconds();

    String remoteMachineURLs();

}
