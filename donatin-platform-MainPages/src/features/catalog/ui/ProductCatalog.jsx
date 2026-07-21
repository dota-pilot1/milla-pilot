import { Backpack, Footprints, Shirt, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../shared/ui/Button";
import ProductCard from "../../../entities/product/ui/ProductCard";

const categories = ["전체", "의류", "신발", "가방"];
const products = [
  { id: "coat", name: "따뜻한 겨울 외투", category: "의류", icon: Shirt },
  { id: "sneakers", name: "편안한 운동화", category: "신발", icon: Footprints },
  { id: "indoor", name: "가벼운 실내화", category: "신발", icon: Footprints },
  { id: "backpack", name: "새 학기 책가방", category: "가방", icon: Backpack },
  { id: "sweatshirt", name: "활동용 상의", category: "의류", icon: Shirt },
];

export default function ProductCatalog({ onSelectionChange }) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selectedIds, setSelectedIds] = useState([]);
  const visibleProducts = useMemo(
    () => products.filter((product) => activeCategory === "전체" || product.category === activeCategory),
    [activeCategory],
  );

  function selectProduct(id) {
    setSelectedIds((previous) => {
      const next = previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id];
      onSelectionChange(next);
      return next;
    });
  }

  return (
    <section className="section" id="items" aria-labelledby="items-title">
      <div className="section-heading section-heading--split">
        <div>
          <p className="kicker"><Sparkles size={16} aria-hidden="true" /> 필요한 물품</p>
          <h2 id="items-title">직접 고르고, 필요한 곳에 보내요</h2>
          <p>물품을 선택하면 학교매점 장바구니에서 옵션과 수량을 확인할 수 있습니다.</p>
        </div>
        <a className="text-link" href="./detail/projects.html">전체 프로젝트 보기</a>
      </div>
      <div className="catalog-toolbar" aria-label="물품 카테고리">
        <div className="filter-list">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "secondary" : "ghost"}
              className="filter-button"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <p className="catalog-note">품절 옵션은 선택 단계에서 안내됩니다.</p>
      </div>
      <div className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            {...product}
            selected={selectedIds.includes(product.id)}
            onSelect={() => selectProduct(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
