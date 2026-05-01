import urllib.request
import json
import urllib.parse
import logging

logger = logging.getLogger(__name__)

def geocode_address(address):
    """
    Converts a physical address to latitude and longitude using OpenStreetMap Nominatim API.
    Returns (lat, lng) or (None, None) if not found.
    """
    if not address:
        return None, None
        
    try:
        # Append region for better accuracy if not present
        search_query = address
        if "Tamil Nadu" not in address:
            search_query = f"{address}, Tamil Nadu, India"
            
        query = urllib.parse.quote(search_query)
        # Using format=jsonv2 as per Nominatim guidelines
        url = f"https://nominatim.openstreetmap.org/search?q={query}&format=jsonv2&limit=1"
        
        headers = {
            'User-Agent': 'KadaiConnectDelivery/1.0 (vigneshr05r-ship-it)'
        }
        
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data and len(data) > 0:
                return data[0]['lat'], data[0]['lon']
            
    except Exception as e:
        logger.error(f"Geocoding error for address '{address}': {str(e)}")
        
    return None, None
