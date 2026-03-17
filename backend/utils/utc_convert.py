from datetime import datetime
import pytz


def convert_to_vn(time: str):
    dt_utc = datetime.fromisoformat(time.replace("Z", "+00:00"))
    vn_tz = pytz.timezone("Asia/Ho_Chi_Minh")
    dt_vn = dt_utc.astimezone(vn_tz)
    return dt_vn


if __name__ == "__main__":
    iso_str = "2025-08-11T17:00:00.000Z"

    # Parse UTC
    dt_utc = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))

    # Convert sang VN
    vn_tz = pytz.timezone("Asia/Ho_Chi_Minh")
    dt_vn = dt_utc.astimezone(vn_tz)

    print(dt_vn)  # 2025-08-12 00:00:00+07:00
