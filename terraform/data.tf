data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/.." # repo root (one level up from infra/)
  output_path = "${path.module}/lambda.zip"
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}
