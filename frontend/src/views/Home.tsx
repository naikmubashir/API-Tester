import { Button, Card, Input, Notification, Skeleton, Dialog } from '@/components/ui'
import { useEffect, useState } from 'react'
import {
    apiFetchAndStoreSwagger,
    apiGetAllSwaggers,
    apiDeleteSwagger
} from '@/services/SwaggerApiService'
import toast from '@/components/ui/toast'
import classNames from '@/utils/classNames'

const Home = () => {
    const SKELETON_COUNT = 5;
    const [loading, setLoading] = useState(false)
    const [swaggerUrl, setSwaggerUrl] = useState('')
    const [deleteDialog, setDeleteDialog] = useState<{
        show: boolean;
        apiId?: string;
        apiTitle?: string;
    }>({
        show: false
    });
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
            console.log('IM',rules)
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
            const apiInfo=response.data
            toast.push(
                <Notification type="success" title="Success">
                    {response.message}
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

    const handleDeleteClick = (apiId: string, apiTitle: string) => {
        setDeleteDialog({
            show: true,
            apiId,
            apiTitle
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteDialog.apiId) return;

        try {
            const response = await apiDeleteSwagger(deleteDialog.apiId);
            if (response.success) {
                toast.push(
                    <Notification type="success" title="Success">
                        API deleted successfully
                    </Notification>
                );
                fetchAllSwaggers(); // Refresh the list
            }
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to delete API
                </Notification>
            );
        } finally {
            setDeleteDialog({ show: false });
        }
    };

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
                <Card 
                    key={rule._id} 
                    className="p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 bg-white rounded-xl"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h5 className="font-bold text-xl text-gray-900 tracking-tight">
                            {rule.info.title}
                        </h5>
                        <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold">
                            v{rule.info.version}
                        </span>
                         <Button
                        variant="plain"
                        className="text-red-500 hover:text-red-600"
                        size="sm"
                        onClick={() => handleDeleteClick(rule._id, rule.info.title)}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        }
                    />
                </div>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-2">
                        {rule.info.description || 'No description available'}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(rule.updatedAt).toLocaleString()}
                    </div>
                </Card>
            ))}
            </div>
            <Dialog
        isOpen={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false })}
    >
        <div className="px-6 py-4">
            <h4 className="mb-4">Confirm Deletion</h4>
            <p className="text-gray-500">
                Are you sure you want to delete the API "{deleteDialog.apiTitle}"? 
                This will also delete all associated requests. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
                <Button
                    variant="plain"
                    onClick={() => setDeleteDialog({ show: false })}
                >
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    customColorClass={({active,unclickable})=>classNames(
                                            'text-white hover:bg-red-600 dark:hover:bg-red-700 border-0 hover:ring-0',
                                            active ? 'bg-red-700' : 'bg-red-500',
                                            unclickable && 'opacity-50 cursor-not-allowed',
                                            !active && !unclickable && 'hover:bg-red-600',
                                        )}
                    onClick={handleConfirmDelete}
                >
                    Delete
                </Button>
            </div>
        </div>
    </Dialog>
        </div>
    )
}

export default Home
