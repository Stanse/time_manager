"""
Telegram WebApp authentication (Pattern: Strategy)
"""
import hmac
import hashlib
from urllib.parse import parse_qs
from fastapi import HTTPException, Header
from typing import Optional

from src.config.settings import get_settings


class TelegramAuth:
    """Telegram WebApp authentication"""

    @staticmethod
    def validate_init_data(init_data: str) -> dict:
        """
        Validate Telegram WebApp initData

        Security check according to Telegram documentation:
        https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        """
        settings = get_settings()

        try:
            # Parse init data
            parsed_data = parse_qs(init_data)

            # Get hash
            received_hash = parsed_data.get('hash', [None])[0]
            if not received_hash:
                raise HTTPException(status_code=401, detail="Hash not found")

            # Prepare data for verification
            data_check_arr = []
            for key, value in parsed_data.items():
                if key != 'hash':
                    data_check_arr.append(f"{key}={value[0]}")

            data_check_arr.sort()
            data_check_string = '\n'.join(data_check_arr)

            # Calculate secret key
            secret_key = hmac.new(
                key=b"WebAppData",
                msg=settings.telegram_bot_token.encode(),
                digestmod=hashlib.sha256
            ).digest()

            # Calculate hash
            calculated_hash = hmac.new(
                key=secret_key,
                msg=data_check_string.encode(),
                digestmod=hashlib.sha256
            ).hexdigest()

            # Verify hash
            if calculated_hash != received_hash:
                raise HTTPException(status_code=401, detail="Invalid hash")

            # Parse user data
            import json
            user_data = json.loads(parsed_data.get('user', ['{}'])[0])

            return user_data

        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> dict:
    """Dependency for getting current user from Telegram init data"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Remove 'Bearer ' prefix if present
    init_data = authorization.replace('Bearer ', '')

    return TelegramAuth.validate_init_data(init_data)
