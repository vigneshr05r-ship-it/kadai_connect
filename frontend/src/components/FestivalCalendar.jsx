import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag,
  Info,
  Layers,
  Search
} from 'lucide-react';

const S = {
  container: { background: 'var(--cream)', border: '2px solid var(--gold)', borderRadius: 12, padding: 20, boxShadow: '8px 8px 0 var(--brown-deep)', height: '100%' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 15 },
  dayHeader: { textAlign: 'center', fontSize: '.6rem', fontWeight: 950, color: 'var(--brown-mid)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  dayCell: (isToday, isSelected, festCount) => ({
    aspectRatio: '1/1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: isToday ? 'var(--gold-pale)' : (isSelected ? 'var(--parchment)' : 'white'),
    border: `1px solid ${isToday ? 'var(--gold)' : (isSelected ? 'var(--brown-deep)' : (festCount > 0 ? 'var(--gold)' : 'var(--parchment)'))}`,
    borderRadius: 6,
    cursor: 'pointer',
    position: 'relative',
    transition: '0.15s ease',
    overflow: 'hidden',
    boxShadow: festCount > 0 ? 'inset 0 0 5px rgba(201, 146, 26, 0.1)' : 'none'
  }),
  viewToggle: (active) => ({
    padding: '6px 12px',
    borderRadius: 20,
    background: active ? 'var(--brown-deep)' : 'transparent',
    color: active ? 'var(--gold-light)' : 'var(--brown-mid)',
    border: `1.5px solid ${active ? 'var(--brown-deep)' : 'var(--parchment)'}`,
    fontSize: '.7rem',
    fontWeight: 850,
    cursor: 'pointer',
    transition: '.2s'
  }),
  festBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--gold)',
    color: 'var(--brown-deep)',
    fontSize: '.4rem',
    fontWeight: 950,
    textAlign: 'center',
    padding: '1px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  multiIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--rust)',
    border: '1px solid white'
  }
};

