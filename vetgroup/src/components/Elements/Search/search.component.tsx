"use client";
import { productsStore } from "@/store/store";
import style from "./search.module.scss";

export default function Search() {
  const { searchQuery, setSearchQuery } = productsStore();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className={`${style.search} flex`}>
      <input
        type="text"
        className={style.searchInput}
        placeholder="Search"
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </div>
  );
}
