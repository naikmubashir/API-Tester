import React, { useEffect, useState } from 'react'
import {
    Button,
    Input,
    Select,
    FormItem,
    Form,
    FormContainer,
    Notification,
    toast,
    Card,
} from '@/components/ui'
import { apiCreateScan } from '@/services/ScansApiService'
import { useNavigate } from 'react-router-dom'
import { apiGetRequestsByApiInfo } from '@/services/SwaggerApiService'

interface Rule {
    _id: string
    name: string
}

interface Request {
    _id: string
    path: string
    method: string
}

interface SelectOption {
    label: string
    value: string
}

interface CreateScanProps {
    rules: Rule[]
    requests: Request[]
    apiInfos: {
        _id: string
        info: {
            title: string
            version: string
        }
    }[]
}

interface ScanFormData {
    name: string
    ruleId: string
    requestIds: string[]
}

const CreateScan: React.FC<CreateScanProps> = ({
    rules = [],
    requests = [],
    apiInfos = [],
}) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<ScanFormData>({
        name: '',
        ruleId: '',
        requestIds: [],
    })
    const [selectedApi, setSelectedApi] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isFormValid()) {
            toast.push(
                <Notification type="warning" title="Validation Error">
                    Please fill in all required fields
                </Notification>,
            )
            return
        }

        setLoading(true)

        try {
            console.log('FORM',formData)
            const response = await apiCreateScan(formData)
            toast.push(
                <Notification type="info" title="Success">
                    Scan has been initiated successfully
                </Notification>,
            )
            navigate(`/scan-details/${response.data._id}`)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    {error instanceof Error
                        ? error.message
                        : 'Failed to create scan'}
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof ScanFormData, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const isFormValid = () => {
        return Boolean(
            formData.name.trim() && formData.ruleId && formData.requestIds.length>0,
        )
    }

    const ruleOptions = rules.map((rule) => ({
        label: rule.name,
        value: rule._id,
    }))

    const requestOptions = requests.map((request) => ({
        label: `${request.method.toUpperCase()} ${request.path}`,
        value: request._id,
    }))

    const selectedRule = ruleOptions.find(
        (option) => option.value === formData.ruleId,
    )
    const selectedRequests = requestOptions.filter(
        (option) => formData.requestIds.includes(option.value)
    )
    // Create API options for the dropdown
    const apiOptions = apiInfos.map((api) => ({
        label: `${api.info.title} v${api.info.version}`,
        value: api._id
    }));
    // Handle API selection
    const handleApiSelection =async (apiId: string | null) => {
        if (!apiId) {
            setSelectedApi(null);
            return;
        }
            const response = await apiGetRequestsByApiInfo(apiId);
            const requests=response.data;
             const requestIds = requests.map((req: any) => req._id);

            setSelectedApi(apiId);
            handleInputChange('requestIds', requestIds);
    };
    return (
        <Card className="max-w-2xl mx-auto p-6">

            <h1 className="text-2xl font-bold mb-6">Create New Scan</h1>
            <FormContainer>
                <Form layout="vertical" onSubmit={handleSubmit}>
                    <FormItem
                        label="Scan Name"
                        invalid={!formData.name.trim() && formData.name !== ''}
                        errorMessage="Please enter a scan name"
                    >
                        <Input
                            value={formData.name}
                            onChange={(e) =>
                                handleInputChange('name', e.target.value)
                            }
                            placeholder="Enter scan name"
                            disabled={loading}
                        />
                    </FormItem>

                    <FormItem
                        label="Select Rule"
                        invalid={!formData.ruleId && formData.ruleId !== ''}
                        errorMessage="Please select a rule"
                    >
                        <Select<SelectOption>
                            value={selectedRule}
                            onChange={(option: SelectOption | null) => {
                                if (option) {
                                    handleInputChange('ruleId', option.value)
                                }
                            }}
                            options={ruleOptions}
                            placeholder="Select a rule"
                            isDisabled={loading || rules.length === 0}
                        />
                    </FormItem>
                    <FormItem
                        label="Select API (Optional)"
                        helper="Select an API to include all its endpoints"
                    >
                        <Select<SelectOption>
                            value={apiOptions.find(opt => opt.value === selectedApi)}
                            onChange={(option: SelectOption | null) => {
                                handleApiSelection(option?.value || null);
                            }}
                            options={apiOptions}
                            placeholder="Select an API to include all endpoints"
                            isDisabled={loading}
                            isClearable
                        />
                    </FormItem>
                    <FormItem
    label="Select Individual Requests"
    invalid={!formData.requestIds}
    errorMessage="Please select at least one request"
>
    <Select
        isMulti
        value={selectedRequests}
        onChange={(options) => {
            handleInputChange('requestIds', options ? options.map(opt => opt.value) : []);
             // Clear API selection if manually selecting requests
            if (selectedApi) setSelectedApi(null);
        }}
        options={requestOptions}
        placeholder="Select multiple requests"
        isDisabled={loading || requests.length === 0 }
        closeMenuOnSelect={false}  // Keeps the menu open after selection
        // isLoading={loading}
    />
</FormItem>


                    <div className="flex gap-2 mt-6">
                        <Button
                            variant="solid"
                            type="submit"
                            loading={loading}
                            disabled={!isFormValid() || loading}
                            block
                        >
                            Create Scan
                        </Button>
                        <Button
                            variant="plain"
                            onClick={() => navigate('/scans')}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>
            </FormContainer>

        </Card>
    )
}

export default CreateScan