const MOCK_FESTIVALS = [
  // JANUARY 2026
  { name: "New Year's Day", name_ta: "புத்தாண்டு", date: "2026-01-01", emoji: "🎆" },
  { name: "Bhogi", name_ta: "போகி", date: "2026-01-14", emoji: "🔥" },
  { name: "Thai Pongal", name_ta: "தைப்பொங்கல்", date: "2026-01-15", emoji: "🍚" },
  { name: "Mattu Pongal / Jallikattu", name_ta: "மாட்டுப் பொங்கல்", date: "2026-01-16", emoji: "🐂" },
  { name: "Thiruvalluvar Day", name_ta: "திருவள்ளுவர் தினம்", date: "2026-01-16", emoji: "📜" },
  { name: "Kaanum Pongal", name_ta: "காணும் பொங்கல்", date: "2026-01-17", emoji: "🧺" },
  { name: "Vasant Panchami", name_ta: "வசந்த பஞ்சமி", date: "2026-01-23", emoji: "📚" },
  { name: "Republic Day", name_ta: "குடியரசு தினம்", date: "2026-01-26", emoji: "🇮🇳" },
  
  // FEBRUARY 2026
  { name: "Thaipusam", name_ta: "தைப்பூசம்", date: "2026-02-01", emoji: "🔱" },
  { name: "Maha Shivaratri", name_ta: "மகா சிவராத்திரி", date: "2026-02-15", emoji: "🕉️" },
  { name: "Losar", name_ta: "லோசர்", date: "2026-02-18", emoji: "🏮" },
  { name: "Shivaji Jayanti", name_ta: "சுவாமி விவேகானந்தர்", date: "2026-02-19", emoji: "⚔️" },

  // MARCH 2026
  { name: "Masi Magam", name_ta: "மாசி மகம்", date: "2026-03-02", emoji: "🌊" },
  { name: "Holika Dahan", name_ta: "ஹோலிகா தகனம்", date: "2026-03-03", emoji: "🔥" },
  { name: "Holi", name_ta: "ஹோலி", date: "2026-03-04", emoji: "🎨" },
  { name: "Karadaiyan Nombu", name_ta: "காரடையான் நோன்பு", date: "2026-03-16", emoji: "🧵" },
  { name: "Ugadi / Gudi Padwa", name_ta: "யுகாதி", date: "2026-03-19", emoji: "🪴" },
  { name: "Eid-ul-Fitr", name_ta: "ரம்ஜான்", date: "2026-03-20", emoji: "🌙" },
  { name: "Ram Navami", name_ta: "ராம நவமி", date: "2026-03-26", emoji: "🏹" },
  { name: "Mahavir Jayanti", name_ta: "மகாவீர் ஜெயந்தி", date: "2026-03-31", emoji: "☸️" },

  // APRIL 2026
  { name: "Hanuman Jayanti", name_ta: "ஹனுமன் ஜெயந்தி", date: "2026-04-02", emoji: "🐒" },
  { name: "Good Friday", name_ta: "புனித வெள்ளி", date: "2026-04-03", emoji: "✝️" },
  { name: "Easter Sunday", name_ta: "ஈஸ்டர்", date: "2026-04-05", emoji: "🥚" },
  { name: "Tamil New Year (Puthandu)", name_ta: "தமிழ் புத்தாண்டு", date: "2026-04-14", emoji: "🥭" },
  { name: "Ambedkar Jayanti", name_ta: "அம்பேத்கர் ஜெயந்தி", date: "2026-04-14", emoji: "⚖️" },
  { name: "Chithirai Thiruvizha", name_ta: "சித்திரைத் திருவிழா", date: "2026-04-14", emoji: "🛕" },
  { name: "Akshaya Tritiya", name_ta: "அட்சய திருதியை", date: "2026-04-19", emoji: "💍" },
  { name: "Chitra Pournami", name_ta: "சித்ரா பௌர்ணமி", date: "2026-04-26", emoji: "🌕" },

  // MAY 2026
  { name: "Meenakshi Thirukalyanam", name_ta: "மீனாட்சி திருக்கல்யாணம்", date: "2026-05-01", emoji: "💍" },
  { name: "Vaikasi Visakam", name_ta: "வைகாசி விசாகம்", date: "2026-05-01", emoji: "🔱" },
  { name: "Buddha Purnima", name_ta: "புத்த பூர்ணிமா", date: "2026-05-01", emoji: "☸️" },
  { name: "Eid-ul-Zuha (Bakrid)", name_ta: "பக்ரீத்", date: "2026-05-27", emoji: "🌙" },

  // JUNE 2026
  { name: "Muharram", name_ta: "முகரம்", date: "2026-06-26", emoji: "🏴" },

  // JULY 2026
  { name: "Jagannath Rath Yatra", name_ta: "ரத யாத்திரை", date: "2026-07-16", emoji: "🛖" },
  { name: "Guru Purnima", name_ta: "குரு பூர்ணிமா", date: "2026-07-29", emoji: "🙏" },

  // AUGUST 2026
  { name: "Aadi Perukku", name_ta: "ஆடிப் பெருக்கு", date: "2026-08-03", emoji: "🌊" },
  { name: "Independence Day", name_ta: "சுதந்திர தினம்", date: "2026-08-15", emoji: "🇮🇳" },
  { name: "Aadi Pooram", name_ta: "ஆடிப் பூரம்", date: "2026-08-15", emoji: "🌸" },
  { name: "Onam", name_ta: "ஓணம்", date: "2026-08-26", emoji: "🛶" },
  { name: "Milad-un-Nabi", name_ta: "மிலாதுன் நபி", date: "2026-08-26", emoji: "🕌" },
  { name: "Raksha Bandhan", name_ta: "ரக்ஷா பந்தன்", date: "2026-08-28", emoji: "🧵" },
  { name: "Varalakshmi Vratam", name_ta: "வரலட்சுமி விரதம்", date: "2026-08-28", emoji: "🏺" },

  // SEPTEMBER 2026
  { name: "Krishna Janmashtami", name_ta: "கிருஷ்ண ஜெயந்தி", date: "2026-09-04", emoji: "🏺" },
  { name: "Vinayaka Chaturthi", name_ta: "விநாயகர் சதுர்த்தி", date: "2026-09-14", emoji: "🐘" },
  { name: "Vishwakarma Puja", name_ta: "விஸ்வகர்மா பூஜை", date: "2026-09-17", emoji: "🛠️" },
  { name: "Anant Chaturdashi", name_ta: "அனந்த சதுர்தசி", date: "2026-09-25", emoji: "🌊" },

  // OCTOBER 2026
  { name: "Gandhi Jayanti", name_ta: "காந்தி ஜெயந்தி", date: "2026-10-02", emoji: "👓" },
  { name: "Navaratri / Golu", name_ta: "நவராத்திரி", date: "2026-10-11", emoji: "🎭" },
  { name: "Ayudha Puja", name_ta: "ஆயுத பூஜை", date: "2026-10-19", emoji: "🛠️" },
  { name: "Vijayadashami", name_ta: "விஜயதசமி", date: "2026-10-20", emoji: "🏹" },
  { name: "Karwa Chauth", name_ta: "கர்வா சௌத்", date: "2026-10-29", emoji: "🌕" },

  // NOVEMBER 2026
  { name: "Dhanteras", name_ta: "தன்த்ரயா", date: "2026-11-06", emoji: "💰" },
  { name: "Deepavali (TN)", name_ta: "தீபாவளி", date: "2026-11-07", emoji: "🪔" },
  { name: "Diwali (National)", name_ta: "திவாலி", date: "2026-11-08", emoji: "🎆" },
  { name: "Soorasamharam", name_ta: "சூரசம்ஹாரம்", date: "2026-11-15", emoji: "🔱" },
  { name: "Karthigai Deepam", name_ta: "கார்த்திகை", date: "2026-11-23", emoji: "🕯️" },
  { name: "Guru Nanak Jayanti", name_ta: "குரு நானக் ஜெயந்தி", date: "2026-11-24", emoji: "☬" },

  // DECEMBER 2026
  { name: "Margazhi Begins", name_ta: "மார்கழி", date: "2026-12-15", emoji: "🌸" },
  { name: "Vaikunta Ekadasi", name_ta: "வைகுண்ட ஏகாதசி", date: "2026-12-20", emoji: "🚪" },
  { name: "Arudra Darshan", name_ta: "ஆருத்ரா தரிசனம்", date: "2026-12-24", emoji: "🕺" },
  { name: "Christmas Day", name_ta: "கிறிஸ்துமஸ்", date: "2026-12-25", emoji: "🎄" },
  { name: "Hanumath Jayanthi", name_ta: "ஹனுமத் ஜெயந்தி", date: "2026-12-31", emoji: "🐒" }
];

