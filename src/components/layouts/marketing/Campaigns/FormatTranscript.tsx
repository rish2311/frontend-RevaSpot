export const formatTranscript = (transcript: string) => {
  const cleanTranscript = transcript.replace(/\\n/g, '\n').trim();
  const lines = cleanTranscript.split('\n');
  
  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const [speaker, ...messageParts] = line.split(':');
        const message = messageParts.join(':').trim();
        
        return (
          <div 
            key={index} 
            className={`flex items-start space-x-2 ${
              speaker.trim() === 'User' 
                ? 'justify-end' 
                : 'justify-start'
            }`}
          >
            <div 
              className={`p-2 rounded-lg max-w-[70%] ${
                speaker.trim() === 'User' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}
            >
              <div className="font-semibold text-xs mb-1">
                {speaker.trim()}
              </div>
              <div>{message}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
