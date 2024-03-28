terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
  backend "s3" {
    bucket = "pubpub-tfstates"
    key    = "pubpub-analytics-lambda.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_iam_role" "pubpub_analytics_lambda_role" {
  name = "pubpub-analytics-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"

        }
      }
    ]
  })
}


resource "aws_secretsmanager_secret" "stitch_webhook_url" {
  name = "stitch-webhook-url-pubpub-analytics"
}

data "aws_secretsmanager_secret_version" "stitch_webhook_url" {
  secret_id = aws_secretsmanager_secret.stitch_webhook_url.id
}

resource "aws_lambda_function" "pubpub_analytics_lambda" {
  description   = "A super simple lambda that validates an analytics payload and forwards it to stitch"
  filename      = "zips/lambda_function_${var.lambdasVersion}.zip"
  function_name = "pubpub_analytics_lambda"
  role          = aws_iam_role.pubpub_analytics_lambda_role.arn
  handler       = "lambda.handler"
  runtime       = "nodejs18.x"
  memory_size   = 1024
  timeout       = 300
  environment {
    variables = {
      STITCH_WEBHOOK_URL = jsondecode(data.aws_secretsmanager_secret_version.stitch_webhook_url.secret_string).STITCH_WEBHOOK_URL
    }
  }
}

resource "aws_lambda_function_url" "pubpub_analytics_lambda_funtion_url" {
  function_name      = aws_lambda_function.pubpub_analytics_lambda.id
  authorization_type = "NONE"
  cors {
    allow_origins = ["*"]
  }
}


resource "aws_cloudwatch_log_group" "pubpub_analytics_lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.pubpub_analytics_lambda.function_name}"
  retention_in_days = 7
  lifecycle {
    prevent_destroy = false
  }
}

resource "aws_iam_policy" "pubpub_analytics_lambda_logging_policy" {
  name = "pubpub-analytics-lambda-logging-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:*:*:*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "pubpub_analyitcs_lamba_logging_policy_attachment" {
  role       = aws_iam_role.pubpub_analytics_lambda_role.name
  policy_arn = aws_iam_policy.pubpub_analytics_lambda_logging_policy.arn
}
