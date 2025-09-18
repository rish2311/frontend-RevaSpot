const NotFoundComponent = ({ error }: { error?: Error }) => {
  return (
    <div className='flex flex-col items-center justify-center p-4 text-center'>
      <h1 className='text-2xl font-bold text-destructive'>404 - Not Found!</h1>
      <p className='py-4 text-lg'>Check the url, there is nothing here.</p>
      <div className='rounded-lg border border-destructive bg-destructive-accent p-2'>
        <pre className='whitespace-pre-wrap text-sm text-red-800'>
          {error?.message ?? 'Kindly check the url, or Navigate to another route.'}
        </pre>
      </div>
    </div>
  )
}

export default NotFoundComponent
