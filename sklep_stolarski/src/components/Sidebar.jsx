export default function Sidebar({ sort, setSort, order, setOrder, onSearch, children }) {
  // children = przyciski filtrów / suwaki / checkboxy
  return (
    <aside className="sidebar">
        
      <section className="filter-section">
        <label>Sortuj:</label>
        <select
          value={`${sort}-${order}`}
          onChange={(e) => {
            const [newSort, newOrder] = e.target.value.split('-');
            setSort(newSort);
            setOrder(newOrder);
          }}
        >
          <option value="name-ASC">Nazwa (a-z)</option>
          <option value="name-DESC">Nazwa (z-a)</option>
          <option value="base_price-ASC">Cena rosnąco</option>
          <option value="base_price-DESC">Cena malejąco</option>
        </select>
      </section>

      {/* MIEJSCE NA INNE FILTRY – przekazujemy przez children */}
      <section className="filter-section">{children}</section>
    </aside>
  );
}