variable project_name {
  description = "The name of the project, used for naming resources."
  type        = string
  default     = "revpartners-hubspot-automation"
}

variable nodejs_runtime {
  description = "The Node.js runtime version for the Lambda function."
  type        = string
  default     = "nodejs22.x"
}
