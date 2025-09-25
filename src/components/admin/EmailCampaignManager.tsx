import React, { useState } from 'react';
import { useEmailAutomation } from '../../contexts/EmailAutomationContext';
import { useToast } from '@/hooks/use-toast';

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
}

const EmailCampaignManager: React.FC = () => {
  const { 
    campaigns, 
    templates, 
    loading, 
    createCampaign, 
    updateCampaign, 
    sendTestEmail 
  } = useEmailAutomation();
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testCampaignId, setTestCampaignId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: undefined as number | undefined,
    campaign_type: 'welcome_series',
    trigger_event: '',
    delay_days: 0,
    send_time: '09:00:00',
    is_active: true,
    target_criteria: '',
  });

  const campaignTypes = [
    { value: 'welcome_series', label: 'Welcome Series' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'marketing', label: 'Marketing' },
  ];

  const triggerEvents = [
    { value: 'user_signup', label: 'User Signup' },
    { value: 'framework_step_complete', label: 'Framework Step Complete' },
    { value: 'debt_paid', label: 'Debt Paid Off' },
    { value: 'weekly_schedule', label: 'Weekly Schedule' },
    { value: 'monthly_schedule', label: 'Monthly Schedule' },
  ];

  const handleOpenModal = (campaign?: EmailCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        name: campaign.name,
        description: campaign.description || '',
        template_id: campaign.template_id,
        campaign_type: campaign.campaign_type,
        trigger_event: campaign.trigger_event || '',
        delay_days: campaign.delay_days,
        send_time: campaign.send_time,
        is_active: campaign.is_active,
        target_criteria: campaign.target_criteria ? JSON.stringify(campaign.target_criteria, null, 2) : '',
      });
    } else {
      setEditingCampaign(null);
      setFormData({
        name: '',
        description: '',
        template_id: undefined,
        campaign_type: 'welcome_series',
        trigger_event: '',
        delay_days: 0,
        send_time: '09:00:00',
        is_active: true,
        target_criteria: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetCriteria = null;
    if (formData.target_criteria && formData.target_criteria.trim()) {
      try {
        targetCriteria = JSON.parse(formData.target_criteria);
      } catch (error) {
        console.error('Invalid JSON in target_criteria:', error);
        toast({
          title: "Invalid JSON Format",
          description: "Please enter valid JSON in Target Criteria field or leave it empty.",
          variant: "destructive",
        });
        return;
      }
    }
    
    const campaignData = {
      ...formData,
      target_criteria: targetCriteria,
    };
    
    // Submitting campaign data
    
    const success = editingCampaign 
      ? await updateCampaign(editingCampaign.id, campaignData)
      : await createCampaign(campaignData);
    
    if (success) {
      toast({
        title: editingCampaign ? "Campaign Updated" : "Campaign Created",
        description: editingCampaign 
          ? `"${campaignData.name}" has been updated successfully!`
          : `"${campaignData.name}" has been created successfully!`,
      });
      handleCloseModal();
    } else {
      toast({
        title: "Error",
        description: editingCampaign 
          ? "Failed to update campaign. Please try again."
          : "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTestEmail = async (campaignId: number) => {
    setTestCampaignId(campaignId);
    setTestEmail('');
    setShowTestModal(true);
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testCampaignId && testEmail) {
      const success = await sendTestEmail(testCampaignId, testEmail);
      if (success) {
        setShowTestModal(false);
        toast({
          title: "Test Email Sent",
          description: `Test email has been sent to ${testEmail}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send test email. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getTemplateName = (templateId?: number) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'No template';
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Email Campaigns</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Create Campaign
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-2/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trigger
              </th>
              <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900" title={campaign.name}>
                    {truncateText(campaign.name, 30)}
                  </div>
                  <div className="text-sm text-gray-500" title={campaign.description}>
                    {truncateText(campaign.description || '', 35)}
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className="px-1.5 inline-flex text-xs leading-4 font-semibold rounded bg-blue-100 text-blue-800">
                    {campaign.campaign_type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-3 py-4 text-xs text-gray-500 truncate" title={campaign.trigger_event ? campaign.trigger_event.replace('_', ' ') : 'Manual'}>
                  {campaign.trigger_event ? campaign.trigger_event.replace('_', ' ') : 'Manual'}
                </td>
                <td className="px-3 py-4 text-xs text-gray-500 truncate" title={getTemplateName(campaign.template_id)}>
                  {truncateText(getTemplateName(campaign.template_id), 15)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={`px-1.5 inline-flex text-xs leading-4 font-semibold rounded ${
                    campaign.is_active 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {campaign.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(campaign)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTestEmail(campaign.id)}
                    className="text-purple-600 hover:text-purple-900 mr-3"
                  >
                    Test
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={campaign.name}>
                  {campaign.name}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-1" title={campaign.description}>
                  {campaign.description}
                </p>
              </div>
              <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                campaign.is_active 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {campaign.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {campaign.campaign_type.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Trigger:</span>
                <span className="ml-1 text-gray-900">
                  {campaign.trigger_event ? campaign.trigger_event.replace('_', ' ') : 'Manual'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Template:</span>
                <span className="ml-1 text-gray-900">
                  {getTemplateName(campaign.template_id)}
                </span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleOpenModal(campaign)}
                  className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleTestEmail(campaign.id)}
                  className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.campaign_type}
                      onChange={(e) => setFormData({ ...formData, campaign_type: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      {campaignTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Template</label>
                    <select
                      value={formData.template_id || ''}
                      onChange={(e) => setFormData({ ...formData, template_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select a template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trigger Event</label>
                    <select
                      value={formData.trigger_event}
                      onChange={(e) => setFormData({ ...formData, trigger_event: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Manual trigger</option>
                      {triggerEvents.map(event => (
                        <option key={event.value} value={event.value}>{event.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delay (days)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.delay_days}
                      onChange={(e) => setFormData({ ...formData, delay_days: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Send Time</label>
                    <input
                      type="time"
                      value={formData.send_time}
                      onChange={(e) => setFormData({ ...formData, send_time: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Target Criteria (JSON)</label>
                  <textarea
                    value={formData.target_criteria}
                    onChange={(e) => setFormData({ ...formData, target_criteria: e.target.value })}
                    rows={3}
                    placeholder='{"onboarding_completed": false}'
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Optional JSON criteria for targeting users</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingCampaign ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Test Email</h3>
              
              <form onSubmit={handleSendTest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Email Address</label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTestModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Test'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaignManager;
