/** Indian mobile input only; accepts ten digits or an explicit +91 prefix. */
export function validIndianPhone(value) {
  if (!/^[+\d\s()-]+$/.test(value)) return false;
  const compact = value.replace(/[\s()-]/g, "");
  return /^(?:\+91)?[6-9]\d{9}$/.test(compact);
}

export function validContactName(value) {
  return value.trim().length > 0;
}
