package dk.dbc.ticklerepo.rest;

import dk.dbc.ticklerepo.TickleRepoIntrospectService;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;

@ApplicationPath("/api")
public class TickleRepoIntrospectApplication extends Application {
    private static final Set<Class<?>> classes = new HashSet<>();

    static {
        classes.add(TickleRepoIntrospectService.class);
        classes.add(HealthChecks.class);
    }

    @Override
    public Set<Class<?>> getClasses() {
        return classes;
    }

}
