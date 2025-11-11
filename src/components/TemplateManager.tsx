import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import type { Template } from '@/lib/api';
import { getTemplates, createTemplate, applyTemplate, deleteTemplate } from '@/lib/api';
import { Plus, Trash2, Play, X } from 'lucide-react';
import { formatDate, getWeekStart } from '@/lib/dateUtils';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeekStart: Date;
  onTemplateApplied: () => void;
}

export function TemplateManager({ isOpen, onClose, currentWeekStart, onTemplateApplied }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    const data = await getTemplates();
    setTemplates(data);
  };

  const handleCreate = async () => {
    if (!newTemplateName.trim()) return;
    await createTemplate(newTemplateName);
    setNewTemplateName('');
    setIsCreating(false);
    await loadTemplates();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this template?')) {
      await deleteTemplate(id);
      await loadTemplates();
    }
  };

  const handleApply = async (id: number) => {
    const weekStart = formatDate(getWeekStart(currentWeekStart));
    await applyTemplate(id, weekStart);
    onTemplateApplied();
    alert('Template applied to current week!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 border shadow-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Template Manager</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6">
          {isCreating ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Template name..."
                className="flex-1 px-3 py-2 border rounded-md bg-background"
                autoFocus
              />
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {templates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No templates yet. Create one to get started!
            </p>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/10 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApply(template.id)}
                    title="Apply to current week"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(template.id)}
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm">
          <p className="font-medium mb-2">How to use templates:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Create a template to store your recurring weekly schedule</li>
            <li>Add tasks to your calendar for the current week</li>
            <li>Come back next Sunday and click "Apply" to populate the week</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

