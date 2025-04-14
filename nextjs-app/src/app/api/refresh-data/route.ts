import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'
import util from 'util'

const execPromise = util.promisify(exec)

export async function POST() {
  try {
    // Get the project root directory
    const projectRoot = path.join(process.cwd(), '..', '..')

    // Run the data fetching script
    const { stderr } = await execPromise('npm run build', {
      cwd: projectRoot,
    })

    if (stderr && !stderr.includes('npm WARN')) {
      console.error('Error refreshing data:', stderr)
      return NextResponse.json({ success: false, message: 'Error refreshing data' }, { status: 500 })
    }

    // Run the data processing script
    await execPromise('npm run process', {
      cwd: projectRoot,
    })

    // Run the index creation script
    await execPromise('npm run create-index', {
      cwd: projectRoot,
    })

    return NextResponse.json({ success: true, message: 'Data refreshed successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error refreshing data:', error)
    return NextResponse.json({ success: false, message: 'Error refreshing data' }, { status: 500 })
  }
}

// This handles OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
