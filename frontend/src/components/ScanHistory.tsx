import React, { useEffect ,useState} from 'react'
import { Card, Skeleton } from './ui'
import { Scan, apiGetAllScans } from '../services/ScansApiService'
import { useNavigate } from 'react-router-dom'

const statusColors = {
  completed: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-yellow-50 text-yellow-600',
  failed: 'bg-red-50 text-red-600'
} as const

const ScanHistory = () => {

  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()


  useEffect(()=>{
    const fetchScans = async () => {
      try {
        const response = await apiGetAllScans();
        console.log('ALL,',response)
        setScans(response.data)
      } catch (error) {
        console.error('Failed to fetch scans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchScans()
  },[])
  
  return (
    <div className="space-y-4">
      {scans.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No scan history available
        </Card>
      ) : (
        scans.map((scan) => (
          <Card
            key={scan._id}
            clickable={true}
            bordered={false}
            className="hover:shadow-lg transition-all duration-200 p-6 bg-white"
            onClick={() => navigate(`/scans/${scan._id}`)}
          >
            <div className="space-y-2">
              {/* Header with Name and Time */}
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h5 className="text-xl font-semibold text-gray-900 mb-1">
                    {scan.name}
                  </h5>
                  <span className="text-base text-gray-500">
                    Run on: {new Date(scan.startedAt).toLocaleDateString()} at{' '}
                    {new Date(scan.startedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full ${statusColors[scan.status]}`}>
                  <span className="font-medium capitalize">{scan.status}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex ">
                <div className="p-2">
                  <div className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-2">
                    Endpoints
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900 font-mono">
                    {scan.summary.totalEndpoints}
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-green-600 text-sm font-semibold tracking-wide uppercase mb-2">
                    Success
                  </div>
                  <div className="text-3xl font-extrabold text-green-600 font-mono">
                    {scan.summary.passedEndpoints}
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-red-600 text-sm font-semibold tracking-wide uppercase mb-2">
                    Failed
                  </div>
                  <div className="text-3xl font-extrabold text-red-600 font-mono">
                    {scan.summary.failedEndpoints}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {/* {scan.status === 'completed' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((scan.summary.passedEndpoints / scan.summary.totalEndpoints) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{
                        width: `${(scan.summary.passedEndpoints / scan.summary.totalEndpoints) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )} */}
            </div>
          </Card>
        ))
      )}
          <Card
            clickable={true}
            bordered={false}
            className="hover:shadow-lg transition-all duration-200 p-6 bg-white"
          >
            <div className="space-y-2">
              {/* Header with Name and Time */}
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h5 className="text-xl font-semibold text-gray-900 mb-1">Authentication Test</h5>
                    <span className="text-base text-gray-500">Run on: 4/3/25 at 12:00</span>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-blue-600 font-medium">Completed</span>
                </div>
              </div>
              
              {/* Stats Grid */}
                <div className="flex">
                <div className="p-2">
                  <div className="text-gray-600 text-sm font-semibold tracking-wide uppercase mb-2">Endpoints</div>
                  <div className="text-3xl font-extrabold text-gray-900 font-mono">5</div>
                </div>
                <div className="p-2">
                  <div className="text-green-600 text-sm font-semibold tracking-wide uppercase mb-2">Success</div>
                  <div className="text-3xl font-extrabold text-green-600 font-mono">3</div>
                </div>
                <div className="p-2">
                  <div className="text-red-600 text-sm font-semibold tracking-wide uppercase mb-2">Failed</div>
                  <div className="text-3xl font-extrabold text-red-600 font-mono">2</div>
                </div>
                </div>

              {/* Progress Bar */}
              {/* <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-gray-900">60%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: '60%' }}
                  ></div>
                </div>
              </div> */}
            </div>
          </Card>
        </div>
  )
}

export default ScanHistory
