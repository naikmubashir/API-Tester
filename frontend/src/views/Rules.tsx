import { Button, Card, Notification, Skeleton, toast } from "@/components/ui";
import { apiGetAllYamlRules, YamlRule } from "@/services/YamlRulesService";
import { useEffect, useState } from "react";

const SKELETON_COUNT = 3;

const Rules = () => {
    const [rules, setRules] = useState<YamlRule[]|YamlRule>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            setLoading(true);
            const response = await apiGetAllYamlRules();
            setRules(response.data);
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

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Rules</h1>
                <Button 
                    variant="solid"
                    onClick={fetchRules}
                    loading={loading}
                >
                    Create new rule
                </Button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(SKELETON_COUNT)].map((_, index) => (
                        <Skeleton key={index} height={100} className="rounded-lg" />
                    ))}
                </div>
            ) : rules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No rules found
                </div>
            ) : (
                <div className="space-y-4">
                    {rules.map((rule: any) => (
                        <Card 
                            key={rule._id} 
                            bordered={false}
                            className="hover:shadow-md transition-shadow duration-200"
                        >
                            <h5 className="font-semibold text-lg mb-2">{rule.name}</h5>
                            <p className="text-gray-600">{rule.description}</p>
                            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm text-gray-800">
                                <code>{rule.content}</code>
                            </pre>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Rules;