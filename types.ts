

export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface SearchResult {
  summary: string;
  keyPoints: string[];
  imageSearchSuggestions: string[];
  relatedSearches: string[];
  sources: GroundingChunk[];
}

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface CommunityAnswer {
    id: number;
    text: string;
    imageUrl?: string;
    likes: number;
    userId: string;
}

export interface QAItem {
  id: number;
  question: string;
  answer: string;
  isLoading: boolean;
  description?: string;
  imageUrl?: string;
  communityAnswers: CommunityAnswer[];
  userId?: string;
}

export interface FreelancerProfile {
  id: number;
  name: string;
  title: string;
  skills: string[];
  rate: number;
  avatarUrl: string;
  email: string;
  domain: string;
  experience: number; // in years
  rating: number; // out of 5
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface Task {
    id: number;
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline?: string;
    description?: string;
}

export type BackgroundType = 'color' | 'image' | 'vanta' | 'custom';

export interface Background {
  type: BackgroundType;
  value: string; // hex code, image url, 'globe', or data:url
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface Wallet {
    credits: number;
    funds: {
        amount: number;
        currency: Currency;
    };
}
