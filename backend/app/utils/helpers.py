import re
from flask import request, jsonify

def get_client_ip():
    """Extracts client IP from proxy headers or remote_addr."""
    if request.headers.getlist("X-Forwarded-For"):
        ip = request.headers.getlist("X-Forwarded-For")[0].split(',')[0].strip()
    elif request.headers.get("X-Real-IP"):
        ip = request.headers.get("X-Real-IP").strip()
    else:
        ip = request.remote_addr or '127.0.0.1'
    return ip

def parse_user_agent(ua_string=None):
    """
    Infers client browser and operating system from User-Agent string.
    NOTE: User-Agent strings can be spoofed or missing. This inference is for 
    monitoring telemetry and cannot definitively verify device identity.
    """
    ua = ua_string or request.headers.get('User-Agent', '')
    
    # OS Detection
    os_name = "Unknown OS"
    if "Windows NT 10.0" in ua or "Windows NT 11.0" in ua:
        os_name = "Windows 10/11"
    elif "Windows" in ua:
        os_name = "Windows"
    elif "Macintosh" in ua or "Mac OS X" in ua:
        os_name = "macOS"
    elif "Linux" in ua and "Android" not in ua:
        os_name = "Linux"
    elif "Android" in ua:
        os_name = "Android"
    elif "iPhone" in ua or "iPad" in ua:
        os_name = "iOS"

    # Browser Detection
    browser_name = "Unknown Browser"
    if "Edg/" in ua:
        browser_name = "Microsoft Edge"
    elif "Chrome/" in ua and "Edg/" not in ua and "OPR/" not in ua:
        browser_name = "Google Chrome"
    elif "Firefox/" in ua:
        browser_name = "Mozilla Firefox"
    elif "Safari/" in ua and "Chrome/" not in ua:
        browser_name = "Apple Safari"
    elif "OPR/" in ua or "Opera" in ua:
        browser_name = "Opera"
    elif "PostmanRuntime" in ua:
        browser_name = "Postman API Client"
    elif "curl" in ua.lower():
        browser_name = "cURL Terminal"

    return {
        'browser': browser_name,
        'os': os_name,
        'raw_ua': ua[:250] if ua else 'N/A'
    }

def success_response(data=None, message="Operation successful", status_code=200):
    response = {
        'success': True,
        'message': message,
        'data': data
    }
    return jsonify(response), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    response = {
        'success': False,
        'message': message,
        'errors': errors
    }
    return jsonify(response), status_code

from datetime import timezone

def format_iso_utc(dt):
    """
    Ensures a datetime object is serialized to an explicit UTC ISO 8601 string with 'Z' suffix.
    Guarantees frontend JavaScript parses the timestamp as UTC and converts to browser local time.
    """
    if not dt:
        return None
    if isinstance(dt, str):
        if not dt.endswith('Z') and '+' not in dt and '-' not in dt[10:]:
            return dt + 'Z'
        return dt
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    else:
        dt = dt.astimezone(timezone.utc)
    return dt.isoformat().replace('+00:00', 'Z')
