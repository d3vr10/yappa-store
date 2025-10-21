// Session timeout in seconds. Default is 30 minutes (1800 seconds).
export const SESSION_TIMEOUT: number = 1800;

// if set to false, session will expire when client IP was changed.
export const SESSION_IGNORE_CHANGE_IP: boolean = false;

// Mail detail message of '500 internal server error' to webmaster: true, false.
// If set to true, iredadmin will mail detail error to webmaster when
// it catches 'internal server error' via LOCAL mail server to aid
// in debugging production servers.
export const MAIL_ERROR_TO_WEBMASTER: boolean = false;

// Logging
// Log target: 'syslog' | 'stdout'.
// If set to 'syslog', parameters start with SYSLOG_ below are required.
export const LOG_TARGET: 'syslog' | 'stdout' = 'syslog';

// Log level. Used by all logging handlers.
export const LOG_LEVEL: 'info' | 'warn' | 'error' | 'debug' = 'info';

// Syslog
// Syslog server address. Log to local syslog socket by default.
// Syslog socket path:
// - /dev/log on Linux/OpenBSD
// - /var/run/log on FreeBSD.
// Some distro running systemd may have incorrect permission on /dev/log, it's
// ok to use alternative syslog socket /run/systemd/journal/syslog instead.
export const SYSLOG_SERVER: string = '/dev/log';
export const SYSLOG_PORT: number = 514;

// Syslog facility
export const SYSLOG_FACILITY: string = 'local5';

// Log programming error in SQL database, and viewed in 'System -> Admin Log'.
// This should be used only in testing server, not on production server, because
// the error message may contain sensitive information.
export const LOG_PROGRAMMING_ERROR_IN_SQL: boolean = false;

// Skin/theme. iRedAdmin will use CSS files and HTML templates under
// - statics/{skin}/
// - templates/{skin}/
export const SKIN: string = 'default';

// Local timezone. It must be one of below:
export type Timezone =
  | 'GMT-12:00'
  | 'GMT-11:00'
  | 'GMT-10:00'
  | 'GMT-09:30'
  | 'GMT-09:00'
  | 'GMT-08:00'
  | 'GMT-07:00'
  | 'GMT-06:00'
  | 'GMT-05:00'
  | 'GMT-04:30'
  | 'GMT-04:00'
  | 'GMT-03:30'
  | 'GMT-03:00'
  | 'GMT-02:00'
  | 'GMT-01:00'
  | 'GMT'
  | 'GMT+01:00'
  | 'GMT+02:00'
  | 'GMT+03:00'
  | 'GMT+03:30'
  | 'GMT+04:00'
  | 'GMT+04:30'
  | 'GMT+05:00'
  | 'GMT+05:30'
  | 'GMT+05:45'
  | 'GMT+06:00'
  | 'GMT+06:30'
  | 'GMT+07:00'
  | 'GMT+08:00'
  | 'GMT+08:45'
  | 'GMT+09:00'
  | 'GMT+09:30'
  | 'GMT+10:00'
  | 'GMT+10:30'
  | 'GMT+11:00'
  | 'GMT+11:30'
  | 'GMT+12:00'
  | 'GMT+12:45'
  | 'GMT+13:00'
  | 'GMT+14:00';

export const LOCAL_TIMEZONE: Timezone = 'GMT';

// RESTful API
// Enable RESTful API
export const ENABLE_RESTFUL_API: boolean = false;

// Restrict API access to specified IP addresses or networks.
// If not allowed, client will receive error message 'NOT_AUTHORIZED'
export const RESTFUL_API_CLIENTS: string[] = [];

// For standalone admin account.
// Hide SQL columns (for SQL editions) or LDAP attributes (for LDAP backends)
// in admin or user profiles.
// If you need to verify admin password, use API endpoint '/api/verify_password/admin/<mail>' instead.
export const API_HIDDEN_ADMIN_PROFILES: string[] = ['password', 'userPassword'];
export const API_HIDDEN_USER_PROFILES: string[] = ['password', 'userPassword'];

// Domain ownership verification settings
export const REQUIRE_DOMAIN_OWNERSHIP_VERIFICATION: boolean = true;

// How long should we remove verified or (inactive) unverified domain ownerships.
export const DOMAIN_OWNERSHIP_EXPIRE_DAYS: number = 30;

// The string prefixed to verify code. Must be shorter than 60 characters.
export const DOMAIN_OWNERSHIP_VERIFY_CODE_PREFIX: string =
  'iredmail-domain-verification-';

// Timeout (in seconds) while performing each verification.
export const DOMAIN_OWNERSHIP_VERIFY_TIMEOUT: number = 10;

// General settings
// Show percentage of mailbox quota usage. Require parameter SQL_TBL_USED_QUOTA.
export const SHOW_USED_QUOTA: boolean = true;

