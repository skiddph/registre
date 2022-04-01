const { exec } = require("child_process");
const fs = require('fs-extra')
const path = require('path');

const rootDir = process.cwd();

const build = async (cb) => {
  const cl = exec(`cd ${rootDir}/client && npm run build`)
  cl.stdout.on('data', (data) => console.log(data))
  cl.stderr.on('data', (data) => console.error(data))
  cl.on('close', (code) => createRelease())
}

const createRelease = async () => {
  const exclude = [ '.gitignore', 'node_modules', 'certs' ]

  // copy server files to release folder except for excluded files recursively
  try {
    fs.copySync(path.join(rootDir, 'server'), path.join(rootDir, 'release','registre'), {
      filter: (src) => {
        return exclude.indexOf(path.basename(src)) === -1
      }
    })
    archiveRelease()
  } catch (err) {
    console.error(err)
  }
}

const archiveRelease = async (cb) => {
  const fromF = path.join(rootDir, 'release', 'registre')
  const toF = path.join(rootDir, 'release', 'registre.zip')
  const archive = exec(`powershell Compress-Archive -Path ${fromF} -DestinationPath ${toF}`)
  archive.stdout.on('data', (data) => console.log(data))
  archive.stderr.on('data', (data) => console.error(data))
  archive.on('close', (code) => console.log(`child process exited with code ${code}`))
}

build()