terraform {
  required_providers {
    google = {
      source  = "registry.terraform.io/hashicorp/google"
      version = ">= 5.36.0"
    }
     kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.7.0"
    }
     docker = {
      source  = "kreuzwerker/docker"
      version = "3.0.2"
    }
  }
}
locals {
  services = [
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
    "container.googleapis.com",
    "artifactregistry.googleapis.com",
  ]
}

variable "SA_EMAIL" {
  description = "email for service account you granted roles to"
  type = string
}

variable "COMPUTE_ZONE" {
  type    = string
  description = "compute zone you want to use (example: us-central1)"
}

variable "COMPUTE_REGION" {
  type    = string
  description = "compute region you want to use (example: us-central1-a)"
}

variable "PROJECT_ID" {
  type = string
  description = "google project id"
}

variable "PROJECT_NUMBER" {
  type = string
  description = "google project number"
}

variable "SA_credentials" {
  type = string
  description = "google service account credentials in json format ONE LINE"
}

variable "GH_TOKEN" {
  type = string
  description = "your generated auth token for github"
}

variable "APP_INSTALLATION_ID" {
  type = string
  description = "google cloud build installation id(found in url)"
}

variable "GH_URL" {
  type = string
  description = "github repo url"
}

provider "google" {
  project=var.PROJECT_ID
  credentials = <<-EOF
  ${var.SA_credentials}
EOF

  region=var.COMPUTE_REGION
  zone = var.COMPUTE_ZONE
}

data "google_client_config" "provider" {}

provider "docker" {
  host = "unix:///var/run/docker.sock"
  registry_auth {
    address  = "us.gcr.io"
    username = "oauth2accesstoken"
    password = data.google_client_config.provider.access_token
  }
}

resource "docker_image" "image" {
  name = "us.gcr.io/${var.PROJECT_ID}/terraform/solo:latest"
  build {
    context = "."
  }
}

resource "google_project_service" "enabled_service" {
  for_each = toset(local.services)
  project = var.PROJECT_ID
  service = each.key
}

resource "google_container_cluster" "primary" {
  depends_on = [google_project_service.enabled_service]
  name     = "primary"
  location = var.COMPUTE_REGION
  # We can't create a cluster with no node pool defined, but we want to only use
  # separately managed node pools. So we create the smallest possible default
  # node pool and immediately delete it.
  remove_default_node_pool = true
  initial_node_count       = 1
  deletion_protection = false
}

