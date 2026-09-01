export const company = {
  name: "Aziki Medical Systems Ltd",
  shortName: "Aziki Medical",
  tagline: "Advancing Healthcare Access Across Africa",
  strapline: "Sales · Repairs · Maintenance · Trade-In",
  founded: 1999,
  mission:
    "To provide cutting-edge medical electronic engineering services required for precision in medical diagnosis and treatment. To ensure sale, installation, maintenance, repairs and rentals of first-rate medical imaging and diagnostic equipment.",
  vision:
    "To develop the software that guarantees seamless information exchange within the medical industry — between practitioners and every health worker — so that service delivery time is reduced, especially in emergencies. To bring the positive impact of information technology and telemedicine to bear on the developing world, first in Nigeria.",
  address: {
    line1: "Plot 110 Cadastral Zone, Gaduwa",
    line2: "Federal Capital Territory, Abuja",
    country: "Nigeria",
  },
  phones: ["+234 803 618 5155", "+234 807 485 1330", "+234 906 665 8175"],
  emails: ["info@azikimedical.com", "azikimedical@gmail.com"],
  website: "www.azikimedical.com",
  hours: "Monday – Friday, 8:00 – 17:00 WAT",
} as const;

export type NavChild = { label: string; href: string; description?: string };
export type NavItem = {
  label: string;
  href: string;
  columns?: { title: string; items: NavChild[] }[];
  feature?: { title: string; body: string; href: string; cta: string };
};

export const productCategories = [
  {
    slug: "ultrasound",
    name: "Ultrasound Systems",
    short: "Ultrasound",
    tagline: "The grandmasters of ultrasound",
    summary:
      "Colour Doppler, 3D/4D, portable and cart-based diagnostic ultrasound for radiology, obstetrics, cardiology and point-of-care.",
    image: "/images/photos/echo-ultrasound.webp",
    imagePosition: "object-center",
    items: [
      "Cart-based colour Doppler systems",
      "Portable and handheld point-of-care units",
      "3D / 4D obstetric and gynaecology imaging",
      "Echocardiography and vascular systems",
      "Transducers, probes and consumables",
    ],
    applications: ["Radiology", "Obstetrics & gynaecology", "Cardiology", "Emergency & POCUS"],
  },
  {
    slug: "radiology-x-ray",
    name: "X-Ray & Radiography",
    short: "X-Ray",
    tagline: "From 300mA units to full digital radiography",
    summary:
      "Fixed and mobile X-ray, fluoroscopy, digital radiography retrofits and complete radiology room build-outs including shielding.",
    image: "/images/photos/cathlab.webp",
    imagePosition: "object-[22%_50%]",
    items: [
      "Fixed high-frequency X-ray systems (up to 125kV)",
      "Mobile and portable X-ray units",
      "Digital radiography (DR) panels and CR retrofits",
      "Fluoroscopy and C-arm systems",
      "Radiation shielding, viewing boxes and accessories",
    ],
    applications: ["General radiography", "Orthopaedics", "Theatre imaging", "Chest & trauma"],
  },
  {
    slug: "ct-and-mri",
    name: "CT & MRI Systems",
    short: "CT & MRI",
    tagline: "High-profile cross-sectional imaging",
    summary:
      "Computed tomography and magnetic resonance imaging units delivered as complete projects — siting survey, civil works, installation, commissioning and service cover.",
    image: "/images/photos/clinician-goggles.webp",
    imagePosition: "object-[50%_32%]",
    items: [
      "Multi-slice computed tomography (CT) units",
      "Permanent and superconducting MRI units",
      "Site preparation, chiller and power design",
      "Injector systems and post-processing workstations",
      "Applications training and annual service contracts",
    ],
    applications: ["Diagnostic imaging centres", "Teaching hospitals", "Oncology", "Neurology"],
  },
  {
    slug: "mammography",
    name: "Mammography",
    short: "Mammography",
    tagline: "Early detection infrastructure",
    summary:
      "Analogue and digital mammography units for screening programmes, breast clinics and oncology centres.",
    image: "/images/photos/clinicians-tablet.webp",
    imagePosition: "object-[62%_28%]",
    items: [
      "Digital and analogue mammography units",
      "Stereotactic biopsy attachments",
      "Breast ultrasound pairing",
      "Screening programme set-up and workflow design",
    ],
    applications: ["Screening programmes", "Breast clinics", "Oncology centres"],
  },
  {
    slug: "laboratory",
    name: "Laboratory & Diagnostics",
    short: "Laboratory",
    tagline: "Complete laboratory fit-outs",
    summary:
      "Haematology and blood analysers, chemistry, microbiology and the full bench of laboratory instruments and reagents.",
    image: "/images/photos/lab-bench.webp",
    imagePosition: "object-[50%_35%]",
    items: [
      "Haematology analysers (3-part and 5-part diff)",
      "Clinical chemistry and immunoassay analysers",
      "Blood gas, electrolyte and coagulation analysers",
      "Microscopes, centrifuges, incubators and autoclaves",
      "Reagents, controls and laboratory consumables",
    ],
    applications: ["Hospital laboratories", "Reference labs", "Blood banks", "Research"],
  },
  {
    slug: "patient-monitoring",
    name: "Patient Monitoring & Life Support",
    short: "Monitoring",
    tagline: "Eyes on every bed",
    summary:
      "Electrocardiographs, multi-parameter monitors, defibrillators, ventilators and central monitoring for critical care areas.",
    image: "/images/photos/monitoring-console.webp",
    imagePosition: "object-center",
    items: [
      "Electrocardiograph (ECG) units, 3 to 12 channel",
      "Multi-parameter bedside monitors and central stations",
      "Defibrillators and resuscitation equipment",
      "Ventilators, anaesthesia machines and infusion pumps",
      "Patient monitoring accessories and sensors",
    ],
    applications: ["ICU & HDU", "Theatre & recovery", "Accident & emergency", "Maternity"],
  },
  {
    slug: "hospital-furniture",
    name: "Medical Furniture & Consumables",
    short: "Furniture",
    tagline: "Everything else a ward needs",
    summary:
      "Hospital beds, theatre tables, lights, trolleys, sterilisation and the consumables that keep a facility running day to day.",
    image: "/images/photos/aziki-lobby.webp",
    imagePosition: "object-[72%_50%]",
    items: [
      "Electric and manual hospital beds",
      "Operating tables, theatre lights and pendants",
      "Examination couches, trolleys and cabinets",
      "Sterilisation and CSSD equipment",
      "Ward and theatre consumables",
    ],
    applications: ["Wards", "Theatres", "Outpatient clinics", "Primary healthcare centres"],
  },
] as const;

