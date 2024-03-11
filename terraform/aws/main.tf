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

resource "aws_lambda_function" "pubpub_analytics_lambda" {
  filename      = "zips/lambda_function_${var.lambdasVersion}.zip"
  function_name = "pubpub_analytics_lambda"
  role          = aws_iam_role.pubpub_analytics_lambda_role.arn
  handler       = "lambda.handler"
  runtime       = "nodejs18.x"
  memory_size   = 1024
  timeout       = 300
}

resource "aws_lambda_function_url" "pubpub_analytics_lambda_funtion_url" {
  function_name      = aws_lambda_function.pubpub_analytics_lambda.id
  authorization_type = "NONE"
  cors {
    allow_origins = ["*"]
  }
}

