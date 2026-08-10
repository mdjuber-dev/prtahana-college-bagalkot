import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Phone,
  MessageSquare as WhatsAppIcon,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/site-config';
import { useCMS } from '@/lib/cms-context';
import { getTelLink, getWhatsAppLink } from '@/lib/communication';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface KnowledgeEntry {
  topic: string;
  keywords: string[];
  answer: string;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    topic: 'college',
    keywords: ['college', 'about', 'overview', 'information', 'prarthana', 'institute', 'institution', 'pu', 'background'],
    answer:
      "Prarthana PU Science College is a premier science institution located in Bagalkot, Karnataka. We offer high-quality PU education with integrated coaching for NEET, KCET and JEE entrance exams. Our mission is to nurture future doctors and engineers with strong academic foundations, discipline and character development. Established with a vision for educational excellence, we have consistently produced outstanding results year after year.",
  },
  {
    topic: 'college_name',
    keywords: ['what is your college', 'college name', 'college full form', 'which college'],
    answer:
      "We are Prarthana PU Science College — the premier PU Science College in Bagalkot, Karnataka. We specialize in Science streams (PCMB and PCMC) with integrated competitive exam coaching.",
  },
  {
    topic: 'courses_overview',
    keywords: ['course', 'courses', 'stream', 'streams', 'subject', 'subjects', 'offering', 'offer', 'combination', 'combinations'],
    answer:
      "We offer TWO science stream combinations at Prarthana PU Science College:\n\n1. **PCMB** — Physics, Chemistry, Mathematics & Biology\n   Ideal for students targeting medical (NEET) + engineering (KCET/JEE) careers.\n\n2. **PCMC** — Physics, Chemistry, Mathematics & Computer Science\n   Perfect for students targeting engineering, software and technology careers.\n\nBoth streams include integrated coaching for NEET, KCET & JEE. Which one would you like to know more about?",
  },
  {
    topic: 'pcmb',
    keywords: ['pcmb', 'biology', 'medical', 'mbbs', 'neet bio', 'physics chemistry mathematics biology'],
    answer:
      "**PCMB — Physics, Chemistry, Mathematics & Biology**\n\n✅ **Ideal for:** Students aspiring to pursue careers in BOTH medical and engineering fields.\n\n📚 **Subjects included:**\n• Physics\n• Chemistry\n• Mathematics\n• Biology\n\n🎯 **Career Paths:**\n• MBBS & Medical (via NEET)\n• Engineering B.Tech (via KCET / JEE)\n• BSc Research & Life Sciences\n• Biotechnology, Pharmacy, Ayurveda, Dentistry, Nursing\n• Veterinary Science, Agriculture\n\n🏆 **Coaching:** Includes fully integrated coaching for NEET, KCET & JEE examinations.\n\nPCMB is our most versatile stream — it keeps both medical and engineering doors fully open.",
  },
  {
    topic: 'pcmc',
    keywords: ['pcmc', 'computer', 'computers', 'engineering', 'software', 'tech', 'coding', 'programming', 'physics chemistry mathematics computer'],
    answer:
      "**PCMC — Physics, Chemistry, Mathematics & Computer Science**\n\n✅ **Ideal for:** Students targeting engineering and technology-driven careers with a focus on computing.\n\n📚 **Subjects included:**\n• Physics\n• Chemistry\n• Mathematics\n• Computer Science\n\n🎯 **Career Paths:**\n• BE / B.Tech Engineering (via KCET / JEE / COMED-K)\n• BSc Computer Science, BSc IT\n• BCA — Bachelor of Computer Applications\n• Data Science, AI & Machine Learning\n• Software Development, App Development, Web Technology\n\n🏆 **Coaching:** Includes fully integrated coaching for NEET, KCET & JEE.\n\nPCMC is our future-ready stream for the digital economy.",
  },
  {
    topic: 'admission_process',
    keywords: ['admission', 'admissions', 'apply', 'application', 'form', 'how to apply', 'joining', 'join', 'enroll', 'process', 'procedure', 'criteria'],
    answer:
      "**🎓 Admission Process at Prarthana PU Science College:**\n\n1️⃣ **Apply Online:** Fill the Admission Form on our website (click 'Apply Now'). You'll receive a unique Application ID and Reference Code instantly.\n\n2️⃣ **Document Submission:** Submit the required documents after applying:\n   • SSLC / 10th Marks Card\n   • Transfer Certificate (TC)\n   • Study Certificate\n   • Aadhaar Card Copy\n   • Passport-size Photographs\n   • Caste / Income Certificate (if applicable)\n\n3️⃣ **Verification:** College will verify your documents and academic eligibility.\n\n4️⃣ **Fee Payment:** Pay the admission fee as per the selected stream (PCMB or PCMC).\n\n5️⃣ **Welcome:** Start your journey with us!\n\n📌 **Eligibility:** SSLC / 10th pass from any recognized board. Admissions are currently open for the Academic Year 2026–27.",
  },
  {
    topic: 'documents_required',
    keywords: ['document', 'documents', 'certificate', 'certificates', 'required', 'need', 'what documents', 'marks card', 'tc', 'transfer'],
    answer:
      "**📋 Required Documents for Admission:**\n\n• SSLC / 10th Standard Marks Card (original + copy)\n• Transfer Certificate (TC) from previous school\n• Study Certificate / Conduct Certificate\n• Aadhaar Card (student + parent)\n• Recent Passport-size Photographs (4–6 copies)\n• Caste Certificate (if applicable — for reservation)\n• Income Certificate (if applying for scholarship)\n• Migration Certificate (for non-Karnataka board students)\n\n💡 Tip: Keep both originals and attested photocopies ready. If you have any queries about documents, call our admission office.",
  },
  {
    topic: 'fees_general',
    keywords: ['fee', 'fees', 'cost', 'price', 'tuition', 'how much', 'charges', 'payment', 'annual', 'yearly'],
    answer:
      "**💰 Fee Structure (Academic Year 2026–27):**\n\nFee details are available on enquiry from the college admissions office for both PCMB and PCMC streams.\n\n📘 **PCMB:** Physics, Chemistry, Mathematics & Biology\n💻 **PCMC:** Physics, Chemistry, Mathematics & Computer Science\n\n🏅 **Merit Scholarships Available:**\n• 95% & Above — First 25 eligible students: **Free Seats**\n• 90% – 94.99% — **80% Fee Concession**\n• 85% – 89.99% — Merit-Based Concession / Subject to Approval\n• 75% – 84.99% — **20% Fee Concession**\n\nScholarship benefits are based on SSLC / 10th Board examination performance. Benefits are subject to eligibility, availability and Principal / Management approval.",
  },
  {
    topic: 'scholarship',
    keywords: ['scholarship', 'scholarships', 'merit', 'discount', 'concession', 'rebate', 'fee waiver', 'financial aid', 'quota', 'reservation'],
    answer:
      "**🏅 Merit Scholarships & Fee Concessions (2026–27):**\n\nBased on SSLC / 10th board examination scores:\n\n🥇 **95% & Above** — First 25 eligible students: **Free Seats**\n🥈 **90% – 94.99%** — **80% Fee Concession**\n🥉 **85% – 89.99%** — Merit-Based Concession / Management Approval\n📘 **75% – 84.99%** — **20% Fee Concession**\n\n💡 **Important:** Subject to college policy and Principal/Management approval. Contact our admission office for eligibility verification.",
  },
  {
    topic: 'hostel',
    keywords: ['hostel', 'hostels', 'stay', 'accommodation', 'accmodation', 'food', 'mess', 'lodging', 'boarding', 'pg', 'boys', 'girls'],
    answer:
      "**🏠 Hostel Facilities at Prarthana College:**\n\n✅ **Separate hostels** for Boys and Girls within / near the campus.\n\n🏢 **Facilities include:**\n• Security & Warden supervision\n• Spacious, clean & well-ventilated rooms\n• Hygienic mess / dining facility\n• Dedicated Study Hours & Study Hall\n• Wi-Fi Internet access\n• Drinking water & power backup\n• First-aid & medical assistance on call\n• Indoor games & recreation\n\nFacility charges are available from the college admissions office on enquiry.",
  },
  {
    topic: 'transport',
    keywords: ['transport', 'bus', 'travel', 'commute', 'route', 'routes', 'van', 'pickup', 'drop', 'facility'],
    answer:
      "**🚌 Transport Facility:**\n\n✅ We provide **college bus / transport facility** covering major routes in and around Bagalkot city.\n\n🚍 **Key Features:**\n• Multiple routes covering important localities\n• GPS-tracked vehicles for safety\n• Experienced & verified drivers\n• Attenders on-board for student assistance\n• Pickup and drop at designated stops\n\nTo know if your area is covered and to enquire about applicable transport charges, please contact the college office.",
  },
  {
    topic: 'uniform',
    keywords: ['uniform', 'dress', 'dress code', 'clothing', 'shoes', 'tie', 'belts'],
    answer:
      "👔 **Uniform:**\n\nYes, Prarthana PU Science College has a prescribed uniform for all students to maintain discipline and equality.\n\n👕 **What's included:** Premium quality uniform items as prescribed by the college.\n\nUniform-related charges are available from the college admissions office on enquiry. Fitting and distribution happens during the first week of college.",
  },
  {
    topic: 'facilities',
    keywords: ['facility', 'facilities', 'campus', 'library', 'laboratory', 'laboratories', 'lab', 'labs', 'classroom', 'smart class', 'sports', 'wifi', 'infrastructure'],
    answer:
      "**🏛️ World-Class Facilities at Prarthana College:**\n\n📚 **Library:** Well-stocked library with books, journals, digital resources and study hall\n\n🔬 **Laboratories:** Fully-equipped Physics, Chemistry, Biology & Computer Science labs with modern apparatus\n\n💻 **Smart Classrooms:** Digital teaching aids, projectors and interactive learning\n\n⚽ **Sports & Games:** Basketball court, Volleyball, Cricket ground & indoor games\n\n🌿 **Green Campus:** Clean, eco-friendly, peaceful learning environment\n\n📶 **Wi-Fi & Digital:** Campus-wide Wi-Fi, IT support and online test platforms\n\n🎯 **Competitive Exam Coaching Hub:** Integrated coaching classes, doubt-solving sessions and periodic tests for NEET / KCET / JEE\n\nPlus: Hostel facility, Transport, Cafeteria, First-aid medical support and more!",
  },
  {
    topic: 'timings',
    keywords: ['time', 'timings', 'hours', 'schedule', 'when', 'college starts', 'working hours', 'timetable', 'classes start', 'holiday'],
    answer:
      "⏰ **College Timings (General Schedule):**\n\n🕗 **Regular Classes:**\n• Morning: 8:30 AM – 12:30 PM\n• Afternoon: 1:30 PM – 4:30 PM\n\n📚 **Integrated Coaching (NEET/KCET/JEE):**\n• Morning Batch (optional): Early start ~7:00 AM\n• Evening Batch (optional): Post-classes ~4:45 PM onwards\n\n📅 **Working Days:** Monday to Saturday (general)\n\n🏖️ **Holidays:** Sundays, Public holidays, Summer vacation and Dasara / Diwali vacations as per the college academic calendar.\n\n💡 Exact timetable varies by batch and stream. The detailed timetable is shared during admission and orientation week.",
  },
  {
    topic: 'coaching',
    keywords: ['coaching', 'neet', 'kcet', 'jee', 'jee mains', 'jee advanced', 'comedk', 'competitive', 'entrance', 'crash course', 'long term'],
    answer:
      "**🎯 Integrated Competitive Exam Coaching:**\n\nThis is one of our **biggest strengths!** We provide fully **integrated coaching** for top entrance exams — right within the college timetable.\n\n📝 **Exams covered:**\n• 🩺 **NEET UG** — National Eligibility cum Entrance Test (Medical)\n• 🏗️ **KCET** — Karnataka Common Entrance Test (Engineering / Medical)\n• 🏗️ **JEE Mains & JEE Advanced** — National-level Engineering entrance\n• 🎓 **COMED-K** — Private engineering colleges in Karnataka\n\n🏆 **Coaching features:**\n• Expert faculty with proven track record\n• Daily coaching integrated into college schedule\n• Topic-wise study material & DPPs (Daily Practice Papers)\n• Weekly tests, mock exams & performance analysis\n• Doubt-solving sessions & individual attention\n• Result-oriented methodology\n\n📊 Past students have secured excellent ranks in NEET, KCET & JEE year after year!",
  },
  {
    topic: 'achievements',
    keywords: ['achievement', 'achievements', 'result', 'results', 'rank', 'ranks', 'topper', 'toppers', 'passing', 'pass percentage', 'neet result', 'kcet result'],
    answer:
      "🏆 **Achievements & Excellent Results:**\n\nPrarthana PU Science College has a **proven track record** of outstanding academic performance year after year:\n\n✅ **95%+ Results** overall in PU Board examinations\n✅ Excellent **ranks in NEET, KCET & JEE** every year\n✅ Top ranks in Bagalkot district consistently\n✅ Hundreds of students admitted to **premier medical and engineering colleges** across India\n✅ Annual toppers in PCMB and PCMC streams\n\n📊 Our integrated coaching approach + dedicated faculty + disciplined environment directly translates into these exceptional results.\n\nVisit our Achievements page on the website for latest topper photos, ranks and detailed results.",
  },
  {
    topic: 'location',
    keywords: ['location', 'where', 'address', 'place', 'situated', 'map', 'direction', 'directions', 'area', 'near', 'landmark'],
    answer:
      "📍 **Our Location:**\n\n**Prarthana PU Science College**\nDaddenaver Hospital Campus,\nNear Rural Police Station,\nBagalkote, Karnataka 587101\n\n🗺️ **Landmarks:**\n• Right next to / within Daddenaver Hospital Campus\n• Close to Rural Police Station, Bagalkot\n• Easily accessible by road, auto and college buses\n\n📱 Click 'View on Map' in the Contact page or call us for directions.",
  },
  {
    topic: 'contact',
    keywords: ['contact', 'phone', 'number', 'call', 'mobile', 'email', 'whatsapp', 'reach', 'how to contact', 'office', 'helpline', 'admission office'],
    answer:
      "📞 **Contact the Admission Office:**\n\n**Phone / Call:**\n• 94811 38788\n• 79752 17020\n\n**Email:**\n(Use the enquiry form on our Contact page for fastest response)\n\n**Address:**\nPrarthana PU Science College,\nDaddenaver Hospital Campus,\nNear Rural Police Station,\nBagalkote, Karnataka 587101\n\n💬 **WhatsApp:** Available as an option (use the floating button on the website)\n\n⏳ **Office Hours:** Monday – Saturday, roughly 9:00 AM to 5:30 PM\n\nFor the fastest response to admission questions, please submit the Enquiry form on our Contact page. Our team typically responds within 24 working hours.",
  },
  {
    topic: 'apply_now',
    keywords: ['apply now', 'i want to apply', 'i need admission', 'admission link', 'click apply', 'register', 'registration'],
    answer:
      "🎯 **Great decision! To apply for admission:**\n\n👉 **Step 1:** Click the 'Apply Now' button on the website or visit the Admission page directly.\n\n👉 **Step 2:** Fill the online Admission Form carefully (3 quick steps):\n   • Personal & Family Details\n   • Academic Information (SSLC details etc.)\n   • Additional Info & Photo upload\n\n👉 **Step 3:** Submit the form. You will **instantly receive:**\n   ✅ Unique Application ID (e.g. PPSC2026XXXX)\n   ✅ Secure Reference Code\n   ✅ Downloadable PDF Acknowledgement\n\nThen our admission team will reach out to you for the next steps. 🚀",
  },
  {
    topic: 'enquiry_form',
    keywords: ['enquiry', 'inquiry', 'query', 'question', 'ask', 'i have a question', 'i want to enquire', 'send enquiry', 'contact form'],
    answer:
      "💬 **To send a formal enquiry:**\n\nPlease visit our **Contact page** and fill the **Enquiry Form**. The form asks for:\n• Your / Your ward's Name\n• Mobile Number\n• Email ID\n• Course interested in (PCMB / PCMC)\n• Your message / question\n• Enquiry type\n\n✅ **Once submitted:** Your enquiry is saved in our separate Enquiry Records and our admission team will personally call you back within 1–2 working days.\n\nThis is the **recommended** way for detailed questions because every enquiry is tracked, assigned a status and followed up systematically — no message is ever lost.",
  },
  {
    topic: 'seats',
    keywords: ['seat', 'seats', 'availability', 'available', 'vacant', 'intake', 'how many students', 'seat matrix', 'limited'],
    answer:
      "🎟️ **Seat Intake (Academic Year 2026–27):**\n\n📘 **PCMB:** ~120 Seats\n💻 **PCMC:** ~120 Seats\n\n⚠️ **Important:** Seats fill up quickly every year! Admissions are done on **merit + first-come-first-served** basis after SSLC results.\n\n💡 Tip: Apply early to secure your seat. Waiting list is activated once seats are filled.\n\nContact the admission office for current availability status.",
  },
  {
    topic: 'medium_of_instruction',
    keywords: ['medium', 'language', 'english', 'kannada', 'instruction', 'teaching', 'bilingual'],
    answer:
      "📖 **Medium of Instruction:**\n\nWe offer **both mediums** to suit every student:\n\n🇬🇧 **English Medium** — Most popular choice, recommended for competitive exam aspirants (NEET, KCET, JEE are in English)\n\n🇰🇳 **Kannada Medium** — Available as well for students comfortable with Kannada as the primary language of instruction\n\nYou can select your preferred medium at the time of filling the admission form.",
  },
  {
    topic: 'batch_options',
    keywords: ['batch', 'batches', 'morning', 'evening', 'regular', 'which batch', 'preferred batch'],
    answer:
      "⏱️ **Batch Options:**\n\nWe have the following batches to suit different student needs:\n\n🌅 **Morning Batch** — Early morning start (ideal for integrated coaching + day scholars)\n\n☀️ **Regular Batch** — Standard college hours (8:30 AM to 4:30 PM)\n\n🌆 **Evening Batch** — Post-college integrated coaching\n\n💡 You can mention your preferred batch in the admission form. The final batch allocation is done by the college management based on merit and coaching requirements.",
  },
  {
    topic: 'campus_visit',
    keywords: ['visit', 'tour', 'campus tour', 'can i visit', 'come and see', 'open house', 'walk in'],
    answer:
      "🏫 **Absolutely! You are welcome to visit our campus.**\n\nWe encourage students and parents to **walk in** and experience our campus, classrooms, laboratories and hostel facilities in person before taking admission.\n\n📅 **When:** Any working day (Monday – Saturday) between 9:00 AM to 4:30 PM\n\n👤 **Who:** You can come with your parents / guardians\n\n📞 **Tip:** If possible, call the admission office a day before at **94811 38788** so that a staff member can be assigned to show you around and answer all your questions personally.",
  },
];

