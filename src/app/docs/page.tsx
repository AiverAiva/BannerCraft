'use client'

import { useState } from 'react'

export default function DocsPage() {
  const defaultPlaygroundJson = JSON.stringify({
    base: "white",
    layers: [
      { shape: "cross", color: "blue" },
      { shape: "border", color: "black" }
    ],
    width: 200
  }, null, 2)

  const [playgroundInput, setPlaygroundInput] = useState(defaultPlaygroundJson)
  const [playgroundResult, setPlaygroundResult] = useState<string | null>(null)
  const [playgroundError, setPlaygroundError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePostRequest = async () => {
    setIsLoading(true)
    setPlaygroundError(null)
    setPlaygroundResult(null)
    
    try {
      const payload = JSON.parse(playgroundInput)
      
      const response = await fetch('/api/bannerCreate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch SVG')
      }
      
      const svgText = await response.text()
      setPlaygroundResult(svgText)
    } catch (err: any) {
      setPlaygroundError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 text-foreground">
      <h1 className="text-4xl font-bold tracking-tight mb-4">BannerCraft API Documentation</h1>
      <p className="text-lg text-muted-foreground mb-12">
        Learn how to generate server-side rendered Minecraft banners dynamically via URL parameters or JSON payloads.
      </p>

      <div className="space-y-12">
        {/* Section 1: GET Request */}
        <section>
          <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-6">1. GET Request (URL Params)</h2>
          <p className="mb-4 text-muted-foreground">
            The simplest way to use the API inside an <code>&lt;img /&gt;</code> tag. Pass your configuration through standard URL query parameters.
          </p>
          
          <div className="bg-muted/10 border border-border rounded-xl p-4 mb-6 font-mono text-sm overflow-x-auto whitespace-nowrap">
            <span className="text-blue-500 font-bold">GET</span> /api/bannerCreate?base=white&layers=[{`{"shape":"creeper","color":"black"}`}]
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Parameters</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground marker:text-muted-foreground/50">
              <li><code className="text-foreground bg-muted px-1.5 py-0.5 rounded">base</code> (string) - Valid Minecraft color name for the banner background. Default is <code className="text-foreground">white</code>.</li>
              <li><code className="text-foreground bg-muted px-1.5 py-0.5 rounded">layers</code> (string) - URL Encoded JSON string representing an array of layer objects.</li>
              <li><code className="text-foreground bg-muted px-1.5 py-0.5 rounded">width</code> (number, optional) - Target width of the SVG in pixels.</li>
              <li><code className="text-foreground bg-muted px-1.5 py-0.5 rounded">height</code> (number, optional) - Target height of the SVG. (Do not provide if width is set).</li>
            </ul>
          </div>
        </section>

        {/* Section 2: POST Request */}
        <section>
          <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-6">2. POST Request (JSON Payload)</h2>
          <p className="mb-4 text-muted-foreground">
            Best for programmatic integrations where payload size matters (bypasses URL length limits) or when sending dynamic data directly from a server.
          </p>
          
          <div className="bg-muted/10 border border-border rounded-xl p-4 mb-6 font-mono text-sm overflow-x-auto">
            <span className="text-green-500 font-bold">POST</span> /api/bannerCreate
            <div className="mt-3 text-muted-foreground whitespace-pre">
{`{
  "base": "red",
  "layers": [
    { "shape": "stripe_bottom", "color": "blue" },
    { "shape": "creeper", "color": "white" }
  ],
  "height": 400
}`}
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Playground */}
        <section>
          <h2 className="text-2xl font-semibold border-b border-border pb-2 mb-6">API Playground</h2>
          <p className="mb-6 text-muted-foreground">
            Test the POST endpoint directly from your browser. Modify the JSON payload below and run the request to see the SVG output.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Request Body (JSON)</label>
              <textarea 
                className="flex-1 min-h-[300px] w-full bg-muted/10 border border-border rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={playgroundInput}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                spellCheck={false}
              />
              <button 
                onClick={handlePostRequest}
                disabled={isLoading}
                className="mt-4 w-full bg-foreground text-background font-semibold py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? 'Running Request...' : 'Send POST Request'}
              </button>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Result</label>
              <div className="flex-1 w-full bg-muted/10 border border-border rounded-xl p-4 overflow-hidden flex flex-col items-center justify-center relative min-h-[300px]">
                {playgroundError ? (
                  <div className="text-destructive font-mono text-sm text-center">
                    Error:<br />{playgroundError}
                  </div>
                ) : playgroundResult ? (
                  <div className="flex flex-col items-center justify-center h-full w-full gap-6">
                    <div 
                      className="border border-border/50 rounded drop-shadow-lg scale-125 origin-center"
                      dangerouslySetInnerHTML={{ __html: playgroundResult }} 
                    />
                    <div className="w-full mt-auto">
                      <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Raw Response (SVG Markup)</div>
                      <div className="bg-background rounded-lg border border-border p-3 text-xs font-mono max-h-32 overflow-y-auto w-full opacity-60">
                        {playgroundResult}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground font-medium">Hit send to fetch result</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
