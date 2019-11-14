FROM docker.dbc.dk/payara5-micro:latest

LABEL INSTANCE="Name of the instance of this Tickle introspect. Typically the name of the environment e.g. metascrum-staging"
LABEL TICKLE_REPO_URL="Database URL for the tickle repo database (required)"

USER root

COPY tickle-repo-introspect-api/target/tickle-repo-introspect-api-*.war app.json deployments/