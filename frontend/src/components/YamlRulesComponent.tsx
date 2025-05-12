import { Button, Card, Notification, Skeleton, toast } from "@/components/ui";
import { apiDeleteYamlRule, apiGetAllYamlRules, YamlRule } from "@/services/YamlRulesService";
import { useEffect, useState } from "react";
import { MdOutlineModeEditOutline, MdDelete } from "react-icons/md";

interface RulesComponentProps {
    onEdit: (rule: YamlRule) => void;
}

const RulesComponent: React.FC<RulesComponentProps> = ({ onEdit }) => {
    const [rules, setRules] = useState<YamlRule[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const response = await apiGetAllYamlRules();
            setRules(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch YAML rules
                </Notification>
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleDeleteRule = async (ruleId: string) => {
        try {
            await apiDeleteYamlRule(ruleId);
            toast.push(
                <Notification type="success" title="Success">
                    Rule deleted successfully
                </Notification>
            );
            fetchRules();
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to delete rule
                </Notification>
            );
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} height={100} className="rounded-lg" />
                ))}
            </div>
        );
    }

    if (rules.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No rules found. Create your first rule to get started.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {rules.map((rule) => (
                <Card 
                    key={rule._id} 
                    bordered={false}
                    className="hover:shadow-md transition-shadow duration-200 p-4"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h5 className="font-semibold text-lg">{rule.name}</h5>
                        <div className="flex gap-2">
                            <Button
                                variant="plain"
                                onClick={() => onEdit(rule)}
                                icon={<MdOutlineModeEditOutline />}
                                className="text-gray-500 hover:text-blue-600"
                            />
                            <Button
                                variant="plain"
                                onClick={() => handleDeleteRule(rule._id)}
                                icon={<MdDelete />}
                                className="text-gray-500 hover:text-red-600"
                            />
                        </div>
                    </div>
                    {rule.description && (
                        <p className="text-gray-600 mb-3">{rule.description}</p>
                    )}
                    {rule.content && (
                        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm text-gray-800">
                            <code>{rule.content}</code>
                        </pre>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default RulesComponent;