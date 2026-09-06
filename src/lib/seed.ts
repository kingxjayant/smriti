export const SEED_DECKS: {
  name: string;
  subject: string;
  exam: string;
  cards: [string, string][];
}[] = [
  {
    name: 'Modern Physics',
    subject: 'Physics',
    exam: 'JEE',
    cards: [
      ['Photoelectric effect: what does increasing frequency change?', 'Maximum kinetic energy of emitted electrons increases. Intensity only changes the NUMBER of electrons.'],
      ['de Broglie wavelength formula', 'λ = h / p = h / (mv). For an electron accelerated through V volts: λ ≈ 12.27/√V Å'],
      ['Bohr radius of hydrogen (n=1)', '0.529 Å (52.9 pm). Radius scales as n²/Z.'],
      ['Energy of nth Bohr orbit in hydrogen', 'Eₙ = −13.6 Z²/n² eV'],
      ['Half-life vs mean life relation', 'τ = T½ / ln2 ≈ 1.44 × T½'],
      ['What is mass defect?', 'Difference between sum of nucleon masses and actual nucleus mass; converted to binding energy via E = Δm·c².'],
    ],
  },
  {
    name: 'Chemical Bonding',
    subject: 'Chemistry',
    exam: 'NEET',
    cards: [
      ['Bond order formula (MOT)', 'BO = (Nb − Na)/2, where Nb = bonding electrons, Na = antibonding electrons.'],
      ['Why is O₂ paramagnetic?', 'It has two unpaired electrons in the degenerate π* antibonding molecular orbitals.'],
      ['Fajans rule — what increases covalent character?', 'Small cation, large anion, high cation charge, and pseudo-noble-gas configuration.'],
      ['Hybridisation of SF₆', 'sp³d² — octahedral geometry, 90° bond angles.'],
      ['Order of bond angle: H₂O, NH₃, CH₄', 'CH₄ (109.5°) > NH₃ (107°) > H₂O (104.5°) — lone pair repulsion compresses the angle.'],
    ],
  },
  {
    name: 'Indian Polity Essentials',
    subject: 'Polity',
    exam: 'UPSC',
    cards: [
      ['Which Article deals with Right to Constitutional Remedies?', 'Article 32 — called the "heart and soul of the Constitution" by Dr. B.R. Ambedkar.'],
      ['How many Fundamental Duties are there?', '11 — originally 10 (42nd Amendment, 1976); the 11th added by the 86th Amendment, 2002.'],
      ['What does the 73rd Amendment establish?', 'Panchayati Raj institutions — three-tier local self-government in rural areas (1992).'],
      ['Who appoints the Chief Election Commissioner?', 'The President of India. Removal requires the same process as a Supreme Court judge.'],
      ['Article 356 relates to?', "President's Rule — failure of constitutional machinery in a State."],
      ['Which Schedule contains anti-defection provisions?', 'The Tenth Schedule, inserted by the 52nd Amendment Act, 1985.'],
    ],
  },
  {
    name: 'Human Physiology',
    subject: 'Biology',
    exam: 'NEET',
    cards: [
      ['Normal human tidal volume', 'Approximately 500 mL per breath.'],
      ['Which hormone lowers blood glucose?', 'Insulin, secreted by beta cells of the islets of Langerhans in the pancreas.'],
      ['Site of maximum water reabsorption in nephron', 'Proximal convoluted tubule (~70–80%), driven by active Na⁺ transport.'],
      ['What is the normal human blood pH range?', '7.35 – 7.45, buffered mainly by the bicarbonate system.'],
      ['Function of surfactant in lungs', 'Reduces alveolar surface tension, preventing alveolar collapse during expiration.'],
    ],
  },
  {
    name: 'Calculus Quick Recall',
    subject: 'Maths',
    exam: 'JEE',
    cards: [
      ['d/dx (tan x)', 'sec²x'],
      ['∫ dx/(a² + x²)', '(1/a)·arctan(x/a) + C'],
      ['Rolle\'s theorem conditions', 'f continuous on [a,b], differentiable on (a,b), and f(a) = f(b) ⟹ ∃c with f′(c)=0.'],
      ['Limit: lim(x→0) (sin x)/x', '1'],
      ['L\'Hôpital applies when?', "Limit is of indeterminate form 0/0 or ∞/∞ and f′/g′ limit exists."],
    ],
  },
];
