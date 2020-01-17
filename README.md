# Tickle-Repo-Introspect
The purpose of this project is to allow introspection of the tickle repo.

### Configuration

**Environment variables**

* INSTANCE is used to indicate which environment the service is deployed to making it easier to see if you are on staging or production.

### API
The restful services in this project is only meant to be used by the GUI.

### Development
**Requirements**

To build this project JDK 1.8 and Apache Maven is required.

To start a local instance, docker is required.

**Scripts**
* clean - clears build artifacts
* build - builds artifacts
* test - runs unit and integration tests
* validate - analyzes source code and javadoc
* start - starts localhost instance
* stop - stops localhost instance

```bash
./clean && ./build && ./test && ./validate && INSTANCE="..." ./start
```

**Web development**
When using IntelliJ webpack can be used to create a live development web page.

Go to Configurations and add an npm template.
```
* Package.json: tickle-repo-introspect-gui/package.json
* Command: run 
* Scripts: dev-server
* Node-interpreter: tickle-repo-introspect-gui/node/node
* Package manager: npm
```

Start the docker container and then start the npm configuration. You will now have a react environment which updates automatically every time you make a change in the GUI.

Note that the port in webpack.config.js have to match the port your docker container is using.

### License

Copyright Dansk Bibliotekscenter a/s. Licensed under GPLv3.
See license text in LICENSE.txt