export const services = [
  {
    slug: "turnkey-projects",
    name: "Hospital Turnkey Projects",
    summary:
      "Design, build and equip. We take a facility from an empty site or an empty floor to a commissioned, staffed and working hospital.",
    detail: [
      "Needs assessment, equipment planning and budgeting",
      "Architectural and engineering design co-ordination",
      "Civil works, radiation shielding and medical gas installation",
      "Equipment supply, installation and commissioning",
      "Staff training and handover documentation",
    ],
    facilities: [
      "Private hospitals",
      "General hospitals",
      "Primary & secondary healthcare centres",
      "Specialist hospitals",
      "Diagnostic and imaging centres",
      "Nuclear medicine facilities",
      "Cancer and oncology centres",
      "Dialysis centres",
    ],
  },
  {
    slug: "installation-and-commissioning",
    name: "Installation & Commissioning",
    summary:
      "Specialist medical electronics engineers handle siting, power, installation, calibration and acceptance testing on every system we supply.",
    detail: [
      "Pre-installation site survey and readiness report",
      "Power, earthing, cooling and environmental preparation",
      "Installation, calibration and acceptance testing",
      "Quality assurance and safety verification",
      "Commissioning report and warranty activation",
    ],
    facilities: [],
  },
  {
    slug: "maintenance-and-repairs",
    name: "Maintenance & Repairs",
    summary:
      "Preventive maintenance contracts and fault repair for all brands of electro-medical equipment — not only the ones we sell.",
    detail: [
      "Scheduled preventive maintenance visits",
      "Corrective repair of imaging, laboratory and theatre systems",
      "Board-level electronics repair in our workshop",
      "Loan and standby equipment where available",
      "Documented service history for accreditation",
    ],
    facilities: [],
  },
  {
    slug: "spare-parts",
    name: "Spare Parts Supply",
    summary:
      "Genuine and compatible spare parts for electro-medical equipment, sourced through our manufacturer partnerships and held for fast turnaround.",
    detail: [
      "Transducers, probes and cables",
      "X-ray tubes, collimators and generators",
      "Analyser modules, pumps and optics",
      "Boards, power supplies and displays",
      "Consumables and reagent supply",
    ],
    facilities: [],
  },
  {
    slug: "training",
    name: "Training & Manpower Development",
    summary:
      "Hands-on equipment training for clinicians, nurses, radiographers and biomedical engineers across Nigeria — over 400 medical staff trained to date.",
    detail: [
      "Applications training on installed systems",
      "Biomedical engineering and first-line maintenance courses",
      "Refresher and re-certification programmes",
      "On-site training at your facility or at our Abuja centre",
      "Training records and certificates of attendance",
    ],
    facilities: [],
  },
  {
    slug: "consultancy",
    name: "Consultancy & Facility Management",
    summary:
      "Medical facility consultants and managers: equipment audits, procurement planning, workflow design and ongoing facility management.",
    detail: [
      "Equipment inventory audit and condition assessment",
      "Capital equipment planning and procurement advisory",
      "Departmental workflow and layout design",
      "Regulatory and accreditation readiness support",
      "Facility management on a retained basis",
    ],
    facilities: [],
  },
  {
    slug: "trade-in-and-rentals",
    name: "Trade-In & Rentals",
    summary:
      "Trade your ageing systems against new equipment, or rent imaging and diagnostic equipment while yours is under repair or your project is in build.",
    detail: [
      "Valuation and trade-in of existing equipment",
      "Short and long-term equipment rental",
      "Refurbished systems with warranty",
      "Flexible payment and lease structures",
    ],
    facilities: [],
  },
] as const;

