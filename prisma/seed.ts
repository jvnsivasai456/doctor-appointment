import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MediBook AI Database Seed...");

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Demo Users
  console.log("👤 Creating demo users...");
  const demoPatient = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "patient@medibook.ai",
      passwordHash: defaultPasswordHash,
      role: "PATIENT",
      dpdpConsent: true,
      consentTimestamp: new Date(),
    },
  });

  const demoDoctorUser = await prisma.user.create({
    data: {
      name: "Prof. Dr. P. Manokar",
      email: "doctor@medibook.ai",
      passwordHash: defaultPasswordHash,
      role: "DOCTOR",
      dpdpConsent: true,
      consentTimestamp: new Date(),
    },
  });

  const demoAdmin = await prisma.user.create({
    data: {
      name: "Admin Karthik Raman",
      email: "admin@medibook.ai",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      dpdpConsent: true,
      consentTimestamp: new Date(),
    },
  });

  // 2. Create 6 Specialties
  console.log("🏥 Creating specialties...");
  const specialtiesData = [
    {
      name: "General Medicine",
      nameTa: "பொது மருத்துவம்",
      description: "Comprehensive primary healthcare, acute infections, fevers, lifestyle disease management, and preventive wellness.",
      descriptionTa: "முழுமையான பொது சுகாதார பராமரிப்பு, காய்ச்சல், தொற்று மற்றும் வாழ்க்கைமுறை நோய்கள்.",
      iconName: "Stethoscope",
    },
    {
      name: "Cardiology",
      nameTa: "இதயவியல்",
      description: "Heart conditions, hypertension, chest discomfort evaluations, arrhythmias, and cardiovascular health.",
      descriptionTa: "இதய நோய்கள், ரத்த அழுத்தம், நெஞ்சு வலி மற்றும் இருதய ஆரோக்கிய பரிசோதனைகள்.",
      iconName: "HeartPulse",
    },
    {
      name: "Dermatology",
      nameTa: "தோல் மருத்துவம்",
      description: "Skin rashes, acne, eczema, allergies, hair and scalp issues, and cosmetic dermatology.",
      descriptionTa: "தோல் தடிப்புகள், முகப்பரு, ஒவ்வாமை, முடி மற்றும் உச்சந்தலை பராமரிப்பு.",
      iconName: "Sparkles",
    },
    {
      name: "Orthopedics",
      nameTa: "எலும்பியல்",
      description: "Joint pain, sports injuries, fractures, back and neck pain, spine and arthritis care.",
      descriptionTa: "மூட்டு வலி, விளையாட்டு காயங்கள், எலும்பு முறிவுகள், முதுகு மற்றும் கழுத்து வலி.",
      iconName: "Bone",
    },
    {
      name: "Pediatrics",
      nameTa: "குழந்தை மருத்துவம்",
      description: "Infant and child wellness, childhood viral infections, developmental checks, and vaccinations.",
      descriptionTa: "குழந்தைகள் ஆரோக்கியம், பருவ கால காய்ச்சல்கள் மற்றும் தடுப்பூசி பராமரிப்பு.",
      iconName: "Baby",
    },
    {
      name: "Neurology",
      nameTa: "நரம்பியல்",
      description: "Headaches, migraines, dizziness, nerve disorders, neuropathy, seizures, and cognitive health.",
      descriptionTa: "தலைவலி, ஒற்றைத் தலைவலி, மயக்கம், நரம்பு கோளாறுகள் மற்றும் நரம்பியல் பரிசோதனை.",
      iconName: "Brain",
    },
    {
      name: "Gynecology",
      nameTa: "மகளிர் நலம் / பெண்ணியல்",
      description: "Women's reproductive health, prenatal consultations, maternity care, PCOS/PCOD management, and preventive wellness.",
      descriptionTa: "பெண்கள் நலன், கர்ப்பகால பராமரிப்பு, பிசிஓடி மற்றும் மகளிர் ஆரோக்கிய பரிசோதனைகள்.",
      iconName: "Sparkles",
    },
  ];

  const createdSpecialties: Record<string, string> = {};
  for (const s of specialtiesData) {
    const created = await prisma.specialty.create({ data: s });
    createdSpecialties[s.name] = created.id;
  }

  // 3. Create 12 Doctors (2 per specialty)
  console.log("👨‍⚕️ Creating 12 Doctors with profiles...");
  const doctorsData = [
    // Cardiology (Doctor 1 is demoDoctorUser - Top 6 featured)
    {
      user: demoDoctorUser,
      specialtyName: "Cardiology",
      qualification: "MBBS, MD (Gen Med), DM (Cardiology), FESC, FSCAI",
      experienceYears: 22,
      consultationFee: 900,
      rating: 4.97,
      reviewCount: 480,
      bio: "Senior Interventional Cardiologist & Clinical Lead at Kauvery Hospital Vadapalani, Chennai. 22+ years of expertise in complex coronary angioplasty, heart failure management, and preventive cardiovascular wellness.",
      bioTa: "காவேரி மருத்துவமனை, வடபழனி, சென்னை. ஆஞ்சியோபிளாஸ்டி மற்றும் இதய பாதுகாப்பு சிகிச்சையில் 22 ஆண்டுகள் அனுபவம் கொண்ட மூத்த இதயவியல் நிபுணர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-manokar.jpg",
      hospital: "Kauvery Hospital, Vadapalani, Chennai",
      cityLocation: "Jawaharlal Nehru Salai, Vadapalani, Chennai",
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Ranganathan Jothi",
          email: "ranganathan.cardio@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Cardiology",
      qualification: "MBBS, MD, DNB (Cardiology), Senior Consultant",
      experienceYears: 18,
      consultationFee: 850,
      rating: 4.88,
      reviewCount: 310,
      bio: "Senior Consultant in Cardiovascular Care & Vascular Medicine at Kauvery Hospital Alwarpet, Chennai. Specialist in hypertension management, cardiac risk stratification, and preventive wellness.",
      bioTa: "காவேரி மருத்துவமனை, ஆழ்வார்பேட்டை, சென்னை. உயர் ரத்த அழுத்தம் மற்றும் இதய ஆரோக்கிய பரிசோதனைகளில் சிறப்பு பெற்ற ஆலோசகர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-ranganathan-jothi.jpg",
      hospital: "Kauvery Hospital, Alwarpet, Chennai",
      cityLocation: "TTK Road, Alwarpet, Chennai",
    },

    // General Medicine (Doctor 3 is Top 6 featured)
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. S. Sivaram Kannan",
          email: "sivaram.genmed@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "General Medicine",
      qualification: "MBBS, MD (Internal Medicine), Chief Physician",
      experienceYears: 20,
      consultationFee: 600,
      rating: 4.98,
      reviewCount: 560,
      bio: "Clinical Lead & Chief Physician at Kauvery Hospital Alwarpet, Chennai. Specialist in adult internal medicine, acute fevers, chronic diabetes management, and geriatric care.",
      bioTa: "காவேரி மருத்துவமனை, ஆழ்வார்பேட்டை, சென்னை. தலைமை மருத்துவர், நீரிழிவு நோய், காய்ச்சல் மற்றும் பொது மருத்துவத்தில் 20 ஆண்டுகள் அனுபவம் கொண்டவர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-sivaram-kannan.jpg",
      hospital: "Kauvery Hospital, Alwarpet, Chennai",
      cityLocation: "TTK Road, Alwarpet, Chennai",
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. M. D. Selvam",
          email: "selvam.genmed@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "General Medicine",
      qualification: "MBBS, MD (General Medicine)",
      experienceYears: 14,
      consultationFee: 500,
      rating: 4.89,
      reviewCount: 290,
      bio: "Senior Consultant Physician at Kauvery Hospital Vadapalani, focused on primary healthcare, infectious fever treatment, hypertension control, and lifestyle wellness.",
      bioTa: "காவேரி மருத்துவமனை, வடபழனி, சென்னை. பருவகால காய்ச்சல்கள் மற்றும் ரத்த அழுத்த சிகிச்சைகளுக்கான மூத்த பொது மருத்துவர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-md-selvam.jpg",
      hospital: "Kauvery Hospital, Vadapalani, Chennai",
      cityLocation: "Jawaharlal Nehru Salai, Vadapalani, Chennai",
    },

    // Dermatology (Doctor 5 is Top 6 featured)
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. A. S. Niraaimathi",
          email: "niraaimathi.derma@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Dermatology",
      qualification: "MBBS, MD (DVL), DNB (Dermatology)",
      experienceYears: 12,
      consultationFee: 700,
      rating: 4.95,
      reviewCount: 430,
      bio: "Consultant Dermatologist & Cosmetologist at Kauvery Hospital Alwarpet, Chennai. Specializing in clinical dermatology, resistant acne, eczema, psoriasis, and pediatric skin care.",
      bioTa: "காவேரி மருத்துவமனை, ஆழ்வார்பேட்டை, சென்னை. தோல் ஒவ்வாமை, கடுமையான முகப்பரு மற்றும் தோல் நோய் சிகிச்சைகளில் புகழ்பெற்ற ஆலோசகர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-niraaimathi.jpg",
      hospital: "Kauvery Hospital, Alwarpet, Chennai",
      cityLocation: "TTK Road, Alwarpet, Chennai",
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Ashiq Mohamed",
          email: "ashiq.derma@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Dermatology",
      qualification: "MBBS, MD, Fellowship in Aesthetic Medicine (Germany)",
      experienceYears: 9,
      consultationFee: 650,
      rating: 4.86,
      reviewCount: 215,
      bio: "Aesthetic Dermatologist at Kauvery Hospital Vadapalani, specializing in laser treatments, hair restoration, allergic dermatitis, and scar therapies.",
      bioTa: "காவேரி மருத்துவமனை, வடபழனி, சென்னை. லேசர் சிகிச்சை மற்றும் முடி உதிர்வு தடுப்பு சிகிச்சைகளில் அனுபவம் வாய்ந்த தோல் மருத்துவர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-ashiq-mohamed.jpg",
      hospital: "Kauvery Hospital, Vadapalani, Chennai",
      cityLocation: "Jawaharlal Nehru Salai, Vadapalani, Chennai",
    },

    // Orthopedics (Doctor 7 is Top 6 featured)
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Aravindan Selvaraj",
          email: "aravindan.ortho@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Orthopedics",
      qualification: "MBBS, MS (Ortho), FRCS (Orth), FRCS (Edin)",
      experienceYears: 24,
      consultationFee: 1000,
      rating: 4.96,
      reviewCount: 620,
      bio: "Chief Orthopedic Surgeon & Joint Replacement Specialist at Kauvery Hospital Alwarpet, Chennai. Renowned surgical pioneer with over 24 years experience in knee, hip, and complex joint care.",
      bioTa: "காவேரி மருத்துவமனை, ஆழ்வார்பேட்டை, சென்னை. மூட்டு மாற்று அறுவை சிகிச்சை மற்றும் எலும்பியல் துறையில் 24 ஆண்டுகள் சர்வதேச அனுபவம் கொண்ட தலைமை மருத்துவர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-aravindan-selvaraj.jpg",
      hospital: "Kauvery Hospital, Alwarpet, Chennai",
      cityLocation: "TTK Road, Alwarpet, Chennai",
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Ravi Sankar Kirubanandan",
          email: "ravisankar.ortho@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Orthopedics",
      qualification: "MBBS, MS (Orthopedics), DNB",
      experienceYears: 16,
      consultationFee: 750,
      rating: 4.87,
      reviewCount: 310,
      bio: "Senior Consultant Orthopedic Surgeon at Kauvery Hospital Vadapalani, Chennai. Expertise in sports injury management, knee arthroscopy, fracture care, and arthritis therapy.",
      bioTa: "காவேரி மருத்துவமனை, வடபழனி, சென்னை. விளையாட்டு காயங்கள் மற்றும் மூட்டு வலி சிகிச்சைகளில் சிறப்பு பெற்ற எலும்பியல் நிபுணர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-ravi-sankar.jpg",
      hospital: "Kauvery Hospital, Vadapalani, Chennai",
      cityLocation: "Jawaharlal Nehru Salai, Vadapalani, Chennai",
    },

    // Pediatrics (Doctor 9 is Top 6 featured)
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Pushkala",
          email: "pushkala.pedia@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Pediatrics",
      qualification: "MBBS, MD (Paediatrics), PGDID, PGPN",
      experienceYears: 18,
      consultationFee: 650,
      rating: 4.94,
      reviewCount: 510,
      bio: "Senior Consultant Pediatrician at Kauvery Hospital Alwarpet, Chennai. Compassionate specialist in childhood viral infections, newborn health, growth tracking, and pediatric asthma.",
      bioTa: "காவேரி மருத்துவமனை, ஆழ்வார்பேட்டை, சென்னை. குழந்தைகள் வளர்ச்சி, பருவ கால நோய்கள் மற்றும் தடுப்பூசி திட்டங்களில் 18 ஆண்டுகள் அனுபவம் கொண்ட மருத்துவர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-pushkala.jpg",
      hospital: "Kauvery Hospital, Alwarpet, Chennai",
      cityLocation: "TTK Road, Alwarpet, Chennai",
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Karthik Thiyagarajan",
          email: "karthik.pedia@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Pediatrics",
      qualification: "MBBS, MD (Pediatrics), DNB (Neonatology)",
      experienceYears: 12,
      consultationFee: 600,
      rating: 4.85,
      reviewCount: 270,
      bio: "Consultant Pediatrician & Neonatologist at Kauvery Hospital Vadapalani, Chennai. Expert in neonatal care, infant nutrition, immunization schedules, and acute childhood illnesses.",
      bioTa: "காவேரி மருத்துவமனை, வடபழனி, சென்னை. பச்சிளம் குழந்தைகள் பராமரிப்பு மற்றும் குழந்தைகள் காய்ச்சல் சிகிச்சைகளுக்கான சிறந்த நிபுணர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-karthik-thiyagarajan.jpg",
      hospital: "Kauvery Hospital, Vadapalani, Chennai",
      cityLocation: "Jawaharlal Nehru Salai, Vadapalani, Chennai",
    },

    // Neurology (Doctor 11 is Top 6 featured)
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Sivarajan Thandeeswaran",
          email: "sivarajan.neuro@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Neurology",
      qualification: "MBBS, MRCP (UK), CCT in Stroke Medicine (UK)",
      experienceYears: 19,
      consultationFee: 950,
      rating: 4.93,
      reviewCount: 440,
      bio: "Senior Consultant in Neurology & Stroke Medicine at Kauvery Hospital Alwarpet, Chennai. Specializing in acute stroke intervention, chronic migraines, neuropathy, and movement disorders.",
      bioTa: "காவேரி மருத்துவமனை, ஆழ்வார்பேட்டை, சென்னை. பக்கவாத சிகிச்சை, கடுமையான ஒற்றைத் தலைவலி மற்றும் நரம்பியல் கோளாறுகளில் 19 ஆண்டுகள் அனுபவம் கொண்ட மூத்த நிபுணர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-sivarajan.jpg",
      hospital: "Kauvery Hospital, Alwarpet, Chennai",
      cityLocation: "TTK Road, Alwarpet, Chennai",
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. G. Balamurali",
          email: "balamurali.neuro@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Neurology",
      qualification: "MBBS, MRCS (Edin), FRCS (Neuro.Surg)",
      experienceYears: 20,
      consultationFee: 1100,
      rating: 4.84,
      reviewCount: 380,
      bio: "Senior Consultant Spine & Neurosurgeon at Kauvery Hospital Vadapalani, Chennai. Internationally trained expert in minimally invasive spine surgery, sciatica, and nerve disorders.",
      bioTa: "காவேரி மருத்துவமனை, வடபழனி, சென்னை. தண்டுவடம் மற்றும் நரம்பியல் அறுவை சிகிச்சையில் சர்வதேச பயிற்சி பெற்ற முன்னணி மூத்த மருத்துவர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-balamurali.jpg",
      hospital: "Kauvery Hospital, Vadapalani, Chennai",
      cityLocation: "Jawaharlal Nehru Salai, Vadapalani, Chennai",
      doctorIdCode: null,
      fullAddress: "No. 23/1, Arcot Road, Vadapalani, Chennai, Tamil Nadu 600026",
      landmark: "Near Vadapalani Metro Station & Forum Vijaya Mall",
      pincode: "600026",
      lat: 13.0514,
      lng: 80.2119,
    },

    // Sholinganallur & OMR Specialists
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Arvind Menon",
          email: "arvind.menon@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "General Medicine",
      qualification: "MBBS, MD (General Medicine)",
      experienceYears: 12,
      consultationFee: 600,
      rating: 4.7,
      reviewCount: 310,
      bio: "Consultant General Physician at Gleneagles Health City, Sholinganallur. 12+ years of clinical excellence in acute fevers, respiratory infections, hypertension, diabetes care, and preventive health checks.",
      bioTa: "க்ளெனேகில்ஸ் ஹெல்த் சிட்டி, சோழிங்கநல்லூர், சென்னை. காய்ச்சல், நீரிழிவு நோய் மற்றும் குடும்ப மருத்துவத்தில் 12 ஆண்டுகள் அனுபவம் கொண்ட பொது மருத்துவர்.",
      languages: "English, தமிழ், Malayalam",
      avatarUrl: "/doctors/dr-arvind-menon.png",
      hospital: "Gleneagles Health City",
      cityLocation: "Sholinganallur (Perumbakkam), Chennai",
      doctorIdCode: "DR-OMR-201",
      fullAddress: "439, Cheran Nagar, Perumbakkam, Sholinganallur, Chennai, Tamil Nadu 600100",
      landmark: "Near Sholinganallur Signal / Perumbakkam Junction",
      pincode: "600100",
      lat: 12.9056,
      lng: 80.2081,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Divya Venkat",
          email: "divya.venkat@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Dermatology",
      qualification: "MBBS, MD (DVL), Aesthetic & Clinical Dermatologist",
      experienceYears: 9,
      consultationFee: 700,
      rating: 4.8,
      reviewCount: 285,
      bio: "Specialist Dermatologist at Aesthetiq Clinic, Sholinganallur. Expert in stubborn acne treatments, clinical skin allergies, chemical peels, pigmentation, and hair restoration.",
      bioTa: "எஸ்தெடிக் கிளினிக், எம்.ஜி.ஆர் சாலை, சோழிங்கநல்லூர், சென்னை. தோல் ஒவ்வாமை, முகப்பரு மற்றும் முடி பாதுகாப்பு சிகிச்சைகளில் அனுபவம் வாய்ந்த தோல் மருத்துவர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-divya-venkat.jpg",
      hospital: "Aesthetiq Clinic",
      cityLocation: "Sholinganallur, Chennai",
      doctorIdCode: "DR-OMR-202",
      fullAddress: "No.16, MGR Road, near OMR Road, Sholinganallur, Chennai, Tamil Nadu 600119",
      landmark: "Near MGR Road & OMR Intersection",
      pincode: "600119",
      lat: 12.9015,
      lng: 80.2270,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Rajesh Kannan",
          email: "rajesh.kannan@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Orthopedics",
      qualification: "MBBS, MS (Orthopedics), Fellow in Joint Arthroscopy",
      experienceYears: 15,
      consultationFee: 900,
      rating: 4.9,
      reviewCount: 420,
      bio: "Senior Consultant Orthopedic Surgeon at Valarcare Hospital, Sholinganallur. 15+ years expertise in joint preservation, knee and shoulder pain, sports trauma, and spine wellness.",
      bioTa: "வளர்கேர் மருத்துவமனை, சோழிங்கநல்லூர், சென்னை. மூட்டு வலி, எலும்பு முறிவுகள் மற்றும் விளையாட்டு காயங்களுக்கான 15 ஆண்டுகள் அனுபவம் கொண்ட அறுவை சிகிச்சை நிபுணர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-rajesh-kanna.png",
      hospital: "Valarcare Hospital",
      cityLocation: "Sholinganallur, Chennai",
      doctorIdCode: "DR-OMR-203",
      fullAddress: "134, Village High Road, Sholinganallur, Chennai, Tamil Nadu 600119",
      landmark: "Opposite to Sholinganallur Panchayat Office",
      pincode: "600119",
      lat: 12.9030,
      lng: 80.2255,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Kavitha Balakrishnan",
          email: "kavitha.balakrishnan@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Gynecology",
      qualification: "MBBS, DGO, DNB (Obstetrics & Gynecology)",
      experienceYears: 11,
      consultationFee: 800,
      rating: 4.6,
      reviewCount: 260,
      bio: "Consultant Obstetrician & Gynecologist at Iswarya Hospital OMR. 11+ years guiding women through prenatal care, normal deliveries, PCOS/PCOD therapy, and preventive women's wellness.",
      bioTa: "ஐஸ்வர்யா மருத்துவமனை, ராஜீவ் காந்தி சாலை (OMR), சென்னை. கர்ப்பகால பராமரிப்பு, பிசிஓடி மற்றும் மகளிர் ஆரோக்கிய சிகிச்சைகளில் 11 ஆண்டுகள் அனுபவம் வாய்ந்த மருத்துவர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-kavitha-balakrishnan.jpg",
      hospital: "Iswarya Hospital OMR",
      cityLocation: "Sholinganallur (Kottivakkam boundary), Chennai",
      doctorIdCode: "DR-OMR-204",
      fullAddress: "110, Rajiv Gandhi Salai (OMR), Kottivakkam, Chennai, Tamil Nadu 600041",
      landmark: "Directly on the Main OMR Highway",
      pincode: "600041",
      lat: 12.9100,
      lng: 80.2285,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. R. Vinoth Kumar",
          email: "vinoth.gem@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "General Medicine",
      qualification: "MBBS, MD (Gen Med), DM (Gastroenterology), Fellowship in Advanced Endoscopy",
      experienceYears: 16,
      consultationFee: 850,
      rating: 4.9,
      reviewCount: 340,
      bio: "Chief & Senior Consultant at GEM Hospital, Perungudi, OMR. 16+ years of clinical excellence in digestive disorders, acid reflux, liver wellness, and advanced gastrointestinal evaluations.",
      bioTa: "ஜெம் மருத்துவமனை, பெருங்குடி, ஓ.எம்.ஆர், சென்னை. செரிமான கோளாறுகள், கல்லீரல் பாதுகாப்பு மற்றும் இரைப்பை குடல் சிகிச்சைகளில் 16 ஆண்டுகள் அனுபவம் வாய்ந்த தலைமை ஆலோசகர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-vinoth-kumar-gem.png",
      hospital: "GEM Hospital, Perungudi, OMR",
      cityLocation: "Perungudi (OMR), Chennai",
      doctorIdCode: "DR-OMR-205",
      fullAddress: "No. 227, MGR Salai, OMR, Perungudi, Chennai, Tamil Nadu 600096",
      landmark: "Behind RMZ Millenia / Near Perungudi Toll Gate",
      pincode: "600096",
      lat: 12.9644,
      lng: 80.2442,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Shruti K.",
          email: "shruti.cradle@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Pediatrics",
      qualification: "MBBS, MD (Pediatrics), NICU & PICU Fellowship",
      experienceYears: 15,
      consultationFee: 750,
      rating: 4.9,
      reviewCount: 410,
      bio: "Senior Consultant Pediatrician & Neonatologist at Apollo Cradle & Children's Hospital Karapakkam, OMR. Expert in infant vaccinations, childhood nutrition, respiratory viral illness, and newborn growth milestones.",
      bioTa: "அப்பல்லோ கிரேடில் குழந்தைகள் மருத்துவமனை, காரப்பாக்கம், ஓ.எம்.ஆர், சென்னை. பச்சிளம் குழந்தைகள் பராமரிப்பு, தடுப்பூசிகள் மற்றும் குழந்தைகள் ஊட்டச்சத்து சிகிச்சைகளில் 15 ஆண்டுகள் அனுபவம் கொண்ட மூத்த மருத்துவர்.",
      languages: "English, தமிழ், Hindi",
      avatarUrl: "/doctors/dr-shruti-k.webp",
      hospital: "Apollo Cradle & Children's Hospital, Karapakkam, OMR",
      cityLocation: "Karapakkam (OMR), Chennai",
      doctorIdCode: "DR-OMR-206",
      fullAddress: "5/639, Rajiv Gandhi Salai (OMR), Karapakkam, Chennai, Tamil Nadu 600097",
      landmark: "Opposite to TCS Karapakkam Campus",
      pincode: "600097",
      lat: 12.9182,
      lng: 80.2291,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Dhivyambigai Rajendran",
          email: "dhivyambigai.cradle@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Gynecology",
      qualification: "MBBS, MS (Obstetrics & Gynecology), FMAS, Fellowship in ART & Reproductive Medicine",
      experienceYears: 14,
      consultationFee: 800,
      rating: 4.8,
      reviewCount: 380,
      bio: "Senior Consultant Obstetrician & Gynecologist at Apollo Cradle Karapakkam, OMR. Specializing in high-risk pregnancy, natural delivery, PCOS management, and advanced fertility wellness.",
      bioTa: "அப்பல்லோ கிரேடில் மருத்துவமனை, காரப்பாக்கம், ஓ.எம்.ஆர், சென்னை. கர்ப்பகால பராமரிப்பு, சுகப்பிரசவம் மற்றும் பிசிஓஎஸ் சிகிச்சைகளில் 14 ஆண்டுகள் அனுபவம் கொண்ட முன்னணி மகளிர் நல மருத்துவர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-dhivyambigai.webp",
      hospital: "Apollo Cradle & Children's Hospital, Karapakkam, OMR",
      cityLocation: "Karapakkam (OMR), Chennai",
      doctorIdCode: "DR-OMR-207",
      fullAddress: "5/639, Rajiv Gandhi Salai (OMR), Karapakkam, Chennai, Tamil Nadu 600097",
      landmark: "Near Karapakkam Bus Stop & TCS Campus",
      pincode: "600097",
      lat: 12.9182,
      lng: 80.2291,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. G. Ashok",
          email: "ashok.cardio@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Cardiology",
      qualification: "MBBS, MD (General Medicine), DM (Cardiology), FACC",
      experienceYears: 18,
      consultationFee: 850,
      rating: 4.85,
      reviewCount: 460,
      bio: "Senior Interventional Cardiologist at Chettinad Super Speciality Hospital, Kelambakkam, OMR. 18+ years of expertise in preventive cardiology, coronary angiography, hypertension control, and cardiac wellness.",
      bioTa: "செட்டிநாடு சூப்பர் ஸ்பெஷாலிட்டி மருத்துவமனை, கேளம்பாக்கம், ஓ.எம்.ஆர், சென்னை. உயர் ரத்த அழுத்தம், இதய பாதுகாப்பு மற்றும் ஆஞ்சியோகிராம் சிகிச்சைகளில் 18 ஆண்டுகள் அனுபவம் கொண்ட மூத்த இதயவியல் நிபுணர்.",
      languages: "English, தமிழ், Telugu",
      avatarUrl: "/doctors/dr-ashok-chettinad.png",
      hospital: "Chettinad Super Speciality Hospital, Kelambakkam, OMR",
      cityLocation: "Kelambakkam (OMR), Chennai",
      doctorIdCode: "DR-OMR-208",
      fullAddress: "Rajiv Gandhi Salai (OMR), Kelambakkam, Chennai, Tamil Nadu 603103",
      landmark: "Chettinad Health City Campus, Kelambakkam Junction",
      pincode: "603103",
      lat: 12.7915,
      lng: 80.2178,
    },
    {
      user: await prisma.user.create({
        data: {
          name: "Dr. Balaraman R.",
          email: "balaraman.ortho@medibook.ai",
          passwordHash: defaultPasswordHash,
          role: "DOCTOR",
          dpdpConsent: true,
          consentTimestamp: new Date(),
        },
      }),
      specialtyName: "Orthopedics",
      qualification: "MBBS, MS (Orthopedics), Fellowship in Joint Replacement & Trauma",
      experienceYears: 13,
      consultationFee: 750,
      rating: 4.88,
      reviewCount: 390,
      bio: "Senior Consultant Orthopedic Surgeon at Dr. Kamakshi Memorial Hospital, Pallikaranai / OMR Radial Road. 13+ years specializing in knee & hip arthritis, fracture trauma, sciatica, and arthroscopic joint care.",
      bioTa: "டாக்டர் காமாக்ஷி மெமோரியல் மருத்துவமனை, 200 அடி ரேடியல் ரோடு, பள்ளிக்கரணை / ஓ.எம்.ஆர், சென்னை. மூட்டு வலி, எலும்பு முறிவுகள் மற்றும் முதுகு தண்டுவட சிகிச்சைகளில் 13 ஆண்டுகள் அனுபவம் கொண்ட மூத்த எலும்பியல் மருத்துவர்.",
      languages: "English, தமிழ்",
      avatarUrl: "/doctors/dr-balaraman-kmh.jpg",
      hospital: "Dr. Kamakshi Memorial Hospital",
      cityLocation: "Pallikaranai (OMR Radial Road), Chennai",
      doctorIdCode: "DR-OMR-209",
      fullAddress: "1, 200 Feet Radial Road, Pallikaranai, Chennai, Tamil Nadu 600100",
      landmark: "Opposite to Kamakshi Hospital Bus Stop / Near Velachery-OMR Radial Road Junction",
      pincode: "600100",
      lat: 12.9372,
      lng: 80.1983,
    },
  ];

  const createdDoctorProfiles = [];
  for (const doc of doctorsData) {
    const profile = await prisma.doctorProfile.create({
      data: {
        userId: doc.user.id,
        specialtyId: createdSpecialties[doc.specialtyName],
        qualification: doc.qualification,
        experienceYears: doc.experienceYears,
        consultationFee: doc.consultationFee,
        rating: doc.rating,
        reviewCount: doc.reviewCount,
        bio: doc.bio,
        bioTa: doc.bioTa,
        languages: doc.languages,
        avatarUrl: doc.avatarUrl,
        hospital: doc.hospital,
        cityLocation: doc.cityLocation,
        doctorIdCode: (doc as any).doctorIdCode ?? null,
        fullAddress: (doc as any).fullAddress ?? null,
        landmark: (doc as any).landmark ?? null,
        pincode: (doc as any).pincode ?? null,
        lat: (doc as any).lat ?? null,
        lng: (doc as any).lng ?? null,
      },
    });
    createdDoctorProfiles.push(profile);
  }

  // 4. Generate 2 Weeks of Slots for Each Doctor
  console.log("📅 Generating 2 weeks of appointment slots...");
  const slotTimes = [
    // Morning (9:00 AM - 11:30 AM)
    { hour: 9, minute: 0 },
    { hour: 9, minute: 30 },
    { hour: 10, minute: 0 },
    { hour: 10, minute: 30 },
    { hour: 11, minute: 0 },
    { hour: 11, minute: 30 },
    // Afternoon (2:00 PM - 3:30 PM)
    { hour: 14, minute: 0 },
    { hour: 14, minute: 30 },
    { hour: 15, minute: 0 },
    { hour: 15, minute: 30 },
    // Evening (5:00 PM - 6:30 PM)
    { hour: 17, minute: 0 },
    { hour: 17, minute: 30 },
    { hour: 18, minute: 0 },
    { hour: 18, minute: 30 },
  ];

  const now = new Date();
  let totalSlotsCount = 0;

  for (const doctor of createdDoctorProfiles) {
    for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + dayOffset);

      // Skip Sunday (day 0) for realism
      if (targetDate.getDay() === 0) continue;

      for (const slotTime of slotTimes) {
        const startTime = new Date(targetDate);
        startTime.setHours(slotTime.hour, slotTime.minute, 0, 0);

        // Don't generate past slots for today
        if (startTime <= now) continue;

        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 30);

        await prisma.slot.create({
          data: {
            doctorId: doctor.id,
            startTime,
            endTime,
            isBooked: false,
            isLocked: false,
          },
        });
        totalSlotsCount++;
      }
    }
  }

  // 5. Seed a Sample Upcoming Appointment for the Demo Patient with Dr. Ananya
  console.log("📝 Seeding sample appointment for demo patient...");
  const ananyaProfile = createdDoctorProfiles[0];
  const sampleSlot = await prisma.slot.findFirst({
    where: {
      doctorId: ananyaProfile.id,
      isBooked: false,
    },
    orderBy: { startTime: "asc" },
  });

  if (sampleSlot) {
    await prisma.slot.update({
      where: { id: sampleSlot.id },
      data: { isBooked: true },
    });

    await prisma.appointment.create({
      data: {
        patientId: demoPatient.id,
        doctorId: ananyaProfile.id,
        slotId: sampleSlot.id,
        appointmentDate: sampleSlot.startTime,
        status: "CONFIRMED",
        urgency: "AMBER",
        encryptedSymptomNotes: "Mild palpitations after climbing stairs, occasional mild chest tightness.",
        triageSpecialty: "Cardiology",
        triageReason: "Palpitations and exertion-related mild tightness flagged for specialist review.",
        patientPhone: "+91 98765 43210",
      },
    });

    // Add initial reminder notification
    await prisma.notification.create({
      data: {
        userId: demoPatient.id,
        title: "Appointment Confirmed",
        message: `Your appointment with Dr. Ananya Sundaram is confirmed for ${sampleSlot.startTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${sampleSlot.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
        type: "APPOINTMENT_CONFIRMED",
      },
    });
  }

  console.log(`✅ Seed finished successfully!`);
  console.log(`   - ${specialtiesData.length} Specialties created`);
  console.log(`   - ${doctorsData.length} Doctors registered`);
  console.log(`   - ${totalSlotsCount} Appointment slots scheduled over 14 days`);
  console.log(`   - 3 Demo accounts created:`);
  console.log(`     * Patient: patient@medibook.ai (Password123!)`);
  console.log(`     * Doctor:  doctor@medibook.ai (Password123!)`);
  console.log(`     * Admin:   admin@medibook.ai (Password123!)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
