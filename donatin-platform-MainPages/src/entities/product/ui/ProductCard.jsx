import { Heart, ShoppingBag } from "lucide-react";
import Button from "../../../shared/ui/Button";

export default function ProductCard({ icon: Icon, name, category, selected, onSelect }) {
  return (
    <article className="product-card">
      <div className="product-card__visual" aria-hidden="true">
        <Icon strokeWidth={1.45} />
        <Button variant="ghost" className="wish-button" aria-label={`${name} 관심 물품에 담기`} onClick={() => window.location.assign("./detail/items.html?favorite=true")}>
          <Heart size={20} aria-hidden="true" />
        </Button>
      </div>
      <div className="product-card__body">
        <p className="eyebrow">{category}</p>
        <h3>{name}</h3>
        <p>사이즈와 옵션은 선택 화면에서 확인할 수 있어요.</p>
        <Button variant={selected ? "secondary" : "outline"} onClick={onSelect}>
          <ShoppingBag size={16} aria-hidden="true" />
          {selected ? "선택함" : "물품 선택하기"}
        </Button>
      </div>
    </article>
  );
}
