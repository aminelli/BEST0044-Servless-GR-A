#!/bin/bash

# Azure Container App Deployment Script
# Prerequisites:
# - Azure CLI installed and logged in (az login)
# - Docker Installed and running
# - Una Subscript Azure valida

# Configuration
RESOURCE_GROUP="BEST0044-GR-A-Servless"
LOCATION="northeurope"
ACR_NAME="acrwebappcustomers"
CONTAINER_APP_ENV="container-env-prod"
CONTAINER_APP_NAME="webapp-customers"
MYSQL_SERVER_NAME="mysql-webapp-customers"
MYSQL_DATABASE="customers_db"
MYSQL_ADMIN_USER="adminuser"
MYSQL_ADMIN_PASSWORD="AdminPassword123!" # Cambia esto por una contraseña segura
IMAGE_NAME="webapp-customers"
IMAGE_TAG="latest"

echo "Avvio del processo di deployment..."

# Creazione Resource Group
echo "Creazione del Resource Group: $RESOURCE_GROUP..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry
echo "Creazione dell'Azure Container Registry: $ACR_NAME..."
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --location $LOCATION \
    --admin-enabled true

# Get ACR Credentials
echo "Recupero delle credenziali dell'ACR..."
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)

# Build and Push Docker Image to ACR
echo "Costruzione e push dell'immagine Docker su ACR..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .
docker tag $IMAGE_NAME:$IMAGE_TAG $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD
docker push $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG

# Crea Azire Database per MySql Flexible Server
echo "Creazione del MySQL Flexible Server: $MYSQL_SERVER_NAME..."
az mysql flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $MYSQL_SERVER_NAME \
    --location $LOCATION \
    --admin-user $MYSQL_ADMIN_USER \
    --admin-password $MYSQL_ADMIN_PASSWORD \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --version 8.0.21 \
    --public-access all
    #--public-access 0.0.0.0-255.255.255.255

# Crea Database
echo "Creazione del database: $MYSQL_DATABASE..."
az mysql flexible-server db create \
    --resource-group $RESOURCE_GROUP \
    --server-name $MYSQL_SERVER_NAME \
    --name $MYSQL_DATABASE

MYSQL_HOST="$MYSQL_SERVER_NAME.mysql.database.azure.com"

# Lancio query su flexible-server
echo "Configurazione del database..."
az mysql flexible-server query \
    --resource-group $RESOURCE_GROUP \
    --server-name $MYSQL_SERVER_NAME \
    --query "CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL);"



# Create Container App Environment
echo "Creazione dell'ambiente per Container App: $CONTAINER_APP_ENV..."
az containerapp env create \
    --name $CONTAINER_APP_ENV \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION

# Create Container App
echo "Creazione della Container App: $CONTAINER_APP_NAME..."
az containerapp create \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --environment $CONTAINER_APP_ENV \
    --image $ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG \
    --registry-server $ACR_LOGIN_SERVER \
    --registry-username $ACR_USERNAME \
    --registry-password $ACR_PASSWORD \
    --target-port 3000 \
    --ingress external \
    --min-replicas 1 \
    --max-replicas 5 \
    --cpu 0.5 \
    --memory 1Gi \
    --env-vars \
        NODE_ENV=production \
        DB_HOST=$MYSQL_HOST \
        DB_PORT=3306 \ 
        DB_USER=$MYSQL_ADMIN_USER \
        DB_PASSWORD=$MYSQL_ADMIN_PASSWORD \
        DB_NAME=$MYSQL_DATABASE \
        PORT=3000 \
        CLOUD_PROVIDER=azure

# Get app Url
APP_URL=$(az containerapp show \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn \
    --output tsv)

ecoh "Deployment completato! La tua applicazione è disponibile all'indirizzo: http://$APP_URL"

