tests correct uri handling:
- when 'uri' feature is set at 'library' entry
- when 'uri' feature is not set, and 'root' feature is set at 'compile-source' entry
- when 'uri' feature is not set, and 'root' feature is set at 'compile-dist' entry
- when 'uri' feature is set, and 'root' entry is also set at 
  'compile-dist'/'compile-source' entry
