"""Cache Traditional Chinese translations of the public Jorbs commentary."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from hashlib import sha256
from pathlib import Path
import json
import time
import urllib.parse
import urllib.request

root = Path(__file__).resolve().parents[2]
source = json.loads((root / 'data/cards/creator-comments.json').read_text(encoding='utf-8'))
destination = root / 'data/cards/creator-comments-zh-TW.json'
data = json.loads(destination.read_text(encoding='utf-8')) if destination.exists() else {
    'language': 'zh-TW', 'provider': 'Google Translate', 'comments': {}
}


def translate(item):
    key, comment = item
    text = comment['text']
    digest = sha256(text.encode()).hexdigest()
    previous = data['comments'].get(key)
    if previous and previous['sourceHash'] == digest:
        return key, previous
    query = urllib.parse.urlencode({'client': 'gtx', 'sl': 'en', 'tl': 'zh-TW', 'dt': 't', 'q': text})
    for attempt in range(4):
        try:
            request = urllib.request.Request('https://translate.googleapis.com/translate_a/single?' + query,
                                             headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(request, timeout=40) as response:
                result = json.load(response)
            translated = ''.join(part[0] for part in result[0] if part[0])
            assert translated.strip(), key
            return key, {'sourceHash': digest, 'text': translated}
        except Exception:
            if attempt == 3:
                raise
            time.sleep(attempt + 1)


with ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(translate, item) for item in source['comments'].items()]
    for index, future in enumerate(as_completed(futures), 1):
        key, translation = future.result()
        data['comments'][key] = translation
        destination.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        if index % 50 == 0 or index == len(futures):
            print(f'Translated {index}/{len(futures)}', flush=True)
