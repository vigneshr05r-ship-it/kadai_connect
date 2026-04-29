from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import os

class PricePredictionView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        product_name = str(request.data.get('product_name') or '').lower()
        category = str(request.data.get('category') or '').lower()
        
        # Base market prices for demonstration purposes
        base_price = 100
        
        if 'saree' in product_name or 'silk' in product_name:
            base_price = 3000
        elif 'cotton' in product_name:
            base_price = 450
        elif 'lamp' in product_name or 'diya' in product_name:
            base_price = 600
        elif 'cracker' in product_name or 'sparkler' in product_name:
            base_price = 350
        elif 'sweet' in product_name or 'pak' in product_name or 'laddu' in product_name:
            base_price = 250
        elif 'service' in product_name or 'repair' in product_name:
            base_price = 500
        elif 'rice' in product_name or 'dal' in product_name:
            base_price = 65
            
        # Simulate local market demand fluctuation (0% to +15% markup based on demand)
        # Using a slight hash of the product name to make it consistent but pseudo-random
        hash_val = sum(ord(c) for c in product_name)
        demand_markup = (hash_val % 15) / 100.0  
        
        # Calculate predicted market price
        suggested_price = base_price * (1.0 + demand_markup)
        
        # Round to nearest 5 rupees for a clean price tag
        suggested_price = round(suggested_price / 5) * 5 
        
        if suggested_price <= 0:
            suggested_price = 150
            
        return Response({
            'predicted_price': int(suggested_price),
            'base_market_price': base_price,
            'demand_markup': f"{int(demand_markup * 100)}%"
        })

import random

class MarketingGeneratorView(APIView):
    permission_classes = [AllowAny]

    TEMPLATES = {
        'Tailoring': [
            "Precision fit, perfect style — our {name} service transforms your raw fabric into a masterpiece of sartorial elegance. Expert tailoring for every body type.",
            "Look your best in a custom-made {name}. We combine traditional stitching techniques with modern fits to ensure you stand out at every event.",
            "From heritage blouses to modern suits, our {name} service is dedicated to the art of the perfect fit. Your style, our expertise.",
        ],
        'Bakery': [
            "Freshly baked, delightfully sweet — our {name} is made with love and the finest ingredients for a taste that feels like home.",
            "Indulge in the artisanal goodness of our {name}. Baked fresh every morning, it's the perfect treat for any time of the day.",
            "From our oven to your plate, the {name} brings a burst of flavour and warmth. A local favourite for a reason!",
        ],
        'Carpentry': [
            "Crafting beauty from wood — our {name} service delivers custom furniture and repairs with heirloom quality. Built to last, designed for you.",
            "Professional carpentry you can trust. From modern cabinets to traditional woodworking, our {name} service brings your vision to life.",
            "Quality woodwork for your home. Our {name} combines strength and style to create spaces you'll love for years to come.",
        ],
        'Plumbing': [
            "Reliable plumbing for a stress-free home. Our {name} service handles everything from minor leaks to full installations with expert care.",
            "Expert plumbing solutions at your doorstep. We fix it right the first time — {name} services you can count on 24/7.",
            "Don't let a leak ruin your day. Our {name} service is fast, affordable, and professional. Quality plumbing for your peace of mind.",
        ],
    }

    FALLBACK = [
        "Introducing the {name} — a premium offering that combines quality, value, and reliability. Perfect for every occasion and trusted by thousands of local customers.",
        "The {name} redefines expectations. Crafted for those who refuse to settle for anything less than the best — discover the difference quality makes.",
        "Why compromise? Our {name} delivers exceptional quality at a price that respects your budget. Shop smart, shop local, shop with confidence.",
        "The {name} is the local favourite for a reason. Consistent quality, competitive pricing, and a product that genuinely makes a difference in your daily life.",
    ]

    OFFERS = [
        "🎉 Festival Special: Buy 2 Get 1 Free – Limited Time!",
        "🚀 Exclusive Deal: Free delivery on orders above ₹500!",
        "⚡ Flash Offer: 15% off today only – Don't miss it!",
        "🎁 Bundle Deal: Save ₹100 when you buy 3 or more!",
        "✨ Loyalty Reward: Extra 10% off for returning customers!",
        "🛒 Weekend Special: Free gift wrap on every purchase!",
        "💡 Pro Tip: Book your {name} service today and get a free consultation!",
    ]

    def post(self, request):
        try:
            share_type = request.data.get('type', 'single') # 'single', 'multiple'
            product_names = request.data.get('product_names', [])
            
            # Fallback to single product_name if product_names list is not provided
            if not product_names:
                product_name = request.data.get('product_name', 'our products')
                product_names = [product_name]
                
            category = str(request.data.get('category') or 'General')
            is_service = request.data.get('is_service', False)
            
            # Simple fuzzy matching for service categories
            templates = self.FALLBACK
            if is_service:
                templates = [
                    "Expert {name} services you can trust. Quality craftsmanship and timely delivery for our local community.",
                    "Need a professional for {name}? We're here to help! Book our top-rated service today.",
                    "Your search for reliable {name} ends here. Experience the difference with our dedicated expertise."
                ]
            
            for key in self.TEMPLATES.keys():
                if category and (key.lower() in category.lower() or category.lower() in key.lower()):
                    templates = self.TEMPLATES[key]
                    break

            if share_type == 'multiple' and len(product_names) > 1:
                caption = f"🌟 Explore our latest collection! Featuring: {', '.join(map(str, product_names[:5]))}. Shop the best quality in town!"
                offer = "🎉 Combo Special: Buy 3 or more and get 15% OFF!"
                hashtags = f"#KadaiConnect #ShopLocal #TamilNadu #{category.replace(' ', '')}"
            else:
                try:
                    p_name = str(product_names[0]) if product_names else "our product"
                    safe_templates = templates if templates else self.FALLBACK
                    caption = random.choice(safe_templates).format(name=p_name)
                    offer = random.choice(self.OFFERS).format(name=p_name)
                    hashtags = "#{} #{} #KadaiConnect #ShopLocal #TamilNadu".format(
                        p_name.replace(' ', ''),
                        category.replace(' ', '').replace('&', 'And'),
                    )
                except Exception:
                    p_name = str(product_names[0]) if product_names else "products"
                    caption = f"Quality {p_name} for your needs."
                    offer = "Special deals available in-store!"
                    hashtags = "#ShopLocal #KadaiConnect"

            return Response({
                'caption': caption,
                'hashtags': hashtags,
                'offer': offer,
            })
        except Exception as e:
            # Absolute fallback
            return Response({
                'caption': "Premium quality products and services for you.",
                'hashtags': "#KadaiConnect #ShopLocal",
                'offer': "Check out our latest deals!",
                'error_hint': str(e) if os.environ.get('DEBUG') else None
            })

