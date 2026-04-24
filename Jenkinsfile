// ─── Jenkinsfile — Beck_Frontend ─────────────────────────────────────────────
// Branches:
//   main → production  (Vite build served on port 7001)
//   dev  → development (Vite HMR dev server on port 7011, no build)

pipeline {
    agent any

    environment {
        VPS_HOST        = credentials('vps-host')
        VPS_SSH_KEY_ID  = 'vps-root-ssh-key'
        PROJECT         = 'beck-frontend'
    }

    triggers {
        githubPush()
    }

    options {
        timeout(time: 20, unit: 'MINUTES')   // Vite build can take a few minutes
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Deploy → Development') {
            when { branch 'dev' }
            steps {
                sshagent([env.VPS_SSH_KEY_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@\${VPS_HOST} \\
                            '/opt/deploy/deploy-beck-frontend.sh dev'
                    """
                }
            }
        }

        stage('Deploy → Production') {
            when { branch 'main' }
            steps {
                sshagent([env.VPS_SSH_KEY_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no root@\${VPS_HOST} \\
                            '/opt/deploy/deploy-beck-frontend.sh prod'
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ ${PROJECT} deployed successfully to ${env.BRANCH_NAME == 'main' ? 'PRODUCTION' : 'DEVELOPMENT'}"
        }
        failure {
            echo "❌ ${PROJECT} deploy FAILED on branch ${env.BRANCH_NAME}"
        }
    }
}
