# Example Azure Event Hubs Project

## Introduction

This project is an example project to show possible functionality of Azure Event Hubs (AEH).

It includes following components:

* Publisher App:
  * React.js frontend + Node.js backend that emulates a number of IoT devices sending temperature and humidity data to an AEH.
* Subscriber App:
  * React.js frontend + Node.js backend that fetches historical data from the SQL database and subscribes to the AEH, receiving live data updates and displaying those on a graph together with the historical data.

The app comes together using AEH. IoT sensor data is published to AEH. This data is directly sent to the subscriber app, as well as logged into a SQL Server database from where the app fetches historical data after refreshing.

## Getting started

### Deploying Resources in Azure using Terraform

In order to be fully functional, the project needs to be deployed to Azure. Open a shell and run following commands.

Before deploying the resources, the correct subscription id needs to be pasted into file `./terraform/variables.tf`. Other changes can conveniently be made there, such as changing the SQL database username and password, the prefix used in the name of all created resources and more.

terraform init
terraform plan --tfplan
terraform apply --tfplan

Running these commands will deploy all needed Azure resources (SQL Server database, Azure Event Hub, Stream Analytics Job, 2 Azure App Services).

### Setting up Github Repo

In the settings of the git repo, set up the following 2 variables with the according Azure App Service publish profile: `AZURE_WEB_APP_PROFILE_PUBLISH_APP` and `AZURE_WEB_APP_PROFILE_SUBSCRIBE_APP`. This will assure that the code can be successfully deployed to both web apps.

### Setting Environment Variables in Azure App Services

#### Publisher App

##### Frontend


| Env Var Name | Env Var Explanation | Env Var Example Val |
| -------------- | --------------------- | --------------------- |
| REACT_       |                     |                     |
|              |                     |                     |

##### Backend


| Env Var Name | Env Var Explanation | Env Var Example Val |
| -------------- | --------------------- | --------------------- |
|              |                     |                     |
|              |                     |                     |

#### Subscriber App

##### Frontend


| Env Var Name | Env Var Explanation | Env Var Example Val |
| -------------- | --------------------- | --------------------- |
|              |                     |                     |
|              |                     |                     |

##### Backend


| Env Var Name | Env Var Explanation | Env Var Example Val |
| -------------- | --------------------- | --------------------- |
|              |                     |                     |
|              |                     |                     |
