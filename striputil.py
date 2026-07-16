import glob, sys
n=0
for f in glob.glob('src/*.js')+glob.glob('test/*.js'):
    d=open(f,'rb').read()
    if b'\x00' in d:
        open(f,'wb').write(d.replace(b'\x00',b'')); n+=1
print('stripped %d files'%n)
