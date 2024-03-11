variable "lambdasVersion" {
  type        = string
  description = "version of the lambdas zip on S3"
}

variable "STITCH_WEBHOOK_URL" {
  description = "Stitch endpoint we forward the validated payload to (include https://)"
  type        = string
}
