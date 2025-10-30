import {
  SessionData,
  UploadResult,
  QuestionsResult,
  AnswersResult,
  GenerationResult,
  Answer,
  Question,
  HealthCheck,
} from '../types/api';

// Mock data for testing
const mockQuestions: Question[] = [
  {
    id: '1',
    prompt: 'What is the primary function of this room?',
    type: 'multiple_choice',
    index: 0,
    options: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office'],
    answered: false,
  },
  {
    id: '2',
    prompt: 'What style do you prefer?',
    type: 'multiple_choice',
    index: 1,
    options: ['Modern', 'Traditional', 'Minimalist', 'Industrial', 'Bohemian'],
    answered: false,
  },
  {
    id: '3',
    prompt: 'What is your budget range for this renovation?',
    type: 'multiple_choice',
    index: 2,
    options: ['Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000', 'Over $50,000'],
    answered: false,
  },
  {
    id: '4',
    prompt: 'Are there any specific colors you want to incorporate?',
    type: 'short_answer',
    index: 3,
    answered: false,
  },
  {
    id: '5',
    prompt: 'Do you want to keep any existing furniture or fixtures?',
    type: 'true_false',
    index: 4,
    options: ['Yes', 'No'],
    answered: false,
  },
];

const mockSessionData: SessionData = {
  sessionId: 'mock-session-123',
  status: 'questions_ready',
  createdAt: new Date().toISOString(),
  hasImage: true,
  hasQuestions: true,
  questionsAnswered: 0,
  totalQuestions: mockQuestions.length,
  hasPendingJobs: false,
  questions: mockQuestions,
};

export class MockAPIClient {
  private sessions: Map<string, SessionData> = new Map();
  private questionAnswers: Map<string, Record<string, string>> = new Map();

  get apiBaseURL(): string {
    return __DEV__ ? 'http://localhost:3001' : 'https://upcrib-backend.onrender.com';
  }

  async healthCheck(): Promise<HealthCheck> {
    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  async createSession(userId?: string): Promise<SessionData> {
    const sessionId = `mock-session-${Date.now()}`;
    const session: SessionData = {
      ...mockSessionData,
      sessionId,
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, session);
    console.log('Mock: Created session', sessionId);
    return session;
  }

  async getSession(sessionId: string): Promise<SessionData> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }

  async getSessionState(sessionId: string): Promise<SessionData> {
    return this.getSession(sessionId);
  }

  async uploadImage(sessionId: string, imageUri: string): Promise<UploadResult> {
    console.log('Mock: Uploading image for session', sessionId);
    
    // Update session to show image uploaded
    const session = this.sessions.get(sessionId);
    if (session) {
      session.hasImage = true;
      session.status = 'uploaded';
      session.image = {
        filename: 'mock-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        width: 800,
        height: 600,
        uploadedAt: new Date().toISOString(),
      };
      this.sessions.set(sessionId, session);
    }

    return {
      sessionId,
      imageUrl: imageUri,
      metadata: {
        filename: 'mock-image.jpg',
        mimetype: 'image/jpeg',
        size: 1024000,
        width: 800,
        height: 600,
        uploadedAt: new Date().toISOString(),
      },
    };
  }

  async analyzeImage(sessionId: string): Promise<GenerationResult> {
    console.log('Mock: Analyzing image for session', sessionId);
    
    // Update session to show analysis complete and questions ready
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'questions_ready';
      session.hasQuestions = true;
      this.sessions.set(sessionId, session);
    }

    // Simulate some delay
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    return {
      jobId: `mock-analyze-job-${Date.now()}`,
      sessionId,
      status: 'completed',
      message: 'Image analysis completed successfully',
    };
  }

  async getQuestions(sessionId: string): Promise<QuestionsResult> {
    console.log('Mock: Getting questions for session', sessionId);
    
    // Update session
    const session = this.sessions.get(sessionId);
    if (session) {
      session.hasQuestions = true;
      session.questions = mockQuestions;
      this.sessions.set(sessionId, session);
    }

    return {
      sessionId,
      questions: mockQuestions,
      totalQuestions: mockQuestions.length,
    };
  }

  async submitAnswers(sessionId: string, answers: Answer[]): Promise<AnswersResult> {
    console.log('Mock: Submitting answers for session', sessionId, answers);
    
    // Store answers
    const answerMap = answers.reduce((acc, answer) => {
      acc[answer.questionId] = answer.value;
      return acc;
    }, {} as Record<string, string>);
    
    this.questionAnswers.set(sessionId, answerMap);

    // Update session
    const session = this.sessions.get(sessionId);
    if (session) {
      session.questionsAnswered = answers.length;
      session.status = 'answers_complete';
      this.sessions.set(sessionId, session);
    }

    return {
      sessionId,
      answersSubmitted: answers.length,
      totalAnswers: mockQuestions.length,
      results: answers,
      allComplete: answers.length === mockQuestions.length,
    };
  }

  async generateRenovatedImage(sessionId: string): Promise<GenerationResult> {
    console.log('Mock: Generating renovated image for session', sessionId);
    
    // Update session to show generation in progress
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'generating';
      session.hasPendingJobs = true;
      this.sessions.set(sessionId, session);
    }

    // Simulate generation time
    setTimeout(async () => {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'completed';
        session.hasPendingJobs = false;
        session.generatedImage = {
          path: '/mock/generated-image.jpg',
          filename: 'generated-image.jpg',
          extension: 'jpg',
          generatedAt: new Date().toISOString(),
        };
        this.sessions.set(sessionId, session);
      }
    }, 5000);

    return {
      jobId: `mock-generation-job-${Date.now()}`,
      sessionId,
      status: 'processing',
      message: 'Image generation started',
    };
  }

  async getJobStatus(jobId: string): Promise<any> {
    console.log('Mock: Getting job status for', jobId);
    
    // Simulate job completion after some time
    return {
      jobId,
      status: 'completed',
      message: 'Job completed successfully',
    };
  }

  async pollJobStatus(jobId: string): Promise<any> {
    return this.getJobStatus(jobId);
  }

  async getEntitlements(userId: string): Promise<any> {
    return {
      userId,
      entitlements: [],
      hasAvailableUploads: true,
      hasAvailableAnalyses: true,
      hasAvailableQuestions: true,
    };
  }
}

export const mockApiClient = new MockAPIClient();
