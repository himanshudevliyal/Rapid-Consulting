// Home page copy owned by the homepage revision (hero carousel, subsidy tab,
// case cards, industries, approach, FAQ labels). The same text is shipped in
// messages/_additions/w2.{en,hi}.json; `homeText` prefers the message catalogue
// and falls back to this copy, so the page never shows a raw key before the
// additions are merged.

export const HOME_COPY = {
  en: {
    // Home page, Option A (Figma 519-3479). English only: new sales copy has no
    // approved Hindi yet, so Hindi visitors see this English copy (homeText falls
    // back to it). Placeholder figures live in lib/data/home-placeholders.json.
    homeA: {
      hero: {
        eyebrow: "Approvals & subsidies for your business",
        title: "Approvals and subsidies. One team, start to finish.",
        sub: "From land and approval checks to subsidy applications and payment follow-ups, Rapid handles the work.",
        rows: {
          support: {
            title: "End-to-end expert support",
            text: "From pre-application checks to approvals and disbursements.",
          },
          success: {
            title: "95% success rate*",
            text: "Serving MSMEs and industrial businesses across Haryana.",
          },
          ontime: {
            title: "On-time execution",
            text: "Clear processes, a client panel and proactive follow-ups keep your project on track.",
          },
        },
        footnote: "*In the last 11 years, across industries in Haryana.",
      },
      seal: { value: "95%", label: "Success rate", aria: "95% success rate, see the note below the headline" },
      form: {
        eyebrow: "The first check is on us",
        title: "Know what your project needs before you begin.",
        hint: "Choose approval or subsidy to get started.",
        tabsLabel: "Type of check",
        tabApproval: "Approval check",
        tabSubsidy: "Subsidy check",
        name: "Your name",
        phone: "Mobile number",
        phoneHint: "10-digit mobile number",
        district: "District",
        districtPlaceholder: "e.g. Hisar",
        site: "Site location / village",
        activity: "Proposed business activity",
        activityPlaceholder: "e.g. Food processing or manufacturing",
        optional: "optional",
        consent: "Rapid may contact me by phone or WhatsApp about this enquiry.",
        consentHelp: "Allow phone or WhatsApp contact to request your check.",
        submitApproval: "Request an approval check",
        submitSubsidy: "Request a subsidy check",
        sending: "Sending…",
        sentTitle: "Request received",
        another: "Send another request",
      },
      numbers: {
        title: "Rapid, in numbers.",
        years: "Years in Business",
        projects: "Projects Delivered",
        businesses: "Businesses Supported",
        disbursed: "Subsidies & Incentives Disbursed",
        placeholder: "Placeholder figures. Rapid to confirm the final numbers before launch.",
      },
      services: {
        eyebrow: "What we can do for you",
        title: "Know what you need? Choose a service.",
        intro:
          "Explore approvals, subsidies, finance and insurance support for your business. Choose what you need, and let Rapid help with the next step.",
        previous: "Previous services",
        next: "Next services",
        carousel: "Services",
        also: "Also need certification or other business support?",
        viewAll: "View all services",
        approvals: {
          title: "The approvals to build and run your unit.",
          blurb:
            "Buying land, setting up a new unit or expanding? Start with the land and approval checks. We prepare the documents, file the applications and follow up.",
          cta: "Request an approval check",
          source: "home-services-approvals",
        },
        subsidies: {
          title: "Subsidies and incentives for your investment.",
          blurb:
            "Planning a new unit, machinery or expansion? Rapid reviews the schemes that may be relevant to your project and prepares and follows up the agreed application work.",
          cta: "Request a subsidy check",
          source: "home-services-subsidies",
        },
        finance: {
          title: "Finance and insurance support for your project.",
          blurb:
            "Need a project report, bank documentation or industrial insurance cover? Rapid prepares the documents and keeps your CA, lender and insurer working from the same plan.",
          cta: "Discuss your project",
          source: "home-services-finance",
        },
        other: {
          blurb: "Explore the services in this group. Choose what you need, and let Rapid help with the next step.",
          cta: "Discuss your project",
          source: "home-services-other",
        },
        hints: {
          land: "Buying a plot? Check its fit before you commit.",
          clu: "Changing the land's use? Know the approval route first.",
          building: "Ready to build? Check plans before work starts.",
          cte: "Setting up or expanding? Prepare your pollution consent.",
          cto: "Ready to start production? Get operating consent.",
          fire: "Building? Get the fire clearance.",
        },
        subsidyGroup: "Named subsidies and incentives",
        otherGroup: "Rapid’s subsidy advisory",
        overview: "Rapid’s subsidy advisory overview",
        allSchemes: "All schemes",
        report: "Subsidy Viability Report",
        note: "A directory listing shows that a scheme is relevant to a type of project. It does not confirm that your project is eligible.",
      },
      project: {
        eyebrow: "Your project",
        title: "Not sure where to start? Let Rapid’s experts guide you.",
        intro:
          "Buying land, ordering machinery or chasing a stuck file? Rapid experts will check your case and get your project moving in no time. The first check is on us.",
        listLabel: "Where is your project?",
        questions: "Questions people ask",
        helps: "How Rapid helps",
        situations: {
          land: {
            label: "Buying land",
            title: "Buying land for your unit",
            q1: "Can I use this land for my planned industry?",
            q2: "Will I get CLU approval for this plot?",
            q3: "What should I check before paying a token or signing the registry?",
            helps:
              "Rapid checks your plot and land records against your proposed activity, so you know the approval route before committing.",
            warning: "A plot can’t be changed after registry. Get a 48-hour check first.",
            cta: "Check my plot",
          },
          machinery: {
            label: "Planning machinery or expansion",
            title: "Planning new machinery or an expansion",
            q1: "Do my consents need to change before I add machinery or capacity?",
            q2: "Should I check subsidy conditions before I place the machinery order?",
            q3: "Will my project report and finance papers match the new investment?",
            helps:
              "Rapid reviews your plan against your existing consents and the schemes that may apply, so you know the order of steps before you order.",
            warning: "Some scheme conditions depend on dates. Check them before you place the order.",
            cta: "Check my expansion plan",
          },
          newUnit: {
            label: "Setting up a new unit",
            title: "Setting up a new unit",
            q1: "Which approvals does my unit need, and in what order?",
            q2: "Can I start construction while an application is pending?",
            q3: "Which schemes may be relevant to my project?",
            helps:
              "Rapid maps the approvals your activity and site need, then sets out the order and dates so each application is ready when it is due.",
            warning: "Approvals depend on each other. Starting out of order can hold up the project.",
            cta: "Get my approval roadmap",
          },
          running: {
            label: "Unit already running",
            title: "Keeping a running unit in order",
            q1: "Which renewals are coming up, and by when?",
            q2: "Are there subsidy or incentive claims I should be filing?",
            q3: "Is the cover on my plant and machinery still right?",
            helps:
              "Rapid keeps track of your renewal dates and claim windows, and prepares the filings so nothing lapses.",
            warning: "A missed renewal or claim window can mean a penalty or a fresh application.",
            cta: "Check what’s due",
          },
          fileStuck: {
            label: "Approval file stuck",
            title: "An approval file that has stopped moving",
            q1: "Why has my application not moved?",
            q2: "What does the department still need from me?",
            q3: "Should I follow up, correct the file or apply again?",
            helps:
              "Rapid reviews your file and the correspondence so far, finds what is holding it up, and tells you what to send and to whom.",
            warning: "Find out what is holding it before you pay anyone to chase it.",
            cta: "Find out what’s holding it",
          },
          claimStuck: {
            label: "Subsidy claim stuck",
            title: "A subsidy claim that has stopped moving",
            q1: "Is my claim file complete, with the documents in order?",
            q2: "Has a claim window or a scheme condition been missed?",
            q3: "What follow-up is needed with the department or the bank?",
            helps:
              "Rapid checks the claim file against the scheme conditions and prepares the follow-up needed for the next step.",
            warning: "Claim windows can close. Check the dates early.",
            cta: "Check my claim",
          },
        },
      },
      cases: {
        eyebrow: "Client success",
        title: "The work. The follow-through. The result.",
        intro: "A closer look at the projects and the work Rapid brings together.",
        previous: "Previous case studies",
        next: "Next case studies",
        carousel: "Case studies",
        cta: "See how Rapid helped",
        label: "Case study",
      },
      reviews: {
        eyebrow: "Client experiences",
        title: "In our clients’ words.",
        intro: "What it feels like to have Rapid on your side.",
        previous: "Previous reviews",
        next: "Next reviews",
        carousel: "Client reviews",
        overall: "Overall rating",
        count: "client reviews",
        source: "Source",
        chip: "Trusted by growing businesses",
        rated: "Rated 5 out of 5 (sample)",
        servicesTaken: "Services taken",
        viewAll: "View all reviews",
        viewAllHint: "Available once the reviews archive is published.",
        placeholder:
          "Sample content: the rating, reviews and names are placeholders. Final, verified client reviews are to be supplied by Rapid.",
      },
      logos: {
        title: "Businesses that trust Rapid",
        item: "CLIENT LOGO {n}",
        placeholder: "Placeholder tiles. Client logos to be supplied by Rapid.",
        pause: "Pause client logos",
        play: "Play client logos",
      },
      approach: {
        eyebrow: "The Rapid approach",
        title: "Expert guidance. Ownership through execution.",
        bold: "Your plans. A coordinated path to the next milestone.",
        text: "Rapid brings your documentation, applications and follow-ups together, with clear progress and ownership at every step.",
        learn: "Learn more about us",
        discuss: "Discuss your project",
        image: "Placeholder - Rapid team at work. Final photography to be supplied by Rapid.",
      },
      industries: {
        eyebrow: "Industries we serve",
        title: "Built around your business",
        explore: "Explore industry",
        show: "Show details",
        viewAll: "View all industries",
        image: "Placeholder - {industry} photograph. Final photography to be supplied by Rapid.",
      },
      insights: {
        eyebrow: "Insights & resources",
        title: "Useful answers for your next decision.",
        intro: "Practical reading and resources for business owners and their project teams.",
        tabsLabel: "Type of resource",
        articles: "Articles",
        guides: "Guides",
        reports: "Reports",
        soon: "Coming soon",
        viewArticles: "View all articles",
        viewGuides: "View all guides",
        empty: "Nothing published here yet.",
      },
      faq: {
        eyebrow: "Common questions",
        title: "Before we begin.",
        intro: "A few useful answers before your first conversation with Rapid.",
        items: {
          subsidies: {
            q: "Which subsidies could apply to my business?",
            a: "The relevant schemes depend on your business activity, location, investment and project dates. Rapid reviews those details, identifies suitable opportunities and takes ownership of the agreed application work.",
          },
          both: {
            q: "Can Rapid help with both subsidies and approvals?",
            a: "Yes. Rapid works on approvals, subsidy applications and the follow-ups in between, so your documents and dates stay in one plan. The scope of each assignment is agreed with you before work begins.",
          },
          when: {
            q: "When should I speak to Rapid about a new unit or expansion?",
            a: "Before you commit to land, machinery or construction. Some approvals and scheme conditions depend on the order and timing of those steps, so an early conversation helps you plan them properly.",
          },
          name: {
            q: "Do I need to know the scheme or approval name?",
            a: "No. Tell Rapid what you plan to build, buy or expand, and where. Rapid identifies the approvals and schemes that may be relevant and explains the next step.",
          },
        },
      },
    },
    homePage: {
      hero: {
        region: "Featured themes",
        previous: "Previous slide",
        next: "Next slide",
        selectorGroup: "Choose a slide",
        selector: "Slide {n} of {total}: {theme}",
        slideOf: "Slide {n} of {total}",
        discuss: "Discuss your project",
        slides: {
          subsidies: {
            theme: "Subsidies",
            headline: "Unlock subsidy opportunities for your next investment.",
            sub: "Relevant incentives and ownership of the agreed application work.",
            image: "Placeholder - subsidy application documents. Final photography to be supplied by Rapid.",
          },
          newUnit: {
            theme: "New unit",
            headline: "Get your new business unit moving.",
            sub: "Approvals, registrations and the documentation your project needs.",
            image: "Placeholder - new unit under construction. Final photography to be supplied by Rapid.",
          },
          expansion: {
            theme: "Expansion",
            headline: "Turn expansion plans into a funding-ready proposal.",
            sub: "Project preparation, finance documentation and relevant incentives.",
            image: "Placeholder - plant expansion and machinery. Final photography to be supplied by Rapid.",
          },
        },
      },
      labels: { clients: "Clients", faq: "Questions answered", updates: "Updates" },
      approach: { cta: "Discuss your project" },
      services: {
        subsidyGroup: "Named subsidies and incentives",
        otherGroup: "Rapid’s subsidy advisory",
        overview: "Rapid’s subsidy advisory overview",
        allSchemes: "All schemes",
        report: "Subsidy Viability Report",
        note: "A directory listing shows that a scheme is relevant to a type of project. It does not confirm that your project is eligible.",
      },
      cases: {
        investment: "Investment",
        projectInvestment: "Project investment",
        expenditure: "Expenditure",
        approximately: "Approximately",
        location: "Location",
        sector: "Sector",
        role: "Rapid’s role",
        noteInvestment: "Investment figure, not subsidy received.",
        noteExpenditure: "Recorded expenditure, not subsidy received.",
        image: "Placeholder - project photograph. Final photography to be supplied by Rapid.",
      },
      industries: {
        image: "Placeholder - {industry} photograph. Final photography to be supplied by Rapid.",
      },
    },
  },
  hi: {
    homePage: {
      hero: {
        region: "मुख्य विषय",
        previous: "पिछली स्लाइड",
        next: "अगली स्लाइड",
        selectorGroup: "स्लाइड चुनें",
        selector: "स्लाइड {n} / {total}: {theme}",
        slideOf: "स्लाइड {n} / {total}",
        discuss: "अपने प्रोजेक्ट पर बात करें",
        slides: {
          subsidies: {
            theme: "सब्सिडी",
            headline: "अपने अगले निवेश पर मिलने वाली सब्सिडी के अवसर पहचानें।",
            sub: "संबंधित इंसेंटिव और तय आवेदन-कार्य की ज़िम्मेदारी।",
            image: "प्लेसहोल्डर - सब्सिडी आवेदन के दस्तावेज़। अंतिम फ़ोटो रैपिड उपलब्ध कराएगा।",
          },
          newUnit: {
            theme: "नई यूनिट",
            headline: "अपनी नई कारोबारी यूनिट का काम आगे बढ़ाएँ।",
            sub: "मंज़ूरियाँ, रजिस्ट्रेशन और प्रोजेक्ट के लिए ज़रूरी दस्तावेज़।",
            image: "प्लेसहोल्डर - निर्माणाधीन नई यूनिट। अंतिम फ़ोटो रैपिड उपलब्ध कराएगा।",
          },
          expansion: {
            theme: "विस्तार",
            headline: "विस्तार की योजना को फंडिंग के लिए तैयार प्रस्ताव में बदलें।",
            sub: "प्रोजेक्ट की तैयारी, फाइनेंस के दस्तावेज़ और संबंधित इंसेंटिव।",
            image: "प्लेसहोल्डर - प्लांट का विस्तार और मशीनरी। अंतिम फ़ोटो रैपिड उपलब्ध कराएगा।",
          },
        },
      },
      labels: { clients: "हमारे क्लाइंट", faq: "आपके सवाल", updates: "अपडेट" },
      approach: { cta: "अपने प्रोजेक्ट पर बात करें" },
      services: {
        subsidyGroup: "प्रमुख सब्सिडी और इंसेंटिव योजनाएँ",
        otherGroup: "रैपिड की सब्सिडी सलाह",
        overview: "रैपिड की सब्सिडी सलाह का परिचय",
        allSchemes: "सभी योजनाएँ",
        report: "सब्सिडी व्यवहार्यता रिपोर्ट",
        note: "निर्देशिका में किसी योजना का होना केवल यह बताता है कि वह किसी तरह के प्रोजेक्ट से जुड़ी है। इससे आपके प्रोजेक्ट की पात्रता की पुष्टि नहीं होती।",
      },
      cases: {
        investment: "निवेश",
        projectInvestment: "प्रोजेक्ट का निवेश",
        expenditure: "खर्च",
        approximately: "लगभग",
        location: "स्थान",
        sector: "क्षेत्र",
        role: "रैपिड की भूमिका",
        noteInvestment: "यह निवेश का आँकड़ा है, मिली हुई सब्सिडी नहीं।",
        noteExpenditure: "यह दर्ज खर्च है, मिली हुई सब्सिडी नहीं।",
        image: "प्लेसहोल्डर - प्रोजेक्ट का फ़ोटो। अंतिम फ़ोटो रैपिड उपलब्ध कराएगा।",
      },
      industries: {
        image: "प्लेसहोल्डर - {industry} का फ़ोटो। अंतिम फ़ोटो रैपिड उपलब्ध कराएगा।",
      },
    },
  },
};

const lookup = (tree, key) => key.split(".").reduce((node, part) => (node == null ? node : node[part]), tree);
const fill = (text, values) =>
  typeof text === "string" && values ? text.replace(/\{(\w+)\}/g, (m, name) => (name in values ? String(values[name]) : m)) : text;

/** homeText(t, has, locale) -> (key, values?) => string
 * `t` is a next-intl translator, `has` the hasTranslation(t) helper (optional). */
export function homeText(t, has, locale = "en") {
  const fallback = HOME_COPY[locale] ?? HOME_COPY.en;
  return (key, values) => {
    const present = has ? has(key) : t.has?.(key);
    if (present) return t(key, values);
    const text = lookup(fallback, key) ?? lookup(HOME_COPY.en, key);
    return text === undefined ? key : fill(text, values);
  };
}
