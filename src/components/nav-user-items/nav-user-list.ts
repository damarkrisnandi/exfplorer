import type { ComponentType } from "react"
import LogoutOption from "./logout-option"
import UnlinkOption from "./unlink-option"

type UnlinkOptionProps = React.ComponentProps<typeof UnlinkOption>;
type LogoutOptionProps = React.ComponentProps<typeof LogoutOption>;

type NavUser<T> =  {
  name: string,
  component: ComponentType<T>
}

export const navUsers: NavUser<{
  session: {
    user: {
      id: string,
      name: string,
      manager: {
        id: string,
        entry_name: string,
        managerId: string,
        userId: string,
        player_first_name: string,
        player_last_name: string,
      }
    }
  }
}>[] = [
  {
    name: 'Unlink',
    component: UnlinkOption as ComponentType<UnlinkOptionProps>
  },
  {
    name: 'Logout',
    component: LogoutOption as ComponentType<LogoutOptionProps>
  }
]