// SQL table used to store real-time mailbox quota usage.
// - For SQL backends, it's stored in SQL db 'vmail'.
// - For LDAP backend, it's stored in SQL db 'iredadmin'.
export const SQL_TBL_USED_QUOTA: string = 'used_quota';

// Default password scheme, must be a string.
export type PasswordScheme =
  | 'BCRYPT'
  | 'SSHA512'
  | 'SSHA'
  | 'PLAIN'
  | 'MD5'
  | 'PLAIN-MD5';

export const DEFAULT_PASSWORD_SCHEME: PasswordScheme = 'SSHA';

// List of password schemes which should not prefix scheme name in generated hash.
// Currently, only this setting impacts NTLM only.
export const HASHES_WITHOUT_PREFIXED_PASSWORD_SCHEME: string[] = ['NTLM'];

// Allow storing password in plain text.
export const STORE_PASSWORD_IN_PLAIN_TEXT: boolean = false;

// Always store plain password in additional LDAP attribute of user object, or SQL column (in 'vmail.mailbox' table).
// Value must be a valid LDAP attribute name of user object, or SQL column name in 'vmail.mailbox' table.
export const STORE_PLAIN_PASSWORD_IN_ADDITIONAL_ATTR: string = '';

// Set password last change date for newly created user. Defaults to true.
export const SET_PASSWORD_CHANGE_DATE_FOR_NEW_USER: boolean = true;

// Password restrictions
export const PASSWORD_SPECIAL_CHARACTERS: string = `#$%&*+-,.:;!=<>'"?@[]/(){}_\`~`;
export const PASSWORD_HAS_LETTER: boolean = true;
export const PASSWORD_HAS_UPPERCASE: boolean = true;
export const PASSWORD_HAS_NUMBER: boolean = true;
export const PASSWORD_HAS_SPECIAL_CHAR: boolean = true;

// Log PERMISSION_DENIED operations to stdout or web server log file.
export const LOG_PERMISSION_DENIED: boolean = true;

// Redirect to "Domains and Accounts" page instead of Dashboard.
export const REDIRECT_TO_DOMAIN_LIST_AFTER_LOGIN: boolean = false;

// List of IP addresses/networks which global admins are allowed to login from.
// Valid formats:
// - Single IP address: "192.168.1.1"
// - IPv4/IPv6 network: "192.168.1.0/24"
export const GLOBAL_ADMIN_IP_LIST: string[] = [];

// List of IP addresses/networks which (both global and normal) admins are allowed to login from.
export const ADMIN_LOGIN_IP_LIST: string[] = [];

// List all local transports.
export const LOCAL_TRANSPORTS: string[] = [
  'dovecot',
  'lmtp:unix:private/dovecot-lmtp',
  'lmtp:inet:127.0.0.1:24',
];

// Redirect to which page after logged in.
// Available values: "preferences", "quarantined", "received", "wblist", "spampolicy"
export type SelfServiceDefaultPage =
  | 'preferences'
  | 'quarantined'
  | 'received'
  | 'wblist'
  | 'spampolicy';

export const SELF_SERVICE_DEFAULT_PAGE: SelfServiceDefaultPage = 'preferences';

// Maildir related
// Mailbox format (in lower cases)
export type MailboxFormat = 'maildir' | 'mdbox' | string;

export const MAILBOX_FORMAT: MailboxFormat = 'maildir';

// It's RECOMMENDED for better performance.
export const MAILDIR_HASHED: boolean = true;

// Prepend domain name in path.
export const MAILDIR_PREPEND_DOMAIN: boolean = true;

// Append timestamp in path.
export const MAILDIR_APPEND_TIMESTAMP: boolean = true;

// Avoid too many folders (domain name) in same directory.
export const MAILDIR_DOMAIN_HASHED: boolean = false;

// Default folder used to store mailbox under per-user HOME directory.
// Folder name is case sensitive.
export const MAILBOX_FOLDER: string = 'Maildir';

// How many days the normal domain admin can choose to keep the mailbox after account removal.
export const DAYS_TO_KEEP_REMOVED_MAILBOX: number[] = [
  1, 7, 14, 21, 30, 60, 90, 180, 365,
];

// How many days the global domain admin can choose to keep the mailbox after account removal.
// 0 means keeping forever.
export const DAYS_TO_KEEP_REMOVED_MAILBOX_FOR_GLOBAL_ADMIN: number[] = [
  0, 1, 7, 14, 21, 30, 60, 90, 180, 365, 730, 1095,
];

// MySQL/PostgreSQL backend related settings
export const USER_ALIAS_CROSS_ALL_DOMAINS: boolean = false;

// List all global admins while listing per-domain admins.
export const SHOW_GLOBAL_ADMINS_IN_PER_DOMAIN_ADMIN_LIST: boolean = false;

