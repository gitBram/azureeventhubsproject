// General variables
variable "azure_subscription_id" {
  type        = string
  description = "The subscription id where to deploy the resources."
  default     = "b937d7b8-9859-448d-bdc7-72ad4012e669"
}

variable "resource_group_location" {
  type        = string
  description = "Location for all resources."
  default     = "northeurope"
}

variable "resource_group_name_prefix" {
  type        = string
  description = "Prefix of the resource group name that's combined with a random ID so name is unique in your Azure subscription."
  default     = "rg"
}

// SQL Server variables
variable "sql_db_name" {
  type        = string
  description = "The name of the SQL database."
  default     = "sampleDatabase"
}

variable "sql_admin_username" {
  type        = string
  description = "Admin username for the SQL database."
  default     = "originalUsername"
}

variable "sql_admin_password" {
  type        = string
  description = "Admin password for the SQL database."
  default     = "verySecretPassword"
}