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

variable "service_account_email" {
  description = "email for service account you granted roles to"
  type = string
}

variable "google_compute_zone" {
  type    = string
  description = "compute zone you want to use (example: us-central1)"
}

variable "google_compute_region" {
  type    = string
  description = "compute region you want to use (example: us-central1-a)"
}

variable "project_id" {
  type = string
  description = "google project id"
}

variable "project_number" {
  type = string
  description = "google project number"
}

variable "SA_credentials" {
  type = string
  description = "google service account credentials in json format ONE LINE"
}

variable "github_token" {
  type = string
  description = "your generated auth token for github"
}

variable "app_installation_id" {
  type = string
  description = "google cloud build installation id(found in url)"
}

variable "github_url" {
  type = string
  description = "github repo url"
}

provider "google" {
  project=var.project_id
  credentials = <<-EOF
  ${var.SA_credentials}
EOF

  region=var.google_compute_region
  zone = var.google_compute_zone
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
  name = "us.gcr.io/${var.project_id}/terraform/solo:latest"
  build {
    context = "."
  }
}

resource "google_project_service" "enabled_service" {
  for_each = toset(local.services)
  project = var.project_id
  service = each.key
}

resource "google_container_cluster" "primary" {
  depends_on = [google_project_service.enabled_service]
  name     = "primary"
  location = var.google_compute_region
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
  location   = var.google_compute_region
  cluster    = google_container_cluster.primary.name
  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = var.service_account_email
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
  secret_data = var.github_token
}

data "google_iam_policy" "p4sa-secretAccessor" {
  binding {
    role = "roles/secretmanager.secretAccessor"
    // Here, 123456789 is the Google Cloud project number for the project that contains the connection.
    members = ["serviceAccount:service-${var.project_number}@gcp-sa-cloudbuild.iam.gserviceaccount.com"]
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
  location = var.google_compute_region
  name = "my-connection"
  
  github_config {
    app_installation_id = var.app_installation_id
    authorizer_credential {
      oauth_token_secret_version = google_secret_manager_secret_version.github-token-secret-version.id
    }
  }
}

resource "google_cloudbuildv2_repository" "my-repository" {
  depends_on = [google_cloudbuildv2_connection.my-connection]
  name = "solo-project"
  location = var.google_compute_region
  parent_connection = google_cloudbuildv2_connection.my-connection.name
  remote_uri = var.github_url
}

resource "google_cloudbuild_trigger" "my-trigger" {
  location = var.google_compute_region
  name     = "my-trigger"
  filename = "cloudbuild.yaml"
  repository_event_config {
    repository = google_cloudbuildv2_repository.my-repository.id
    push {
      branch = "^main$"
    }
  }
  service_account = "projects/${var.project_id}/serviceAccounts/${var.service_account_email}"
}

provider "kubectl" {
  host = "https://${google_container_cluster.primary.endpoint}"
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = "${base64decode(google_container_cluster.primary.master_auth.0.cluster_ca_certificate)}"
  load_config_file = false
}

resource "kubectl_manifest" "deploy" {
  depends_on = [docker_registry_image.image]
    yaml_body = file("k8s/deploy.yml")
}
resource "kubectl_manifest" "service" {
  depends_on = [docker_registry_image.image]
    yaml_body = file("k8s/service.yml")
}

