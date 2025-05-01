import { Card, Notification, toast } from '@/components/ui'
import { apiGetAllRequests } from '@/services/SwaggerApiService';
import React, { useEffect, useState } from 'react'

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
  return (
    <div>
      <h1 className='p-4'>Requests</h1>
      <div className=' space-y-2'>
        <Card>
            <span className='text-white bg-blue-500 p-2 rounded-lg'>GET</span> <code className='px-6 text-black'>/api/request/pet</code>
        </Card>
        {/* <Card>
            <span className='text-white bg-green-500 p-2 rounded-lg'>POST</span> <code className='px-6 text-black'>/api/request/pet</code>
        </Card>
        <Card>
            <span className='text-white bg-green-500 p-2 rounded-lg'>POST</span> <code className='text-black px-6'>/api/request/pet</code>
        </Card>
        <Card>
            <span className='text-white bg-yellow-500 p-2 rounded-lg'>PUT</span> <code className='px-6 text-black'>/api/request/pet</code>
        </Card>
        <Card>
            <span className='text-white bg-red-500 p-2 rounded-lg'>DELETE</span> <code className='px-6 text-black'>/api/request/pet</code>
        </Card> */}

        {
            requests.map((req:any)=>{ 
                const methodKeys = Object.keys(req.methods || {});
                
               
        
                // For each method, return a separate <li>
                return methodKeys.map((method: string) => { 
                    const colorClass = methodColors[method.toLowerCase()] || 'bg-gray-500';
                    return(<Card key={req.path+'-'+req.method}>
                        <span className={`text-white ${colorClass} p-2 rounded-lg`}>
                        {method.toUpperCase()}
                        </span> 
                        <code className='px-6 text-black'>
                        {req.path}
                        </code>
                         
                    </Card>)
                }
            
            
            );
            })
        }
        <Card>
            <span className='text-white bg-blue-500 p-2 rounded-lg'>GET</span> <code className='px-6 text-black'>/api/request/pet</code>
        </Card>
      </div>
    </div>
  )
}

export default Requests