class DashboardInsightsView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        category_val = request.data.get('category') or 'General'
        category = str(category_val).lower()
        
        # Categorized trend predictions
        if 'tailor' in category or 'textile' in category:
            demands = [
                {'label': 'Silk Sarees', 'pct': 85},
                {'label': 'Custom Blouses', 'pct': 92},
                {'label': 'Wedding Alterations', 'pct': 75}
            ]
            suggestions = [
                {'icon': '🧵', 'title': 'Express Stitching', 'body': '24-hour turnaround for festival blouses is highly requested right now.'},
                {'icon': '📱', 'title': 'Instagram Showcase', 'body': 'Post a video of your latest embroidery work to attract 3x more bookings.'}
            ]
        elif 'bakery' in category or 'sweet' in category:
            demands = [
                {'label': 'Laddu Boxes', 'pct': 95},
                {'label': 'Custom Cakes', 'pct': 80},
                {'label': 'Traditional Savories', 'pct': 70}
            ]
            suggestions = [
                {'icon': '🍩', 'title': 'Combo Box', 'body': 'Weekly "Mixed Sweet" boxes are trending. Great for corporate gifting!'},
                {'icon': '📦', 'title': 'Subscription', 'body': 'Offer a "Morning Bread" monthly pass for 15% recurring revenue boost.'}
            ]
        elif 'plumber' in category or 'repair' in category or 'hardware' in category:
            demands = [
                {'label': 'Leaking Taps', 'pct': 88},
                {'label': 'Emergency Repair', 'pct': 95},
                {'label': 'Full Renovation', 'pct': 60}
            ]
            suggestions = [
                {'icon': '🔧', 'title': 'Pre-Monsoon Checkup', 'body': 'Offer a fixed-price roof and pipe audit before the rains hit.'},
                {'icon': '🛠️', 'title': 'Tools Rental', 'body': 'DIY enthusiasts are looking for heavy drill rentals within 3km.'}
            ]
        else:
            demands = [
                {'label': 'General Demand', 'pct': 70},
                {'label': 'Local Favorites', 'pct': 85},
                {'label': 'New Arrivals', 'pct': 60}
            ]
            suggestions = [
                {'icon': '📣', 'title': 'Community Sale', 'body': 'Host a "Meet the Maker" evening to build trust with local residents.'},
                {'icon': '🤝', 'title': 'Local Collab', 'body': 'Partner with a nearby juice shop for cross-promotional vouchers.'}
            ]
            
        # Additional Service Demands
        service_demands = []
        if 'tailor' in category or 'textile' in category:
            service_demands = [
                {'label': 'Blouse Stitching', 'pct': 94},
                {'label': 'Saree Fall & ZigZag', 'pct': 88},
                {'label': 'Urgent Alterations', 'pct': 70}
            ]
        elif 'bakery' in category or 'sweet' in category:
            service_demands = [
                {'label': 'Party Orders', 'pct': 82},
                {'label': 'Home Delivery', 'pct': 75},
                {'label': 'Custom Decoration', 'pct': 60}
            ]
        else:
            service_demands = [
                {'label': 'Home Visit', 'pct': 65},
                {'label': 'Emergency Support', 'pct': 90},
                {'label': 'Monthly Package', 'pct': 55}
            ]

        return Response({
            'demands': demands,
            'service_demands': service_demands,
            'suggestions': suggestions
        })



