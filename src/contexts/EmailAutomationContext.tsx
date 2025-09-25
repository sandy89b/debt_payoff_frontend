import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  template_type: string;
  category: string;
  is_active: boolean;
  variables: string[];
  created_at: string;
  updated_at: string;
}

interface EmailCampaign {
  id: number;
  name: string;
  description?: string;
  template_id?: number;
  campaign_type: string;
  trigger_event?: string;
  delay_days: number;
  is_active: boolean;
  send_time: string;
  target_criteria?: any;
  created_at: string;
  updated_at: string;
  template_name?: string;
}

interface EmailAnalytics {
  total_sends: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  avg_opens: number;
  avg_clicks: number;
  open_rate: string;
  click_rate: string;
  bounce_rate: string;
}

interface EmailSend {
  id: number;
  user_id: number;
  campaign_id?: number;
  template_id?: number;
  recipient_email: string;
  subject: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  bounce_reason?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  campaign_name?: string;
}

interface EmailAutomationContextType {
  templates: EmailTemplate[];
  campaigns: EmailCampaign[];
  analytics: EmailAnalytics | null;
  emailSends: EmailSend[];
  loading: boolean;
  error: string | null;
  
  // Template methods
  getTemplates: () => Promise<void>;
  getTemplate: (id: number) => Promise<EmailTemplate | null>;
  createTemplate: (template: Partial<EmailTemplate>) => Promise<boolean>;
  updateTemplate: (id: number, template: Partial<EmailTemplate>) => Promise<boolean>;
  deleteTemplate: (id: number) => Promise<boolean>;
  
  // Campaign methods
  getCampaigns: () => Promise<void>;
  getCampaign: (id: number) => Promise<EmailCampaign | null>;
  createCampaign: (campaign: Partial<EmailCampaign>) => Promise<boolean>;
  updateCampaign: (id: number, campaign: Partial<EmailCampaign>) => Promise<boolean>;
  
  // Email operations
  sendTestEmail: (campaignId: number, testEmail: string, customVariables?: any) => Promise<boolean>;
  getAnalytics: (campaignId?: number, dateRange?: number) => Promise<void>;
  getEmailSends: (filters?: any) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
}

const EmailAutomationContext = createContext<EmailAutomationContextType | undefined>(undefined);

export const useEmailAutomation = () => {
  const context = useContext(EmailAutomationContext);
  if (!context) {
    throw new Error('useEmailAutomation must be used within an EmailAutomationProvider');
  }
  return context;
};

interface EmailAutomationProviderProps {
  children: ReactNode;
}

export const EmailAutomationProvider: React.FC<EmailAutomationProviderProps> = ({ children }) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [emailSends, setEmailSends] = useState<EmailSend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Helper function to make authenticated API requests
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    });
    return response;
  };

  const handleError = (error: any, operation: string) => {
    const errorMessage = error.response?.data?.message || error.message || `Failed to ${operation}`;
    setError(errorMessage);
  };

  const clearError = () => setError(null);

  // Template methods
  const getTemplates = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/templates`);
      const data = await response.json();
      
      if (data.success) {
        // Ensure templates have the required structure
        const formattedTemplates = (data.data || []).map((template: any) => ({
          ...template,
          variables: template.variables || [],
          is_active: template.is_active !== undefined ? template.is_active : true
        }));
        setTemplates(formattedTemplates);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'get templates');
    } finally {
      setLoading(false);
    }
  };

  const getTemplate = async (id: number): Promise<EmailTemplate | null> => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/templates/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'get template');
      return null;
    }
  };

  const createTemplate = async (template: Partial<EmailTemplate>): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/templates`, {
        method: 'POST',
        body: JSON.stringify(template),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await getTemplates(); // Refresh templates list
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'create template');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: number, template: Partial<EmailTemplate>): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await getTemplates(); // Refresh templates list
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'update template');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/templates/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await getTemplates(); // Refresh templates list
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'delete template');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Campaign methods
  const getCampaigns = async () => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/campaigns`);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'get campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getCampaign = async (id: number): Promise<EmailCampaign | null> => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/campaigns/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'get campaign');
      return null;
    }
  };

  const createCampaign = async (campaign: Partial<EmailCampaign>): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/campaigns`, {
        method: 'POST',
        body: JSON.stringify(campaign),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await getCampaigns(); // Refresh campaigns list
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'create campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (id: number, campaign: Partial<EmailCampaign>): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(campaign),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await getCampaigns(); // Refresh campaigns list
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'update campaign');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Email operations
  const sendTestEmail = async (campaignId: number, testEmail: string, customVariables?: any): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/send-test`, {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: campaignId,
          test_email: testEmail,
          custom_variables: customVariables,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'send test email');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = async (campaignId?: number, dateRange: number = 30) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (campaignId) params.append('campaign_id', campaignId.toString());
      params.append('date_range', dateRange.toString());
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/analytics?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'get analytics');
    } finally {
      setLoading(false);
    }
  };

  const getEmailSends = async (filters: any = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString());
        }
      });
      
      const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/email-automation/sends?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setEmailSends(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      handleError(error, 'get email sends');
    } finally {
      setLoading(false);
    }
  };

  const value: EmailAutomationContextType = {
    templates,
    campaigns,
    analytics,
    emailSends,
    loading,
    error,
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    sendTestEmail,
    getAnalytics,
    getEmailSends,
    clearError,
  };

  return (
    <EmailAutomationContext.Provider value={value}>
      {children}
    </EmailAutomationContext.Provider>
  );
};
