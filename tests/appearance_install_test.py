"""Exercise real profile installation and rollback, without a mail account."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import importlib.util
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'scripts' / 'install_appearance.py'
PREF = 'user_pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);'


class AppearanceInstallTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.profile = self.root / 'profile'
        self.profile.mkdir()
        (self.profile / 'prefs.js').write_text('user_pref("mail.example", 7);\n')
        self.app = self.root / 'application.ini'
        self.app.write_text('[App]\nName=Thunderbird\nVersion=157.0.1\nBuildID=20261001134409\n')
        self.style = self.root / 'appearance.css'
        self.style.write_text('#folderPane { color: navy; }\n')

    def run_command(self, mode):
        return subprocess.run([
            sys.executable, str(SCRIPT), mode, '--profile', str(self.profile),
            '--app-info', str(self.app), '--stylesheet', str(self.style),
        ], capture_output=True, text=True)

    def install(self):
        result = self.run_command('install')
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_install_preserves_existing_customizations_and_mail_preferences(self):
        chrome = self.profile / 'chrome'
        chrome.mkdir()
        original = b'/* user styles */\n#custom { color: red; }\n'
        (chrome / 'userChrome.css').write_bytes(original)
        self.install()
        self.assertTrue((chrome / 'userChrome.css').read_bytes().endswith(original))
        self.assertEqual((chrome / 'thunderstream.css').read_bytes(), self.style.read_bytes())
        self.assertIn('user_pref("mail.example", 7);', (self.profile / 'prefs.js').read_text())
        self.assertIn(PREF, (self.profile / 'prefs.js').read_text())

    def test_repeated_install_and_remove_restore_exact_original_files(self):
        chrome = self.profile / 'chrome'
        chrome.mkdir()
        original = b'#custom { color: red; }\n'
        (chrome / 'userChrome.css').write_bytes(original)
        original_prefs = (self.profile / 'prefs.js').read_bytes()
        self.install()
        self.install()
        result = self.run_command('remove')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((chrome / 'userChrome.css').read_bytes(), original)
        self.assertEqual((self.profile / 'prefs.js').read_bytes(), original_prefs)
        self.assertFalse((chrome / 'thunderstream.css').exists())

    def test_remove_keeps_customizations_added_after_installation(self):
        self.install()
        css = self.profile / 'chrome' / 'userChrome.css'
        css.write_bytes(css.read_bytes() + b'#new-user-style { color: green; }\n')
        prefs = self.profile / 'prefs.js'
        prefs.write_text(prefs.read_text() + 'user_pref("mail.new", 8);\n')
        result = self.run_command('remove')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(css.read_bytes(), b'#new-user-style { color: green; }\n')
        self.assertIn('user_pref("mail.new", 8);', prefs.read_text())
        self.assertNotIn('legacyUserProfileCustomizations', prefs.read_text())

    def test_unsupported_build_leaves_profile_untouched(self):
        self.app.write_text('[App]\nName=Thunderbird\nVersion=158.0\nBuildID=new-build\n')
        original = (self.profile / 'prefs.js').read_bytes()
        result = self.run_command('install')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Unsupported Thunderbird build', result.stderr)
        self.assertEqual((self.profile / 'prefs.js').read_bytes(), original)
        self.assertFalse((self.profile / 'chrome').exists())

    def test_remove_restores_previous_stylesheet_preference(self):
        original = 'user_pref("mail.example", 7);\nuser_pref("toolkit.legacyUserProfileCustomizations.stylesheets", false);\n'
        (self.profile / 'prefs.js').write_text(original)
        self.install()
        result = self.run_command('remove')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((self.profile / 'prefs.js').read_text(), original)

    def load_installer(self):
        spec = importlib.util.spec_from_file_location('appearance_installer', SCRIPT)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_failed_install_restores_files_and_allows_retry(self):
        module = self.load_installer()
        original = (self.profile / 'prefs.js').read_bytes()
        write = module.atomic_write
        def fail_css(path, data):
            if path.name == 'userChrome.css':
                raise OSError('injected write failure')
            return write(path, data)
        with patch.object(module, 'atomic_write', side_effect=fail_css):
            with self.assertRaises(OSError):
                module.apply('install', self.profile, self.app, self.style)
        self.assertEqual((self.profile / 'prefs.js').read_bytes(), original)
        self.assertFalse((self.profile / 'chrome' / 'thunderstream.css').exists())
        self.assertFalse((self.profile / 'chrome' / 'thunderstream-appearance.json').exists())
        self.install()

    def test_failed_removal_restores_installed_files_and_allows_retry(self):
        self.install()
        module = self.load_installer()
        chrome = self.profile / 'chrome'
        original = {p: p.read_bytes() for p in [self.profile / 'prefs.js', chrome / 'userChrome.css', chrome / 'thunderstream.css', chrome / 'thunderstream-appearance.json']}
        real_unlink = Path.unlink
        def fail_skin_unlink(path, *args, **kwargs):
            if path.name == 'thunderstream.css':
                raise OSError('injected removal failure')
            return real_unlink(path, *args, **kwargs)
        with patch.object(Path, 'unlink', fail_skin_unlink):
            with self.assertRaises(OSError):
                module.apply('remove', self.profile, self.app, self.style)
        for path, data in original.items():
            self.assertEqual(path.read_bytes(), data)
        self.assertEqual(self.run_command('remove').returncode, 0)

    def test_remove_refuses_to_discard_user_edits_to_managed_stylesheet(self):
        self.install()
        css = self.profile / 'chrome' / 'thunderstream.css'
        css.write_text('#user-edit { color: teal; }\n')
        result = self.run_command('remove')
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(css.read_text(), '#user-edit { color: teal; }\n')
        self.assertTrue((self.profile / 'chrome' / 'thunderstream-appearance.json').exists())

    def test_interrupted_update_recovers_after_new_state_precedes_stylesheet(self):
        self.install()
        module = self.load_installer()
        self.style.write_text('#updated { color: orange; }\n')
        write = module.atomic_write
        def interrupt_after_state(path, data):
            write(path, data)
            if path.name == 'thunderstream-appearance.json':
                raise SystemExit('simulated process interruption')
        with patch.object(module, 'atomic_write', side_effect=interrupt_after_state):
            with self.assertRaises(SystemExit):
                module.apply('install', self.profile, self.app, self.style)
        self.install()
        self.assertEqual((self.profile / 'chrome' / 'thunderstream.css').read_bytes(), self.style.read_bytes())

    def test_interrupted_removal_recovers_after_original_stylesheet_restored(self):
        chrome = self.profile / 'chrome'
        chrome.mkdir()
        original = b'#prior-user-css { color: pink; }\n'
        (chrome / 'thunderstream.css').write_bytes(original)
        self.install()
        module = self.load_installer()
        unlink = Path.unlink
        def interrupt_before_state_removal(path, *args, **kwargs):
            if path.name == 'thunderstream-appearance.json':
                raise SystemExit('simulated process interruption')
            return unlink(path, *args, **kwargs)
        with patch.object(Path, 'unlink', interrupt_before_state_removal):
            with self.assertRaises(SystemExit):
                module.apply('remove', self.profile, self.app, self.style)
        self.assertEqual(self.run_command('remove').returncode, 0)
        self.assertEqual((chrome / 'thunderstream.css').read_bytes(), original)


if __name__ == '__main__':
    unittest.main()
