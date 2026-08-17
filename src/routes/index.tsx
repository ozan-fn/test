import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    return {
      serverTime: new Date().toISOString(),
      userAgent: 'server-side',
    }
  },
})

function Home() {
  const { serverTime, userAgent } = Route.useLoaderData()
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
      <div className="mt-8 border rounded-lg p-4 text-sm text-gray-600">
        <p><strong>SSR example:</strong> data ini di-render di server</p>
        <p>Server time: {serverTime}</p>
        <p>Dikirim dari: {userAgent}</p>
      </div>
    </div>
  )
}