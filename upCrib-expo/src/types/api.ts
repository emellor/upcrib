// API Types for HomeStyle AI Backend Integration

export interface SessionData {
  sessionId: string;
  status: SessionStatus;
  createdAt: string;
  updatedAt?: string;
  hasImage: boolean;
  hasQuestions: boolean;
  questionsAnswered: number;
  totalQuestions: number;
  hasPendingJobs: boolean;
  image?: ImageMetadata;
  imageUrl?: string;  // URL path for uploaded image (e.g., "/uploads/filename.jpg")
  generatedImage?: GeneratedImageData;
  questions?: Question[];
  pendingJobs?: Job[];
}

export interface ImageMetadata {
  filename: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  uploadedAt: string;
}

export interface GeneratedImageData {
  path: string;
  filename: string;
  extension: string;
  generatedAt: string;
  url?: string; // Relative URL path for HTTP requests
}

export interface Question {
  id: string;
  prompt: string;
  type: QuestionType;
  index: number;
  options?: string[];
  answered: boolean;
}

export interface Answer {
  questionId: string;
  value: string;
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  createdAt: string;
}

export interface Entitlements {
  userId: string;
  entitlements: any[];
  hasAvailableUploads: boolean;
  hasAvailableAnalyses: boolean;
  hasAvailableQuestions: boolean;
}

export type SessionStatus = 
  | 'created'
  | 'uploading'
  | 'uploaded'
  | 'analyzing'
  | 'questions_ready'
  | 'answers_complete'
  | 'generating'
  | 'completed'
  | 'failed';

export type QuestionType = 
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'fill_blank';

export type JobType = 'analyze' | 'generate';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
  };
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Upload: { sessionId: string };
  Style: { sessionId: string; imageUrl?: string };
  Design: { sessionId: string; answers?: { [questionId: string]: string }; imageUrl?: string };
  Result: { sessionId: string; imageUrl?: string; answers?: { [questionId: string]: string }; originalImageUrl?: string };
  History: undefined;
};

export interface UploadResult {
  sessionId: string;
  imageUrl: string;
  metadata: ImageMetadata;
}

export interface QuestionsResult {
  sessionId: string;
  questions: Question[];
  totalQuestions: number;
}

export interface AnswersResult {
  sessionId: string;
  answersSubmitted: number;
  totalAnswers: number;
  results: any[];
  allComplete: boolean;
}

export interface GenerationResult {
  jobId: string;
  sessionId: string;
  status: string;
  message: string;
}

export interface HealthCheck {
  success: boolean;
  status: string;
  timestamp: string;
  version?: string;
}