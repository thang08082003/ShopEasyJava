# Build stage
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Gradle wrapper and build metadata
COPY gradlew gradlew.bat build.gradle settings.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew

# Application source
COPY src ./src

# Build the Spring Boot fat jar
RUN ./gradlew bootJar -x test --no-daemon

# Runtime stage
FROM eclipse-temurin:25-jre
WORKDIR /app
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Copy built artifact
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 5000
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
