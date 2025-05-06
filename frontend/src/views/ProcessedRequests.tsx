import { Button, Card, Notification, Skeleton, toast } from '@/components/ui';
import { apiGetAllProcessedRequests } from '@/services/ProcessedRequestsApiService';
import React, { useEffect, useState } from 'react'


interface ProcessedRequest {
  _id: string;
  path: string;
  methods: string;
  response: {
      status: number;
      headers: Record<string, string>;
      body: any;
  };
  scan?: string;
  createdAt: string;
}

const ProcessedRequests = () => {
  const methodColors: Record<string, string> = {
    get: 'bg-blue-500',
    post: 'bg-green-500',
    put: 'bg-yellow-500',
    delete: 'bg-red-500',
    patch: 'bg-purple-500',
  };
  const statusCodeColors: Record<string, string> = {
    '2xx': 'text-green-600 ',
    '3xx': 'text-blue-600',
    '4xx': 'text-yellow-600',
    '5xx': 'text-red-600',
};
const getStatusColorClass = (status: number) => {
  const statusClass = `${Math.floor(status / 100)}xx`;
  return statusCodeColors[statusClass] || 'text-gray-600 font-semibold';
};

  const [loadingRequests, setLoadingRequests]=useState<boolean>(false);
      const [requests, setRequests]=useState<ProcessedRequest[]>([]);
  
  const fetchProcessedRequests=async()=>{
    setLoadingRequests(true);
    try{
        const response = await apiGetAllProcessedRequests();
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

  useEffect(()=>{
    fetchProcessedRequests();
  },[]);

  if (loadingRequests) {
    return (
        <div className="p-6 space-y-4">
            {[...Array(3)].map((_, index) => (
                <Skeleton key={index} height={80} />
            ))}
        </div>
    );
}
  return (
    <div className="p-6 space-y-6">
            <h1 className='p-4'>Processed Requests</h1>
            <div className=' space-y-2'>

              {(requests.length==0)&& (
                <div>No processed request</div>
              )}

      {
            requests.map((req:any)=>{ 
                const statusColorClass = getStatusColorClass(req.response?.status);
                // For each method, return a separate <li>

                    const colorClass = methodColors[req.method.toLowerCase()] || 'bg-gray-500';
                    return(
                    <Card key={req._id} >
                        <div className='flex'>
                            <div>

                            <span className={`text-white ${colorClass} p-2 rounded-lg`}>
                                {req.method.toUpperCase()}
                            </span>
                            <code className='px-6 text-black'>
                                {req.path}
                            </code>
                            </div>
                            <div className={`ml-auto px-3 py-1 rounded-lg font-semibold ${statusColorClass}`}>
                        {req.response?.status || 'N/A'}
                        </div>                      
                        </div>
                    </Card>
                    )

            
            
            
            })
        }
        </div>
    </div>
  )
}

export default ProcessedRequests
