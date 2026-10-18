package com.stageia.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads backend/.env (KEY=VALUE per line, no shell interpretation) so that
 * `./mvnw spring-boot:run` works directly from a fresh terminal without the
 * user having to export DB_URL/DB_USERNAME/DB_PASSWORD/GROQ_API_KEY first.
 * Real environment variables and -D system properties still take precedence.
 */
@SuppressWarnings("deprecation")
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path envFile = Path.of(".env");
        if (!Files.isRegularFile(envFile)) {
            return;
        }

        Map<String, Object> values = new LinkedHashMap<>();
        try {
            List<String> lines = Files.readAllLines(envFile);
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int separator = trimmed.indexOf('=');
                if (separator <= 0) {
                    continue;
                }
                String key = trimmed.substring(0, separator).trim();
                String value = trimmed.substring(separator + 1).trim();
                values.put(key, value);
            }
        } catch (IOException e) {
            return;
        }

        if (values.isEmpty()) {
            return;
        }

        MutablePropertySources propertySources = environment.getPropertySources();
        propertySources.addLast(new MapPropertySource("dotenv", values));
    }
}
