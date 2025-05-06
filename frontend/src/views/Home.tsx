import { Button, Card, Input, Notification, Skeleton } from '@/components/ui'
import { useEffect, useState } from 'react'
import {
    apiFetchAndStoreSwagger,
    apiGetAllSwaggers,
} from '@/services/SwaggerApiService'
import toast from '@/components/ui/toast'

const Home = () => {
    const SKELETON_COUNT = 5;
    const [loading, setLoading] = useState(false)
    const [swaggerUrl, setSwaggerUrl] = useState('')

    const [rules, setRules] = useState<any>([])
    const [loadingData, setLoadingData] = useState(false)
    useEffect(() => {
        fetchAllSwaggers()
    }, [])

    const fetchAllSwaggers = async () => {
        try {
            setLoadingData(true)
            const response = await apiGetAllSwaggers()
            setRules(response.data)
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch Previous Imports
                </Notification>,
            )
        } finally {
            setLoadingData(false)
        }
    }

    const handleImport = async () => {
        if (!swaggerUrl.trim()) {
            toast.push(
                <Notification type="warning" title="Validation Error">
                    Please provide a valid Swagger API URL.
                </Notification>,
            )
            return
        }

        try {
            setLoading(true)
            const response = await apiFetchAndStoreSwagger({
                swaggerapi: swaggerUrl,
            })
            toast.push(
                <Notification type="success" title="Success">
                    Swagger API imported successfully!
                </Notification>,
            )
            setSwaggerUrl('') // Clear the input after success
            fetchAllSwaggers()
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to import Swagger API. Please try again.
                </Notification>,
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-4xl font-bold">Import Swagger API</h1>
            <div className="flex gap-4 items-center">
            <Input
                name="swagger"
                className="flex-1 border-2 border-gray-300"
                placeholder="Enter Swagger API URL (e.g., https://api.example.com/swagger.json)"
                value={swaggerUrl}
                onChange={(e) => setSwaggerUrl(e.target.value)}
            />
            <Button
                variant="solid"
                loading={loading}
                onClick={handleImport}
                className="px-6"
            >
                Import
            </Button>
            </div>
            {rules.length === 0 ? (
            <h3 className="text-gray-500 text-lg">No previous imports found</h3>
            ) : (
            <h3 className="text-lg font-semibold">Previous Imports</h3>
            )}
            {loadingData && (
                <div className="space-y-4">
                    {[...Array(SKELETON_COUNT)].map((_, index) => (
                        <Skeleton key={index} height={94} className='rounded-lg'>             
                        </Skeleton>
                    ))}
                </div>
            )}
            <div className="space-y-4">
            {rules.map((rule: any, index: number) => (
                <Card key={rule._id} className="p-4 shadow-md border border-gray-200">
                <h5 className="font-semibold text-lg">Import {rules.length -index }</h5>
                <p className="text-gray-600">{rule.info.description || 'No description available'}</p>
                </Card>
            ))}
            </div>
        </div>
    )
}

export default Home
