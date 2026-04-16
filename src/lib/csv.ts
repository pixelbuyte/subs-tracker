const FORMULA_PREFIX = /^[\t\r ]*[=+\-@]/;

function neutralizeFormula(value: string) {
  if (FORMULA_PREFIX.test(value)) {
    return `'${value}`;
  }

  return value;
}

export function csvEscapeCell(value: unknown) {
  const raw = value == null ? '' : String(value);
  const sanitized = neutralizeFormula(raw);

  if (/[",\n]/.test(sanitized)) {
    return `"${sanitized.replaceAll('"', '""')}"`;
  }

  return sanitized;
}
