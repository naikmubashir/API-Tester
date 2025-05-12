import { Button, Card, Notification, toast } from "@/components/ui";
import { apiGetAllYamlRules, YamlRule } from "@/services/YamlRulesService";
import { useState } from "react";
import YamlRulesComponent from "@/components/YamlRulesComponent";
import YamlRuleForm from "@/components/YamlRuleForm";

const Rules = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingRule, setEditingRule] = useState<YamlRule | null>(null);

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
    };

    const handleEditSuccess = () => {
        setEditingRule(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Rules</h1>
                <Button 
                    variant="solid"
                    onClick={() => setShowCreateForm(true)}
                >
                    Create New Rule
                </Button>
            </div>

            {showCreateForm && (
                <YamlRuleForm
                    onSuccess={handleCreateSuccess}
                />
            )}

            {editingRule && (
                <YamlRuleForm
                    isEdit
                    initialData={editingRule}
                    ruleId={editingRule._id}
                    onSuccess={handleEditSuccess}
                />
            )}

            {!showCreateForm && !editingRule && (
                <YamlRulesComponent 
                    onEdit={setEditingRule}
                />
            )}
        </div>
    );
};

export default Rules;