# Security Guidelines

## Environment Variables & Credentials

This project uses environment variables to store sensitive information like API keys, database credentials, and secrets. **Never commit real credentials to version control.**

### Required Environment Variables

Copy `env.example` to `.env` and fill in your actual values:

```bash
cp env.example .env
```

#### Database Configuration
- `DB_HOST` - Database host (usually localhost for development)
- `DB_PORT` - Database port (usually 5432 for PostgreSQL)
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password

#### JWT Configuration
- `JWT_SECRET` - Secret key for JWT token signing (use a strong, random string)
- `SECRET_KEY` - General secret key for the application

#### Email Configuration (SendGrid)
- `SENDGRID_API_KEY` - Your SendGrid API key
- `EMAIL_FROM` - Email address to send from
- `EMAIL_FROM_NAME` - Display name for emails

#### SMS Configuration (Twilio)
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number

#### Google OAuth (Optional)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

### Security Best Practices

1. **Never commit `.env` files** - They are automatically ignored by git
2. **Use strong, unique secrets** - Generate random strings for JWT_SECRET
3. **Rotate credentials regularly** - Especially in production
4. **Use different credentials for development/production**
5. **Monitor API usage** - Check for unusual activity

### Files Automatically Ignored

The following files are automatically ignored by git to prevent credential leaks:
- `.env*` files
- `config.env`
- `backend/config.env`
- Any files containing `*credentials*`
- Files with API key patterns (`SENDGRID_*`, `TWILIO_*`, etc.)

### Production Deployment

For production deployment:
1. Set up environment variables in your hosting platform
2. Use a proper domain for email sending (not Gmail)
3. Configure SPF, DKIM, and DMARC records for email deliverability
4. Use HTTPS for all communications
5. Regularly update dependencies for security patches
