// ⚠️ IMPORTANT: Update this URL with your current ngrok URL
let PI_SERVER_URL = 'https://0a24-71-105-49-186.ngrok-free.app/processr'; // Replace with your current ngrok URL

// Request queue to prevent overlapping requests
let pendingRequests = 0;
const MAX_CONCURRENT_REQUESTS = 3;

// Function to update server URL when ngrok restarts
export function updateServerUrl(newUrl: string) {
  PI_SERVER_URL = newUrl.endsWith('/process') ? newUrl : `${newUrl}/process`;
  console.log('🔄 Updated Pi server URL to:', PI_SERVER_URL);
}

export async function detectObjects(base64Image: string, detectingObject: string = 'building', isFeedbackOnly: boolean = false) {
  if (pendingRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log('⏳ Skipping detection - too many pending requests');
    return [];
  }

  try {
    pendingRequests++;
    
    // EXACT format your Pi server expects (matching your test client)
    const payload = {
      image: base64Image,                    // 'image' field (not 'image_url')
      tasks: ["object_detection"],           // tasks array
      detect_class: detectingObject,         // 'detect_class' field
    };

    const requestType = isFeedbackOnly ? 'feedback' : 'detection';
    console.log(`🔍 ${requestType}: ${detectingObject}...`);
    
    const response = await fetch(PI_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('🔧 Pi Server Response:', result);
    
    // Your server returns 'bounding_boxes' array (as shown in your test client)
    if (result && Array.isArray(result.bounding_boxes)) {
      const objects = result.bounding_boxes.map(box => ({
        x_min: box.x_min,
        y_min: box.y_min,
        x_max: box.x_max,
        y_max: box.y_max,
        label: box.label
      }));
      
      const detectedCount = objects.length;
      console.log(`✅ ${requestType}: ${detectedCount} ${detectingObject}(s)`);
      
      return objects;
    } else {
      console.warn('⚠️ No bounding_boxes found:', result);
      return [];
    }
    
  } catch (error) {
    console.error(`❌ Error in ${isFeedbackOnly ? 'feedback' : 'detection'}:`, error.message);
    
    if (isFeedbackOnly) {
      return [];
    }
    throw error;
  } finally {
    pendingRequests--;
  }
}

export async function captionImage(base64Image: string, isFeedbackOnly: boolean = false) {
  if (pendingRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log('⏳ Skipping caption - too many requests');
    return isFeedbackOnly ? 'Processing...' : 'Too many requests';
  }

  try {
    pendingRequests++;
    
    // EXACT format your Pi server expects for VQA
    const payload = {
      image: base64Image,
      tasks: ["vqa"],                        // VQA task
      question: isFeedbackOnly 
        ? "What do you see?" 
        : "Describe this scene in detail, focusing on architecture and buildings.",
    };

    const requestType = isFeedbackOnly ? 'feedback' : 'caption';
    console.log(`📝 ${requestType}...`);
    
    const response = await fetch(PI_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('🔧 VQA Response:', result);
    
    // Your server should return VQA answer (check what field name your server uses)
    if (result && result.vqa_answer) {
      console.log(`✅ ${requestType}:`, result.vqa_answer);
      return result.vqa_answer;
    } else if (result && result.answer) {
      // Alternative field name if your server uses 'answer'
      console.log(`✅ ${requestType}:`, result.answer);
      return result.answer;
    } else {
      console.warn('⚠️ No VQA answer found:', result);
      return 'No description generated';
    }
  } catch (error) {
    console.error(`❌ Error in ${isFeedbackOnly ? 'feedback' : 'caption'}:`, error.message);
    
    if (isFeedbackOnly) {
      return 'Error processing';
    }
    throw error;
  } finally {
    pendingRequests--;
  }
}

// Optional: Landmark detection using Google Vision on your Pi
export async function detectLandmarks(base64Image: string) {
  if (pendingRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log('⏳ Skipping landmark detection - too many pending requests');
    return [];
  }

  try {
    pendingRequests++;
    
    // EXACT format for landmark detection
    const payload = {
      image: base64Image,
      tasks: ["landmark_detection"],
    };

    console.log('🏛️ Detecting landmarks...');
    
    const response = await fetch(PI_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('🔧 Landmark Response:', result);
    
    if (result && Array.isArray(result.landmarks)) {
      console.log(`✅ Found ${result.landmarks.length} landmarks`);
      return result.landmarks;
    } else {
      console.warn('⚠️ No landmarks found');
      return [];
    }
  } catch (error) {
    console.error('❌ Error in landmark detection:', error.message);
    return [];
  } finally {
    pendingRequests--;
  }
}

// Combined detection (uses all 3 tasks like your test client)
export async function detectAll(base64Image: string, detectingObject: string = 'building') {
  if (pendingRequests >= MAX_CONCURRENT_REQUESTS) {
    console.log('⏳ Skipping combined detection - too many pending requests');
    return { objects: [], landmarks: [], caption: '' };
  }

  try {
    pendingRequests++;
    
    // EXACT format matching your test client
    const payload = {
      image: base64Image,
      tasks: ["object_detection", "vqa", "landmark_detection"],  // All 3 tasks
      question: "Describe this architectural scene, focusing on historical and notable features.",
      detect_class: detectingObject,
    };

    console.log('🔍 Running combined detection...');
    
    const response = await fetch(PI_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('🔧 Combined Response:', result);
    
    return {
      objects: result.bounding_boxes || [],
      landmarks: result.landmarks || [],
      caption: result.vqa_answer || result.answer || '',
    };
  } catch (error) {
    console.error('❌ Error in combined detection:', error.message);
    return { objects: [], landmarks: [], caption: '', error: error.message };
  } finally {
    pendingRequests--;
  }
}

export async function testApiConnectivity() {
  try {
    console.log('🔍 Testing Pi server connectivity...');
    
    // Simple test matching your test client format
    const testImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const payload = {
      image: testImage,
      tasks: ["vqa"],
      question: "What is this?"
    };
    
    const response = await fetch(PI_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log('❌ Pi server test failed:', response.status);
      return { success: false, status: 'error' };
    }

    const result = await response.json();
    console.log('🔧 Pi Server Test Result:', result);
    
    if (result.vqa_answer || result.answer) {
      console.log('✅ Pi server is working correctly');
      return { success: true, status: 'ready' };
    } else {
      console.log('❌ Pi server test failed:', result);
      return { success: false, status: 'error' };
    }
  } catch (error) {
    console.error('❌ Pi server connectivity test failed:', error);
    return { success: false, status: 'error' };
  }
}

// Utility function to get current pending requests count
export function getPendingRequestsCount() {
  return pendingRequests;
}