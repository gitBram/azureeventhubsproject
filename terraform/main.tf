// Set up the RG
resource "azurerm_resource_group" "rg1" {
  name     = format("rg-%s-1", var.resource_group_name_prefix)
  location = var.resource_group_location
}

// Set up SQL Server resources
resource "random_password" "admin_password" {
  count       = var.sql_admin_password == null ? 1 : 0
  length      = 20
  special     = true
  min_numeric = 1
  min_upper   = 1
  min_lower   = 1
  min_special = 1
}

locals {
  sql_admin_password = try(random_password.admin_password[0].result, var.sql_admin_password)
}

resource "azurerm_mssql_server" "server1" {
  name                         = format("sqls-%s-1", var.resource_group_name_prefix)
  resource_group_name          = azurerm_resource_group.rg1.name
  location                     = azurerm_resource_group.rg1.location
  administrator_login          = var.sql_admin_username
  administrator_login_password = local.sql_admin_password
  version                      = "12.0"
}

resource "azurerm_mssql_firewall_rule" "appServiceIP" {
  name                = "AllowAccessFromAzure"
  server_id           = azurerm_mssql_server.server1.id
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0"
}

resource "azurerm_mssql_database" "db1" {
  name      = var.sql_db_name
  server_id = azurerm_mssql_server.server1.id
}

// Set up the app services
resource "azurerm_service_plan" "sp1" {
  name                = format("sp-%s-1", var.resource_group_name_prefix)
  resource_group_name = azurerm_resource_group.rg1.name
  location            = azurerm_resource_group.rg1.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "lwap1" {
  name                = format("lwa-%s-publisher-1", var.resource_group_name_prefix)
  resource_group_name = azurerm_resource_group.rg1.name
  location            = azurerm_service_plan.sp1.location
  service_plan_id     = azurerm_service_plan.sp1.id

  site_config {}
}

resource "azurerm_linux_web_app" "lwas1" {
  name                = format("lwa-%s-subscriber-1", var.resource_group_name_prefix)
  resource_group_name = azurerm_resource_group.rg1.name
  location            = azurerm_service_plan.sp1.location
  service_plan_id     = azurerm_service_plan.sp1.id

  site_config {}
}

// Set up the Event Hub
resource "azurerm_eventhub_namespace" "aen1" {
  name                = format("aen-%s-1", var.resource_group_name_prefix)
  location            = azurerm_resource_group.rg1.location
  resource_group_name = azurerm_resource_group.rg1.name
  sku                 = "Standard"
  capacity            = 1
}

resource "azurerm_eventhub" "ae1" {
  name              = format("ae-%s-1", var.resource_group_name_prefix)
  namespace_name      = azurerm_eventhub_namespace.aen1.name
  resource_group_name = azurerm_resource_group.rg1.name
  partition_count   = 1
  message_retention = 1
}

resource "azurerm_eventhub_consumer_group" "ecg1" {
  name                = format("ecg-%s-1", var.resource_group_name_prefix)
  namespace_name      = azurerm_eventhub_namespace.aen1.name
  eventhub_name       = azurerm_eventhub.ae1.name
  resource_group_name = azurerm_resource_group.rg1.name
}

// Stream Analytics for streaming data into the SQL database
// https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/stream_analytics_output_mssql
locals {
  stream_analytics_input_name = "eventhubInput"
  stream_analytics_output_name = "mssqlOutput"
}

resource "azurerm_stream_analytics_job" "saj1" {
  name                = format("saj-%s-1", var.resource_group_name_prefix)
  resource_group_name = azurerm_resource_group.rg1.name
  location            = azurerm_resource_group.rg1.location
  streaming_units                          = 1
  transformation_query = format("SELECT * INTO %s FROM %s", local.stream_analytics_output_name, local.stream_analytics_input_name)
}

resource "azurerm_stream_analytics_stream_input_eventhub" "sai1" {
  name                         = local.stream_analytics_input_name
  stream_analytics_job_name    = azurerm_stream_analytics_job.saj1.name
  resource_group_name          = azurerm_stream_analytics_job.saj1.resource_group_name
  eventhub_consumer_group_name = azurerm_eventhub_consumer_group.ecg1.name
  eventhub_name                = azurerm_eventhub.ae1.name
  servicebus_namespace         = azurerm_eventhub_namespace.aen1.name
  shared_access_policy_key     = azurerm_eventhub_namespace.aen1.default_primary_key
  shared_access_policy_name    = "RootManageSharedAccessKey"

  serialization {
    type     = "Json"
    encoding = "UTF8"
  }
}

resource "azurerm_stream_analytics_output_mssql" "sao1" {
  name                      = local.stream_analytics_output_name
  stream_analytics_job_name = azurerm_stream_analytics_job.saj1.name
  resource_group_name       = azurerm_stream_analytics_job.saj1.resource_group_name

  server   = azurerm_mssql_server.server1.fully_qualified_domain_name
  user     = azurerm_mssql_server.server1.administrator_login
  password = azurerm_mssql_server.server1.administrator_login_password
  database = azurerm_mssql_database.db1.name
  table    = "EventsTable"
}

