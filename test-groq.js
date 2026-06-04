const data = JSON.stringify({
  influencers: 10,
  activeInfluencers: 5,
  totalCost: 1000,
  totalConversions: 10,
  cpa: 100
});

fetch('http://localhost:3000/api/groq', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: data,
})
.then(response => response.json())
.then(data => console.log(data))
.catch((error) => console.error('Error:', error));
