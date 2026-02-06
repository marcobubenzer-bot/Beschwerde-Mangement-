export const likertOptions = [
  'Sehr gut / sehr zufrieden',
  'gut / eher zufrieden',
  'Ausreichend / weniger zufrieden',
  'Mangelhaft / unzufrieden',
  'trifft nicht zu / keine Angabe',
] as const;

export const yesNoOptions = ['Ja', 'Nein', 'keine Angabe'] as const;

export const overallGradeOptions = [1, 2, 3, 4, 5, 6] as const;

export const surveyQuestions = [
  { id: 'q1', label: 'Wie war der Ersteindruck von unserem Haus?' },
  { id: 'q2', label: 'Wie zufrieden waren Sie mit dem Aufnahme- und Pfortebereich?' },
  { id: 'q3', label: 'Wie zufrieden waren Sie mit der medizinischen Aufnahme?' },
  { id: 'q4', label: 'Wurden Sie auf der Station freundlich empfangen?' },
  { id: 'q5', label: 'Wie beurteilen Sie den Ablauf auf der Station am Aufnahmetag?' },
  { id: 'q6', label: 'Wie war Ihr Eindruck vom fachlichen Können der Ärztinnen und Ärzte?' },
  { id: 'q7', label: 'Wurden Sie von den Ärztinnen und Ärzten freundlich und respektvoll behandelt?' },
  {
    id: 'q8',
    label: 'Konnten Sie Ihre Fragen und Ängste vertrauensvoll mit den Ärztinnen und Ärzten besprechen?',
  },
  { id: 'q9', label: 'War das, was die Ärztinnen und Ärzte Ihnen sagten, für Sie verständlich?' },
  { id: 'q10', label: 'Wurden Sie durch die Ärztinnen und Ärzte über die Behandlungsmöglichkeiten aufgeklärt?' },
  { id: 'q11', label: 'Wurden Ihnen durch die Ärztinnen und Ärzte Risiken und Komplikationen erklärt?' },
  { id: 'q12', label: 'Wurden Sie von den Pflegekräften freundlich und respektvoll behandelt?' },
  { id: 'q13', label: 'Konnten Sie Ihre Fragen und Ängste vertrauensvoll mit den Pflegekräften besprechen?' },
  { id: 'q14', label: 'War das, was die Pflegekräfte Ihnen sagten, für Sie verständlich?' },
  { id: 'q15', label: 'Wurden Sie durch die Pflegekräfte über die Maßnahmen aufgeklärt?' },
  {
    id: 'q16',
    label:
      'Wurden Sie während der Untersuchungen (EKG, Ultraschall, Spiegelungen, etc.) freundlich und respektvoll behandelt?',
  },
  {
    id: 'q17',
    label: 'Wurden Sie von den Mitarbeitern der Physiotherapie / Krankengymnastik freundlich und respektvoll behandelt?',
  },
  { id: 'q18', label: 'Wurden Sie vom Sozialdienst angemessen beraten?' },
  { id: 'q19', label: 'Wurden Sie von den Mitarbeitern des Sozialdienstes freundlich und respektvoll behandelt?' },
  { id: 'q20', label: 'Wenn sie eine psychoonkologische Beratung erhalten haben, wie zufrieden waren Sie damit?' },
  { id: 'q21', label: 'Wie beurteilen Sie die zur Verfügung gestellten Informationsblätter und Broschüren?' },
  { id: 'q22', label: 'Wie zufrieden sind Sie mit dem Ablauf auf der Station?' },
  {
    id: 'q23',
    label: 'Wie zufrieden sind Sie mit den Wartezeiten während der Behandlung (Untersuchungen, OP, Termine usw.)?',
  },
  { id: 'q24', label: 'Wie beurteilen Sie den Ablauf der Entlassung?' },
  { id: 'q25', label: 'Konnte Ihnen eine angemessene ambulante Weiterbetreuung vermittelt werden?' },
  { id: 'q26', label: 'Wie zufrieden waren Sie mit der Schmerztherapie?' },
  { id: 'q27', label: 'Wie zufrieden waren Sie mit dem Essen?' },
  { id: 'q28', label: 'Wie zufrieden waren Sie mit der Zimmerausstattung?' },
  { id: 'q29', label: 'Wie zufrieden waren Sie mit den Nasszellen?' },
  { id: 'q30', label: 'Wie zufrieden waren Sie mit der Sauberkeit / Hygiene?' },
] as const;

export const admissionOptions = [
  'geplante Aufnahme / Einweisung',
  'Verlegung aus anderem Krankenhaus',
  'Notfall',
  'Kooperationspartner eines Zentrums',
] as const;
