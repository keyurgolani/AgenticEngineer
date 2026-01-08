import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'Agentic Engineer'
  const subtitle = searchParams.get('subtitle') || 'Master AI Agent Architecture'
  const day = searchParams.get('day')

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #333 2%, transparent 0%), radial-gradient(circle at 75px 75px, #333 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          padding: '80px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            borderRadius: '50px',
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 40,
            color: 'white',
          }}
        >
          {day ? `DAY ${day}` : 'AGENTIC ENGINEER'}
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: 20,
            background: 'linear-gradient(to right, #fff, #aaa)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#888',
            maxWidth: '80%',
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
