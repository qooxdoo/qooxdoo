package net.jsunit;

import net.jsunit.configuration.Configuration;
import net.jsunit.configuration.ServerType;

import java.util.Date;

public interface JsUnitServer extends XmlRenderable {
    Configuration getConfiguration();

    ServerType serverType();

    boolean isFarmServer();

    Date getStartDate();

    long getTestRunCount();
}
