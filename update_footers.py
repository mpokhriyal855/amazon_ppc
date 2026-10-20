import os
import re

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

def process_file(file_path):
    rel_path = os.path.relpath(file_path, ROOT_DIR)
    
    # Skip template / already complete files if needed
    if rel_path in ['footer.html', 'navbar.html', 'notifications.html', 'whatsapp.html', 'terms.html']:
        return False, "Skipped"

    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original_content = content
    modified = False

    # Determine relative path to root based on directory depth
    depth = rel_path.count(os.sep)
    prefix = '../' * depth

    terms_href = f"{prefix}terms.html"

    # 1. Update <div class="footer-legal-links"> if terms.html is not already in it
    def update_legal_links(match):
        block = match.group(0)
        if 'terms.html' in block:
            return block
        
        # Match Privacy Policy inside this block
        # e.g. <a href="...privacy-policy.html" class="legal-pill">Privacy Policy</a>
        p_match = re.search(r'(<a\s+[^>]*href=["\']([^"\']*privacy-policy\.html)["\'][^>]*>[\s\S]*?</a>)', block)
        if p_match:
            full_a = p_match.group(1)
            target_href = p_match.group(2)
            # determine correct prefix for terms.html matching privacy-policy.html
            p_terms_href = target_href.replace('privacy-policy.html', 'terms.html')
            
            # Find indentation before </a> or before </div>
            terms_a = f'\n                <a href="{p_terms_href}" class="legal-pill">Terms &amp; Conditions</a>'
            new_block = block.replace(full_a, full_a + terms_a)
            return new_block
        return block

    content_new = re.sub(r'<div class=["\']footer-legal-links["\']>[\s\S]*?</div>', update_legal_links, content)
    if content_new != content:
        content = content_new
        modified = True

    # 2. Update <li><a href="...privacy-policy.html">Privacy Policy</a></li> in footer-links
    # Find li with privacy-policy.html
    def update_li(match):
        full_match = match.group(0)
        li_indent = match.group(1) or ""
        href = match.group(3)
        
        # Check if following content already has terms.html
        # We replace with both privacy policy and terms
        p_terms_href = href.replace('privacy-policy.html', 'terms.html')
        terms_li = f'\n{li_indent}<li><a href="{p_terms_href}">Terms &amp; Conditions</a></li>'
        return full_match + terms_li

    # Only replace if terms.html is not already right next to it or in the company list
    # Match <li> with privacy-policy.html that isn't already followed by terms.html
    pattern_li = r'([ \t]*)(<li>\s*<a\s+[^>]*href=["\']([^"\']*privacy-policy\.html)["\'][^>]*>Privacy Policy</a>\s*</li>)(?!\s*<li>\s*<a\s+[^>]*href=["\'][^"\']*terms\.html)'
    content_new = re.sub(pattern_li, update_li, content)
    if content_new != content:
        content = content_new
        modified = True

    # 3. Simple calculator footers with inline Privacy Policy link
    # e.g.: · <a href="../privacy-policy.html" style="color: inherit; text-decoration: underline;">Privacy Policy</a></p>
    def update_inline_privacy(match):
        full_match = match.group(0)
        prefix_chars = match.group(1)
        a_tag = match.group(2)
        href = match.group(3)
        style = match.group(4) or ""
        
        p_terms_href = href.replace('privacy-policy.html', 'terms.html')
        terms_tag = f' · <a href="{p_terms_href}"{style}>Terms &amp; Conditions</a>'
        return full_match + terms_tag

    pattern_inline = r'(·\s*)(<a\s+[^>]*href=["\']([^"\']*privacy-policy\.html)["\']([^>]*)>Privacy Policy</a>)(?!\s*·\s*<a\s+[^>]*href=["\'][^"\']*terms\.html)'
    content_new = re.sub(pattern_inline, update_inline_privacy, content)
    if content_new != content:
        content = content_new
        modified = True

    # 4. Calculators with plain <div class="footer-bottom"><p>...</p> and no privacy links
    if 'site-footer' in content and 'terms.html' not in content and 'privacy-policy.html' not in content:
        def add_legal_to_plain_p(match):
            inner_p = match.group(1)
            legal_snippet = f' · <a href="{prefix}privacy-policy.html" style="color: inherit; text-decoration: underline;">Privacy Policy</a> · <a href="{prefix}terms.html" style="color: inherit; text-decoration: underline;">Terms &amp; Conditions</a>'
            return f'<div class="footer-bottom">\n                <p>{inner_p}{legal_snippet}</p>'

        content_new = re.sub(r'<div class=["\']footer-bottom["\']>\s*<p>(.*?)</p>', add_legal_to_plain_p, content)
        if content_new != content:
            content = content_new
            modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, "Updated"
    else:
        return False, "No changes needed"

def main():
    updated = []
    skipped = []
    no_change = []

    for root, dirs, files in os.walk(ROOT_DIR):
        if any(d in root for d in ['.git', '.gemini', 'node_modules']):
            continue
        for f in files:
            if not f.endswith('.html'):
                continue
            path = os.path.join(root, f)
            rel = os.path.relpath(path, ROOT_DIR)
            mod, status = process_file(path)
            if mod:
                updated.append(rel)
            elif status == "Skipped":
                skipped.append(rel)
            else:
                no_change.append(rel)

    print(f"=== SUMMARY ===")
    print(f"Updated ({len(updated)}):")
    for u in sorted(updated):
        print(f"  + {u}")
    print(f"\nSkipped ({len(skipped)}):")
    for s in sorted(skipped):
        print(f"  - {s}")
    print(f"\nNo change needed ({len(no_change)}):")
    for nc in sorted(no_change):
        print(f"  . {nc}")

if __name__ == '__main__':
    main()
