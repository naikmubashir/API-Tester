import { Button, Card, Notification, toast,Dialog } from '@/components/ui'
import { apiGetAllRequests } from '@/services/SwaggerApiService';
import React, { useEffect, useState } from 'react'
import { apiDeleteRequest, apiDeleteAllRequests } from '@/services/SwaggerApiService'
import classNames from '@/utils/classNames';

const Requests = () => {
    const methodColors: Record<string, string> = {
        get: 'bg-blue-500',
        post: 'bg-green-500',
        put: 'bg-yellow-500',
        delete: 'bg-red-500',
        patch: 'bg-purple-500',
      };

    const [loadingRequests, setLoadingRequests]=useState<boolean>(false);
    const [requests, setRequests]=useState([]);
    const [deleteDialog, setDeleteDialog] = useState<{
        show: boolean;
        requestId?: string;
        isDeleteAll?: boolean;
    }>({show: false});
    useEffect(()=>{
        fetchRequests();
    },[])
    const fetchRequests= async ()=>{
        setLoadingRequests(true);
        try{
            const response = await apiGetAllRequests();
            setRequests(response.data)
            console.log('RR',response)
        }catch(err){
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to fetch YAML rules
                </Notification>
            );
        }finally{
            setLoadingRequests(false);
        }
    }


    
    const handleDeleteRequest = async (id: string) => {
        setDeleteDialog({
            show: true,
            requestId: id,
            isDeleteAll: false
        });
    };

    const handleDeleteAll = () => {
        setDeleteDialog({
            show: true,
            isDeleteAll: true
        });
    };

    const handleConfirmDelete = async () => {
        try {
            if (deleteDialog.isDeleteAll) {
                const response = await apiDeleteAllRequests();
                if (response?.success) {
                    toast.push(
                        <Notification type="success" title="Success">
                            All requests deleted successfully
                        </Notification>
                    );
                    setRequests([]);
                }
            } else if (deleteDialog.requestId) {
                const response = await apiDeleteRequest(deleteDialog.requestId);
                if (response?.success) {
                    toast.push(
                        <Notification type="success" title="Success">
                            Request deleted successfully
                        </Notification>
                    );
                    fetchRequests();
                }
            }
        } catch (error) {
            toast.push(
                <Notification type="danger" title="Error">
                    Failed to delete request(s)
                </Notification>
            );
        } finally {
            setDeleteDialog({ show: false });
        }
    };

  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">

      <h1 className='p-4'>Requests</h1>
      <Button onClick={handleDeleteAll}>Delete All Requests </Button>
        </div>
      <div className=' space-y-2'>
      {requests.length === 0 ? (
                    <Card className="p-4 text-center text-gray-500">
                        No requests found
                    </Card>
                ) : (
                    requests.map((req) => (
                        <Card key={req._id} className="hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center justify-between ">
                                <div>

                                <div className="flex items-center gap-4">
                                    <span className={`${methodColors[req.method.toLowerCase()] || 'bg-gray-500'} text-white px-3 py-1 rounded-lg text-sm font-medium`}>
                                        {req.method.toUpperCase()}
                                    </span>
                                    <code className="text-gray-700">
                                       {req.apiInfo?.host+req.path}
                                    </code>
                                </div>


                                    <div className="text-sm text-gray-500 ml-20">{req.apiInfo?.fullName || 'N/A'}</div>

                                </div>
                                <Button 
                                    variant="plain"
                                    onClick={() => handleDeleteRequest(req._id)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
       
      </div>
      <Dialog
                isOpen={deleteDialog.show}
                onClose={() => setDeleteDialog({ show: false })}
            >
                <div className="px-6 py-4">
                    <h4 className="mb-4">Confirm Deletion</h4>
                    <p className="text-gray-500">
                        {deleteDialog.isDeleteAll 
                            ? 'Are you sure you want to delete all requests? This action cannot be undone.'
                            : 'Are you sure you want to delete this request? This action cannot be undone.'}
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

export default Requests;
