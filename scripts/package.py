from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED, ZipInfo
from validate import ROOT, validate_package


def build_package(root, target, *, allow_experiments=False):
    validate_package(root, allow_experiments=allow_experiments)
    with ZipFile(target, 'w', ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(root.rglob('*')):
            if path.is_file():
                info = ZipInfo(path.relative_to(root).as_posix(), (2020, 1, 1, 0, 0, 0))
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                info.compress_type = ZIP_DEFLATED
                archive.writestr(info, path.read_bytes(), compress_type=ZIP_DEFLATED, compresslevel=9)


if __name__ == '__main__':
    out = ROOT / 'dist'
    out.mkdir(exist_ok=True)
    for name, label in [('extension', 'core'), ('themes/light', 'light'), ('themes/dark', 'dark'), ('ui-compat', 'ui-compat')]:
        root = ROOT / name
        target = out / f'thunderstream-{label}.xpi'
        build_package(root, target, allow_experiments=name == 'ui-compat')
        print(target.name)
