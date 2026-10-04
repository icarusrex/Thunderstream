"""Refresh credentials remain in the current user's macOS Keychain."""
import ctypes as C
import json


class Keychain:
    def __init__(self):
        self.lib = C.CDLL('/System/Library/Frameworks/Security.framework/Security')
        self.cf = C.CDLL('/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation')
        self.cf.CFRelease.argtypes = [C.c_void_p]
        self.service = b'eu.thunderstream.gmail-search'
        self.account = b'google-readonly'
        self.lib.SecKeychainFindGenericPassword.argtypes = [C.c_void_p, C.c_uint32, C.c_char_p, C.c_uint32, C.c_char_p, C.POINTER(C.c_uint32), C.POINTER(C.c_void_p), C.POINTER(C.c_void_p)]
        self.lib.SecKeychainAddGenericPassword.argtypes = [C.c_void_p, C.c_uint32, C.c_char_p, C.c_uint32, C.c_char_p, C.c_uint32, C.c_void_p, C.c_void_p]
        self.lib.SecKeychainItemModifyAttributesAndData.argtypes = [C.c_void_p, C.c_void_p, C.c_uint32, C.c_void_p]
        self.lib.SecKeychainItemDelete.argtypes = [C.c_void_p]
        self.lib.SecKeychainItemFreeContent.argtypes = [C.c_void_p, C.c_void_p]

    def _find(self):
        length, data, item = C.c_uint32(), C.c_void_p(), C.c_void_p()
        status = self.lib.SecKeychainFindGenericPassword(None, len(self.service), self.service, len(self.account), self.account, C.byref(length), C.byref(data), C.byref(item))
        if status == -25300: return None, None
        if status: raise RuntimeError('keychain-unavailable')
        try: value = C.string_at(data, length.value)
        finally: self.lib.SecKeychainItemFreeContent(None, data)
        return value, item

    def load(self):
        value, item = self._find()
        if item: self.cf.CFRelease(item)
        return json.loads(value) if value else None

    def save(self, value):
        data = json.dumps(value).encode()
        _, item = self._find()
        if item:
            try: status = self.lib.SecKeychainItemModifyAttributesAndData(item, None, len(data), data)
            finally: self.cf.CFRelease(item)
        else:
            status = self.lib.SecKeychainAddGenericPassword(None, len(self.service), self.service, len(self.account), self.account, len(data), data, None)
        if status: raise RuntimeError('keychain-unavailable')

    def clear(self):
        _, item = self._find()
        if item:
            try: status = self.lib.SecKeychainItemDelete(item)
            finally: self.cf.CFRelease(item)
            if status: raise RuntimeError('keychain-unavailable')
