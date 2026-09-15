#!/usr/bin/env python3
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
"""
sync_navbar.py - Static Navbar Synchronization Script
=====================================================

Reads `navbar.html` (the master source) and replaces the navbar block
in every HTML file across the project, adjusting relative paths based on
each file's directory depth.

Usage:
    python sync_navbar.py              # Sync all pages
    python sync_navbar.py --dry-run    # Preview changes without writing

The script looks for the navbar block bounded by:
    START marker:  <div class="navbar-container" id="navbarContainer">
    END marker:    </header>\n</div>

It preserves any <!-- NAVBAR --> comment that may precede the container.
"""

import os
import re
import sys
import argparse


# ─── CONFIGURATION ───────────────────────────────────────────────────────────

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
NAVBAR_SOURCE = os.path.join(ROOT_DIR, "navbar.html")

# Directories to scan for HTML files (relative to ROOT_DIR)
SCAN_DIRS = [".", "services", "calculators", "blog"]

# Files to skip
SKIP_FILES = {
    "navbar.html",
    "footer.html",
    "notifications.html",
    "whatsapp.html",
    "the_problem.html",
    "resources.html",
    "services.html",
}

# Regex pattern to match the full navbar block in target files
# Captures from <div class="navbar-container"...> through </header>\n</div>
NAVBAR_START_PATTERN = r'(<\!--\s*NAVBAR\s*-->\s*\n)?\s*<div class="navbar-container" id="navbarContainer">'
NAVBAR_END_LITERAL = "</header>\n</div>"


def read_file(path):
    """Read file with encoding detection."""
    for enc in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            with open(path, "r", encoding=enc) as f:
                return f.read()
        except (UnicodeDecodeError, UnicodeError):
            continue
    raise RuntimeError(f"Cannot read {path}")


def write_file(path, content):
    """Write file preserving line endings."""
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(content)


def get_prefix(html_file_path):
    """
    Compute the relative path prefix from the HTML file back to the project root.
    
    Root files (index.html, about.html, etc.)  → ""  (no prefix)
    services/foo.html                          → "../"
    calculators/foo.html                       → "../"
    blog/foo.html                              → "../"
    blog/sub/foo.html                          → "../../"
    """
    rel = os.path.relpath(ROOT_DIR, os.path.dirname(html_file_path))
    if rel == ".":
        return ""
    return rel.replace("\\", "/") + "/"


def adjust_paths(navbar_html, file_dir):
    """
    Adjust all href and src attributes in the navbar HTML to use
    the correct relative path from the target file's directory.
    
    The master navbar.html uses root-relative paths like:
        href="index.html"
        href="services/index.html"
        href="calculators/amazon-acos-calculator.html"
    
    For a file in calculators/:
        href="index.html"           -> href="../index.html"
        href="services/index.html"  -> href="../services/index.html"
        href="calculators/foo.html" -> href="foo.html"  (same directory!)
    """
    if os.path.normpath(file_dir) == os.path.normpath(ROOT_DIR):
        # Root-level file - no adjustment needed
        return navbar_html

    def replace_attr(match):
        attr = match.group(1)   # href= or src=
        quote = match.group(2)  # " or '
        url = match.group(3)    # the URL value

        # Skip absolute URLs, anchors, mailto, tel, javascript, etc.
        if url.startswith(("http://", "https://", "//", "#", "mailto:", "tel:", "javascript:")):
            return match.group(0)

        # Skip inline event handlers that got accidentally matched
        if "event." in url or "this." in url:
            return match.group(0)

        # Compute the absolute path of the linked resource (from root)
        # Strip any anchor from the URL for path computation
        url_path = url.split("#")[0]
        anchor = "#" + url.split("#")[1] if "#" in url else ""
        
        # The resource's absolute location (relative to project root)
        resource_abs = os.path.normpath(os.path.join(ROOT_DIR, url_path))
        
        # Compute relative path from the target file's directory
        rel_path = os.path.relpath(resource_abs, file_dir).replace("\\", "/")
        
        return f'{attr}{quote}{rel_path}{anchor}{quote}'

    # Match href="..." or src="..."
    result = re.sub(
        r'(href=|src=)(["\'])((?!https?://|//|#|mailto:|tel:|javascript:)[^"\']+)\2',
        replace_attr,
        navbar_html
    )

    return result


