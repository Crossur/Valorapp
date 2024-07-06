terraform {
  required_providers {
    google = {
      source  = "registry.terraform.io/hashicorp/google"
    }
     kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.7.0"
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


provider "google" {
  project="terraform-on-gcp-428202"
  credentials = file("credentials.json")
  region="us-east1"
  zone = "us-east1-b"
}

data "google_client_config" "provider" {}

resource "google_project_service" "enabled_service" {
  for_each = toset(local.services)
  project = "terraform-on-gcp-428202"
  service = each.key
}

resource "google_container_cluster" "primary" {
  depends_on = [google_project_service.enabled_service]
  name     = "primary"
  location = "us-east1"
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
  location   = "us-east1"
  cluster    = google_container_cluster.primary.name
  node_count = 1

  node_config {
    preemptible  = true
    machine_type = "e2-medium"

    # Google recommends custom service accounts that have cloud-platform scope and permissions granted via IAM Roles.
    service_account = "terraform-sa@terraform-on-gcp-428202.iam.gserviceaccount.com"
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
  secret_data = file("my-github-token.txt")
}

data "google_iam_policy" "p4sa-secretAccessor" {
  binding {
    role = "roles/secretmanager.secretAccessor"
    // Here, 123456789 is the Google Cloud project number for the project that contains the connection.
    members = ["serviceAccount:service-795992676862@gcp-sa-cloudbuild.iam.gserviceaccount.com"]
  }
}

resource "google_secret_manager_secret_iam_policy" "policy" {
  project = google_secret_manager_secret.secret-basic.project
  secret_id = google_secret_manager_secret.secret-basic.secret_id
  policy_data = data.google_iam_policy.admin.policy_data
}

resource "google_cloudbuildv2_connection" "my-connection" {
  location = "us-central1"
  name = "my-connection"
  
  github_config {
    authorizer_credential {
      oauth_token_secret_version = google_secret_manager_secret_version.github-token-secret-version.id
    }
  }
}

provider "kubectl" {
  host = "https://${google_container_cluster.primary.endpoint}"
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = "${base64decode(google_container_cluster.primary.master_auth.0.cluster_ca_certificate)}"
  load_config_file = false
}

resource "kubectl_manifest" "deploy" {
    yaml_body = file("k8s/deploy.yml")
}

resource "kubectl_manifest" "service" {
    yaml_body = file("k8s/service.yml")
}

