const https = require('https');
https.get('https://raw.githubusercontent.com/d3/d3-geo/master/test/data/world-110m.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(Object.keys(json));
      const nepal = json.objects.countries.geometries.find(g => g.id === '524'); // 524 is Nepal's ISO code
      console.log(nepal);
    } catch(e) { console.log("JSON Error", e.message); }
  });
});
