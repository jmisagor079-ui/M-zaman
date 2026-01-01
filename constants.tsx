import { BookOpen, Palette, GraduationCap, User, MapPin, Mail, Phone, Facebook } from 'lucide-react';
import { Service, EducationItem, SocialLink } from './types';

export const COLORS = {
  lavender: '#E6E6FA',
  cream: '#FFFDD0',
  peach: '#FFDAB9',
  accent: '#A78BFA', // Purple-400
};

/**
 * GLOBAL SYNCHRONIZATION CONFIG
 * To enable global updates across all devices, create a JSON bin at https://www.npoint.io/
 * and paste the URL here. This allows the Admin Portal to push changes to the cloud
 * and visitors to fetch them immediately.
 */
export const CLOUD_SYNC_URL = 'https://api.npoint.io/46e8c07f43372c388275'; // Example public endpoint

export const SERVICES: Service[] = [
  {
    title: 'Subjects Taught',
    items: ['Economics', 'Civics', 'Geography', 'Psychology', 'All subjects (Primary Level)'],
    icon: 'BookOpen'
  },
  {
    title: 'Classes Covered',
    items: ['Play, KG, Nursery', 'Class 1 – Class 8', 'HSC 1st Year & 2nd Year'],
    icon: 'GraduationCap'
  },
  {
    title: 'Tutoring Environment',
    items: ['One-to-One', 'One-to-Many', 'Student Home', 'My Home (Shewrapara)'],
    icon: 'User'
  }
];

export const EDUCATION: EducationItem = {
  degree: 'Bachelor/Honors (2nd Year)',
  institute: 'Govt. Titumir College',
  year: '2024',
  result: 'CGPA 3.67',
  group: 'Economics',
  curriculum: 'English Version'
};

export const SOCIALS: SocialLink[] = [
  { platform: 'Facebook', url: 'https://www.facebook.com/maisha.zaman.921677', icon: 'Facebook' },
  { platform: 'Email', url: 'mailto:maishazaman1502@gmail.com', icon: 'Mail' },
  { platform: 'Phone', url: 'tel:01521426685', icon: 'Phone' }
];

export const PERSONAL_INFO = {
  tutorId: '358377',
  name: 'Maisha Zaman',
  email: 'maishazaman1502@gmail.com',
  phone: '01521426685',
  city: 'Dhaka',
  location: 'Shewrapara',
  dob: '15 February 2004',
  gender: 'Female',
  nationality: 'Bangladeshi',
  religion: 'Islam',
  address: 'West Shewrapara, Shamim Saroni, Dhaka-1216',
  salary: '5000 BDT',
  availability: 'Sunday, Monday, Wednesday, Thursday, Friday',
  time: '00:00 – 17:00'
};

export const LOCATIONS = [
  'Agargaon', 'Mirpur 1', 'Mirpur 2', 'Mirpur 10', 'Shewrapara', 'Kazipara'
];