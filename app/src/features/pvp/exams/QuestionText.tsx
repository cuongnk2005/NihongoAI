export function QuestionText({ text }: { text: string }) {
  return <>{text.split(/(【[^】]+】)/g).map((part, i) => part.startsWith('【') && part.endsWith('】')
    ? <mark key={i}>{part.slice(1, -1)}</mark> : <span key={i}>{part}</span>)}</>;
}
