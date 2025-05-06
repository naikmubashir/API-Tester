const yaml = require('js-yaml');
const axios= require('axios')
const Request = require('../models/Request');
const YamlRule = require('../models/YamlRule');
const ProcessedRequest = require('../models/ProcessedRequest');
 const applyRuleToRequest= async(requestId, ruleId, scanId)=>{
     // 1. Load both documents
  const [reqDoc, ruleDoc] = await Promise.all([
    Request.findById(requestId),
    YamlRule.findById(ruleId),
  ]);
  if (!reqDoc)  throw new Error('Request not found');
  if (!ruleDoc) throw new Error('Rule not found');
  console.log('QQQ',reqDoc);
  const newDoc=reqDoc.path.replace('{petId}', '1');
  console.log('NNN',newDoc)

  // 2. Parse the YAML into a JS object
  let ruleDefinition;
  try {
    ruleDefinition = yaml.load(ruleDoc.content);
    console.log("RRRR",ruleDefinition)
  } catch (err) {
    throw new Error('Invalid YAML in rule content');
  }

  // 3. Execute the rule logic
  //    (this is domain-specific:

  //match and replace
  console.log('object',reqDoc)
  const modifiedPath=ruleOne(reqDoc,'{petId}','1');
  console.log('mPATH',modifiedPath)
  // Create a new ProcessedRequest with the modified path
  const processed = new ProcessedRequest({
    path: modifiedPath,
    method: reqDoc.method,
    scan: scanId,
    request: {
        body: reqDoc.body,
        headers: reqDoc.headers,
        query: reqDoc.query
    }
  });
   // Make actual HTTP request
   try {
    const method = reqDoc.method?.toLowerCase() || 'get';
    const fullUrl = `${process.env.HOST}${modifiedPath}`;
    console.log("MMMModified",fullUrl)
    console.log("MMMModified",method)
    
    const response = await axios({
        method:method,
        url: fullUrl,
        headers: processed.request.headers,
        data: processed.request.body,
        params: processed.request.query
    });

    processed.response = {
        status: response.status,
        headers: response.headers,
        body: response.data
    };
} catch (error) {
    processed.response = {
        status: error.response?.status || 500,
        error: error.message
    };
}

return await processed.save();
  
}

const ruleOne=(originalRequest,matchText, replaceText)=>{
  return originalRequest.path.replace(matchText, replaceText);
}



const applyRuleToAllRequests= async (ruleId, scanId)=>{
  const [reqDocs, ruleDoc] = await Promise.all([
    Request.find(),
    YamlRule.findById(ruleId),
  ]);
  if (!ruleDoc) throw new Error('Rule not found');
  //const ruleDefinition = yaml.load(ruleDoc.content);
  const relevantRequests = reqDocs.filter(doc => doc.path.includes('{petId}'));

  // const promises = relevantRequests.map(reqDoc => {
  //   //const modifiedPath = ruleOne(reqDoc, ruleDefinition);
  //   const modifiedPath = ruleOne(reqDoc, '{petId','1');
  //   const processed = new ProcessedRequest({
  //     path: modifiedPath,
  //     methods: reqDoc.methods
  //   });
  //   return processed.save();
  // });
  // const results = await Promise.allSettled(promises);
  // results.forEach((res, i) => {
  //   if (res.status === 'fulfilled') {
  //     console.log(`Processed request ${i} saved:`, res.value);
  //   } else {
  //     console.error(`Failed to process request ${i}:`, res.reason);
  //   }
  // });
  

  const processedRequests = await Promise.all(
    relevantRequests.map(async (req) => {
        return await applyRuleToRequest(req._id, ruleId, scanId);
    })
  );


  return processedRequests;

}

const sendHttpRequestsToSavedPath= async(processedRequests)=>{
  for (const processed of processedRequests) {
    try {
      const method = Object.keys(processed.methods)[0] || 'get'; // e.g., 'post'
      const fullUrl = `${process.env.HOST}${processed.path}`;

      const response = await axios({
        method,
        url: fullUrl,
        // Optionally add data or headers here
      });

      console.log(`✅ ${method.toUpperCase()} ${processed.path} -> Status: ${response.status}`);
    } catch (err) {
      console.error(`❌ Error calling ${processed.path}:`, err.message);
    }
  }
}

module.exports= {applyRuleToRequest, applyRuleToAllRequests}