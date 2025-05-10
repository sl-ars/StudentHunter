from django.utils import timezone
from datetime import timedelta
from django.db.models.functions import TruncDay, TruncMonth

def get_date_range_and_trunc(period_str):
    """
    Calculates a start date, end date (now), and a truncation function 
    based on a period string ('week', 'month', 'year').
    """
    now = timezone.now()
    end_date = now # End date is always now for these analytics periods

    if period_str == 'week':
        start_date = now - timedelta(days=6) # Inclusive of today, so 7 days total
        trunc_function = TruncDay
    elif period_str == 'year':
        start_date = now - timedelta(days=364) # Inclusive of today, so 365 days total
        trunc_function = TruncMonth
    else:  # Default to 'month'
        # To get roughly 30 days inclusive of today, adjust based on typical month lengths
        # Or simply use a fixed number of days like 29 for a 30-day period including today
        start_date = now - timedelta(days=29) 
        trunc_function = TruncDay
    return start_date.replace(hour=0, minute=0, second=0, microsecond=0), end_date, trunc_function 