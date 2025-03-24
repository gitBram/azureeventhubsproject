# Configure the Azure provider
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0.2"
    }
  }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
  subscription_id = "b937d7b8-9859-448d-bdc7-72ad4012e669"
}

resource "azurerm_resource_group" "rg1" {
  name     = "rg-eh-1"
  location = "northeurope"

  tags = {
    environment = "dev"
  }
}

resource "azurerm_resource_group" "kv1" {
  name     = "rg-eh-1"
  location = azurerm_resource_group.rg1.location
}

resource "azurerm_service_plan" "sp1" {
  name                = "sp-eh-1"
  resource_group_name = azurerm_resource_group.rg1.name
  location            = azurerm_resource_group.rg1.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "lwap1" {
  name                = "lwa-eh-publisher-1"
  resource_group_name = azurerm_resource_group.rg1.name
  location            = azurerm_service_plan.sp1.location
  service_plan_id     = azurerm_service_plan.sp1.id

  site_config {}
}

resource "azurerm_linux_web_app" "lwas1" {
  name                = "lwa-eh-subscriber-1"
  resource_group_name = azurerm_resource_group.rg1.name
  location            = azurerm_service_plan.sp1.location
  service_plan_id     = azurerm_service_plan.sp1.id

  site_config {}
}
