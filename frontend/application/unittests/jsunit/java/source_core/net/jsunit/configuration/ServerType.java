package net.jsunit.configuration;

import net.jsunit.utility.StringUtility;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public enum ServerType {
    STANDARD(
            "Standard",
            false,
            true,
            false,
            Arrays.asList(new ConfigurationProperty[]{
                    ConfigurationProperty.CLOSE_BROWSERS_AFTER_TEST_RUNS,
                    ConfigurationProperty.LOGS_DIRECTORY,
                    ConfigurationProperty.PORT,
                    ConfigurationProperty.RESOURCE_BASE,
                    ConfigurationProperty.TIMEOUT_SECONDS,
            }),
            Arrays.asList(new ConfigurationProperty[]{
                    ConfigurationProperty.BROWSER_FILE_NAMES,
                    ConfigurationProperty.DESCRIPTION,
                    ConfigurationProperty.URL,
            })
    ),
    STANDARD_TEMPORARY(
            "Standard Temporary",
            STANDARD.isFarm(),
            false,
            true,
            STANDARD.getRequiredConfigurationProperties(),
            STANDARD.getOptionalConfigurationProperties()
    ),
    FARM(
            "Farm",
            true,
            true,
            false,
            Arrays.asList(new ConfigurationProperty[]{
                    ConfigurationProperty.LOGS_DIRECTORY,
                    ConfigurationProperty.PORT,
                    ConfigurationProperty.REMOTE_MACHINE_URLS,
                    ConfigurationProperty.IGNORE_UNRESPONSIVE_REMOTE_MACHINES,
            }),
            Arrays.asList(new ConfigurationProperty []{
                    ConfigurationProperty.DESCRIPTION,
                    ConfigurationProperty.RESOURCE_BASE,
                    ConfigurationProperty.URL,
            })
    );

    private List<ConfigurationProperty> requiredProperties;
    private List<ConfigurationProperty> optionalProperties;
    private String displayName;
    private boolean isFarm;
    private boolean performUpToDateCheck;
	private boolean isTemporary;

    private ServerType(
            String displayName,
            boolean isFarm,
            boolean performVersionUpToDateCheck,
            boolean isTemporary,
            List<ConfigurationProperty> required,
            List<ConfigurationProperty> optional) {
        this.performUpToDateCheck = performVersionUpToDateCheck;
        this.displayName = displayName;
        this.isFarm = isFarm;
        this.isTemporary = isTemporary;
        this.requiredProperties = required;
        this.optionalProperties = optional;
    }

    public List<ConfigurationProperty> getRequiredConfigurationProperties() {
        return requiredProperties;
    }

    public List<ConfigurationProperty> getOptionalConfigurationProperties() {
        return optionalProperties;
    }

    public List<ConfigurationProperty> getPropertiesInvalidFor(Configuration configuration) {
        List<ConfigurationProperty> result = new ArrayList<ConfigurationProperty>();

        for (ConfigurationProperty property : getRequiredAndOptionalConfigurationProperties()) {
            try {
                String valueString = property.getValueString(configuration);
                if (isPropertyRequired(property) && StringUtility.isEmpty(valueString))
                    result.add(property);
            } catch (ConfigurationException e) {
                result.add(property);
            }
        }

        return result;

    }

    private boolean isPropertyRequired(ConfigurationProperty property) {
        return getRequiredConfigurationProperties().contains(property);
    }

    public List<ConfigurationProperty> getRequiredAndOptionalConfigurationProperties() {
        List<ConfigurationProperty> result = new ArrayList<ConfigurationProperty>();
        result.addAll(getRequiredConfigurationProperties());
        result.addAll(getOptionalConfigurationProperties());
        Collections.sort(result, ConfigurationProperty.comparator());
        return result;
    }

    public boolean isFarm() {
        return isFarm;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean shouldPerformUpToDateCheck() {
        return performUpToDateCheck;
    }

	public boolean isTemporary() {
		return isTemporary;
	}
}