class FestivalEngineView(APIView):
    def get(self, request):
        # Comprehensive National & Tamil Nadu Festival Insights for 2026
        festivals = [
            # JANUARY 2026
            {'name': "New Year's Day", 'name_ta': "புத்தாண்டு", 'date': "2026-01-01", 'suggestion': "Start the year with a bang! New year resolutions and party gear.", 'marketing_tip': "New Year Mega Sale.", 'inventory_tip': "Stock party snacks and beverages.", 'predicted_products': ['Party Snacks', 'Beverages', 'Gifts']},
            {'name': "Bhogi", 'name_ta': "போகி", 'date': "2026-01-14", 'suggestion': "Discard the old, welcome the new. Cleaning supplies and traditional firewood.", 'marketing_tip': "Old-for-New exchange offers.", 'inventory_tip': "Stock cleaning supplies.", 'predicted_products': ['Cleaning Supplies', 'Traditional Wear']},
            {'name': 'Thai Pongal', 'name_ta': 'பொங்கல்', 'date': '2026-01-15', 'suggestion': 'Peak harvest season! Stock traditional pots, sugarcane, and turmeric.', 'marketing_tip': 'Village-themed store decor.', 'inventory_tip': 'Restock groceries by Jan 10.', 'predicted_products': ['Traditional Pots', 'Sugarcane', 'Turmeric', 'Pongal Groceries']},
            {'name': 'Mattu Pongal / Jallikattu', 'name_ta': 'மாட்டுப் பொங்கல்', 'date': '2026-01-16', 'suggestion': 'Cattle worship and traditional sports gear.', 'marketing_tip': 'Social media Jallikattu campaign.', 'inventory_tip': 'Traditional sweets and groceries.', 'predicted_products': ['Traditional Sweets', 'Groceries', 'Cattle Decor']},
            {'name': "Thiruvalluvar Day", 'name_ta': "திருவள்ளுவர் தினம்", 'date': "2026-01-16", 'suggestion': "Honor the great poet. Ethical living kits and books.", 'marketing_tip': "Knowledge bundle offers.", 'inventory_tip': "Traditional books and stationery.", 'predicted_products': ['Books', 'Stationery']},
            {'name': "Kaanum Pongal", 'name_ta': "காணும் பொங்கல்", 'date': "2026-01-17", 'suggestion': "Family outings and picnics. Ready-to-eat snacks and travel kits.", 'marketing_tip': "Family picnic combo packs.", 'inventory_tip': "Snacks and travel essentials.", 'predicted_products': ['Picnic Kits', 'Snacks', 'Travel Gear']},
            {'name': "Vasant Panchami", 'name_ta': "வசந்த பஞ்சமி", 'date': "2026-01-23", 'suggestion': "Saraswati worship. School supplies and yellow outfits.", 'marketing_tip': "Scholarship shopping week.", 'inventory_tip': "Student stationery and yellow textiles.", 'predicted_products': ['Stationery', 'Yellow Sarees', 'Books']},
            {'name': "Republic Day", 'name_ta': "குடியரசு தினம்", 'date': "2026-01-26", 'discovery': "National pride. Flags and patriotic merchandise.", 'marketing_tip': "Republic Day freedom sale.", 'inventory_tip': "Tri-color decor and merchandise.", 'predicted_products': ['Patriotic Gear', 'Tri-color Decor']},
            
            # FEBRUARY 2026
            {'name': 'Thaipusam', 'name_ta': 'தைப்பூசம்', 'date': '2026-02-01', 'suggestion': 'Massive Murugan processions. Focus on puja kits and flowers.', 'marketing_tip': 'Spiritual journey bundle offers.', 'inventory_tip': 'High demand for incense and lamps.', 'predicted_products': ['Puja Kits', 'Flowers', 'Incense', 'Lamps']},
            {'name': 'Maha Shivaratri', 'name_ta': 'மகா சிவராத்திரி', 'date': '2026-02-15', 'suggestion': 'Night-long temple vigils. Puja kits and milk demand.', 'marketing_tip': 'Vigil-ready food & drink packs.', 'inventory_tip': 'Oil and cotton wicks stock-up.', 'predicted_products': ['Puja Kits', 'Milk', 'Oil', 'Cotton Wicks']},
            {'name': "Losar", 'name_ta': "லோசர்", 'date': "2026-02-18", 'suggestion': "Tibetan New Year. Cultural items and traditional lamps.", 'marketing_tip': "Tibetan soul-seekers promo.", 'inventory_tip': "Incense and cultural gifts.", 'predicted_products': ['Incense', 'Lamps']},
            {'name': "Shivaji Jayanti", 'name_ta': "சிவாஜி ஜெயந்தி", 'date': "2026-02-19", 'suggestion': "Heroic heritage. Traditional martial gear and icons.", 'marketing_tip': "Valiant heart campaign.", 'inventory_tip': "Statues and patriotic books.", 'predicted_products': ['Icons', 'Books']},

            # MARCH 2026
            {'name': "Masi Magam", 'name_ta': "மாசி மகம்", 'date': "2026-03-02", 'suggestion': "Sea-shore spiritual events. Floating lamps and ritual kits.", 'marketing_tip': "Beach-puja kit deals.", 'inventory_tip': "Earthen lamps and flowers.", 'predicted_products': ['Ritual Kits', 'Floating Lamps']},
            {'name': "Holika Dahan", 'name_ta': "ஹோலிகா தகனம்", 'date': "2026-03-03", 'suggestion': "Eve of Holi. Firewood and ritual powders.", 'marketing_tip': "Bury-your-bad-habits promo.", 'inventory_tip': "Traditional ritual items.", 'predicted_products': ['Ritual Items', 'Bonfire Accessories']},
            {'name': "Holi", 'name_ta': "ஹோலி", 'date': "2026-03-04", 'suggestion': "Festival of colors. Stock herbal gulal and sweets.", 'marketing_tip': "Eco-friendly color promo.", 'inventory_tip': "White cotton textiles.", 'predicted_products': ['Herbal Gulal', 'Sweets', 'White Cotton Textiles']},
            {'name': 'Karadaiyan Nombu', 'name_ta': 'காரடையான் நோன்பு', 'date': '2026-03-16', 'suggestion': 'Traditional fasting. Special snacks and textiles.', 'marketing_tip': 'Nombu kit bundles.', 'inventory_tip': 'Traditional butter and snacks.', 'predicted_products': ['Traditional Snacks', 'Textiles', 'Butter']},
            {'name': "Ugadi / Gudi Padwa", 'name_ta': "யுகாதி", 'date': "2026-03-19", 'suggestion': "Telugu/Kannada New Year. Sacred ingredients and raw mangoes.", 'marketing_tip': "Sweet-Sour-Bitter discount.", 'inventory_tip': "Special groceries and neem flowers.", 'predicted_products': ['Raw Mangoes', 'Neem Flowers', 'Groceries']},
            {'name': 'Eid-ul-Fitr', 'name_ta': 'ரம்ஜான்', 'date': '2026-03-20', 'suggestion': 'End of Ramadan. Festive attire and dry fruits.', 'marketing_tip': 'Eid Mubarak community deals.', 'inventory_tip': 'Premium spices and kitchenware.', 'predicted_products': ['Festive Attire', 'Dry Fruits', 'Premium Spices', 'Kitchenware']},
            {'name': "Ram Navami", 'name_ta': "ராம நவமி", 'date': "2026-03-26", 'suggestion': "Birth of Lord Ram. Panakam and Kosambari ingredients.", 'marketing_tip': "Ram-Rajya celebration sale.", 'inventory_tip': "Puja samagri and cool drinks.", 'predicted_products': ['Panakam Pots', 'Puja Samagri']},
            {'name': "Mahavir Jayanti", 'name_ta': "மகாவீர் ஜெயந்தி", 'date': "2026-03-31", 'suggestion': "Jain spiritual day. Satvik food and white clothes.", 'marketing_tip': "Ahinsa (Non-violence) deals.", 'inventory_tip': "Pure organic groceries.", 'predicted_products': ['Organic Groceries', 'White Clothes']},

            # APRIL 2026
            {'name': "Hanuman Jayanti", 'name_ta': "ஹனுமன் ஜெயந்தி", 'date': "2026-04-02", 'suggestion': "Monkey God's birth. Butter and vada items.", 'marketing_tip': "Bajrangi strength promo.", 'inventory_tip': "Bulk butter and pulses.", 'predicted_products': ['Butter', 'Pulses']},
            {'name': "Good Friday", 'name_ta': "புனித வெள்ளி", 'date': "2026-04-03", 'suggestion': "Solemn observation. Traditional fish and cross buns.", 'marketing_tip': "Peaceful reflection campaign.", 'inventory_tip': "Special snacks and seafood.", 'predicted_products': ['Seafood', 'Cross Buns']},
            {'name': "Easter Sunday", 'name_ta': "ஈஸ்டர்", 'date': "2026-04-05", 'suggestion': "Resurrection joy. Easter eggs and cakes.", 'marketing_tip': "Easter egg-stravaganza sale.", 'inventory_tip': "Cakes and chocolates.", 'predicted_products': ['Easter Eggs', 'Cakes', 'Chocolates']},
            {'name': 'Puthandu (Tamil New Year)', 'name_ta': 'தமிழ் புத்தாண்டு', 'date': '2026-04-14', 'suggestion': 'Start of the Tamil year. New clothes and household items.', 'marketing_tip': 'New Year mega discount.', 'inventory_tip': 'Silk sarees and festive decor.', 'predicted_products': ['Silk Sarees', 'New Clothes', 'Household Items', 'Festive Decor']},
            {'name': "Ambedkar Jayanti", 'name_ta': "அம்பேத்கர் ஜெயந்தி", 'date': "2026-04-14", 'suggestion': "Justice and equality day. Blue decor and social awareness books.", 'marketing_tip': "Social Justice Book Fair.", 'inventory_tip': "Books and blue flags.", 'predicted_products': ['Books', 'Blue Decor']},
            {'name': 'Chithirai Thiruvizha', 'name_ta': 'சித்திரைத் திருவிழா', 'date': '2026-04-14', 'suggestion': 'Madurai giant festival. Tourism and spiritual items.', 'marketing_tip': 'Temple city special promo.', 'inventory_tip': 'Travel snacks and souvenirs.', 'predicted_products': ['Spiritual Items', 'Travel Snacks', 'Souvenirs']},
            {'name': "Akshaya Tritiya", 'name_ta': "அட்சய திருதியை", 'date': "2026-04-19", 'suggestion': "Auspicious gold buying. Gold jewelry and premium coins.", 'marketing_tip': "Golden investment week.", 'inventory_tip': "Jewelry and gold-themed gifts.", 'predicted_products': ['Jewelry', 'Premium Coins']},
            {'name': "Chitra Pournami", 'name_ta': "சித்ரா பௌர்ணமி", 'date': "2026-04-26", 'suggestion': "Moonlight meditation. White sweets and milk items.", 'marketing_tip': "Celestial peace campaign.", 'inventory_tip': "Milk products and sweets.", 'predicted_products': ['Milk Products', 'Sweets']},

            # MAY 2026
            {'name': "Meenakshi Thirukalyanam", 'name_ta': "மீனாட்சி திருக்கல்யாணம்", 'date': "2026-05-01", 'suggestion': "Celestial Wedding. Silk sarees and luxury gifts.", 'marketing_tip': "Wedding season special sale.", 'inventory_tip': "Wedding textiles and luxury items.", 'predicted_products': ['Silk Sarees', 'Wedding Gifts']},
            {'name': "Vaikasi Visakam", 'name_ta': "வைகாசி விசாகம்", 'date': "2026-05-01", 'suggestion': "Lord Murugan's birth. Puja items and yellow flowers.", 'marketing_tip': "Devotional bundle promo.", 'inventory_tip': "Flowers and incense.", 'predicted_products': ['Puja Kits', 'Flowers']},
            {'name': "Buddha Purnima", 'name_ta': "புத்த பூர்ணிமா", 'date': "2026-05-01", 'suggestion': "Peace and enlightenment. Spiritual books and meditation gear.", 'marketing_tip': "Enlightenment journey sale.", 'inventory_tip': "Meditation accessories and books.", 'predicted_products': ['Books', 'Meditation Gear']},
            {'name': "Eid-ul-Zuha (Bakrid)", 'name_ta': "பக்ரீத்", 'date': "2026-05-27", 'suggestion': "Sacrifice and sharing. Quality spices and traditional attire.", 'marketing_tip': "Bakrid community feasts deals.", 'inventory_tip': "Premium meat-cooking spices.", 'predicted_products': ['Traditional Attire', 'Premium Spices']},

            # JUNE 2026
            {'name': "Muharram", 'name_ta': "முகரம்", 'date': "2026-06-26", 'suggestion': "Solemn mourning. Simple attire and ritual items.", 'marketing_tip': "Community remembrance campaign.", 'inventory_tip': "Common groceries.", 'predicted_products': ['Simple Attire', 'Groceries']},

            # JULY 2026
            {'name': "Jagannath Rath Yatra", 'name_ta': "ரத யாத்திரை", 'date': "2026-07-16", 'suggestion': "Chariot procession. Traditional dolls and wooden icons.", 'marketing_tip': "Rath Yatra heritage promo.", 'inventory_tip': "Handicrafts and wooden toys.", 'predicted_products': ['Traditional Dolls', 'Wooden Icons']},
            {'name': "Guru Purnima", 'name_ta': "குரு பூர்ணிமா", 'date': "2026-07-29", 'suggestion': "Honoring teachers. Gift cards and academic books.", 'marketing_tip': "Thank-Your-Guru campaign.", 'inventory_tip': "Gifts and classic literature.", 'predicted_products': ['Gift Cards', 'Academic Books']},

            # AUGUST 2026
            {'name': 'Aadi Perukku', 'name_ta': 'ஆடிப் பெருக்கு', 'date': '2026-08-03', 'suggestion': 'River monsoon festival. Picnic kits and snacks.', 'marketing_tip': 'Riverside celebration bundle.', 'inventory_tip': 'Fresh groceries and snacks.', 'predicted_products': ['Picnic Kits', 'Snacks', 'Fresh Groceries']},
            {'name': "Independence Day", 'name_ta': "சுதந்திர தினம்", 'date': "2026-08-15", 'suggestion': "National independence. Freedom-themed merchandise.", 'marketing_tip': "79th Independence Mega Sale.", 'inventory_tip': "Tshirts and tri-color decor.", 'predicted_products': ['T-shirts', 'Decor']},
            {'name': "Aadi Pooram", 'name_ta': "ஆடிப் பூரம்", 'date': "2026-08-15", 'suggestion': "Andal's birth. Glass bangles and traditional sweets.", 'marketing_tip': "Bangle-festival special.", 'inventory_tip': "Glass bangles and sweets.", 'predicted_products': ['Glass Bangles', 'Sweets']},
            {'name': "Onam", 'name_ta': "ஓணம்", 'date': "2026-08-26", 'suggestion': "Malayalam harvest festival. Kerala kasavu sarees and flowers.", 'marketing_tip': "Pookalam contest in-store.", 'inventory_tip': "Fresh flowers and coconut oil.", 'predicted_products': ['Kerala Kasavu Sarees', 'Flowers']},
            {'name': "Milad-un-Nabi", 'name_ta': "மிலாதுன் நபி", 'date': "2026-08-26", 'suggestion': "Birthday of the Prophet. Community charity and perfumes.", 'marketing_tip': "Spirit of giving campaign.", 'inventory_tip': "Food grains and perfumes.", 'predicted_products': ['Perfumes', 'Food Grains']},
            {'name': "Raksha Bandhan", 'name_ta': "ரக்ஷா பந்தன்", 'date': "2026-08-28", 'suggestion': "Sibling bonds. Rakhis and gift boxes.", 'marketing_tip': "Rakhi-plus-Gift bundle.", 'inventory_tip': "Handmade rakhis and chocolates.", 'predicted_products': ['Rakhis', 'Gift Boxes']},
            {'name': "Varalakshmi Vratam", 'name_ta': "வரலட்சுமி விரதம்", 'date': "2026-08-28", 'suggestion': "Lakshmi worship. Silk fabrics and traditional lamps.", 'marketing_tip': "Abundance & Prosperity sale.", 'inventory_tip': "Pattu pavadai and puja kits.", 'predicted_products': ['Silk Fabrics', 'Puja Kits']},

            # SEPTEMBER 2026
            {'name': "Krishna Janmashtami", 'name_ta': "கிருஷ்ண ஜெயந்தி", 'date': "2026-09-04", 'suggestion': "Little Krishna's birth. Tiny footsteps decor and butter pots.", 'marketing_tip': "Cute Krishna photo contest.", 'inventory_tip': "Flutes and traditional snacks.", 'predicted_products': ['Tiny Footsteps Decor', 'Flutes', 'Butter']},
            {'name': 'Vinayaka Chaturthi', 'name_ta': 'விநாயகர் சதுர்த்தி', 'date': '2026-09-14', 'suggestion': 'Clay idols and modak ingredients.', 'marketing_tip': 'Eco-Friendly Ganesha contest.', 'inventory_tip': 'Jaggery and coconut supply.', 'predicted_products': ['Clay Idols', 'Modak Ingredients', 'Jaggery', 'Coconut']},
            {'name': "Vishwakarma Puja", 'name_ta': "விஸ்வகர்மா பூஜை", 'date': "2026-09-17", 'suggestion': "God of tools. Toolsets and electronic gadgets.", 'marketing_tip': "Builder & Maker discount.", 'inventory_tip': "Tools and factory supplies.", 'predicted_products': ['Toolsets', 'Electronic Gadgets']},
            {'name': "Anant Chaturdashi", 'name_ta': "அனந்த சதுர்தசி", 'date': "2026-09-25", 'suggestion': "Final Ganesha immersion. Procession lamps and music gear.", 'marketing_tip': "Grand Finale farewell deals.", 'inventory_tip': "Immersion accessories.", 'predicted_products': ['Lamps', 'Music Gear']},

            # OCTOBER 2026
            {'name': "Gandhi Jayanti", 'name_ta': "காந்தி ஜெயந்தி", 'date': "2026-10-02", 'suggestion': "Father of nation. Khadi textiles and handspun items.", 'marketing_tip': "Khadi special week 20% off.", 'inventory_tip': "Khadi fabrics and yarn.", 'predicted_products': ['Khadi Textiles', 'Handspun Items']},
            {'name': 'Navaratri / Golu', 'name_ta': 'நவராத்திரி / கொலு', 'date': '2026-10-11', 'suggestion': 'Nine nights of dolls and textiles.', 'marketing_tip': 'Golu doll exhibition in store.', 'inventory_tip': 'Silk fabrics and puja samagri.', 'predicted_products': ['Golu Dolls', 'Textiles', 'Silk Fabrics', 'Puja Samagri']},
            {'name': 'Ayudha Puja', 'name_ta': 'ஆயுத பூஜை', 'date': '2026-10-19', 'suggestion': 'Cleaning and honoring tools/books.', 'marketing_tip': 'Workshop & School supply sale.', 'inventory_tip': 'Flowers and cleaning supplies.', 'predicted_products': ['Flowers', 'Cleaning Supplies', 'Books']},
            {'name': "Vijayadashami", 'name_ta': "விஜயதசமி", 'date': "2026-10-20", 'suggestion': "Victory of good. Education and startup kits.", 'marketing_tip': "Vidyarambham (Begin Learning) deals.", 'inventory_tip': "Stationery and tablets.", 'predicted_products': ['Education Kits', 'Stationery']},
            {'name': "Karwa Chauth", 'name_ta': "கர்வா சௌத்", 'date': "2026-10-29", 'suggestion': "Marital bond. Designer bangles and sargi foods.", 'marketing_tip': "Husband-Wife gift lounge.", 'inventory_tip': "Bangles and premium foods.", 'predicted_products': ['Designer Bangles', 'Sargi Foods']},

            # NOVEMBER 2026
            {'name': "Dhanteras", 'name_ta': "தன்த்ரயா", 'date': "2026-11-06", 'suggestion': "Buying wealth. Silver coins and kitchenware.", 'marketing_tip': "Golden fortune campaign.", 'inventory_tip': "Silver and steel utensils.", 'predicted_products': ['Silver Coins', 'Kitchenware']},
            {'name': 'Deepavali (TN)', 'name_ta': 'தீபாவளி', 'date': '2026-11-07', 'suggestion': 'Early morning oil baths and crackers.', 'marketing_tip': 'Dawn-of-Diwali dawn sale.', 'inventory_tip': 'Sesame oil and new clothes.', 'predicted_products': ['Crackers', 'Sesame Oil', 'New Clothes', 'Sweets']},
            {'name': "Diwali (National)", 'name_ta': "திவாலி", 'date': "2026-11-08", 'suggestion': "Lights and fireworks. Corporate gifts and hampers.", 'marketing_tip': "National Diwali Mega Sale.", 'inventory_tip': "Gift hampers and bulk sweets.", 'predicted_products': ['Gift Hampers', 'Bulk Sweets']},
            {'name': 'Soorasamharam', 'name_ta': 'சூரசம்ஹாரம்', 'date': '2026-11-15', 'suggestion': 'Tiruchendur climax. Spiritual items.', 'marketing_tip': 'Devotional combo packs.', 'inventory_tip': 'Murugan idols and icons.', 'predicted_products': ['Spiritual Items', 'Murugan Idols', 'Devotional Packs']},
            {'name': 'Karthigai Deepam', 'name_ta': 'கார்த்திகை', 'date': '2026-11-23', 'suggestion': 'Great lamp beacon. Earthen diyas and oil.', 'marketing_tip': 'Lighting festival promo.', 'inventory_tip': 'Bulk diyas and ghee.', 'predicted_products': ['Earthen Diyas', 'Oil', 'Ghee']},
            {'name': "Guru Nanak Jayanti", 'name_ta': "குரு நானக் ஜெயந்தி", 'date': "2026-11-24", 'suggestion': "Sikh spiritual day. Community service gear.", 'marketing_tip': "Serving-hearts campaign.", 'inventory_tip': "Food grains.", 'predicted_products': ['Service Gear', 'Food Grains']},

            # DECEMBER 2026
            {'name': "Margazhi Begins", 'name_ta': "மார்கழி", 'date': "2026-12-15", 'suggestion': "Kolam contests and bhajans.", 'marketing_tip': "Kolam powder gift with purchase.", 'inventory_tip': "Kolam powders and snacks.", 'predicted_products': ['Kolam Powders', 'Snacks', 'Bhajan Books']},
            {'name': 'Vaikunta Ekadasi', 'name_ta': 'வைகுண்ட ஏகாதசி', 'date': '2026-12-20', 'suggestion': 'Paradise Gate at Vishnu temples.', 'marketing_tip': 'Gate-of-Faith campaign.', 'inventory_tip': 'Temple visit essentials.', 'predicted_products': ['Temple Essentials', 'Puja Kits']},
            {'name': "Arudra Darshan", 'name_ta': "ஆருத்ரா தரிசனம்", 'date': "2026-12-24", 'suggestion': "Nataraja's dance. Traditional dance gear and ritual items.", 'marketing_tip': "Vibrant-heritage sale.", 'inventory_tip': "Dance costumes and instruments.", 'predicted_products': ['Dance Gear', 'Instruments']},
            {'name': "Christmas Day", 'name_ta': "கிறிஸ்துமஸ்", 'date': "2026-12-25", 'suggestion': "Season of joy. Christmas trees and gifting.", 'marketing_tip': "Santa's Secret Deals.", 'inventory_tip': "Decor and toys.", 'predicted_products': ['Christmas Trees', 'Toys', 'Decor']},
            {'name': "Hanumath Jayanthi", 'name_ta': "ஹனுமத் ஜெயந்தி", 'date': "2026-12-31", 'suggestion': "End of year devotion. Hanuman chalisa books and oils.", 'marketing_tip': "Faithful-future campaign.", 'inventory_tip': "Oils and spiritual books.", 'predicted_products': ['Oils', 'Spiritual Books']}
        ]
        return Response(festivals)

class VoiceToTextView(APIView):
    def post(self, request):
        # In a real app, we'd use a speech-to-text library like Whisper or Google Speech
        # For this demo, we'll return a mock transcription based on the presence of an audio file
        audio_file = request.FILES.get('audio')
        if not audio_file:
            return Response({'error': 'No audio file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mock transcription logic
        mock_transcriptions = [
            "Add 5kg of Ponni Rice to my inventory",
            "What are the trending products for Diwali?",
            "Show me my sales for this week",
            "Set the price of Silk Saree to 2500 rupees"
        ]
        import random
        text = random.choice(mock_transcriptions)
        
        return Response({
            'text': text,
            'confidence': 0.98,
            'language': 'en-IN'
        })