export default function FestivalCalendar() {
  const { t, i18n } = useTranslation();
  const { apiFetch } = useAuth();
  const isTa = i18n.language === 'ta';
  const [view, setView] = useState('monthly'); 
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); 
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 3, 1));
  const [insights, setInsights] = useState(null);
  const [search, setSearch] = useState('');
  const [festivals, setFestivals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        const resp = await apiFetch('/api/ai/festivals/');
        if (resp?.ok) {
          const data = await resp.json();
          // Map emojis from our hardcoded list or use defaults
          const emojiMap = {
            'Thai Pongal': '🍚', 'Pongal': '🍚', 'Mattu Pongal': '🐂', 'Thaipusam': '🔱',
            'Maha Shivaratri': '🕉️', 'Holi': '🎨', 'Karadaiyan Nombu': '🧵', 'Puthandu': '🥭',
            'Tamil New Year': '🥭', 'Eid-ul-Fitr': '🌙', 'Chithirai Thiruvizha': '🛕',
            'Aadi Perukku': '🌊', 'Vinayaka Chaturthi': '🐘', 'Navaratri': '🎭',
            'Ayudha Puja': '🛠️', 'Deepavali': '🪔', 'Soorasamharam': '🔱',
            'Karthigai Deepam': '🕯️', 'Vaikunta Ekadasi': '🚪', 'Margazhi Begins': '🌸'
          };
          
          const enriched = data.map(f => ({
            ...f,
            emoji: emojiMap[f.name] || (f.name.includes('Pongal') ? '🍚' : '✨')
          }));
          
          setFestivals(enriched);
          
          const selectedStr = selectedDate.toISOString().split('T')[0];
          const directMatch = Array.isArray(enriched) ? enriched.find?.(d => d.date === selectedStr) : null;
          const nextFest = Array.isArray(enriched) ? enriched.find?.(d => new Date(d.date) >= selectedDate) : null;
          setInsights(directMatch || nextFest || (Array.isArray(enriched) ? enriched[0] : null));
        }
      } catch (err) {
        console.error("Festival Fetch Error:", err);
      }
    };
    fetchFestivals();
  }, []);

  useEffect(() => {
    if (festivals.length > 0) {
      const selectedStr = selectedDate.toISOString().split('T')[0];
      const directMatch = Array.isArray(festivals) ? festivals.find?.(d => d.date === selectedStr) : null;
      const nextFest = Array.isArray(festivals) ? festivals.find?.(d => new Date(d.date) >= selectedDate) : null;
      setInsights(directMatch || nextFest || (Array.isArray(festivals) ? festivals[0] : null));
    }
  }, [selectedDate, festivals]);

  useEffect(() => {
    if (search.trim().length > 1) {
        const filtered = (Array.isArray(festivals) ? festivals : []).filter?.(f => 
            f.name.toLowerCase().includes(search.toLowerCase()) || 
            (f.name_ta && f.name_ta.includes(search))
        );
        setSearchResults(filtered.slice(0, 5));
    } else {
        setSearchResults([]);
    }
  }, [search, festivals]);

  const handleSearchSelect = (fest) => {
    const festDate = new Date(fest.date);
    setCurrentDate(new Date(festDate.getFullYear(), festDate.getMonth(), 1));
    setSelectedDate(festDate);
    setSearch('');
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderMonthlyView = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const days = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const cells = [];

    for (let i = 0; i < startDay; i++) cells.push(<div key={`pad-${i}`} />);

    for (let d = 1; d <= days; d++) {
        const fullDate = new Date(year, month, d);
        const dateStr = fullDate.toISOString().split('T')[0];
        const fests = (Array.isArray(festivals) && festivals.length > 0 ? festivals : MOCK_FESTIVALS).filter?.(f => f.date === dateStr) || [];
        const isToday = fullDate.toDateString() === new Date(2026, 3, 1).toDateString();
        const isSelected = selectedDate.toDateString() === fullDate.toDateString();

        cells.push(
            <div 
                key={d} 
                style={S.dayCell(isToday, isSelected, fests.length)} 
                onClick={() => setSelectedDate(fullDate)}
            >
                <span style={{ fontSize: '.75rem', fontWeight: 900, color: fests.length > 0 ? 'var(--gold-deep)' : 'var(--brown-deep)', marginBottom: fests.length > 0 ? 2 : 0 }}>{d}</span>
                {fests.length > 0 && <span style={{ fontSize: '1rem' }}>{fests[0].emoji}</span>}
                {fests.length > 1 && <div style={S.multiIndicator} />}
                {fests.length > 0 && <div style={S.festBadge}>{isTa ? fests[0].name_ta : fests[0].name}</div>}
                {isSelected && fests.length === 0 && <div style={{ position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: '50%', background: 'var(--brown-deep)' }} />}
            </div>
        );
    }

    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    return (
        <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div style={S.grid}>
                {weekdays.map(w => <div key={w} style={S.dayHeader}>{w}</div>)}
                {cells}
            </div>
        </div>
    );
  };

  const renderWeeklyView = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(selectedDate);
        day.setDate(selectedDate.getDate() + i);
        const dateStr = day.toISOString().split('T')[0];
        const fests = (Array.isArray(festivals) && festivals.length > 0 ? festivals : MOCK_FESTIVALS).filter?.(f => f.date === dateStr) || [];
        weekDays.push({ date: day, fests });
    }

    return (
        <div style={{ marginTop: 20, display: 'grid', gap: 10, animation: 'fadeIn 0.2s ease-out' }}>
            {weekDays.map((wd, i) => (
                <div key={i} style={{ background: wd.fests.length > 0 ? 'var(--brown-deep)' : 'white', color: wd.fests.length > 0 ? 'var(--gold-light)' : 'var(--brown-deep)', padding: '12px 16px', border: '1.5px solid var(--parchment)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'center', width: 40 }}>
                            <div style={{ fontSize: '.55rem', fontWeight: 950, opacity: 0.6 }}>{wd.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 950 }}>{wd.date.getDate()}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: '.85rem' }}>
                                {wd.fests.length > 0 ? wd.fests.map(f => (isTa ? (f.name_ta || f.name) : f.name)).join(' + ') : (isTa ? 'வழக்கமான நாள்' : 'Regular Day')}
                            </div>
                            <div style={{ fontSize: '.7rem', opacity: 0.8 }}>
                                {wd.fests.length > 0 ? (isTa ? `${wd.date.toLocaleDateString('ta-IN', { month: 'long' })} மாதத்தில் முக்கிய நாள்` : `Important Day in ${wd.date.toLocaleDateString('en-US', { month: 'long' })}`) : (isTa ? 'சிறப்பு நிகழ்வுகள் இல்லை' : 'Business as usual')}
                            </div>
                        </div>
                    </div>
                    {wd.fests.length > 0 && <span style={{ fontSize: '1.5rem' }}>{wd.fests[0].emoji}</span>}
                </div>
            ))}
        </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 1100 ? '1fr' : 'minmax(400px, 1fr) 360px', gap: 20, marginBottom: 20 }}>
      {/* CALENDAR SECTION */}
      <div style={S.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarIcon size={22} color="var(--brown-deep)" />
            <h3 style={{ fontFamily: 'var(--font-d)', fontSize: '1.25rem', fontWeight: 950, color: 'var(--brown-deep)' }}>
              {isTa ? currentDate.toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' }) : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', background: 'var(--parchment)', borderRadius: 20, padding: '2px' }}>
                <button onClick={() => setView('monthly')} style={S.viewToggle(view === 'monthly')}>{isTa ? 'மாதாந்திர' : 'MONTHLY'}</button>
                <button onClick={() => setView('weekly')} style={S.viewToggle(view === 'weekly')}>{isTa ? 'வாராந்திர' : 'WEEKLY'}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={handlePrev} style={{ background: 'white', border: '1.5px solid var(--parchment)', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><ChevronLeft size={16} /></button>
              <button onClick={handleNext} style={{ background: 'white', border: '1.5px solid var(--parchment)', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {/* SEARCH BAR RELOCATION */}
        <div style={{ position: 'relative', marginBottom: 15 }}>
            <div style={{ padding: '10px 16px', background: 'var(--parchment)', borderRadius: 10, border: '1.5px solid var(--gold-pale)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Search size={16} color="var(--brown-mid)" />
                <input 
                    type="text" 
                    placeholder={isTa ? 'திருவிழாக்களில் தேடுங்கள்...' : "Find a festival (e.g. Holi, Puthandu)..."}
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '.8rem', fontWeight: 800, color: 'var(--brown-deep)' }}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <Sparkles size={16} color="var(--gold-deep)" />
            </div>
            
            {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderRadius: 12, border: '2px solid var(--gold)', boxShadow: '4px 4px 0 var(--brown-deep)', zIndex: 10, marginTop: 4, overflow: 'hidden' }}>
                    {searchResults.map((f, i) => (
                        <div 
                            key={i} 
                            onClick={() => handleSearchSelect(f)}
                            style={{ padding: '10px 15px', borderBottom: i === searchResults.length - 1 ? 'none' : '1px solid var(--parchment)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--gold-pale)'}
                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                        >
                            <div>
                                <div style={{ fontSize: '.8rem', fontWeight: 900, color: 'var(--brown-deep)' }}>{isTa ? (f.name_ta || f.name) : f.name}</div>
                                <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'var(--gold-deep)' }}>{f.date}</div>
                            </div>
                            <span style={{ fontSize: '1.2rem' }}>{f.emoji}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {view === 'monthly' ? renderMonthlyView() : renderWeeklyView()}

      </div>

      {/* AI INSIGHTS SIDEBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ ...S.container, background: 'var(--brown-deep)', color: 'white', border: '2.5px solid var(--gold)', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.1, color: 'var(--gold)' }}><Sparkles size={100} /></div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gold)', marginBottom: 15 }}>
              <Sparkles size={16} />
              <span style={{ fontSize: '.65rem', fontWeight: 950, letterSpacing: 1.2 }}>{isTa ? 'உள்ளூர் திருவிழா வழிகாட்டி' : 'LOCAL FESTIVAL COPILOT'}</span>
           </div>
           
           {insights ? (
             <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ background: 'var(--gold)', color: 'var(--brown-deep)', fontSize: '1.2rem', width: 36, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', fontWeight: 900 }}>{insights.name.charAt(0)}</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-d)', fontSize: '1.3rem', fontWeight: 900, color: 'var(--gold-light)' }}>
                            {isTa ? (insights.name_ta || insights.name) : insights.name}
                        </div>
                        <div style={{ fontSize: '.65rem', color: 'var(--gold)', fontWeight: 800 }}>📅 {insights.date}</div>
                    </div>
                </div>

                <div style={{ fontSize: '.8rem', color: 'var(--parchment)', lineHeight: 1.5, marginBottom: 15, borderLeft: '2.5px solid var(--gold)', paddingLeft: 12 }}>
                    "{insights.suggestion}"
                </div>
                
                <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: 14, borderRadius: 10, border: '1px solid rgba(201, 146, 26, 0.2)' }}>
                        <div style={{ fontSize: '.6rem', fontWeight: 950, color: 'var(--gold)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                             <Sparkles size={12} /> {isTa ? 'மார்க்கெட்டிங் உத்தி' : 'MARKETING STRATEGY'}
                        </div>
                        <div style={{ fontSize: '.75rem', lineHeight: 1.4 }}>{isTa ? (insights.marketing_tip_ta || insights.marketing_tip) : insights.marketing_tip}</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: 14, borderRadius: 10, border: '1px solid rgba(255, 154, 139, 0.2)' }}>
                        <div style={{ fontSize: '.6rem', fontWeight: 950, color: '#ff9a8b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                             <ShoppingBag size={12} /> {isTa ? 'பொருள் இருப்பு' : 'INVENTORY FOCUS'}
                        </div>
                        <div style={{ fontSize: '.75rem', lineHeight: 1.4 }}>{isTa ? (insights.inventory_tip_ta || insights.inventory_tip) : insights.inventory_tip}</div>
                    </div>
                </div>
             </div>
           ) : (
             <div style={{ textAlign: 'center', padding: '30px 0', opacity: 0.5 }}>
                 <TrendingUp size={40} style={{ marginBottom: 12 }} />
                 <div style={{ fontSize: '.7rem' }}>{isTa ? 'உள்ளூர் திருவிழா தரவு ஒத்திசைகிறது...' : 'Syncing local festival data...'}</div>
             </div>
           )}
        </div>

        <div style={S.container}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brown-mid)', marginBottom: 12 }}>
                <TrendingUp size={18} />
                <span style={{ fontSize: '.7rem', fontWeight: 950, color: 'var(--brown-deep)' }}>{isTa ? 'தமிழ்நாடு நிலவரம்' : 'TAMIL NADU PULSE'}</span>
            </div>
            <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--brown-deep)', lineHeight: 1.5 }}>
                {isTa ? <><strong style={{ color: 'var(--gold-deep)', borderBottom: '1.5px solid var(--gold)' }}>பாரம்பரிய உடைகளுக்கான</strong> உள்ளூர் தேவை ஏப்ரல் தொடக்கத்தில் அதிகரிக்கும். தமிழ் புத்தாண்டுக்கு உங்கள் கடையை தயார் செய்யுங்கள்.</> : <>Local demand for <strong style={{ color: 'var(--gold-deep)', borderBottom: '1.5px solid var(--gold)' }}>Traditional Wear</strong> peaks early in April. Ready your store for Tamil New Year.</>}
            </div>
            <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 8, fontSize: '.65rem', color: 'var(--brown-mid)', background: 'var(--parchment)', padding: '8px 12px', borderRadius: 6 }}>
                <Info size={14} />
                {isTa ? 'உள்ளூர் திருவிழா இயந்திரம் செயல்படுகிறது' : 'Hyper-local festival engine active'}
            </div>
        </div>
      </div>
    </div>
  );
}
