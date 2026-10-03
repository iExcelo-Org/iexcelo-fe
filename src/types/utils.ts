// Utility-related types for countries, settings, etc.

export interface ICountry {
  id: string;
  name: string;
  code: string;
  codeLabel: string;
  isoCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IExamType {
  id: string;
  name: string;
  description: string;
  minSubjectsSelectable: number;
  maxSubjectsSelectable: number;
  freeTierQuestionLimit: number;
  supportedCategories: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISubject {
  id: string;
  name: string;
  description: string;
  examTypeId: string;
  isActive: boolean;
  totalQuestions: number;
  isCompulsory: boolean;
  isAlsoPractical: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITopic {
  id: string;
  subjectId: string;
  subjectName: string;
  name: string;
  content: string | null;
  contentFormat?: 'markdown' | 'plate';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