def extract_navbar_block(content):
    """
    Extract the navbar block from file content.
    Returns (start_pos, end_pos, has_comment_prefix).
    
    The block starts at:  <!-- NAVBAR --> (if present) or <div class="navbar-container"...>
    The block ends after: </header>\n</div>
    """
    # Find the start: look for <!-- NAVBAR --> comment first
    comment_match = re.search(r'<!--\s*NAVBAR\s*-->\s*\r?\n', content)
    
    # Find the container div
    container_match = re.search(r'<div class="navbar-container" id="navbarContainer">', content)
    
    if not container_match:
        return None  # No navbar in this file
    
    # Determine start position
    if comment_match and comment_match.end() <= container_match.start() + 10:
        # Comment exists right before container
        start_pos = comment_match.start()
        has_comment = True
    else:
        # No comment, start from container
        # But also capture leading whitespace on the same line
        line_start = content.rfind('\n', 0, container_match.start())
        start_pos = line_start + 1 if line_start >= 0 else container_match.start()
        has_comment = False
    
    # Find the end: </header> followed by </div>
    # Search from container_match position forward
    search_from = container_match.start()
    
    # Find </header>
    header_end = content.find("</header>", search_from)
    if header_end < 0:
        return None
    
    # After </header>, find the closing </div> for navbar-container
    after_header = header_end + len("</header>")
    
    # Skip whitespace/newlines to find </div>
    remaining = content[after_header:]
    div_match = re.match(r'\s*</div>', remaining)
    if div_match:
        end_pos = after_header + div_match.end()
    else:
        end_pos = after_header
    
    return (start_pos, end_pos, has_comment)


def build_navbar_for_file(master_html, html_file_path):
    """Build the correctly-pathed navbar block for a given file."""
    file_dir = os.path.dirname(os.path.abspath(html_file_path))
    adjusted = adjust_paths(master_html, file_dir)
    
    # Return the block with the NAVBAR comment prefix
    # No extra indentation — keep the master's formatting as-is
    return f"<!-- NAVBAR -->\n{adjusted.strip()}\n"


def sync_file(html_file_path, master_html, dry_run=False):
    """Sync a single HTML file's navbar with the master."""
    content = read_file(html_file_path)
    
    result = extract_navbar_block(content)
    if result is None:
        return False, "no navbar found"
    
    start_pos, end_pos, has_comment = result
    
    # Build the new navbar
    new_navbar = build_navbar_for_file(master_html, html_file_path)
    
    # Compare the existing navbar block with the new one (strip to ignore trailing whitespace)
    existing_navbar = content[start_pos:end_pos]
    if existing_navbar.strip() == new_navbar.strip():
        return False, "already up to date"
    
    # Replace the old navbar with the new one
    new_content = content[:start_pos] + new_navbar + content[end_pos:]
    
    if not dry_run:
        write_file(html_file_path, new_content)
    
    return True, "updated" if not dry_run else "would update"


def find_html_files():
    """Find all HTML files in the project that need navbar sync."""
    html_files = []
    
    for scan_dir in SCAN_DIRS:
        full_dir = os.path.join(ROOT_DIR, scan_dir) if scan_dir != "." else ROOT_DIR
        
        if not os.path.isdir(full_dir):
            continue
        
        for filename in os.listdir(full_dir):
            if not filename.endswith(".html"):
                continue
            if filename in SKIP_FILES:
                continue
            
            filepath = os.path.join(full_dir, filename)
            
            # Quick check: does this file contain navbar-container?
            try:
                content = read_file(filepath)
                if 'navbar-container' in content:
                    html_files.append(filepath)
            except Exception:
                continue
    
    return sorted(html_files)


def main():
    parser = argparse.ArgumentParser(
        description="Sync navbar.html across all project HTML files"
    )
    parser.add_argument(
        "--dry-run", 
        action="store_true",
        help="Preview changes without writing files"
    )
    parser.add_argument(
        "--file",
        help="Sync only a specific file (relative or absolute path)"
    )
    args = parser.parse_args()

    # Read the master navbar
    if not os.path.exists(NAVBAR_SOURCE):
        print(f"ERROR: Master navbar file not found: {NAVBAR_SOURCE}")
        sys.exit(1)

    master_html = read_file(NAVBAR_SOURCE)
    
    print("=" * 60)
    print("  NAVBAR SYNC SCRIPT")
    print("=" * 60)
    print(f"  Master: {NAVBAR_SOURCE}")
    print(f"  Mode:   {'DRY RUN (no files modified)' if args.dry_run else 'LIVE'}")
    print("=" * 60)
    print()

    # Find target files
    if args.file:
        target = os.path.abspath(args.file)
        if not os.path.exists(target):
            print(f"ERROR: File not found: {target}")
            sys.exit(1)
        html_files = [target]
    else:
        html_files = find_html_files()

    if not html_files:
        print("No HTML files with navbar found.")
        return

    updated = 0
    skipped = 0
    errors = 0

    for filepath in html_files:
        rel_path = os.path.relpath(filepath, ROOT_DIR)
        try:
            changed, reason = sync_file(filepath, master_html, dry_run=args.dry_run)
            prefix = get_prefix(filepath)
            status = "[OK]" if changed else "[--]"
            print(f"  {status} {rel_path:<55} [{reason}]  prefix='{prefix or './'}'")
            if changed:
                updated += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"  [ERR] {rel_path:<55} [ERROR: {e}]")
            errors += 1

    print()
    print("-" * 60)
    print(f"  Results: {updated} updated, {skipped} skipped, {errors} errors")
    print(f"  Total files scanned: {len(html_files)}")
    print("-" * 60)

    if args.dry_run and updated > 0:
        print("\n  Run without --dry-run to apply changes.")


if __name__ == "__main__":
    main()
