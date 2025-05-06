import React, { useEffect } from 'react'
import { Card } from './ui'

const ScanHistory = () => {
  useEffect(()=>{
    
  },[])
  return (
    <div className="space-y-4">
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
