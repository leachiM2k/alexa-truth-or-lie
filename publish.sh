#!/bin/bash
LAMBDA_NAME=TruthOrLie
ZIP_FILE=$LAMBDA_NAME-dist.zip

rm -f $ZIP_FILE
zip -X -r $ZIP_FILE *.js data/*.js node_modules/
aws lambda update-function-code --function-name $LAMBDA_NAME --zip-file fileb://$ZIP_FILE
