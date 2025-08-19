# After this is created, get the api token from hubspot and add it in AWS
resource "aws_secretsmanager_secret" "hubspot_api_token" {
  name        = "hubspot/api-token" # no spaces allowed in names
  description = "HubSpot webhook API token for Lambda"
}