resource "google_container_node_pool" "primary_preemptible_nodes" {
  depends_on = [google_container_cluster.primary]
  name       = "my-node-pool"
  location   = var.COMPUTE_REGION
  cluster    = google_container_cluster.primary.name
  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = var.SA_EMAIL
    oauth_scopes    = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
resource "google_secret_manager_secret" "github-token-secret" {
  depends_on = [google_project_service.enabled_service]
  secret_id = "github-token-secret"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "github-token-secret-version" {
  depends_on = [google_secret_manager_secret.github-token-secret]
  secret = google_secret_manager_secret.github-token-secret.id
  secret_data = var.GH_TOKEN
}

data "google_iam_policy" "p4sa-secretAccessor" {
  binding {
    role = "roles/secretmanager.secretAccessor"
    // Here, 123456789 is the Google Cloud project number for the project that contains the connection.
    members = ["serviceAccount:service-${var.PROJECT_NUMBER}@gcp-sa-cloudbuild.iam.gserviceaccount.com"]
  }
}

resource "google_secret_manager_secret_iam_policy" "policy" {
  depends_on = [google_secret_manager_secret.github-token-secret,data.google_iam_policy.p4sa-secretAccessor]
  project = google_secret_manager_secret.github-token-secret.project
  secret_id = google_secret_manager_secret.github-token-secret.secret_id
  policy_data = data.google_iam_policy.p4sa-secretAccessor.policy_data
}

resource "google_artifact_registry_repository" "artifact" {
  depends_on = [google_project_service.enabled_service]
  location      = "us"
  repository_id = "us.gcr.io"
  description   = "docker repository for app"
  format        = "DOCKER"
}

resource "docker_registry_image" "image" {
  depends_on = [docker_image.image,google_artifact_registry_repository.artifact]
  name       = docker_image.image.name
  keep_remotely = true
}

resource "google_cloudbuildv2_connection" "my-connection" {
  depends_on = [google_secret_manager_secret_iam_policy.policy]
  location = var.COMPUTE_REGION
  name = "my-connection"
  
  github_config {
    app_installation_id = var.APP_INSTALLATION_ID
    authorizer_credential {
      oauth_token_secret_version = google_secret_manager_secret_version.github-token-secret-version.id
    }
  }
}

resource "google_cloudbuildv2_repository" "my-repository" {
  depends_on = [google_cloudbuildv2_connection.my-connection]
  name = "solo-project"
  location = var.COMPUTE_REGION
  parent_connection = google_cloudbuildv2_connection.my-connection.name
  remote_uri = var.GH_URL
}

resource "google_cloudbuild_trigger" "my-trigger" {
  location = var.COMPUTE_REGION
  name     = "my-trigger"
  repository_event_config {
    repository = google_cloudbuildv2_repository.my-repository.id
    push {
      branch = "^main$"
    }
  }
  build {
    options {
      logging = "CLOUD_LOGGING_ONLY"
    }
    step {
      name= "gcr.io/cloud-builders/docker"
      id= "docker-build"
      args=["build","-t","us.gcr.io/${var.PROJECT_ID}/terraform/solo:latest","."]
    }
    step {
      name="gcr.io/cloud-builders/docker"
      id="docker-push"
      args=["push","us.gcr.io/${var.PROJECT_ID}/terraform/solo:latest"]
    }
    step {
      name="gcr.io/cloud-builders/gke-deploy"
      id="prepare-deplo"
      args=["prepare","--file=${kubectl_manifest.deploy.yaml_body}", "--image=us.gcr.io/${var.PROJECT_ID}/terraform/solo:latest"]
    }
    step {
      name="gcr.io/cloud-builders/gke-deploy"
      id="apply-deploy"
      args=["apply","--filename=output/expanded","--cluster=primary","--location=${var.COMPUTE_REGION}","--namespace=default"]
    }
  }
  service_account = "projects/${var.PROJECT_ID}/serviceAccounts/${var.SA_EMAIL}"
}
provider "kubectl" {
  host = "https://${google_container_cluster.primary.endpoint}"
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = "${base64decode(google_container_cluster.primary.master_auth.0.cluster_ca_certificate)}"
  load_config_file = false
}

resource "kubectl_manifest" "deploy" {
  depends_on = [docker_registry_image.image]
  yaml_body = <<-EOF
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      labels:
        app: nodeapp
        type: backend
      managedFields:
        - apiVersion: apps/v1
          fieldsType: FieldsV1
          fieldsV1:
            'f:metadata':
              'f:annotations': {}
              'f:labels':
                .: {}
                'f:app': {}
                'f:type': {}
            'f:spec':
              'f:progressDeadlineSeconds': {}
              'f:replicas': {}
              'f:revisionHistoryLimit': {}
              'f:selector': {}
              'f:strategy':
                'f:rollingUpdate':
                  .: {}
                  'f:maxSurge': {}
                  'f:maxUnavailable': {}
                'f:type': {}
              'f:template':
                'f:metadata':
                  'f:labels':
                    .: {}
                    'f:app': {}
                    'f:type': {}
                  'f:name': {}
                'f:spec':
                  'f:containers':
                    'k:{"name":"nodeappcontainer"}':
                      .: {}
                      'f:imagePullPolicy': {}
                      'f:name': {}
                      'f:ports':
                        .: {}
                        'k:{"containerPort":80,"protocol":"TCP"}':
                          .: {}
                          'f:containerPort': {}
                          'f:protocol': {}
                      'f:resources': {}
                      'f:terminationMessagePath': {}
                      'f:terminationMessagePolicy': {}
                  'f:dnsPolicy': {}
                  'f:restartPolicy': {}
                  'f:schedulerName': {}
                  'f:securityContext': {}
                  'f:terminationGracePeriodSeconds': {}
          manager: HashiCorp
          operation: Update
          time: '2024-07-07T22:03:08Z'
        - apiVersion: apps/v1
          fieldsType: FieldsV1
          fieldsV1:
            'f:metadata':
              'f:annotations':
                'f:kubectl.kubernetes.io/last-applied-configuration': {}
            'f:spec':
              'f:template':
                'f:spec':
                  'f:containers':
                    'k:{"name":"nodeappcontainer"}':
                      'f:image': {}
          manager: kubectl-client-side-apply
          operation: Update
          time: '2024-07-07T22:50:49Z'
        - apiVersion: apps/v1
          fieldsType: FieldsV1
          fieldsV1:
            'f:spec':
              'f:template':
                'f:metadata':
                  'f:annotations':
                    .: {}
                    'f:kubectl.kubernetes.io/restartedAt': {}
          manager: kubectl-rollout
          operation: Update
          time: '2024-07-07T22:50:51Z'
        - apiVersion: apps/v1
          fieldsType: FieldsV1
          fieldsV1:
            'f:metadata':
              'f:annotations':
                'f:deployment.kubernetes.io/revision': {}
            'f:status':
              'f:availableReplicas': {}
              'f:conditions':
                .: {}
                'k:{"type":"Available"}':
                  .: {}
                  'f:lastTransitionTime': {}
                  'f:lastUpdateTime': {}
                  'f:message': {}
                  'f:reason': {}
                  'f:status': {}
                  'f:type': {}
                'k:{"type":"Progressing"}':
                  .: {}
                  'f:lastTransitionTime': {}
                  'f:lastUpdateTime': {}
                  'f:message': {}
                  'f:reason': {}
                  'f:status': {}
                  'f:type': {}
              'f:observedGeneration': {}
              'f:readyReplicas': {}
              'f:replicas': {}
              'f:updatedReplicas': {}
          manager: kube-controller-manager
          operation: Update
          subresource: status
          time: '2024-07-07T22:51:02Z'
      name: nodeappdeployment
      namespace: default
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: nodeapp
          type: backend
      strategy:
        rollingUpdate:
          maxSurge: 25%
          maxUnavailable: 25%
        type: RollingUpdate
      template:
        metadata:
          annotations:
            kubectl.kubernetes.io/restartedAt: '2024-07-07T18:50:51-04:00'
          labels:
            app: nodeapp
            type: backend
          name: nodeapppod
        spec:
          containers:
            - image: us.gcr.io/${var.PROJECT_ID}/terraform/solo:latest
              imagePullPolicy: Always
              name: nodeappcontainer
              ports:
                - containerPort: 80
                  protocol: TCP
  EOF
}

resource "kubectl_manifest" "service" {
  depends_on = [docker_registry_image.image]
    yaml_body = <<-EOF
      apiVersion: v1
      kind: Service
      metadata:
        annotations:
          cloud.google.com/neg: '{"ingress":true}'
        finalizers:
          - service.kubernetes.io/load-balancer-cleanup
        managedFields:
          - apiVersion: v1
            fieldsType: FieldsV1
            fieldsV1:
              'f:metadata':
                'f:annotations':
                  .: {}
                  'f:kubectl.kubernetes.io/last-applied-configuration': {}
              'f:spec':
                'f:allocateLoadBalancerNodePorts': {}
                'f:externalTrafficPolicy': {}
                'f:internalTrafficPolicy': {}
                'f:ports':
                  .: {}
                  'k:{"port":3000,"protocol":"TCP"}':
                    .: {}
                    'f:port': {}
                    'f:protocol': {}
                    'f:targetPort': {}
                'f:selector': {}
                'f:sessionAffinity': {}
                'f:type': {}
            manager: HashiCorp
            operation: Update
            time: '2024-07-06T20:16:51Z'
          - apiVersion: v1
            fieldsType: FieldsV1
            fieldsV1:
              'f:metadata':
                'f:finalizers':
                  .: {}
                  'v:"service.kubernetes.io/load-balancer-cleanup"': {}
              'f:status':
                'f:loadBalancer':
                  'f:ingress': {}
            manager: cloud-controller-manager
            operation: Update
            subresource: status
            time: '2024-07-06T20:18:40Z'
        name: nodeapp-load-balancer-service
        namespace: default
      spec:
        allocateLoadBalancerNodePorts: true
        clusterIP: 34.118.237.61
        clusterIPs:
          - 34.118.237.61
        externalTrafficPolicy: Cluster
        internalTrafficPolicy: Cluster
        ipFamilies:
          - IPv4
        ipFamilyPolicy: SingleStack
        ports:
          - nodePort: 31929
            port: 3000
            protocol: TCP
            targetPort: 3000
        selector:
          app: nodeapp
          type: backend
        sessionAffinity: None
        type: LoadBalancer
      EOF
}

