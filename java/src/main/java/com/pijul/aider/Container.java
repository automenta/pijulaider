package com.pijul.aider;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

public class Container {
    private final Map<String, Function<Container, ?>> services = new HashMap<>();
    private final Map<String, Object> instances = new HashMap<>();

    public <T> void register(String name, Function<Container, T> service) {
        services.put(name, service);
    }

    @SuppressWarnings("unchecked")
    public <T> T get(String name) {
        if (!instances.containsKey(name)) {
            Function<Container, ?> service = services.get(name);
            if (service != null) {
                instances.put(name, service.apply(this));
            } else {
                throw new IllegalArgumentException("Service not found: " + name);
            }
        }
        return (T) instances.get(name);
    }
}