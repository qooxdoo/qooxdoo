package net.jsunit.configuration;

import net.jsunit.utility.StringUtility;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class FarmConfiguration {

    private final FarmConfigurationSource source;

    public FarmConfiguration(FarmConfigurationSource source) {
        this.source = source;
    }

    public List<URL> getRemoteMachineURLs() {
        String remoteMachineURLs = source.remoteMachineURLs();
        List<String> strings = StringUtility.listFromCommaDelimitedString(remoteMachineURLs);
        List<URL> result = new ArrayList<URL>(strings.size());
        for (String string : strings)
            try {
                result.add(new URL(string));
            } catch (MalformedURLException e) {
                throw new ConfigurationException(ConfigurationProperty.REMOTE_MACHINE_URLS, remoteMachineURLs, e);
            }
        return result;
    }

}
