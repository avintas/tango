// Quick test to check if the content_tags API is working
// Run this in browser console on your sourcing page

fetch('/api/content-tags', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('sb-access-token') || 'test'}`,
  },
})
  .then(response => response.json())
  .then(data => {
    console.log('Tags API Response:', data);
    if (data.success) {
      console.log('✅ API working, found', data.data.length, 'tags');
    } else {
      console.log('❌ API error:', data.error);
    }
  })
  .catch(error => {
    console.log('❌ Fetch error:', error);
  });