// iRedAPD related settings
// Query insecure outbound session in last hours.
export const IREDAPD_QUERY_INSECURE_OUTBOUND_IN_HOURS: number = 24;

// Amavisd related settings
export const AMAVISD_QUARANTINE_HOST: string = '';

// Remove old SQL records of sent/received mails in Amavisd database.
// NOTE: require cron job with script tools/cleanup_amavisd_db.py.
export const AMAVISD_REMOVE_MAILLOG_IN_DAYS: number = 3;

// Remove old SQL records of quarantined mails.
export const AMAVISD_REMOVE_QUARANTINED_IN_DAYS: number = 7;

// Prefix text to the subject of spam
export const AMAVISD_SPAM_SUBJECT_PREFIX: string = '[SPAM] ';

// Show non-local mail domains/users on mail logs and statistics.
export const AMAVISD_SHOW_NON_LOCAL_DOMAINS: boolean = false;

// Query size limit for cleanup script.
export const AMAVISD_CLEANUP_QUERY_SIZE_LIMIT: number = 100;

// Additional Amavisd ban rules.
export const AMAVISD_BAN_RULES: Record<string, string> = {};

// Show how many top senders/recipients on Dashboard page.
export const NUM_TOP_SENDERS: number = 10;
export const NUM_TOP_RECIPIENTS: number = 10;

// Query statistics for last X hours.
export const STATISTICS_HOURS: number = 24;

// iRedAdmin related settings
// Keep iRedAdmin admin log for days.
export const IREDADMIN_LOG_KEPT_DAYS: number = 365;

// mlmmj and mlmmjadmin RESTful API related settings
export const NEWSLETTER_BASE_URL: string = '/newsletter';

export const NEWSLETTER_SUBSCRIPTION_REQUEST_EXPIRE_HOURS: number = 24;
export const NEWSLETTER_UNSUBSCRIPTION_REQUEST_EXPIRE_HOURS: number = 24;
export const NEWSLETTER_SUBSCRIPTION_REQUEST_KEEP_HOURS: number = 24;

export const MLMMJADMIN_API_BASE_URL: string = 'http://127.0.0.1:7790/api';
export const MLMMJADMIN_API_AUTH_HEADER: string = 'X-MLMMJADMIN-API-AUTH-TOKEN';
export const MLMMJADMIN_API_VERIFY_SSL: boolean = false;

// The transport name defined in Postfix master.cf used to call 'mlmmj-receive' program.
export const MLMMJ_MTA_TRANSPORT_NAME: string = 'mlmmj';

// Recipient delimiters.
export const RECIPIENT_DELIMITERS: string[] = ['+'];

// Show how many items in one page.
export const PAGE_SIZE_LIMIT: number = 50;

// Smallest uid/gid number which can be assigned to new users/groups.
export const MIN_UID: number = 3000;
export const MIN_GID: number = 3000;

// The link to support page on iRedAdmin footer.
export const URL_SUPPORT: string = 'https://www.iredmail.org/support.html';

// Path to the logo image and favicon.ico.
// Please copy your logo image to 'static/' folder, then put the image file name
// in BRAND_LOGO.  e.g.: 'logo.png' (will load file 'static/logo.png').
export const BRAND_LOGO: string = '';
export const BRAND_FAVICON: string = '';

// Product name, short description.
export const BRAND_NAME: string = 'iRedAdmin';
export const BRAND_DESC: string = 'iRedMail Admin Panel';

// Path to sendmail command
export const CMD_SENDMAIL: string = '/usr/sbin/sendmail';

// SMTP server address, port, username, password used to send notification mail.
export const NOTIFICATION_SMTP_SERVER: string = 'localhost';
export const NOTIFICATION_SMTP_PORT: number = 587;
export const NOTIFICATION_SMTP_STARTTLS: boolean = true;
export const NOTIFICATION_SMTP_USER: string = 'no-reply@localhost.local';
export const NOTIFICATION_SMTP_PASSWORD: string = '';
export const NOTIFICATION_SMTP_DEBUG_LEVEL: number = 0;

// The short description or full name of this smtp user. e.g. 'No Reply'
export const NOTIFICATION_SENDER_NAME: string = 'No Reply';

// Used in notification emails sent to recipients of quarantined emails.
// URL of your iRedAdmin-Pro login page which will be shown in notification email,
// so that user can login to manage quarantined emails.
export const NOTIFICATION_URL_SELF_SERVICE: string = '';

// Subject of notification email. Available placeholders: %(total)d -- number of quarantined mails in total
export const NOTIFICATION_QUARANTINE_MAIL_SUBJECT: string =
  '[Attention] You have %(total)d emails quarantined and not delivered to mailbox';
