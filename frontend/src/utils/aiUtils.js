/**
 * Shared utility for parsing voice commands into product data.
 * Detects Name, Price, Category, and Stock.
 */
export const parseProductVoiceCommand = (text) => {
  if (!text) return {};
  const lower = text.toLowerCase().trim();
  const updates = {};
  let workingText = lower;

  // 1. EXTRACT STOCK (Prioritized) or DURATION (for services)
  // Rule: If we find "Stock X", assign X to stock and REMOVE "Stock X" from further processing
  const stockKeywords = "(?:stock|quantity|pieces|pcs|எண்ணிக்கை|இருப்பு)";
  const stockMatch = workingText.match(new RegExp(`${stockKeywords}\\s*(\\d+)`, "i"));
  if (stockMatch) {
    updates.stock = stockMatch[1];
    workingText = workingText.replace(stockMatch[0], "");
  }

  const durationKeywords = "(?:duration|time|mins?|minutes?|நேரம்|காலம்)";
  const durationMatch = workingText.match(new RegExp(`${durationKeywords}\\s*(\\d+)`, "i"));
  if (durationMatch) {
    updates.duration_minutes = durationMatch[1];
    workingText = workingText.replace(durationMatch[0], "");
  }

  // 2. EXTRACT CATEGORY
  const catMap = { 
    textiles: 'Textiles', saree: 'Textiles', sari: 'Textiles', cloth: 'Textiles', fabric: 'Textiles', 
    grocery: 'Groceries', food: 'Groceries', rice: 'Groceries', 
    lamp: 'Lamps & Decor', light: 'Lamps & Decor', diya: 'Lamps & Decor', 
    cracker: 'Crackers', firework: 'Crackers', 
    gift: 'Gift Items', 
    service: 'Services', stitch: 'Services' 
  };
  for (const [kw, cat] of Object.entries(catMap)) {
    if (workingText.includes(kw)) { 
      updates.category = cat; 
      workingText = workingText.replace(kw, ""); // Remove category keyword
      break; 
    }
  }

  // 3. EXTRACT PRICE (From remaining numbers)
  const remainingNumbers = workingText.match(/\d+/g) || [];
  if (remainingNumbers.length > 0) {
    let total = 0;
    if (remainingNumbers.length >= 2) {
      const n1 = parseInt(remainingNumbers[0]);
      const n2 = parseInt(remainingNumbers[1]);
      if ((n1 % 1000 === 0 || n1 % 100 === 0) && n2 < n1) {
        total = n1 + n2;
      } else {
        total = Math.max(...remainingNumbers.map(n => parseInt(n)));
      }
    } else {
      total = parseInt(remainingNumbers[0]);
    }
    
    if (total > 0 && total < 1000000) {
      updates.price = String(total);
      // Remove all used numbers from text to prevent them from staying in Name
      remainingNumbers.forEach(n => workingText = workingText.replace(n, ""));
    }
  }

  // 3.1 EXTRACT SIZE / WEIGHT
  // e.g. 500g, 1kg, 2 liters, xl, xxl
  const sizeMatch = workingText.match(/\b(\d+(?:\.\d+)?\s*(?:kg|g|mg|l|ml|m|cm|mm|inch|inches|ft|feet|sqft)|(?:xs|s|m|l|xl|xxl|xxxl))\b/i);
  if (sizeMatch) {
    updates.size = sizeMatch[1];
    workingText = workingText.replace(sizeMatch[0], "");
  }

  // 3.2 EXTRACT COLOR
  const colors = ['red','blue','green','yellow','black','white','gold','silver','pink','purple','orange','grey','brown',
                 'சிவப்பு','நீலம்','பச்சை','மஞ்சள்','கருப்பு','வெள்ளை','தங்கம்','வெள்ளி','இளஞ்சிவப்பு'];
  for (const c of colors) {
    if (workingText.includes(c)) {
      updates.color = c.charAt(0).toUpperCase() + c.slice(1);
      workingText = workingText.replace(new RegExp(`\\b${c}\\b`, 'g'), "");
      break;
    }
  }

  // 3.3 EXTRACT MATERIAL / FABRIC
  const materials = ['silk','cotton','wool','polyester','linen','brass','steel','plastic','copper','bronze','iron','paper','wood',
                    'பட்டு','பருத்தி','மர','பித்தளை','இரும்பு','தாமிரம்'];
  for (const m of materials) {
    if (workingText.includes(m)) {
      updates.fabric = m.charAt(0).toUpperCase() + m.slice(1);
      workingText = workingText.replace(new RegExp(`\\b${m}\\b`, 'g'), "");
      break;
    }
  }

  // 4. CLEAN NAME EXTRACTION
  // Remove all keywords (even without numbers) and symbols
  const allKeywords = "(?:price|cost|for|at|is|rupees?|rs\\.?|category|விலை|₹|stock|quantity|pieces|pcs|எண்ணிக்கை|இருப்பு)";
  let cleanName = workingText
    .replace(new RegExp(allKeywords, "gi"), "")
    .replace(/\s+/g, " ")
    .trim();

  // Keyword Protection: Only set name if it's not empty and doesn't look like just a leftover keyword
  if (cleanName && cleanName.length >= 2 && !/^(?:stock|price|category)$/i.test(cleanName)) {
    updates.name = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  return updates;
};
