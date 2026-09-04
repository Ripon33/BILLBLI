export type DecisionIntent =
  | "learn"
  | "decide"
  | "research"
  | "plan"
  | "solve";

export type DecisionMode =
  | "study"
  | "education"
  | "shopping"
  | "research"
  | "business"
  | "career"
  | "healthcare"
  | "technology"
  | "travel"
  | "general";

export interface IntentClassification {
  intent: DecisionIntent;
  mode: DecisionMode;
  primaryIntent: DecisionIntent;
  primaryMode: DecisionMode;
  secondaryIntents: DecisionIntent[];
  secondaryModes: DecisionMode[];
}

function containsAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function detectSignals(question: string): Array<{ intent: DecisionIntent; mode: DecisionMode }> {
  const text = question.trim().toLowerCase();
  const signals: Array<{ intent: DecisionIntent; mode: DecisionMode }> = [];

  const add = (intent: DecisionIntent, mode: DecisionMode) => {
    if (!signals.some((item) => item.intent === intent && item.mode === mode)) {
      signals.push({ intent, mode });
    }
  };

  // Learning
  if (
    containsAny(text, [
      "explain", "teach", "learn", "understand", "study",
      "concept", "what is", "how does",
      "اشرح", "বুঝিয়ে", "বুঝিয়ে", "শেখাও",
      "सिखाओ", "光合成", "photosynthèse",
      "fotosíntesis", "photosynthese",
    ])
  ) {
    add("learn", "study");
  }

  // Study planning
  if (
    containsAny(text, [
      "exam", "test", "prepare", "preparation",
      "study plan", "revision",
      "পরীক্ষা", "exam-এর", "امتحان",
      "examen", "prüfung",
    ])
  ) {
    add("plan", "study");
  }

  // Shopping
  if (
    containsAny(text, [
      "laptop", "phone", "smartphone", "buy",
      "purchase", "product", "which laptop",
      "কিনব", "কিনবো", "شراء", "comprar",
      "acheter", "kaufen",
    ])
  ) {
    add("decide", "shopping");
  }

  // Research
  if (
    containsAny(text, [
      "research", "evidence", "study says",
      "studies", "literature", "papers", "findings",
      "গবেষণা", "গবেষণায়", "دراسة", "بحث",
      "investigación", "recherche", "forschung",
    ])
  ) {
    add("research", "research");
  }

  // Education
  if (
    containsAny(text, [
      "university", "college", "degree", "course",
      "scholarship", "computer science",
      "বিশ্ববিদ্যালয়", "বিশ্ববিদ্যালয়", "جامعة",
      "universidad", "université", "universität",
    ])
  ) {
    add("decide", "education");
  }

  // Healthcare
  if (
    containsAny(text, [
      "treatment", "doctor", "medical", "healthcare",
      "medicine", "therapy", "চিকিৎসা", "ডাক্তার",
      "علاج", "طبيب", "tratamiento", "médico",
      "traitement", "médecin",
    ])
  ) {
    add("decide", "healthcare");
  }

  // Technology
  if (
    containsAny(text, [
      "programming", "framework", "software",
      "technology", "api", "developer", "coding",
      "প্রোগ্রামিং", "logiciel", "programmation",
      "programmierung",
    ])
  ) {
    add("decide", "technology");
  }

  // Career
  if (
    containsAny(text, [
      "career", "job", "profession", "employment",
      "ক্যারিয়ার", "চাকরি", "وظيفة", "مهنة",
      "carrera", "carrière", "karriere",
    ])
  ) {
    add("decide", "career");
  }

  // Travel
  if (
    containsAny(text, [
      "travel", "trip", "vacation", "destination",
      "holiday", "ভ্রমণ", "ছুটি", "سفر", "عطلة",
      "destino", "viaje", "voyage", "urlaub",
      "reiseziel",
    ])
  ) {
    add("decide", "travel");
  }

  // Business
  if (
    containsAny(text, [
      "business", "startup", "start a business",
      "coffee shop", "restaurant", "market", "competitor",
      "ব্যবসা", "ব্যবসা শুরু", "تجارة", "مشروع",
      "negocio", "entreprise", "geschäft",
    ])
  ) {
    add("decide", "business");
  }

  // General decision
  if (
    containsAny(text, [
      "should i", "which should i", "what should i",
      "choose", "decision", "decide",
      "করা উচিত", "বেছে", "هل يجب",
      "debería", "devrais-je", "soll ich",
    ])
  ) {
    add("decide", "general");
  }

  return signals;
}

export function classifyIntent(question: string): IntentClassification {
  const signals = detectSignals(question);

  if (signals.length === 0) {
    return {
      intent: "learn",
      mode: "general",
      primaryIntent: "learn",
      primaryMode: "general",
      secondaryIntents: [],
      secondaryModes: [],
    };
  }

  // Choose the primary intent by semantic importance rather than
  // the order of keyword detection. This keeps multi-intent behavior
  // stable as BILLBLI adds more domains and languages.
  const intentPriority: Record<DecisionIntent, number> = {
    learn: 100,
    research: 90,
    plan: 65,
    solve: 60,
    decide: 70,
  };

  const rankedSignals = [...signals].sort(
    (a, b) => intentPriority[b.intent] - intentPriority[a.intent],
  );

  const primary = rankedSignals[0];
  const secondary = rankedSignals.slice(1);

  return {
    intent: primary.intent,
    mode: primary.mode,
    primaryIntent: primary.intent,
    primaryMode: primary.mode,
    secondaryIntents: secondary.map((item) => item.intent),
    secondaryModes: secondary.map((item) => item.mode),
  };
}
