# Yellow House MVP - Legal & Privacy

## Table of Contents
1. [Terms of Service](#terms-of-service)
2. [Privacy Policy](#privacy-policy)
3. [Cookie Policy](#cookie-policy)
4. [Data Processing Agreement](#data-processing-agreement)

---

## Terms of Service

**Last Updated**: 2024-03-02
**Effective**: 2024-03-02

### 1. Acceptance of Terms

By accessing and using Yellow House ("Service"), you accept and agree to be bound by the terms, conditions, and notices contained herein. If you do not agree to abide by the above, please do not use this service.

### 2. Use License

Permission is granted to temporarily download one copy of the materials (information or software) on Yellow House for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:

- Modifying or copying the materials
- Using the materials for any commercial purpose or for any public display
- Attempting to decompile or reverse engineer any software contained on the service
- Removing any copyright or other proprietary notations from the materials
- Transferring the materials to another person or "mirroring" the materials on any other server

### 3. User Accounts

You are responsible for maintaining the confidentiality of your login credentials. You agree to accept responsibility for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.

### 4. Password Reset

- Reset tokens expire after 1 hour
- Tokens are single-use only
- Users must set passwords of at least 8 characters

### 5. User Content

You are responsible for any content you submit, post, display, or transmit through the service. You agree that you own or have necessary rights to the content you submit.

### 6. Limitation of Liability

IN NO EVENT SHALL YELLOW HOUSE BE LIABLE FOR ANY DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

### 7. Termination

We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms of Service.

### 8. Governing Law

These Terms and Conditions are governed by and construed in accordance with the laws of Switzerland, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.

---

## Privacy Policy

**Last Updated**: 2024-03-02
**Effective**: 2024-03-02

### 1. Introduction

Yellow House ("we" or "us" or "our") operates the Service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.

### 2. Information Collection and Use

We collect information you provide directly to us, such as:

#### User Account Information
- Email address
- Name
- Timezone
- Password (hashed)

#### Availability Data
- Availability slots you mark
- Time slots and dates
- Group memberships

#### Usage Data
- Browser type and version
- IP address
- Pages visited
- Time spent on pages

### 3. Data Storage

- **Email**: Encrypted in PostgreSQL
- **Password**: Hashed using SHA-256 (will be upgraded to bcrypt)
- **Availability**: Stored in PostgreSQL with user ID reference
- **JWT Tokens**: Stored as hash in token_blacklist table on logout

### 4. Data Retention

| Data Type | Retention | Reason |
|-----------|-----------|--------|
| User Account | Until deletion | Account maintenance |
| Availability | 6 months | Scheduling history |
| Login Logs | 30 days | Security audit |
| JWT Blacklist | Token expiry + 1 day | Session invalidation |
| Error Logs | 30 days | Troubleshooting |

### 5. Data Sharing

We do NOT share your personal data with third parties except:
- Service providers (database hosting, email, analytics)
- Legal requirements (court orders, law enforcement)
- With your explicit consent

### 6. Security

We implement appropriate technical and organizational measures to protect your personal data, including:

- SSL/TLS encryption in transit
- Database encryption at rest
- JWT authentication for API calls
- Regular security audits
- Limited access to sensitive data

### 7. User Rights (GDPR Compliance)

You have the right to:
- **Access**: Request a copy of your data
- **Correction**: Update incorrect information
- **Deletion**: Request erasure of your data (right to be forgotten)
- **Portability**: Receive your data in a portable format
- **Objection**: Opt-out of certain data processing

**Submit requests to**: privacy@mountaincoders.ch

### 8. Children's Privacy

Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13.

### 9. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.

### 10. Contact

If you have any questions about this Privacy Policy, please contact us at:

**Email**: privacy@mountaincoders.ch  
**Address**: Mountaincoders, Switzerland

---

## Cookie Policy

**Last Updated**: 2024-03-02

### 1. What are Cookies?

Cookies are small data files that are placed on your browser or device. Cookies are widely used to make websites work more efficiently and to provide information to the owners of the website.

### 2. Cookies Used by Yellow House

| Cookie | Purpose | Duration | Type |
|--------|---------|----------|------|
| `access_token` | Authentication | 7 days | HttpOnly, Secure |
| `refresh_token` | Session refresh | 7 days | HttpOnly, Secure |
| `__Secure-*` | CSRF protection | Session | Secure |
| `analytics_id` | User tracking (optional) | 2 years | Persistent |

### 3. Cookie Settings

You can control cookie preferences:
- Browser cookie settings: [How to disable cookies](https://www.wikihow.com/Disable-Cookies)
- Opt out of analytics: [Cookie consent settings](https://yellowhouse.app/settings/cookies)

### 4. Third-Party Cookies

Third parties (analytics providers) may place cookies to track usage.

---

## Data Processing Agreement

### 1. Data Controller & Processor

- **Controller**: Mountaincoders GmbH (operator of Yellow House)
- **Processor**: Users who create and manage groups

### 2. Personal Data Processing

Personal data collected includes:
- User registration data
- Availability scheduling data
- Authentication logs

### 3. Processing Activities

| Activity | Legal Basis | Purpose |
|----------|-------------|---------|
| User Authentication | Contract | Account access |
| Availability Scheduling | Contract | Facilitating group coordination |
| Security Logging | Legitimate Interest | System security |
| Error Reporting | Legitimate Interest | Service improvement |
| Analytics | Consent | Usage optimization |

### 4. Data Subject Rights

Users have rights to:
- View their personal data
- Correct inaccurate data
- Request deletion
- Data portability
- Restrict processing
- Object to processing

### 5. Sub-processors

Current sub-processors:
- **Database**: Amazon RDS (PostgreSQL)
- **Hosting**: Vercel
- **Analytics**: (None currently in MVP)
- **Email**: (To be configured)

### 6. Data Protection Measures

- Encryption in transit (TLS 1.3)
- Encryption at rest (AES-256 via cloud provider)
- Access controls (IAM roles)
- Monitoring and logging
- Regular security assessments

### 7. Data Breach Notification

In case of data breach:
1. We will notify users within 72 hours
2. Notification includes: nature of breach, likely consequences, measures taken
3. Contact via email to account email address

### 8. International Data Transfers

Data is stored and processed within the EU. If transfers outside EU occur, adequate safeguards are in place.

### 9. Retention Periods

- User accounts: Until deletion by user
- Availability data: 6 months after group deletion
- Logs: 30 days
- Backups: 1 year (for disaster recovery)

### 10. Contact

Data Protection Officer: dpo@mountaincoders.ch

---

## Impressum (Imprint)

**Service Provider**:  
Mountaincoders GmbH  
Street Address: Mountaincoders Office, Switzerland  
Email: info@mountaincoders.ch  
Phone: +41 (0) TBD  
VAT ID: CHE-TBD  

**Responsible Editor**:  
Elmar Weiher (CEO)  
Email: elmar@mountaincoders.ch

**Disclaimer**:  
Despite careful monitoring of content, we assume no liability for the content of external links. The operators of linked pages are solely responsible for their content.

---

**Compliance Checklist**:

- [ ] GDPR compliant (EU)
- [ ] CCPA compliant (California)
- [ ] PIPEDA compliant (Canada)
- [ ] Swiss DPA compliant
- [ ] Privacy policy published
- [ ] Cookie policy published
- [ ] Data Processing Agreement ready
- [ ] Breach notification plan documented
- [ ] Data retention policies enforced
- [ ] User rights process documented

---

**Last Reviewed**: 2024-03-02
**Next Review**: 2024-09-02
**Maintained By**: Legal Team
