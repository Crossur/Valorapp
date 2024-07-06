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
  depends_on = [google_secret_manager_secret.github-token-secret,data.google_iam_policy.p4sa-secretAccessor]
  project = google_secret_manager_secret.github-token-secret.project
  secret_id = google_secret_manager_secret.github-token-secret.secret_id
  policy_data = data.google_iam_policy.p4sa-secretAccessor.policy_data
}

resource "google_cloudbuildv2_connection" "my-connection" {
  depends_on = [google_secret_manager_secret_iam_policy.policy]
  location = "us-central1"
  name = "my-connection"
  
  github_config {
    app_installation_id = 51725755
    authorizer_credential {
      oauth_token_secret_version = google_secret_manager_secret_version.github-token-secret-version.id
    }
  }
}

resource "google_cloudbuildv2_repository" "my-repository" {
  depends_on = [google_cloudbuildv2_connection.my-connection]
  name = "solo-project"
  location = "us-central1"
  parent_connection = google_cloudbuildv2_connection.my-connection.name
  remote_uri = "https://github.com/Crossur/Solo-Project.git"
}

resource "google_cloudbuild_trigger" "my-trigger" {
  location = "us-central1"
  name     = "my-trigger"
  filename = "cloudbuild.yaml"
  repository_event_config {
    repository = google_cloudbuildv2_repository.my-repository.id
    push {
      branch = "^main$"
    }
  }
  service_account = "projects/terraform-on-gcp-428202/serviceAccounts/terraform-sa@terraform-on-gcp-428202.iam.gserviceaccount.com"
  # github {
  #   owner = "crossur"
  #   name  = "solo-project"
  #   push {
  #     branch = "^main$"
  #   }
  # }
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

