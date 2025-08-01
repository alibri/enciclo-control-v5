// lib/primevue-compat.ts

export const FilterMatchMode = {
  STARTS_WITH: 'startsWith',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'notContains',
  ENDS_WITH: 'endsWith',
  EQUALS: 'equals',
  NOT_EQUALS: 'notEquals',
  IN: 'in',
  NOT_IN: 'notIn',
  LT: 'lt',
  LTE: 'lte',
  GT: 'gt',
  GTE: 'gte',
  BETWEEN: 'between',
  DATE_IS: 'dateIs',
  DATE_IS_NOT: 'dateIsNot',
  DATE_BEFORE: 'dateBefore',
  DATE_AFTER: 'dateAfter',
  CUSTOM: 'custom'
}

export const FilterOperator = {
  AND: 'and',
  OR: 'or'
}

export const PrimeIcons = {
  HOME: 'pi pi-home',
  SEARCH: 'pi pi-search',
  USER: 'pi pi-user',
  CALENDAR: 'pi pi-calendar',
  TIMES: 'pi pi-times',
  CHECK: 'pi pi-check',
  PLUS: 'pi pi-plus',
  MINUS: 'pi pi-minus',
  TRASH: 'pi pi-trash',
  PENCIL: 'pi pi-pencil',
  // Añade más según tu uso
}

export const ZIndexUtils = {
  modal: 1100,
  overlay: 1000,
  menu: 1000,
  tooltip: 1100,
  toast: 1200,
}
