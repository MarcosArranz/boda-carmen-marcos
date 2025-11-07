export default async function handler(req, res) {
  const CLIENT_ID = 'e1b1fc73e4eb4063bfd311e3c8e48de1';
  const CLIENT_SECRET = '5e65ba3e8e40410785dbe48949b978b8';
  const PLAYLIST_ID = '4YDbETDreYWPudra7QaPfk';

  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Obtener token
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'No token' });
    }

    // Obtener playlist
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      }
    );

    const playlistData = await playlistResponse.json();
    
    return res.status(200).json(playlistData);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
