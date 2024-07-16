#!/bin/bash

set -e 

handle_error() {
    echo "Error occurred in build process at $1"
    exit 1
}

echo "Install dependencies backend"
cd backend
mkdir uploads
cd uploads
mkdir images && mkdir videos && mkdir profils
cd ..
npm i 
cd ..

echo "Install dependencies frontend"
cd frontend
npm i
cd ..

echo "Build process completed successfully."