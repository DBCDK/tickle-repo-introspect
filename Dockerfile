FROM docker.dbc.dk/payara5-micro:latest

LABEL INSTANCE="Name of the instance of this Tickle introspect. Typically the name of the environment e.g. metascrum-staging"

USER root

COPY tickle-repo-introspect-api/target/tickle-repo-introspect-api-*.war app.json deployments/