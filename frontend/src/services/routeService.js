/**
 * Simple Traveling Salesperson (TSP) helper for the cockpit.
 * In a real app, this would call the Google Directions API Matrix or a custom backend solver.
 */

// Central Shop Location (T. Nagar area)
export const SHOP_ORIGIN = { lat: 13.0418, lng: 80.2341 };

export const MOCK_STOPS = [
  { 
    id: '1', 
    customerName: 'Anitha Sharma', 
    customerName_ta: 'அனிதா சர்மா',
    customerPhone: '+91 98400 12345', 
    lat: 13.0418, 
    lng: 80.2341, 
    deliveryAddress: 'Flat 4A, Green Meadows, T. Nagar',
    deliveryAddress_ta: 'பிளாட் 4ஏ, கிரீன் மெடோஸ், தி நகர்',
    shopName: 'Sri Krishna Sweets',
    shopName_ta: 'ஸ்ரீ கிருஷ்ணா ஸ்வீட்ஸ்',
    shopkeeperName: 'Murugan',
    shopkeeperName_ta: 'முருகன்',
    shopPhone: '+91 44 2345 6789',
    pickupAddress: 'G.N. Chetty Road, T. Nagar',
    pickupAddress_ta: 'ஜி. என். செட்டி சாலை, தி நகர்',
    payout: 45
  },
  { 
    id: '2', 
    customerName: 'Suresh Kumar', 
    customerName_ta: 'சுரேஷ் குமார்',
    customerPhone: '+91 99620 54321', 
    lat: 13.0295, 
    lng: 80.2435, 
    deliveryAddress: '12/5, Luz Church Rd, Mylapore',
    deliveryAddress_ta: '12/5, லஸ் சர்ச் ரோடு, மயிலாப்பூர்',
    shopName: 'Saravana Bhavan',
    shopName_ta: 'சரவண பவன்',
    shopkeeperName: 'Ranganathan',
    shopkeeperName_ta: 'ரங்கநாதன்',
    shopPhone: '+91 44 2461 4422',
    pickupAddress: 'Mylapore Tank',
    pickupAddress_ta: 'மயிலாப்பூர் டேங்க்',
    payout: 55
  },
  { 
    id: '3', 
    customerName: 'Priya Rajan', 
    customerName_ta: 'பிரியா ராஜன்',
    customerPhone: '+91 91760 98765', 
    lat: 13.0105, 
    lng: 80.2156, 
    deliveryAddress: 'Nandanam Extension, Adyar',
    deliveryAddress_ta: 'நந்தனம் எக்ஸ்டென்ஷன், আদியார்',
    shopName: 'Ganga Sweets',
    shopName_ta: 'கங்கா ஸ்வீட்ஸ்',
    shopkeeperName: 'Venkatesh',
    shopkeeperName_ta: 'வெங்கடேஷ்',
    shopPhone: '+91 44 2445 1122',
    pickupAddress: 'Besant Nagar',
    pickupAddress_ta: 'பெசன்ட் நகர்',
    payout: 40
  },
  { 
    id: '4', 
    customerName: 'Vikram Singh', 
    customerName_ta: 'விக்ரம் சிங்',
    customerPhone: '+91 94440 22110', 
    lat: 13.0521, 
    lng: 80.2123, 
    deliveryAddress: 'Shanthi Colony, Nungambakkam',
    deliveryAddress_ta: 'சாந்தி காலனி, நுங்கம்பாக்கம்',
    shopName: 'Hot Chips',
    shopName_ta: 'ஹாட் சிப்ஸ்',
    shopkeeperName: 'Senthil',
    shopkeeperName_ta: 'செந்தில்',
    shopPhone: '+91 44 2827 3456',
    pickupAddress: 'College Road',
    pickupAddress_ta: 'காலேஜ் ரோடு',
    payout: 60
  },
  { 
    id: '5', 
    customerName: 'Meera Iyer', 
    customerName_ta: 'மீரா ஐயர்',
    customerPhone: '+91 98840 77665', 
    lat: 13.0345, 
    lng: 80.2678, 
    deliveryAddress: 'Beach Road, Santhome',
    deliveryAddress_ta: 'பீச் ரோடு, சாந்தோம்',
    shopName: 'Adyar Ananda Bhavan',
    shopName_ta: 'அடையார் ஆனந்த பவன்',
    shopkeeperName: 'Karthik',
    shopkeeperName_ta: 'கார்த்திக்',
    shopPhone: '+91 44 2493 4567',
    pickupAddress: 'Mylapore',
    pickupAddress_ta: 'மயிலாப்பூர்',
    payout: 50
  },
];

/**
 * Mocks the route optimization.
 * In production, this would send stops to an API.
 */
export const optimizeRoute = async (origin, stops) => {
  // If no stops, just return origin
  if (stops.length === 0) return { sequence: [], polyline: [] };
  
  // Simulation: Just sort by distance from origin (simple Greedy)
  const sorted = [...stops].sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.lat - origin.lat, 2) + Math.pow(a.lng - origin.lng, 2));
    const distB = Math.sqrt(Math.pow(b.lat - origin.lat, 2) + Math.pow(b.lng - origin.lng, 2));
    return distA - distB;
  });

  return {
    sequence: sorted,
    // Provide a mocked polyline for the map (points from origin -> stops)
    polyline: [origin, ...sorted.map(s => ({ lat: s.lat, lng: s.lng }))]
  };
};
