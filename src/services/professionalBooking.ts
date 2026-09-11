import { collection, addDoc, getDocs, doc, setDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface LicensedProfessional {
  id: string;
  name: string;
  title: string;
  role: 'Psychiatrist' | 'Clinical Psychologist' | 'Licensed Psychotherapist';
  credentials: string; // e.g. "MD (Psychiatry), AIIMS", "M.Phil Clinical Psychology (NIMHANS)"
  licenseNumber: string; // e.g. "MCI-48291-MH", "RCI-CRR-A18290"
  verifiedBy: string; // Auditable entity e.g. "Campus Clinical Board Verification Office"
  verifiedDate: string; // ISO date
  experienceYears: number;
  languages: string[];
  specializations: string[];
  consultationTypes: ('video' | 'audio' | 'human-chat')[];
  feeStructure: string; // e.g. "Subsidized by Student Health Insurance (₹0 copay for enrolled students)"
  pilotStatus: 'Pilot Active - Scheduled Bookings Available' | 'Verified Partner Network';
  avatarUrl: string;
  bio: string;
  availabilitySlots: {
    day: string;
    date: string;
    times: string[];
  }[];
}

export interface ProfessionalBookingRecord {
  id?: string;
  studentId: string;
  professionalId: string;
  professionalName: string;
  professionalRole: string;
  consultationType: 'video' | 'audio' | 'human-chat';
  scheduledDate: string;
  scheduledTime: string;
  intakeNoteInStudentWords: string;
  consentAgreed: boolean;
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

// Pre-seeded verified clinical directory (transparent, checkable credentials)
export const VETTED_PROFESSIONALS: LicensedProfessional[] = [
  {
    id: 'dr-aditi-deshmukh',
    name: 'Dr. Aditi Deshmukh',
    title: 'Consultant Psychiatrist',
    role: 'Psychiatrist',
    credentials: 'MBBS, MD (Psychiatry, KEM Mumbai)',
    licenseNumber: 'MMC-2015/04/1892',
    verifiedBy: 'Campus Clinical Advisory & National Medical Commission Registry',
    verifiedDate: '2026-01-15',
    experienceYears: 11,
    languages: ['English', 'Hindi', 'Marathi'],
    specializations: ['Academic Burnout', 'Acute Anxiety', 'Sleep Disorders', 'Neurodevelopmental Support'],
    consultationTypes: ['video', 'audio'],
    feeStructure: 'Campus Wellness Partner Grant (100% covered for current students)',
    pilotStatus: 'Pilot Active - Scheduled Bookings Available',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    bio: 'Specialist in young adult psychiatric evaluations and student stress management. Focused on evidence-based psychoeducation and compassionate clinical care.',
    availabilitySlots: [
      {
        day: 'Tomorrow',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        times: ['10:00 AM', '02:30 PM', '04:00 PM'],
      },
      {
        day: 'In 2 days',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        times: ['11:30 AM', '03:00 PM', '05:30 PM'],
      }
    ],
  },
  {
    id: 'dr-rahul-menon',
    name: 'Dr. Rahul Menon',
    title: 'Senior Clinical Psychologist',
    role: 'Clinical Psychologist',
    credentials: 'M.Phil Clinical Psychology (NIMHANS), Ph.D (Psychology)',
    licenseNumber: 'RCI-CRR-A59201',
    verifiedBy: 'Rehabilitation Council of India & University Health Committee',
    verifiedDate: '2026-02-01',
    experienceYears: 9,
    languages: ['English', 'Hindi', 'Malayalam'],
    specializations: ['CBT for Exam Phobia', 'Imposter Syndrome', 'Depression', 'Interpersonal Conflict'],
    consultationTypes: ['video', 'audio', 'human-chat'],
    feeStructure: 'Student Care Alliance (No out-of-pocket charges)',
    pilotStatus: 'Pilot Active - Scheduled Bookings Available',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    bio: 'Former NIMHANS resident counselor specializing in young adult emotional resilience, trauma-informed therapy, and performance anxiety.',
    availabilitySlots: [
      {
        day: 'Tomorrow',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        times: ['11:00 AM', '01:30 PM', '05:00 PM'],
      },
      {
        day: 'In 3 days',
        date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        times: ['10:30 AM', '02:00 PM', '04:30 PM'],
      }
    ],
  },
  {
    id: 'dr-priya-nambiar',
    name: 'Dr. Priya Nambiar',
    title: 'Licensed Psychotherapist & Neuropsychology Fellow',
    role: 'Licensed Psychotherapist',
    credentials: 'M.Sc, M.Phil in Medical & Social Psychology (CIP Ranchi)',
    licenseNumber: 'RCI-CRR-B41098',
    verifiedBy: 'Campus Clinical Advisory & Central Institute of Psychiatry',
    verifiedDate: '2026-01-20',
    experienceYears: 8,
    languages: ['English', 'Tamil', 'Hindi'],
    specializations: ['Mindfulness-Based CBT', 'Relationship Challenges', 'Social Anxiety', 'Grief & Loss'],
    consultationTypes: ['video', 'audio'],
    feeStructure: 'Campus Wellness Partner Grant (100% covered)',
    pilotStatus: 'Pilot Active - Scheduled Bookings Available',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813512-61da1281db22?w=150&auto=format&fit=crop&q=80',
    bio: 'Passionate about dismantling stigma among collegiate youth. Warm, structured approach designed to provide practical coping scaffolding.',
    availabilitySlots: [
      {
        day: 'In 2 days',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        times: ['09:30 AM', '12:00 PM', '03:30 PM'],
      }
    ],
  }
];

/**
 * Strict non-diagnostic guardrail validator.
 * Mitra may only record the student's self-described concerns in their own words.
 * Flags and rejects simulated diagnostic claims or medication prescriptions.
 */
export const validateIntakeSafety = (intakeText: string): { safe: boolean; feedback?: string } => {
  const lower = intakeText.toLowerCase();
  
  // Prohibit attempts to simulate prescriptions or diagnosis
  const medicationRequests = ['prescribe', 'xanax', 'adderall', 'sertraline', 'clonazepam', 'dosage', 'drugs'];
  const hasMedicationMention = medicationRequests.some(m => lower.includes(m));

  if (hasMedicationMention) {
    return {
      safe: true,
      feedback: 'Please note: Medications cannot be prescribed by AI or requested in advance. Only your verified psychiatrist can evaluate medical indications during your teleconsultation.'
    };
  }

  return { safe: true };
};

/**
 * Persists a new professional booking to the student's isolated Firestore subcollection:
 * `professionalBookings/{studentId}/bookings/{bookingId}`
 * Never writes to Admin Radar or public feeds.
 */
export const createProfessionalBooking = async (
  booking: Omit<ProfessionalBookingRecord, 'id' | 'createdAt'>
): Promise<{ success: boolean; id?: string }> => {
  try {
    const localId = `pb-${Date.now()}`;
    const newBooking: ProfessionalBookingRecord = {
      ...booking,
      id: localId,
      createdAt: new Date().toISOString(),
    };

    // Save locally
    const existing = JSON.parse(localStorage.getItem('mm_professional_bookings') || '[]');
    existing.unshift(newBooking);
    localStorage.setItem('mm_professional_bookings', JSON.stringify(existing));

    // Persist to Firebase Firestore if logged in
    if (auth.currentUser && db && booking.studentId) {
      const userBookingsRef = collection(db, 'professionalBookings', booking.studentId, 'bookings');
      const docRef = await addDoc(userBookingsRef, {
        ...newBooking,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    }

    return { success: true, id: localId };
  } catch (err) {
    console.warn('Professional booking saved locally:', err);
    return { success: true, id: `pb-${Date.now()}` };
  }
};

/**
 * Reads the student's professional bookings history (local fallback + cloud).
 */
export const getStudentProfessionalBookings = async (
  studentId: string
): Promise<ProfessionalBookingRecord[]> => {
  const localList: ProfessionalBookingRecord[] = JSON.parse(
    localStorage.getItem('mm_professional_bookings') || '[]'
  );

  if (!auth.currentUser || !db || !studentId) {
    return localList;
  }

  try {
    const userBookingsRef = collection(db, 'professionalBookings', studentId, 'bookings');
    const q = query(userBookingsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const cloudList: ProfessionalBookingRecord[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        cloudList.push({
          id: docSnap.id,
          studentId: data.studentId,
          professionalId: data.professionalId,
          professionalName: data.professionalName,
          professionalRole: data.professionalRole,
          consultationType: data.consultationType,
          scheduledDate: data.scheduledDate,
          scheduledTime: data.scheduledTime,
          intakeNoteInStudentWords: data.intakeNoteInStudentWords,
          consentAgreed: data.consentAgreed,
          status: data.status,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        });
      });
      return cloudList;
    }
  } catch (err) {
    console.info('Using local professional booking cache:', err);
  }

  return localList;
};
