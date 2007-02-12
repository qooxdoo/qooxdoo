package net.jsunit.configuration;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CompositeConfigurationSource implements ConfigurationSource {
    private List<ConfigurationSource> sources;

    public CompositeConfigurationSource() {
        this.sources = new ArrayList<ConfigurationSource>();
    }

    public CompositeConfigurationSource(ConfigurationSource... sources) {
        this();
        add(sources);
    }

    public static ConfigurationSource productionConfiguration(String[] arguments) {
        CompositeConfigurationSource result = new CompositeConfigurationSource(
                new ArgumentsConfigurationSource(Arrays.asList(arguments)),
                new EnvironmentVariablesConfigurationSource());
        try {
            result.add(new PropertiesFileConfigurationSource());
        } catch (FileNotFoundException e) {
            // Skip the properties file configuration source if there is no appropriately names properties file.
        }
        return result;
    }

    public void add(ConfigurationSource... sources) {
        this.sources.addAll(Arrays.asList(sources));
    }

    public String browserFileNames() {
        for (ConfigurationSource source : sources) {
            String result = source.browserFileNames();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String closeBrowsersAfterTestRuns() {
        for (ConfigurationSource source : sources) {
            String result = source.closeBrowsersAfterTestRuns();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String description() {
        for (ConfigurationSource source : sources) {
            String result = source.description();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String logsDirectory() {
        for (ConfigurationSource source : sources) {
            String result = source.logsDirectory();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String port() {
        for (ConfigurationSource source : sources) {
            String result = source.port();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String remoteMachineURLs() {
        for (ConfigurationSource source : sources) {
            String result = source.remoteMachineURLs();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String resourceBase() {
        for (ConfigurationSource source : sources) {
            String result = source.resourceBase();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String timeoutSeconds() {
        for (ConfigurationSource source : sources) {
            String result = source.timeoutSeconds();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String url() {
        for (ConfigurationSource source : sources) {
            String result = source.url();
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    public String ignoreUnresponsiveRemoteMachines() {
        for (ConfigurationSource source : sources) {
            String result = source.ignoreUnresponsiveRemoteMachines();
            if (result != null) {
                return result;
            }
        }
        return null;
    }
}
