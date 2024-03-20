function deploy {
  # Generate a version number based on a date timestamp so that it's unique
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  # Run the npm commands to transpile the TypeScript to JavaScript
  rm -rf dist &&
    pnpm i &&
    pnpm build &&
    # Create a dist folder and copy only the js files to dist.
    # AWS Lambda does not have a use for a package.json or typescript files on runtime.
    cd dist &&
    find . -name "*.zip" -type f -delete &&
    # Zip everything in the dist folder and
    zip -r lambda_function_${TIMESTAMP}.zip . &&
    cp lambda_function_${TIMESTAMP}.zip ../terraform/aws/zips &&
    cd .. &&
    cd terraform/aws &&
    terraform plan -input=false -var lambdasVersion="${TIMESTAMP}" -out=./tfplan &&
    terraform apply -input=false ./tfplan
}

deploy
