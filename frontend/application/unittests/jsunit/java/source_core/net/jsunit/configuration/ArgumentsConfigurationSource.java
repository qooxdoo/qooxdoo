package net.jsunit.configuration;

import java.util.List;

public class ArgumentsConfigurationSource implements ConfigurationSource {

    private List<String> arguments;

    public ArgumentsConfigurationSource(List<String> arguments) {
        this.arguments = arguments;
    }

    private String argumentValue(ConfigurationProperty property) {
        for (int i = 0; i < arguments.size(); i++) {
            if (arguments.get(i).equalsIgnoreCase("-" + property.getName())) {
                String value = arguments.get(i + 1);
                if (!value.startsWith("-"))
                    return value;
                else
                    return "";
            }
        }
        return null;
    }

    public String resourceBase() {
        return argumentValue(ConfigurationProperty.RESOURCE_BASE);
    }

    public String port() {
        return argumentValue(ConfigurationProperty.PORT);
    }

    public String remoteMachineURLs() {
        return argumentValue(ConfigurationProperty.REMOTE_MACHINE_URLS);
    }

    public String logsDirectory() {
        return argumentValue(ConfigurationProperty.LOGS_DIRECTORY);
    }

    public String browserFileNames() {
        return argumentValue(ConfigurationProperty.BROWSER_FILE_NAMES);
    }

    public String url() {
        return argumentValue(ConfigurationProperty.URL);
    }

    public String ignoreUnresponsiveRemoteMachines() {
        return argumentValue(ConfigurationProperty.IGNORE_UNRESPONSIVE_REMOTE_MACHINES);
    }

    public String closeBrowsersAfterTestRuns() {
        return argumentValue(ConfigurationProperty.CLOSE_BROWSERS_AFTER_TEST_RUNS);
    }

    public String description() {
        return argumentValue(ConfigurationProperty.DESCRIPTION);
    }

    public String timeoutSeconds() {
        return argumentValue(ConfigurationProperty.TIMEOUT_SECONDS);
    }

}