export const stats = [
  { value: "2,000+", label: "Medical devices delivered" },
  { value: "150+", label: "Hospitals equipped" },
  { value: "14+", label: "States covered" },
  { value: "400+", label: "Medical staff trained" },
] as const;

export const projects = [
  {
    title: "Shinkafi General Hospital — 300-bed facility",
    scope: "Engineering design and supply of medical equipment for the proposed 300-bed hospital.",
    place: "Zamfara State",
    year: "2008",
    category: "Turnkey",
  },
  {
    title: "Zankli Medical Centre",
    scope: "Supply and installation of a diagnostic ultrasound imaging system.",
    place: "Abuja, FCT",
    year: "",
    category: "Ultrasound",
  },
  {
    title: "Alhassan Medical Centre (now Kings' Care Hospital)",
    scope: "Supply and installation of a diagnostic ultrasound system.",
    place: "Abuja, FCT",
    year: "",
    category: "Ultrasound",
  },
  {
    title: "Yusuf Datsoho Memorial Hospital",
    scope: "Supply and installation of ultrasound systems, in partnership with Rotary Club.",
    place: "Kaduna State",
    year: "",
    category: "Ultrasound",
  },
  {
    title: "Salem Hospital, Kafanchan",
    scope: "Supply and installation of a 630mA / 125kV X-ray system.",
    place: "Kaduna State",
    year: "",
    category: "X-Ray",
  },
  {
    title: "Ahmadu Bello University Teaching Hospital",
    scope: "Repair of sundry medical imaging equipment for the radiology department.",
    place: "Zaria, Kaduna State",
    year: "",
    category: "Service",
  },
  {
    title: "Federal Medical Centres, Makurdi & Azare",
    scope: "Supply and installation of medical imaging systems.",
    place: "Benue & Bauchi States",
    year: "",
    category: "Imaging",
  },
  {
    title: "Jos University Teaching Hospital",
    scope: "Supply of medical imaging systems.",
    place: "Jos, Plateau State",
    year: "",
    category: "Imaging",
  },
  {
    title: "Niger State Government",
    scope: "Supply of medical ambulances to the State Government.",
    place: "Minna, Niger State",
    year: "",
    category: "Fleet",
  },
  {
    title: "Nationwide imaging centre programme",
    scope:
      "Supply and installation of medical imaging systems to over 75% of the major imaging centres, private and public hospitals in Kaduna, Abuja, Lagos, Jos, Adamawa, Kano, Niger, Benue, Nasarawa, Cross River, Akwa Ibom and Rivers States.",
    place: "Nationwide",
    year: "",
    category: "Imaging",
  },
] as const;

