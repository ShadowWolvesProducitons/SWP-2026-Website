"""
Email Service for Shadow Wolves Productions
Uses Resend API for sending emails
"""
import os
import asyncio
import resend

# Configure Resend
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@shadowwolvesproductions.com.au')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://www.shadowwolvesproductions.com.au')


def get_email_wrapper(content: str) -> str:
    """Wrap email content in branded HTML template"""
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">
                                Shadow Wolves Productions
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="background-color: #111111; border: 1px solid #222; border-radius: 8px; padding: 30px;">
                            {content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding-top: 30px;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                © 2024 Shadow Wolves Productions Pty Ltd. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"""


async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email using Resend"""
    if not RESEND_API_KEY:
        print("Warning: RESEND_API_KEY not configured")
        return False
    
    try:
        resend.api_key = RESEND_API_KEY
        
        wrapped_content = get_email_wrapper(html_content)
        
        await asyncio.to_thread(resend.Emails.send, {
            "from": FROM_EMAIL,
            "to": to_email,
            "subject": subject,
            "html": wrapped_content
        })
        
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False


async def send_verification_email(to_email: str, full_name: str, verification_url: str) -> bool:
    """Send email verification link for studio portal access"""
    subject = "Verify Your Email - Shadow Wolves Productions Studio Portal"
    
    content = f"""
    <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">Verify Your Email</h2>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        Hi {full_name},
    </p>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        Thank you for requesting access to the Shadow Wolves Productions Studio Portal. 
        Please click the button below to verify your email address and complete your account setup.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{verification_url}" 
           style="display: inline-block; background-color: #233dff; color: #ffffff; 
                  text-decoration: none; padding: 14px 30px; border-radius: 50px; 
                  font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Verify Email & Set Password
        </a>
    </div>
    
    <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This link will expire in 72 hours. If you didn't request access, you can safely ignore this email.
    </p>
    
    <p style="color: #233dff; margin-top: 30px;">
        — Shadow Wolves Productions
    </p>
    """
    
    return await send_email(to_email, subject, content)


async def send_password_reset_email(to_email: str, full_name: str, reset_url: str) -> bool:
    """Send password reset link"""
    subject = "Reset Your Password - Shadow Wolves Productions"
    
    content = f"""
    <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">Reset Your Password</h2>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        Hi {full_name},
    </p>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        We received a request to reset your password for the Shadow Wolves Productions Studio Portal.
        Click the button below to set a new password.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{reset_url}" 
           style="display: inline-block; background-color: #233dff; color: #ffffff; 
                  text-decoration: none; padding: 14px 30px; border-radius: 50px; 
                  font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Reset Password
        </a>
    </div>
    
    <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
    </p>
    
    <p style="color: #233dff; margin-top: 30px;">
        — Shadow Wolves Productions
    </p>
    """
    
    return await send_email(to_email, subject, content)


async def send_access_granted_email(to_email: str, full_name: str, role: str, projects: list = None) -> bool:
    """Send notification when access is granted or updated"""
    subject = "Access Updated - Shadow Wolves Productions Studio Portal"
    
    projects_html = ""
    if projects:
        projects_html = f"""
        <p style="color: #9ca3af; line-height: 1.6;">
            You now have access to the following projects:
        </p>
        <ul style="color: #9ca3af; margin: 15px 0;">
            {"".join(f'<li>{p}</li>' for p in projects)}
        </ul>
        """
    
    content = f"""
    <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">Access Updated</h2>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        Hi {full_name},
    </p>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        Your access to the Shadow Wolves Productions Studio Portal has been updated.
    </p>
    
    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="color: #ffffff; margin: 0;"><strong>Role:</strong> {role}</p>
    </div>
    
    {projects_html}
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{FRONTEND_URL.rstrip('/')}/studio-access" 
           style="display: inline-block; background-color: #233dff; color: #ffffff; 
                  text-decoration: none; padding: 14px 30px; border-radius: 50px; 
                  font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Go to Portal
        </a>
    </div>
    
    <p style="color: #233dff; margin-top: 30px;">
        — Shadow Wolves Productions
    </p>
    """
    
    return await send_email(to_email, subject, content)


async def send_access_revoked_email(to_email: str, full_name: str) -> bool:
    """Send notification when access is revoked"""
    subject = "Access Revoked - Shadow Wolves Productions"
    
    content = f"""
    <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 20px;">Access Revoked</h2>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        Hi {full_name},
    </p>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        Your access to the Shadow Wolves Productions Studio Portal has been revoked.
    </p>
    
    <p style="color: #9ca3af; line-height: 1.6; margin-bottom: 20px;">
        If you believe this is an error, please contact us at 
        <a href="mailto:{ADMIN_EMAIL}" style="color: #233dff;">{ADMIN_EMAIL}</a>
    </p>
    
    <p style="color: #233dff; margin-top: 30px;">
        — Shadow Wolves Productions
    </p>
    """
    
    return await send_email(to_email, subject, content)
