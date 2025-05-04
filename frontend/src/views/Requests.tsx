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
        const response = await apiDeleteRequest(id)
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
        {
            requests.map((req:any)=>{ 
                const methodKeys = Object.keys(req.methods || {});
                
               
        
                // For each method, return a separate <li>
                return methodKeys.map((method:string) => { 
                    const colorClass = methodColors[method.toLowerCase()] || 'bg-gray-500';
                    return(
                    <Card key={req.path+'-'+req.method}>
                        <span className={`text-white ${colorClass} p-2 rounded-lg`}>
                        {method.toUpperCase()}
                        </span> 
                        <code className='px-6 text-black'>
                        {req.path}
                        </code>
                        <Button 
                            variant="plain" 
                            className="ml-auto" 
                            onClick={() => handleDeleteRequest(req.id)}
                            size="sm"
                        >
                            Delete Request
                        </Button>
                    </Card>
                    )
                }
            
            
            );
            })
        }
       
      </div>
    </div>
  )
}

export default Requests
