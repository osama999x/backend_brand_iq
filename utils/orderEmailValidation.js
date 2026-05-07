/**
 * Order checkout email checks: format + block common disposable / temp domains.
 */

const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const DISPOSABLE_EMAIL_DOMAINS = new Set([
    "yopmail.com",
    "yopmail.fr",
    "yopmail.net",
    "mailinator.com",
    "guerrillamail.com",
    "guerrillamail.org",
    "guerrillamail.net",
    "tempmail.com",
    "10minutemail.com",
    "throwaway.email",
    "trashmail.com",
    "fakeinbox.com",
    "getnada.com",
    "maildrop.cc",
    "sharklasers.com",
    "grr.la",
    "guerrillamailblock.com",
    "temp-mail.org",
    "dispostable.com",
    "mintemail.com",
    "emailondeck.com",
    "burnermail.io",
    "moakt.com",
    "mailnesia.com",
    "tempail.com",
    "inboxkitten.com",
]);

function normalizeOrderEmail(raw) {
    if (raw == null) return "";
    if (typeof raw !== "string") return "";
    return raw.trim().toLowerCase();
}

function isValidOrderEmail(email) {
    if (!email || email.length > 254) return false;
    return EMAIL_REGEX.test(email);
}

function getEmailDomain(email) {
    const at = email.lastIndexOf("@");
    if (at < 0 || at === email.length - 1) return "";
    return email.slice(at + 1);
}

function isDisposableEmailDomain(email) {
    const domain = getEmailDomain(email);
    if (!domain) return true;
    return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

module.exports = {
    normalizeOrderEmail,
    isValidOrderEmail,
    isDisposableEmailDomain,
};
