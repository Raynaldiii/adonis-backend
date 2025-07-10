import vine, { SimpleMessagesProvider } from '@vinejs/vine'

vine.messagesProvider = new SimpleMessagesProvider({
  'string'         : 'Field {{ field }} harus berupa karakter',
  'required'       : 'Field {{ field }} wajib diisi',
  'minLength'      : 'Field {{ field }} wajib diisi',
  '*.exists'       : 'Data {{ field }} tidak ditemukan',
  'array.minLength': 'Field {{ field }} harus diisi {{ min }} karakter/item',
  'minLength'      : 'Field {{ field }} harus diisi {{ min }} karakter/item',
  'unique'         : 'Data {{ field }} sudah ada',
  'file.size'      : 'File {{ field }} maksimal 2MB',
  'file.extnames'  : 'File {{ field }} hanya boleh berupa jpg, png, pdf, doc, atau docx',
  'file.required'  : 'File {{ field }} wajib diisi',
  'file.isValid'   : 'File {{ field }} tidak valid',
  'file.move'      : 'File {{ field }} gagal diupload',
  'file.delete'    : 'File {{ field }} gagal dihapus',
  'file.update'    : 'File {{ field }} gagal diupdate',
  'file.create'    : 'File {{ field }} gagal dibuat',
  'file.read'      : 'File {{ field }} gagal dibaca',
  'file.write'     : 'File {{ field }} gagal ditulis',
  'file.upload'    : 'File {{ field }} gagal diupload',
  'file.download'  : 'File {{ field }} gagal didownload',
  'file.delete'    : 'File {{ field }} gagal dihapus',
  'file.update'    : 'File {{ field }} gagal diupdate',
  'file.create'    : 'File {{ field }} gagal dibuat',
  'file.read'      : 'File {{ field }} gagal dibaca',
  'file.write'     : 'File {{ field }} gagal ditulis',
})

// console.log('Custom VineJS messages loaded');