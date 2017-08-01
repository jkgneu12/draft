#!/bin/bash

docker build -t api-service ./api-service
docker build -t drafts-service ./drafts-service
docker build -t stats-service ./stats-service
docker build -t optimizer-base -f ./optimizer-service/Dockerfile-base ./optimizer-service
docker build -t optimizer-service ./optimizer-service

