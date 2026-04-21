#!groovy

def workerNode = "devel11"

pipeline {
    agent {label workerNode}
    tools {
        maven "Maven 3"
    }
    triggers {
        pollSCM("H/03 * * * *")
        upstream(upstreamProjects: "Docker-payara6-bump-trigger",
                threshold: hudson.model.Result.SUCCESS)
    }
    options {
        timestamps()
        disableConcurrentBuilds()
    }
    environment {
        DOCKER_IMAGE_NAME = "docker-metascrum.artifacts.dbccloud.dk/tickle-repo-introspect"
        DOCKER_IMAGE_VERSION = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
        DOCKER_IMAGE_DIT_VERSION = "DIT-${env.BUILD_NUMBER}"
        GITLAB_PRIVATE_TOKEN = credentials("metascrum-gitlab-api-token")
    }
    stages {
        stage("clear workspace") {
            steps {
                deleteDir()
                checkout scm
            }
        }
        stage("verify") {
            steps {
                sh "mvn -D sourcepath=src/main/java verify pmd:pmd javadoc:aggregate"
                junit "**/target/surefire-reports/TEST-*.xml"
            }
        }
        stage("warnings") {
            agent {label workerNode}
            steps {
                warnings consoleParsers: [
                        [parserName: "Java Compiler (javac)"],
                        [parserName: "JavaDoc Tool"]
                ],
                        unstableTotalAll: "0",
                        failedTotalAll: "0"
            }
        }
        stage("pmd") {
            agent {label workerNode}
            steps {
                step([$class: 'hudson.plugins.pmd.PmdPublisher',
                      pattern: '**/target/pmd.xml',
                      unstableTotalAll: "0",
                      failedTotalAll: "0"])
            }
        }
        stage("docker build") {
            when {
                expression {
                    currentBuild.result == null || currentBuild.result == 'SUCCESS'
                }
            }
            steps {
                script {
                    def image = docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}")
                    image.push()

                    if (env.BRANCH_NAME == 'master') {
                        sh """
                            docker tag ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION} ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_DIT_VERSION}
                            docker push ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_DIT_VERSION}
                        """
                    }
                }
            }
        }
        stage("Update staging version number") {
            when {
                branch "master"
            }
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: "gitlab-isworker", keyFileVariable: "sshkeyfile")]) {
                        env.GIT_SSH_COMMAND = "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i ${sshkeyfile}"
                        sh """
                            nix run --refresh git+https://gitlab.dbc.dk/public-de-team/gitops-secrets-set-variables.git \
                                metascrum-staging:TICKLE_REPO_INTROSPECT_SERVICE_VERSION=${BRANCH_NAME}-${BUILD_NUMBER}
                        """
                    }
                }
            }
        }
        stage("Update DIT version number") {
            agent {
                docker {
                    label workerNode
                    image "docker-dbc.artifacts.dbccloud.dk/build-env:latest"
                    alwaysPull true
                }
            }
            when {
                branch "master"
            }
            steps {
                script {
                    sh """
                        set-new-version services/dataio-tickle-repo-introspect-service-tmpl.yml ${env.GITLAB_PRIVATE_TOKEN} metascrum/dit-gitops-secrets DIT-${env.BUILD_NUMBER} -b master
                    """
                }
            }
        }
    }
}
