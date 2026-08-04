import logging
from mailjet_rest import Client
from django.conf import settings
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired

logger = logging.getLogger(__name__)

def generate_verification_token(user_id):
    """Generates a cryptographically signed user ID token that expires in 24 hours."""
    signer = TimestampSigner()
    return signer.sign(user_id)

def verify_token(token, max_age=86400):  # 86400 seconds = 24 hours
    """Verifies the signed token and returns the user ID if valid."""
    signer = TimestampSigner()
    try:
        user_id = signer.unsign(token, max_age=max_age)
        return user_id
    except SignatureExpired:
        logger.warning(f"Signature expired for token: {token}")
        return None
    except BadSignature:
        logger.warning(f"Invalid signature token attempt: {token}")
        return None

def send_verification_email(email, user_id, student_name):
    """Dispatches a confirmation email using the Mailjet API."""
    token = generate_verification_token(user_id)
    verification_link = f"{settings.EMAIL_VERIFICATION_URL}?token={token}"
    
    mailjet = Client(auth=(settings.MAILJET_API_KEY, settings.MAILJET_API_SECRET), version='v3.1')
    
    data = {
      'Messages': [
        {
          "From": {
            "Email": settings.MAILJET_SENDER_EMAIL,
            "Name": "Library Administrator"
          },
          "To": [
            {
              "Email": email,
              "Name": student_name
            }
          ],
          "Subject": "Verify Your Library Account",
          "TextPart": f"Hello {student_name}, please verify your account by clicking the link: {verification_link}",
          "HTMLPart": f"""
          <h3>Welcome to the Library Management System!</h3>
          <p>Hi {student_name},</p>
          <p>Please click the link below to verify your email address and activate your account:</p>
          <p><a href="{verification_link}" style="padding: 10px 20px; background-color: #E0B220; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a></p>
          <p>If the button doesn't work, copy and paste this link: {verification_link}</p>
          <p>This verification link will expire in 24 hours.</p>
          """
        }
      ]
    }
    
    try:
        result = mailjet.send.create(data=data)
        if result.status_code == 200:
            logger.info(f"Verification email successfully sent to {email}")
            return True
        else:
            logger.error(f"Mailjet API Error: {result.status_code} - {result.json()}")
            return False
    except Exception as e:
        logger.error(f"Exception raised while sending email: {str(e)}")
        return False
