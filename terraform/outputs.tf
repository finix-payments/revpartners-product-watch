output "webhook_url" {
  description = "POST this URL for the webhook"
  value       = "${aws_apigatewayv2_api.http_api.api_endpoint}/webhook"
}

output "lambda_name" {
  value = aws_lambda_function.webhook.function_name
}

output "lambda_arn" {
  value = aws_lambda_function.webhook.arn
}
