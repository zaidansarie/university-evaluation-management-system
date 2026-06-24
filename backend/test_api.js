async function testAPIs() {
  const BASE_URL = 'http://localhost:5000/api/faculty';
  console.log('--- Starting API Verification ---');

  try {
    // 1. Test POST /api/faculty
    console.log('\nTesting POST /api/faculty...');
    const postRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Professor',
        email: 'testprof' + Date.now() + '@university.edu', // Unique email
        department: 'Computer Science',
        phone_number: '1234567890'
      })
    });
    const postData = await postRes.json();
    console.log('Response:', postData);
    
    if (!postRes.ok) throw new Error('POST failed');
    const newId = postData.id;

    // 2. Test GET /api/faculty
    console.log('\nTesting GET /api/faculty...');
    const getRes = await fetch(BASE_URL);
    const getData = await getRes.json();
    console.log('Faculty Count:', getData.length);
    if (!getRes.ok) throw new Error('GET failed');

    // 3. Test DELETE /api/faculty/:id
    console.log(`\nTesting DELETE /api/faculty/${newId}...`);
    const deleteRes = await fetch(`${BASE_URL}/${newId}`, { method: 'DELETE' });
    const deleteData = await deleteRes.json();
    console.log('Response:', deleteData);
    if (!deleteRes.ok) throw new Error('DELETE failed');

    console.log('\n✅ All APIs are working correctly!');
  } catch (error) {
    console.error('\n❌ API Verification Failed:', error.message);
  }
}

testAPIs();
