import CreateScan from '@/components/CreateScan'
import ScanHistory from '@/components/ScanHistory'
import { Button, Card, Dropdown, Notification, toast } from '@/components/ui'
import { apiGetAllRequests } from '@/services/SwaggerApiService'
import { apiGetAllRules, Rule } from '@/services/RulesApiService'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


const Scan = () => {

  const navigate = useNavigate()
  const [newScan, setNewScan]=useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNewScan=()=>{
    console.log('Opening new view')
    // navigate('/newscan');
    setNewScan(true)

  }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [rulesResponse, requestsResponse] = await Promise.all([
                    apiGetAllRules(),
                    apiGetAllRequests()
                ]);
                setRules(rulesResponse.data as Rule[] || []);
                console.log("RUL",rules)
                setRequests(requestsResponse.data || []);
            } catch (error) {
                toast.push(
                    <Notification type="danger" title="Error">
                        Failed to fetch required data
                    </Notification>
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
  return (
    <div className="p-6 space-y-6">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">API Scans</h1>
          <p className="text-gray-500 text-lg">Monitor and manage your API security scans</p>
          
        </div>
      </div>

      {/* History Section */}
      
<div >
  <Button 
    onClick={() => setNewScan(false)}
    shape='none'
    variant="solid"
    size="lg"
    className={`w-1/2 px-6 py-2.5 mr-0 font-semibold shadow-sm rounded-l-lg border border-gray-200 ${
      !newScan 
        ? 'bg-slate-700 text-white hover:bg-slate-800' 
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }`}
    
  >
    Scan History
  </Button>
  <Button 
    onClick={() => setNewScan(true)}
    variant="solid"
    size="lg"
    shape='none'
    className={`rounded-r-lg w-1/2 px-6 ml-0 py-2.5 font-semibold shadow-sm  border border-gray-200 ${
      newScan 
        ? 'bg-slate-700 text-white hover:bg-slate-800' 
        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
    }`}
  >
    New Scan
  </Button>
</div>

      <div>
        {
          newScan
          ?(

            <CreateScan 
            rules={rules} 
            requests={requests}
            onCancel={() => navigate('/scans')}
        />
          )
          :(

            <ScanHistory/>
          )
        }
      </div>
    </div>
  )
}

export default Scan