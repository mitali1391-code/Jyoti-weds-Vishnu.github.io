import { useState, useEffect, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { ArrowDown, ArrowUpRight, CalendarDays, Check, ChevronRight, Clock3, Download, Menu, MapPin, Utensils, X } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const heroImage = "https://static.prod-images.emergentagent.com/jobs/79539167-abc8-4a57-916e-552711a1ae8a/images/691a1ff65ba36ed0ece90ecdbb3aecf274b68a2f317acdabd03352ba6ec96ab5.jpeg";
const brideImage = "/gen/bride.png";
const groomImage = "/gen/groom.png";
const feastImage = "/gen/sadhya.png";
const closingImage = "/gen/closing.png";
const events = [
  ["01", "Haldi", "31 Oct 2026", "10:00 am — 12:00 pm", "Turmeric, laughter and golden blessings as the family anoints the bride.", "✦", "/gen/haldi.png"],
  ["02", "Sangeet", "31 Oct 2026", "07:00 pm — 10:00 pm", "An evening of music, dance and joyful family performances under the lights.", "♪", "/gen/sangeet.png"],
  ["03", "Muhurtham", "01 Nov 2026", "11:55 am — 12:25 pm", "The sacred tying of the thali at the auspicious hour, beneath the mandap.", "ॐ", "/gen/muhurtham.png"],
  ["04", "Reception & Lunch", "01 Nov 2026", "Thereafter", "Blessings, greetings and a grand celebratory feast with everyone we love.", "❋", "/gen/sadhya.png"],
];

/* Decorative floral wreath ring rendered in SVG (matches reference welcome page) */
function Wreath({ children, testId }) {
  const leaves = Array.from({ length: 40 });
  const marigolds = Array.from({ length: 10 });
  return (
    <div className="wreath" data-testid={testId}>
      <svg viewBox="0 0 300 300" className="wreath-ring" aria-hidden>
        {leaves.map((_, i) => {
          const a = (i / leaves.length) * Math.PI * 2;
          const r = 140;
          const cx = 150 + Math.cos(a) * r;
          const cy = 150 + Math.sin(a) * r;
          const rot = (a * 180) / Math.PI + 90;
          return (
            <g key={i} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
              <ellipse cx="0" cy="0" rx="14" ry="6" fill="#4a6b3c" />
              <ellipse cx="4" cy="-4" rx="9" ry="4" fill="#5b7d47" />
            </g>
          );
        })}
        {marigolds.map((_, i) => {
          const a = (i / marigolds.length) * Math.PI * 2 + 0.16;
          const r = 128;
          const cx = 150 + Math.cos(a) * r;
          const cy = 150 + Math.sin(a) * r;
          return (
            <g key={"m" + i}>
              <circle cx={cx} cy={cy} r="8" fill="#d69b2b" />
              <circle cx={cx} cy={cy} r="3.5" fill="#a83a1e" />
            </g>
          );
        })}
      </svg>
      <div className="wreath-photo">{children}</div>
    </div>
  );
}

/* Marigold toran (garland) — single smooth swooping arc + beads that sit on the rope */
function MarigoldToran({ className = "" }) {
  const N = 22;
  const PAD = 22; // keep endpoint beads inside the viewBox so they aren't clipped
  return (
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className={`toran ${className}`} aria-hidden overflow="visible">
      {/* single smooth quadratic curve dipping down in the middle */}
      <path d="M 0 8 Q 500 96 1000 8" fill="none" stroke="#8a5a1c" strokeWidth="2" />
      {Array.from({ length: N }).map((_, i) => {
        const t = i / (N - 1);
        const cx = PAD + t * (1000 - 2 * PAD);
        // exact y along the quadratic Q(0,8) (500,96) (1000,8) at parametric τ = cx/1000
        const tau = cx / 1000;
        const cy = 8 + 176 * tau * (1 - tau);
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="10" fill="#d69b2b" />
            <circle cx={cx} cy={cy} r="5" fill="#a83a1e" />
            <path d={`M ${cx - 2} ${cy + 10} L ${cx - 3} ${cy + 24}`} stroke="#4a6b3c" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d={`M ${cx + 2} ${cy + 10} L ${cx + 3} ${cy + 24}`} stroke="#4a6b3c" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}

function RSVP() {
  const [form, setForm] = useState({ name: "", attending: true, guests: 1, meal: "Sadya", note: "" });
  const [status, setStatus] = useState("idle");
  const submit = async (event) => { event.preventDefault(); setStatus("sending"); try { await axios.post(`${API}/rsvp`, { ...form, guests: Number(form.guests) }); setStatus("sent"); } catch { setStatus("error"); } };
  if (status === "sent") return <div className="rsvp-success" data-testid="rsvp-success-message"><Check size={20}/> Thank you, {form.name}. We’ll see you there.</div>;
  return <form className="rsvp-form rsvp-form-simple" onSubmit={submit} data-testid="rsvp-form">
    <label>Your name<input data-testid="rsvp-name-input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="How should we address you?" autoFocus/></label>
    <button className="primary-button" data-testid="rsvp-submit-button" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Confirm my RSVP"}<ArrowUpRight size={17}/></button>
    {status === "error" && <p className="error-text" data-testid="rsvp-error-message">We couldn’t save that just now. Please try again.</p>}
  </form>;
}
function Person({ image, name, role, parents, place }) { return <div className="person"><Wreath testId={`person-${name.toLowerCase().replaceAll(" ", "-")}-wreath`}><img src={image} alt={name} data-testid={`person-${name.toLowerCase().replaceAll(" ", "-")}-image`}/></Wreath><h3>{name}</h3><p className="role">{role}</p><p>{parents}</p><small>{place}</small></div>; }
import FlowerAnimation from './components/FlowerAnimation';

function Home() {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [animationsDone, setAnimationsDone] = useState(false);
  const [currentEmbed, setCurrentEmbed] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const playerRef = useRef(null);

  // Playlist can be extended with more YouTube / SoundCloud embed URLs
  const playlist = [
    { title: 'Wedding Song (YouTube)', url: 'https://www.youtube.com/embed/qbR0JTAJbuw' }
  ];

  function playTrack(index) {
    const t = playlist[index];
    if (!t) return;
    const embed = `${t.url}?autoplay=1&rel=0&iv_load_policy=3`;
    setCurrentEmbed(embed);
    setCurrentTrack(index);
  }

  // Start background music on first mount (hidden offscreen). Autoplay is attempted; some browsers may block autoplay if not allowed.
  useEffect(() => {
    try {
      const t = playlist[0];
      if (t) {
        const embed = `${t.url}?autoplay=1&rel=0&iv_load_policy=3`;
        setCurrentEmbed(embed);
      }
    } catch (err) {
      // ignore
    }
  }, []);

  function openInvitation(e) {
    // don't prevent default so anchor navigation still works — just start the opening sequence
    if (isOpening) return;
    // Start opening sequence: music + entrance animations
    setIsOpening(true);
    // Autoplay first track; user gesture (click) allows autoplay
    playTrack(0);
    // Run entrance animations for ~3.5s then mark animations done (interactions resume)
    const duration = 3500;
    setTimeout(() => {
      setIsOpening(false);
      setAnimationsDone(true);
    }, duration);
  }

  useEffect(() => {
    // If animationsDone is set, remove overlay class after a short delay
    if (animationsDone) {
      const t = setTimeout(() => setAnimationsDone(false), 1200);
      return () => clearTimeout(t);
    }
  }, [animationsDone]);

  return <main className={isOpening || animationsDone ? 'opening' : ''}>
    {(isOpening || animationsDone) && <FlowerAnimation />}
    <div className="page-ornaments" aria-hidden>
      {["✦","❋","◆","✧","❋","✦","◆","✧","❋","✦"].map((s,i)=><span key={i} className={`po po-${i+1}`}>{s}</span>)}
    </div>
    <section className="hero" id="top">
      <div className="page-corner-mark tl" aria-hidden/>
      <div className="page-corner-mark tr" aria-hidden/>
      <div className="hero-motifs" aria-hidden><span className="hm hm-1">✦</span><span className="hm hm-2">❋</span><span className="hm hm-3">◆</span><span className="hm hm-4">✧</span><span className="hm hm-5">❋</span></div>
      <div className="hero-panel">
        <div className="hero-ganesh" data-testid="hero-ganesh"><img src={heroImage} alt="Lord Ganesh"/></div>
        <p className="hero-shloka" data-testid="hero-eyebrow"><em>|| Sri Ganeshaya Namah ||</em></p>
        <div className="hero-flourish" aria-hidden>
          <svg viewBox="0 0 260 24" preserveAspectRatio="none"><path d="M4 12 Q 60 4 128 12 Q 198 20 256 12" fill="none" stroke="#c9a441" strokeWidth="1.4"/><g fill="#c9a441"><polygon points="128,4 136,12 128,20 120,12"/></g></svg>
        </div>
        <p className="hero-kicker" data-testid="hero-kicker">YOU ARE INVITED TO THE WEDDING OF</p>
        <h1 className="hero-names" data-testid="hero-couple-name">Jyoti <span className="amp">&amp;</span> Vishnu</h1>
        <a href="#story" className="hero-cta" data-testid="hero-open-invitation" onClick={openInvitation}>{isOpening ? 'Opening…' : 'OPEN INVITATION'}</a>
        {/* Interaction blocker while opening animations/music start */}
        {isOpening && <div className="interaction-overlay" aria-hidden />}
        {/* Hidden audio iframe (YouTube embed) - created on mount to play in background */}
        {currentEmbed && <div className="audio-holder" aria-hidden><iframe ref={playerRef} title="background-music" src={currentEmbed} allow="autoplay; encrypted-media" style={{width:0,height:0,border:0}}/></div>}
      </div>
    </section>
    <section className="invocation section-pad" data-testid="invocation">
      <div className="toran-wrap"><MarigoldToran/></div>
      <div className="invocation-panel">
        <div className="om-big" aria-hidden>ॐ</div>
        <p className="invocation-en" data-testid="invocation-shloka-en">|| SHRI GANESHAYA NAMAH ||</p>
        <p className="invocation-sanskrit" lang="sa">वक्रतुण्ड महाकाय, सूर्यकोटि समप्रभः ।<br/>निर्विघ्नं कुरुमे देव, सर्व कार्येषु सर्वदा ।।</p>
        <p className="invocation-together" data-testid="intro-eyebrow"><span className="motif">❋</span> Together with our families <span className="motif">❋</span></p>
        <h2 className="couple-script" data-testid="intro-heading">Jyoti <span>&</span> Vishnu</h2>
        <p className="invocation-tag"><em>A celebration of love, tradition and two families becoming one.</em></p>
        <div className="intro-rule">✦ <span/> ✦</div>
        <p className="invocation-date"><strong>01</strong> · Sunday · November · 2026</p>
        <p className="invocation-venue">UTSAV RESORT · BHILWARA</p>
      </div>
    </section>
    <section className="people section-pad" id="story"><div className="section-label"><span>01</span><p className="eyebrow">The families</p></div><div className="people-grid"><Person image={brideImage} name="Jyoti Nair" role="Daughter of" parents="Rekha Nair & Praveen Kumar" place="Tilak Nagar, Bhilwara"/><div className="ampersand">&</div><Person image={groomImage} name="Vishnu Prasad Nair" role="Son of" parents="Saraswathi Nair & Rajendra Prasad Nair" place="Bhuwana, Udaipur"/></div><div className="story-copy"><p className="eyebrow">A family story</p><h2>Two homes, <em>one joyful beginning.</em></h2><p>From the first hello to this auspicious day, every step has been made brighter by the families and friends who surround us. With the blessings of our elders, we invite you to witness the beautiful beginning of our forever.</p></div></section>
    <section className="schedule section-pad" id="weekend"><div className="section-label"><span>02</span><p className="eyebrow">The wedding weekend</p></div><div className="heading-row"><h2>Save the <em>moments.</em></h2><p>Mark your calendar and come celebrate every ritual, rhythm and delicious beginning.</p></div><div className="event-list">{events.map(([number,title,date,time,text,icon,img],i)=><article className={`event ${i%2?"event-alt":""}`} key={number} data-testid={`event-${number}`}><img className="event-photo" src={img} alt={title} data-testid={`event-${number}-image`}/><div className="event-body"><span className="event-number">{number}</span><span className="event-icon">{icon}</span><div><h3>{title}</h3><p className="event-meta"><CalendarDays size={14}/>{date}<Clock3 size={14}/>{time}</p><p>{text}</p></div><ChevronRight className="event-arrow" size={20}/></div></article>)}</div></section>
    <section className="venue section-pad venue-framed" id="venue"><div className="venue-copy"><div className="section-label"><span>03</span><p className="eyebrow">The auspicious hour</p></div><h2>Muhurtham</h2><p className="time-big">11:55 <small>AM</small> <b>—</b> 12:25 <small>PM</small></p><p className="venue-date">Sunday, November 01, 2026 · 15 Tulam 1202</p><div className="venue-rule-line"><span/> <span className="dot"/> <span/></div><div className="venue-address"><MapPin size={18}/><div><strong>Utsav Resort</strong><br/>Ring Road Cross, Sanganer Road<br/>Bhilwara</div></div><a href="https://maps.google.com/?q=Utsav+Resort+Bhilwara" target="_blank" rel="noreferrer" className="text-link" data-testid="directions-link">Get directions <ArrowUpRight size={15}/></a></div><div className="venue-map" data-testid="venue-map"><a href="https://maps.google.com/?q=Utsav+Resort+Bhilwara" target="_blank" rel="noreferrer" aria-label="Open map in Google Maps" className="venue-map-link"><iframe title="Utsav Resort, Bhilwara" src="https://www.google.com/maps?q=Utsav+Resort+Bhilwara&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><span className="venue-map-hint"><MapPin size={14}/> Open in Google Maps</span></a></div></section>
    <section className="rsvp-band section-pad"><div className="rsvp-heading"><p className="eyebrow">Your presence is our present</p><h2>Will we see <em>you there?</em></h2><p>One tap is all it takes — tell us you are coming and the family will be notified.</p></div>{rsvpOpen ? <div className="rsvp-panel"><button className="close-button" onClick={()=>setRsvpOpen(false)} data-testid="rsvp-close-button"><X size={19}/></button><RSVP/></div> : <button className="primary-button" onClick={()=>setRsvpOpen(true)} data-testid="open-rsvp-button">Yes, I’m coming <ArrowUpRight size={17}/></button>}</section>
    <section className="closing-band" data-testid="closing-band" style={{backgroundImage:`url(${closingImage})`}}>
      <div className="closing-overlay"/>
      <div className="closing-diamond">
        <div className="closing-inner">
          <p className="eyebrow light">— Until then —</p>
          <p className="closing-message">With love, we look forward<br/><em>to celebrating with you.</em></p>
          <h3 className="closing-couple">Jyoti <span>&</span> Vishnu</h3>
          <p className="closing-family">— THE NAIR FAMILY —</p>
        </div>
      </div>
    </section>
  </main>;
}
function App() { return <Home/>; }
export default App;