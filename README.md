# PubPub Analytics Lambda

Small lambda function to handle PubPub analytics events.

## Setup

```sh
git clone https://github.com/pubpub/pubpub-analytics-lambda.git --recurse-submodules
```

First make sure you have terraform installed

```sh
brew install terraform
```

Then make sure you have AWS credentials set up

Set up your AWS credentials in `~/.aws/credentials` like so (or run `aws configure`)

```
[pubpub]
aws_access_key_id = XXXX
aws_secret_access_key = XXXX
```

and your `~/.aws/config` like so

```
[default]
output = json

[pubpub]
region = us-east-1
output = json
```

Then run

```sh
AWS_PROFILE=pubpub
# or for fish
# set -x AWS_PROFILE pubpub
```

Then you can initialize the terraform project

```sh
cd terraform/aws
terraform init
```

## Deploy

Once you have made the necessary changes to the lambda function, you can deploy by running

```sh
pnpm run deploy
# not `pnpm deploy`, because that's a reserved command
```

in the root of the project.

And you should be done.
