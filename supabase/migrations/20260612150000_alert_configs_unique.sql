-- T14: Add unique constraint on (org_id, department_id) for alert_configs
-- Required for upsert via onConflict in upsertAlertConfigAction.
create unique index if not exists idx_alert_configs_org_dept
  on alert_configs(org_id, department_id);
