from twilio.rest import Client

# Replace with your Twilio credentials
ACCOUNT_SID = "your_sid"
AUTH_TOKEN = "your_token"
TWILIO_NUM = "+1XXXXXXXX"
TARGET_NUM = "+91XXXXXXXXXX"

def send_alert(msg):
    client = Client(ACCOUNT_SID, AUTH_TOKEN)
    message = client.messages.create(
        body=msg,
        from_=TWILIO_NUM,
        to=TARGET_NUM
    )
    return message.sid