export const leadership = [
  { name: "Engr. Francis Adeyemi", role: "Chairman / CEO" },
  { name: "Faith Adeyemi", role: "Head, Management Information Systems" },
  { name: "Architect Hadi Abdulazeez", role: "Head, Facility Design" },
  { name: "Dr. John Ozigi", role: "Medical Consultant" },
  { name: "Dr. Chinedu Michael Chiejine", role: "Consultant, Power Systems & Instrumentation" },
  { name: "Michael Joseph Ogboanor", role: "Head, Instrumentation & Biomedical Systems" },
  { name: "Obinna Arthur Innocent", role: "Service Engineer & Head, Technical Team" },
  { name: "Anthony Yesufu", role: "Chief Accountant" },
  { name: "Prince David Adeyemi", role: "Head, Branding" },
  { name: "Anne Hassan-Bijik", role: "Resource Person, Head of Network Design" },
  { name: "Engr. Kingsley Obioma", role: "Engineering Design & Implementation" },
  { name: "Olagbemiga Michael", role: "Head, Marketing" },
] as const;

export const partners = [
  { name: "Mindray", logo: "/images/partners/mindray.png", note: "Healthcare within reach" },
  { name: "Chison", logo: "/images/partners/chison.png", note: "Value beyond imaging" },
] as const;

export const certifications = [
  {
    image: "/images/certs/mindray-ultrasound-2007.webp",
    title: "Mindray Ultrasound Technical Training",
    body: "Certificate of attendance awarded to Engr. Francis Adeyemi for technical training on the DP and DC series ultrasound systems — Shenzhen Mindray Bio-medical Electronics International Service Department, December 2007.",
  },
  {
    image: "/images/certs/certificate-of-incorporation.webp",
    title: "Certificate of Incorporation",
    body: "Aziki Medical Systems Ltd is incorporated in Nigeria under the Companies and Allied Matters Act, RC 1583937, Corporate Affairs Commission, Abuja.",
  },
] as const;

export const navigation: NavItem[] = [
  {
    label: "Products",
    href: "/products",
    columns: [
      {
        title: "Medical imaging",
        items: [
          { label: "Ultrasound Systems", href: "/products/ultrasound" },
          { label: "X-Ray & Radiography", href: "/products/radiology-x-ray" },
          { label: "CT & MRI Systems", href: "/products/ct-and-mri" },
          { label: "Mammography", href: "/products/mammography" },
        ],
      },
      {
        title: "Diagnostics & care",
        items: [
          { label: "Laboratory & Diagnostics", href: "/products/laboratory" },
          { label: "Patient Monitoring & Life Support", href: "/products/patient-monitoring" },
          { label: "Medical Furniture & Consumables", href: "/products/hospital-furniture" },
          { label: "All products", href: "/products" },
        ],
      },
    ],
    feature: {
      title: "The grandmasters of ultrasound",
      body: "Specialist medical electronics engineers since 1999, with the deepest ultrasound bench in the region.",
      href: "/products/ultrasound",
      cta: "Explore ultrasound",
    },
  },
  {
    label: "Solutions",
    href: "/solutions",
    columns: [
      {
        title: "Build & equip",
        items: [
          { label: "Hospital Turnkey Projects", href: "/solutions/turnkey-projects" },
          { label: "Consultancy & Facility Management", href: "/solutions/consultancy" },
          { label: "Trade-In & Rentals", href: "/solutions/trade-in-and-rentals" },
        ],
      },
      {
        title: "Install & sustain",
        items: [
          { label: "Installation & Commissioning", href: "/solutions/installation-and-commissioning" },
          { label: "Maintenance & Repairs", href: "/solutions/maintenance-and-repairs" },
          { label: "Spare Parts Supply", href: "/solutions/spare-parts" },
          { label: "Training & Manpower Development", href: "/solutions/training" },
        ],
      },
    ],
    feature: {
      title: "More than a distributor",
      body: "We build, we equip, and we stay — end-to-end turnkey delivery backed by in-house engineers.",
      href: "/solutions",
      cta: "See how we work",
    },
  },
  { label: "Support", href: "/support" },
  { label: "Projects", href: "/projects" },
  {
    label: "About",
    href: "/about",
    columns: [
      {
        title: "The company",
        items: [
          { label: "Who we are", href: "/about" },
          { label: "Chairman's message", href: "/about#chairman" },
          { label: "Mission & vision", href: "/about#mission" },
        ],
      },
      {
        title: "People & partners",
        items: [
          { label: "Leadership team", href: "/about#leadership" },
          { label: "Certifications", href: "/about#certifications" },
          { label: "Brands we distribute", href: "/about#partners" },
        ],
      },
    ],
  },
];
