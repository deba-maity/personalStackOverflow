"""No network calls: verify preservation of source content during ingestion."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('importer', Path(__file__).resolve().parents[1] / 'scripts' / 'import_stackoverflow.py')
importer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(importer)


class ImporterTests(unittest.TestCase):
    def test_published_credential_shapes_are_redacted(self):
        sample = 'demo-SBX-examplecredential123 and SBX-examplecertificate456'
        self.assertEqual(importer.redact_credentials(sample), '[credential removed] and [credential removed]')

    def test_code_whitespace_and_entities_survive(self):
        blocks = importer.Body('<p>Use &lt;T&gt;.</p><pre><code>if (a &lt; b) {\n  return "&amp;";\n}</code></pre><p>Done.</p>').blocks
        self.assertEqual(blocks[1], {'type': 'code', 'text': 'if (a < b) {\n  return "&";\n}'})
        self.assertEqual(blocks[0]['text'], 'Use <T>.')
        self.assertEqual(blocks[2]['text'], 'Done.')

    def test_links_images_and_lists_keep_meaning_without_remote_elements(self):
        blocks = importer.Body('<p>See <a href="/a/123">answer</a>.</p><ul><li>First</li><li>Second</li></ul><img src="https://example.org/x.png" alt="diagram">').blocks
        text = importer.body_text(blocks)
        self.assertIn('https://stackoverflow.com/a/123', text)
        self.assertIn('• First\n• Second', text)
        self.assertIn('diagram — https://example.org/x.png', text)

    def test_untrusted_html_is_only_text_data(self):
        blocks = importer.Body('<p onclick="alert(1)">Example</p><script>alert(2)</script><a href="javascript:alert(3)">bad</a>').blocks
        text = importer.body_text(blocks)
        self.assertNotIn('javascript:', text)
        self.assertNotIn('onclick', text)
        self.assertTrue(all(set(b) == {'type', 'text'} for b in blocks))


if __name__ == '__main__':
    unittest.main()
