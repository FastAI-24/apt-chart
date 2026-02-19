import { useEffect, useRef, memo } from "react";

/** Utterances 사용 전 https://github.com/apps/utterances 에서 apt-chart 레포에 앱 설치 필요 */
const REPO = "alstjd0051/apt-chart";

interface Props {
  /** GitHub 이슈 매핑용 식별자 (질문별 별도 이슈 생성) */
  issueTerm: string;
  title?: string;
}

export const UtterancesComments = memo(function UtterancesComments({
  issueTerm,
  title,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const existing = containerRef.current.querySelector("iframe");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", REPO);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("theme", "github-light");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    containerRef.current.appendChild(script);
  }, [issueTerm]);

  return (
    <div className="w-full">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-gray-700">{title}</h4>
      )}
      <div ref={containerRef} className="min-h-[200px] w-full" />
    </div>
  );
});
