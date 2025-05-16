import { Table, Card, Badge } from '@/components/ui'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import Th from '@/components/ui/Table/Th'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import React, { useEffect, useState } from 'react'
import { apiGetAllScans } from '@/services/ScansApiService'

interface Vulnerability {
    endpoint: string;
    matchedRules: Array<{
        ruleId: string;
        ruleName: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
    }>;
}

const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
};

const Vulnerabilities = () => {
    const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVulnerabilities();
    }, []);

    const fetchVulnerabilities = async () => {
        try {
            setLoading(true);
            const response = await apiGetAllScans();
            console.log('VUL',response)
            // Process scans to extract vulnerabilities
            const vulns = response.data.reduce((acc: Vulnerability[], scan) => {
                scan.results.forEach(result => {
                    if (result.violations && result.violations.length > 0) {
                        const existingVuln = acc.find(v => v.endpoint === result.endpoint);
                        
                        // Create unique rules based on ruleId and severity
                        const uniqueRules = Array.from(
                            new Map(
                                result.violations.map(v => [
                                    `${v.rule}-${v.severity}`,
                                    {
                                        ruleId: v.rule,
                                        ruleName: getRuleName(v.rule),
                                        severity: v.severity
                                    }
                                ])
                            ).values()
                        );

                        if (existingVuln) {
                            // Merge unique rules
                            const allRules = [...existingVuln.matchedRules, ...uniqueRules];
                            existingVuln.matchedRules = Array.from(
                                new Map(
                                    allRules.map(rule => [
                                        `${rule.ruleId}-${rule.severity}`,
                                        rule
                                    ])
                                ).values()
                            );
                        } else {
                            acc.push({
                                endpoint: result.endpoint,
                                matchedRules:uniqueRules,
                                method:result.method
                            });
                        }
                    }
                });
                return acc;
            }, []);

            setVulnerabilities(vulns);
        } catch (error) {
            console.error('Error fetching vulnerabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRuleName = (ruleId: string) => {
        const ruleNames: Record<string, string> = {
            'RULE-1': 'SQL Injection',
            'RULE-2': 'NoSQL Injection',
            'RULE-3': 'Rate Limiting Bypass',
            'RULE-4': 'Basic Availability'
        };
        return ruleNames[ruleId] || ruleId;
    };

    return (
        <Card>
            <div className="p-4">
                <h4 className="mb-4">Detected Vulnerabilities</h4>
                <Table compact>
                    <THead>
                        <Tr>
                            <Th>Endpoint</Th>
                            <Th>Matched Rules</Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {loading ? (
                            <Tr>
                                <Td colSpan={2} className="text-center">
                                    Loading vulnerabilities...
                                </Td>
                            </Tr>
                        ) : vulnerabilities.length === 0 ? (
                            <Tr>
                                <Td colSpan={2} className="text-center">
                                    No vulnerabilities detected
                                </Td>
                            </Tr>
                        ) : (
                            vulnerabilities.map((vuln, index) => (
                                <Tr key={index}>
                                    <Td >
                                        <div className="flex items-center">
                                            <span className="mr-2 px-2 py-1 rounded-md  text-gray text-sm uppercase font-bold">
                                                {vuln?.method}
                                            </span>
                                            <span className="text-gray-700 hover:text-blue-600 transition-colors">
                                                {vuln.endpoint}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td>
                                        <div className="flex flex-wrap gap-2">
                                            {vuln.matchedRules.map((rule, ruleIndex) => (
                                                <Badge
                                                    key={ruleIndex}
                                                    className={`${severityColors[rule.severity]} text-white`}
                                                >
                                                    {rule.ruleName}
                                                </Badge>
                                            ))}
                                        </div>
                                    </Td>
                                </Tr>
                            ))
                        )}
                    </TBody>
                </Table>
            </div>
        </Card>
    );
};

export default Vulnerabilities;