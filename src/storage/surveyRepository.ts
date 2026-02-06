import { SurveyComplaint, SurveyResponse } from '../types/survey';

const RESPONSES_KEY = 'patientenbefragung_responses';
const COMPLAINTS_KEY = 'patientenbefragung_complaints';

const loadResponses = (): SurveyResponse[] => {
  const raw = localStorage.getItem(RESPONSES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SurveyResponse[];
  } catch {
    return [];
  }
};

const saveResponses = (items: SurveyResponse[]) => {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(items));
};

const loadComplaints = (): SurveyComplaint[] => {
  const raw = localStorage.getItem(COMPLAINTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SurveyComplaint[];
  } catch {
    return [];
  }
};

const saveComplaints = (items: SurveyComplaint[]) => {
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(items));
};

export const surveyRepository = {
  listResponses: async (): Promise<SurveyResponse[]> => loadResponses(),
  getResponseById: async (id: string): Promise<SurveyResponse | undefined> => loadResponses().find((item) => item.id === id),
  createResponse: async (response: SurveyResponse): Promise<void> => {
    const items = loadResponses();
    items.unshift(response);
    saveResponses(items);
  },
  listComplaints: async (): Promise<SurveyComplaint[]> => loadComplaints(),
  getComplaintById: async (id: string): Promise<SurveyComplaint | undefined> =>
    loadComplaints().find((item) => item.id === id),
  createComplaint: async (complaint: SurveyComplaint): Promise<void> => {
    const items = loadComplaints();
    items.unshift(complaint);
    saveComplaints(items);
  },
  updateComplaint: async (complaint: SurveyComplaint): Promise<void> => {
    const items = loadComplaints().map((item) => (item.id === complaint.id ? complaint : item));
    saveComplaints(items);
  },
};