const SUGGESTED_QUESTIONS = [
  'Which courses are available?',
  'What is PCMB?',
  'What is PCMC?',
  'What is the admission process?',
  'Tell me about the fees',
  'Is hostel available?',
  'How can I contact the college?',
  'Do you provide NEET & JEE coaching?',
];

const DEFAULT_RESPONSE =
  "I don't have that information right now. Please contact the college admission office directly at 94811 38788 or submit an enquiry form on the Contact page and our team will get back to you shortly.";

const WELCOME_MESSAGE = `👋 Welcome to ${siteConfig.shortName} Admission Assistant!

I can help you with **real answers** about our college, courses, fees, admissions, hostel, transport, NEET/KCET/JEE coaching and more.

✅ **Ask me anything** in natural language, or tap a quick question below.`;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function answerQuestion(
  userQuestion: string,
  history: ChatMessage[],
  dynamicBase: KnowledgeEntry[] = []
): string {
  const normalized = normalizeText(userQuestion);
  if (!normalized) return DEFAULT_RESPONSE;
  const questionTokens = new Set(tokenize(normalized));

  // Greetings
  if (/\b(hi|hello|hey|namaste|namaskara|hallo|good (morning|afternoon|evening))\b/.test(normalized)) {
    return `👋 Namaste! Welcome to Prarthana PU Science College. I'm your virtual admission assistant.\n\nI can help you with:\n• Courses (PCMB / PCMC)\n• Fee Structure & Scholarships\n• Admission Process & Documents\n• Hostel & Transport\n• NEET / KCET / JEE Coaching\n• Campus Location & Contact\n\nWhat would you like to know?`;
  }

  // Thanks / bye
  if (/\b(thank|thanks|thx|tq|bye|goodbye|see you|okay bye)\b/.test(normalized)) {
    return `🙏 You're welcome! We're excited to be part of your academic journey.\n\n📞 If you have more questions, feel free to ask here or call us at 94811 38788.\n\n🎓 Apply now for 2026–27 admissions. Seats are limited!`;
  }

  // Context memory: check last bot response topic for follow-up
  let contextBoost = '';
  for (let i = history.length - 1; i >= Math.max(0, history.length - 4); i--) {
    if (history[i].role === 'user') contextBoost += ' ' + normalizeText(history[i].content);
  }
  const contextTokens = new Set(tokenize(contextBoost));

  // Combined tokens with context
  const combinedTokens = new Set([...questionTokens, ...contextTokens]);

  const activeBase = [...dynamicBase, ...KNOWLEDGE_BASE];

  let bestScore = 0;
  let bestAnswer = DEFAULT_RESPONSE;

  for (const entry of activeBase) {
    const entryTokens = new Set(tokenize(entry.keywords.join(' ')));
    let directMatches = 0;
    for (const kw of entry.keywords) {
      if (normalized.includes(kw) || contextBoost.includes(kw)) {
        directMatches += kw.length > 4 ? 2 : 1;
      }
    }
    let tokenOverlap = 0;
    for (const t of combinedTokens) {
      for (const et of entryTokens) {
        if (t === et || et.includes(t) || t.includes(et)) {
          tokenOverlap += 1;
          break;
        }
      }
    }
    const score = directMatches * 3 + tokenOverlap;
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = entry.answer;
    }
  }

  // Confidence threshold — below this, default
  if (bestScore < 3) {
    // Lightweight pattern fallback for key terms
    if (/pcmb/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'pcmb')!.answer;
    if (/pcmc/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'pcmc')!.answer;
    if (/(fee|fees|cost)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'fees_general')!.answer;
    if (/(hostel|stay|accom)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'hostel')!.answer;
    if (/(transport|bus|travel)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'transport')!.answer;
    if (/(admission|apply|form)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'admission_process')!.answer;
    if (/(contact|phone|call|email|number)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'contact')!.answer;
    if (/(neet|kcet|jee|coaching)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'coaching')!.answer;
    if (/(scholarship|merit|discount|concession)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'scholarship')!.answer;
    if (/(doc|certificate|marks|tc|transfer)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'documents_required')!.answer;
    if (/(where|location|address|map|direction|place)/.test(normalized)) return KNOWLEDGE_BASE.find((e) => e.topic === 'location')!.answer;
    return DEFAULT_RESPONSE;
  }

  return bestAnswer;
}

