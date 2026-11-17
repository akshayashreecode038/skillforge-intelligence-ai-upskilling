import urllib.request
import re
import json

url = 'https://razorpay.com/buildathon/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
    print('Fetched HTML, length:', len(html))
    with open('buildathon.html', 'w', encoding='utf-8') as f:
        f.write(html)
    
    # search for image and video assets
    assets = re.findall(r'[\"\'\(]([^\s\"\'\(\)]+\.(?:jpg|jpeg|png|webp|mp4|webm|svg)(?:\?[^\s\"\'\(\)]+)?)[\"\'\)]', html, re.IGNORECASE)
    print('Assets found:', len(assets))
    for a in set(assets):
        print(a)
except Exception as e:
    print('Error:', e)
