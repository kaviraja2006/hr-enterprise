export interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = "Coming Soon",
  description = "This feature is under development. Check back later!",
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-6xl mb-4">🚧</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 text-center max-w-md">{description}</p>
    </div>
  );
}

export default ComingSoon;
