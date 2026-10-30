// Props of the shared FigmaEnquiryCard for the b2d pages, so every page of the
// batch asks the same way (name, mobile, a choice, optional details, consent).
//   tx = b2dText(t)
export function whereSelect(tx) {
  return {
    label: tx("form.where", "Where is your project?"),
    required: true,
    placeholder: tx("form.choose", "Choose one"),
    options: [tx("form.haryana", "Haryana"), tx("form.otherState", "Another state"), tx("form.notSure", "Not sure yet")],
  };
}

export function enquiryCard(tx, { title, hint, source, pageId, pageTitle, serviceName, submit, helper, activityLabel, select, fields = ["district", "activity"] }) {
  return {
    title,
    hint,
    seal: "free",
    sealLabel: tx("form.sealLabel", "Free first review"),
    source,
    pageId,
    pageTitle,
    serviceName: serviceName || submit,
    select: select === undefined ? whereSelect(tx) : select || undefined,
    fields,
    labels: {
      name: tx("form.name", "Your name"),
      phone: tx("form.mobile", "Mobile number"),
      district: tx("form.district", "District"),
      activity: activityLabel || tx("form.project", "Your project"),
      optional: tx("form.optional", "optional"),
      choiceError: tx("form.choiceError", "Please choose one"),
      consent: tx("form.consent", "Rapid may contact me by phone or WhatsApp about this enquiry."),
      consentHelp: tx("form.consentHelp", "Please tick the box so we can contact you."),
      another: tx("form.another", "Send another"),
    },
    submitLabel: submit,
    helper: helper ?? tx("form.helper", "A Rapid expert will call you."),
    whatsapp: true,
    whatsappLabel: tx("form.whatsapp", "Chat with Rapid on WhatsApp"),
  };
}
