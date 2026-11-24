"""Cache Untapped character pages and extract dependency-free offline content."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, unquote, urljoin, urlparse
import json
import re
import sys
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'data/builds/source'
BASE = 'https://sts2.untapped.gg'
VOID = {'img', 'br', 'hr', 'meta', 'link', 'input', 'source', 'wbr', 'area', 'base', 'embed', 'param', 'track', 'col'}


class Node:
    def __init__(self, tag, attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self):
        return ''.join(child.text() if isinstance(child, Node) else child for child in self.children)


class Parser(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.root = self.current = Node('root')
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in VOID:
            self.current = node

    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, text):
        self.current.children.append(text)


def download(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read()


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower().replace("'", '').replace('’', '')).strip('-')


def main():
    SOURCE.mkdir(parents=True, exist_ok=True)
    ids = ['ironclad', 'silent', 'regent', 'necrobinder', 'defect', 'fool']
    urls = {'characters': BASE + '/en/characters', **{key: BASE + '/en/characters/' + key for key in ids[:-1]}, 'fool': BASE + '/en/cards/fool'}
    if '--refresh' in sys.argv:
        def fetch(item):
            key, url = item
            (SOURCE / (key + '.html')).write_bytes(download(url))
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(fetch, urls.items()))
    trees = {key: Parser((SOURCE / (key + '.html')).read_text(encoding='utf-8')).root for key in urls}
    assets_file = ROOT / 'data/builds/assets.json'
    assets = json.loads(assets_file.read_text(encoding='utf-8'))
    needed = {}

    def image(src):
        url = urljoin(BASE, src)
        parsed = urlparse(url)
        if parsed.path == '/_next/image':
            url = urljoin(BASE, parse_qs(parsed.query)['url'][0])
        if url.startswith('data:'):
            return url
        if url not in assets:
            path = urlparse(url).path
            filename = re.sub(r'[^a-zA-Z0-9._-]', '-', Path(path).name)
            assets[url] = 'assets/builds/images/' + sha256(url.encode()).hexdigest()[:10] + '-' + filename
        needed[url] = assets[url]
        return assets[url]

    cards = json.loads((ROOT / 'data/cards/english-details.json').read_text(encoding='utf-8'))['cards']
    by_slug = {}
    for card in cards:
        for name in [slug(card['name']), card['id'].lower().replace('_', '-'), urlparse(card.get('sourceEn', '')).path.split('/')[-1]]:
            by_slug[name] = card

    def link(href):
        url = urljoin(BASE, href)
        path = urlparse(url).path
        if path.startswith('/en/cards/'):
            card = by_slug.get(path.split('/')[-1])
            if card:
                return 'card.html#card-' + card['id']
        if path.startswith('/en/characters/'):
            return '#character-' + path.split('/')[-1]
        if path in ['/en/characters', '/en/cards/fool']:
            return '#characters' if path.endswith('characters') else '#character-fool'
        if '/relics' in path:
            return 'relic.html'
        if '/potions' in path:
            return 'potion.html'
        if path == '/en/cards':
            return 'card.html'
        return url

    def clean(node):
        if isinstance(node, str):
            return escape(node)
        tag, attrs = node.tag, node.attrs
        cls = attrs.get('class', '')
        if tag in ['script', 'style', 'template', 'svg', 'button', 'h1'] or attrs.get('role') == 'tooltip':
            return ''
        if 'CardImageBlock-' in cls and '__flexContainer' in cls:
            items = []
            for anchor in node.walk():
                if anchor.tag != 'a' or '/cards/' not in anchor.attrs.get('href', ''):
                    continue
                card = by_slug.get(anchor.attrs['href'].split('/')[-1])
                if card:
                    items.append('<div class="character-card-reference" data-card-id="' + card['id'] + '"></div>')
                else:
                    label = next((n.attrs.get('aria-label') for n in anchor.walk() if n.attrs.get('role') == 'img'), 'Card')
                    items.append('<a href="' + escape(link(anchor.attrs['href']), quote=True) + '">' + escape(label) + '</a>')
            return '<div class="character-card-group">' + ''.join(items) + '</div>'
        if 'CardBuilder-' in cls:
            return ''
        if tag == 'img':
            if not attrs.get('src'):
                return ''
            inline = any(parent.tag == 'a' for parent in parents(node))
            return '<img class="' + ('inline-resource' if inline else 'guide-image') + '" src="' + escape(image(attrs['src']), quote=True) + '" alt="' + escape(attrs.get('alt', ''), quote=True) + '" loading="lazy">'
        children = ''.join(clean(child) for child in node.children)
        if tag == 'a':
            href = link(attrs.get('href', ''))
            if not children.strip():
                return ''
            return '<a href="' + escape(href, quote=True) + '">' + children + '</a>'
        if tag in ['br', 'hr']:
            return '<' + tag + '>'
        if tag in ['p', 'div', 'span'] and not children.strip():
            return ''
        if tag not in ['p', 'div', 'span', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td']:
            return children
        return '<' + tag + '>' + children + '</' + tag + '>'

    index = trees['characters']
    grid = next(n for n in index.walk() if n.attrs.get('class', '').endswith('__characters'))
    entries = []
    for tile in grid.children:
        if not isinstance(tile, Node) or tile.tag != 'a':
            continue
        key = tile.attrs['href'].split('/')[-1]
        title = next(n.text().strip() for n in tile.walk() if n.tag == 'h2')
        tags = next((n for n in tile.walk() if n.attrs.get('class', '').endswith('__tags')), None)
        background = next(n.attrs['src'] for n in tile.walk() if n.tag == 'img')
        entry = {'id': key, 'name': title, 'source': urls[key], 'tags': [n.text().strip() for n in tags.children if isinstance(n, Node)] if tags else [], 'background': image(background)}
        if key != 'fool':
            rich = next(n for n in trees[key].walk() if n.attrs.get('class', '').startswith('RichText-') and n.attrs.get('class', '').endswith('__richText'))
            entry['content'] = ''.join(clean(n) for n in rich.children)
        else:
            entry['cards'] = []
            for node in trees[key].walk():
                if node.attrs.get('role') != 'img' or not node.attrs.get('class', '').startswith('CardBuilder-'):
                    continue
                if not node.parent.attrs.get('class', '').startswith('CardsGrid-'):
                    continue
                portrait = next((n for n in node.walk() if n.tag == 'img' and '/card_portraits/' in unquote(n.attrs.get('src', ''))), None)
                texts = [n.text().strip() for n in node.walk() if n.tag == 'text']
                description = next((n.text().strip() for n in node.walk() if n.attrs.get('class', '').endswith('__textContainer')), '')
                entry['cards'].append({'name': node.attrs['aria-label'], 'rarity': node.attrs.get('data-rarity'), 'type': node.attrs.get('data-type'), 'cost': texts[1] if len(texts) > 1 else '', 'description': description, 'image': image(portrait.attrs['src']) if portrait else None})
            assert len(entry['cards']) == 90, 'Fool card count changed; inspect source before updating'
        entries.append(entry)
    assert [entry['id'] for entry in entries] == ids

    def fetch_image(item):
        url, target = item
        path = ROOT / target
        if not path.exists():
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(download(url))
    with ThreadPoolExecutor(max_workers=6) as pool:
        list(pool.map(fetch_image, needed.items()))
    data = {'source': urls['characters'], 'checkedAt': datetime.now(timezone.utc).isoformat(), 'characters': entries}
    (ROOT / 'data/builds/characters.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    assets_file.write_text(json.dumps(assets, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Cached {len(entries)} characters, 90 Fool cards and {len(needed)} images.')


def parents(node):
    node = node.parent
    while node:
        yield node
        node = node.parent


if __name__ == '__main__':
    main()
