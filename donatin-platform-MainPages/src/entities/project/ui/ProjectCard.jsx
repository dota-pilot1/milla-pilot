import { ArrowUpRight, Heart, PackageCheck } from "lucide-react";
import Badge from "../../../shared/ui/Badge";
import Button from "../../../shared/ui/Button";
import Progress from "../../../shared/ui/Progress";

export default function ProjectCard({ category, title, description, progress, tone, onSelect }) {
  return (
    <article className={`project-card project-card--${tone}`}>
      <div className="project-card__illustration" aria-hidden="true">
        {tone === "mint" ? <PackageCheck /> : <Heart />}
      </div>
      <div className="project-card__content">
        <Badge tone="info">진행 중</Badge>
        <p className="eyebrow">{category}</p>
        <h3>{title}</h3>
        <p className="project-card__description">{description}</p>
        <div className="project-card__progress">
          <span>준비물 채움 현황 <strong>{progress}%</strong></span>
          <Progress value={progress} label={`${title} 준비물 채움 현황 ${progress}%`} />
        </div>
        <Button variant="outline" onClick={onSelect}>
          프로젝트 보기 <ArrowUpRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}
