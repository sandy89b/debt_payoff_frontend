import React, { useState } from 'react';
import { useEmailAutomation } from '../../contexts/EmailAutomationContext';
import { useToast } from '@/hooks/use-toast';

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
}

const EmailTemplateManager: React.FC = () => {
  const { 
    templates, 
    loading, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate 
  } = useEmailAutomation();
  const { toast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    template_type: 'welcome',
    category: 'debt_freedom',
    variables: [] as string[],
    is_active: true,
  });

  const templateTypes = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'marketing', label: 'Marketing' },
  ];

  const categories = [
    { value: 'debt_freedom', label: 'Debt Freedom' },
    { value: 'framework', label: 'Framework' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'general', label: 'General' },
  ];

  const handleOpenModal = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content || '',
        template_type: template.template_type,
        category: template.category,
        variables: template.variables || [],
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        subject: '',
        html_content: '',
        text_content: '',
        template_type: 'welcome',
        category: 'debt_freedom',
        variables: [],
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = editingTemplate 
      ? await updateTemplate(editingTemplate.id, formData)
      : await createTemplate(formData);
    
    if (success) {
      toast({
        title: editingTemplate ? "Template Updated" : "Template Created",
        description: editingTemplate 
          ? `"${formData.name}" has been updated successfully!`
          : `"${formData.name}" has been created successfully!`,
      });
      handleCloseModal();
    } else {
      toast({
        title: "Error",
        description: editingTemplate 
          ? "Failed to update template. Please try again."
          : "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const success = await deleteTemplate(id);
      if (success) {
        toast({
          title: "Template Deleted",
          description: "Template has been deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete template. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const addVariable = () => {
    const variable = prompt('Enter variable name (e.g., firstName):');
    if (variable && !formData.variables.includes(variable)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variable],
      });
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable),
    });
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Create Template
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      )}

      {/* Desktop Table View */}
      {!loading && (
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
                Category
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variables
              </th>
              <th className="w-20 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates && templates.length > 0 ? templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900" title={template.name}>
                    {truncateText(template.name, 25)}
                  </div>
                  <div className="text-sm text-gray-500" title={template.subject}>
                    {truncateText(template.subject, 40)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {template.template_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 truncate" title={template.category}>
                  {template.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    template.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {template.variables?.length || 0} variables
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleOpenModal(template)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? 'Loading templates...' : 'No templates found. Create your first template!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      )}

      {/* Mobile Card View */}
      {!loading && (
        <div className="lg:hidden space-y-4">
          {templates && templates.length > 0 ? templates.map((template) => (
            <div key={template.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate" title={template.name}>
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate mt-1" title={template.subject}>
                    {template.subject}
                  </p>
                </div>
                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  template.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {template.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {template.template_type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-1 text-gray-900">
                    {template.category}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Variables:</span>
                  <span className="ml-1 text-gray-900">
                    {template.variables?.length || 0} variables
                  </span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleOpenModal(template)}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No templates found. Create your first template!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={formData.template_type}
                      onChange={(e) => setFormData({ ...formData, template_type: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      {templateTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">HTML Content</label>
                  <textarea
                    value={formData.html_content}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    rows={8}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Text Content (Optional)</label>
                  <textarea
                    value={formData.text_content}
                    onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Variables</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {formData.variables.map(variable => (
                      <span
                        key={variable}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {`{{${variable}}}`}
                        <button
                          type="button"
                          onClick={() => removeVariable(variable)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={addVariable}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      + Add Variable
                    </button>
                  </div>
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
                    {loading ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
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

export default EmailTemplateManager;
