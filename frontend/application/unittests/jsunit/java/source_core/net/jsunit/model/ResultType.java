package net.jsunit.model;

public enum ResultType {
    UNRESPONSIVE {
        public String getDisplayString() {
            return "unresponsive";
        }

    },
    FAILED_TO_LAUNCH {
        public String getDisplayString() {
            return "failed to launch";
        }

        public boolean failedToLaunch() {
            return true;
        }
    },
    TIMED_OUT {
        public String getDisplayString() {
            return "timed out";
        }

        public boolean timedOut() {
            return true;
        }
    },
    EXTERNALLY_SHUT_DOWN {
        public String getDisplayString() {
            return "externally shut down";
        }

        public boolean externallyShutDown() {
            return true;
        }

    },
    ERROR {
        public String getDisplayString() {
            return "error";
        }
    },
    FAILURE {
        public String getDisplayString() {
            return "failure";
        }
    },
    SUCCESS {
        public String getDisplayString() {
            return "success";
        }
    };

    public abstract String getDisplayString();

    public final boolean completedTestRun() {
        return !timedOut() && !failedToLaunch() && !externallyShutDown();
    }

    public boolean timedOut() {
        return false;
    }

    public boolean failedToLaunch() {
        return false;
    }

    public boolean externallyShutDown() {
        return false;
    }

    public boolean isWorseThan(ResultType other) {
        return ordinal() < other.ordinal();
    }

}
