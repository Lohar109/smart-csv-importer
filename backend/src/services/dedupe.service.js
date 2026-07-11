function normalizeEmail(record) {
  return (record.email || '').trim().toLowerCase();
}

/**
 * Strips spaces, dashes, parentheses, and a leading country-code prefix so
 * the same number written differently ("+91 98765-43210" vs "9876543210")
 * still compares equal. Indian/most mobile numbers are 10 digits, so any
 * extra leading digits are assumed to be a country code and dropped.
 */
function normalizePhone(record) {
  const raw = `${record.mobile_without_country_code || ''}`;
  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return '';
  return digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
}

/**
 * Tags records that share a normalized email or mobile number with an
 * earlier record in the same batch. The first occurrence is left
 * untouched; later occurrences are marked is_duplicate with a
 * duplicate_of pointer back to the first occurrence's index.
 */
function markDuplicates(records) {
  const firstSeenByEmail = new Map();
  const firstSeenByPhone = new Map();

  return records.map((record, index) => {
    const email = normalizeEmail(record);
    const phone = normalizePhone(record);

    let duplicateOfIndex = null;
    if (email && firstSeenByEmail.has(email)) {
      duplicateOfIndex = firstSeenByEmail.get(email);
    } else if (phone && firstSeenByPhone.has(phone)) {
      duplicateOfIndex = firstSeenByPhone.get(phone);
    }

    if (duplicateOfIndex === null) {
      if (email) firstSeenByEmail.set(email, index);
      if (phone) firstSeenByPhone.set(phone, index);
    }

    return {
      ...record,
      is_duplicate: duplicateOfIndex !== null,
      duplicate_of: duplicateOfIndex,
    };
  });
}

module.exports = { markDuplicates };
