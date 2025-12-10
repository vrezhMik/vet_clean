import style from "./sidebar.module.scss";
import UserMenu from "../UserComponents/UserMenu/userMenu.component";
export default function Sidebar() {
  return (
    <aside className={`flex ${style.sidebar}`}>
      <UserMenu />
    </aside>
  );
}
