import re
from pathlib import Path

root = Path('client')
re_fetch = re.compile(r'fetch\s*\(')
updated_files = []

for path in sorted(root.rglob('*.ts*')):
    text = path.read_text(encoding='utf-8')
    if '/api' not in text or 'fetch' not in text:
        continue
    orig = text
    if 'import { api } from' not in text and re_fetch.search(text):
        lines = text.splitlines()
        insert_i = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                insert_i = i + 1
            elif line.strip() == '' and insert_i > 0:
                break
        lines.insert(insert_i, "import { api } from '@/utils/api';")
        text = '\n'.join(lines)

    def replace_call(start_index):
        s = text
        paren = s.find('(', start_index)
        if paren < 0:
            return None, start_index
        depth = 1
        j = paren + 1
        while j < len(s) and depth > 0:
            ch = s[j]
            if ch == '(':
                depth += 1
            elif ch == ')':
                depth -= 1
            elif ch in '"\'`':
                quote = ch
                j += 1
                while j < len(s) and s[j] != quote:
                    if s[j] == '\\':
                        j += 2
                        continue
                    j += 1
            j += 1
        call_text = s[start_index:j]
        if 'fetch' not in call_text:
            return None, j
        argtext = call_text[call_text.find('(')+1:-1]
        # split top-level
        depth = 0
        arg1 = None
        arg2 = None
        current = ''
        for ch in argtext:
            if ch in '{[(':
                depth += 1
            elif ch in '}])':
                depth -= 1
            if ch == ',' and depth == 0:
                arg1 = current.strip()
                current = ''
                continue
            current += ch
        if arg1 is None:
            arg1 = current.strip()
        else:
            arg2 = current.strip()
        if not arg1 or not (arg1.startswith(('/api', '"/api', "'/api", '`/api')) or '/api' in arg1):
            return None, j
        verb = 'get'
        body_expr = None
        extra_opts = None
        if arg2:
            method_match = re.search(r"method\s*:\s*['\"](GET|POST|PATCH|DELETE|PUT)['\"]", arg2, re.I)
            if method_match:
                verb = method_match.group(1).lower()
            body_match = re.search(r"body\s*:\s*JSON\.stringify\((.*?)\)\s*(,|$)", arg2, re.S)
            if body_match:
                body_expr = body_match.group(1).strip()
            else:
                body_match = re.search(r"body\s*:\s*(\{.*?\}|[\w\.]+)\s*(,|$)", arg2, re.S)
                if body_match:
                    body_expr = body_match.group(1).strip()
            opts = arg2
            opts = re.sub(r"method\s*:\s*['\"](?:GET|POST|PATCH|DELETE|PUT)['\"]\s*,?", '', opts, flags=re.I)
            opts = re.sub(r"body\s*:\s*JSON\.stringify\(.*?\)\s*,?", '', opts, flags=re.S)
            opts = re.sub(r"body\s*:\s*(\{.*?\}|[\w\.]+)\s*,?", '', opts, flags=re.S)
            opts = re.sub(r"headers\s*:\s*\{\s*['\"]Content-Type['\"]\s*:\s*['\"][^\"]*['\"]\s*\}\s*,?", '', opts, flags=re.I|re.S)
            opts = opts.strip()
            if opts.startswith('{') and opts.endswith('}'):
                inner = opts[1:-1].strip()
                if inner == '':
                    opts = ''
            extra_opts = opts if opts else None
        if verb == 'get' and not arg2:
            new = f'api.get({arg1})'
        elif verb in {'post','patch','put'}:
            if body_expr:
                new = f'api.{verb}({arg1}, {body_expr}{", " + extra_opts if extra_opts else ""})'
            else:
                new = f'api.{verb}({arg1})'
        elif verb == 'delete':
            if body_expr:
                if extra_opts:
                    new = f'api.delete({arg1}, {{ ...{extra_opts}, body: {body_expr} }})'
                else:
                    new = f'api.delete({arg1}, {{ body: {body_expr} }})'
            elif extra_opts:
                new = f'api.delete({arg1}, {extra_opts})'
            else:
                new = f'api.delete({arg1})'
        else:
            new = f'api.get({arg1})'
        return new, j

    i = 0
    while True:
        m = re_fetch.search(text, i)
        if not m:
            break
        replacement, newpos = replace_call(m.start())
        if replacement is not None:
            # find end of call for replacement again, naive
            start = m.start()
            paren = text.find('(', start)
            depth = 1
            end = paren + 1
            while end < len(text) and depth > 0:
                ch = text[end]
                if ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                elif ch in '"\'`':
                    quote = ch
                    end += 1
                    while end < len(text) and text[end] != quote:
                        if text[end] == '\\':
                            end += 2
                            continue
                        end += 1
                end += 1
            text = text[:start] + replacement + text[end:]
            i = start + len(replacement)
        else:
            i = newpos
    if text != orig:
        path.write_text(text, encoding='utf-8')
        updated_files.append(str(path))

print('Updated files:')
for f in updated_files:
    print(f)
print(f'Total: {len(updated_files)}')
