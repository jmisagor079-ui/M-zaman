
export interface Service {
  title: string;
  items: string[];
  icon: string;
}

export interface EducationItem {
  degree: string;
  institute: string;
  year: string;
  result: string;
  group: string;
  curriculum: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Comment {
  user: string;
  text: string;
  date: string;
}

export interface ArtWork {
  id: string;
  url: string;
  title: string;
  description: string;
  comments: Comment[];
}

export interface Message {
  id: string;
  name: string;
  phone: string;
  content: string;
  timestamp: string;
  type: 'Inquiry' | 'Direct';
}
