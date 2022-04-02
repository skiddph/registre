const { exec } = require("child_process");
const fs = require('fs-extra')
const path = require('path');

const rootDir = process.cwd();
const log_file = path.join(rootDir, 'release.log')
const log = (data) => {
  // prepend date to log
  const date = new Date().toISOString()
  const log = `\n${date}: ${data}`
  // append to log file, create if not exists
  fs.appendFile(log_file, log, (err) => {
    if (err) throw err;
  })
  console.log(data)
}

const cleanRelease = async () => {
  const clean = exec(`rm -rf ${rootDir}/release`)
  clean.stdout.on('data', (data) => log(data))
  clean.stderr.on('data', (data) => log(data))
  clean.on('close', () => createBinaries())
}

const buildClient = async () => {
  const cl = exec(`cd ${rootDir}/client && npm run build`)
  cl.stdout.on('data', (data) => log(data))
  cl.stderr.on('data', (data) => log(data))
  cl.on('close', () => createRelease())
}

const buildServer = async () => {
  const cl = exec(`cd ${rootDir}/server && npm install --verbose && npm run reset`)
  cl.stdout.on('data', (data) => log(data))
  cl.stderr.on('data', (data) => log(data))
  cl.on('close', () => buildClient())
}

const createBinaries = async () => {
  const cl = exec(`cd ${rootDir} && g++ start.cpp -o server/start && g++ setup.cpp -o server/setup`)
  cl.stdout.on('data', (data) => log(data))
  cl.stderr.on('data', (data) => log(data))
  cl.on('close', () => buildServer())
}

const createRelease = async () => {
  const exclude = [ '.gitignore', 'node_modules', 'certs', 'tmp', 'migrations','db-journal']

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

const archiveRelease = async () => {
  const fromF = path.join(rootDir, 'release', 'registre')
  const toF = path.join(rootDir, 'release', 'registre.zip')
  const archive = exec(`powershell Compress-Archive -Path ${fromF} -DestinationPath ${toF}`)
  archive.stdout.on('data', (data) => log(data))
  archive.stderr.on('data', (data) => log(data))
  archive.on('close', (code) => log(`child process exited with code ${code}`))
}

log(`RELEASE`)
cleanRelease()