export default function CollegeChatbot() {
  const cms = useCMS();
  const welcomeMessage = cms.chatbot?.welcomeMessage?.trim() || WELCOME_MESSAGE;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      content: welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dynamicKnowledge: KnowledgeEntry[] = (cms.chatbotKnowledge || []).map((k) => ({
    topic: k.topic,
    keywords: k.keywords || [],
    answer: k.answer,
  }));

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [{ ...prev[0], content: welcomeMessage }];
      }
      return prev;
    });
  }, [welcomeMessage]);

  const unreadBadge = useMemo(() => !isOpen && messages.length === 1, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    const thinkDelay = 600 + Math.random() * 600;

    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: answerQuestion(trimmed, messages, dynamicKnowledge),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, thinkDelay);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  const showSuggestions = messages.length <= 3;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'bg-white rounded-2xl shadow-premium flex flex-col overflow-hidden border border-primary-100/60',
                'w-[93vw] max-w-sm max-h-[82vh] h-[560px] md:h-[600px]',
              )}
              role="dialog"
              aria-modal="true"
              aria-label={`${siteConfig.shortName} admission assistant`}
            >
              {/* Header */}
              <div className="bg-gradient-primary p-4 flex items-center gap-3 flex-shrink-0 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex-shrink-0">
                  <Sparkles size={20} className="text-accent-300" />
                </div>
                <img
                  src={siteConfig.logo}
                  alt={`${siteConfig.name} logo`}
                  className="w-10 h-10 rounded-full bg-white object-contain p-1 flex-shrink-0 border border-white/40"
                  width={40}
                  height={40}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate flex items-center gap-1.5">
                    {siteConfig.shortName}
                    <span className="text-[9px] font-semibold bg-accent-500/90 text-white px-1.5 py-0.5 rounded-full tracking-wide">ASSISTANT</span>
                  </h3>
                  <p className="text-white/75 text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success-500 inline-block shadow-[0_0_0_2px_rgba(255,255,255,0.15)]" />
                    Online · Admission queries
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-secondary-50 to-white">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[90%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
                        msg.role === 'user'
                          ? 'bg-gradient-primary text-white rounded-br-md shadow-glow/50'
                          : 'bg-white text-secondary-800 rounded-bl-md border border-primary-100/70',
                      )}
                    >
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-primary-100/70 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                      <div className="flex gap-1.5 items-end">
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.7s' }} />
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.7s' }} />
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.7s' }} />
                        <span className="text-[10px] text-secondary-400 ml-2 font-medium">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {showSuggestions && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-2 space-y-2.5"
                  >
                    <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-[0.14em] px-1 flex items-center gap-1.5">
                      <Sparkles size={11} className="text-accent-500" />
                      Quick Questions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => handleSuggestionClick(q)}
                          className="px-3 py-1.5 text-xs rounded-full bg-white border border-primary-200/70 text-secondary-700 hover:border-primary-500 hover:text-primary-800 hover:bg-primary-50 transition-all shadow-sm hover:-translate-y-0.5"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions + input */}
              <div className="p-3 border-t border-secondary-200 bg-white flex-shrink-0">
                {messages.length <= 3 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Link
                      to="/admission"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-accent text-white text-xs font-bold hover:shadow-glow hover:shadow-accent-500/30 transition-all"
                    >
                      <GraduationCap size={14} />
                      Apply Now
                      <ArrowRight size={14} />
                    </Link>
                    <Link
                      to="/contact"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-50 text-primary-900 text-xs font-bold hover:bg-primary-100 transition-colors border border-primary-200"
                    >
                      <BookOpen size={14} />
                      Enquire Now
                    </Link>
                    <a
                      href={getTelLink()}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white text-primary-700 text-xs font-bold hover:bg-primary-50 transition-colors border border-primary-200"
                    >
                      <Phone size={14} />
                      Call College
                    </a>
                    <a
                      href={getWhatsAppLink(
                        'Hello, I have a query regarding admissions at Prarthana PU Science College.',
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#22c55e] transition-colors"
                    >
                      <WhatsAppIcon size={14} />
                      WhatsApp
                    </a>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about courses, fees, admissions..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-secondary-200 bg-secondary-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white outline-none transition-all text-sm placeholder:text-secondary-400"
                    aria-label="Message input"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="px-3.5 py-2.5 rounded-xl bg-gradient-primary text-white hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launcher */}
        <motion.button
          onClick={() => setIsOpen((o) => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg',
            'bg-gradient-primary text-white border-2 border-white/60',
            'transition-all duration-200',
          )}
          aria-label={isOpen ? 'Close chat' : 'Open admission assistant'}
          aria-expanded={isOpen}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {isOpen ? <X size={24} strokeWidth={2.4} /> : <MessageCircle size={24} strokeWidth={2.2} />}
            </motion.span>
          </AnimatePresence>
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-gradient-primary animate-ping opacity-40" />
          )}
          {unreadBadge && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-md animate-bounce">
              !
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
}
