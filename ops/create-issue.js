#!/usr/bin/env node

/**
 * Script para crear issues en GitLab mediante webhook
 *
 * Uso:
 *   npm run create-issue -- "descripción del problema" feature,bugfix
 *   node ops/create-issue.js "descripción del problema" feature,bugfix
 *
 * Labels disponibles: feature, bugfix, enhancement
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno desde .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) {
    console.error('Error: archivo .env no encontrado')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')

  const env = {}
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return env
}

// Validar labels
const VALID_LABELS = ['feature', 'bugfix', 'enhancement']

function validateLabels(labels) {
  const invalid = labels.filter(label => !VALID_LABELS.includes(label))
  if (invalid.length > 0) {
    console.error(`Error: Labels inválidas: ${invalid.join(', ')}`)
    console.error(`Labels válidas: ${VALID_LABELS.join(', ')}`)
    return false
  }
  return true
}

// Hacer la llamada al webhook
function createIssue(url, prompt, labels, authKey) {
  const payload = {
    project: 'kodi-reactive',
    prompt: prompt,
    labels: labels
  }

  const data = JSON.stringify(payload)
  console.log('Payload a enviar:', data)

  const urlObj = new URL(url)

  const options = {
    hostname: urlObj.hostname,
    port: 443,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(data, 'utf8'),
      'x-auth': authKey
    },
    rejectUnauthorized: false // Permitir certificados autofirmados
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            statusCode: res.statusCode,
            body: responseData
          })
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(data)
    req.end()
  })
}

// Main
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.error('Uso: npm run create-issue -- "descripción del problema" [labels]')
    console.error('Ejemplo: npm run create-issue -- "Error en carga de assets" feature,bugfix')
    console.error(`Labels disponibles: ${VALID_LABELS.join(', ')}`)
    process.exit(1)
  }

  const prompt = args[0]
  const labelsArg = args[1] || 'enhancement'
  const labels = labelsArg.split(',').map(l => l.trim())

  if (!validateLabels(labels)) {
    process.exit(1)
  }

  const env = loadEnv()
  const webhookUrl = env.ISSUE_WEBHOOK_URL
  const authKey = env.ISSUE_WEBHOOK_KEY

  if (!webhookUrl) {
    console.error('Error: ISSUE_WEBHOOK_URL no está configurada en .env')
    process.exit(1)
  }

  if (!authKey) {
    console.error('Error: ISSUE_WEBHOOK_KEY no está configurada en .env')
    process.exit(1)
  }

  console.log('\n📝 Creando issue en GitLab...')
  console.log(`   Proyecto: kodi-reactive`)
  console.log(`   Descripción: ${prompt}`)
  console.log(`   Labels: ${labels.join(', ')}`)
  console.log('')

  try {
    const response = await createIssue(webhookUrl, prompt, labels, authKey)
    console.log('✅ Issue creada exitosamente!')
    console.log(`   Status: ${response.statusCode}`)
    if (response.body) {
      try {
        const parsed = JSON.parse(response.body)
        console.log(`   Respuesta:`, parsed)
      } catch {
        console.log(`   Respuesta: ${response.body}`)
      }
    }
  } catch (error) {
    console.error('❌ Error al crear issue:', error.message)
    process.exit(1)
  }
}

main()
