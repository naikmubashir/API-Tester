import { Button, Card, Notification, toast } from '@/components/ui'
import { apiGetAllRequests } from '@/services/SwaggerApiService';
import React, { useEffect, useState } from 'react'
import { apiDeleteRequest, apiDeleteAllRequests } from '@/services/SwaggerApiService'

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


    
    // Delete single request
    const handleDeleteRequest = async (id: string) => {
    try {
        const response = await apiDeleteRequest(id);
        console.log('re',response)
        if (response?.success) {
            toast.push(
                <Notification type="success" title="Success">
                    Request deleted successfully
                </Notification>
            )
            fetchRequests(); // Refresh the list
        }
    } catch (error) {
        toast.push(
            <Notification type="danger" title="Error">
                Failed to delete request
            </Notification>
        )
    }
}

// Delete all requests
const handleDeleteAll = async () => {
    try {
        const response = await apiDeleteAllRequests()
        console.log('RESPNDDD',response)
        if (response?.success) {
            toast.push(
                <Notification type="success" title="Success">
                    All requests deleted successfully
                </Notification>
            )
            setRequests([]); // Clear the list
            //await fetchRequests();
        }
    } catch (error) {
        toast.push(
            <Notification type="danger" title="Error">
                Failed to delete requests
            </Notification>
        )
    }
}

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
                                <div className="flex items-center gap-4">
                                    <span className={`${methodColors[req.method.toLowerCase()] || 'bg-gray-500'} text-white px-3 py-1 rounded-lg text-sm font-medium`}>
                                        {req.method.toUpperCase()}
                                    </span>
                                    <code className="text-gray-700">
                                        {req.path}
                                    </code>
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
    </div>
  )
}

export default Requests;
