// Copy of the About, How we work, Contact, Expert profile, Advisers, Careers and
// Subsidy Viability Report pages (Figma batch 2, agent b2e). The same text is
// shipped as messages/_additions/b2e.{en,hi}.json under the "b2e" namespace;
// `b2eText` prefers the message catalogue and falls back to this English copy,
// so a page never shows a raw key before the additions are merged.
//
//   const text = b2eText(t);           // t = await getTranslations({ locale })
//   text("about.title")                // -> "From a piece of land ..."
//   text("profile.askTitle", { name }) // -> "Ask Ananya's team about your project."
//
// No lists here: numbered items are separate keys (s1, s2, s3) so the same tree
// can be shipped as plain nested JSON.
export const B2E_COPY = {
  common: {
    discuss: "Discuss your project",
    whatsapp: "WhatsApp {number}",
    chatWhatsapp: "Chat with Rapid on WhatsApp",
    placeholder: "Placeholder",
    placeholderConfirm: "Placeholder - Rapid to confirm",
    seeHow: "See how we work",
    callOrWhatsapp: "Call or WhatsApp",
    email: "Email",
    office: "Office",
    contact: "Contact",
    home: "Home",
    step: "Step {n}",
    previous: "Previous",
    next: "Next",
  },

  about: {
    eyebrow: "About Rapid",
    title: "From a piece of land to a running factory, with one owner for every file.",
    glance: {
      title: "Rapid at a glance",
      based: "Based in",
      basedValue: "Hisar, Haryana",
      since: "Working since",
      sinceValue: "XX",
      team: "The team",
      teamValue: "XX people",
      cover: "What we cover",
      coverFallback: "Subsidies and incentives, statutory approvals, licences and certifications, industrial insurance and finance",
      start: "How we start",
      startValue: "A free first check, in writing",
      file: "Every file",
      fileValue: "One point person and a shared checklist",
      placeholder: "Placeholder - Rapid to confirm",
    },
    logos: { eyebrow: "Our clients" },
    compare: {
      heading: "Why one owner matters",
      colSituation: "The usual set-up",
      colEffect: "What happens",
      colRapid: "With Rapid",
      situation: "Separate consultants, and nobody responsible.",
      effect: "Every step waits on someone else.",
      rapid: "One owner for the whole sequence",
      closing: "A wrong decision before you invest can cost far more than the advice.",
    },
    why: { eyebrow: "Why Rapid" },
    what: {
      eyebrow: "What we do",
      titleSix: "Six kinds of work, carried as one project.",
      titleMany: "Our kinds of work, carried as one project.",
      intro: "Choose the kind of support you need. Rapid carries the connected work as one project, with one owner.",
      carousel: "Kinds of work",
      explore: "Explore",
      count: "{count} services",
    },
    people: {
      eyebrow: "The Rapid team",
      meet: "Meet {name}",
      viewTeam: "Meet the team",
      roleTbc: "Role to be added",
    },
    how: {
      eyebrow: "How we work",
      title: "Assessment before quotation. An owner for every file.",
      s1: { title: "Listen", text: "A 20-minute call: what, where, by when, and with what budget." },
      s2: {
        title: "Assess",
        text: "A free first check, in writing: a Land Check, an eligibility check or an approval roadmap.",
      },
      s3: {
        title: "Propose",
        text: "The scope, exclusions and timeline, with our fees and government charges shown apart.",
      },
      cta: "See how we work",
    },
  },

  howWeWork: {
    eyebrow: "How we work",
    stepsEyebrow: "The stages",
    stepsTitle: "From the first call to the milestone.",
    advisersEyebrow: "Alongside your advisers",
    faqEyebrow: "Before you engage",
    ctaEyebrow: "Next step",
    heroCard: "In short",
    heroCardS1: "You bring the business objective.",
    heroCardS2: "Rapid brings the expertise, preparation and follow-through.",
    heroCardS3: "The work is agreed before it starts.",
  },

  contact: {
    eyebrow: "Contact",
    title: "Talk to us about your project.",
    sub: "Start with a short description. You don't need the exact service name or a full set of papers.",
    callLabel: "Call or WhatsApp:",
    emailLabel: "Email:",
    officeLabel: "Office:",
    officeValue: "Hisar, Haryana",
    form: {
      title: "Get a free first check.",
      choice: "Where is your project?",
      choicePlaceholder: "Choose one",
      choiceError: "Please choose where your project is.",
      haryana: "Haryana",
      another: "Another state",
      notSure: "Not sure yet",
      district: "District",
      activity: "What are you working on?",
      optional: "optional",
      submit: "Get my next steps",
      helper: "A Rapid expert will call you.",
    },
    next: {
      eyebrow: "What happens next",
      title: "Three steps from your message to a proposal.",
      s1: { title: "A Rapid expert calls you.", text: "To understand what you are planning and where it stands." },
      s2: { title: "Your free first check, in writing.", text: "What applies to your project, and what does not." },
      s3: { title: "A proposal, if you want us to carry it.", text: "The scope, timeline and fees, agreed before the work starts." },
      cta: "See how we work",
    },
    visit: {
      eyebrow: "Visit us",
      title: "Our office in Hisar.",
      address: "Address",
      phone: "Phone",
      whatsapp: "WhatsApp",
      email: "Email",
      hours: "Hours",
      hoursValue: "[days and hours]",
      hoursNote: "Placeholder - Rapid to confirm the office days and hours.",
      directions: "Get directions",
      map: "Rapid Consulting office on Google Maps",
    },
  },

  profile: {
    sample: "Sample profile",
    portrait: "Portrait placeholder",
    portraitFull: "Portrait placeholder - photo to be supplied by Rapid",
    askTitle: "Ask {name}'s team about your project.",
    askHint: "Tell us where your project is. A Rapid expert will call.",
    about: "About {name}",
    background: "Background and experience",
    writtenTitle: "Guides and pages by {name}.",
    writtenEyebrow: "Written and reviewed",
    sampleNote: "Sample associations and dates, shown to demonstrate the profile layout.",
    casesEyebrow: "Cases",
    casesTitle: "Cases {name} wrote or reviewed.",
    seeCases: "See all case studies",
    backToTeam: "Back to the team",
    discuss: "Discuss your project",
    summaryFallback: "{name} is part of the Rapid team in Hisar.",
  },

  advisers: {
    eyebrow: "For advisers",
    cardTitle: "Who this is for",
    cardS1: "CAs and accounting firms",
    cardS2: "Bankers and relationship managers",
    cardS3: "Independent consultants",
    toolLink: "6-question client tool",
    discuss: "Discuss working together",
  },

  careers: {
    eyebrow: "Careers",
    cardTitle: "Work at Rapid",
    cardText: "Rapid's team in Hisar supports clients with project documentation, financial information, applications and coordination.",
    openRoles: "{count} open roles",
    openRole: "1 open role",
    noRoles: "No open roles at the moment",
    seeRoles: "See open roles",
    howWeHire: "How we hire",
    hireEyebrow: "Recruitment",
    applyBack: "All open roles",
  },

  svr: {
    eyebrow: "Before you apply",
    seeContents: "What the report contains",
  },
};

const lookup = (tree, key) => key.split(".").reduce((node, part) => (node == null ? node : node[part]), tree);
const fill = (text, values) =>
  typeof text === "string" && values
    ? text.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))
    : text;

/**
 * b2eText(t) -> (key, values?) => string
 * `t` is a next-intl translator (server: await getTranslations({ locale })).
 * Reads `b2e.<key>` from the catalogue; falls back to the English copy above.
 */
export function b2eText(t) {
  return (key, values) => {
    const full = `b2e.${key}`;
    try {
      if (t?.has?.(full)) return t(full, values);
    } catch {
      /* fall back to the default */
    }
    const text = lookup(B2E_COPY, key);
    return text === undefined ? key : fill(text, values);
  };
}
