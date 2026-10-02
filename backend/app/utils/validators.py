import re

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

VALID_GOALS = [
    'Emergency Fund',
    'Education',
    'Retirement',
    'Wealth Creation',
    'Home Purchase',
    'Other'
]

VALID_RISK_TOLERANCES = ['Low', 'Medium', 'High']

def validate_email(email):
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    email = email.strip()
    if len(email) > 120 or not re.match(EMAIL_REGEX, email):
        return False, "Please provide a valid email address."
    return True, None

def validate_password(password):
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one digit."
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character (!@#$%^&*...)."
    return True, None

def validate_financial_profile(data):
    errors = {}

    # Age
    age = data.get('age')
    if age is None or age == '':
        errors['age'] = "Age is required."
    else:
        try:
            age = int(age)
            if age < 18 or age > 100:
                errors['age'] = "Age must be between 18 and 100."
        except (ValueError, TypeError):
            errors['age'] = "Age must be a valid integer."

    # Monthly Income
    income = data.get('monthly_income')
    if income is None or income == '':
        errors['monthly_income'] = "Monthly income is required."
    else:
        try:
            income = float(income)
            if income <= 0:
                errors['monthly_income'] = "Monthly income must be greater than 0."
        except (ValueError, TypeError):
            errors['monthly_income'] = "Monthly income must be a valid number."

    # Current Savings
    savings = data.get('current_savings')
    if savings is None or savings == '':
        errors['current_savings'] = "Current savings amount is required."
    else:
        try:
            savings = float(savings)
            if savings < 0:
                errors['current_savings'] = "Current savings cannot be negative."
        except (ValueError, TypeError):
            errors['current_savings'] = "Current savings must be a valid number."

    # Planned Investment
    planned = data.get('planned_investment')
    if planned is None or planned == '':
        errors['planned_investment'] = "Planned investment amount is required."
    else:
        try:
            planned = float(planned)
            if planned <= 0:
                errors['planned_investment'] = "Planned investment must be greater than 0."
        except (ValueError, TypeError):
            errors['planned_investment'] = "Planned investment must be a valid number."

    # Investment Duration
    duration = data.get('investment_duration')
    if duration is None or duration == '':
        errors['investment_duration'] = "Investment duration is required."
    else:
        try:
            duration = int(duration)
            if duration < 1 or duration > 40:
                errors['investment_duration'] = "Investment duration must be between 1 and 40 years."
        except (ValueError, TypeError):
            errors['investment_duration'] = "Duration must be an integer (years)."

    # Risk Tolerance
    risk = data.get('risk_tolerance')
    if not risk or risk not in VALID_RISK_TOLERANCES:
        errors['risk_tolerance'] = f"Risk tolerance must be one of: {', '.join(VALID_RISK_TOLERANCES)}"

    # Financial Goal
    goal = data.get('financial_goal')
    if not goal or goal not in VALID_GOALS:
        errors['financial_goal'] = f"Financial goal must be one of: {', '.join(VALID_GOALS)}"

    return (len(errors) == 0), errors
