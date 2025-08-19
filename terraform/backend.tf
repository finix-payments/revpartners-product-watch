terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
  backend "s3" {
    bucket         = "finix-terraform-qa"
    key            = "backend.tfstate"
    region         = "us-west-2"
    encrypt        = true
    use_lockfile   = true
    assume_role = {
      role_arn = "arn:aws:iam::830706739344:role/terraform-admin"
    }
  }
}

module "environment" {
  source    = "git@github.com:finix-payments/finix-terraform.git//aws/modules/constants/environments"
  workspace = terraform.workspace
}

provider "aws" {
  region = module.environment.values.region
}
