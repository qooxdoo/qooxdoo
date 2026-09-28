const { Client } = require('ssh2');
const util = require('util');

async function demo(sftp) {
  const readdir = util.promisify(sftp.readdir.bind(sftp));
  const open = util.promisify(sftp.open.bind(sftp));
  const close = util.promisify(sftp.close.bind(sftp));
  const write = util.promisify(sftp.write.bind(sftp));

  let handle = await open('testfile.txt', 'w', {});
  await write(handle, Buffer.from('Hello, world!'), 0, 'Hello, world!'.length, 0);
  await close(handle);
}

let conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.sftp((err, sftp) => {
    if (err) 
      throw err;
    demo(sftp).then(() => conn.end()).catch(err => { throw err; });
  });
}).connect({
  host: '192.168.200.12',
  port: 22,
  username: 'player',
  privateKey: require('fs').readFileSync('../../../.ssh/id_rsa')
});

