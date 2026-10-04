import unittest,tempfile,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from validate import validate_package
class Packages(unittest.TestCase):
 def fixture(self):
  directory=tempfile.TemporaryDirectory();self.addCleanup(directory.cleanup);root=Path(directory.name);(root/'manifest.json').write_text(json.dumps({'manifest_version':2,'name':'Test','version':'0.1','theme':{'colors':{'frame':'#ffffff'}}}));return root
 def test_theme_rejects_executable_content(self):
  root=self.fixture();(root/'code.js').write_text('alert(1)')
  with self.assertRaises(AssertionError):validate_package(root)
 def test_theme_rejects_background(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v['background']={'page':'bg.html'};(root/'manifest.json').write_text(json.dumps(v));(root/'bg.html').write_text('<html></html>')
  with self.assertRaises(AssertionError):validate_package(root)
 def test_unused_privileged_permissions_rejected(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v.pop('theme');v['permissions']=['messagesModifyPermanent'];(root/'manifest.json').write_text(json.dumps(v))
  with self.assertRaises(AssertionError):validate_package(root)
 def test_missing_local_resource_rejected(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v.pop('theme');v['background']={'page':'bg.html'};(root/'manifest.json').write_text(json.dumps(v));(root/'bg.html').write_text('<script src="missing.js"></script>')
  with self.assertRaises(AssertionError):validate_package(root)
 def test_remote_script_rejected(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v.pop('theme');v['background']={'page':'bg.html'};(root/'manifest.json').write_text(json.dumps(v));(root/'bg.html').write_text('<script src="https://example.com/code.js"></script>')
  with self.assertRaises(AssertionError):validate_package(root)
 def test_missing_js_import_rejected(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v.pop('theme');(root/'manifest.json').write_text(json.dumps(v));(root/'main.js').write_text("import './missing.js';")
  with self.assertRaises(AssertionError):validate_package(root)
 def test_experiment_requires_explicit_opt_in(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v.pop('theme');v['experiment_apis']={'privileged':{}};(root/'manifest.json').write_text(json.dumps(v))
  with self.assertRaises(AssertionError):validate_package(root)
 def test_packages_are_byte_reproducible_across_mtimes(self):
  import package as packaging,os
  self.assertTrue(hasattr(packaging,'build_package'))
  root=self.fixture();target=root.parent/(root.name+'-one.xpi');second=root.parent/(root.name+'-two.xpi')
  self.addCleanup(lambda:target.unlink(missing_ok=True));self.addCleanup(lambda:second.unlink(missing_ok=True))
  packaging.build_package(root,target)
  os.utime(root/'manifest.json',(1700000000,1700000000));packaging.build_package(root,second)
  self.assertEqual(target.read_bytes(),second.read_bytes())
 def test_native_helper_is_optional_and_client_credentials_never_package(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v.pop('theme');v['optional_permissions']=['nativeMessaging'];(root/'manifest.json').write_text(json.dumps(v))
  validate_package(root)
  (root/'google-client.json').write_text(json.dumps({'installed':{'client_id':'fixture.apps.googleusercontent.com','client_secret':'synthetic-only'}}))
  with self.assertRaisesRegex(AssertionError,'credential'):validate_package(root)
 def test_native_messaging_cannot_become_a_required_core_permission(self):
  root=self.fixture();v=json.loads((root/'manifest.json').read_text());v.pop('theme');v['permissions']=['nativeMessaging'];(root/'manifest.json').write_text(json.dumps(v))
  with self.assertRaisesRegex(AssertionError,'optional'):validate_package(root)
if __name__=='__main__':unittest.main()
