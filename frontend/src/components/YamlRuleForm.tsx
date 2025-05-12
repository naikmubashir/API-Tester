import React, { useEffect, useState } from 'react';
import { Button, Input, Notification, toast } from './ui';
import { apiCreateNewYamlRule, apiUpdateYamlRule } from '@/services/YamlRulesService';

interface YamlRuleForm {
  name: string;
  description?: string;
  content: string;
}

interface YamlRuleFormProps {
  initialData?: YamlRuleForm;
  ruleId?: string;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const YamlRuleForm: React.FC<YamlRuleFormProps> = ({ 
  initialData, 
  ruleId, 
  isEdit = false,
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<YamlRuleForm>({
    name: '',
    description: '',
    content: ''
  });

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData(initialData);
    }
  }, [initialData, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.push(
        <Notification type="warning" title="Validation Error">
          Name and rule content are required
        </Notification>
      );
      return;
    }

    try {
      setLoading(true);
      if (isEdit && ruleId) {
        // Update existing rule
        await apiUpdateYamlRule(ruleId, formData);
        toast.push(
          <Notification type="success" title="Success">
            Rule updated successfully
          </Notification>
        );
      } else {
        // Create new rule
        await apiCreateNewYamlRule(formData);
        toast.push(
          <Notification type="success" title="Success">
            Rule created successfully
          </Notification>
        );
      }
      onSuccess?.();
      if (!isEdit) {
        setFormData({ name: '', description: '', content: '' });
      }
    } catch (error) {
      toast.push(
        <Notification type="danger" title="Error">
          Failed to {isEdit ? 'update' : 'create'} rule
        </Notification>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? 'Edit Rule' : 'Create New Rule'}
        </h2>
        <div>
          <Input
            name="name"
            placeholder="Rule name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>
        <div>
          <Input
            name="description"
            placeholder="Rule description (optional)"
            value={formData.description}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <div>
          <textarea
            name="content"
            placeholder="Enter your rule content"
            value={formData.content}
            onChange={handleChange}
            required
            className="w-full min-h-[200px] p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4">
          <Button
            variant="solid"
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {isEdit ? 'Update Rule' : 'Create Rule'}
          </Button>
          { (
            <Button
              variant="plain"
              onClick={() => onSuccess?.()}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default YamlRuleForm;